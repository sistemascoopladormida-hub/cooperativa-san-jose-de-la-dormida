import { sendTextMessage } from "./whatsapp-messages";
import { formatearTelefonoWhatsApp, obtenerNombreServicio } from "./encuestas";

const WHATSAPP_API_VERSION = "v22.0";

/**
 * Envía un mensaje de encuesta por WhatsApp usando plantilla (cuando esté aprobada)
 */
export async function enviarMensajeEncuestaConPlantilla(
  telefono: string,
  nombreTitular: string,
  tipoServicio: string,
  numeroCuenta: string,
  urlEncuesta: string,
  nombrePlantilla: string = "encuesta_visita_tecnica"
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
        to: formatearTelefonoWhatsApp(telefono),
        type: "template",
        template: {
          name: nombrePlantilla,
          language: {
            code: "es",
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: nombreTitular,
                },
                {
                  type: "text",
                  text: obtenerNombreServicio(tipoServicio),
                },
                {
                  type: "text",
                  text: numeroCuenta,
                },
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: 0,
              parameters: [
                {
                  type: "text",
                  text: urlEncuesta,
                },
              ],
            },
          ],
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[WHATSAPP] Error enviando plantilla:", data.error || data);
      return {
        success: false,
        error: data.error?.message || "Error enviando plantilla",
      };
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (error: any) {
    console.error("[WHATSAPP] Error enviando plantilla:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Envía un mensaje de encuesta por WhatsApp SIN plantilla (modo temporal hasta que Meta apruebe la plantilla)
 */
export async function enviarMensajeEncuestaSinPlantilla(
  telefono: string,
  nombreTitular: string,
  tipoServicio: string,
  numeroCuenta: string,
  urlEncuesta: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const nombreServicio = obtenerNombreServicio(tipoServicio);
  const telefonoFormateado = formatearTelefonoWhatsApp(telefono);

  // Construir el mensaje según la plantilla que se usará cuando esté aprobada
  const mensaje = `Hola ${nombreTitular}.

Te enviamos este mensaje en relación al servicio de ${nombreServicio}, con numero de cuenta ${numeroCuenta} realizado hoy en tu domicilio.

Para completar el registro de atención, te solicitamos responder una breve encuesta.

Por favor, tocá el botón "Completar encuesta" para continuar.

Muchas gracias.

Cooperativa Eléctrica de San José de la Dormida

${urlEncuesta}`;

  // Por ahora enviamos como mensaje de texto simple
  // Cuando Meta apruebe la plantilla, cambiaremos a usar enviarMensajeEncuestaConPlantilla
  return await sendTextMessage(telefonoFormateado, mensaje);
}

/**
 * Envía el mensaje de encuesta (usa plantilla si está disponible, sino mensaje de texto)
 */
export async function enviarMensajeEncuesta(
  telefono: string,
  nombreTitular: string,
  tipoServicio: string,
  numeroCuenta: string,
  urlEncuesta: string,
  usarPlantilla: boolean = false
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (usarPlantilla) {
    // Intentar usar plantilla
    const resultado = await enviarMensajeEncuestaConPlantilla(
      telefono,
      nombreTitular,
      tipoServicio,
      numeroCuenta,
      urlEncuesta
    );
    
    // Si la plantilla falla, usar mensaje de texto como fallback
    if (!resultado.success && resultado.error?.includes("template")) {
      console.log("[WHATSAPP] Plantilla no disponible, usando mensaje de texto");
      return await enviarMensajeEncuestaSinPlantilla(
        telefono,
        nombreTitular,
        tipoServicio,
        numeroCuenta,
        urlEncuesta
      );
    }
    
    return resultado;
  }
  
  // Usar mensaje de texto (modo actual hasta que Meta apruebe la plantilla)
  return await enviarMensajeEncuestaSinPlantilla(
    telefono,
    nombreTitular,
    tipoServicio,
    numeroCuenta,
    urlEncuesta
  );
}

