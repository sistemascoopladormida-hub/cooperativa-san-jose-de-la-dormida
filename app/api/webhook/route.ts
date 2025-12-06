import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";
import { detectInvoiceRequest } from "@/lib/invoice-detector";
import { findInvoiceInDrive, downloadPDFFromDrive } from "@/lib/drive";
import { sendDocumentMessage } from "@/lib/whatsapp";

// Configuración para Next.js 15
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Inicializar OpenAI (exactamente igual que en /api/chat)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Contexto de la Cooperativa La Dormida (igual que en /api/chat)
const cooperativeContext = `
INFORMACIÓN SOBRE COOPERATIVA LA DORMIDA:

Nombre: Cooperativa La Dormida
Ubicación: Av. Perón 557 - CP 5244, Córdoba, San José de la Dormida

CONTACTO:
- Teléfono: 3521-401330
- Email: sistemascoopladormida@gmail.com
- Horarios de atención: Lunes a Viernes de 7:00 a 12:00

TELÉFONOS DE GUARDIA 24/7:
- Ambulancia: 3521 406183
- Eléctrica: 3521 406186
- Internet: 3521 438313
- Administración: 3521 40130
- Sepelio: 3521 406189

SERVICIOS OFRECIDOS:
1. Electricidad:
   - Suministro eléctrico confiable las 24 horas del día
   - Tarifas preferenciales para socios
   - Atención técnica 24/7
   - Medidores inteligentes
   - Precio: Desde $8,500/mes

2. Internet:
   - Conexión de alta velocidad con fibra óptica
   - Velocidades hasta 100 Mbps
   - Fibra óptica hasta el hogar
   - Soporte técnico especializado
   - Sin límite de datos
   - Precio: Desde $4,200/mes

3. Televisión:
   - Amplia variedad de canales y entretenimiento
   - Más de 80 canales
   - Canales HD incluidos
   - Programación familiar
   - Servicio técnico gratuito
   - Precio: Desde $3,800/mes

4. Farmacia Social:
   - Medicamentos y productos de salud a precios accesibles
   - Descuentos especiales para socios
   - Medicamentos genéricos
   - Atención farmacéutica profesional
   - Entrega a domicilio
   - Descuentos hasta 40%

SERVICIOS SOCIALES:
- Servicios Fúnebres
- Eventos Sociales
- Asesoramiento Legal
- Descuentos Comerciales

BENEFICIOS PARA SOCIOS:
- Tarifas preferenciales para socios
- Atención personalizada y cercana
- Servicios sociales y beneficios especiales
- Más de 50 años de experiencia
- Compromiso con la comunidad local
- Tecnología moderna y confiable

PAGOS Y FACTURACIÓN:
- Los socios pueden pagar facturas a través de: https://www.cooponlineweb.com.ar/SANJOSEDELADORMIDA/Login
- Área de socios disponible en la página web

ESTADO DE FACTURAS Y BOLETAS:
- FACTURAS/BOLETAS DE SERVICIOS (P.F.C, Internet, WiFi, Cable, TV):
  * Ya están disponibles para retirar en los boxes de atención al público de la cooperativa
  * Fueron enviadas a las bandejas de correo electrónico de los socios
  * Período: Noviembre
  * Vencimientos:
    - Primer vencimiento: 10 de diciembre
    - Segundo vencimiento: 22 de diciembre
  * Medios de pago habilitados:
    - Caja de cobro (Efectivo, Tarjetas de crédito y débito)
    - App CoopOnline
    - IMPORTANTE: El pago mediante transferencia se encuentra INHABILITADO

- FACTURAS/BOLETAS DE ENERGÍA ELÉCTRICA:
  * Ya están disponibles
  * Fueron enviadas a las bandejas de correo electrónico de los socios
  * Período: Noviembre
  * Vencimientos:
    - Primer vencimiento: 12 de diciembre
    - Segundo vencimiento: 22 de diciembre

TURNERO DE FARMACIAS:
- 6 de diciembre: Farmacia Carreño
- 7 de diciembre: Farmacia Robledo
- 8 de diciembre: Farmacia Centro
- 9 de diciembre: Farmacia Social
- 10 de diciembre: Farmacia Carreño

ASOCIARSE:
- Los interesados pueden visitar la oficina o completar el formulario en la sección "Asociarse" de la página web

RECLAMOS:
- Los reclamos se pueden presentar a través de la sección "Reclamos" en la página web o contactando directamente

ENVÍO DE FACTURAS:
- Los usuarios pueden solicitar sus facturas proporcionando su número de cuenta
- El número de cuenta es un número de 3 a 6 dígitos que aparece en la factura
- FACTURAS DISPONIBLES: Las facturas están disponibles desde agosto 2025 en adelante (agosto, septiembre, octubre, noviembre, diciembre 2025, y meses siguientes)
- Los usuarios pueden solicitar facturas de CUALQUIER mes desde agosto 2025 en adelante
- Los usuarios pueden especificar el mes y año de la factura que desean (ej: "factura de noviembre 2025", "factura de agosto 2025", "factura de septiembre 2025")
- Si no especifican mes/año, se buscará en el mes actual o más reciente disponible
- Para meses anteriores a noviembre 2025 (agosto, septiembre, octubre 2025): las facturas de servicios y electricidad están juntas en una sola carpeta llamada "facturas-{mes}-{año}". El sistema buscará automáticamente en esta carpeta cuando el usuario solicite una factura de estos meses.
- Para noviembre 2025 en adelante: las facturas están separadas por tipo en carpetas "servicios-{mes}-{año}" y "electricidad-{mes}-{año}"
- Los usuarios pueden solicitar facturas de servicios o electricidad específicamente para noviembre 2025 en adelante. Para meses anteriores (agosto-octubre 2025), el sistema buscará en la carpeta general que contiene ambas.
- IMPORTANTE: El sistema puede buscar y enviar facturas de cualquier mes desde agosto 2025 en adelante, incluyendo agosto, septiembre, octubre, noviembre, diciembre 2025 y meses siguientes.
- Ejemplos de solicitudes válidas:
  * "Quiero mi factura, mi número de cuenta es 6370"
  * "Necesito la factura 239 de noviembre"
  * "Factura de electricidad número 1234"
  * "Boleta de servicios cuenta 5678 de diciembre 2025"
  * "Factura de agosto 2025, número de cuenta 4296"
  * "Quiero mi factura de septiembre, cuenta 7226"
  * "Factura de septiembre de energía eléctrica, cuenta 5368"
  * "Necesito mi factura de octubre 2025"

INSTRUCCIONES PARA EL ASISTENTE:
- Responde de forma amigable, profesional y humana
- Usa un tono cercano y empático
- Si no sabes algo, admítelo y sugiere contactar directamente
- Siempre proporciona información precisa basada en el contexto proporcionado
- Para emergencias, siempre menciona los números de guardia 24/7
- Mantén las respuestas concisas pero completas
- Estás respondiendo por WhatsApp, así que sé breve pero completo
- Cuando te pregunten por facturas o boletas (sin especificar tipo), SIEMPRE menciona AMBAS: las de servicios Y las de electricidad. Proporciona información completa sobre ambas:
  * FACTURAS/BOLETAS DE SERVICIOS (P.F.C, Internet, WiFi, Cable, TV): ya están disponibles para retirar en boxes y fueron enviadas por correo electrónico (período noviembre), vencimientos: 10 y 22 de diciembre. Medios de pago: caja de cobro con efectivo/tarjetas y App CoopOnline. IMPORTANTE: las transferencias están INHABILITADAS
  * FACTURAS/BOLETAS DE ENERGÍA ELÉCTRICA: ya están disponibles, fueron enviadas por correo electrónico (período noviembre), primer vencimiento: 12 de diciembre, segundo vencimiento: 22 de diciembre
- Si preguntan específicamente por un tipo de factura (servicios o electricidad), proporciona solo la información de ese tipo
- Cuando te pregunten sobre farmacias de turno, proporciona la información completa del turnero mostrando todas las fechas y farmacias correspondientes
- Cuando un usuario solicite su factura proporcionando su número de cuenta, confirma que buscarás y enviarás la factura. El sistema automáticamente buscará la factura en Google Drive y la enviará por WhatsApp. Las facturas disponibles son desde agosto 2025 en adelante (incluyendo agosto, septiembre, octubre, noviembre, diciembre 2025 y meses siguientes). NUNCA digas que las facturas solo están disponibles desde noviembre 2025, porque están disponibles desde agosto 2025. Si un usuario solicita una factura de agosto, septiembre u octubre 2025, confirma que la buscarás y enviarás. Si no se encuentra, informa al usuario amablemente y sugiere que verifique el número de cuenta, el mes/año, o contacte con la oficina.
`;

