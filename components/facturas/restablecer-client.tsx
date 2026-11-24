"use client";

import { useEffect } from "react";
import { createFacturasBrowserClient } from "@/lib/facturas/supabase/client";

/** Procesa tokens de recuperación que llegan en el hash de la URL (flujo Supabase). */
export function RestablecerContrasenaClient() {
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    if (!accessToken || !refreshToken) return;

    const supabase = createFacturasBrowserClient();
    void supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(() => {
        window.history.replaceState(null, "", window.location.pathname);
      });
  }, []);

  return null;
}