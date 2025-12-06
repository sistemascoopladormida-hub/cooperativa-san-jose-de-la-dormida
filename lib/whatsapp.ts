import FormData from "form-data";
import https from "https";

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
    // Paso 1: Subir el archivo a WhatsApp Media API usando form-data con https.request
    const formData = new FormData();

    // IMPORTANTE: Agregar campos en el orden correcto
    formData.append("messaging_product", "whatsapp");
    formData.append("type", "document");
    formData.append("file", fileBuffer, {
      filename: filename,
      contentType: "application/pdf",
    });

    // Obtener los headers de FormData
    const formHeaders = formData.getHeaders();
    formHeaders["Authorization"] = `Bearer ${token}`;

    console.log(
      "[WHATSAPP] Enviando archivo:",
      filename,
      "Tamaño:",
      fileBuffer.length
    );

    // Usar form-data.submit() que es más compatible
    const uploadData = await new Promise<any>((resolve, reject) => {
      const chunks: Buffer[] = [];

      formData.submit(
        {
          host: "graph.facebook.com",
          path: `/${WHATSAPP_API_VERSION}/${phoneId}/media`,
          method: "POST",
          headers: formHeaders,
        },
        (err, res) => {
          if (err) {
            reject(err);
            return;
          }

          res.on("data", (chunk) => chunks.push(chunk));
          res.on("end", () => {
            try {
              const body = Buffer.concat(chunks).toString();
              const data = JSON.parse(body);

              if (
                res.statusCode &&
                res.statusCode >= 200 &&
                res.statusCode < 300
              ) {
                resolve(data);
              } else {
                reject(
                  new Error(data.error?.message || `HTTP ${res.statusCode}`)
                );
              }
            } catch (parseError) {
              reject(parseError);
            }
          });
          res.on("error", reject);
        }
      );
    });

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
