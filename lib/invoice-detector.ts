/**
 * Detecta si el mensaje contiene una solicitud de factura y extrae el número de cuenta
 * También detecta si se menciona un mes específico
 */
export function detectInvoiceRequest(
  message: string
): {
  accountNumber: string | null;
  month?: string;
  year?: string;
  type?: "servicios" | "electricidad";
} {
  const lowerMessage = message.toLowerCase();

  // Patrones para detectar solicitud de factura
  const invoicePatterns = [
    /(?:mi|el|la|número|numero|cuenta|factura|boleta).*?(\d{3,6})/i,
    /(?:factura|boleta).*?(\d{3,6})/i,
    /(?:cuenta|número|numero).*?(\d{3,6})/i,
    /(\d{3,6}).*?(?:factura|boleta|cuenta)/i,
  ];

  let accountNumber: string | null = null;

  // Buscar número de cuenta
  for (const pattern of invoicePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const number = match[1].trim();
      // Validar que sea un número razonable (3-6 dígitos)
      if (number.length >= 3 && number.length <= 6 && /^\d+$/.test(number)) {
        accountNumber = number;
        break;
      }
    }
  }

  // Si no se encontró con patrones, buscar cualquier número de 3-6 dígitos
  // PERO excluir años (20XX) y priorizar números que no sean años
  if (!accountNumber) {
    // Buscar todos los números de 3-6 dígitos
    const allNumbers = message.match(/\b(\d{3,6})\b/g);
    if (allNumbers) {
      // Filtrar años (20XX) y priorizar números que no sean años
      const nonYearNumbers = allNumbers.filter(
        (num) => !num.startsWith("20") || num.length !== 4
      );
      
      // Si hay números que no son años, usar el primero
      if (nonYearNumbers.length > 0) {
        accountNumber = nonYearNumbers[0];
      } else {
        // Si solo hay años, usar el primero que no sea el año actual
        const currentYear = new Date().getFullYear().toString();
        const filtered = allNumbers.filter((num) => num !== currentYear);
        if (filtered.length > 0) {
          accountNumber = filtered[0];
        } else {
          // Último recurso: usar el primero
          accountNumber = allNumbers[0];
        }
      }
    }
  }

  // Detectar tipo de factura
  let type: "servicios" | "electricidad" | undefined;
  if (lowerMessage.includes("servicio") || lowerMessage.includes("internet") || lowerMessage.includes("cable") || lowerMessage.includes("tv")) {
    type = "servicios";
  } else if (
    lowerMessage.includes("electricidad") ||
    lowerMessage.includes("luz") ||
    lowerMessage.includes("energía") ||
    lowerMessage.includes("energia")
  ) {
    type = "electricidad";
  }

  // Detectar mes
  const monthPattern =
    /(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i;
  const monthMatch = message.match(monthPattern);
  const month = monthMatch ? monthMatch[1].toLowerCase() : undefined;

  // Detectar año
  const yearPattern = /(20\d{2})/;
  const yearMatch = message.match(yearPattern);
  const year = yearMatch ? yearMatch[1] : undefined;

  return {
    accountNumber,
    month,
    year,
    type,
  };
}

