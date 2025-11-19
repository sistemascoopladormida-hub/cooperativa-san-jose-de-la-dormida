import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import OpenAI from 'openai'

// Configuración para Next.js 15
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Inicializar OpenAI (exactamente igual que en /api/chat)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

// Historial de conversación
const conversationHistory = new Map<string, Array<{ role: 'user' | 'assistant'; content: string }>>()

const WHATSAPP_API_VERSION = 'v22.0'

/**
 * Obtiene respuesta del chatbot usando OpenAI (igual que /api/chat)
 */
async function getChatbotResponse(from: string, userMessage: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return 'Lo siento, el servicio de chat no está disponible en este momento. Por favor, contacta con nuestra oficina al 3521-401330.'
  }

  try {
    const history = conversationHistory.get(from) || []
    
    const systemMessage = {
      role: 'system' as const,
      content: `Eres un asistente virtual amigable y profesional de la Cooperativa La Dormida. Estás respondiendo por WhatsApp. Tu objetivo es ayudar a los usuarios con información sobre los servicios, horarios, contacto y más.

${cooperativeContext}

Responde siempre en español, de forma natural y conversacional. Sé empático, útil y profesional. Si el usuario pregunta algo que no está en la información proporcionada, admítelo honestamente y sugiere que contacten directamente con la cooperativa.`
    }

    const messages = [
      systemMessage,
      ...history.slice(-10),
      { role: 'user' as const, content: userMessage },
    ]

    // Llamar a OpenAI exactamente igual que en /api/chat
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
    ].slice(-20)

    conversationHistory.set(from, updatedHistory)

    return response
  } catch (error: any) {
    console.error('Error en chatbot:', error)
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
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Error enviando mensaje:', data.error || data)
      return { success: false, error: data.error?.message || 'Error desconocido' }
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    }
  } catch (error: any) {
    console.error('Error enviando mensaje:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Verifica la firma HMAC del webhook
 */
function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET
  if (!secret || !signatureHeader) {
    return true
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

    // Procesar mensajes
    if (body.entry && Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        const changes = entry.changes || []
        for (const change of changes) {
          const value = change.value
          if (value.messages && Array.isArray(value.messages)) {
            for (const message of value.messages) {
              if (message.type === 'text') {
                const from = message.from
                const text = message.text?.body || ''
                
                // Obtener respuesta del chatbot (igual que /api/chat)
                const chatbotResponse = await getChatbotResponse(from, text)
                
                // Enviar respuesta a WhatsApp
                await sendTextMessage(from, chatbotResponse)
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ status: 'received' })
  } catch (error: any) {
    console.error('Error en webhook:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
