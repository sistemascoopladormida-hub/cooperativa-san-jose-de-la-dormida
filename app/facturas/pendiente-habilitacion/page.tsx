import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireFacturasSession } from "@/lib/facturas/auth/session";
import { signOutFacturas } from "@/lib/facturas/actions/auth";

export default async function PendienteHabilitacionPage() {
  const session = await requireFacturasSession();

  const status = session.supplier?.status ?? "sin perfil fiscal";
  const isProveedor = session.profile?.role === "proveedor";

  if (isProveedor && session.supplier?.status === "habilitado") {
    return (
      <Card className="mx-auto mt-16 max-w-lg">
        <CardHeader>
          <CardTitle>Ya estás habilitado</CardTitle>
          <CardDescription>Podés ingresar al panel de proveedor.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/facturas/dashboard/proveedor">Ir al panel</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="max-w-lg border-amber-200">
        <CardHeader>
          <CardTitle>Pendiente de habilitación</CardTitle>
          <CardDescription>
            Tu usuario está registrado pero aún no puede operar en el circuito de
            facturas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-700">
          <p>
            Estado actual: <strong>{status}</strong>
          </p>
          {isProveedor ? (
            <p>
              En la <strong>Etapa 5</strong> vas a poder completar el perfil fiscal (CUIT,
              razón social, documentación) y solicitar habilitación a Compras.
            </p>
          ) : (
            <p>
              Contactá a Compras o al área técnica para activar tu rol en el portal.
            </p>
          )}
          <form action={signOutFacturas}>
            <Button type="submit" variant="outline">
              Cerrar sesión
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}