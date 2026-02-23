import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { cooperativeContext } from "@/lib/cooperative-context";
import {
  detectInvoiceRequest,
  detectAddressOrNameInsteadOfAccount,
} from "@/lib/invoice-detector";
import {
  isNewServiceRequest,
  NEW_SERVICE_DERIVATION_MESSAGE,
} from "@/lib/service-request-detector";
import { findInvoiceInDrive } from "@/lib/drive";
import { getOrCreateConversation, saveMessage } from "@/lib/conversations";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages, sessionId } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY no está configurada" },
        { status: 500 }
      );
    }

    const lastUserMessageRaw = messages[messages.length - 1]?.text || "";
    const lastUserMessage = lastUserMessageRaw.trim();

    // Helper para registrar conversaciones del chatbot web en Supabase
    const logWebMessages = async (userText: string, botText: string) => {
      try {
        if (!sessionId) return;
        const conversationKey = `WEB-${sessionId}`;
        const conversationId = await getOrCreateConversation(conversationKey);
        await saveMessage(conversationId, "user", userText);
        await saveMessage(conversationId, "assistant", botText);
      } catch (error) {
        console.error("[CHAT] Error guardando conversación web:", error);
      }
    };

    // 0) Solicitud de alta de servicio (Internet, luz, TV, etc.) → derivar a Administración
    if (isNewServiceRequest(lastUserMessage)) {
      await logWebMessages(lastUserMessage, NEW_SERVICE_DERIVATION_MESSAGE);
      return NextResponse.json({
        response: NEW_SERVICE_DERIVATION_MESSAGE,
      });
    }

    // 1) Lógica de facturas y número de cuenta (igual que WhatsApp)
    // Primero verificar si es una pregunta informativa sobre facturas (no procesarla como solicitud)
    const isInformationalQuestion =
      /(?:están|estan|está|esta|disponible|cuando|cuándo|hay|existen)/i.test(
        lastUserMessage
      ) &&
      /(?:facturas?|boletas?|recibos?)/i.test(lastUserMessage) &&
      !/(?:quiero|necesito|pasar|enviar|mandar|dame|pásame|podrías|puedes)/i.test(
        lastUserMessage
      );

    if (!isInformationalQuestion) {
      // 1.a) Usuario envía dirección/nombre en lugar de número de cuenta
      const addressOrNameCheck =
        detectAddressOrNameInsteadOfAccount(lastUserMessage);

      if (addressOrNameCheck.isAddressOrName) {
        const response =
          `📋 Para poder enviarte tu factura, necesito tu número de cuenta (no el domicilio ni el nombre).\n\n` +
          `El número de cuenta aparece en dos lugares de tu factura:\n\n` +
          `1️⃣ En la parte superior, debajo del nombre del titular, como "Cuenta: XXXX"\n` +
          `2️⃣ En la parte inferior, en la sección "DATOS PARA INGRESAR A LA WEB"\n\n` +
          `Es un número de 3 a 4 dígitos. En la imagen puedes ver dónde encontrarlo.`;

        await logWebMessages(lastUserMessage, response);

        return NextResponse.json({
          response,
          showImage: "ubicacion de numero de cuenta",
        });
      }

      // 1.b) Detección de solicitud de factura
      let invoiceRequest = detectInvoiceRequest(lastUserMessage);
      
      console.log(`[CHAT] 📋 Detección inicial:`, {
        accountNumber: invoiceRequest.accountNumber,
        month: invoiceRequest.month,
        year: invoiceRequest.year,
        type: invoiceRequest.type,
        confidence: invoiceRequest.confidence
      });

      // Guardar el mes/año del mensaje actual ANTES de buscar en mensajes anteriores
      // para no perderlos si el usuario los especificó explícitamente
      const currentMonth = invoiceRequest.month;
      const currentYear = invoiceRequest.year;
      const currentType = invoiceRequest.type;

      // Si no hay número de cuenta en el mensaje actual, buscar en mensajes anteriores cuando:
      // - hay mes/año, o palabras de factura, o "Enviamela"/"Dale" (continuación de solicitud previa)
      const isInvoiceContinuation =
        /\b(?:enviamela|envíamela|mandamela|dale|sí\s+dale)\b/i.test(
          lastUserMessage
        );
      if (
        !invoiceRequest.accountNumber &&
        (invoiceRequest.month ||
          invoiceRequest.year ||
          /\b(?:factura|boleta|recibo|mes\s+pasado|del\s+mes)\b/i.test(
            lastUserMessage
          ) ||
          isInvoiceContinuation)
      ) {
        // Buscar número de cuenta en mensajes anteriores del usuario
        for (
          let i = messages.length - 1;
          i >= Math.max(0, messages.length - 10);
          i--
        ) {
          if (messages[i]?.sender === "user") {
            const previousRequest = detectInvoiceRequest(
              messages[i].text || ""
            );
            if (
              previousRequest.accountNumber &&
              (previousRequest.confidence === "high" ||
                previousRequest.confidence === "medium")
            ) {
              console.log(
                `[CHAT] 📋 Número de cuenta ${previousRequest.accountNumber} encontrado en mensaje anterior`
              );
              // Usar el número de cuenta del mensaje anterior
              invoiceRequest.accountNumber = previousRequest.accountNumber;
              // PRIORIZAR el mes/año/tipo del mensaje actual si existe (el usuario lo especificó explícitamente)
              // Solo usar el del mensaje anterior si el actual no tiene mes/año/tipo
              if (currentMonth) {
                invoiceRequest.month = currentMonth;
                console.log(`[CHAT] 📅 Usando mes del mensaje actual: ${currentMonth}`);
              } else if (previousRequest.month) {
                invoiceRequest.month = previousRequest.month;
              }
              
              if (currentYear) {
                invoiceRequest.year = currentYear;
                console.log(`[CHAT] 📅 Usando año del mensaje actual: ${currentYear}`);
              } else if (previousRequest.year) {
                invoiceRequest.year = previousRequest.year;
              }
              
              if (currentType) {
                invoiceRequest.type = currentType;
                console.log(`[CHAT] 🔌 Usando tipo del mensaje actual: ${currentType}`);
              } else if (previousRequest.type) {
                invoiceRequest.type = previousRequest.type;
              }
              
              // Mantener confianza alta ya que el número de cuenta fue validado anteriormente
              invoiceRequest.confidence = "high";
              break;
            }
          }
        }
      }

      // Si el usuario especificó un mes pero no un año, inferir el año correcto
      // Si estamos en enero 2026 y piden noviembre o diciembre, debe ser 2025
      if (invoiceRequest.month && !invoiceRequest.year) {
        const now = new Date();
        const currentYearNum = now.getFullYear();
        const currentMonthNum = now.getMonth() + 1; // 1-12
        
        const monthNames = [
          "enero", "febrero", "marzo", "abril", "mayo", "junio",
          "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
        ];
        const requestedMonthNum = monthNames.indexOf(invoiceRequest.month.toLowerCase()) + 1;
        
        console.log(`[CHAT] 📅 Inferencia de año: mes solicitado=${requestedMonthNum} (${invoiceRequest.month}), mes actual=${currentMonthNum}, año actual=${currentYearNum}`);
        
        // Si estamos en enero y piden noviembre o diciembre, debe ser el año anterior
        if (currentMonthNum === 1 && (requestedMonthNum === 11 || requestedMonthNum === 12)) {
          invoiceRequest.year = (currentYearNum - 1).toString();
          console.log(`[CHAT] 📅 Año inferido (caso enero): ${invoiceRequest.month} ${invoiceRequest.year}`);
        } else if (requestedMonthNum > currentMonthNum) {
          // Si el mes solicitado es mayor que el mes actual, debe ser del año anterior
          invoiceRequest.year = (currentYearNum - 1).toString();
          console.log(`[CHAT] 📅 Año inferido (mes futuro): ${invoiceRequest.month} ${invoiceRequest.year} (${requestedMonthNum} > ${currentMonthNum})`);
        } else {
          // Por defecto, usar el año actual
          invoiceRequest.year = currentYearNum.toString();
          console.log(`[CHAT] 📅 Año inferido (por defecto): ${invoiceRequest.month} ${invoiceRequest.year}`);
        }
      } else if (invoiceRequest.month && invoiceRequest.year) {
        console.log(`[CHAT] 📅 Año ya especificado: ${invoiceRequest.month} ${invoiceRequest.year}`);
      }

      if (invoiceRequest.accountNumber) {
        // Si la confianza es baja PERO hay un mes mencionado, es muy probable que sea una solicitud válida
        // En ese caso, intentar buscar la factura de todas formas
        const hasMonthOrType = invoiceRequest.month || invoiceRequest.type;
        
        // Si la confianza es baja Y NO hay mes/tipo, enviar imagen explicativa
        if (invoiceRequest.confidence === "low" && !hasMonthOrType) {
          const response =
            `📋 No estoy seguro de haber identificado correctamente tu número de cuenta.\n\n` +
            `El número de cuenta aparece en dos lugares de tu factura:\n\n` +
            `1️⃣ En la parte superior, debajo del nombre del titular, como "Cuenta: XXXX"\n` +
            `2️⃣ En la parte inferior, en la sección "DATOS PARA INGRESAR A LA WEB"\n\n` +
            `Es un número de 3 a 4 dígitos. En la imagen puedes ver dónde encontrarlo.`;

          await logWebMessages(lastUserMessage, response);

          return NextResponse.json({
            response,
            showImage: "ubicacion de numero de cuenta",
          });
        }
        
        // Si la confianza es baja pero hay mes/tipo, subir la confianza a media para intentar buscar
        if (invoiceRequest.confidence === "low" && hasMonthOrType) {
          console.log(`[CHAT] ⚠️ Confianza baja pero hay mes/tipo mencionado, subiendo confianza a media para intentar búsqueda`);
          invoiceRequest.confidence = "medium";
        }

        // Buscar la factura en Google Drive (igual que en WhatsApp)
        // Pasar el tipo de factura detectado para buscar primero en la carpeta correcta
        console.log(`[CHAT] 🔍 Buscando factura:`, {
          accountNumber: invoiceRequest.accountNumber,
          month: invoiceRequest.month,
          year: invoiceRequest.year || 'NO ESPECIFICADO (se inferirá)',
          type: invoiceRequest.type || 'NO ESPECIFICADO (buscará en ambas)'
        });
        
        const invoice = await findInvoiceInDrive(
          invoiceRequest.accountNumber,
          invoiceRequest.month,
          invoiceRequest.year, // Puede ser undefined, drive.ts lo inferirá
          invoiceRequest.type
        );

        if (invoice) {
          const typeLabel =
            invoice.type === "servicios" ? "servicios" : "energía eléctrica";

          const downloadUrl = `/api/chat/invoice?fileId=${encodeURIComponent(
            invoice.fileId
          )}&fileName=${encodeURIComponent(invoice.fileName)}`;

          let confirmationMessage = `✅ Te he enviado tu factura de ${typeLabel}.\n\n`;

          if (invoiceRequest.month) {
            confirmationMessage += `📅 Período: ${invoiceRequest.month}${
              invoiceRequest.year ? " " + invoiceRequest.year : ""
            }\n\n`;
          }

          confirmationMessage += `📄 Archivo: ${invoice.fileName}\n\n`;
          confirmationMessage +=
            `💳 Puedes pagar esta factura desde la caja de cobro de la cooperativa o desde la app CoopOnline:\n` +
            `https://www.cooponlineweb.com.ar/SANJOSEDELADORMIDA/Login\n\n` +
            `¿Tienes alguna otra consulta sobre tu factura o algún otro servicio? Estoy aquí para ayudarte 😊`;

          await logWebMessages(lastUserMessage, confirmationMessage);

          return NextResponse.json({
            response: confirmationMessage,
            invoice: {
              downloadUrl,
              fileName: invoice.fileName,
              type: typeLabel,
            },
          });
        } else {
          // No se encontró la factura → mismo comportamiento que WhatsApp: mostrar imagen
          const response =
            `❌ No pude encontrar tu factura con el número de cuenta ${invoiceRequest.accountNumber}.\n\n` +
            `Por favor, verifica que el número de cuenta sea correcto. El número de cuenta aparece en dos lugares de tu factura:\n\n` +
            `1️⃣ En la parte superior, debajo del nombre del titular, como "Cuenta: XXXX"\n` +
            `2️⃣ En la parte inferior, en la sección "DATOS PARA INGRESAR A LA WEB"\n\n` +
            `Es un número de 3 a 4 dígitos. En la imagen puedes ver dónde encontrarlo.\n\n` +
            `Si el problema persiste, puedes contactar con nuestra oficina al 3521-401330.`;

          await logWebMessages(lastUserMessage, response);

          return NextResponse.json({
            response,
            showImage: "ubicacion de numero de cuenta",
          });
        }
      }
    }

    // 2) Si no es un caso de factura, usar OpenAI como antes
    const systemMessage = {
      role: "system" as const,
      content: `Eres un asistente virtual amigable y profesional de la Cooperativa La Dormida. Tu objetivo es ayudar a los usuarios con información sobre los servicios, horarios, contacto y más.

${cooperativeContext}

Responde siempre en español, de forma natural, conversacional y HUMANA. Sé empático, útil, profesional y amigable. Usa un tono cercano pero profesional, como si fueras un empleado de la cooperativa hablando con un socio.

IMPORTANTE sobre facturas:
- Si preguntan si las facturas están disponibles o cuándo estarán disponibles, responde de forma natural y amigable explicando que sí, las facturas están disponibles. Menciona que pueden retirarlas en los boxes de atención al público, que fueron enviadas por correo electrónico, y que también pueden solicitarlas desde este chat proporcionando su número de cuenta (3-4 dígitos).
- Si preguntan cómo obtener su factura, explica que pueden retirarla en los boxes, que fue enviada por correo electrónico, o que pueden solicitarla desde este chat proporcionando su número de cuenta de 3-4 dígitos.
- Sé conversacional: evita respuestas robóticas o demasiado formales. Responde como si fueras una persona real ayudando a otra.

IMPORTANTE sobre precios y cuadro tarifario:
- Cuando te pregunten sobre precios de servicios, usa los precios actualizados del contexto (Internet: desde $19,200/mes, Televisión: desde $9,800/mes, PFC: a partir de $10,000/mes).
- Cuando te pregunten sobre el cuadro tarifario, tarifas oficiales, o si tienen un cuadro tarifario, SIEMPRE menciona que el cuadro tarifario oficial está disponible en el sitio web de ERSeP y proporciona el link: https://ersep.cba.gov.ar/prestador/cooperativa-electrica-limitada-de-san-jose-de-la-dormida/
- También menciona que pueden acceder al cuadro tarifario desde la página principal de la cooperativa a través del botón "Cuadro Tarifario".
- Si preguntan sobre descuentos o tarifas preferenciales, menciona que los socios tienen tarifas preferenciales y sugiere consultar el cuadro tarifario oficial para información detallada.
- Para electricidad, menciona que las tarifas específicas están en el cuadro tarifario oficial de ERSeP.

Si el usuario pregunta algo que no está en la información proporcionada, admítelo honestamente y sugiere que contacten directamente con la cooperativa al 3521-401330.`,
    };

    // Preparar los mensajes para OpenAI
    const conversationMessages = [
      systemMessage,
      ...messages.map((msg: { text: string; sender: string }) => ({
        role:
          msg.sender === "user" ? ("user" as const) : ("assistant" as const),
        content: msg.text,
      })),
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: conversationMessages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const response =
      completion.choices[0]?.message?.content ||
      "Lo siento, no pude generar una respuesta en este momento.";

    // Además, si el usuario pregunta explícitamente dónde está el número de cuenta,
    // mostramos la misma imagen que en WhatsApp.
    const lowerLast = lastUserMessage.toLowerCase();
    const isAccountLocationQuestion =
      /(dónde|donde|donde está|dónde está|ubicación|ubicacion|no encuentro|no lo encuentro|sigo sin encontrar)/i.test(
        lowerLast
      ) &&
      /(número de cuenta|numero de cuenta|nro de cuenta|nro cuenta|cuenta)/i.test(
        lowerLast
      );

    await logWebMessages(lastUserMessage, response);

    return NextResponse.json({
      response,
      showImage: isAccountLocationQuestion
        ? "ubicacion de numero de cuenta"
        : undefined,
    });
  } catch (error: any) {
    console.error("Error en la API de chat:", error);
    return NextResponse.json(
      { error: error.message || "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
