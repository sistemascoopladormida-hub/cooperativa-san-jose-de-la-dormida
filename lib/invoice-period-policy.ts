export const APRIL_2026_UNAVAILABLE_MESSAGE =
  "Las facturas de abril 2026 aún no se encuentran disponibles por problemas técnicos.\n" +
  "Si necesitás facturas de meses anteriores, por favor indicá el período correspondiente.";

export const INVOICE_PERIOD_NOT_FOUND_MESSAGE =
  "No se encontró la factura para el período solicitado. Por favor verificá el mes y año.";

export const BLOCKED_INVOICE_FOLDER_NAME = "facturas-Abril-2026";

export const MONTH_NAMES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

type InvoicePeriodRequest = {
  month?: string;
  months?: string[];
  year?: string;
};

export type ResolvedInvoicePeriod = {
  month: string;
  year: string;
};

export function normalizeMonth(month: string): string {
  return month.toLowerCase().trim();
}

export function inferInvoiceYearForMonth(
  month: string,
  explicitYear?: string,
  referenceDate = new Date()
): string {
  if (explicitYear) {
    return explicitYear;
  }

  const requestedMonthNumber = MONTH_NAMES.indexOf(
    normalizeMonth(month) as (typeof MONTH_NAMES)[number]
  ) + 1;
  const currentMonthNumber = referenceDate.getMonth() + 1;
  const currentYearNumber = referenceDate.getFullYear();

  if (requestedMonthNumber > currentMonthNumber) {
    return (currentYearNumber - 1).toString();
  }

  return currentYearNumber.toString();
}

export function resolveInvoicePeriods(
  request: InvoicePeriodRequest,
  referenceDate = new Date()
): ResolvedInvoicePeriod[] {
  const requestedMonths =
    request.months && request.months.length > 0
      ? request.months
      : request.month
        ? [request.month]
        : [];

  return requestedMonths.map((month) => {
    const normalizedMonth = normalizeMonth(month);
    return {
      month: normalizedMonth,
      year: inferInvoiceYearForMonth(
        normalizedMonth,
        request.year,
        referenceDate
      ),
    };
  });
}

export function getInvoicePeriodPolicy(
  request: InvoicePeriodRequest,
  referenceDate = new Date()
): {
  hasSpecifiedPeriod: boolean;
  isBlockedApril2026: boolean;
  periods: ResolvedInvoicePeriod[];
} {
  const periods = resolveInvoicePeriods(request, referenceDate);
  const isBlockedApril2026 = periods.some(
    (period) => period.month === "abril" && period.year === "2026"
  );

  return {
    hasSpecifiedPeriod: periods.length > 0,
    isBlockedApril2026,
    periods,
  };
}

export function isBlockedInvoiceFolderName(_folderName: string): boolean {
  return false;
}

export function isBlockedApril2026InvoicePeriod(
  _month: string,
  _year: string
): boolean {
  return false;
}
