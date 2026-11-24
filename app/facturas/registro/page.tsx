import Link from "next/link";
import { FacturasAuthCard } from "@/components/facturas/auth-card";
import { AuthField, FacturasAuthForm } from "@/components/facturas/auth-form";
import { signUpProveedor } from "@/lib/facturas/actions/auth";
import { redirectIfAuthenticated } from "@/lib/facturas/auth/session";

export default async function FacturasRegistroPage() {
  await redirectIfAuthenticated();

  return (
    <FacturasAuthCard
      title="Registro de proveedor"
      description="Creá tu usuario. Deberás completar el perfil fiscal y esperar habilitación de Compras (Etapa 5)."
      footer={
        <p className="text-center text-muted-foreground">
          ¿Ya tenés cuenta?{" "}
          <Link href="/facturas/login" className="text-emerald-700 hover:underline">
            Iniciar sesión
          </Link>
        </p>
      }
    >
      <FacturasAuthForm action={signUpProveedor} submitLabel="Crear cuenta">
        <AuthField id="email" label="Email" name="email" type="email" autoComplete="email" />
        <AuthField
          id="password"
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="new-password"
        />
        <AuthField
          id="confirmPassword"
          label="Confirmar contraseña"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
        />
      </FacturasAuthForm>
    </FacturasAuthCard>
  );
}