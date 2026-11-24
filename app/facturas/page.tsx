import { redirect } from "next/navigation";
import {
  getFacturasSession,
  resolvePostLoginPath,
} from "@/lib/facturas/auth/session";

export default async function FacturasEntryPage() {
  const session = await getFacturasSession();
  if (!session) {
    redirect("/facturas/login");
  }
  redirect(resolvePostLoginPath(session));
}