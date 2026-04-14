import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "conversation_analysis_admin";

export async function GET() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(COOKIE_NAME);

  return NextResponse.json({
    authenticated: authCookie?.value === "authenticated",
  });
}
