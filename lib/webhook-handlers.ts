import { readFile } from "fs/promises";
import { join } from "path";
import {
  detectInvoiceRequest,
  detectAddressOrNameInsteadOfAccount,
  hasInvoiceRequestIntent,
} from "@/lib/invoice-detector";
import {
  isNewServiceRequest,
  NEW_SERVICE_DERIVATION_MESSAGE,
} from "@/lib/service-request-detector";
import {
  isServiceOutageComplaint,
  SERVICE_OUTAGE_RESPONSE,
} from "@/lib/service-outage-detector";
import { findInvoiceInDrive, downloadPDFFromDrive } from "@/lib/drive";
import { sendDocumentMessage, sendImageMessage } from "@/lib/whatsapp";
import { sendTextMessage } from "./whatsapp-messages";
import {
  getOrCreateConversation,
  saveMessage,
  getRecentMessages,
} from "@/lib/conversations";
import {
  getInvoiceRequestCountThisMonth,
  recordInvoiceRequest,
  canRequestMoreInvoices,
  MAX_INVOICES_PER_MONTH,
} from "@/lib/invoices";
import { getChatbotResponse } from "@/lib/chatbot";

const WHATSAPP_API_VERSION = "v22.0";

/**
 * Detecta si el usuario pregunta dónde está el número de cuenta.
 * NO debe coincidir cuando el usuario ya proporcionó un número de cuenta (ej: "boleta cuenta 1979").
 */
function isAccountNumberQuestion(text: string): boolean {
  // Si el mensaje ya contiene un número de cuenta (3-4 dígitos, no año 20XX), es una solicitud, no una pregunta
  const hasAccountNumber = /\b(\d{3,4})\b/.test(text) &&
    !/\b20\d{2}\b/.test(text); // Excluir años 2000-2099
  if (hasAccountNumber) {
    return false;
  }
  const accountNumberQuestionPattern =
    /(dónde|donde|donde está|dónde está|ubicación|ubicacion|encontrar|buscar|no encuentro|no lo encuentro|no sé|no se|no lo veo|no lo ve|dónde lo encuentro|donde lo encuentro|dónde lo busco|donde lo busco|dónde está el número|donde esta el numero|dónde está el numero|donde esta el número|número de cuenta|numero de cuenta|cuenta).*(número|numero|cuenta|factura)/i;
  return accountNumberQuestionPattern.test(text);
}

/**
 * Maneja la pregunta sobre dónde está el número de cuenta
 */
async function handleAccountNumberQuestion(
  from: string,
  text: string,
  whatsappMessageId: string
): Promise<boolean> {
  if (!isAccountNumberQuestion(text)) {
    return false;
  }

  console.log("[WEBHOOK] Usuario pregunta dónde está el número de cuenta");

  try {
    // Leer la imagen desde public/images
    const imagePath = join(
      process.cwd(),
      "public",
      "images",
      "ubicacion de numero de cuenta.jpeg"
    );
    const imageBuffer = await readFile(imagePath);

    // Enviar la imagen con un mensaje explicativo
    const imageCaption = `📋 El número de cuenta aparece en dos lugares de tu factura:\n\n1️⃣ En la parte superior, debajo del nombre del titular, como "Cuenta: XXXX"\n2️⃣ En la parte inferior, en la sección "DATOS PARA INGRESAR A LA WEB"\n\nEs un número de 3 a 4 dígitos.`;

    const imageResult = await sendImageMessage(from, imageBuffer, imageCaption);

    if (imageResult.success) {
      // Guardar en historial
      try {
        const conversationId = await getOrCreateConversation(from);
        await saveMessage(conversationId, "user", text, whatsappMessageId);
        await saveMessage(conversationId, "assistant", imageCaption);
      } catch (dbError) {
        console.error("Error guardando en BD:", dbError);
      }
      return true;
    } else {
      console.error("[WEBHOOK] Error enviando imagen:", imageResult.error);
      // Si falla, enviar mensaje de texto como respaldo
      const fallbackMessage = `📋 El número de cuenta aparece en dos lugares de tu factura:\n\n1️⃣ En la parte superior, debajo del nombre del titular, como "Cuenta: XXXX"\n2️⃣ En la parte inferior, en la sección "DATOS PARA INGRESAR A LA WEB"\n\nEs un número de 3 a 4 dígitos.`;
      await sendTextMessage(from, fallbackMessage);

      try {
        const conversationId = await getOrCreateConversation(from);
        await saveMessage(conversationId, "user", text, whatsappMessageId);
        await saveMessage(conversationId, "assistant", fallbackMessage);
      } catch (dbError) {
        console.error("Error guardando en BD:", dbError);
      }
      return true;
    }
  } catch (error: any) {
    console.error("[WEBHOOK] Error leyendo/enviando imagen:", error);
    // Respuesta de texto como respaldo
    const fallbackMessage = `📋 El número de cuenta se encuentra en la parte superior de tu factura, identificado como "Cuenta: XXX" o "Cuenta: XXXX" (de 3 a 4 dígitos).\n\n⚠️ *IMPORTANTE:* El formato antiguo de matrícula (como "54-0556-A") ya NO es válido. Ahora necesitas el número de cuenta de 3 o 4 dígitos.\n\nEstá ubicado justo después del nombre del cliente. Si tienes una factura física o PDF, búscalo en la sección de información del cliente.`;
    await sendTextMessage(from, fallbackMessage);

    try {
      const conversationId = await getOrCreateConversation(from);
      await saveMessage(conversationId, "user", text, whatsappMessageId);
      await saveMessage(conversationId, "assistant", fallbackMessage);
    } catch (dbError) {
      console.error("Error guardando en BD:", dbError);
    }
    return true;
  }
}

