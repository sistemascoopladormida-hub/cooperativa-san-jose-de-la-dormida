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
    const imageFiles = formData.getAll("image") as (File | null)[]
    const imageUrlsJson = formData.get("image_urls") as string | null
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

    // Obtener la noticia actual (image_url e image_urls)
    const { data: currentPost } = await supabase
      .from("news_posts")
      .select("image_url, image_urls")
      .eq("id", id)
      .single()

    let keptUrls: string[] = []
    if (imageUrlsJson) {
      try {
        const parsed = JSON.parse(imageUrlsJson) as string[]
        keptUrls = Array.isArray(parsed) ? parsed : []
      } catch {
        keptUrls = currentPost?.image_urls ?? (currentPost?.image_url ? [currentPost.image_url] : [])
      }
    } else if (deleteImage) {
      keptUrls = []
    } else {
      keptUrls = currentPost?.image_urls ?? (currentPost?.image_url ? [currentPost.image_url] : [])
    }

    const validImageFiles = imageFiles.filter((f): f is File => f instanceof File && f.size > 0)
    const newUrls: string[] = []

    for (let i = 0; i < validImageFiles.length; i++) {
      const imageFile = validImageFiles[i]
      const buffer = Buffer.from(await imageFile.arrayBuffer())
      const fileExt = imageFile.name.split(".").pop() || "jpg"
      const fileName = `${slug}-${Date.now()}-${i}.${fileExt}`
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
      newUrls.push(publicUrl)
    }

    const finalImageUrls = [...keptUrls, ...newUrls]
    const imageUrl = finalImageUrls.length > 0 ? finalImageUrls[0] : null

    // Eliminar del storage las imágenes que ya no están en la lista
    const oldUrls = currentPost?.image_urls ?? (currentPost?.image_url ? [currentPost.image_url] : [])
    for (const oldUrl of oldUrls) {
      if (finalImageUrls.includes(oldUrl)) continue
      try {
        const urlParts = oldUrl.split("/")
        const filePathIndex = urlParts.findIndex((part) => part === "news")
        if (filePathIndex !== -1) {
          const oldFilePath = urlParts.slice(filePathIndex).join("/")
          await supabase.storage.from("news-images").remove([oldFilePath])
        }
      } catch (storageError) {
        console.warn("No se pudo eliminar imagen del storage:", storageError)
      }
    }

    const updateData: Record<string, unknown> = {
      slug,
      title,
      excerpt,
      content,
      date,
      author,
      category,
      image_url: imageUrl,
      image_urls: finalImageUrls.length > 0 ? finalImageUrls : null,
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

