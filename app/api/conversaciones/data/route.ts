import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("conversaciones_auth");

    if (authCookie?.value !== "authenticated") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const phoneNumber = searchParams.get("phone");

    if (phoneNumber) {
      // Obtener conversación específica con sus mensajes
      const { data: conversation, error: convError } = await supabase
        .from("conversations")
        .select("*")
        .eq("phone_number", phoneNumber)
        .single();

      if (convError || !conversation) {
        return NextResponse.json(
          { error: "Conversación no encontrada" },
          { status: 404 }
        );
      }

      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });

      if (messagesError) {
        return NextResponse.json(
          { error: "Error al obtener mensajes" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        conversation,
        messages: messages || [],
      });
    } else {
      // Obtener todas las conversaciones con conteo de mensajes
      const { data: conversations, error: convError } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (convError) {
        return NextResponse.json(
          { error: "Error al obtener conversaciones" },
          { status: 500 }
        );
      }

      // Obtener conteo de mensajes para cada conversación
      const conversationsWithCount = await Promise.all(
        (conversations || []).map(async (conv) => {
          const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id);

          return {
            ...conv,
            message_count: count || 0,
          };
        })
      );

      return NextResponse.json({ conversations: conversationsWithCount });
    }
  } catch (error: any) {
    console.error("Error en API de conversaciones:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

