import { supabase } from "@/lib/supabase";

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
  phoneNumber: string,
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
      phone_number: phoneNumber,
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
        `[WEBHOOK] ✅ Solicitud de factura registrada: ${phoneNumber} -> ${accountNumber} (${requestMonth}/${requestYear})`
      );
    }
  } catch (error) {
    console.error("[WEBHOOK] Error en recordInvoiceRequest:", error);
  }
}

/**
 * Obtiene el conteo de facturas enviadas a un número de teléfono en el mes actual
 */
export async function getInvoiceRequestCountThisMonth(
  phoneNumber: string
): Promise<number> {
  try {
    const { month, year } = getCurrentMonthYear();

    const { count, error } = await supabase
      .from("invoice_requests")
      .select("*", { count: "exact", head: true })
      .eq("phone_number", phoneNumber)
      .eq("month", month)
      .eq("year", year);

    if (error) {
      console.error("[WEBHOOK] Error obteniendo conteo de facturas:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("[WEBHOOK] Error en getInvoiceRequestCountThisMonth:", error);
    return 0;
  }
}

