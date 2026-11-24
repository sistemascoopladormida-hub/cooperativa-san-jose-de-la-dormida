export type FpUserRole =
  | "proveedor"
  | "compras"
  | "tesoreria"
  | "gerente"
  | "desarrollador";

export type FpSupplierStatus =
  | "borrador"
  | "pendiente_habilitacion"
  | "habilitado"
  | "suspendido"
  | "rechazado";

export interface FpProfile {
  id: string;
  email: string;
  role: FpUserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FpSupplier {
  id: string;
  profile_id: string;
  status: FpSupplierStatus;
  razon_social: string | null;
  email: string;
}

export interface FacturasSessionContext {
  userId: string;
  email: string | undefined;
  profile: FpProfile | null;
  supplier: FpSupplier | null;
}