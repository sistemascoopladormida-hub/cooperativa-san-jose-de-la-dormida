import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const nombre = (body.nombre as string | undefined)?.trim()
    const email = (body.email as string | undefined)?.trim()
    const telefono = (body.telefono as string | undefined)?.trim()
    const tipo = (body.asunto as string | undefined)?.trim()
    const mensaje = (body.mensaje as string | undefined)?.trim()

    if (!nombre || !email || !tipo || !mensaje) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios." },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("complaints")
      .insert({
        nombre,
        email,
        telefono: telefono || null,
        tipo,
        mensaje,
        origen: "web",
        estado: "pendiente",
      })
      .select("*")
      .single()

    if (error) {
      console.error("[COMPLAINTS] Error insertando reclamo:", error)
      return NextResponse.json(
        { error: "No se pudo registrar el reclamo. Intenta nuevamente más tarde." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: "Reclamo registrado correctamente.",
        reclamo: data,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[COMPLAINTS] Error en /api/reclamos:", error)
    return NextResponse.json(
      { error: "Error interno del servidor al registrar el reclamo." },
      { status: 500 }
    )
  }
}


