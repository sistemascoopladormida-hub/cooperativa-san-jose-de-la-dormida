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
 * Marca una conversación con opt-in de facturas por WhatsApp
 */
export async function updateWhatsappOptIn(
  phoneNumber: string,
  optIn: boolean = true
): Promise<void> {
  try {
    const { error } = await supabase
      .from("conversations")
      .update({
        whatsapp_opt_in: optIn,
        fecha_opt_in: optIn ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("phone_number", phoneNumber);

    if (error) {
      console.error("[CONVERSATIONS] Error actualizando opt-in:", error);
    }
  } catch (err) {
    console.error("[CONVERSATIONS] Error en updateWhatsappOptIn:", err);
  }
}

/**
 * Guarda un mensaje en Supabase y actualiza la fecha de actualización de la conversación
 */
export async function saveMessage(
  conversationId: number,
  role: "user" | "assistant",
  content: string,
  whatsappMessageId?: string,
  messageSource?: "chatbot" | "activacion_facturas"
): Promise<void> {
  const insertData: Record<string, unknown> = {
    conversation_id: conversationId,
    role,
    content,
    whatsapp_message_id: whatsappMessageId,
  };
  if (messageSource) {
    insertData.message_source = messageSource;
  }
  let { error: messageError } = await supabase.from("messages").insert(insertData);
  // Si falla por columna message_source inexistente, reintentar sin ella
  if (messageError?.message?.includes("message_source") && messageSource) {
    delete insertData.message_source;
    const retry = await supabase.from("messages").insert(insertData);
    messageError = retry.error;
  }

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
 * Obtiene los mensajes recientes de una conversación
 */
export async function getRecentMessages(
  conversationId: number,
  limit: number = 5
): Promise<Array<{ role: "user" | "assistant"; content: string }>> {
  try {
    const { data: messages, error } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error obteniendo mensajes recientes:", error);
      return [];
    }

    // Invertir el orden para tener los más antiguos primero
    return (
      messages
        ?.reverse()
        .map((msg: { role: "user" | "assistant"; content: string }) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })) || []
    );
  } catch (error) {
    console.error("Error en getRecentMessages:", error);
    return [];
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

