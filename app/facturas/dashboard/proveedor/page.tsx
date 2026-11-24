import { FacturasDashboardPanel } from "@/components/facturas/dashboard-panel";
import { requireRole } from "@/lib/facturas/auth/guard";

export default async function ProveedorDashboardPage() {
  await requireRole(["proveedor", "desarrollador"]);
  return (
    <FacturasDashboardPanel
      role="proveedor"
      description="Presentación y seguimiento de facturas de su empresa."
      nextSteps={[
        "Completar o actualizar datos fiscales (próxima etapa).",
        "Presentar facturas con PDF adjunto.",
        "Corregir facturas observadas con nuevo comprobante.",
      ]}
    />
  );
}