import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { cooperativeContext } from "@/lib/cooperative-context";
import {
  detectInvoiceRequest,
  detectAddressOrNameInsteadOfAccount,
} from "@/lib/invoice-detector";
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

      // Si detectamos una solicitud de factura (por palabras clave o mes) pero no hay número de cuenta,
      // buscar en mensajes anteriores (últimos 5 mensajes del usuario) si hay un número de cuenta reciente
      if (
        !invoiceRequest.accountNumber &&
        (invoiceRequest.month ||
          invoiceRequest.year ||
          /\b(?:factura|boleta|recibo|mes\s+pasado|del\s+mes)\b/i.test(
            lastUserMessage
          ))
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
              // Mantener el mes/año del mensaje actual si existe, sino usar el del anterior
              if (!invoiceRequest.month)
                invoiceRequest.month = previousRequest.month;
              if (!invoiceRequest.year)
                invoiceRequest.year = previousRequest.year;
              // Mantener confianza alta ya que el número de cuenta fue validado anteriormente
              invoiceRequest.confidence = "high";
              break;
            }
          }
        }
      }

      if (invoiceRequest.accountNumber) {
        // Si la confianza es baja, enviar imagen explicativa
        if (invoiceRequest.confidence === "low") {
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

        // Buscar la factura en Google Drive (igual que en WhatsApp)
        const invoice = await findInvoiceInDrive(
          invoiceRequest.accountNumber,
          invoiceRequest.month,
          invoiceRequest.year
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
