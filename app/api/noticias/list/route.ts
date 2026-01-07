import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const password = body.password

    if (password !== "Ingresonoticias2026.") {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 })
    }

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
    console.error("Error en /api/noticias/list:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

