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

          // Manejar redirecciones 301/302
          if (res.statusCode === 301 || res.statusCode === 302) {
            const location = res.headers.location;
            if (location) {
              console.log("[WHATSAPP] Redirección detectada a:", location);
              // Consumir la respuesta para liberar recursos
              res.resume();

              // Hacer nueva petición a la URL de redirección
              const redirectFormData = new FormData();
              redirectFormData.append("messaging_product", "whatsapp");
              redirectFormData.append("type", "document");
              redirectFormData.append("file", fileBuffer, {
                filename: filename,
                contentType: "application/pdf",
              });

              const redirectHeaders = redirectFormData.getHeaders();
              redirectHeaders["Authorization"] = `Bearer ${token}`;

              const urlObj = new URL(location);
              redirectFormData.submit(
                {
                  host: urlObj.hostname,
                  path: urlObj.pathname,
                  method: "POST",
                  headers: redirectHeaders,
                },
                (redirectErr, redirectRes) => {
                  if (redirectErr) {
                    reject(redirectErr);
                    return;
                  }

                  const redirectChunks: Buffer[] = [];
                  redirectRes.on("data", (chunk) => redirectChunks.push(chunk));
                  redirectRes.on("end", () => {
                    try {
                      const redirectBody =
                        Buffer.concat(redirectChunks).toString();
                      console.log(
                        "[WHATSAPP] Respuesta después de redirección:",
                        redirectBody
                      );

                      if (!redirectBody || redirectBody.trim() === "") {
                        reject(
                          new Error("Respuesta vacía después de redirección")
                        );
                        return;
                      }

                      const redirectData = JSON.parse(redirectBody);

                      if (
                        redirectRes.statusCode &&
                        redirectRes.statusCode >= 200 &&
                        redirectRes.statusCode < 300
                      ) {
                        console.log(
                          "[WHATSAPP] Upload exitoso, media ID:",
                          redirectData.id
                        );
                        resolve(redirectData);
                      } else {
                        reject(
                          new Error(
                            redirectData.error?.message ||
                              `HTTP ${redirectRes.statusCode}`
                          )
                        );
                      }
                    } catch (parseError: any) {
                      reject(
                        new Error(
                          `Error parseando respuesta: ${parseError.message}`
                        )
                      );
                    }
                  });
                  redirectRes.on("error", reject);
                }
              );
              return;
            } else {
              reject(new Error("Redirección sin header location"));
              return;
            }
          }

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