const WHATSAPP_API_VERSION = "v22.0";

/**
 * Obtiene o crea una conversación en Supabase
 */
async function getOrCreateConversation(phoneNumber: string): Promise<number> {
  // Buscar conversación existente
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("phone_number", phoneNumber)
    .single();

  if (existing) {
    return existing.id;
  }

  // Crear nueva conversación
  const { data: newConversation, error } = await supabase
    .from("conversations")
    .insert({ phone_number: phoneNumber })
    .select("id")
    .single();

  if (error || !newConversation) {
    console.error("Error creando conversación:", error);
    throw new Error("Error al crear conversación");
  }

  return newConversation.id;
}

/**
 * Guarda un mensaje en Supabase
 */
async function saveMessage(
  conversationId: number,
  role: "user" | "assistant",
  content: string,
  whatsappMessageId?: string
): Promise<void> {
  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    role,
    content,
    whatsapp_message_id: whatsappMessageId,
  });

  if (error) {
    console.error("Error guardando mensaje:", error);
  }
}

/**
 * Obtiene el historial de conversación desde Supabase
 */
async function getConversationHistory(
  phoneNumber: string
): Promise<Array<{ role: "user" | "assistant"; content: string }>> {
  try {
    const { data: conversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("phone_number", phoneNumber)
      .single();

    if (!conversation) {
      return [];
    }

    const { data: messages, error } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true })
      .limit(20);

    if (error) {
      console.error("Error obteniendo historial:", error);
      return [];
    }

    return (
      messages?.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })) || []
    );
  } catch (error) {
    console.error("Error en getConversationHistory:", error);
    return [];
  }
}

