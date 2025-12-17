import { supabase } from "@/lib/supabase";

/**
 * Obtiene o crea una conversación en Supabase
 */
export async function getOrCreateConversation(
  phoneNumber: string
): Promise<number> {
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
 * Guarda un mensaje en Supabase y actualiza la fecha de actualización de la conversación
 */
export async function saveMessage(
  conversationId: number,
  role: "user" | "assistant",
  content: string,
  whatsappMessageId?: string
): Promise<void> {
  const { error: messageError } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    role,
    content,
    whatsapp_message_id: whatsappMessageId,
  });

  if (messageError) {
    console.error("Error guardando mensaje:", messageError);
    return;
  }

  // Actualizar la fecha de actualización de la conversación
  const { error: updateError } = await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  if (updateError) {
    console.error("Error actualizando conversación:", updateError);
    // No lanzar error, el mensaje ya se guardó
  }
}

/**
 * Verifica si un mensaje de WhatsApp ya fue procesado
 */
export async function isMessageAlreadyProcessed(
  whatsappMessageId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("id")
      .eq("whatsapp_message_id", whatsappMessageId)
      .limit(1);

    if (error) {
      console.error("Error verificando mensaje duplicado:", error);
      // En caso de error, retornar false para permitir el procesamiento
      // (mejor procesar duplicado que perder mensajes)
      return false;
    }

    return (data?.length || 0) > 0;
  } catch (error) {
    console.error("Error en isMessageAlreadyProcessed:", error);
    return false;
  }
}

/**
 * Obtiene el historial de conversación desde Supabase
 */
export async function getConversationHistory(
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
      messages?.map((msg: { role: "user" | "assistant"; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })) || []
    );
  } catch (error) {
    console.error("Error en getConversationHistory:", error);
    return [];
  }
}

