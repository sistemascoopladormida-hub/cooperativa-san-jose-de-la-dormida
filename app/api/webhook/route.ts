import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import OpenAI from 'openai'

// Configuración para Next.js 15 - necesario para leer el body como texto
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Inicializar OpenAI para el chatbot
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Contexto de la Cooperativa La Dormida (mismo que usa el chatbot web)
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

4. Programa PFC:
   - Traslados en ambulancia para urgencias
   - Servicio de sepelio completo
   - Análisis clínicos y estudios de laboratorio
   - Servicio óptico (un par por año)
   - Elementos ortopédicos
   - Consultorios externos: ginecología, fisioterapia, alergista, nutricionista, pedicura, psicología y diabetología
   - Taller interdisciplinario (fonoaudiología, psicopedagogía, psicología y maestra integradora) para niños y adultos mayores

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

ASOCIARSE:
- Los interesados pueden visitar la oficina o completar el formulario en la sección "Asociarse" de la página web

RECLAMOS:
- Los reclamos se pueden presentar a través de la sección "Reclamos" en la página web o contactando directamente

INSTRUCCIONES PARA EL ASISTENTE:
- Responde de forma amigable, profesional y humana
- Usa un tono cercano y empático
- Si no sabes algo, admítelo y sugiere contactar directamente
- Siempre proporciona información precisa basada en el contexto proporcionado
- Para emergencias, siempre menciona los números de guardia 24/7
- Mantén las respuestas concisas pero completas
- Estás respondiendo por WhatsApp, así que sé breve pero completo
`

// Almacenamiento de historial de conversación por número de teléfono
// TODO: En producción, usar base de datos (Redis, PostgreSQL, etc.)
const conversationHistory = new Map<string, Array<{ role: 'user' | 'assistant'; content: string }>>()

/**
 * Obtiene respuesta del chatbot usando OpenAI
 * @param from - Número de teléfono del usuario
 * @param userMessage - Mensaje del usuario
 * @returns Respuesta del chatbot
 */
async function getChatbotResponse(from: string, userMessage: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return 'Lo siento, el servicio de chat no está disponible en este momento. Por favor, contacta con nuestra oficina al 3521-401330.'
  }

  try {
    // Obtener historial de conversación (últimos 10 mensajes)
    const history = conversationHistory.get(from) || []
    
    // Construir mensaje del sistema con contexto
    const systemMessage = {
      role: 'system' as const,
      content: `Eres un asistente virtual amigable y profesional de la Cooperativa La Dormida. Estás respondiendo por WhatsApp. Tu objetivo es ayudar a los usuarios con información sobre los servicios, horarios, contacto y más.

${cooperativeContext}

