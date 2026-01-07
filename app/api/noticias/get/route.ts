import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const password = body.password
    const id = body.id

    if (password !== "Ingresonoticias2026.") {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 })
    }

    if (!id) {
      return NextResponse.json(
        { error: "ID de noticia requerido" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("news_posts")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error obteniendo noticia:", error)
      return NextResponse.json(
        { error: "No se pudo obtener la noticia" },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: "Noticia no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json({ post: data }, { status: 200 })
  } catch (error) {
    console.error("Error en /api/noticias/get:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

