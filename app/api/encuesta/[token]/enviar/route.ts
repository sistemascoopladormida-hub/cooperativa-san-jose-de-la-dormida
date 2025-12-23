import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const respuestas = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token requerido" },
        { status: 400 }
      );
    }

    // Validar que todas las respuestas obligatorias estén presentes
    const camposObligatorios = [
      "calificacionGeneral",
      "puntualidad",
      "profesionalismo",
      "resolucionProblema",
      "amabilidad",
    ];

    for (const campo of camposObligatorios) {
      if (!respuestas[campo]) {
        return NextResponse.json(
          { success: false, error: `Falta la respuesta obligatoria: ${campo}` },
          { status: 400 }
        );
      }
    }

    // Buscar la encuesta en la base de datos
    const { data: encuesta, error: buscarError } = await supabase
      .from("encuestas_visitas")
      .select("id, estado")
      .eq("token", token)
      .single();

    if (buscarError || !encuesta) {
      return NextResponse.json(
        { success: false, error: "Encuesta no encontrada o enlace inválido" },
        { status: 404 }
      );
    }

    // Verificar si la encuesta ya fue completada
    if (encuesta.estado === "completada") {
      return NextResponse.json(
        { success: false, error: "Esta encuesta ya fue completada" },
        { status: 400 }
      );
    }

    // Actualizar la encuesta con las respuestas
    const { error: updateError } = await supabase
      .from("encuestas_visitas")
      .update({
        estado: "completada",
        respuestas: respuestas,
        completada_en: new Date().toISOString(),
      })
      .eq("token", token);

    if (updateError) {
      console.error("[API] Error guardando respuestas:", updateError);
      return NextResponse.json(
        { success: false, error: "Error al guardar las respuestas" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Encuesta completada exitosamente",
    });
  } catch (error) {
    console.error("[API] Error procesando encuesta:", error);
    return NextResponse.json(
      { success: false, error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}

