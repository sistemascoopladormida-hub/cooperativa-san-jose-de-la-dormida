export function getFacturasSupabaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
  if (!url) {
    throw new Error(
      "Falta NEXT_PUBLIC_SUPABASE_URL (portal de facturas proveedores)."
    );
  }
  return url;
}

export function getFacturasSupabaseAnonKey(): string {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    "";
  if (!key) {
    throw new Error(
      "Falta NEXT_PUBLIC_SUPABASE_ANON_KEY (portal de facturas proveedores)."
    );
  }
  return key;
}