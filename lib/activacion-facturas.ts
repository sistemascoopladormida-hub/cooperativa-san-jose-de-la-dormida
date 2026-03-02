/**
 * Lógica para "Activar facturas" - Opt-in de usuarios para recibir facturas por WhatsApp.
 * Mejora el límite de mensajes diarios de Meta cuando los usuarios interactúan con plantillas.
 */

/** Texto exacto del botón en la plantilla de Meta */
export const ACTIVAR_FACTURAS_TEXT = "Activar facturas";

/** Mensaje de confirmación enviado al usuario */
export const ACTIVACION_FACTURAS_RESPONSE = `¡Solicitud recibida! ✅

Desde ahora podés recibir tus facturas mensuales por este medio.

Cuando necesites una copia de tu factura, simplemente enviá tu número de cuenta por este chat y nuestro sistema la procesará automáticamente devolviendo tu factura en formato PDF.

Gracias por confiar en la Cooperativa Eléctrica de San José de la Dormida.`;

/**
 * Verifica si el texto corresponde al botón "Activar facturas" de la plantilla de Meta.
 * Compara normalizado (trim + case insensitive).
 */
export function isActivacionFactura(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  return normalized === ACTIVAR_FACTURAS_TEXT.toLowerCase();
}
