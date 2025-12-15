import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Chatbot from "@/components/chatbot"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Cooperativa Eléctrica Ltda. de San José de la Dormida",
  description:
    "Sitio oficial de la Cooperativa Eléctrica Ltda. de San José de la Dormida. Información institucional, servicios de energía eléctrica, internet, televisión y servicios sociales, canales de contacto y noticias para la comunidad.",
  keywords:
    "cooperativa eléctrica, San José de la Dormida, Córdoba, energía eléctrica, internet, televisión, servicios sociales, comunidad, socios",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        <Chatbot />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
