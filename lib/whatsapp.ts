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
            console.error("[WHATSAPP] Error en submit:", err);
            reject(err);
            return;
          }

          console.log("[WHATSAPP] Status code:", res.statusCode);
          console.log("[WHATSAPP] Headers:", res.headers);

          res.on("data", (chunk) => {
            chunks.push(chunk);
          });

          res.on("end", () => {
            try {
              const body = Buffer.concat(chunks).toString();
              console.log("[WHATSAPP] Respuesta completa:", body);

              if (!body || body.trim() === "") {
                console.error("[WHATSAPP] Respuesta vacía del servidor");
                reject(new Error("Respuesta vacía del servidor de WhatsApp"));
                return;
              }

              const data = JSON.parse(body);

              if (
                res.statusCode &&
                res.statusCode >= 200 &&
                res.statusCode < 300
              ) {
                console.log("[WHATSAPP] Upload exitoso, media ID:", data.id);
                resolve(data);
              } else {
                console.error("[WHATSAPP] Error en respuesta:", data);
                reject(
                  new Error(
                    data.error?.message || `HTTP ${res.statusCode}: ${body}`
                  )
                );
              }
            } catch (parseError: any) {
              console.error("[WHATSAPP] Error parseando JSON:", parseError);
              const bodyText = Buffer.concat(chunks).toString();
              console.error("[WHATSAPP] Body recibido:", bodyText);
              reject(
                new Error(`Error parseando respuesta: ${parseError.message}`)
              );
            }
          });

          res.on("error", (error) => {
            console.error("[WHATSAPP] Error en stream:", error);
            reject(error);
          });
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
