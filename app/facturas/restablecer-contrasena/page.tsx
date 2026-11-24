import { FacturasAuthCard } from "@/components/facturas/auth-card";
import { AuthField, FacturasAuthForm } from "@/components/facturas/auth-form";
import { updatePassword } from "@/lib/facturas/actions/auth";
import { RestablecerContrasenaClient } from "@/components/facturas/restablecer-client";

export default function RestablecerContrasenaPage() {
  return (
  <>
      <RestablecerContrasenaClient />
      <FacturasAuthCard
        title="Nueva contraseña"
        description="Definí una contraseña nueva para tu cuenta."
      >
        <FacturasAuthForm action={updatePassword} submitLabel="Guardar contraseña">
          <AuthField
            id="password"
            label="Contraseña nueva"
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
    </>
  );
}