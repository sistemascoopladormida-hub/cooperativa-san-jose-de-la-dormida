import type { FpUserRole } from "@/lib/facturas/types";

export const FP_ROLE_LABELS: Record<FpUserRole, string> = {
  proveedor: "Proveedor",
  compras: "Compras",
  tesoreria: "Tesorería",
  gerente: "Gerencia",
  desarrollador: "Desarrollo",
};

export function dashboardPathForRole(role: FpUserRole): string {
  switch (role) {
    case "proveedor":
      return "/facturas/dashboard/proveedor";
    case "compras":
      return "/facturas/dashboard/compras";
    case "tesoreria":
      return "/facturas/dashboard/tesoreria";
    case "gerente":
      return "/facturas/dashboard/gerencia";
    case "desarrollador":
      return "/facturas/dashboard/desarrollo";
    default:
      return "/facturas/acceso-denegado";
  }
}

export const PUBLIC_FACTURAS_PATHS = new Set([
  "/facturas/login",
  "/facturas/registro",
  "/facturas/recuperar-contrasena",
  "/facturas/restablecer-contrasena",
]);