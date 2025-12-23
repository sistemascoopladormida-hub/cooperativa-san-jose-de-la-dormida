import crypto from "crypto";

/**
 * Genera un token único para una encuesta
 */
export function generarTokenEncuesta(): string {
  // Genera un token seguro de 32 caracteres usando crypto
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Formatea el número de teléfono para WhatsApp (elimina caracteres especiales, agrega código de país)
 * WhatsApp requiere formato internacional SIN el signo +
 */
export function formatearTelefonoWhatsApp(telefono: string): string {
  if (!telefono || !telefono.trim()) {
    throw new Error("Número de teléfono vacío");
  }

  // Eliminar espacios, guiones, paréntesis, puntos y otros caracteres
  let numero = telefono.replace(/[\s\-\(\)\.]/g, "");
  
  // Eliminar el signo + si existe (WhatsApp no lo acepta)
  if (numero.startsWith("+")) {
    numero = numero.substring(1);
  }
  
  // Si ya empieza con 54 (código de país Argentina), dejarlo así
  if (numero.startsWith("54")) {
    // Ya tiene código de país, solo validar que sea válido
    console.log(`[ENCUESTAS] Teléfono ya tiene código de país: ${numero}`);
    return numero;
  }
  
  // Si empieza con 0, quitarlo (código de área local)
  if (numero.startsWith("0")) {
    numero = numero.substring(1);
  }
  
  // Agregar código de país de Argentina (54)
  numero = `54${numero}`;
  
  // Validar que sea un número válido (solo dígitos)
  if (!/^\d+$/.test(numero)) {
    throw new Error(`Número de teléfono inválido: ${telefono} -> ${numero}`);
  }
  
  // Validar longitud mínima (código de país + código de área + número)
  if (numero.length < 10) {
    throw new Error(`Número de teléfono muy corto: ${numero}`);
  }
  
  console.log(`[ENCUESTAS] Teléfono formateado: ${telefono} -> ${numero}`);
  
  return numero;
}

/**
 * Obtiene el nombre del servicio en formato legible
 */
export function obtenerNombreServicio(codigo: string): string {
  const servicios: Record<string, string> = {
    internet: "Internet",
    electricidad: "Electricidad",
    pfc: "PFC (Plan de Financiamiento Colectivo)",
    otro: "Otro servicio",
  };
  
  return servicios[codigo] || codigo;
}

