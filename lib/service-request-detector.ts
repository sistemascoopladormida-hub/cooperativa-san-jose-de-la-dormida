/**
 * Detecta solicitudes de ALTA de servicio (nueva conexión, instalación, contratación)
 * Estas NO son solicitudes de factura y deben derivarse a Administración
 */
export function isNewServiceRequest(message: string): boolean {
  const lower = message.toLowerCase().trim();

  // Patrones que indican solicitud de ALTA/nueva conexión de servicio
  const newServicePatterns = [
    // Internet
    /solicitar\s+(?:la\s+)?(?:conexión|conexion)\s+de\s+internet/i,
    /solicitar\s+internet/i,
    /dar\s+de\s+alta\s+internet/i,
    /quiero\s+(?:la\s+)?(?:conexión|conexion)\s+de\s+internet/i,
    /quiero\s+internet\s+(?:en\s+mi\s+)?(?:casa|domicilio|hogar)/i,
    /(?:conexión|conexion)\s+de\s+internet\s+en\s+mi\s+domicilio/i,
    /instalar\s+internet/i,
    /contratar\s+internet/i,
    /necesito\s+(?:dar\s+de\s+alta|conectar|instalar)\s+internet/i,
    /(?:dar\s+de\s+alta|dar\s+de\s+baja)\s+internet/i,
    // Electricidad
    /solicitar\s+(?:la\s+)?(?:conexión|conexion)\s+(?:eléctrica|electrica)/i,
    /dar\s+de\s+alta\s+(?:la\s+)?(?:luz|electricidad|energía|energia)/i,
    /quiero\s+(?:dar\s+de\s+alta|conectar)\s+(?:la\s+)?(?:luz|electricidad)/i,
    /instalar\s+(?:la\s+)?(?:luz|electricidad)/i,
    /contratar\s+(?:luz|electricidad)/i,
    // TV/Cable
    /solicitar\s+(?:el\s+)?(?:servicio\s+de\s+)?(?:cable|tv|televisión|television)/i,
    /dar\s+de\s+alta\s+(?:cable|tv|televisión|television)/i,
    /quiero\s+(?:dar\s+de\s+alta|contratar)\s+(?:cable|tv)/i,
    /instalar\s+(?:cable|tv)/i,
    // Genéricos
    /solicitar\s+(?:un\s+)?(?:nuevo\s+)?servicio/i,
    /dar\s+de\s+alta\s+(?:un\s+)?(?:nuevo\s+)?servicio/i,
    /quiero\s+(?:un\s+)?(?:nuevo\s+)?servicio/i,
    /contratar\s+(?:un\s+)?(?:nuevo\s+)?servicio/i,
    /necesito\s+(?:dar\s+de\s+alta|contratar|instalar)\s+(?:un\s+)?servicio/i,
  ];

  return newServicePatterns.some((pattern) => pattern.test(lower));
}

/** Mensaje de derivación a Administración para alta de servicios */
export const NEW_SERVICE_DERIVATION_MESSAGE = `Para solicitar la conexión o el alta de un servicio (Internet, electricidad, TV, etc.), debés contactar directamente con *Administración*:

📞 *WhatsApp/Teléfono:* 3521 401330
🕐 *Horario:* Lunes a Viernes de 7:00 a 12:00

Ellos te van a asistir con el alta del servicio en tu domicilio. ¿Te puedo ayudar con algo más? 😊`;
