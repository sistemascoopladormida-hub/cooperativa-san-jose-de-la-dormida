"use client";

import { createBrowserClient } from "@supabase/ssr";
import {
  getFacturasSupabaseAnonKey,
  getFacturasSupabaseUrl,
} from "@/lib/facturas/env";

export function createFacturasBrowserClient() {
  return createBrowserClient(
    getFacturasSupabaseUrl(),
    getFacturasSupabaseAnonKey()
  );
}