import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * GET /api/encuesta-box/dashboard
 * Obtiene todas las encuestas completadas con métricas
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener todas las encuestas completadas
    const { data: encuestas, error: encuestasError } = await supabase
      .from("encuestas_boxes")
      .select("*")
      .eq("estado", "completada")
      .order("completada_en", { ascending: false });

    if (encuestasError) {
      console.error("[ENCUESTA-BOX] Error obteniendo encuestas:", encuestasError);
      return NextResponse.json(
        { success: false, error: "Error al obtener encuestas" },
        { status: 500 }
      );
    }

    // Calcular métricas
    const total = encuestas?.length || 0;

    // Métricas por empleado
    const porEmpleado: Record<string, number> = {};
    const calificacionesPorEmpleado: Record<string, number[]> = {};
    const tiempoEsperaPorEmpleado: Record<string, Record<string, number>> = {};
    const resolucionPorEmpleado: Record<string, Record<string, number>> = {};
    const amabilidadPorEmpleado: Record<string, number[]> = {};

    encuestas?.forEach((encuesta: any) => {
      const nombreEmpleado = encuesta.nombre_empleado;
      const respuestas = encuesta.respuestas || {};

      // Contar por empleado
      porEmpleado[nombreEmpleado] = (porEmpleado[nombreEmpleado] || 0) + 1;

      // Calificaciones
      if (respuestas.calificacionGeneral) {
        const calif = parseInt(respuestas.calificacionGeneral);
        if (!calificacionesPorEmpleado[nombreEmpleado]) {
          calificacionesPorEmpleado[nombreEmpleado] = [];
        }
        calificacionesPorEmpleado[nombreEmpleado].push(calif);
      }

      // Tiempo de espera
      if (respuestas.tiempoEspera) {
        if (!tiempoEsperaPorEmpleado[nombreEmpleado]) {
          tiempoEsperaPorEmpleado[nombreEmpleado] = {};
        }
        tiempoEsperaPorEmpleado[nombreEmpleado][respuestas.tiempoEspera] =
          (tiempoEsperaPorEmpleado[nombreEmpleado][respuestas.tiempoEspera] || 0) + 1;
      }

      // Resolución
      if (respuestas.resolucionProblema) {
        if (!resolucionPorEmpleado[nombreEmpleado]) {
          resolucionPorEmpleado[nombreEmpleado] = {};
        }
        resolucionPorEmpleado[nombreEmpleado][respuestas.resolucionProblema] =
          (resolucionPorEmpleado[nombreEmpleado][respuestas.resolucionProblema] || 0) + 1;
      }

      // Amabilidad
      if (respuestas.amabilidad) {
        const amab = parseInt(respuestas.amabilidad);
        if (!amabilidadPorEmpleado[nombreEmpleado]) {
          amabilidadPorEmpleado[nombreEmpleado] = [];
        }
        amabilidadPorEmpleado[nombreEmpleado].push(amab);
      }
    });

    // Calcular promedios
    const calificacionPromedioPorEmpleado: Record<string, number> = {};
    Object.keys(calificacionesPorEmpleado).forEach((empleado) => {
      const califs = calificacionesPorEmpleado[empleado];
      const promedio =
        califs.reduce((sum, val) => sum + val, 0) / califs.length;
      calificacionPromedioPorEmpleado[empleado] = Math.round(promedio * 10) / 10;
    });

    const amabilidadPromedioPorEmpleado: Record<string, number> = {};
    Object.keys(amabilidadPorEmpleado).forEach((empleado) => {
      const amabs = amabilidadPorEmpleado[empleado];
      const promedio = amabs.reduce((sum, val) => sum + val, 0) / amabs.length;
      amabilidadPromedioPorEmpleado[empleado] = Math.round(promedio * 10) / 10;
    });

    // Calcular promedio general
    const todasCalificaciones: number[] = [];
    Object.values(calificacionesPorEmpleado).forEach((califs) => {
      todasCalificaciones.push(...califs);
    });
    const calificacionPromedio =
      todasCalificaciones.length > 0
        ? Math.round(
            (todasCalificaciones.reduce((sum, val) => sum + val, 0) /
              todasCalificaciones.length) *
              10
          ) / 10
        : 0;

    const todasAmabilidades: number[] = [];
    Object.values(amabilidadPorEmpleado).forEach((amabs) => {
      todasAmabilidades.push(...amabs);
    });
    const amabilidadPromedio =
      todasAmabilidades.length > 0
        ? Math.round(
            (todasAmabilidades.reduce((sum, val) => sum + val, 0) /
              todasAmabilidades.length) *
              10
          ) / 10
        : 0;

    // Métricas por box
    const porBox: Record<number, number> = {};
    encuestas?.forEach((encuesta: any) => {
      const box = encuesta.box_numero;
      porBox[box] = (porBox[box] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      encuestas: encuestas || [],
      metricas: {
        total,
        porEmpleado,
        porBox,
        calificacionPromedio,
        calificacionPromedioPorEmpleado,
        amabilidadPromedio,
        amabilidadPromedioPorEmpleado,
        tiempoEsperaPorEmpleado,
        resolucionPorEmpleado,
      },
    });
  } catch (error: any) {
    console.error("[ENCUESTA-BOX] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener datos del dashboard",
      },
      { status: 500 }
    );
  }
}
