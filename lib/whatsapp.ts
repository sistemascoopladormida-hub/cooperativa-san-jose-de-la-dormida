import FormData from "form-data";

const WHATSAPP_API_VERSION = "v22.0";

/**
 * Envía un documento (PDF) por WhatsApp Cloud API
 */
export async function sendDocumentMessage(
  to: string,
  fileBuffer: Buffer,
  filename: string,
  caption?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    return { success: false, error: "Configuración faltante" };
  }

  try {
    // Paso 1: Subir el archivo a WhatsApp Media API
    const mediaUrl = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneId}/media`;

    const formData = new FormData();
    // Asegurarse de agregar messaging_product primero
    formData.append("messaging_product", "whatsapp");
    formData.append("type", "document");
    // Agregar el archivo usando Buffer directamente
    formData.append("file", fileBuffer, {
      filename: filename,
      contentType: "application/pdf",
    });

    // Obtener los headers de FormData (incluye Content-Type con boundary)
    const formHeaders = formData.getHeaders ? formData.getHeaders() : {};

    const uploadResponse = await fetch(mediaUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        ...formHeaders,
      },
      body: formData as any,
    });

    const uploadData = await uploadResponse.json();

    if (!uploadResponse.ok) {
      console.error("Error subiendo archivo:", uploadData);
      return {
        success: false,
        error: uploadData.error?.message || "Error subiendo archivo",
      };
    }

    const mediaId = uploadData.id;

    // Paso 2: Enviar el mensaje con el documento
    const messageUrl = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneId}/messages`;

    const messageResponse = await fetch(messageUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to,
        type: "document",
        document: {
          id: mediaId,
          caption: caption || "Tu factura",
          filename: filename,
        },
      }),
    });

    const messageData = await messageResponse.json();

    if (!messageResponse.ok) {
      console.error("Error enviando documento:", messageData);
      return {
        success: false,
        error: messageData.error?.message || "Error enviando documento",
      };
    }

    return {
      success: true,
      messageId: messageData.messages?.[0]?.id,
    };
  } catch (error: any) {
    console.error("Error enviando documento:", error);
    return { success: false, error: error.message };
  }
}

