import { redirect } from "next/navigation";
import { createFacturasServerClient } from "@/lib/facturas/supabase/server";
import type { FacturasSessionContext, FpProfile, FpSupplier } from "@/lib/facturas/types";
import { dashboardPathForRole } from "@/lib/facturas/auth/roles";

export async function getFacturasSession(): Promise<FacturasSessionContext | null> {
  const supabase = await createFacturasServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profileRow } = await supabase
    .from("fp_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const profile = (profileRow as FpProfile | null) ?? null;

  let supplier: FpSupplier | null = null;
  if (profile?.role === "proveedor") {
    const { data: supplierRow } = await supabase
      .from("fp_suppliers")
      .select("id, profile_id, status, razon_social, email")
      .eq("profile_id", user.id)
      .maybeSingle();
    supplier = (supplierRow as FpSupplier | null) ?? null;
  }

  return {
    userId: user.id,
    email: user.email,
    profile,
    supplier,
  };
}

export async function requireFacturasSession(
  loginPath = "/facturas/login"
): Promise<FacturasSessionContext> {
  const session = await getFacturasSession();
  if (!session) {
    redirect(loginPath);
  }
  if (!session.profile?.is_active) {
    redirect("/facturas/acceso-denegado");
  }
  return session;
}

export async function redirectIfAuthenticated(
  target = "/facturas/dashboard"
): Promise<void> {
  const session = await getFacturasSession();
  if (!session?.profile?.is_active) {
    return;
  }
  redirect(target);
}

export function resolvePostLoginPath(
  session: FacturasSessionContext
): string {
  if (!session.profile) {
    return "/facturas/acceso-denegado";
  }

  if (session.profile.role === "proveedor") {
    const status = session.supplier?.status;
    if (!session.supplier || status === "borrador") {
      return "/facturas/pendiente-habilitacion";
    }
    if (status !== "habilitado") {
      return "/facturas/pendiente-habilitacion";
    }
    return dashboardPathForRole("proveedor");
  }

  return dashboardPathForRole(session.profile.role);
}