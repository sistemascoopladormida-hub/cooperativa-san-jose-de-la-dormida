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

  // Rechazar formato antiguo de matrícula (XX-XXXX-X o similar con guiones)
  const oldMatriculaPattern = /\b\d{1,2}[-–—]\d{3,4}[-–—]?[A-Z]?\b/i;
  if (oldMatriculaPattern.test(message)) {
    console.log(`[INVOICE-DETECTOR] Formato de matrícula antiguo detectado y rechazado. El formato XX-XXXX-X ya no es válido, se requiere número de cuenta de 3-4 dígitos.`);
    // No retornar null aquí, continuar para poder dar un mensaje de error apropiado
  }

  // Patrones para detectar solicitud de factura con alta confianza
  // Estos patrones requieren palabras clave relacionadas con facturas/cuentas
  // Solo aceptamos números de 3-4 dígitos (número de cuenta actual)
  const highConfidencePatterns = [
    /(?:número|numero|nro|cuenta)\s*(?:de\s*)?(?:cuenta|socio)?\s*:?\s*(\d{3,4})\b/i,
    /(?:factura|boleta)\s*(?:de|del|número|numero|nro)?\s*:?\s*(\d{3,4})\b/i,
    /(?:cuenta|socio)\s*:?\s*(\d{3,4})\b/i,
    /(\d{3,4})\s*(?:es\s*)?(?:mi|el|la)\s*(?:número|numero|nro|cuenta|factura|boleta)/i,
  ];

  let accountNumber: string | null = null;
  let confidence: "high" | "medium" | "low" = "low";

  // Buscar número de cuenta con patrones de alta confianza
  for (const pattern of highConfidencePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const number = match[1].trim();
      // Validar que sea un número de cuenta válido (3-4 dígitos solamente)
      if (number.length >= 3 && number.length <= 4 && /^\d+$/.test(number)) {
        accountNumber = number;
        confidence = "high";
        break;
      }
    }
  }

  // Si no se encontró con patrones de alta confianza, buscar con patrones de confianza media
  if (!accountNumber) {
    const mediumConfidencePatterns = [
      /(?:mi|el|la|número|numero|cuenta|factura|boleta).*?(\d{3,4})\b/i,
      /(?:factura|boleta).*?(\d{3,4})\b/i,
      /(?:cuenta|número|numero).*?(\d{3,4})\b/i,
      /(\d{3,4})\b.*?(?:factura|boleta|cuenta)/i,
    ];

    for (const pattern of mediumConfidencePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const number = match[1].trim();
        // Solo aceptar números de 3-4 dígitos para confianza media (número de cuenta)
        if (number.length >= 3 && number.length <= 4 && /^\d+$/.test(number)) {
          accountNumber = number;
          confidence = "medium";
          break;
        }
      }
    }
  }

  // Si no se encontró con patrones, buscar cualquier número de 3-4 dígitos
  // PERO excluir años (20XX) y números que parezcan ser parte de direcciones
  if (!accountNumber) {
    // Buscar todos los números de 3-4 dígitos (número de cuenta válido)
    const allNumbers = message.match(/\b(\d{3,4})\b/g);
    if (allNumbers) {
      // Filtrar años (20XX)
      const nonYearNumbers = allNumbers.filter(
        (num) => !num.startsWith("20") || num.length !== 4
      );
      
      // Filtrar números que parezcan ser parte de direcciones
      // Si el número está precedido por palabras comunes de direcciones, es probable que sea una dirección
      const addressKeywords = [
        "calle", "avenida", "av", "ruta", "km", "barrio", "los", "las", "el", "la",
        "inmigrantes", "pajon", "valle", "dormida", "san", "jose", "jose", "número", "numero", "nro", "n°",
        "pasaje", "pas", "pje", "dpto", "depto", "departamento", "apto", "apartamento",
        "casa", "villa", "manzana", "mza", "lote", "lt", "sector", "sect"
      ];
      
      const filteredNumbers = nonYearNumbers.filter((num) => {
        // Obtener el contexto alrededor del número
        const numIndex = message.toLowerCase().indexOf(num.toLowerCase());
        if (numIndex === -1) return true;
        
        const beforeContext = message.substring(Math.max(0, numIndex - 40), numIndex).toLowerCase();
        const afterContext = message.substring(numIndex + num.length, Math.min(message.length, numIndex + num.length + 40)).toLowerCase();
        const fullContext = beforeContext + " " + afterContext;
        
        // Si el número está cerca de palabras de dirección, probablemente es una dirección
        // Esto aplica para números de cualquier longitud (3-6 dígitos)
        const hasAddressKeyword = addressKeywords.some(keyword => {
          // Buscar la palabra clave cerca del número (dentro de 5 palabras antes o después)
          const keywordIndex = fullContext.indexOf(keyword);
          if (keywordIndex === -1) return false;
          
          // Verificar que la palabra clave esté cerca del número (dentro de 30 caracteres)
          const keywordPos = keywordIndex < beforeContext.length 
            ? keywordIndex 
            : beforeContext.length + (keywordIndex - beforeContext.length);
          const numPos = beforeContext.length;
          const distance = Math.abs(keywordPos - numPos);
          
          return distance < 30;
        });
        
        if (hasAddressKeyword) {
          console.log(`[INVOICE-DETECTOR] Número ${num} descartado: parece ser parte de una dirección`);
          return false;
        }
        
        // Verificar si el número está después de "dpto", "depto", "departamento" seguido de una letra
        const deptoPattern = /(?:dpto|depto|departamento)\s*[a-z]?\s*(\d{3,4})\b/i;
        const deptoMatch = message.match(deptoPattern);
        if (deptoMatch && deptoMatch[1] === num) {
          console.log(`[INVOICE-DETECTOR] Número ${num} descartado: parece ser número de departamento`);
          return false;
        }
        
        // Verificar si hay un patrón de dirección: palabra (nombre de calle/pasaje) seguida de número
        // Ejemplo: "pasaje toledo 515", "calle san martin 123"
        const addressPattern = /\b(?:pasaje|pas|pje|calle|avenida|av|ruta|barrio)\s+[a-záéíóúñ]+\s+(\d{3,4})\b/i;
        const addressMatch = message.match(addressPattern);
        if (addressMatch && addressMatch[1] === num) {
          console.log(`[INVOICE-DETECTOR] Número ${num} descartado: parece ser número de dirección (patrón calle/pasaje)`);
          return false;
        }
        
        // Verificar si hay un nombre propio (palabra con mayúscula) seguido de número
        // Esto captura casos como "Benítez Juan Daniel dpto B" donde el número podría ser parte de la dirección
        const nameBeforeNumberPattern = /\b([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+)\s+(?:dpto|depto|departamento)\s*[a-z]?\s*(\d{3,4})\b/i;
        const nameBeforeNumberMatch = message.match(nameBeforeNumberPattern);
        if (nameBeforeNumberMatch && nameBeforeNumberMatch[2] === num) {
          console.log(`[INVOICE-DETECTOR] Número ${num} descartado: aparece después de un nombre y dpto`);
          return false;
        }
        
        return true;
      });
      
      // Si hay números filtrados, usar el primero (son todos de 3-4 dígitos, número de cuenta válido)
      if (filteredNumbers.length > 0) {
        accountNumber = filteredNumbers[0];
        // Todos los números son válidos (3-4 dígitos), usar confianza media
        confidence = "medium";
      } else if (nonYearNumbers.length > 0) {
        // Si todos fueron filtrados pero había números, usar el primero con baja confianza
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

  // Detectar mes - mejorar para capturar "mes pasado", "del mes", etc.
  const monthPattern =
    /(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i;
  const monthMatch = message.match(monthPattern);
  let month = monthMatch ? monthMatch[1].toLowerCase() : undefined;

  // Si no se encontró mes específico, verificar si dice "mes pasado" o similar
  if (!month) {
    const lowerMessage = message.toLowerCase();
    if (/(?:mes\s+pasado|del\s+mes\s+pasado|el\s+mes\s+pasado)/i.test(message)) {
      // Calcular el mes pasado
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const monthNames = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
      ];
      month = monthNames[lastMonth.getMonth()];
      console.log(`[INVOICE-DETECTOR] Mes pasado detectado: ${month}`);
    } else if (/(?:mes\s+anterior|del\s+mes\s+anterior|el\s+mes\s+anterior)/i.test(message)) {
      // Calcular el mes anterior (igual que mes pasado)
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const monthNames = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
      ];
      month = monthNames[lastMonth.getMonth()];
      console.log(`[INVOICE-DETECTOR] Mes anterior detectado: ${month}`);
    }
  }

  // Detectar año
  const yearPattern = /(20\d{2})/;
  const yearMatch = message.match(yearPattern);
  let year = yearMatch ? yearMatch[1] : undefined;

  // Si se detectó "mes pasado" o similar, también calcular el año si es necesario
  if (!year && month && /(?:mes\s+pasado|mes\s+anterior)/i.test(message)) {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    year = lastMonth.getFullYear().toString();
  }

  return {
    accountNumber,
    month,
    year,
    type,
    confidence,
  };
}

/**
 * Detecta si el mensaje contiene una solicitud de factura pero con dirección/nombre
 * en lugar de número de cuenta válido
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
    "necesito", "quiero", "podrían", "podrian", "pueden", "me pueden",
    "me podrían", "me podrian", "podrías", "podrias", "puedes", "me puedes"
  ];
  
  // Palabras clave que indican dirección
  const addressKeywords = [
    "dpto", "depto", "departamento", "apartamento", "apto",
    "calle", "avenida", "av", "ruta", "km", "barrio",
    "domicilio", "dirección", "direccion", "dire", "vive", "vivo",
    "pasaje", "pas", "pje", "casa", "villa", "manzana", "mza", "lote", "lt",
    "sector", "sect", "los", "las", "el", "la", "san", "jose",
    "inmigrantes", "pajon", "valle", "dormida", "toledo"
  ];
  
  // Patrones para detectar nombres propios (dos o más palabras con mayúscula inicial)
  const namePattern = /\b([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+)\b/;
  
  // Apellidos comunes en español
  const commonSurnames = [
    "benitez", "benítez", "gonzalez", "gonzález", "rodriguez", "rodríguez",
    "fernandez", "fernández", "lopez", "lópez", "martinez", "martínez",
    "garcia", "garcía", "perez", "pérez", "sanchez", "sánchez", "ramirez", "ramírez",
    "torres", "flores", "rivera", "gomez", "gómez", "diaz", "díaz", "reyes", "cruz"
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
  
  // Verificar si hay secuencias de palabras que parecen nombres
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
  const deptoPattern = /(?:dpto|depto|departamento)\s*[a-z]/i;
  const hasDepto = deptoPattern.test(message);
  
  // Verificar si hay un formato de matrícula antiguo (XX-XXXX-X) que debe ser rechazado
  const oldMatriculaPattern = /\b\d{1,2}[-–—]\d{3,4}[-–—]?[A-Z]?\b/i;
  const hasOldMatricula = oldMatriculaPattern.test(message);
  
  // Verificar si hay un número de cuenta válido (3-4 dígitos, con confianza alta o media)
  const invoiceRequest = detectInvoiceRequest(message);
  const hasValidAccountNumber = invoiceRequest.accountNumber !== null && 
                                 (invoiceRequest.confidence === "high" || invoiceRequest.confidence === "medium") &&
                                 !hasOldMatricula;
  
  // Si hay solicitud de factura Y (dirección O nombre O depto O matrícula antigua) pero NO hay número de cuenta válido
  const isAddressOrName = hasInvoiceRequest && 
                          !hasValidAccountNumber && 
                          (hasAddressKeyword || hasName || hasDepto || hasOldMatricula);
  
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

