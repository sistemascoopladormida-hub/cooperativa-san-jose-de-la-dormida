import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * POST /api/encuesta-box/[token]/enviar
 * Guarda las respuestas de la encuesta del box
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { respuestas, comentarios } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token no proporcionado" },
        { status: 400 }
      );
    }

    if (!respuestas) {
      return NextResponse.json(
        { success: false, error: "Las respuestas son requeridas" },
        { status: 400 }
      );
    }

    // Validar que todas las preguntas obligatorias estén respondidas
    const preguntasObligatorias = [
      "calificacionGeneral",
      "atencion",
      "amabilidad",
      "resolucionProblema",
      "tiempoEspera",
    ];

    const faltantes = preguntasObligatorias.filter(
      (pregunta) => !respuestas[pregunta]
    );

    if (faltantes.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Por favor responde todas las preguntas obligatorias. Faltan: ${faltantes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Buscar el token y el empleado asociado
    const { data: qrToken, error: tokenError } = await supabase
      .from("qr_tokens_boxes")
      .select(
        `
        *,
        empleados_boxes (
          id,
          nombre,
          box_numero,
          activo
        )
      `
      )
      .eq("token", token)
      .eq("activo", true)
      .single();

    if (tokenError || !qrToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Token inválido o expirado",
        },
        { status: 404 }
      );
    }

    const empleado = qrToken.empleados_boxes as any;
    if (!empleado || !empleado.activo) {
      return NextResponse.json(
        {
          success: false,
          error: "El empleado asociado a este QR no está activo",
        },
        { status: 404 }
      );
    }

    // Guardar las respuestas en la base de datos
    const { data: encuesta, error: insertError } = await supabase
      .from("encuestas_boxes")
      .insert({
        token: token,
        empleado_id: empleado.id,
        box_numero: empleado.box_numero,
        nombre_empleado: empleado.nombre,
        estado: "completada",
        completada_en: new Date().toISOString(),
        respuestas: respuestas,
        comentarios: comentarios || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[ENCUESTA-BOX] Error guardando encuesta:", insertError);
      return NextResponse.json(
        {
          success: false,
          error: "Error al guardar las respuestas",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "¡Gracias por tu respuesta! Tu opinión es muy valiosa para nosotros.",
      encuesta: encuesta,
    });
  } catch (error: any) {
    console.error("[ENCUESTA-BOX] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al procesar la encuesta",
      },
      { status: 500 }
    );
  }
}