/**
 * Envía la imagen que muestra dónde encontrar el número de cuenta
 */
async function sendAccountNumberImage(
  from: string,
  text: string,
  whatsappMessageId: string,
  message?: string
): Promise<void> {
  try {
    const imagePath = join(
      process.cwd(),
      "public",
      "images",
      "ubicacion de numero de cuenta.jpeg"
    );
    const imageBuffer = await readFile(imagePath);

    const imageCaption = message || `📋 Para poder enviarte tu factura, necesito tu número de cuenta.\n\nEl número de cuenta aparece en dos lugares de tu factura:\n\n1️⃣ En la parte superior, debajo del nombre del titular, como "Cuenta: XXXX"\n2️⃣ En la parte inferior, en la sección "DATOS PARA INGRESAR A LA WEB"\n\nEs un número de 3 a 4 dígitos. En la imagen puedes ver dónde encontrarlo.`;

    const imageResult = await sendImageMessage(from, imageBuffer, imageCaption);

    if (imageResult.success) {
      // Guardar en historial
      try {
        const conversationId = await getOrCreateConversation(from);
        await saveMessage(conversationId, "user", text, whatsappMessageId);
        await saveMessage(conversationId, "assistant", imageCaption);
      } catch (dbError) {
        console.error("Error guardando en BD:", dbError);
      }
    } else {
      console.error("[WEBHOOK] Error enviando imagen:", imageResult.error);
      // Si falla, enviar mensaje de texto como respaldo
      const fallbackMessage = `📋 Para poder enviarte tu factura, necesito tu número de cuenta.\n\nEl número de cuenta aparece en dos lugares de tu factura:\n\n1️⃣ En la parte superior, debajo del nombre del titular, como "Cuenta: XXXX"\n2️⃣ En la parte inferior, en la sección "DATOS PARA INGRESAR A LA WEB"\n\nEs un número de 3 a 4 dígitos.`;
      await sendTextMessage(from, fallbackMessage);

      try {
        const conversationId = await getOrCreateConversation(from);
        await saveMessage(conversationId, "user", text, whatsappMessageId);
        await saveMessage(conversationId, "assistant", fallbackMessage);
      } catch (dbError) {
        console.error("Error guardando en BD:", dbError);
      }
    }
  } catch (error: any) {
    console.error("[WEBHOOK] Error leyendo/enviando imagen:", error);
    // Respuesta de texto como respaldo
    const fallbackMessage = `📋 Para poder enviarte tu factura, necesito que me indiques tu número de cuenta.\n\n⚠️ *IMPORTANTE:* El número de cuenta debe tener 3 o 4 dígitos solamente. El formato antiguo de matrícula (como "54-0556-A") ya NO es válido.\n\nEl número de cuenta aparece en la sección "DATOS PARA INGRESAR A LA WEB" de tu factura, identificado como "Nro Cuenta: XXX" o "Nro Cuenta: XXXX" (de 3 a 4 dígitos).\n\nPor favor, envíame tu solicitud con el formato:\n"Me puede pasar boleta de luz, número de cuenta: 2862"`;
    await sendTextMessage(from, fallbackMessage);

    try {
      const conversationId = await getOrCreateConversation(from);
      await saveMessage(conversationId, "user", text, whatsappMessageId);
      await saveMessage(conversationId, "assistant", fallbackMessage);
    } catch (dbError) {
      console.error("Error guardando en BD:", dbError);
    }
  }
}

