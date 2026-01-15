import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * GET /api/encuesta-box/empleados
 * Obtiene la lista de empleados activos
 */
export async function GET(request: NextRequest) {
  try {
    const { data: empleados, error } = await supabase
      .from("empleados_boxes")
      .select("*")
      .eq("activo", true)
      .order("box_numero", { ascending: true });

    if (error) {
      console.error("[ENCUESTA-BOX] Error obteniendo empleados:", error);
      return NextResponse.json(
        { success: false, error: "Error al obtener empleados" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      empleados: empleados || [],
    });
  } catch (error: any) {
    console.error("[ENCUESTA-BOX] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener empleados",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/encuesta-box/empleados
 * Crea un nuevo empleado
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, boxNumero } = body;

    if (!nombre || !boxNumero) {
      return NextResponse.json(
        { success: false, error: "Nombre y número de box son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el box no esté ya asignado
    const { data: existing } = await supabase
      .from("empleados_boxes")
      .select("id")
      .eq("box_numero", boxNumero)
      .eq("activo", true)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Este box ya está asignado a otro empleado" },
        { status: 400 }
      );
    }

    const { data: empleado, error } = await supabase
      .from("empleados_boxes")
      .insert({
        nombre: nombre,
        box_numero: boxNumero,
        activo: true,
      })
      .select()
      .single();

    if (error) {
      console.error("[ENCUESTA-BOX] Error creando empleado:", error);
      return NextResponse.json(
        { success: false, error: "Error al crear el empleado" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      empleado: empleado,
    });
  } catch (error: any) {
    console.error("[ENCUESTA-BOX] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear el empleado",
      },
      { status: 500 }
    );
  }
}
