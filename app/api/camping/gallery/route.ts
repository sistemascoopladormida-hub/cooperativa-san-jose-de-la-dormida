import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const runtime = "nodejs"

export async function GET() {
  try {
    const bucketName = "news-images"
    const folderPath = "camping/user-uploads"

    // Listar todas las imágenes en la carpeta
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath, {
        limit: 100,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      })

    if (error) {
      console.error("Error al obtener imágenes:", error)
      return NextResponse.json(
        { error: "Error al obtener las imágenes" },
        { status: 500 }
      )
    }

    // Filtrar solo archivos de imagen
    const imageFiles = data?.filter((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase()
      return ["jpg", "jpeg", "png", "webp"].includes(extension || "")
    }) || []

    // Construir URLs públicas
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const images = imageFiles.map((file) => ({
      url: `${supabaseUrl}/storage/v1/object/public/${bucketName}/${folderPath}/${file.name}`,
      name: file.name,
      createdAt: file.created_at,
    }))

    return NextResponse.json({
      success: true,
      images,
    })
  } catch (error) {
    console.error("Error en el servidor:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

