"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { FP_ROLE_LABELS } from "@/lib/facturas/auth/roles";
import type { FpUserRole } from "@/lib/facturas/types";
import { signOutFacturas } from "@/lib/facturas/actions/auth";

const NAV: { href: string; label: string; roles?: FpUserRole[] }[] = [
  { href: "/facturas/dashboard/proveedor", label: "Inicio", roles: ["proveedor"] },
  { href: "/facturas/dashboard/compras", label: "Inicio", roles: ["compras"] },
  { href: "/facturas/dashboard/tesoreria", label: "Inicio", roles: ["tesoreria"] },
  { href: "/facturas/dashboard/gerencia", label: "Inicio", roles: ["gerente"] },
  { href: "/facturas/dashboard/desarrollo", label: "Inicio", roles: ["desarrollador"] },
];

export function FacturasPortalShell({
  role,
  email,
  children,
}: {
  role: FpUserRole;
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = NAV.filter((n) => !n.roles || n.roles.includes(role));

  const NavLinks = () => (
    <nav className="flex flex-col gap-1">
      {links.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            pathname === item.href
              ? "bg-emerald-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="border-b px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Facturas proveedores
          </p>
          <p className="mt-1 text-sm text-slate-600">Cooperativa Eléctrica</p>
        </div>
        <div className="flex-1 p-4">
          <NavLinks />
        </div>
        <div className="border-t p-4 text-sm">
          <p className="font-medium text-slate-900 truncate">{email}</p>
          <p className="text-slate-500">{FP_ROLE_LABELS[role]}</p>
          <form action={signOutFacturas} className="mt-3">
            <Button type="submit" variant="outline" size="sm" className="w-full gap-2">
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:px-8">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="icon" aria-label="Abrir menú">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <div className="mb-6 flex items-center justify-between">
                <span className="font-semibold text-emerald-800">Menú</span>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <NavLinks />
              <form action={signOutFacturas} className="mt-8">
                <Button type="submit" variant="outline" className="w-full gap-2">
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </Button>
              </form>
            </SheetContent>
          </Sheet>
          <div className="text-sm text-slate-600 lg:hidden">
            {FP_ROLE_LABELS[role]}
          </div>
          <div className="hidden text-sm text-slate-600 lg:block">
            Sesión: <span className="font-medium text-slate-900">{email}</span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}