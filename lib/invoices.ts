import { supabase } from "@/lib/supabase";

/** Límite máximo de facturas que un usuario puede solicitar por mes (web y WhatsApp) */
export const MAX_INVOICES_PER_MONTH = 15;

/**
 * Obtiene el mes y año actual en formato para la consulta
 */
export function getCurrentMonthYear(): { month: string; year: string } {
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear().toString();
  return { month, year };
}

/**
 * Registra una solicitud de factura exitosa en Supabase
 */
export async function recordInvoiceRequest(
  userIdentifier: string,
  accountNumber: string,
  fileName: string,
  month?: string,
  year?: string
): Promise<void> {
  try {
    // Si no se especifica mes/año, usar el mes actual
    const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
    const requestMonth = month || currentMonth;
    const requestYear = year || currentYear;

    const { error } = await supabase.from("invoice_requests").insert({
      phone_number: userIdentifier,
      account_number: accountNumber,
      file_name: fileName,
      month: requestMonth,
      year: requestYear,
      requested_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[WEBHOOK] Error registrando solicitud de factura:", error);
    } else {
      console.log(
        `[INVOICES] ✅ Solicitud de factura registrada: ${userIdentifier} -> ${accountNumber} (${requestMonth}/${requestYear})`
      );
    }
  } catch (error) {
    console.error("[WEBHOOK] Error en recordInvoiceRequest:", error);
  }
}

/**
 * Verifica si el usuario puede solicitar más facturas este mes.
 * @param userIdentifier - Número de teléfono (WhatsApp) o "WEB-{sessionId}" (chat web)
 */
export async function canRequestMoreInvoices(
  userIdentifier: string
): Promise<boolean> {
  const count = await getInvoiceRequestCountThisMonth(userIdentifier);
  return count < MAX_INVOICES_PER_MONTH;
}

/**
 * Obtiene el conteo de facturas enviadas a un usuario en el mes actual (calendario).
 * El límite se reinicia automáticamente cada 1° de mes.
 * Cuenta por fecha de solicitud (requested_at), no por período de la factura.
 * @param userIdentifier - Número de teléfono (WhatsApp) o "WEB-{sessionId}" (chat web)
 */
export async function getInvoiceRequestCountThisMonth(
  userIdentifier: string
): Promise<number> {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const { count, error } = await supabase
      .from("invoice_requests")
      .select("*", { count: "exact", head: true })
      .eq("phone_number", userIdentifier)
      .gte("requested_at", startOfMonth.toISOString())
      .lt("requested_at", startOfNextMonth.toISOString());

    if (error) {
      console.error("[INVOICES] Error obteniendo conteo de facturas:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("[INVOICES] Error en getInvoiceRequestCountThisMonth:", error);
    return 0;
  }
}