/**
 * Detecta si el usuario pide que le envíen la factura/boleta por WhatsApp.
 * Caso típico: usuarios que responden encuestas de Meta y piden recibir la factura por WhatsApp.
 */
function isInvoiceViaWhatsAppRequest(text: string): boolean {
  const lower = text.toLowerCase().trim();
  const hasInvoiceWord = /\b(factura|facturas|boleta|boletas|recibo|recibos)\b/i.test(lower);
  const hasWhatsAppRef = /\b(whatsapp|por\s+whatsapp|en\s+whatsapp)\b/i.test(lower);
  const hasSendRequest = /\b(enviar|enviarme|envíenme|envienme|mandar|mandarme|recibir|que\s+me\s+envíen|que\s+me\s+manden)\b/i.test(lower);

  // Pide factura/boleta Y menciona WhatsApp (con o sin verbo de envío)
  return (hasInvoiceWord && hasWhatsAppRef) || (hasSendRequest && hasInvoiceWord && hasWhatsAppRef);
}

/**
 * Maneja la solicitud de recibir factura por WhatsApp (ej: desde encuestas de Meta).
 * Responde que están trabajando en habilitar esa opción.
 */
async function handleInvoiceViaWhatsAppRequest(
  from: string,
  text: string,
  whatsappMessageId: string
): Promise<boolean> {
  if (!isInvoiceViaWhatsAppRequest(text)) {
    return false;
  }

  const response =
    `Gracias por tu interés. 🙏\n\n` +
    `Estamos trabajando para poder enviar las facturas por WhatsApp. Te avisaremos cuando esta opción esté disponible.\n\n` +
    `Mientras tanto, puedes:\n` +
    `• Retirar tus facturas en los boxes de atención al público\n` +
    `• Revisar tu correo electrónico (las enviamos por email)\n` +
    `• Solicitar tu factura desde el chatbot de nuestra web con tu número de cuenta\n\n` +
    `¿Alguna otra consulta? Estoy aquí para ayudarte 😊`;

  await sendTextMessage(from, response);
  try {
    const conversationId = await getOrCreateConversation(from);
    await saveMessage(conversationId, "user", text, whatsappMessageId);
    await saveMessage(conversationId, "assistant", response);
  } catch (dbError) {
    console.error("Error guardando en BD:", dbError);
  }
  console.log("[WEBHOOK] Usuario pidió factura por WhatsApp (encuesta Meta): respuesta enviada");
  return true;
}

/**
 * Maneja una solicitud de factura
 */
