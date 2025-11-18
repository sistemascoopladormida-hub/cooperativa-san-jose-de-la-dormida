import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import OpenAI from 'openai'

// Configuración para Next.js 15
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Inicializar OpenAI con timeout
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 25000, // 25 segundos (Vercel tiene límite de 30s en funciones)
  maxRetries: 1,
})

// Contexto de la Cooperativa La Dormida
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
1. Electricidad: Suministro eléctrico confiable las 24 horas del día. Tarifas preferenciales para socios. Atención técnica 24/7. Precio: Desde $8,500/mes
2. Internet: Conexión de alta velocidad con fibra óptica hasta 100 Mbps. Sin límite de datos. Precio: Desde $4,200/mes
3. Televisión: Más de 80 canales, incluyendo canales HD. Precio: Desde $3,800/mes
4. Programa PFC: Traslados en ambulancia, servicio de sepelio, análisis clínicos, servicio óptico, consultorios externos

INSTRUCCIONES PARA EL ASISTENTE:
- Responde de forma amigable, profesional y humana
- Usa un tono cercano y empático
- Si no sabes algo, admítelo y sugiere contactar directamente
- Siempre proporciona información precisa basada en el contexto proporcionado
- Para emergencias, siempre menciona los números de guardia 24/7
- Mantén las respuestas concisas pero completas
- Estás respondiendo por WhatsApp, así que sé breve pero completo
`

// Historial de conversación
const conversationHistory = new Map<string, Array<{ role: 'user' | 'assistant'; content: string }>>()

const WHATSAPP_API_VERSION = 'v22.0'

/**
 * Obtiene respuesta del chatbot usando OpenAI
 */
async function getChatbotResponse(from: string, userMessage: string): Promise<string> {
  console.log('GET_CHATBOT_RESPONSE_START:', { from, messageLength: userMessage.length })

  if (!process.env.OPENAI_API_KEY) {
    console.error('CHATBOT_ERROR: OPENAI_API_KEY no configurada')
    return 'Lo siento, el servicio de chat no está disponible en este momento. Por favor, contacta con nuestra oficina al 3521-401330.'
  }

  try {
    const history = conversationHistory.get(from) || []
    
    const systemMessage = {
      role: 'system' as const,
      content: `Eres un asistente virtual amigable y profesional de la Cooperativa La Dormida. Estás respondiendo por WhatsApp. Tu objetivo es ayudar a los usuarios con información sobre los servicios, horarios, contacto y más.

${cooperativeContext}