/**
 * Obtiene respuesta del chatbot usando OpenAI (igual que /api/chat)
 */
async function getChatbotResponse(
  from: string,
  userMessage: string,
  whatsappMessageId?: string
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return "Lo siento, el servicio de chat no está disponible en este momento. Por favor, contacta con nuestra oficina al 3521-401330.";
  }

  try {
    // Obtener historial desde Supabase
    const history = await getConversationHistory(from);

    const systemMessage = {
      role: "system" as const,
      content: `Eres un asistente virtual amigable y profesional de la Cooperativa La Dormida. Estás respondiendo por WhatsApp. Tu objetivo es ayudar a los usuarios con información sobre los servicios, horarios, contacto y más.

${cooperativeContext}

Responde siempre en español, de forma natural y conversacional. Sé empático, útil y profesional. Si el usuario pregunta algo que no está en la información proporcionada, admítelo honestamente y sugiere que contacten directamente con la cooperativa.`,
    };

    const messages = [
      systemMessage,
      ...history.slice(-10),
      { role: "user" as const, content: userMessage },
    ];

    // Llamar a OpenAI exactamente igual que en /api/chat
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const response =
      completion.choices[0]?.message?.content ||
      "Lo siento, no pude generar una respuesta en este momento.";

    // Guardar mensajes en Supabase
    try {
      const conversationId = await getOrCreateConversation(from);
      await saveMessage(conversationId, "user", userMessage, whatsappMessageId);
      // El messageId de la respuesta se guardará después de enviarla
    } catch (dbError) {
      console.error("Error guardando en base de datos:", dbError);
      // Continuar aunque falle el guardado en BD
    }

    return response;
  } catch (error: any) {
    console.error("Error en chatbot:", error);
    return "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo o contacta con nuestra oficina al 3521-401330.";
  }
}

