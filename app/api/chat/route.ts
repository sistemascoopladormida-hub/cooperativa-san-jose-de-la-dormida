import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { cooperativeContext } from "@/lib/cooperative-context";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
