import { FacturasDashboardPanel } from "@/components/facturas/dashboard-panel";
import { requireRole } from "@/lib/facturas/auth/guard";

export default async function DesarrolloDashboardPage() {
  await requireRole(["desarrollador"]);
  return (
    <FacturasDashboardPanel
      role="desarrollador"
      description="Administración técnica del módulo fp_*."
      nextSteps={[
        "Asignación de roles vía fp_developer_set_user_role.",
        "Monitoreo de auditoría y pruebas en staging.",
      ]}
    />
  );
}