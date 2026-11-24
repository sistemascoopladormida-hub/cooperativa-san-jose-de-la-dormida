import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FP_ROLE_LABELS } from "@/lib/facturas/auth/roles";
import type { FpUserRole } from "@/lib/facturas/types";

export function FacturasDashboardPanel({
  role,
  description,
  nextSteps,
}: {
  role: FpUserRole;
  description: string;
  nextSteps: string[];
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <DashboardIntro role={role} />
      <Card>
        <CardHeader>
          <CardTitle>Panel {FP_ROLE_LABELS[role]}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-slate-600">
            Etapa 4 — estructura inicial del portal. La gestión operativa de facturas
            se implementará en etapas siguientes.
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
            {nextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardIntro({ role }: { role: FpUserRole }) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-6">
      <h1 className="text-2xl font-semibold text-slate-900">
        Bienvenido al portal de facturas
      </h1>
      <p className="mt-2 text-slate-600">
        Rol activo: <strong>{FP_ROLE_LABELS[role]}</strong>
      </p>
    </div>
  );
}