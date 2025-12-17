import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { cooperativeContext } from "@/lib/cooperative-context";
import {
  detectInvoiceRequest,
  detectAddressOrNameInsteadOfAccount,
} from "@/lib/invoice-detector";
import { findInvoiceInDrive } from "@/lib/drive";
import {
  getOrCreateConversation,
  saveMessage,
} from "@/lib/conversations";

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

    const lastUserMessageRaw =
      messages[messages.length - 1]?.text || "";
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
    // 1.a) Usuario envía dirección/nombre en lugar de número de cuenta
    const addressOrNameCheck =
      detectAddressOrNameInsteadOfAccount(lastUserMessage);

    if (addressOrNameCheck.isAddressOrName) {
      const response =
        `📋 Para poder enviarte tu factura, necesito el número de cuenta, no el domicilio ni el nombre.\n\n` +
        `⚠️ *IMPORTANTE:* El formato antiguo de matrícula (como "54-0556-A") ya NO es válido. Ahora necesitas el número de cuenta que es de 3 a 4 dígitos solamente.\n\n` +
        `En la imagen puedes ver dónde encontrar el número de cuenta en tu factura.\n\n` +
        `El número de cuenta aparece en la sección "DATOS PARA INGRESAR A LA WEB" de tu factura, identificado como "Nro Cuenta: XXX" o "Nro Cuenta: XXXX" (de 3 a 4 dígitos).\n\n` +
        `Por favor, envíame tu solicitud con el formato:\n` +
        `"Me puede pasar boleta de luz, número de cuenta: 2862"\n\n` +
        `Si no tienes el número de cuenta, puedes encontrarlo en cualquier factura reciente que tengas.`;

      await logWebMessages(lastUserMessage, response);

      return NextResponse.json({
        response,
        showImage: "ubicacion de numero de cuenta",
      });
    }

    // 1.b) Detección de solicitud de factura
    const invoiceRequest = detectInvoiceRequest(lastUserMessage);

    if (invoiceRequest.accountNumber) {
      // Si la confianza es baja, enviar imagen explicativa
      if (invoiceRequest.confidence === "low") {
        const response =
          `📋 No estoy seguro de haber identificado correctamente tu número de cuenta.\n\n` +
          `⚠️ *IMPORTANTE:* El número de cuenta debe tener 3 o 4 dígitos solamente. El formato antiguo de matrícula (como "54-0556-A") ya NO es válido.\n\n` +
          `En la imagen puedes ver dónde encontrar el número de cuenta en tu factura.\n\n` +
          `El número de cuenta aparece en la sección "DATOS PARA INGRESAR A LA WEB" de tu factura.\n\n` +
          `Por favor, envíame tu solicitud con el formato:\n` +
          `"Me puede pasar boleta de luz, número de cuenta: 2862"`;

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
          confirmationMessage += `📅 Período: ${
            invoiceRequest.month
          }${invoiceRequest.year ? " " + invoiceRequest.year : ""}\n\n`;
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
          `⚠️ *IMPORTANTE:* El número de cuenta debe tener 3 o 4 dígitos solamente. El formato antiguo de matrícula (como "54-0556-A") ya NO es válido.\n\n` +
          `📋 En la imagen puedes ver dónde encontrar el número de cuenta correcto en tu factura.\n\n` +
          `El número de cuenta aparece en la sección "DATOS PARA INGRESAR A LA WEB" de tu factura.\n\n` +
          `Por favor, verifica que el número de cuenta sea correcto (3 o 4 dígitos) y envíame tu solicitud nuevamente con el formato:\n` +
          `"Me puede pasar boleta de luz, número de cuenta: 2862"\n\n` +
          `Si el problema persiste, puedes contactar con nuestra oficina al 3521-401330 o con los consultorios médicos PFC (turnos) al 3521 401387.`;

        await logWebMessages(lastUserMessage, response);

        return NextResponse.json({
          response,
          showImage: "ubicacion de numero de cuenta",
        });
      }
    }

    // 2) Si no es un caso de factura, usar OpenAI como antes
    const systemMessage = {
      role: "system" as const,
      content: `Eres un asistente virtual amigable y profesional de la Cooperativa La Dormida. Tu objetivo es ayudar a los usuarios con información sobre los servicios, horarios, contacto y más.

${cooperativeContext}

Responde siempre en español, de forma natural y conversacional. Sé empático, útil y profesional. Si el usuario pregunta algo que no está en la información proporcionada, admítelo honestamente y sugiere que contacten directamente con la cooperativa.`,
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
