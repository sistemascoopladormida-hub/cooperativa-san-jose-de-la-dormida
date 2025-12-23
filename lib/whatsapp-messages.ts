const WHATSAPP_API_VERSION = "v22.0";

/**
 * Envía un mensaje de texto a través de WhatsApp Cloud API
 */
export async function sendTextMessage(
  to: string,
  text: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    console.error("[WHATSAPP] Configuración faltante - Token:", !!token, "PhoneId:", !!phoneId);
    return { success: false, error: "Configuración faltante" };
  }

  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneId}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to: to,
    type: "text",
    text: {
      body: text,
    },
  };

  console.log("[WHATSAPP] Enviando mensaje a:", to);
  console.log("[WHATSAPP] URL:", url);
  console.log("[WHATSAPP] Payload:", JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    
    console.log("[WHATSAPP] Status:", response.status);
    console.log("[WHATSAPP] Response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("[WHATSAPP] Error enviando mensaje:", data.error || data);
      return {
        success: false,
        error: data.error?.message || data.error?.error_user_msg || "Error desconocido",
        detalles: data.error,
      };
    }

    console.log("[WHATSAPP] Mensaje enviado exitosamente. MessageId:", data.messages?.[0]?.id);

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (error: any) {
    console.error("[WHATSAPP] Error enviando mensaje:", error);
    return { success: false, error: error.message };
  }
}

