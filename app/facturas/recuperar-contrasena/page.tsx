import Link from "next/link";
import { FacturasAuthCard } from "@/components/facturas/auth-card";
import { AuthField, FacturasAuthForm } from "@/components/facturas/auth-form";
import { requestPasswordReset } from "@/lib/facturas/actions/auth";

export default function RecuperarContrasenaPage() {
  return (
    <FacturasAuthCard
      title="Recuperar contraseña"
      description="Te enviaremos un enlace seguro a tu correo."
      footer={
        <p className="text-center">
          <Link href="/facturas/login" className="text-emerald-700 hover:underline">
            Volver al login
          </Link>
        </p>
      }
    >
      <FacturasAuthForm action={requestPasswordReset} submitLabel="Enviar enlace">
        <AuthField id="email" label="Email" name="email" type="email" autoComplete="email" />
      </FacturasAuthForm>
    </FacturasAuthCard>
  );
}