Responde siempre en español, de forma natural y conversacional. Sé empático, útil y profesional. Si el usuario pregunta algo que no está en la información proporcionada, admítelo honestamente y sugiere que contacten directamente con la cooperativa. Mantén las respuestas concisas pero completas, ya que es WhatsApp.`
    }

    // Preparar mensajes para OpenAI
    const messages = [
      systemMessage,
      ...history.slice(-10), // Últimos 10 mensajes del historial
      { role: 'user' as const, content: userMessage },
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    })

    const response = completion.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta en este momento.'

    // Guardar en historial
    const updatedHistory = [
      ...history,
      { role: 'user' as const, content: userMessage },
      { role: 'assistant' as const, content: response },
    ].slice(-20) // Mantener máximo 20 mensajes en historial

    conversationHistory.set(from, updatedHistory)

    return response
  } catch (error: any) {
    console.error('CHATBOT_ERROR:', error)
    return 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo o contacta con nuestra oficina al 3521-401330.'
  }
}

/**
 * Webhook para WhatsApp Cloud API de Meta
 * 
 * Este endpoint maneja:
 * - Verificación del webhook (GET)
 * - Recepción de eventos y mensajes (POST)
 * 
 * Variables de entorno requeridas:
 * - WHATSAPP_VERIFY_TOKEN: Token para verificar el webhook
 * - WHATSAPP_TOKEN: Access Token de WhatsApp Cloud API
 * - WHATSAPP_PHONE_NUMBER_ID: Phone Number ID
 * - WHATSAPP_APP_SECRET: (Opcional) Secret para verificar firma HMAC
 * - FACTURAS_DIR: (Opcional) Ruta donde están las facturas locales
 */

const WHATSAPP_API_VERSION = 'v22.0'

/**
 * Verifica la firma HMAC del webhook para asegurar que viene de Meta
 * @param rawBody - Body raw del request
 * @param signatureHeader - Header x-hub-signature-256
 * @returns true si la firma es válida
 */
function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET
  if (!secret || !signatureHeader) {
    // Si no hay secret configurado, no verificamos (solo para desarrollo)
    console.warn('WEBHOOK_WARNING: WHATSAPP_APP_SECRET no configurado, saltando verificación de firma')
    return true
  }

  // El header viene como "sha256=hash"
  const hash = signatureHeader.replace('sha256=', '')
  const expectedHash = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')

  const isValid = crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(expectedHash)
  )

  if (!isValid) {
    console.error('WEBHOOK_ERROR: Firma HMAC inválida')
  }

  return isValid
}

/**
 * Envía un mensaje de texto a través de WhatsApp Cloud API
 * @param to - Número de teléfono destino (formato internacional sin +)
 * @param text - Texto del mensaje
 * @returns Resultado de la operación
 */
async function sendTextMessage(to: string, text: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const token = process.env.WHATSAPP_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!token || !phoneId) {
    console.error('SEND_MESSAGE_ERROR: WHATSAPP_TOKEN o WHATSAPP_PHONE_NUMBER_ID no configurados')
    return { success: false, error: 'Configuración faltante' }
  }

  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneId}/messages`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
          body: text,
        },
      }),
      // Timeout de 10 segundos
      signal: AbortSignal.timeout(10000),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('SEND_MESSAGE_ERROR:', {
        status: response.status,
        error: data.error || data,
        to,
      })
      return { success: false, error: data.error?.message || 'Error desconocido' }
    }

    console.log('SEND_MESSAGE_OK:', {
      messageId: data.messages?.[0]?.id,
      to,
    })

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    }
  } catch (error: any) {
    console.error('SEND_MESSAGE_ERROR:', {
      error: error.message,
      to,
    })

    // Reintento simple con backoff
    if (error.name !== 'AbortError') {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const retryResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: to,
            type: 'text',
            text: {
              body: text,
            },
          }),
          signal: AbortSignal.timeout(10000),
        })

        const retryData = await retryResponse.json()
        if (retryResponse.ok) {
          console.log('SEND_MESSAGE_OK (retry):', {
            messageId: retryData.messages?.[0]?.id,
            to,
          })
          return {
            success: true,
            messageId: retryData.messages?.[0]?.id,
          }
        }
      } catch (retryError) {
        console.error('SEND_MESSAGE_ERROR (retry failed):', retryError)
      }
    }

    return { success: false, error: error.message }
  }
}

/**
 * Envía un documento (PDF) a través de WhatsApp Cloud API
 * @param to - Número de teléfono destino
 * @param documentUrl - URL pública del documento
 * @param caption - Texto opcional que acompaña el documento
 * @returns Resultado de la operación
 */
