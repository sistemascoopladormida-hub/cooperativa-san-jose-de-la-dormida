import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const runtime = "nodejs"

// Tabla esperada en Supabase:
// news_posts (
//   id          bigint, primary key
//   slug        text, unique
//   title       text
//   excerpt     text
//   content     text
//   date        timestamptz
//   author      text
//   category    text
//   image_url   text
//   read_time   text
//   tags        text[] (opcional)
//   created_at  timestamptz default now()
// )

// Bucket de Storage esperado: "news-images"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const password = formData.get("password")
    if (password !== "Ingresonoticias2026.") {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 })
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

    let imageUrl: string | null = null

    if (imageFile) {
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
    }

    const { data, error } = await supabase
      .from("news_posts")
      .insert({
        slug,
        title,
        excerpt,
        content,
        date,
        author,
        category,
        image_url: imageUrl,
        read_time: readTime,
        tags,
      })
      .select("*")
      .single()

    if (error) {
      console.error("Error insertando noticia:", error)
      return NextResponse.json(
        { error: "No se pudo crear la noticia" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: "Noticia creada correctamente",
        post: data,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error en /api/noticias/create:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}


