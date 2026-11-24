import { NextResponse } from "next/server";
import { createFacturasServerClient } from "@/lib/facturas/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/facturas/dashboard";

  if (code) {
    const supabase = await createFacturasServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/facturas/login?error=auth_callback`);
}