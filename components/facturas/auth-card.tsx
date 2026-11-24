import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function FacturasAuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-3 text-center text-white">
        <Image
          src="/images/logocoopnuevo.png"
          alt="Cooperativa Eléctrica San José de la Dormida"
          width={72}
          height={72}
          className="rounded-full bg-white p-1"
        />
        <p className="text-sm uppercase tracking-widest text-emerald-200/80">
          Portal de proveedores
        </p>
        <Link href="/" className="text-xs text-emerald-100/70 hover:text-white">
          Volver al sitio institucional
        </Link>
      </div>
      <Card className="w-full max-w-md border-emerald-900/30 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">{children}</CardContent>
        {footer ? <div className="border-t px-6 py-4 text-sm">{footer}</div> : null}
      </Card>
    </div>
  );
}