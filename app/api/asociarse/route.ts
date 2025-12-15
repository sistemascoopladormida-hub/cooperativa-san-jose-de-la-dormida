import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const nombreCompleto = (body.nombreCompleto as string | undefined)?.trim()
    const email = (body.email as string | undefined)?.trim()
    const telefono = (body.telefono as string | undefined)?.trim()
    const direccion = (body.direccion as string | undefined)?.trim()
    const ocupacion = (body.ocupacion as string | undefined)?.trim()
    const serviciosInteres = (body.serviciosInteres as string[] | undefined) ?? []
    const aceptaTerminos = Boolean(body.aceptaTerminos)

    if (
      !nombreCompleto ||
      !email ||
      !telefono ||
      !direccion ||
      !aceptaTerminos
    ) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios o no aceptaste los términos." },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("membership_applications")
      .insert({
        nombre_completo: nombreCompleto,
        email,
        telefono,
        direccion,
        ocupacion: ocupacion || null,
        servicios_interes: serviciosInteres,
        acepta_terminos: aceptaTerminos,
        origen: "web",
        estado: "pendiente",
      })
      .select("*")
      .single()

    if (error) {
      console.error("[ASOCIARSE] Error insertando solicitud:", error)
      return NextResponse.json(
        { error: "No se pudo registrar la solicitud. Intenta nuevamente más tarde." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: "Solicitud de asociación registrada correctamente.",
        solicitud: data,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[ASOCIARSE] Error en /api/asociarse:", error)
    return NextResponse.json(
      { error: "Error interno del servidor al registrar la solicitud." },
      { status: 500 }
    )
  }
}


