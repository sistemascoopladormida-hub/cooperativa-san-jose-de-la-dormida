import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { processTextMessage } from "@/lib/webhook-handlers";
import { isMessageAlreadyProcessed } from "@/lib/conversations";

// Configuración para Next.js 15
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Verifica la firma HMAC del webhook
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
 * Handler GET para verificación del webhook
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (!verifyToken) {
    return NextResponse.json(
      { error: "Configuración faltante" },
      { status: 500 }
    );
  }

  if (mode === "subscribe" && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Token inválido" }, { status: 403 });
}

/**
 * Handler POST para recibir eventos del webhook
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signatureHeader = request.headers.get("x-hub-signature-256");

    if (!verifySignature(rawBody, signatureHeader)) {
      return NextResponse.json({ error: "Firma inválida" }, { status: 403 });
    }

    const body = JSON.parse(rawBody);

    // Procesar mensajes
    if (body.entry && Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const value = change.value;
          if (value.messages && Array.isArray(value.messages)) {
            for (const message of value.messages) {
              if (message.type === "text") {
                const from = message.from;
                const text = message.text?.body || "";
                const whatsappMessageId = message.id;

                // Verificar si el mensaje ya fue procesado para evitar duplicados
                if (whatsappMessageId) {
                  const alreadyProcessed = await isMessageAlreadyProcessed(whatsappMessageId);
                  if (alreadyProcessed) {
                    console.log(`[WEBHOOK] Mensaje ${whatsappMessageId} ya fue procesado, ignorando duplicado`);
                    continue;
                  }
                }

                // Procesar el mensaje usando el handler modularizado
                await processTextMessage(from, text, whatsappMessageId);
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ status: "received" });
  } catch (error: any) {
    console.error("Error en webhook:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
