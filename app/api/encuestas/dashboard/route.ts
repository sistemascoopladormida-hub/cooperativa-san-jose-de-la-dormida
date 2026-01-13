import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    // Obtener todas las encuestas completadas
    const { data: encuestas, error } = await supabase
      .from("encuestas_visitas")
      .select("*")
      .eq("estado", "completada")
      .order("completada_en", { ascending: false });

    if (error) {
      console.error("[API] Error obteniendo encuestas:", error);
      return NextResponse.json(
        { success: false, error: "Error al obtener las encuestas" },
        { status: 500 }
      );
    }

    if (!encuestas || encuestas.length === 0) {
      return NextResponse.json({
        success: true,
        encuestas: [],
        metricas: {
          total: 0,
          porServicio: {},
          calificacionPromedio: 0,
          tiempoRespuesta: {},
          profesionalismo: {},
          resolucion: {},
          amabilidadPromedio: 0,
        },
      });
    }

    // Calcular métricas
    const total = encuestas.length;

    // Métricas por servicio
    const porServicio: Record<string, number> = {};
    encuestas.forEach((encuesta) => {
      const servicio = encuesta.tipo_servicio || "Otro";
      porServicio[servicio] = (porServicio[servicio] || 0) + 1;
    });

    // Calificaciones promedio
    let sumaCalificacionGeneral = 0;
    let sumaAmabilidad = 0;
    let countCalificaciones = 0;
    let countAmabilidad = 0;

    // Distribución de tiempo de respuesta
    const tiempoRespuesta: Record<string, number> = {};

    // Distribución de profesionalismo
    const profesionalismo: Record<string, number> = {};

    // Distribución de resolución
    const resolucion: Record<string, number> = {};

    encuestas.forEach((encuesta) => {
      const respuestas = encuesta.respuestas as any;

      if (respuestas) {
        // Calificación general
        if (respuestas.calificacionGeneral) {
          const calif = parseInt(respuestas.calificacionGeneral);
          if (!isNaN(calif)) {
            sumaCalificacionGeneral += calif;
            countCalificaciones++;
          }
        }

        // Amabilidad
        if (respuestas.amabilidad) {
          const calif = parseInt(respuestas.amabilidad);
          if (!isNaN(calif)) {
            sumaAmabilidad += calif;
            countAmabilidad++;
          }
        }

        // Tiempo de respuesta
        if (respuestas.puntualidad) {
          const tiempo = respuestas.puntualidad;
          tiempoRespuesta[tiempo] = (tiempoRespuesta[tiempo] || 0) + 1;
        }

        // Profesionalismo
        if (respuestas.profesionalismo) {
          const prof = respuestas.profesionalismo;
          profesionalismo[prof] = (profesionalismo[prof] || 0) + 1;
        }

        // Resolución
        if (respuestas.resolucionProblema) {
          const resol = respuestas.resolucionProblema;
          resolucion[resol] = (resolucion[resol] || 0) + 1;
        }
      }
    });

    const calificacionPromedio =
      countCalificaciones > 0 ? sumaCalificacionGeneral / countCalificaciones : 0;
    const amabilidadPromedio =
      countAmabilidad > 0 ? sumaAmabilidad / countAmabilidad : 0;

    // Formatear datos para el frontend
    const encuestasFormateadas = encuestas.map((encuesta) => ({
      id: encuesta.id,
      token: encuesta.token,
      numeroCuenta: encuesta.numero_cuenta,
      titular: encuesta.titular,
      telefono: encuesta.telefono,
      tipoServicio: encuesta.tipo_servicio,
      tecnico: encuesta.tecnico || null,
      estado: encuesta.estado,
      creadoEn: encuesta.creado_en,
      enviadoEn: encuesta.enviado_en,
      completadaEn: encuesta.completada_en,
      respuestas: encuesta.respuestas,
    }));

    return NextResponse.json({
      success: true,
      encuestas: encuestasFormateadas,
      metricas: {
        total,
        porServicio,
        calificacionPromedio: Math.round(calificacionPromedio * 10) / 10,
        tiempoRespuesta,
        profesionalismo,
        resolucion,
        amabilidadPromedio: Math.round(amabilidadPromedio * 10) / 10,
      },
    });
  } catch (error) {
    console.error("[API] Error procesando dashboard:", error);
    return NextResponse.json(
      { success: false, error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