Responde siempre en español, de forma natural y conversacional. Sé empático, útil y profesional.`
    }

    const messages = [
      systemMessage,
      ...history.slice(-10),
      { role: 'user' as const, content: userMessage },
    ]

    console.log('CHATBOT_CALLING_OPENAI:', { 
      from, 
      messagesCount: messages.length,
      timestamp: new Date().toISOString()
    })

    // Crear promise con timeout manual para mejor control
    const startTime = Date.now()
    
    const completionPromise = openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    })

    // Timeout de 20 segundos
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('OpenAI request timeout after 20 seconds'))
      }, 20000)
    })

    console.log('CHATBOT_AWAITING_OPENAI:', { from, timestamp: new Date().toISOString() })

    const completion = await Promise.race([completionPromise, timeoutPromise]) as any

    const elapsedTime = Date.now() - startTime
    console.log('CHATBOT_OPENAI_RESPONSE:', { 
      from, 
      hasResponse: !!completion.choices?.[0]?.message?.content,
      elapsedTime: `${elapsedTime}ms`,
      timestamp: new Date().toISOString()
    })

    const response = completion.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta en este momento.'

    // Guardar en historial
    const updatedHistory = [
      ...history,
      { role: 'user' as const, content: userMessage },
      { role: 'assistant' as const, content: response },
    ].slice(-20)

    conversationHistory.set(from, updatedHistory)

    console.log('CHATBOT_RESPONSE_READY:', { from, responseLength: response.length })

    return response
  } catch (error: any) {
    console.error('CHATBOT_ERROR:', {
      from,
      error: error.message,
      errorName: error.name,
      errorType: error.constructor?.name || typeof error,
      status: error.status || error.response?.status,
      code: error.code,
      stack: error.stack?.substring(0, 200),
      timestamp: new Date().toISOString()
    })
    
    // Si es un error de OpenAI, loggear más detalles
    if (error.response) {
      console.error('CHATBOT_OPENAI_ERROR_DETAILS:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      })
    }
    
    return 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo o contacta con nuestra oficina al 3521-401330.'
  }
}

/**
 * Envía un mensaje de texto a través de WhatsApp Cloud API
 */
async function sendTextMessage(to: string, text: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const token = process.env.WHATSAPP_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!token || !phoneId) {
    console.error('SEND_MESSAGE_ERROR: Variables de entorno faltantes')
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
      signal: AbortSignal.timeout(10000),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('SEND_MESSAGE_ERROR:', {
        status: response.status,
        error: data.error || data,
      })
      return { success: false, error: data.error?.message || 'Error desconocido' }
    }

    console.log('SEND_MESSAGE_OK:', { messageId: data.messages?.[0]?.id, to })

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    }
  } catch (error: any) {
    console.error('SEND_MESSAGE_ERROR:', { error: error.message, to })
    return { success: false, error: error.message }
  }
}

/**
 * Verifica la firma HMAC del webhook
 */
function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET
  if (!secret || !signatureHeader) {
    return true // En desarrollo, saltar verificación
  }

  const hash = signatureHeader.replace('sha256=', '')
  const expectedHash = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(expectedHash)
  )
}

/**
 * Handler GET para verificación del webhook
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN

  if (!verifyToken) {
    return NextResponse.json({ error: 'Configuración faltante' }, { status: 500 })
  }

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK_VERIFIED')
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Token inválido' }, { status: 403 })
}

/**
 * Handler POST para recibir eventos del webhook
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signatureHeader = request.headers.get('x-hub-signature-256')

    if (!verifySignature(rawBody, signatureHeader)) {
      return NextResponse.json({ error: 'Firma inválida' }, { status: 403 })
    }

    const body = JSON.parse(rawBody)
    console.log('WEBHOOK_RECEIVED')

    // Responder rápidamente a Meta
    const response = NextResponse.json({ status: 'received' })

    // Procesar eventos de forma asíncrona
    // IMPORTANTE: En Vercel, el proceso puede cortarse si tarda mucho
    // Por eso respondemos primero y luego procesamos
    processWebhookEvents(body).catch(error => {
      console.error('WEBHOOK_PROCESSING_ERROR:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      })
    })
    
    console.log('WEBHOOK_RESPONSE_SENT:', { timestamp: new Date().toISOString() })

    return response
  } catch (error: any) {
    console.error('WEBHOOK_ERROR:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

/**
 * Procesa los eventos recibidos del webhook
 */
async function processWebhookEvents(body: any): Promise<void> {
  console.log('PROCESS_WEBHOOK_EVENTS_START:', { timestamp: new Date().toISOString() })
  
  if (!body.entry || !Array.isArray(body.entry)) {
    console.log('PROCESS_WEBHOOK_EVENTS: No entries found')
    return
  }

  try {
    for (const entry of body.entry) {
      const changes = entry.changes || []

      for (const change of changes) {
        const value = change.value

        // Procesar mensajes entrantes
        if (value.messages && Array.isArray(value.messages)) {
          for (const message of value.messages) {
            console.log('PROCESSING_MESSAGE:', { from: message.from, type: message.type })
            await processIncomingMessage(message)
            console.log('MESSAGE_PROCESSED:', { from: message.from })
          }
        }
      }
    }
    console.log('PROCESS_WEBHOOK_EVENTS_COMPLETE:', { timestamp: new Date().toISOString() })
  } catch (error: any) {
    console.error('PROCESS_WEBHOOK_EVENTS_ERROR:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
    throw error
  }
}

/**
 * Procesa un mensaje entrante
 */
async function processIncomingMessage(message: any): Promise<void> {
  const from = message.from
  const type = message.type

  console.log('MESSAGE_RECEIVED:', { from, type })

  if (type === 'text') {
    const text = message.text?.body || ''
    console.log('CHATBOT_REQUEST:', { from, text })

    try {
      const chatbotResponse = await getChatbotResponse(from, text)
      console.log('CHATBOT_RESPONSE:', { from, responseLength: chatbotResponse.length })
      
      const sendResult = await sendTextMessage(from, chatbotResponse)
      console.log('SEND_RESULT:', sendResult)
      
      if (!sendResult.success) {
        console.error('FAILED_TO_SEND_MESSAGE:', { from, error: sendResult.error })
      }
    } catch (error: any) {
      console.error('CHATBOT_PROCESSING_ERROR:', { from, error: error.message })
    }
  }
}
