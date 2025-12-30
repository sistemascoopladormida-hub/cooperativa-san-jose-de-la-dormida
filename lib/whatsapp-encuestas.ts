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
  nombrePlantilla: string = "encuesta_de_servicios_tecnicos"
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    return { success: false, error: "Configuración faltante" };
  }

  // Para botones URL dinámicos en WhatsApp:
  // Si la plantilla tiene: https://cooperativaladormida.com/encuesta/{{1}}
  // Necesitamos pasar solo el token como parámetro {{1}}
  // La plantilla construirá la URL completa automáticamente
  
  let parametroBoton = urlEncuesta; // Por defecto usar URL completa
  
  // Extraer solo el token de la URL
  // Formato esperado: https://cooperativaladormida.com/encuesta/[token]
  const match = urlEncuesta.match(/\/encuesta\/([^?#]+)/);
  if (match && match[1]) {
    parametroBoton = match[1].trim();
    // Validar que el token no esté vacío y tenga formato válido (solo caracteres alfanuméricos y guiones)
    if (!parametroBoton || parametroBoton.length === 0) {
      console.warn("[WHATSAPP] Token extraído está vacío, usando URL completa");
      parametroBoton = urlEncuesta;
    }
  } else {
    console.warn("[WHATSAPP] No se pudo extraer token de la URL, usando URL completa");
  }

  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneId}/messages`;

  console.log("[WHATSAPP] Enviando plantilla:", nombrePlantilla);
  console.log("[WHATSAPP] Parámetros body:", { nombreTitular, tipoServicio: obtenerNombreServicio(tipoServicio), numeroCuenta });
  console.log("[WHATSAPP] URL completa:", urlEncuesta);
  console.log("[WHATSAPP] Parámetro para botón:", parametroBoton);

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
            code: "es_AR", // Spanish (Argentina)
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
                  text: parametroBoton, // Token extraído de la URL
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
      console.error("[WHATSAPP] Payload enviado:", JSON.stringify({
        messaging_product: "whatsapp",
        to: formatearTelefonoWhatsApp(telefono),
        type: "template",
        template: {
          name: nombrePlantilla,
          language: { code: "es_AR" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: nombreTitular },
                { type: "text", text: obtenerNombreServicio(tipoServicio) },
                { type: "text", text: numeroCuenta },
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: 0,
              parameters: [{ type: "text", text: parametroBoton }],
            },
          ],
        },
      }, null, 2));
      
      return {
        success: false,
        error: data.error?.message || "Error enviando plantilla",
      };
    }

    console.log("[WHATSAPP] ✅ Plantilla enviada exitosamente. MessageId:", data.messages?.[0]?.id);

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
  
  console.log("[WHATSAPP] Enviando mensaje sin plantilla");
  console.log("[WHATSAPP] Teléfono original:", telefono);
  
  let telefonoFormateado: string;
  try {
    telefonoFormateado = formatearTelefonoWhatsApp(telefono);
    console.log("[WHATSAPP] Teléfono formateado:", telefonoFormateado);
  } catch (error: any) {
    console.error("[WHATSAPP] Error formateando teléfono:", error.message);
    return { success: false, error: `Error formateando teléfono: ${error.message}` };
  }
  
  console.log("[WHATSAPP] URL encuesta:", urlEncuesta);
  console.log("[WHATSAPP] Nombre titular:", nombreTitular);
  console.log("[WHATSAPP] Tipo servicio:", nombreServicio);
  console.log("[WHATSAPP] Número cuenta:", numeroCuenta);

  // Construir el mensaje según la plantilla que se usará cuando esté aprobada
  const mensaje = `Hola ${nombreTitular}.

Te enviamos este mensaje en relación al servicio de ${nombreServicio}, con numero de cuenta ${numeroCuenta} realizado hoy en tu domicilio.

Para completar el registro de atención, te solicitamos responder una breve encuesta.

Por favor, tocá el botón "Completar encuesta" para continuar.

Muchas gracias.

Cooperativa Eléctrica de San José de la Dormida

${urlEncuesta}`;

  console.log("[WHATSAPP] Mensaje completo:", mensaje.substring(0, 100) + "...");

  // Por ahora enviamos como mensaje de texto simple
  // Cuando Meta apruebe la plantilla, cambiaremos a usar enviarMensajeEncuestaConPlantilla
  const resultado = await sendTextMessage(telefonoFormateado, mensaje);
  
  console.log("[WHATSAPP] Resultado del envío:", resultado);
  
  return resultado;
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

