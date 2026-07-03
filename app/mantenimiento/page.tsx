import type { Metadata } from "next"
import MantenimientoView from "./view"

export const metadata: Metadata = {
  title: "Sitio en mantenimiento | Cooperativa La Dormida",
  description:
    "Estamos realizando tareas de mantenimiento para brindarte un mejor servicio. Volveremos a estar disponibles muy pronto.",
}

export default function MantenimientoPage() {
  return <MantenimientoView />
}
