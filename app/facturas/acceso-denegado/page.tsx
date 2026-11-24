import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getFacturasSession } from "@/lib/facturas/auth/session";
import { signOutFacturas } from "@/lib/facturas/actions/auth";

export default async function AccesoDenegadoPage() {
  const session = await getFacturasSession();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="max-w-lg border-red-200">
        <CardHeader>
          <CardTitle>Acceso denegado</CardTitle>
          <CardDescription>
            No tenés permiso para ver esta sección o tu cuenta está inactiva.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild variant="default">
            <Link href="/facturas/login">Ir al login</Link>
          </Button>
          {session ? (
            <form action={signOutFacturas}>
              <Button type="submit" variant="outline">
                Cerrar sesión
              </Button>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}