/**
 * Turnero de farmacias — fuente única de verdad para web y asistentes (web/WhatsApp).
 * Actualizar solo este archivo cuando cambie el turnero mensual.
 */

export type PharmacyScheduleEntry = {
  date: string
  pharmacy: string
}

/** Mes del turnero publicado (nombre en español, minúsculas). */
export const PHARMACY_SCHEDULE_MONTH = "Septiembre" as const

export const pharmacySchedule: PharmacyScheduleEntry[] = [
  { date: "3 de Septiembre", pharmacy: "Farmacia Social" },
  { date: "4 de Septiembre", pharmacy: "Farmacia Daniotti" },
  { date: "5 de Septiembre", pharmacy: "Farmacia Carreño" },
  { date: "6 de Septiembre", pharmacy: "Farmacia Robledo" },
  { date: "7 de Septiembre", pharmacy: "Farmacia Del Centro" },
  { date: "8 de Septiembre", pharmacy: "Farmacia Social" },
  { date: "9 de Septiembre", pharmacy: "Farmacia Daniotti" },
  { date: "10 de Septiembre", pharmacy: "Farmacia Carreño" },
  { date: "11 de Septiembre", pharmacy: "Farmacia Robledo" },
  { date: "12 de Septiembre", pharmacy: "Farmacia Del Centro" },
  { date: "13 de Septiembre", pharmacy: "Farmacia Social" },
  { date: "14 de Septiembre", pharmacy: "Farmacia Daniotti" },
  { date: "15 de Septiembre", pharmacy: "Farmacia Carreño" },
  { date: "16 de Septiembre", pharmacy: "Farmacia Robledo" },
  { date: "17 de Septiembre", pharmacy: "Farmacia Del Centro" },
  { date: "18 de Septiembre", pharmacy: "Farmacia Social" },
  { date: "19 de Septiembre", pharmacy: "Farmacia Daniotti" },
  { date: "20 de Septiembre", pharmacy: "Farmacia Carreño" },
  { date: "21 de Septiembre", pharmacy: "Farmacia Robledo" },
  { date: "22 de Septiembre", pharmacy: "Farmacia Del Centro" },
  { date: "23 de Septiembre", pharmacy: "Farmacia Social" },
  { date: "24 de Septiembre", pharmacy: "Farmacia Daniotti" },
  { date: "25 de Septiembre", pharmacy: "Farmacia Carreño" },
  { date: "26 de Septiembre", pharmacy: "Farmacia Robledo" },
  { date: "27 de Septiembre", pharmacy: "Farmacia Del Centro" },
  { date: "28 de Septiembre", pharmacy: "Farmacia Social" },
  { date: "29 de Septiembre", pharmacy: "Farmacia Daniotti" },
  { date: "30 de Septiembre", pharmacy: "Farmacia Carreño" },
]

const MONTH_INDEX: Record<string, number> = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
}

/** Parsea fechas en formato "DD de mes" (ej: "16 de junio"). */
export function parsePharmacyDate(
  dateString: string,
  referenceDate: Date = new Date()
): Date {
  const parts = dateString.toLowerCase().trim().split(" de ")
  if (parts.length !== 2) {
    return new Date(NaN)
  }

  const day = parseInt(parts[0], 10)
  const monthName = parts[1]?.trim()
  const month = MONTH_INDEX[monthName] ?? -1

  if (month === -1 || Number.isNaN(day)) {
    return new Date(NaN)
  }

  const date = new Date(referenceDate.getFullYear(), month, day)
  date.setHours(12, 0, 0, 0)
  return date
}

/** Indica si la fecha del turnero coincide con el día actual. */
export function isPharmacyDateToday(
  dateString: string,
  referenceDate: Date = new Date()
): boolean {
  const pharmacyDate = parsePharmacyDate(dateString, referenceDate)
  if (Number.isNaN(pharmacyDate.getTime())) {
    return false
  }

  const today = new Date(referenceDate)
  today.setHours(12, 0, 0, 0)

  return (
    pharmacyDate.getDate() === today.getDate() &&
    pharmacyDate.getMonth() === today.getMonth() &&
    pharmacyDate.getFullYear() === today.getFullYear()
  )
}

/** Bloque de texto para el contexto del asistente virtual (web y WhatsApp). */
export function formatPharmacyScheduleContextBlock(): string {
  const lines = pharmacySchedule
    .map((entry) => `- ${entry.date}: ${entry.pharmacy}`)
    .join("\n")
  return `TURNERO DE FARMACIAS (${PHARMACY_SCHEDULE_MONTH}, año en curso):\n${lines}`
}

/** Etiqueta del mes con primera letra en mayúscula (para la UI). */
export function getPharmacyScheduleMonthLabel(): string {
  return PHARMACY_SCHEDULE_MONTH.charAt(0).toUpperCase() + PHARMACY_SCHEDULE_MONTH.slice(1)
}
