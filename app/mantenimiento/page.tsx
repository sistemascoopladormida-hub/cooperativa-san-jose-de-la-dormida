import type { Metadata } from "next"
import MantenimientoView from "./view"

export const metadata: Metadata = {
  title: "Sitio en mantenimiento | Cooperativa La Dormida",
  description:
    "Estamos realizando tareas de mantenimiento en nuestro sitio web. Nuestros servicios continúan activos. Contacto: 3521 401330.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function MantenimientoPage() {
  return <MantenimientoView />
}
