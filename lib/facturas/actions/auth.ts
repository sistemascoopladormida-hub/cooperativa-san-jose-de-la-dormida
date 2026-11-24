"use server";

import { redirect } from "next/navigation";
import { createFacturasServerClient } from "@/lib/facturas/supabase/server";
import { resolvePostLoginPath } from "@/lib/facturas/auth/session";
import type { FacturasSessionContext } from "@/lib/facturas/types";

export type AuthActionState = {
  error?: string;
  success?: string;
};

export async function signInWithPassword(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Ingresá email y contraseña." };
  }

  const supabase = await createFacturasServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      error:
        error.message === "Invalid login credentials"
          ? "Credenciales incorrectas o cuenta no confirmada."
          : error.message,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No se pudo iniciar sesión." };
  }

  const { data: profile } = await supabase
    .from("fp_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  let supplier = null;
  if (profile?.role === "proveedor") {
    const { data } = await supabase
      .from("fp_suppliers")
      .select("id, profile_id, status, razon_social, email")
      .eq("profile_id", user.id)
      .maybeSingle();
    supplier = data;
  }

  const session: FacturasSessionContext = {
    userId: user.id,
    email: user.email,
    profile: profile ?? null,
    supplier,
  };

  redirect(resolvePostLoginPath(session));
}

export async function signUpProveedor(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!email || !password) {
    return { error: "Completá todos los campos." };
  }
  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }
  if (password !== confirm) {
    return { error: "Las contraseñas no coinciden." };
  }

  const supabase = await createFacturasServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/facturas/login`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user && !data.session) {
    return {
      success:
        "Revisá tu correo para confirmar la cuenta. Luego podrás iniciar sesión.",
    };
  }

  redirect("/facturas/pendiente-habilitacion");
}

export async function requestPasswordReset(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "Ingresá tu email." };
  }

  const supabase = await createFacturasServerClient();
  const redirectTo = `${
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  }/facturas/restablecer-contrasena`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success:
      "Si el correo existe en el sistema, enviamos un enlace para restablecer la contraseña.",
  };
}

export async function updatePassword(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }
  if (password !== confirm) {
    return { error: "Las contraseñas no coinciden." };
  }

  const supabase = await createFacturasServerClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  redirect("/facturas/login");
}

export async function signOutFacturas(): Promise<void> {
  const supabase = await createFacturasServerClient();
  await supabase.auth.signOut();
  redirect("/facturas/login");
}