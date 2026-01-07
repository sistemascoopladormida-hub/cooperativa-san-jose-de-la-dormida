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

    // Obtener la noticia para ver si tiene imagen que eliminar
    const { data: post } = await supabase
      .from("news_posts")
      .select("image_url")
      .eq("id", id)
      .single()

    // Eliminar la noticia
    const { error: deleteError } = await supabase
      .from("news_posts")
      .delete()
      .eq("id", id)

    if (deleteError) {
      console.error("Error eliminando noticia:", deleteError)
      return NextResponse.json(
        { error: "No se pudo eliminar la noticia" },
        { status: 500 }
      )
    }

    // Si tenía imagen, intentar eliminarla del storage (opcional, no crítico)
    if (post?.image_url) {
      try {
        const urlParts = post.image_url.split("/")
        const filePath = urlParts.slice(urlParts.indexOf("news")).join("/")
        await supabase.storage.from("news-images").remove([filePath])
      } catch (storageError) {
        // No es crítico si falla la eliminación de la imagen
        console.warn("No se pudo eliminar la imagen del storage:", storageError)
      }
    }

    return NextResponse.json(
      { message: "Noticia eliminada correctamente" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error en /api/noticias/delete:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

