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
 */
export function formatearTelefonoWhatsApp(telefono: string): string {
  // Eliminar espacios, guiones, paréntesis y otros caracteres
  let numero = telefono.replace(/[\s\-\(\)\.]/g, "");
  
  // Si no empieza con código de país, agregar +54 (Argentina)
  if (!numero.startsWith("+")) {
    // Si empieza con 0, quitarlo
    if (numero.startsWith("0")) {
      numero = numero.substring(1);
    }
    // Agregar código de país de Argentina
    numero = `54${numero}`;
  } else {
    // Si ya tiene +, quitarlo para agregarlo después
    numero = numero.substring(1);
  }
  
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

