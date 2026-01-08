import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const runtime = "nodejs"

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("news_posts")
      .select("*")
      .order("date", { ascending: false })

    if (error) {
      console.error("Error obteniendo noticias:", error)
      return NextResponse.json(
        { error: "No se pudieron obtener las noticias" },
        { status: 500 }
      )
    }

    return NextResponse.json({ posts: data || [] }, { status: 200 })
  } catch (error) {
    console.error("Error en /api/noticias/public:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
