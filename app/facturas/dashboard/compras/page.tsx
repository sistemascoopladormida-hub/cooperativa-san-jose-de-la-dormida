import { FacturasDashboardPanel } from "@/components/facturas/dashboard-panel";
import { requireRole } from "@/lib/facturas/auth/guard";

export default async function ComprasDashboardPage() {
  await requireRole(["compras", "desarrollador"]);
  return (
    <FacturasDashboardPanel
      role="compras"
      description="Post control de facturas y habilitación de proveedores."
      nextSteps={[
        "Bandeja de facturas presentadas.",
        "Aprobar, observar o rechazar con trazabilidad.",
        "Habilitación de proveedores.",
      ]}
    />
  );
}