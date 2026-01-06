import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const authorName = formData.get("authorName") as string | null

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, WEBP)" },
        { status: 400 }
      )
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "El archivo es demasiado grande. El tamaño máximo es 5MB" },
        { status: 400 }
      )
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split(".").pop()
    const fileName = `camping-gallery-${timestamp}-${randomString}.${fileExtension}`
    const filePath = `camping/user-uploads/${fileName}`

    // Convertir File a Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Subir a Supabase Storage
    const bucketName = "news-images"
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error("Error al subir imagen:", error)
      return NextResponse.json(
        { error: "Error al subir la imagen. Por favor, intenta nuevamente." },
        { status: 500 }
      )
    }

    // Obtener URL pública de la imagen
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`

    // Guardar metadatos en la base de datos (opcional, para moderación futura)
    // Por ahora solo retornamos la URL

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
      message: "Imagen subida exitosamente",
    })
  } catch (error) {
    console.error("Error en el servidor:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

