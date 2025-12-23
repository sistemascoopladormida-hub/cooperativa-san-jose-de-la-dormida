import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token requerido" },
        { status: 400 }
      );
    }

    // Buscar la encuesta en la base de datos
    const { data: encuesta, error } = await supabase
      .from("encuestas_visitas")
      .select("numero_cuenta, titular, tipo_servicio, estado, creado_en")
      .eq("token", token)
      .single();

    if (error || !encuesta) {
      // Si no existe la tabla o no encuentra la encuesta
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

    return NextResponse.json({
      success: true,
      encuesta: {
        numeroCuenta: encuesta.numero_cuenta,
        titular: encuesta.titular,
        tipoServicio: encuesta.tipo_servicio,
      },
    });
  } catch (error) {
    console.error("[API] Error obteniendo encuesta:", error);
    return NextResponse.json(
      { success: false, error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}

