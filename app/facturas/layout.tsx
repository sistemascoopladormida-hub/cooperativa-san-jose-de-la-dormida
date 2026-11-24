import type { Metadata } from "next";
import type { ReactNode } from "react";
import { FacturasPortalChrome } from "@/components/facturas/portal-chrome";

export const metadata: Metadata = {
  title: {
    default: "Facturas proveedores | Cooperativa Eléctrica",
    template: "%s | Facturas proveedores",
  },
  description:
    "Portal de gestión de facturas de proveedores de la Cooperativa Eléctrica San José de la Dormida.",
  robots: { index: false, follow: false },
};

export default function FacturasRootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <FacturasPortalChrome />
      {children}
    </>
  );
}