import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  getFacturasSupabaseAnonKey,
  getFacturasSupabaseUrl,
} from "@/lib/facturas/env";

export async function createFacturasServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    getFacturasSupabaseUrl(),
    getFacturasSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component sin mutación de cookies
          }
        },
      },
    }
  );
}