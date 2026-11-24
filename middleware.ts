import { NextResponse, type NextRequest } from "next/server";
import { updateFacturasSession } from "@/lib/facturas/supabase/middleware";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/facturas")) {
    return updateFacturasSession(request);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/facturas/:path*"],
};