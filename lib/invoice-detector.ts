/** Normaliza typos comunes que impiden detectar solicitudes de factura */
function normalizeForInvoiceDetection(text: string): string {
  return text
    .replace(/\bcuebta\b/gi, "cuenta")
    .replace(/\bcunta\b/gi, "cuenta");
}

/**
 * Detecta si el mensaje contiene una solicitud de factura y extrae el número de cuenta
 * También detecta si se menciona un mes específico
 * Retorna un objeto con confidence que indica qué tan segura es la detección
 * AHORA RETORNA TODOS LOS NÚMEROS DE CUENTA MENCIONADOS
 */
export function detectInvoiceRequest(
  message: string
): {
  accountNumbers: string[]; // Múltiples números de cuenta
  accountNumber: string | null; // El primero para retrocompatibilidad
  month?: string;
  months?: string[];
  year?: string;
  type?: "servicios" | "electricidad";
  confidence: "high" | "medium" | "low";
} {
  const normalizedMessage = normalizeForInvoiceDetection(message);
  const lowerMessage = normalizedMessage.toLowerCase();

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
    // "cuenta numero 1979", "boleta de la cuenta numero 1979"
    /(?:cuenta|factura|boleta).*?(?:numero|número|nro)\s*(\d{3,4})\b/i,
    /(?:numero|número|nro)\s+(\d{3,4})\b/i,
  ];

  let accountNumbers: string[] = [];
  let accountNumber: string | null = null;
  let confidence: "high" | "medium" | "low" = "low";

  // Helper: excluir números que son parte de DNI (29.981.483 o 29981483)
  const isPartOfDni = (num: string): boolean => {
    const dniWithDots = message.match(/\d{1,2}\.\d{3}\.\d{3}/g) || [];
    if (dniWithDots.some((d) => d.includes(num))) return true;
    const longSeq = message.match(/\d{7,8}/g) || [];
    return longSeq.some((s) => s.includes(num));
  };

  // Buscar TODOS los números de cuenta con patrones de alta confianza
  const foundHighConfidenceNumbers = new Set<string>();

  // Prioridad máxima: formatos explícitos de cuenta/socio (evita tomar el año como cuenta)
  const explicitAccountPatterns = [
    /(?:mi\s+)?(?:cuenta|socio)\s*(?:de\s+cuenta|de\s+socio)?\s*(?::|es)?\s*(\d{3,4})\b/gi,
    /(?:número|numero|nro)\s*(?:de\s+)?(?:cuenta|socio)\s*(?::|es)?\s*(\d{3,4})\b/gi,
  ];
  for (const pattern of explicitAccountPatterns) {
    const matches = [...normalizedMessage.matchAll(pattern)];
    for (const match of matches) {
      if (match && match[1]) {
        const number = match[1].trim();
        if (number.length >= 3 && number.length <= 4 && /^\d+$/.test(number) && !isPartOfDni(number)) {
          foundHighConfidenceNumbers.add(number);
          confidence = "high";
        }
      }
    }
  }

  for (const pattern of highConfidencePatterns) {
    const matches = [...normalizedMessage.matchAll(new RegExp(pattern.source, pattern.flags + 'g'))];
    for (const match of matches) {
      if (match && match[1]) {
        const number = match[1].trim();
        if (number.length >= 3 && number.length <= 4 && /^\d+$/.test(number) && !isPartOfDni(number)) {
          foundHighConfidenceNumbers.add(number);
          confidence = "high";
        }
      }
    }
  }

  // Si se encontraron números con alta confianza, usarlos
  if (foundHighConfidenceNumbers.size > 0) {
    accountNumbers = Array.from(foundHighConfidenceNumbers);
    accountNumber = accountNumbers[0]; // El primero para retrocompatibilidad
  }

  // Si no se encontró con patrones de alta confianza, buscar con patrones de confianza media
  if (accountNumbers.length === 0) {
    const mediumConfidencePatterns = [
      /(?:mi|el|la|número|numero|cuenta|factura|boleta).*?(\d{3,4})\b/i,
      /(?:factura|boleta).*?(\d{3,4})\b/i,
      /(?:cuenta|número|numero).*?(\d{3,4})\b/i,
      /(\d{3,4})\b.*?(?:factura|boleta|cuenta)/i,
    ];

    const foundMediumConfidenceNumbers = new Set<string>();
    for (const pattern of mediumConfidencePatterns) {
      const matches = [...normalizedMessage.matchAll(new RegExp(pattern.source, pattern.flags + 'g'))];
      for (const match of matches) {
        if (match && match[1]) {
          const number = match[1].trim();
          if (number.length >= 3 && number.length <= 4 && /^\d+$/.test(number) && !isPartOfDni(number)) {
            foundMediumConfidenceNumbers.add(number);
            confidence = "medium";
          }
        }
      }
    }

    if (foundMediumConfidenceNumbers.size > 0) {
      accountNumbers = Array.from(foundMediumConfidenceNumbers);
      accountNumber = accountNumbers[0]; // El primero para retrocompatibilidad
    }
  }

  // Si no se encontró con patrones, buscar cualquier número de 3-4 dígitos
  // PERO excluir años (20XX) y números que parezcan ser parte de direcciones
  if (!accountNumber) {
    // Buscar todos los números de 3-4 dígitos (número de cuenta válido)
    const allNumbers = normalizedMessage.match(/\b(\d{3,4})\b/g);
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
        // Excluir números que son parte de un DNI (formato XX.XXX.XXX ej: 29.981.483)
        // El DNI NO es el número de cuenta - evita enviar facturas incorrectas
        const dniWithDotsPattern = /\d{1,2}\.\d{3}\.\d{3}/g;
        const dniMatches = message.match(dniWithDotsPattern) || [];
        for (const dni of dniMatches) {
          if (dni.includes(num)) {
            console.log(`[INVOICE-DETECTOR] Número ${num} descartado: es parte de un DNI (${dni})`);
            return false;
          }
        }
        // Excluir números dentro de secuencias de 7-8 dígitos (DNI sin puntos)
        const longDigitSequence = message.match(/\d{7,8}/g) || [];
        for (const seq of longDigitSequence) {
          if (seq.includes(num)) {
            console.log(`[INVOICE-DETECTOR] Número ${num} descartado: es parte de secuencia larga (${seq}), probable DNI`);
            return false;
          }
        }

        // Obtener el contexto alrededor del número
        const numIndex = message.toLowerCase().indexOf(num.toLowerCase());
        if (numIndex === -1) return true;
        
        const beforeContext = message.substring(Math.max(0, numIndex - 40), numIndex).toLowerCase();
        const afterContext = message.substring(numIndex + num.length, Math.min(message.length, numIndex + num.length + 40)).toLowerCase();
        const fullContext = beforeContext + " " + afterContext;
        
        // Verificar si hay palabras clave de factura cerca del número
        // Si hay palabras de factura, es muy probable que sea un número de cuenta, no una dirección
        const invoiceKeywords = [
          "factura", "boleta", "recibo", "cuenta", "socio", "servicio", "servicios",
          "electricidad", "energía", "energia", "luz", "internet", "cable", "tv",
          "número", "numero", "nro", "n°", "de la cuenta", "de cuenta", "cuenta número",
          "cuenta numero", "cuenta nro", "mes", "período", "periodo", "del mes"
        ];
        
        const hasInvoiceKeyword = invoiceKeywords.some(keyword => {
          const keywordIndex = fullContext.indexOf(keyword);
          if (keywordIndex === -1) return false;
          
          // Verificar que la palabra clave esté cerca del número (dentro de 50 caracteres)
          const keywordPos = keywordIndex < beforeContext.length 
            ? keywordIndex 
            : beforeContext.length + (keywordIndex - beforeContext.length);
          const numPos = beforeContext.length;
          const distance = Math.abs(keywordPos - numPos);
          
          return distance < 50;
        });
        
        // También verificar si hay un mes mencionado en el mensaje completo
        // Si hay un mes, es muy probable que sea una solicitud de factura
        const monthPattern = /(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i;
        const hasMonth = monthPattern.test(message);
        
        // Si hay palabras clave de factura O un mes mencionado, NO descartar como dirección
        if (hasInvoiceKeyword || hasMonth) {
          console.log(`[INVOICE-DETECTOR] Número ${num} NO descartado: ${hasInvoiceKeyword ? 'hay palabras clave de factura' : 'hay mes mencionado'} cerca`);
          // Continuar con las otras verificaciones pero no descartar por dirección
        } else {
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
        }
        
        // Verificar si el número está después de "dpto", "depto", "departamento" seguido de una letra
        const deptoPattern = /(?:dpto|depto|departamento)\s*[a-z]?\s*(\d{3,4})\b/i;
        const deptoMatch = message.match(deptoPattern);
        if (deptoMatch && deptoMatch[1] === num) {
          console.log(`[INVOICE-DETECTOR] Número ${num} descartado: parece ser número de departamento`);
          return false;
        }
        
        // Verificar si hay un patrón de dirección: calle/pasaje + nombre(s) + número
        // Ejemplos: "pasaje toledo 515", "calle san martin 123", "calle eva perón 621"
        const addressPatternSingle = /\b(?:pasaje|pas|pje|calle|avenida|av|ruta|barrio)\s+[a-záéíóúñ]+\s+(\d{3,4})\b/i;
        const addressPatternMulti = /\b(?:pasaje|pas|pje|calle|avenida|av|ruta|barrio)\s+[\wáéíóúñ\s]+\s+(\d{3,4})\b/i;
        const addressMatch = message.match(addressPatternSingle) || message.match(addressPatternMulti);
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
      
      // Si hay números filtrados, usar TODOS (son todos de 3-4 dígitos, número de cuenta válido)
      if (filteredNumbers.length > 0) {
        accountNumbers = filteredNumbers;
        accountNumber = accountNumbers[0]; // El primero para retrocompatibilidad
        // Todos los números son válidos (3-4 dígitos), usar confianza media
        confidence = "medium";
      } else if (nonYearNumbers.length > 0) {
        // Si todos fueron filtrados pero había números, usar todos con baja confianza
        accountNumbers = nonYearNumbers;
        accountNumber = accountNumbers[0];
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

  // Detectar mes(es) - captura "enero y febrero", "enero, febrero", etc.
  const monthPattern =
    /(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/gi;
  const monthMatches = normalizedMessage.match(monthPattern);
  const monthsFromName = monthMatches
    ? [...new Set(monthMatches.map((m) => m.toLowerCase()))]
    : [];

  // Detectar período numérico:
  // período 1=enero, 2=febrero, ..., 12=diciembre
  const monthNamesByPeriod = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ] as const;
  const periodPattern = /(?:periodo|período)\s*(?:n[°ºo]\.?\s*)?(0?[1-9]|1[0-2])\b/gi;
  const monthsFromPeriod = [
    ...new Set(
      [...normalizedMessage.matchAll(periodPattern)].map((match) => {
        const period = Number(match[1]);
        return monthNamesByPeriod[period - 1];
      })
    ),
  ];

  const months = [...new Set([...monthsFromName, ...monthsFromPeriod])];
  let month = months[0]; // Primer mes para retrocompatibilidad

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
    accountNumbers: accountNumbers.length > 0 ? accountNumbers : (accountNumber ? [accountNumber] : []),
    accountNumber,
    month,
    months,
    year,
    type,
    confidence,
  };
}

/**
 * Detecta si el mensaje tiene INTENCIÓN EXPLÍCITA de solicitar una factura.
 * Mensajes como "hola", "gracias", "te desconfiguraste" NO deben procesarse como factura
 * aunque haya números de cuenta en el contexto de conversación.
 */
export function hasInvoiceRequestIntent(message: string): boolean {
  const normalized = normalizeForInvoiceDetection(message);
  const trimmed = normalized.trim();
  if (!trimmed) return false;

  const lower = trimmed.toLowerCase();

  // Mensajes que NUNCA son solicitud de factura (saludos, quejas, etc.)
  const nonInvoicePhrases = [
    /^hola\s*!?\.?$/i,
    /^hola\s*,\s*$/i,
    /^buenos?\s*(días|dias|tardes|noches)\s*!?\.?$/i,
    /^buenas?\s*(días|dias|tardes|noches)\s*!?\.?$/i,
    /^gracias\s*!?\.?$/i,
    /^te\s+desconfiguraste[\s!.]*$/i,
    /^ok\s*!?\.?$/i,
    /^sí\s*!?\.?$/i,
    /^si\s*!?\.?$/i,
    /^no\s*!?\.?$/i,
    /^chau\s*!?\.?$/i,
    /^adiós\s*!?\.?$/i,
    /^de\s+nada\s*!?\.?$/i,
    /^genial\s*!?\.?$/i,
    /^perfecto\s*!?\.?$/i,
    /^entendido\s*!?\.?$/i,
  ];

  if (nonInvoicePhrases.some((p) => p.test(trimmed))) {
    return false;
  }

  // Palabras clave de factura explícitas
  const hasInvoiceKeyword = /\b(?:factura|facturas|boleta|boletas|recibo|recibos)\b/i.test(
    trimmed
  );

  // Continuación explícita: "enviamela", "dale" (cuando pide enviar factura)
  const hasContinuationKeyword =
    /\b(?:enviamela|envíamela|mandamela|mandámela|sí\s+dale|si\s+dale|dale)\b/i.test(
      trimmed
    ) && trimmed.split(/\s+/).length <= 3; // Solo si es mensaje corto

  // "cuenta X" o "número X" con número de 3-4 dígitos
  const hasAccountWithNumber =
    /(?:cuenta|numero|número|nro|socio)\s*(?:de\s+cuenta|de\s+socio)?\s*(?::|es)?\s*\d{3,4}\b/i.test(trimmed) ||
    /\b\d{3,4}\s*(?:es\s+)?(?:mi|el|la)\s*(?:cuenta|factura|boleta)/i.test(
      trimmed
    );

  // Mensaje es SOLO un número de 3-4 dígitos (continuación enviando cuenta)
  const isOnlyAccountNumber = /^\d{3,4}\s*!?\.?$/.test(trimmed);

  // Solicitud explícita: quiero/necesito + factura/boleta/cuenta
  const hasExplicitRequest =
    /\b(?:quiero|necesito|pasar|enviar|mandar|dame|pásame|pasame|podrías|podrias|puedes)\b/i.test(
      trimmed
    ) &&
    /\b(?:factura|boleta|recibo|cuenta)\b/i.test(trimmed);

  return (
    hasInvoiceKeyword ||
    (hasContinuationKeyword && trimmed.length < 50) ||
    hasAccountWithNumber ||
    isOnlyAccountNumber ||
    hasExplicitRequest
  );
}

/**
 * Detecta si un mensaje es una pregunta informativa sobre facturas (no una solicitud)
 */
function isInformationalQuestion(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  
  // Patrones que indican preguntas informativas
  const informationalPatterns = [
    /(?:están|estan|está|esta)\s+disponibles/i,
    /(?:cuándo|cuando|qué|que)\s+(?:están|estan|está|esta|estan disponibles)/i,
    /(?:ya\s+)?(?:están|estan|está|esta)\s+(?:las\s+)?facturas/i,
    /(?:hay|existen)\s+(?:facturas|boletas|recibos)/i,
    /(?:disponible|disponibilidad)/i,
    /(?:cuando|cuándo)\s+(?:se|las|están|estan)/i,
    /(?:en\s+)?qué\s+fecha/i,
    /(?:para\s+cuándo|para cuando)/i,
  ];
  
  return informationalPatterns.some(pattern => pattern.test(message));
}

/**
 * Detecta si el usuario pide AYUDA para encontrar/obtener el número de cuenta.
 * Ej: "cómo hago para tener el número de cuenta", "dónde encuentro el número"
 */
export function isAccountNumberHelpQuestion(text: string): boolean {
  const dniPattern = /\d{1,2}\.\d{3}\.\d{3}/;
  const hasValidAccountNumber =
    /\b(\d{3,4})\b/.test(text) &&
    !/\b20\d{2}\b/.test(text) &&
    !dniPattern.test(text);
  if (hasValidAccountNumber) return false;

  const helpPatterns = [
    /cómo\s+hago\s+para\s+(?:tener|obtener|conseguir|saber)/i,
    /cómo\s+(?:obtengo|obtener|conseguir|tener|saber)\s+(?:el\s+)?(?:número|numero|nro)\s+de\s+cuenta/i,
    /(?:dónde|donde)\s+(?:está|esta|encontrar|busco|encuentro)\s+(?:el\s+)?(?:número|numero|nro)\s+de\s+cuenta/i,
    /(?:dónde|donde)\s+(?:está|esta)\s+el\s+(?:número|numero|nro)\s+de\s+cuenta/i,
    /(?:ubicación|ubicacion|encontrar|buscar)\s+.*(?:número|numero|cuenta|factura|boleta)/i,
    /no\s+(?:encuentro|lo\s+encuentro|sé|se|lo\s+veo)\s+.*(?:número|numero|cuenta|factura)/i,
    /(?:número|numero|nro)\s+de\s+cuenta\s+de\s+(?:la\s+)?(?:boleta|factura)/i,
    /(?:cómo|como)\s+.*(?:número|numero|cuenta)\s+.*(?:boleta|factura|luz|internet|cable)/i,
  ];
  return helpPatterns.some((p) => p.test(text));
}

/**
 * Detecta si el usuario indica que la factura enviada es incorrecta.
 */
export function isWrongInvoiceFeedback(text: string): boolean {
  const patterns = [
    /esa\s+no\s+es\s+mi\s+(?:boleta|factura)/i,
    /no\s+es\s+mi\s+(?:boleta|factura)/i,
    /esa\s+(?:boleta|factura)\s+no\s+es\s+(?:mía|mia)/i,
    /(?:boleta|factura)\s+incorrecta/i,
    /(?:me\s+)?enviaron\s+(?:la\s+)?(?:boleta|factura)\s+equivocada/i,
    /no\s+es\s+la\s+correcta/i,
  ];
  return patterns.some((p) => p.test(text.trim()));
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
  
  // Si es una pregunta informativa, NO es una solicitud de factura
  if (isInformationalQuestion(message)) {
    return { isAddressOrName: false, hasInvoiceRequest: false };
  }
  
  // Palabras clave que indican solicitud REAL de factura (no preguntas)
  // Incluye respuestas de continuación: "Enviamela", "Dale", "Sí enviámela"
  const invoiceRequestKeywords = [
    "pasar", "enviar", "mandar", "dar", "entregar", "enviarme", "mandarme",
    "necesito", "quiero", "quiero que", "me gustaría", "me gustaria",
    "podrían", "podrian", "pueden", "me pueden", "me podrían", "me podrian",
    "podrías", "podrias", "puedes", "me puedes", "podrías", "podrias",
    "dame", "dame la", "pásame", "pasame", "envíame", "envíame",
    "solicito", "solicitar",
    "enviamela", "envíamela", "mandamela", "mandámela", "dale", "sí dale"
  ];
  
  // Verificar si hay solicitud REAL de factura (no solo menciona la palabra "factura")
  const hasInvoiceRequest = invoiceRequestKeywords.some(keyword => 
    lowerMessage.includes(keyword)
  ) || (
    // También considerar solicitud si dice "factura de" o "boleta de" seguido de algo específico
    (lowerMessage.includes("factura") || lowerMessage.includes("boleta") || lowerMessage.includes("recibo")) &&
    (lowerMessage.includes("de") || lowerMessage.includes("del") || /\d{3,4}/.test(message))
  );
  
  if (!hasInvoiceRequest) {
    return { isAddressOrName: false, hasInvoiceRequest: false };
  }
  
  // Palabras clave que indican dirección (excluir "la", "el", "los", "las" - demasiado comunes en "la boleta", "la cuenta")
  const addressKeywords = [
    "dpto", "depto", "departamento", "apartamento", "apto",
    "calle", "avenida", "av", "ruta", "km", "barrio",
    "domicilio", "dirección", "direccion", "dire", "vive", "vivo",
    "pasaje", "pas", "pje", "casa", "villa", "manzana", "mza", "lote", "lt",
    "sector", "sect", "san jose", "inmigrantes", "pajon", "valle", "dormida", "toledo"
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
  const hasValidAccountNumber = invoiceRequest.accountNumbers.length > 0 && 
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

