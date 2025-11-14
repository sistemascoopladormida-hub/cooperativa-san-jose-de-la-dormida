import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Información de contexto sobre la Cooperativa La Dormida
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
`

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY no está configurada' },
        { status: 500 }
      )
    }

    // Construir el sistema de mensajes con el contexto
    const systemMessage = {
      role: 'system' as const,
      content: `Eres un asistente virtual amigable y profesional de la Cooperativa La Dormida. Tu objetivo es ayudar a los usuarios con información sobre los servicios, horarios, contacto y más.

${cooperativeContext}

Responde siempre en español, de forma natural y conversacional. Sé empático, útil y profesional. Si el usuario pregunta algo que no está en la información proporcionada, admítelo honestamente y sugiere que contacten directamente con la cooperativa.`
    }

    // Preparar los mensajes para OpenAI
    const conversationMessages = [
      systemMessage,
      ...messages.map((msg: { text: string; sender: string }) => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.text,
      })),
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: conversationMessages,
      temperature: 0.7,
      max_tokens: 500,
    })

    const response = completion.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta en este momento.'

    return NextResponse.json({ response })
  } catch (error: any) {
    console.error('Error en la API de chat:', error)
    return NextResponse.json(
      { error: error.message || 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}

