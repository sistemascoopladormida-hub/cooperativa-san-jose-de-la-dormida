import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

const COOKIE_NAME = "conversation_analysis_admin";

export async function GET() {
  try {
    const cookieStore = await cookies();
    if (cookieStore.get(COOKIE_NAME)?.value !== "authenticated") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: analyses, error } = await supabase
      .from("conversation_analysis")
      .select(
        "id, conversation_id, intent, resolved, issues, summary, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[conversation-analysis] Supabase:", error);
      return NextResponse.json(
        { error: error.message || "Error al leer datos" },
        { status: 500 }
      );
    }

    const list = analyses ?? [];
    const convIds = [
      ...new Set(
        list
          .map((r) => r.conversation_id)
          .filter((id): id is number => id != null && Number.isFinite(Number(id)))
      ),
    ];

    let phoneByConvId = new Map<number, string | null>();
    if (convIds.length > 0) {
      const { data: convs, error: convErr } = await supabase
        .from("conversations")
        .select("id, phone_number")
        .in("id", convIds);

      if (!convErr && convs) {
        phoneByConvId = new Map(
          convs.map((c) => [
            c.id as number,
            (c.phone_number as string | null) ?? null,
          ])
        );
      }
    }

    const rows = list.map((row) => ({
      ...row,
      phone_number:
        phoneByConvId.get(Number(row.conversation_id)) ?? null,
    }));

    return NextResponse.json({ rows });
  } catch (e) {
    console.error("[conversation-analysis]", e);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
