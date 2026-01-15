import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * GET /api/encuesta-box/tokens
 * Obtiene todos los tokens activos con información del empleado
 */
export async function GET(request: NextRequest) {
  try {
    const { data: tokens, error } = await supabase
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
      .eq("activo", true)
      .order("fecha_creacion", { ascending: false });

    if (error) {
      console.error("[ENCUESTA-BOX] Error obteniendo tokens:", error);
      return NextResponse.json(
        { success: false, error: "Error al obtener tokens" },
        { status: 500 }
      );
    }

    // Formatear los datos
    const tokensFormateados = (tokens || []).map((token: any) => {
      const empleado = token.empleados_boxes as any;
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "https://cooperativaladormida.com";
      const qrUrl = `${baseUrl}/encuesta-box/${token.token}`;

      return {
        id: token.id,
        token: token.token,
        qrUrl: qrUrl,
        empleado: {
          id: empleado?.id,
          nombre: empleado?.nombre,
          boxNumero: empleado?.box_numero,
        },
        fechaCreacion: token.fecha_creacion,
        activo: token.activo,
      };
    });

    return NextResponse.json({
      success: true,
      tokens: tokensFormateados,
    });
  } catch (error: any) {
    console.error("[ENCUESTA-BOX] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener tokens",
      },
      { status: 500 }
    );
  }
}
