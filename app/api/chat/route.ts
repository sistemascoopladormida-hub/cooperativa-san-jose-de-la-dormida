import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
- UBICACIÓN DEL NÚMERO DE CUENTA EN LA FACTURA:
  * El número de cuenta se encuentra en la parte superior de la factura, en la sección de información del cliente
  * Aparece claramente identificado como "Cuenta: XXXX" (donde XXXX es el número de cuenta)
  * Está ubicado justo después del nombre del cliente/titular del servicio
  * Ejemplo: Si en la factura aparece "Cuenta: 2862", el número de cuenta es 2862
  * También puede aparecer como "Cuenta: 6370" o "Cuenta: 239" (puede tener entre 3 y 6 dígitos)
  * Si un usuario pregunta dónde está el número de cuenta o no sabe dónde encontrarlo, explícale que:
    1. Debe buscar en la parte superior de su factura (ya sea física o PDF)
    2. Buscar la palabra "Cuenta:" seguida de un número
    3. Ese número es el que debe proporcionar para solicitar su factura
    4. El número de cuenta aparece en todas las facturas (tanto de servicios como de electricidad)
- FACTURAS DISPONIBLES: Las facturas están disponibles desde agosto 2025 en adelante (agosto, septiembre, octubre, noviembre, diciembre 2025, y meses siguientes)

INSTRUCCIONES PARA EL ASISTENTE:
- Responde de forma amigable, profesional y humana
- Usa un tono cercano y empático
- Si no sabes algo, admítelo y sugiere contactar directamente
- Siempre proporciona información precisa basada en el contexto proporcionado
- Para emergencias, siempre menciona los números de guardia 24/7
- Mantén las respuestas concisas pero completas
- Cuando te pregunten por facturas o boletas (sin especificar tipo), SIEMPRE menciona AMBAS: las de servicios Y las de electricidad. Proporciona información completa sobre ambas:
  * FACTURAS/BOLETAS DE SERVICIOS (P.F.C, Internet, WiFi, Cable, TV): ya están disponibles para retirar en boxes y fueron enviadas por correo electrónico (período noviembre), vencimientos: 10 y 22 de diciembre. Medios de pago: caja de cobro con efectivo/tarjetas y App CoopOnline. IMPORTANTE: las transferencias están INHABILITADAS
  * FACTURAS/BOLETAS DE ENERGÍA ELÉCTRICA: ya están disponibles, fueron enviadas por correo electrónico (período noviembre), primer vencimiento: 12 de diciembre, segundo vencimiento: 22 de diciembre
- Si preguntan específicamente por un tipo de factura (servicios o electricidad), proporciona solo la información de ese tipo
- Cuando te pregunten sobre farmacias de turno, proporciona la información completa del turnero mostrando todas las fechas y farmacias correspondientes
- Si un usuario pregunta dónde está el número de cuenta, no sabe dónde encontrarlo, o dice que no lo encuentra, proporciona una explicación clara y detallada:
  * "El número de cuenta se encuentra en la parte superior de tu factura, ya sea física o en PDF"
  * "Busca la palabra 'Cuenta:' seguida de un número (por ejemplo: 'Cuenta: 2862' o 'Cuenta: 6370')"
  * "Está ubicado justo después del nombre del cliente o titular del servicio"
  * "El número de cuenta puede tener entre 3 y 6 dígitos"
  * "Aparece en todas las facturas, tanto de servicios como de electricidad"
  * "Si tienes una factura física, mírala en la parte superior. Si tienes el PDF, ábrelo y busca en la sección de información del cliente"
  * Sé paciente y amable al explicar esto, ya que algunos usuarios pueden tener dificultades para encontrarlo
`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY no está configurada" },
        { status: 500 }
      );
    }

    // Construir el sistema de mensajes con el contexto
    const systemMessage = {
      role: "system" as const,
      content: `Eres un asistente virtual amigable y profesional de la Cooperativa La Dormida. Tu objetivo es ayudar a los usuarios con información sobre los servicios, horarios, contacto y más.

${cooperativeContext}

Responde siempre en español, de forma natural y conversacional. Sé empático, útil y profesional. Si el usuario pregunta algo que no está en la información proporcionada, admítelo honestamente y sugiere que contacten directamente con la cooperativa.`,
    };

    // Preparar los mensajes para OpenAI
    const conversationMessages = [
      systemMessage,
      ...messages.map((msg: { text: string; sender: string }) => ({
        role:
          msg.sender === "user" ? ("user" as const) : ("assistant" as const),
        content: msg.text,
      })),
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: conversationMessages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const response =
      completion.choices[0]?.message?.content ||
      "Lo siento, no pude generar una respuesta en este momento.";

    // Detectar si el usuario pregunta sobre la ubicación del número de cuenta
    // Revisar el último mensaje del usuario y también el contexto completo de la conversación
    const lastUserMessage = messages[messages.length - 1]?.text?.toLowerCase() || "";
    
    // Obtener todo el contexto de la conversación (últimos 5 mensajes)
    const recentMessages = messages.slice(-5);
    const allMessagesText = recentMessages
      .map((msg: { text: string }) => msg.text.toLowerCase())
      .join(" ");
    
    // Detectar si menciona número de cuenta o número de socio en cualquier parte de la conversación
    const mencionaCuenta = 
      allMessagesText.includes("número de cuenta") ||
      allMessagesText.includes("numero de cuenta") ||
      allMessagesText.includes("número de socio") ||
      allMessagesText.includes("numero de socio") ||
      allMessagesText.includes("nro de cuenta") ||
      allMessagesText.includes("nro cuenta") ||
      (allMessagesText.includes("cuenta") && (allMessagesText.includes("numero") || allMessagesText.includes("factura")));
    
    // Detectar si pregunta por ubicación o dice que no encuentra
    const preguntaUbicacion = 
      lastUserMessage.includes("donde") ||
      lastUserMessage.includes("dónde") ||
      lastUserMessage.includes("no encuentro") ||
      lastUserMessage.includes("no lo encuentro") ||
      lastUserMessage.includes("sigo sin encontrar") ||
      lastUserMessage.includes("ubicación") ||
      lastUserMessage.includes("ubicacion") ||
      lastUserMessage.includes("en la boleta") ||
      lastUserMessage.includes("en la factura") ||
      lastUserMessage.includes("en mi boleta") ||
      lastUserMessage.includes("en mi factura");
    
    // Mostrar imagen si:
    // 1. Menciona cuenta en el contexto Y pregunta por ubicación, O
    // 2. Dice que no encuentra algo Y hay contexto de cuenta
    const shouldShowImage = mencionaCuenta && preguntaUbicacion;
    
    // Log para debugging
    console.log("=== Detección de imagen de número de cuenta ===");
    console.log("Último mensaje del usuario:", lastUserMessage);
    console.log("Menciona cuenta en contexto:", mencionaCuenta);
    console.log("Pregunta por ubicación:", preguntaUbicacion);
    console.log("Mostrar imagen:", shouldShowImage);
    console.log("Contexto completo (últimos 5 mensajes):", allMessagesText.substring(0, 200));

    return NextResponse.json({ 
      response,
      showImage: shouldShowImage ? "ubicacion de numero de cuenta" : undefined
    });
  } catch (error: any) {
    console.error("Error en la API de chat:", error);
    return NextResponse.json(
      { error: error.message || "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