async function handleInvoiceRequest(
  from: string,
  text: string,
  whatsappMessageId: string
): Promise<boolean> {
  // Si no hay intención explícita de factura (ej: "hola", "te desconfiguraste"),
  // NO procesar como factura → dejar que el chatbot responda de forma humana
  if (!hasInvoiceRequestIntent(text)) {
    console.log(
      `[WEBHOOK] Sin intención de factura en mensaje: "${text.substring(0, 50)}..." → derivando a chatbot`
    );
    return false;
  }

  // Primero verificar si el usuario está enviando dirección/nombre en lugar de número de cuenta
  const addressOrNameCheck = detectAddressOrNameInsteadOfAccount(text);
  
  if (addressOrNameCheck.isAddressOrName) {
    console.log(
      `[WEBHOOK] ⚠️ Usuario envió dirección/nombre en lugar de número de cuenta. Enviando imagen de ayuda.`
    );
    await sendAccountNumberImage(
      from,
      text,
      whatsappMessageId,
      `📋 Para poder enviarte tu factura, necesito tu número de cuenta (no el domicilio ni el nombre).\n\nEl número de cuenta aparece en dos lugares de tu factura:\n\n1️⃣ En la parte superior, debajo del nombre del titular, como "Cuenta: XXXX"\n2️⃣ En la parte inferior, en la sección "DATOS PARA INGRESAR A LA WEB"\n\nEs un número de 3 a 4 dígitos. En la imagen puedes ver dónde encontrarlo.`
    );
    return true;
  }
  
  // Obtener el contexto de la conversación para números mencionados anteriormente
  let conversationContext: string[] = [];
  try {
    const conversationId = await getOrCreateConversation(from);
    const recentMessages = await getRecentMessages(conversationId, 10); // Últimos 10 mensajes (para capturar número en conversaciones previas)
    
    // Extraer todos los números de cuenta mencionados en los mensajes anteriores del usuario
    const previousAccountNumbers = new Set<string>();
    for (const msg of recentMessages) {
      if (msg.role === "user") {
        const prevRequest = detectInvoiceRequest(msg.content);
        for (const num of prevRequest.accountNumbers) {
          previousAccountNumbers.add(num);
        }
      }
    }
    conversationContext = Array.from(previousAccountNumbers);
    console.log(`[WEBHOOK] 📝 Contexto de conversación: números mencionados anteriormente:`, conversationContext);
  } catch (error) {
    console.error("[WEBHOOK] Error obteniendo contexto de conversación:", error);
  }

  const invoiceRequest = detectInvoiceRequest(text);
  console.log("[WEBHOOK] Mensaje recibido:", text);
  console.log(
    "[WEBHOOK] Solicitud de factura detectada:",
    JSON.stringify(invoiceRequest)
  );

  // Combinar números del mensaje actual con el contexto
  const allAccountNumbers = new Set<string>();
  for (const num of invoiceRequest.accountNumbers) {
    allAccountNumbers.add(num);
  }
  for (const num of conversationContext) {
    allAccountNumbers.add(num);
  }
  const combinedAccountNumbers = Array.from(allAccountNumbers);
  
  console.log(`[WEBHOOK] 🔢 Números de cuenta a intentar:`, combinedAccountNumbers);

  if (combinedAccountNumbers.length === 0) {
    return false;
  }

  // Actualizar invoiceRequest con todos los números combinados
  invoiceRequest.accountNumbers = combinedAccountNumbers;
  invoiceRequest.accountNumber = combinedAccountNumbers[0]; // Primero para retrocompatibilidad

  // Si el usuario especificó un mes pero no un año, inferir el año correcto
  // Si estamos en enero 2026 y piden noviembre o diciembre, debe ser 2025
  if (invoiceRequest.month && !invoiceRequest.year) {
    const now = new Date();
    const currentYearNum = now.getFullYear();
    const currentMonthNum = now.getMonth() + 1; // 1-12
    
    const monthNames = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    const requestedMonthNum = monthNames.indexOf(invoiceRequest.month.toLowerCase()) + 1;
    
    console.log(`[WEBHOOK] 📅 Inferencia de año: mes solicitado=${requestedMonthNum} (${invoiceRequest.month}), mes actual=${currentMonthNum}, año actual=${currentYearNum}`);
    
    // Si estamos en enero y piden noviembre o diciembre, debe ser el año anterior
    if (currentMonthNum === 1 && (requestedMonthNum === 11 || requestedMonthNum === 12)) {
      invoiceRequest.year = (currentYearNum - 1).toString();
      console.log(`[WEBHOOK] 📅 Año inferido (caso enero): ${invoiceRequest.month} ${invoiceRequest.year}`);
    } else if (requestedMonthNum > currentMonthNum) {
      // Si el mes solicitado es mayor que el mes actual, debe ser del año anterior
      invoiceRequest.year = (currentYearNum - 1).toString();
      console.log(`[WEBHOOK] 📅 Año inferido (mes futuro): ${invoiceRequest.month} ${invoiceRequest.year} (${requestedMonthNum} > ${currentMonthNum})`);
    } else {
      // Por defecto, usar el año actual
      invoiceRequest.year = currentYearNum.toString();
      console.log(`[WEBHOOK] 📅 Año inferido (por defecto): ${invoiceRequest.month} ${invoiceRequest.year}`);
    }
  } else if (invoiceRequest.month && invoiceRequest.year) {
    console.log(`[WEBHOOK] 📅 Año ya especificado: ${invoiceRequest.month} ${invoiceRequest.year}`);
  }

  // Si tenemos números del contexto o del mensaje actual, intentar buscar primero
  // Solo mostrar imagen de ayuda si realmente no hay números válidos para intentar
  const hasMonthOrType = invoiceRequest.month || invoiceRequest.type;
  
  // Si la confianza es baja Y NO hay mes/tipo Y no hay números del contexto, enviar imagen explicativa
  // Pero si hay números del contexto o del mensaje actual, intentar buscar primero
  if (combinedAccountNumbers.length === 0 && invoiceRequest.confidence === "low" && !hasMonthOrType) {
    console.log(
      `[WEBHOOK] ⚠️ Confianza baja y no hay números de cuenta detectados. Enviando imagen de ayuda.`
    );
    await sendAccountNumberImage(
      from,
      text,
      whatsappMessageId,
      `📋 No estoy seguro de haber identificado correctamente tu número de cuenta.\n\nEl número de cuenta aparece en dos lugares de tu factura:\n\n1️⃣ En la parte superior, debajo del nombre del titular, como "Cuenta: XXXX"\n2️⃣ En la parte inferior, en la sección "DATOS PARA INGRESAR A LA WEB"\n\nEs un número de 3 a 4 dígitos. En la imagen puedes ver dónde encontrarlo.`
    );
    return true;
  }
  
  // Si la confianza es baja pero hay números para intentar, subir la confianza a media para intentar buscar
  if (combinedAccountNumbers.length > 0 && invoiceRequest.confidence === "low" && hasMonthOrType) {
    console.log(`[WEBHOOK] ⚠️ Confianza baja pero hay mes/tipo mencionado, subiendo confianza a media para intentar búsqueda`);
    invoiceRequest.confidence = "medium";
  }

  // Verificar límite de facturas por mes (máximo 5)
  const canRequest = await canRequestMoreInvoices(from);
  if (!canRequest) {
    const currentCount = await getInvoiceRequestCountThisMonth(from);
    const limitMessage =
      `⚠️ Has alcanzado el límite máximo de ${MAX_INVOICES_PER_MONTH} facturas por mes (solicitudes este mes: ${currentCount}).\n\n` +
      `Para solicitar más facturas, por favor contacta con nuestra oficina de administración al 3521-401330.\n\n` +
      `¿Tienes alguna otra consulta? Estoy aquí para ayudarte 😊`;

    await sendTextMessage(from, limitMessage);
    try {
      const conversationId = await getOrCreateConversation(from);
      await saveMessage(conversationId, "user", text, whatsappMessageId);
      await saveMessage(conversationId, "assistant", limitMessage);
    } catch (dbError) {
      console.error("Error guardando en BD:", dbError);
    }
    console.log(
      `[WEBHOOK] ⚠️ Usuario ${from} bloqueado: límite de ${MAX_INVOICES_PER_MONTH} facturas alcanzado (${currentCount} este mes)`
    );
    return true;
  }

  // Es una solicitud de factura - Intentar buscar con TODOS los números mencionados
  console.log(
    `[WEBHOOK] Buscando factura para cuentas: ${combinedAccountNumbers.join(", ")}, mes: ${invoiceRequest.month || "no especificado"}, año: ${
      invoiceRequest.year || "no especificado"
    }, confianza: ${invoiceRequest.confidence}`
  );

  try {
    let invoice = null;
    let lastAccountNumberAttempted = "";
    
    // Intentar buscar con cada número de cuenta hasta encontrar una factura
    for (const accountNum of combinedAccountNumbers) {
      lastAccountNumberAttempted = accountNum;
      console.log(`[WEBHOOK] 🔍 Intentando buscar factura con número de cuenta: ${accountNum}`);
      console.log(`[WEBHOOK] 🔍 Parámetros de búsqueda:`, {
        accountNumber: accountNum,
        month: invoiceRequest.month,
        year: invoiceRequest.year || 'NO ESPECIFICADO (se inferirá)',
        type: invoiceRequest.type || 'NO ESPECIFICADO (buscará en ambas)'
      });
      
      invoice = await findInvoiceInDrive(
        accountNum,
        invoiceRequest.month,
        invoiceRequest.year, // Puede ser undefined, drive.ts lo inferirá
        invoiceRequest.type
      );
      
      if (invoice) {
        console.log(
          `[WEBHOOK] ✅ Factura encontrada con número de cuenta ${accountNum}: ${invoice.fileName} (${invoice.type})`
        );
        break; // Si encontramos una factura, dejar de buscar
      } else {
        console.log(
          `[WEBHOOK] ❌ No se encontró factura con número de cuenta ${accountNum}`
        );
      }
    }

    if (invoice) {
      console.log(`[WEBHOOK] ✅ Factura encontrada, descargando PDF...`);
      // Descargar el PDF
      const pdfBuffer = await downloadPDFFromDrive(invoice.fileId);
      console.log(
        `[WEBHOOK] PDF descargado, tamaño: ${pdfBuffer.length} bytes`
      );

      // Enviar el PDF por WhatsApp
      const typeLabel =
        invoice.type === "servicios" ? "servicios" : "energía eléctrica";
      const caption = `Tu factura de ${typeLabel} - ${invoice.fileName}`;

      console.log(`[WEBHOOK] Enviando documento por WhatsApp...`);
      const docResult = await sendDocumentMessage(
        from,
        pdfBuffer,
        invoice.fileName,
        caption
      );
      console.log(
        `[WEBHOOK] Resultado envío documento:`,
        docResult.success ? "✅ Éxito" : `❌ Error: ${docResult.error}`
      );

      // Obtener conteo de facturas del mes actual ANTES de registrar esta nueva
      const invoiceCountBefore =
        await getInvoiceRequestCountThisMonth(from);
      console.log(
        `[WEBHOOK] Total de facturas enviadas a ${from} este mes (antes de esta): ${invoiceCountBefore}`
      );

      // Registrar la solicitud de factura solo si se envió exitosamente
      if (docResult.success) {
        await recordInvoiceRequest(
          from,
          invoiceRequest.accountNumber,
          invoice.fileName,
          invoiceRequest.month,
          invoiceRequest.year
        );
      }

      // El conteo después de registrar será invoiceCountBefore + 1
      const invoiceCountAfter =
        invoiceCountBefore + (docResult.success ? 1 : 0);

      // Enviar mensaje de confirmación
      let confirmationMessage = `✅ Te he enviado tu factura de ${typeLabel}.`;
      if (invoiceRequest.month) {
        confirmationMessage += `\n\n📅 Período: ${
          invoiceRequest.month
        }${invoiceRequest.year ? " " + invoiceRequest.year : ""}`;
      }
      confirmationMessage += `\n\n📄 Archivo: ${invoice.fileName}`;
      confirmationMessage += `\n\n💳 Puedes pagar esta factura desde la caja de cobro de la cooperativa o desde la app CoopOnline:`;
      confirmationMessage += `\nhttps://www.cooponlineweb.com.ar/SANJOSEDELADORMIDA/Login`;

      // Notificar desde la segunda factura sobre el límite de 5 por mes
      if (invoiceCountAfter >= 2) {
        confirmationMessage += `\n\n⚠️ *Recordatorio:* Hay un límite máximo de ${MAX_INVOICES_PER_MONTH} facturas por mes. Esta es tu factura número ${invoiceCountAfter} de este mes.`;
      }

      confirmationMessage += `\n\n¿Tienes alguna otra consulta sobre tu factura o algún otro servicio? Estoy aquí para ayudarte 😊`;

      await sendTextMessage(from, confirmationMessage);

      // Guardar en historial
      try {
        const conversationId = await getOrCreateConversation(from);
        await saveMessage(conversationId, "user", text, whatsappMessageId);
        await saveMessage(conversationId, "assistant", confirmationMessage);
      } catch (dbError) {
        console.error("Error guardando en BD:", dbError);
      }
    } else {
      // No se encontró la factura con ningún número - enviar imagen de ayuda
      const numbersAttempted = combinedAccountNumbers.join(", ");
      console.log(
        `[WEBHOOK] ❌ Factura no encontrada para ninguno de los números intentados: ${numbersAttempted}`
      );
      
      // Mensaje mejorado que menciona todos los números intentados
      let errorMessage = `❌ No pude encontrar tu factura con los siguientes números de cuenta: ${numbersAttempted}.\n\n`;
      errorMessage += `Por favor, verifica que el número de cuenta sea correcto. `;
      errorMessage += `El número de cuenta aparece en dos lugares de tu factura:\n\n`;
      errorMessage += `1️⃣ En la parte superior, debajo del nombre del titular, como "Cuenta: XXXX"\n`;
      errorMessage += `2️⃣ En la parte inferior, en la sección "DATOS PARA INGRESAR A LA WEB"\n\n`;
      errorMessage += `Es un número de 3 a 4 dígitos. En la imagen puedes ver dónde encontrarlo.\n\n`;
      errorMessage += `💡 *Tip:* Si mencionaste varios números, intenté buscar con todos ellos. `;
      errorMessage += `Si ninguno funcionó, verifica que estés usando el número de cuenta correcto de tu factura más reciente.\n\n`;
      errorMessage += `Si el problema persiste, puedes contactar con nuestra oficina al 3521-401330.`;
      
      // Enviar imagen mostrando dónde encontrar el número de cuenta
      await sendAccountNumberImage(
        from,
        text,
        whatsappMessageId,
        errorMessage
      );
    }
    return true;
  } catch (error: any) {
    console.error(
      "[WEBHOOK] ❌ Error procesando solicitud de factura:",
      error
    );
    if (error instanceof Error) {
      console.error(
        "[WEBHOOK] Error details:",
        error.message,
        error.stack
      );
    }
    const errorMessage = `⚠️ Hubo un error al buscar tu factura. Por favor, intenta de nuevo más tarde o contacta con nuestra oficina de administración al 3521-401330.`;

    await sendTextMessage(from, errorMessage);

    // Guardar en historial
    try {
      const conversationId = await getOrCreateConversation(from);
      await saveMessage(conversationId, "user", text, whatsappMessageId);
      await saveMessage(conversationId, "assistant", errorMessage);
    } catch (dbError) {
      console.error("Error guardando en BD:", dbError);
    }
    return true;
  }
}

