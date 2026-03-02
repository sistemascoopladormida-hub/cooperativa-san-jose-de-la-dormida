import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { processTextMessage } from "@/lib/webhook-handlers";
import { isMessageAlreadyProcessed } from "@/lib/conversations";
import {
  getOrCreateConversation,
  saveMessage,
  updateWhatsappOptIn,
} from "@/lib/conversations";
import { isActivacionFactura, ACTIVACION_FACTURAS_RESPONSE } from "@/lib/activacion-facturas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || "v22.0";

/**
 * Verifica la firma HMAC del webhook de Meta
 */
function verifySignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !signatureHeader) {
    return true;
  }
  const hash = signatureHeader.replace("sha256=", "");
  const expectedHash = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash));
}

/**
 * Envía un mensaje de texto vía WhatsApp Cloud API
 */
async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    console.error("[WEBHOOK-WA] Configuración faltante: WHATSAPP_TOKEN o WHATSAPP_PHONE_NUMBER_ID");
    return { success: false, error: "Configuración faltante" };
  }

  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneId}/messages`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to.replace(/\D/g, "").replace(/^0/, ""), // Solo dígitos, sin 0 inicial
        type: "text",
        text: { body: message },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[WEBHOOK-WA] Error enviando mensaje:", data);
      return {
        success: false,
        error: data.error?.message || "Error enviando mensaje",
      };
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[WEBHOOK-WA] Error en sendWhatsAppMessage:", err);
    return { success: false, error: err.message };
  }
}

/**
 * GET - Verificación del webhook (Meta requiere esto para configurar la URL)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (!verifyToken) {
    return NextResponse.json(
      { error: "Configuración faltante: WHATSAPP_VERIFY_TOKEN" },
      { status: 500 }
    );
  }

  if (mode === "subscribe" && token === verifyToken) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }

  return NextResponse.json({ error: "Token inválido" }, { status: 403 });
}

/**
 * POST - Recibir eventos del webhook (mensajes entrantes)
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signatureHeader = request.headers.get("x-hub-signature-256");

    if (!verifySignature(rawBody, signatureHeader)) {
      return NextResponse.json({ error: "Firma inválida" }, { status: 403 });
    }

    const body = JSON.parse(rawBody);

    if (!body.entry || !Array.isArray(body.entry)) {
      return NextResponse.json({ status: "received" });
    }

    for (const entry of body.entry) {
      const changes = entry?.changes ?? [];
      for (const change of changes) {
        const value = change?.value;
        if (!value?.messages || !Array.isArray(value.messages)) continue;

        for (const message of value.messages) {
          // Solo procesar mensajes de texto
          if (message?.type !== "text") {
            console.log("[WEBHOOK-WA] Ignorando mensaje no-text:", message?.type);
            continue;
          }

          const from = message?.from;
          const text = (message?.text?.body ?? "").trim();
          const whatsappMessageId = message?.id;

          if (!from) continue;

          // Evitar duplicados
          if (whatsappMessageId) {
            const alreadyProcessed = await isMessageAlreadyProcessed(whatsappMessageId);
            if (alreadyProcessed) {
              console.log("[WEBHOOK-WA] Mensaje ya procesado:", whatsappMessageId);
              continue;
            }
          }

          // 1. Detectar "Activar facturas" (opt-in)
          if (isActivacionFactura(text)) {
            try {
              const conversationId = await getOrCreateConversation(from);

              // Marcar opt-in (no falla si ya está en true)
              await updateWhatsappOptIn(from, true);

              // Guardar mensaje entrante
              await saveMessage(
                conversationId,
                "user",
                "Activar facturas",
                whatsappMessageId,
                "activacion_facturas"
              );

              // Enviar respuesta automática
              const sendResult = await sendWhatsAppMessage(
                from,
                ACTIVACION_FACTURAS_RESPONSE
              );

              if (sendResult.success && sendResult.messageId) {
                await saveMessage(
                  conversationId,
                  "assistant",
                  ACTIVACION_FACTURAS_RESPONSE,
                  sendResult.messageId,
                  "activacion_facturas"
                );
              }

              console.log("[WEBHOOK-WA] ✅ Activación facturas procesada para:", from);
            } catch (err) {
              console.error("[WEBHOOK-WA] Error procesando activación facturas:", err);
            }
            continue;
          }

          // 2. Resto de mensajes → flujo normal del asistente
          await processTextMessage(from, text, whatsappMessageId ?? "");
        }
      }
    }

    return NextResponse.json({ status: "received" });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[WEBHOOK-WA] Error en POST:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
