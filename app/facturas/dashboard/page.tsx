import { redirect } from "next/navigation";
import { requireFacturasSession, resolvePostLoginPath } from "@/lib/facturas/auth/session";

export default async function DashboardIndexPage() {
  const session = await requireFacturasSession();
  redirect(resolvePostLoginPath(session));
}