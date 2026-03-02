/**
 * Detecta reclamos por corte de servicio (cable, luz, internet, etc.)
 * Estos NO son solicitudes de factura - el usuario está reportando un problema técnico
 * con su dirección para que lo atiendan.
 *
 * Ejemplo: "En la calle Eva Perón 621 tengo cortado el cable desde esta mañana"
 * → Es un RECLAMO, NO solicitud de factura (621 es número de dirección, no de cuenta)
 */
export function isServiceOutageComplaint(message: string): boolean {
  // Patrones que indican CORTE o FALTA de servicio (reclamo técnico)
  const outagePatterns = [
    // "tengo cortado el cable", "tiene cortado el internet"
    /(?:tengo|tenemos|tiene)\s+cortado\s+(?:el\s+)?(?:cable|internet|luz|tv|servicio)/i,
    // "el cable cortado", "cortado el cable"
    /(?:cortado|corrido)\s+(?:el\s+)?(?:cable|internet|luz|tv|servicio)/i,
    // "el cable está cortado"
    /(?:cable|internet|luz|tv|servicio)\s+(?:está|esta)\s+cortado/i,
    /(?:corte|corri)\s+(?:de\s+)?(?:cable|internet|luz|tv|servicio)/i,
    /(?:sin|no\s+hay)\s+(?:cable|internet|luz|tv|servicio)/i,
    /(?:no\s+funciona|no\s+me\s+funciona)\s+(?:el\s+)?(?:cable|internet|luz|tv)/i,
    /(?:se\s+cortó|se\s+corto)\s+(?:el\s+)?(?:cable|internet|luz|tv)/i,
    /(?:desde\s+esta\s+mañana|desde\s+ayer|desde\s+hace)\s+.*(?:cable|internet|luz|tv)/i,
    /(?:hay\s+algún|hay\s+alguna)\s+problema.*(?:cable|internet|luz|tv)/i,
    /(?:problema|falla)\s+con\s+(?:el\s+)?(?:cable|internet|luz|tv)/i,
    /(?:se\s+cayó|se\s+cayo)\s+(?:el\s+)?(?:cable|internet|luz|tv)/i,
    /(?:no\s+tengo|no\s+tenemos)\s+(?:cable|internet|luz|tv|señal)/i,
    /(?:falta\s+de)\s+(?:cable|internet|luz|tv|servicio)/i,
    /(?:interrumpido|interrumpió)\s+(?:el\s+)?(?:servicio|cable|internet|luz)/i,
  ];

  const hasOutageKeyword = outagePatterns.some((p) => p.test(message));

  // Si reporta corte/falla de servicio → es reclamo, NO solicitud de factura
  // (evita que "calle X 621" + "cable" se interprete como factura cuenta 621)
  return hasOutageKeyword;
}

/** Mensaje de respuesta para reclamos por corte de servicio */
export const SERVICE_OUTAGE_RESPONSE = `Entiendo que tenés un problema con el servicio. Para reportar cortes de cable, internet, luz o TV, te recomiendo:

📞 *Guardia técnica 24/7:*
• Internet/Cable: 3521 438313
• Eléctrica: 3521 406186

📧 *También podés hacer tu reclamo por:*
• Email: admin-reclamos@cooperativaladormida.com
• Internet/Cable: internet-cable@cooperativaladormida.com
• Web: ingresá a la sección "Reclamos" en nuestra página

¿Te puedo ayudar con algo más? 😊`;
