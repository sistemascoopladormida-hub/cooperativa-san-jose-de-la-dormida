import type { ReactNode } from "react";
import { FacturasPortalShell } from "@/components/facturas/portal-shell";
import { requireFacturasSession } from "@/lib/facturas/auth/session";
import { redirect } from "next/navigation";

export default async function FacturasDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireFacturasSession();
  const profile = session.profile;

  if (!profile) {
    redirect("/facturas/acceso-denegado");
  }

  // Proveedores no habilitados no usan shell de dashboard operativo
  if (profile.role === "proveedor") {
    const status = session.supplier?.status;
    if (status !== "habilitado") {
      redirect("/facturas/pendiente-habilitacion");
    }
  }

  return (
    <FacturasPortalShell
      role={profile.role}
      email={profile.email ?? session.email ?? ""}
    >
      {children}
    </FacturasPortalShell>
  );
}