import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sendTextMessage } from "@/lib/whatsapp-messages";
import { getOrCreateConversation, saveMessage } from "@/lib/conversations";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("conversaciones_auth");

    if (authCookie?.value !== "authenticated") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { phoneNumber, message } = await request.json();

    if (!phoneNumber || typeof phoneNumber !== "string") {
      return NextResponse.json(
        { error: "Número de teléfono inválido" },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "El mensaje no puede estar vacío" },
        { status: 400 }
      );
    }

    // Las conversaciones WEB-* no tienen destino WhatsApp real
    if (phoneNumber.startsWith("WEB-")) {
      return NextResponse.json(
        { error: "No se puede enviar WhatsApp a una conversación web" },
        { status: 400 }
      );
    }

    const cleanMessage = message.trim();
    const sendResult = await sendTextMessage(phoneNumber, cleanMessage);

    if (!sendResult.success) {
      return NextResponse.json(
        { error: sendResult.error || "Error enviando mensaje por WhatsApp" },
        { status: 500 }
      );
    }

    const conversationId = await getOrCreateConversation(phoneNumber);
    await saveMessage(
      conversationId,
      "assistant",
      cleanMessage,
      sendResult.messageId
    );

    return NextResponse.json({
      success: true,
      messageId: sendResult.messageId,
    });
  } catch (error) {
    console.error("[CONVERSACIONES] Error enviando mensaje manual:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

