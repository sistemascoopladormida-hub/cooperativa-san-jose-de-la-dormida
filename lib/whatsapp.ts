import FormData from "form-data";
import https from "https";

const WHATSAPP_API_VERSION = "v22.0";

// Función auxiliar para hacer petición HTTPS con FormData
function makeHttpsRequest(
  url: string,
  fileBuffer: Buffer,
  filename: string,
  headers: Record<string, string>,
  contentType: string = "application/pdf",
  mediaType: string = "document"
): Promise<any> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const chunks: Buffer[] = [];

    // Crear FormData para esta petición
    const formData = new FormData();
    formData.append("messaging_product", "whatsapp");
    formData.append("type", mediaType);
    formData.append("file", fileBuffer, {
      filename: filename,
      contentType: contentType,
    });

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: "POST",
      headers: {
        ...headers,
        ...formData.getHeaders(),
      },
    };

    const req = https.request(options, (res) => {
      console.log("[WHATSAPP] Status:", res.statusCode);
      console.log("[WHATSAPP] Headers:", res.headers);

      // Manejar redirecciones
      if (res.statusCode === 301 || res.statusCode === 302) {
        const location = res.headers.location;
        if (location) {
          console.log("[WHATSAPP] Redirección a:", location);
          res.resume(); // Consumir la respuesta

          // Recursivamente seguir la redirección con los mismos datos
          return makeHttpsRequest(location, fileBuffer, filename, headers)
            .then(resolve)
            .catch(reject);
        }
      }

      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        try {
          const body = Buffer.concat(chunks).toString();
          console.log("[WHATSAPP] Respuesta body:", body);

          if (!body || body.trim() === "") {
            reject(new Error("Respuesta vacía del servidor"));
            return;
          }

          const data = JSON.parse(body);

          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(data.error?.message || `HTTP ${res.statusCode}`));
          }
        } catch (parseError: any) {
          reject(new Error(`Error parseando JSON: ${parseError.message}`));
        }
      });
    });

    req.on("error", reject);
    formData.pipe(req);
  });
}

/**
 * Envía una imagen por WhatsApp Cloud API
 */
export async function sendImageMessage(
  to: string,
  imageBuffer: Buffer,
  caption?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    return { success: false, error: "Configuración faltante" };
  }

  try {
    // Paso 1: Subir la imagen a WhatsApp Media API
    console.log("[WHATSAPP] Enviando imagen, tamaño:", imageBuffer.length);

    const uploadData = await makeHttpsRequest(
      `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneId}/media`,
      imageBuffer,
      "ubicacion-numero-cuenta.jpeg",
      { Authorization: `Bearer ${token}` },
      "image/jpeg",
      "image"
    );

    console.log("[WHATSAPP] Upload exitoso, media ID:", uploadData.id);

    const mediaId = uploadData.id;

    // Paso 2: Enviar el mensaje con la imagen
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
        type: "image",
        image: {
          id: mediaId,
          caption: caption || "",
        },
      }),
    });

    const messageData = await messageResponse.json();

    if (!messageResponse.ok) {
      console.error("Error enviando imagen:", messageData);
      return {
        success: false,
        error: messageData.error?.message || "Error enviando imagen",
      };
    }

    return {
      success: true,
      messageId: messageData.messages?.[0]?.id,
    };
  } catch (error: any) {
    console.error("Error enviando imagen:", error);
    return { success: false, error: error.message };
  }
}

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
    console.log(
      "[WHATSAPP] Enviando archivo:",
      filename,
      "Tamaño:",
      fileBuffer.length
    );

    // Usar la función auxiliar que maneja redirecciones automáticamente
    const uploadData = await makeHttpsRequest(
      `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneId}/media`,
      fileBuffer,
      filename,
      { Authorization: `Bearer ${token}` }
    );

    console.log("[WHATSAPP] Upload exitoso, media ID:", uploadData.id);

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
