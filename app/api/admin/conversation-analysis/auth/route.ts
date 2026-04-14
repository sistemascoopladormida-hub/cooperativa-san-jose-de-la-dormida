import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CONVERSATION_ANALYSIS_ADMIN_PASSWORD } from "@/lib/conversation-analysis-admin-password";

const COOKIE_NAME = "conversation_analysis_admin";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (password === CONVERSATION_ANALYSIS_ADMIN_PASSWORD) {
      const cookieStore = await cookies();
      cookieStore.set(COOKIE_NAME, "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "Contraseña incorrecta" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return NextResponse.json({ success: true });
}
