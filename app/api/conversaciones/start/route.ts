import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sendTextMessage } from "@/lib/whatsapp-messages";
import { sendDocumentMessage, sendImageMessage } from "@/lib/whatsapp";
import { getOrCreateConversation, saveMessage } from "@/lib/conversations";

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);
const ALLOWED_DOC_TYPES = new Set(["application/pdf"]);

function normalizePhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/[^\d]/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("conversaciones_auth");

    if (authCookie?.value !== "authenticated") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const rawPhoneNumber = formData.get("phoneNumber");
    const rawMessage = formData.get("message");
    const attachment = formData.get("attachment");

    const phoneNumber =
      typeof rawPhoneNumber === "string" ? normalizePhoneNumber(rawPhoneNumber) : "";
    const message = typeof rawMessage === "string" ? rawMessage.trim() : "";

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Número de teléfono inválido" },
        { status: 400 }
      );
    }

    if (phoneNumber.startsWith("WEB")) {
      return NextResponse.json(
        { error: "No se puede iniciar WhatsApp para conversaciones WEB-*" },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: "El mensaje no puede estar vacío" },
        { status: 400 }
      );
    }

    let attachmentPayload:
      | {
          fileName: string;
          mimeType: string;
          fileBuffer: Buffer;
          kind: "pdf" | "image";
        }
      | undefined;

    if (attachment instanceof File && attachment.size > 0) {
      if (attachment.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: "El archivo supera el límite de 15MB" },
          { status: 400 }
        );
      }

      const fileName = attachment.name || "archivo";
      const mimeType = attachment.type || "application/octet-stream";
      const fileBuffer = Buffer.from(await attachment.arrayBuffer());

      if (ALLOWED_DOC_TYPES.has(mimeType)) {
        attachmentPayload = { fileName, mimeType, fileBuffer, kind: "pdf" };
      } else if (ALLOWED_IMAGE_TYPES.has(mimeType)) {
        attachmentPayload = { fileName, mimeType, fileBuffer, kind: "image" };
      } else {
        return NextResponse.json(
          { error: "Tipo de archivo no permitido. Solo PDF o imágenes." },
          { status: 400 }
        );
      }
    }

    const textResult = await sendTextMessage(phoneNumber, message);
    if (!textResult.success) {
      return NextResponse.json(
        {
          error:
            textResult.error || "No se pudo enviar el mensaje de texto por WhatsApp",
        },
        { status: 500 }
      );
    }

    const conversationId = await getOrCreateConversation(phoneNumber);
    await saveMessage(conversationId, "assistant", message, textResult.messageId);

    let attachmentResult:
      | { success: boolean; messageId?: string; filename?: string; type?: string }
      | undefined;

    if (attachmentPayload?.kind === "pdf") {
        const docResult = await sendDocumentMessage(
          phoneNumber,
          attachmentPayload.fileBuffer,
          attachmentPayload.fileName,
          "Adjunto enviado por administración"
        );

        if (!docResult.success) {
          return NextResponse.json(
            { error: docResult.error || "No se pudo enviar el PDF por WhatsApp" },
            { status: 500 }
          );
        }

        await saveMessage(
          conversationId,
          "assistant",
          `📎 Documento enviado: ${attachmentPayload.fileName}`,
          docResult.messageId
        );

        attachmentResult = {
          success: true,
          messageId: docResult.messageId,
          filename: attachmentPayload.fileName,
          type: "pdf",
        };
      } else if (attachmentPayload?.kind === "image") {
        const imageResult = await sendImageMessage(
          phoneNumber,
          attachmentPayload.fileBuffer,
          "Imagen adjunta enviada por administración",
          attachmentPayload.fileName,
          attachmentPayload.mimeType
        );

        if (!imageResult.success) {
          return NextResponse.json(
            { error: imageResult.error || "No se pudo enviar la imagen por WhatsApp" },
            { status: 500 }
          );
        }

        await saveMessage(
          conversationId,
          "assistant",
          `🖼️ Imagen enviada: ${attachmentPayload.fileName}`,
          imageResult.messageId
        );

        attachmentResult = {
          success: true,
          messageId: imageResult.messageId,
          filename: attachmentPayload.fileName,
          type: "image",
        };
    }

    return NextResponse.json({
      success: true,
      textMessageId: textResult.messageId,
      attachment: attachmentResult,
    });
  } catch (error) {
    console.error("[CONVERSACIONES] Error iniciando conversación WhatsApp:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
