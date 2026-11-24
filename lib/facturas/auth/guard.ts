import { redirect } from "next/navigation";
import { requireFacturasSession } from "@/lib/facturas/auth/session";
import type { FpUserRole } from "@/lib/facturas/types";

export async function requireRole(allowed: FpUserRole[]) {
  const session = await requireFacturasSession();
  const role = session.profile?.role;
  if (!role || !allowed.includes(role)) {
    redirect("/facturas/acceso-denegado");
  }
  return session;
}