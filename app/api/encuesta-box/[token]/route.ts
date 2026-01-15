import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * GET /api/encuesta-box/[token]
 * Valida el token y devuelve la información del empleado/box asociado
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token no proporcionado" },
        { status: 400 }
      );
    }

    // Buscar el token en la base de datos
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
          error: "Token inválido o expirado. El enlace puede ser inválido o haber expirado.",
        },
        { status: 404 }
      );
    }

    // Verificar que el empleado esté activo
    const empleado = qrToken.empleados_boxes as any;
    if (!empleado || !empleado.activo) {
      return NextResponse.json(
        {
          success: false,
          error: "El empleado asociado a este QR no está activo.",
        },
        { status: 404 }
      );
    }

    // Verificar si el token ha expirado (si tiene fecha de expiración)
    if (qrToken.fecha_expiracion) {
      const ahora = new Date();
      const expiracion = new Date(qrToken.fecha_expiracion);
      if (ahora > expiracion) {
        return NextResponse.json(
          {
            success: false,
            error: "Este token ha expirado.",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      empleado: {
        id: empleado.id,
        nombre: empleado.nombre,
        boxNumero: empleado.box_numero,
      },
      token: token,
    });
  } catch (error: any) {
    console.error("[ENCUESTA-BOX] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al validar el token",
      },
      { status: 500 }
    );
  }
}
