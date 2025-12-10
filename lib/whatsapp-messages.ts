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
        to: to,
        type: "text",
        text: {
          body: text,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error enviando mensaje:", data.error || data);
      return {
        success: false,
        error: data.error?.message || "Error desconocido",
      };
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (error: any) {
    console.error("Error enviando mensaje:", error);
    return { success: false, error: error.message };
  }
}

