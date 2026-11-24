import Link from "next/link";
import { FacturasAuthCard } from "@/components/facturas/auth-card";
import { AuthField, FacturasAuthForm } from "@/components/facturas/auth-form";
import { signInWithPassword } from "@/lib/facturas/actions/auth";
import { redirectIfAuthenticated } from "@/lib/facturas/auth/session";

export default async function FacturasLoginPage() {
  await redirectIfAuthenticated();

  return (
    <FacturasAuthCard
      title="Iniciar sesión"
      description="Acceso al portal de facturas de proveedores."
      footer={
        <p className="text-center text-muted-foreground">
          ¿No tenés cuenta?{" "}
          <Link href="/facturas/registro" className="text-emerald-700 hover:underline">
            Registrate como proveedor
          </Link>
        </p>
      }
    >
      <FacturasAuthForm action={signInWithPassword} submitLabel="Ingresar">
        <AuthField id="email" label="Email" name="email" type="email" autoComplete="email" />
        <AuthField
          id="password"
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
        />
        <p className="text-right text-sm">
          <Link href="/facturas/recuperar-contrasena" className="text-emerald-700 hover:underline">
            Olvidé mi contraseña
          </Link>
        </p>
      </FacturasAuthForm>
    </FacturasAuthCard>
  );
}