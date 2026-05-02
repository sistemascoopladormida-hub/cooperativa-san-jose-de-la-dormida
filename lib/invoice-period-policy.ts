export const APRIL_2026_UNAVAILABLE_MESSAGE =
  "Las facturas de abril 2026 aún no se encuentran disponibles por problemas técnicos.\n" +
  "Si necesitás facturas de meses anteriores, por favor indicá el período correspondiente.";

export const BLOCKED_INVOICE_FOLDER_NAME = "facturas-Abril-2026";

const MONTH_NAMES = [
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

function normalizeMonth(month: string): string {
  return month.toLowerCase().trim();
}

function inferInvoiceYearForMonth(
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

export function getInvoicePeriodPolicy(
  request: InvoicePeriodRequest,
  referenceDate = new Date()
): {
  hasSpecifiedPeriod: boolean;
  isBlockedApril2026: boolean;
} {
  const requestedMonths =
    request.months && request.months.length > 0
      ? request.months
      : request.month
        ? [request.month]
        : [];

  const isBlockedApril2026 = requestedMonths.some((month) => {
    const normalizedMonth = normalizeMonth(month);
    const inferredYear = inferInvoiceYearForMonth(
      normalizedMonth,
      request.year,
      referenceDate
    );

    return normalizedMonth === "abril" && inferredYear === "2026";
  });

  return {
    hasSpecifiedPeriod: requestedMonths.length > 0,
    isBlockedApril2026,
  };
}

export function isBlockedInvoiceFolderName(folderName: string): boolean {
  return folderName.toLowerCase() === BLOCKED_INVOICE_FOLDER_NAME.toLowerCase();
}

export function isBlockedApril2026InvoicePeriod(
  month: string,
  year: string
): boolean {
  return normalizeMonth(month) === "abril" && year === "2026";
}
