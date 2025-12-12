/**
 * Detecta si el mensaje contiene una solicitud de factura y extrae el número de cuenta
 * También detecta si se menciona un mes específico
 * Retorna un objeto con confidence que indica qué tan segura es la detección
 */
export function detectInvoiceRequest(
  message: string
): {
  accountNumber: string | null;
  month?: string;
  year?: string;
  type?: "servicios" | "electricidad";
  confidence: "high" | "medium" | "low";
} {
  const lowerMessage = message.toLowerCase();

  // Patrones para detectar solicitud de factura con alta confianza
  // Estos patrones requieren palabras clave relacionadas con facturas/cuentas
  const highConfidencePatterns = [
    /(?:número|numero|nro|cuenta)\s*(?:de\s*)?(?:cuenta|socio)?\s*:?\s*(\d{3,6})/i,
    /(?:factura|boleta)\s*(?:de|del|número|numero|nro)?\s*:?\s*(\d{3,6})/i,
    /(?:cuenta|socio)\s*:?\s*(\d{3,6})/i,
    /(\d{3,6})\s*(?:es\s*)?(?:mi|el|la)\s*(?:número|numero|nro|cuenta|factura|boleta)/i,
  ];

  let accountNumber: string | null = null;
  let confidence: "high" | "medium" | "low" = "low";

  // Buscar número de cuenta con patrones de alta confianza
  for (const pattern of highConfidencePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const number = match[1].trim();
      // Validar que sea un número razonable (3-6 dígitos)
      if (number.length >= 3 && number.length <= 6 && /^\d+$/.test(number)) {
        accountNumber = number;
        confidence = "high";
        break;
      }
    }
  }

  // Si no se encontró con patrones de alta confianza, buscar con patrones de confianza media
  if (!accountNumber) {
    const mediumConfidencePatterns = [
      /(?:mi|el|la|número|numero|cuenta|factura|boleta).*?(\d{4,6})/i,
      /(?:factura|boleta).*?(\d{4,6})/i,
      /(?:cuenta|número|numero).*?(\d{4,6})/i,
      /(\d{4,6}).*?(?:factura|boleta|cuenta)/i,
    ];

    for (const pattern of mediumConfidencePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const number = match[1].trim();
        // Solo aceptar números de 4-6 dígitos para confianza media
        if (number.length >= 4 && number.length <= 6 && /^\d+$/.test(number)) {
          accountNumber = number;
          confidence = "medium";
          break;
        }
      }
    }
  }

  // Si no se encontró con patrones, buscar cualquier número de 4-6 dígitos
  // PERO excluir años (20XX) y números que parezcan ser parte de direcciones
  if (!accountNumber) {
    // Buscar todos los números de 3-6 dígitos
    const allNumbers = message.match(/\b(\d{3,6})\b/g);
    if (allNumbers) {
      // Filtrar años (20XX)
      const nonYearNumbers = allNumbers.filter(
        (num) => !num.startsWith("20") || num.length !== 4
      );
      
      // Filtrar números que parezcan ser parte de direcciones
      // Si el número está precedido por palabras comunes de direcciones, es probable que sea una dirección
      const addressKeywords = [
        "calle", "avenida", "av", "ruta", "km", "barrio", "los", "las", "el", "la",
        "inmigrantes", "pajon", "valle", "dormida", "san", "jose", "jose", "número", "numero", "nro", "n°"
      ];
      
      const filteredNumbers = nonYearNumbers.filter((num, index) => {
        // Obtener el contexto alrededor del número
        const numIndex = message.indexOf(num);
        if (numIndex === -1) return true;
        
        const beforeContext = message.substring(Math.max(0, numIndex - 30), numIndex).toLowerCase();
        const afterContext = message.substring(numIndex + num.length, Math.min(message.length, numIndex + num.length + 30)).toLowerCase();
        const fullContext = beforeContext + " " + afterContext;
        
        // Si el número es de 3 dígitos y está cerca de palabras de dirección, probablemente es una dirección
        if (num.length === 3) {
          const hasAddressKeyword = addressKeywords.some(keyword => 
            fullContext.includes(keyword)
          );
          if (hasAddressKeyword) {
            console.log(`[INVOICE-DETECTOR] Número ${num} descartado: parece ser parte de una dirección`);
            return false;
          }
        }
        
        return true;
      });
      
      // Si hay números filtrados, usar el primero (pero con baja confianza si es de 3 dígitos)
      if (filteredNumbers.length > 0) {
        accountNumber = filteredNumbers[0];
        // Si el número es de 3 dígitos, es de baja confianza
        confidence = accountNumber.length === 3 ? "low" : "medium";
      } else if (nonYearNumbers.length > 0) {
        // Si todos fueron filtrados pero había números, usar el primero con muy baja confianza
        accountNumber = nonYearNumbers[0];
        confidence = "low";
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
    confidence,
  };
}

/**
 * Detecta si el mensaje contiene información de dirección/nombre pero no un número de cuenta válido
 * Esto indica que el usuario está intentando solicitar una factura con datos incorrectos
 */
export function detectAddressOrNameInsteadOfAccount(
  message: string
): {
  isAddressOrName: boolean;
  hasInvoiceRequest: boolean;
} {
  const lowerMessage = message.toLowerCase();
  
  // Palabras clave que indican solicitud de factura
  const invoiceKeywords = [
    "boleta", "factura", "recibo", "pasar", "enviar", "mandar",
    "necesito", "quiero", "podrían", "podrian", "pueden", "me pueden"
  ];
  
  // Palabras clave que indican dirección/nombre
  const addressKeywords = [
    "dpto", "depto", "departamento", "apartamento", "apto",
    "calle", "avenida", "av", "ruta", "km", "barrio",
    "domicilio", "dirección", "direccion", "dire", "vive", "vivo",
    "los", "las", "el", "la", "san", "jose", "jose", "inmigrantes",
    "pajon", "valle", "dormida"
  ];
  
  // Patrones para detectar nombres (dos o más palabras que parecen nombres propios)
  // Acepta nombres con o sin mayúsculas iniciales (por si el usuario escribe en minúsculas)
  const namePattern = /\b([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+)\b/;
  
  // También detectar nombres comunes en español (apellidos comunes)
  const commonSurnames = [
    "benitez", "benítez", "gonzalez", "gonzález", "rodriguez", "rodríguez",
    "fernandez", "fernández", "lopez", "lópez", "martinez", "martínez",
    "garcia", "garcía", "perez", "pérez", "sanchez", "sánchez", "ramirez", "ramírez"
  ];
  
  // Verificar si hay solicitud de factura
  const hasInvoiceRequest = invoiceKeywords.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  if (!hasInvoiceRequest) {
    return { isAddressOrName: false, hasInvoiceRequest: false };
  }
  
  // Verificar si hay palabras de dirección
  const hasAddressKeyword = addressKeywords.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  // Verificar si hay un patrón de nombre (dos o más palabras con mayúscula inicial)
  const nameMatch = message.match(namePattern);
  const hasNamePattern = nameMatch !== null;
  
  // Verificar si hay apellidos comunes
  const hasCommonSurname = commonSurnames.some(surname => 
    lowerMessage.includes(surname)
  );
  
  // Verificar si hay secuencias de palabras que parecen nombres (al menos 2 palabras consecutivas)
  // Esto captura casos como "Benítez Juan Daniel" incluso si están en minúsculas
  const words = message.split(/\s+/);
  let consecutiveNameWords = 0;
  for (let i = 0; i < words.length; i++) {
    const word = words[i].trim();
    // Si la palabra empieza con mayúscula o es un apellido común, podría ser un nombre
    if ((word.length > 2 && /^[A-ZÁÉÍÓÚÑ]/.test(word)) || 
        commonSurnames.some(s => word.toLowerCase().includes(s))) {
      consecutiveNameWords++;
      if (consecutiveNameWords >= 2) break;
    } else {
      consecutiveNameWords = 0;
    }
  }
  const hasNameLikeSequence = consecutiveNameWords >= 2;
  
  const hasName = hasNamePattern || hasCommonSurname || hasNameLikeSequence;
  
  // Verificar si hay "dpto", "depto" o "departamento" seguido de una letra o número
  const deptoPattern = /(?:dpto|depto|departamento)\s*[a-z0-9]/i;
  const hasDepto = deptoPattern.test(message);
  
  // Si hay solicitud de factura Y (dirección O nombre O depto) pero NO hay número de cuenta válido
  const invoiceRequest = detectInvoiceRequest(message);
  const hasValidAccountNumber = invoiceRequest.accountNumber !== null && 
                                 invoiceRequest.confidence !== "low";
  
  const isAddressOrName = hasInvoiceRequest && 
                          !hasValidAccountNumber && 
                          (hasAddressKeyword || hasName || hasDepto);
  
  console.log(`[INVOICE-DETECTOR] Detección de dirección/nombre:`);
  console.log(`  - Tiene solicitud de factura: ${hasInvoiceRequest}`);
  console.log(`  - Tiene palabra de dirección: ${hasAddressKeyword}`);
  console.log(`  - Tiene nombre: ${hasName}`);
  console.log(`  - Tiene depto: ${hasDepto}`);
  console.log(`  - Tiene número de cuenta válido: ${hasValidAccountNumber}`);
  console.log(`  - Es dirección/nombre: ${isAddressOrName}`);
  
  return {
    isAddressOrName,
    hasInvoiceRequest,
  };
}