/**
 * Envía un mensaje de texto a través de WhatsApp Cloud API
 */
async function sendTextMessage(
  to: string,
  text: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    return { success: false, error: "Configuración faltante" };
  }

  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneId}/messages`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: {
          body: text,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error enviando mensaje:", data.error || data);
      return {
        success: false,
        error: data.error?.message || "Error desconocido",
      };
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (error: any) {
    console.error("Error enviando mensaje:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Verifica la firma HMAC del webhook
 */
function verifySignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !signatureHeader) {
    return true;
  }

  const hash = signatureHeader.replace("sha256=", "");
  const expectedHash = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash));
}

/**
 * Handler GET para verificación del webhook
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (!verifyToken) {
    return NextResponse.json(
      { error: "Configuración faltante" },
      { status: 500 }
    );
  }

  if (mode === "subscribe" && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Token inválido" }, { status: 403 });
}

/**
 * Handler POST para recibir eventos del webhook
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signatureHeader = request.headers.get("x-hub-signature-256");

    if (!verifySignature(rawBody, signatureHeader)) {
      return NextResponse.json({ error: "Firma inválida" }, { status: 403 });
    }

    const body = JSON.parse(rawBody);

    // Procesar mensajes
    if (body.entry && Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const value = change.value;
          if (value.messages && Array.isArray(value.messages)) {
            for (const message of value.messages) {
              if (message.type === "text") {
                const from = message.from;
                const text = message.text?.body || "";
                const whatsappMessageId = message.id;

                // Detectar si es una solicitud de factura
                const invoiceRequest = detectInvoiceRequest(text);
                console.log("[WEBHOOK] Mensaje recibido:", text);
                console.log(
                  "[WEBHOOK] Solicitud de factura detectada:",
                  JSON.stringify(invoiceRequest)
                );

                if (invoiceRequest.accountNumber) {
                  // Es una solicitud de factura
                  console.log(
                    `[WEBHOOK] Buscando factura para cuenta: ${
                      invoiceRequest.accountNumber
                    }, mes: ${
                      invoiceRequest.month || "no especificado"
                    }, año: ${invoiceRequest.year || "no especificado"}`
                  );
                  try {
                    // Buscar la factura en Google Drive
                    const invoice = await findInvoiceInDrive(
                      invoiceRequest.accountNumber,
                      invoiceRequest.month,
                      invoiceRequest.year
                    );
                    console.log(
                      "[WEBHOOK] Resultado de búsqueda en Drive:",
                      invoice
                        ? `Encontrada: ${invoice.fileName} (${invoice.type})`
                        : "No encontrada"
                    );

                    if (invoice) {
                      console.log(
                        `[WEBHOOK] ✅ Factura encontrada, descargando PDF...`
                      );
                      // Descargar el PDF
                      const pdfBuffer = await downloadPDFFromDrive(
                        invoice.fileId
                      );
                      console.log(
                        `[WEBHOOK] PDF descargado, tamaño: ${pdfBuffer.length} bytes`
                      );

                      // Enviar el PDF por WhatsApp
                      const typeLabel =
                        invoice.type === "servicios"
                          ? "servicios"
                          : "energía eléctrica";
                      const caption = `Tu factura de ${typeLabel} - ${invoice.fileName}`;

                      console.log(
                        `[WEBHOOK] Enviando documento por WhatsApp...`
                      );
                      const docResult = await sendDocumentMessage(
                        from,
                        pdfBuffer,
                        invoice.fileName,
                        caption
                      );
                      console.log(
                        `[WEBHOOK] Resultado envío documento:`,
                        docResult.success
                          ? "✅ Éxito"
                          : `❌ Error: ${docResult.error}`
                      );

                      // Enviar mensaje de confirmación
                      let confirmationMessage = `✅ Te he enviado tu factura de ${typeLabel}.`;
                      if (invoiceRequest.month) {
                        confirmationMessage += `\n\n📅 Período: ${
                          invoiceRequest.month
                        }${
                          invoiceRequest.year ? " " + invoiceRequest.year : ""
                        }`;
                      }
                      confirmationMessage += `\n\n📄 Archivo: ${invoice.fileName}`;

                      await sendTextMessage(from, confirmationMessage);

                      // Guardar en historial
                      try {
                        const conversationId = await getOrCreateConversation(
                          from
                        );
                        await saveMessage(
                          conversationId,
                          "user",
                          text,
                          whatsappMessageId
                        );
                        await saveMessage(
                          conversationId,
                          "assistant",
                          confirmationMessage
                        );
                      } catch (dbError) {
                        console.error("Error guardando en BD:", dbError);
                      }
                    } else {
                      // No se encontró la factura
                      console.log(
                        `[WEBHOOK] ❌ Factura no encontrada para cuenta ${invoiceRequest.accountNumber}`
                      );
                      const notFoundMessage =
                        `❌ No pude encontrar tu factura con el número de cuenta ${invoiceRequest.accountNumber}.` +
                        `\n\nPor favor verifica que el número de cuenta sea correcto.` +
                        `\n\nSi el problema persiste, puedes contactar con nuestra oficina al 3521-401330.`;

                      await sendTextMessage(from, notFoundMessage);

                      // Guardar en historial
                      try {
                        const conversationId = await getOrCreateConversation(
                          from
                        );
                        await saveMessage(
                          conversationId,
                          "user",
                          text,
                          whatsappMessageId
                        );
                        await saveMessage(
                          conversationId,
                          "assistant",
                          notFoundMessage
                        );
                      } catch (dbError) {
                        console.error("Error guardando en BD:", dbError);
                      }
                    }
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
                    const errorMessage = `⚠️ Hubo un error al buscar tu factura. Por favor, intenta de nuevo más tarde o contacta con nuestra oficina al 3521-401330.`;

                    await sendTextMessage(from, errorMessage);

                    // Guardar en historial
                    try {
                      const conversationId = await getOrCreateConversation(
                        from
                      );
                      await saveMessage(
                        conversationId,
                        "user",
                        text,
                        whatsappMessageId
                      );
                      await saveMessage(
                        conversationId,
                        "assistant",
                        errorMessage
                      );
                    } catch (dbError) {
                      console.error("Error guardando en BD:", dbError);
                    }
                  }
                } else {
                  // No es solicitud de factura, procesar normalmente
                  // Obtener respuesta del chatbot (igual que /api/chat)
                  const chatbotResponse = await getChatbotResponse(
                    from,
                    text,
                    whatsappMessageId
                  );

                  // Enviar respuesta a WhatsApp
                  const sendResult = await sendTextMessage(
                    from,
                    chatbotResponse
                  );

                  // Guardar el mensaje de respuesta con su messageId
                  if (sendResult.success && sendResult.messageId) {
                    try {
                      const conversationId = await getOrCreateConversation(
                        from
                      );
                      await saveMessage(
                        conversationId,
                        "assistant",
                        chatbotResponse,
                        sendResult.messageId
                      );
                    } catch (dbError) {
                      console.error(
                        "Error guardando mensaje de respuesta:",
                        dbError
                      );
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ status: "received" });
  } catch (error: any) {
    console.error("Error en webhook:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