async function sendDocumentMessage(
  to: string,
  documentUrl: string,
  caption?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const token = process.env.WHATSAPP_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!token || !phoneId) {
    console.error('SEND_DOCUMENT_ERROR: WHATSAPP_TOKEN o WHATSAPP_PHONE_NUMBER_ID no configurados')
    return { success: false, error: 'Configuración faltante' }
  }

  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneId}/messages`

  try {
    const payload: any = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'document',
      document: {
        link: documentUrl,
      },
    }

    if (caption) {
      payload.document.caption = caption
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000), // Más tiempo para documentos
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('SEND_DOCUMENT_ERROR:', {
        status: response.status,
        error: data.error || data,
        to,
      })
      return { success: false, error: data.error?.message || 'Error desconocido' }
    }

    console.log('SEND_DOCUMENT_OK:', {
      messageId: data.messages?.[0]?.id,
      to,
    })

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    }
  } catch (error: any) {
    console.error('SEND_DOCUMENT_ERROR:', {
      error: error.message,
      to,
    })
    return { success: false, error: error.message }
  }
}

/**
 * Busca el PDF de factura para un número de teléfono
 * TODO: Implementar búsqueda real en base de datos o sistema de archivos
 * @param from - Número de teléfono del usuario
 * @returns Información del PDF encontrado o error
 */
async function findPdfForNumber(from: string): Promise<{ ok: boolean; url?: string; path?: string; reason?: string }> {
  console.log('FIND_PDF: Buscando factura para', from)

  // TODO: Implementar búsqueda real
  // Opción 1: Buscar en carpeta local
  // const facturasDir = process.env.FACTURAS_DIR || './facturas'
  // const pdfPath = path.join(facturasDir, `${from}.pdf`)
  // if (fs.existsSync(pdfPath)) {
  //   return { ok: true, path: pdfPath }
  // }

  // Opción 2: Llamar a endpoint interno
  // try {
  //   const response = await fetch(`${process.env.INTERNAL_API_URL}/api/facturas/lookup?phone=${from}`)
  //   const data = await response.json()
  //   if (data.pdfUrl) {
  //     return { ok: true, url: data.pdfUrl }
  //   }
  // } catch (error) {
  //   console.error('FIND_PDF_ERROR:', error)
  // }

  // Por ahora, stub que siempre retorna no encontrado
  return {
    ok: false,
    reason: 'no_pdf',
  }
}

/**
 * Obtiene el saldo de un usuario
 * TODO: Implementar consulta real a base de datos
 * @param from - Número de teléfono del usuario
 * @returns Saldo o error
 */
async function getBalanceForNumber(from: string): Promise<{ ok: boolean; balance?: number; reason?: string }> {
  console.log('GET_BALANCE: Consultando saldo para', from)

  // TODO: Implementar consulta real
  // const response = await fetch(`${process.env.INTERNAL_API_URL}/api/usuarios/saldo?phone=${from}`)
  // const data = await response.json()
  // return { ok: true, balance: data.saldo }

  return {
    ok: false,
    reason: 'not_implemented',
  }
}

/**
 * Deriva la conversación a un operador humano
 * TODO: Implementar sistema de cola/tickets
 * @param from - Número de teléfono del usuario
 * @param message - Mensaje original
 */
async function escalateToOperator(from: string, message: string): Promise<void> {
  console.log('ESCALATE_TO_OPERATOR:', { from, message })

  // TODO: Implementar sistema de tickets
  // - Crear ticket en base de datos
  // - Notificar a operadores disponibles
  // - Marcar conversación como "en espera de operador"
}

/**
 * Encola una tarea pesada para procesamiento asíncrono
 * TODO: Implementar con Redis, RabbitMQ o base de datos
 * @param job - Datos del trabajo a encolar
 */
async function enqueueJob(job: { type: string; data: any }): Promise<void> {
  console.log('ENQUEUE_JOB:', job)

  // TODO: Implementar cola real
  // - Redis: await redis.lpush('jobs', JSON.stringify(job))
  // - RabbitMQ: channel.sendToQueue('jobs', Buffer.from(JSON.stringify(job)))
  // - Base de datos: INSERT INTO job_queue (type, data) VALUES (job.type, job.data)
}

/**
 * Handler GET para verificación del webhook
 * Meta envía un challenge que debemos devolver para verificar el endpoint
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN

  if (!verifyToken) {
    console.error('WEBHOOK_ERROR: WHATSAPP_VERIFY_TOKEN no configurado')
    return NextResponse.json(
      { error: 'Configuración faltante' },
      { status: 500 }
    )
  }

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK_VERIFIED: Challenge aceptado')
    return new NextResponse(challenge, { status: 200 })
  }

  console.error('WEBHOOK_ERROR: Verificación fallida', {
    mode,
    tokenMatch: token === verifyToken,
  })

  return NextResponse.json(
    { error: 'Token de verificación inválido' },
    { status: 403 }
  )
}

/**
 * Handler POST para recibir eventos del webhook
 * Procesa mensajes entrantes, actualizaciones de estado, etc.
 */
export async function POST(request: NextRequest) {
  try {
    // Leer el body como texto para verificación de firma
    const rawBody = await request.text()
    const signatureHeader = request.headers.get('x-hub-signature-256')

    // Verificar firma HMAC si está configurado
    if (!verifySignature(rawBody, signatureHeader)) {
      return NextResponse.json(
        { error: 'Firma inválida' },
        { status: 403 }
      )
    }

    // Parsear el body JSON
    let body: any
    try {
      body = JSON.parse(rawBody)
    } catch (error) {
      console.error('WEBHOOK_ERROR: Body JSON inválido')
      return NextResponse.json(
        { error: 'Body JSON inválido' },
        { status: 400 }
      )
    }

    console.log('WEBHOOK_RECEIVED:', JSON.stringify(body, null, 2))

    // Responder rápidamente a Meta para evitar reintentos
    // El procesamiento continúa después de la respuesta
    const response = NextResponse.json({ status: 'received' })

    // Procesar eventos de forma asíncrona (no bloquea la respuesta)
    processWebhookEvents(body).catch(error => {
      console.error('WEBHOOK_PROCESSING_ERROR:', error)
    })

    return response
  } catch (error: any) {
    console.error('WEBHOOK_ERROR:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * Procesa los eventos recibidos del webhook
 * @param body - Body parseado del webhook
 */
async function processWebhookEvents(body: any): Promise<void> {
  if (!body.entry || !Array.isArray(body.entry)) {
    console.warn('WEBHOOK_WARNING: Estructura de entrada inválida')
    return
  }

  for (const entry of body.entry) {
    const changes = entry.changes || []

    for (const change of changes) {
      const value = change.value

      // Procesar mensajes entrantes
      if (value.messages && Array.isArray(value.messages)) {
        for (const message of value.messages) {
          await processIncomingMessage(message, value.metadata?.phone_number_id)
        }
      }

      // Procesar actualizaciones de estado
      if (value.statuses && Array.isArray(value.statuses)) {
        for (const status of value.statuses) {
          console.log('STATUS_UPDATE:', {
            messageId: status.id,
            status: status.status,
            timestamp: status.timestamp,
          })
          // TODO: Guardar en base de datos o logs
          // await saveMessageStatus(status)
        }
      }
    }
  }
}

/**
 * Procesa un mensaje entrante
 * @param message - Objeto del mensaje
 * @param phoneNumberId - ID del número de teléfono
 */
async function processIncomingMessage(message: any, phoneNumberId?: string): Promise<void> {
  const from = message.from
  const messageId = message.id
  const type = message.type

  console.log('MESSAGE_RECEIVED:', {
    from,
    messageId,
    type,
  })

  // Procesar según el tipo de mensaje
  switch (type) {
    case 'text':
      await processTextMessage(from, message.text?.body || '', messageId)
      break

    case 'document':
      console.log('MESSAGE_DOCUMENT:', {
        from,
        filename: message.document?.filename,
        caption: message.document?.caption,
      })
      await sendTextMessage(
        from,
        'Recibí tu documento. Nuestro equipo lo revisará pronto. ¿En qué más puedo ayudarte?'
      )
      break

    case 'image':
      console.log('MESSAGE_IMAGE:', {
        from,
        caption: message.image?.caption,
      })
      await sendTextMessage(
        from,
        'Recibí tu imagen. ¿En qué puedo ayudarte?'
      )
      break

    case 'contacts':
      console.log('MESSAGE_CONTACTS:', {
        from,
        contacts: message.contacts,
      })
      await sendTextMessage(
        from,
        'Gracias por compartir tu contacto. ¿Cómo puedo ayudarte?'
      )
      break

    default:
      console.log('MESSAGE_UNKNOWN_TYPE:', {
        from,
        type,
      })
      await sendTextMessage(
        from,
        'Recibí tu mensaje. Nuestro equipo te responderá pronto. ¿Hay algo urgente en lo que pueda ayudarte?'
      )
  }
}

/**
 * Procesa un mensaje de texto
 * Detecta palabras clave y ejecuta acciones correspondientes
 * @param from - Número de teléfono del remitente
 * @param text - Texto del mensaje
 * @param messageId - ID del mensaje
 */
async function processTextMessage(from: string, text: string, messageId: string): Promise<void> {
  const lowerText = text.toLowerCase().trim()

  // Detectar palabra clave: factura
  if (lowerText.includes('factura') || lowerText.includes('boleta')) {
    console.log('KEYWORD_DETECTED: factura', { from, text })

    const pdfResult = await findPdfForNumber(from)

    if (pdfResult.ok && pdfResult.url) {
      // Enviar PDF
      const docResult = await sendDocumentMessage(
        from,
        pdfResult.url,
        'Aquí está tu factura. ¿Necesitas algo más?'
      )

      if (docResult.success) {
        console.log('PDF_SENT_SUCCESS:', { from, messageId: docResult.messageId })
      } else {
        await sendTextMessage(
          from,
          'Hubo un problema al enviar tu factura. Por favor, intenta más tarde o contacta con nuestra oficina al 3521-401330.'
        )
      }
    } else {
      // No se encontró PDF
      await sendTextMessage(
        from,
        'No encontramos tu última factura. Por favor, envíanos tu número de suministro o DNI para buscarla. También puedes contactarnos al 3521-401330.'
      )
    }
    return
  }

  // Detectar palabra clave: saldo
  if (lowerText.includes('saldo') || lowerText.includes('deuda')) {
    console.log('KEYWORD_DETECTED: saldo', { from, text })

    const balanceResult = await getBalanceForNumber(from)

    if (balanceResult.ok && balanceResult.balance !== undefined) {
      await sendTextMessage(
        from,
        `Tu saldo actual es: $${balanceResult.balance.toFixed(2)}. ¿Necesitas más información?`
      )
    } else {
      await sendTextMessage(
        from,
        'No pude consultar tu saldo en este momento. Por favor, contacta con nuestra oficina al 3521-401330 o visita nuestra página web.'
      )
    }
    return
  }

  // Detectar solicitud de operador humano
  if (
    lowerText.includes('hablar') ||
    lowerText.includes('operador') ||
    lowerText.includes('humano') ||
    lowerText.includes('persona')
  ) {
    console.log('KEYWORD_DETECTED: operador humano', { from, text })

    await escalateToOperator(from, text)
    await sendTextMessage(
      from,
      'Te he derivado a un operador. Nuestro equipo se comunicará contigo pronto. Horario de atención: Lunes a Viernes de 7:00 a 12:00. Para emergencias, llama al 3521-401330.'
    )
    return
  }

  // Para todos los demás mensajes, usar el chatbot inteligente (OpenAI)
  console.log('CHATBOT_REQUEST:', { from, text })
  const chatbotResponse = await getChatbotResponse(from, text)
  await sendTextMessage(from, chatbotResponse)
}

/**
 * INSTRUCCIONES DE PRUEBA:
 * 
 * 1. Verificación GET:
 *    curl "https://tu-dominio.com/api/webhook?hub.mode=subscribe&hub.verify_token=TU_VERIFY_TOKEN&hub.challenge=CHALLENGE_123"
 * 
 * 2. Probar POST con mensaje de texto (simplificado):
 *    curl -X POST https://tu-dominio.com/api/webhook \
 *      -H "Content-Type: application/json" \
 *      -H "x-hub-signature-256: sha256=..." \
 *      -d '{
 *        "object": "whatsapp_business_account",
 *        "entry": [{
 *          "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
 *          "changes": [{
 *            "value": {
 *              "messaging_product": "whatsapp",
 *              "metadata": {"phone_number_id": "PHONE_NUMBER_ID"},
 *              "messages": [{
 *                "from": "5491234567890",
 *                "id": "wamid.xxx",
 *                "type": "text",
 *                "text": {"body": "factura"}
 *              }]
 *            },
 *            "field": "messages"
 *          }]
 *        }]
 *      }'
 * 
 * 3. Probar sendTextMessage (requiere WHATSAPP_TOKEN):
 *    curl -X POST "https://graph.facebook.com/v20.0/PHONE_ID/messages" \
 *      -H "Authorization: Bearer WHATSAPP_TOKEN" \
 *      -H "Content-Type: application/json" \
 *      -d '{
 *        "messaging_product": "whatsapp",
 *        "to": "5491234567890",
 *        "type": "text",
 *        "text": {"body": "Mensaje de prueba"}
 *      }'
 * 
 * NOTAS DE PRODUCCIÓN:
 * 
 * - Configurar todas las variables de entorno en el hosting (Vercel/Netlify)
 * - WHATSAPP_TOKEN debe ser un token de larga duración o renovarse automáticamente
 * - Implementar enqueueJob con Redis/RabbitMQ para tareas pesadas
 * - Implementar findPdfForNumber con consulta real a base de datos
 * - Usar HTTPS (Vercel lo proporciona automáticamente)
 * - Considerar rate limiting para evitar abusos
 * - Monitorear logs y errores con servicios como Sentry
 */

