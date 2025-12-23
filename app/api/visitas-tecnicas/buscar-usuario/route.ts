import { NextRequest, NextResponse } from "next/server";
import { buscarUsuarioPorCuenta } from "@/lib/sheets";

export async function POST(request: NextRequest) {
  try {
    const { numeroCuenta } = await request.json();

    if (!numeroCuenta || !numeroCuenta.trim()) {
      return NextResponse.json(
        { success: false, error: "Número de cuenta requerido" },
        { status: 400 }
      );
    }

    const usuario = await buscarUsuarioPorCuenta(numeroCuenta.trim());

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: "No se encontró usuario con ese número de cuenta" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      usuario,
    });
  } catch (error) {
    console.error("[API] Error buscando usuario:", error);
    return NextResponse.json(
      { success: false, error: "Error al buscar usuario" },
      { status: 500 }
    );
  }
}