/**
 * Procesa un mensaje de texto recibido del webhook
 */
export async function processTextMessage(
  from: string,
  text: string,
  whatsappMessageId: string
): Promise<void> {
  // 1. Verificar si pregunta sobre número de cuenta
  const handledAccountQuestion = await handleAccountNumberQuestion(
    from,
    text,
    whatsappMessageId
  );
  if (handledAccountQuestion) {
    return;
  }

  // 2. Verificar si es solicitud de alta de servicio (Internet, luz, TV, etc.)
  // Debe derivarse a Administración, NO al flujo de facturas
  if (isNewServiceRequest(text)) {
    console.log(
      "[WEBHOOK] Solicitud de alta de servicio detectada, derivando a Administración"
    );
    await sendTextMessage(from, NEW_SERVICE_DERIVATION_MESSAGE);
    try {
      const conversationId = await getOrCreateConversation(from);
      await saveMessage(conversationId, "user", text, whatsappMessageId);
      await saveMessage(
        conversationId,
        "assistant",
        NEW_SERVICE_DERIVATION_MESSAGE
      );
    } catch (dbError) {
      console.error("Error guardando en BD:", dbError);
    }
    return;
  }

  // 2.3. Verificar si es RECLAMO por corte de servicio (cable, luz, internet)
  // NO es solicitud de factura - el usuario reporta un problema con su dirección
  if (isServiceOutageComplaint(text)) {
    console.log(
      "[WEBHOOK] Reclamo por corte de servicio detectado, derivando a guardia/reclamos"
    );
    await sendTextMessage(from, SERVICE_OUTAGE_RESPONSE);
    try {
      const conversationId = await getOrCreateConversation(from);
      await saveMessage(conversationId, "user", text, whatsappMessageId);
      await saveMessage(
        conversationId,
        "assistant",
        SERVICE_OUTAGE_RESPONSE
      );
    } catch (dbError) {
      console.error("Error guardando en BD:", dbError);
    }
    return;
  }

  // 2.5. Verificar si pide factura por WhatsApp (ej: desde encuestas de Meta)
  const handledInvoiceViaWhatsApp = await handleInvoiceViaWhatsAppRequest(
    from,
    text,
    whatsappMessageId
  );
  if (handledInvoiceViaWhatsApp) {
    return;
  }

  // 3. Verificar si es solicitud de factura
  const handledInvoice = await handleInvoiceRequest(
    from,
    text,
    whatsappMessageId
  );
  if (handledInvoice) {
    return;
  }

  // 4. Procesar como mensaje normal del chatbot
  const chatbotResponse = await getChatbotResponse(
    from,
    text,
    whatsappMessageId
  );

  // Enviar respuesta a WhatsApp
  const sendResult = await sendTextMessage(from, chatbotResponse);

  // Guardar el mensaje de respuesta con su messageId
  if (sendResult.success && sendResult.messageId) {
    try {
      const conversationId = await getOrCreateConversation(from);
      await saveMessage(
        conversationId,
        "assistant",
        chatbotResponse,
        sendResult.messageId
      );
    } catch (dbError) {
      console.error("Error guardando mensaje de respuesta:", dbError);
    }
  }
}

