import { FacturasDashboardPanel } from "@/components/facturas/dashboard-panel";
import { requireRole } from "@/lib/facturas/auth/guard";

export default async function TesoreriaDashboardPage() {
  await requireRole(["tesoreria", "desarrollador"]);
  return (
    <FacturasDashboardPanel
      role="tesoreria"
      description="Pagos parciales y totales con comprobante obligatorio."
      nextSteps={[
        "Preparar pagos con idempotencia.",
        "Subir comprobante a Storage y confirmar.",
        "Seguimiento de saldos pendientes.",
      ]}
    />
  );
}