import { FacturasDashboardPanel } from "@/components/facturas/dashboard-panel";
import { requireRole } from "@/lib/facturas/auth/guard";

export default async function GerenciaDashboardPage() {
  await requireRole(["gerente", "desarrollador"]);
  return (
    <FacturasDashboardPanel
      role="gerente"
      description="Vista de lectura e indicadores del circuito de facturas."
      nextSteps={[
        "Consulta de facturas y pagos (solo lectura).",
        "Informes consolidados en etapas posteriores.",
      ]}
    />
  );
}