import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

export const runtime = "nodejs";

/**
 * POST /api/encuesta-box/generar-token
 * Genera un token único para un empleado/box
 * Requiere autenticación (puedes agregar validación de admin aquí)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { empleadoId } = body;

    if (!empleadoId) {
      return NextResponse.json(
        { success: false, error: "ID de empleado requerido" },
        { status: 400 }
      );
    }

    // Verificar que el empleado existe y está activo
    const { data: empleado, error: empleadoError } = await supabase
      .from("empleados_boxes")
      .select("*")
      .eq("id", empleadoId)
      .eq("activo", true)
      .single();

    if (empleadoError || !empleado) {
      return NextResponse.json(
        { success: false, error: "Empleado no encontrado o inactivo" },
        { status: 404 }
      );
    }

    // Generar token único
    const token = crypto.randomBytes(32).toString("hex");

    // Guardar el token en la base de datos
    const { data: qrToken, error: tokenError } = await supabase
      .from("qr_tokens_boxes")
      .insert({
        empleado_id: empleadoId,
        token: token,
        activo: true,
      })
      .select()
      .single();

    if (tokenError) {
      console.error("[ENCUESTA-BOX] Error generando token:", tokenError);
      return NextResponse.json(
        { success: false, error: "Error al generar el token" },
        { status: 500 }
      );
    }

    // Generar la URL completa para el QR
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://cooperativaladormida.com";
    const qrUrl = `${baseUrl}/encuesta-box/${token}`;

    return NextResponse.json({
      success: true,
      token: token,
      qrUrl: qrUrl,
      empleado: {
        id: empleado.id,
        nombre: empleado.nombre,
        boxNumero: empleado.box_numero,
      },
    });
  } catch (error: any) {
    console.error("[ENCUESTA-BOX] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al generar el token",
      },
      { status: 500 }
    );
  }
}
