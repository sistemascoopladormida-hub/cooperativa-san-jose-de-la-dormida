import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const runtime = "nodejs"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const password = formData.get("password")
    if (password !== "Ingresonoticias2026.") {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 })
    }

    const id = formData.get("id") as string | null
    if (!id) {
      return NextResponse.json(
        { error: "ID de noticia requerido" },
        { status: 400 }
      )
    }

    const title = formData.get("title") as string | null
    const excerpt = formData.get("excerpt") as string | null
    const content = formData.get("content") as string | null
    const date = formData.get("date") as string | null
    const author = formData.get("author") as string | null
    const category = formData.get("category") as string | null
    const readTime = formData.get("readTime") as string | null
    const tagsRaw = formData.get("tags") as string | null
    const imageFile = formData.get("image") as File | null
    const deleteImage = formData.get("deleteImage") === "true"

    if (!title || !excerpt || !content || !date || !author || !category) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      )
    }

    const slug = slugify(title)
    const tags =
      tagsRaw
        ?.split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0) ?? []

    // Obtener la noticia actual para ver si tiene imagen
    const { data: currentPost } = await supabase
      .from("news_posts")
      .select("image_url")
      .eq("id", id)
      .single()

    let imageUrl: string | null = currentPost?.image_url || null
    const oldImageUrl = currentPost?.image_url

    // Si se sube una nueva imagen
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer())
      const fileExt = imageFile.name.split(".").pop() || "jpg"
      const fileName = `${slug}-${Date.now()}.${fileExt}`
      const filePath = `news/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("news-images")
        .upload(filePath, buffer, {
          contentType: imageFile.type || "image/jpeg",
        })

      if (uploadError) {
        console.error("Error subiendo imagen:", uploadError)
        return NextResponse.json(
          { error: "No se pudo subir la imagen" },
          { status: 500 }
        )
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("news-images").getPublicUrl(filePath)

      imageUrl = publicUrl

      // Eliminar la imagen anterior si existe
      if (oldImageUrl) {
        try {
          const urlParts = oldImageUrl.split("/")
          const filePathIndex = urlParts.findIndex((part) => part === "news")
          if (filePathIndex !== -1) {
            const oldFilePath = urlParts.slice(filePathIndex).join("/")
            await supabase.storage.from("news-images").remove([oldFilePath])
          }
        } catch (storageError) {
          console.warn("No se pudo eliminar la imagen anterior del storage:", storageError)
        }
      }
    } else if (deleteImage) {
      // Si se solicita eliminar la imagen
      imageUrl = null

      // Eliminar la imagen del storage
      if (oldImageUrl) {
        try {
          const urlParts = oldImageUrl.split("/")
          const filePathIndex = urlParts.findIndex((part) => part === "news")
          if (filePathIndex !== -1) {
            const oldFilePath = urlParts.slice(filePathIndex).join("/")
            await supabase.storage.from("news-images").remove([oldFilePath])
          }
        } catch (storageError) {
          console.warn("No se pudo eliminar la imagen del storage:", storageError)
        }
      }
    }

    const updateData: any = {
      slug,
      title,
      excerpt,
      content,
      date,
      author,
      category,
      image_url: imageUrl,
      read_time: readTime || null,
      tags: tags.length > 0 ? tags : null,
    }

    const { data, error } = await supabase
      .from("news_posts")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single()

    if (error) {
      console.error("Error actualizando noticia:", error)
      return NextResponse.json(
        { error: "No se pudo actualizar la noticia" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: "Noticia actualizada correctamente",
        post: data,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error en /api/noticias/update:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

