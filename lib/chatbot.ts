import OpenAI from "openai";
import { cooperativeContext } from "@/lib/cooperative-context";
import {
  getConversationHistory,
  getOrCreateConversation,
  saveMessage,
} from "@/lib/conversations";

// Inicializar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Obtiene respuesta del chatbot usando OpenAI
 */
export async function getChatbotResponse(
  from: string,
  userMessage: string,
  whatsappMessageId?: string
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return "Lo siento, el servicio de chat no está disponible en este momento. Por favor, contacta con nuestra oficina al 3521-401330 o con los consultorios médicos PFC (turnos) al 3521 401387.";
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

    // Llamar a OpenAI
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
    return "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo o contacta con nuestra oficina al 3521-401330 o con los consultorios médicos PFC (turnos) al 3521 401387.";
  }
}

