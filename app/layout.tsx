import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Chatbot from "@/components/chatbot"
import TorneoClausuraWelcome from "@/components/home/torneo-clausura-welcome"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Cooperativa Eléctrica Ltda. de San José de la Dormida — Octubre Rosa 🩷",
  description:
    "Sitio oficial de la Cooperativa Eléctrica Ltda. de San José de la Dormida. En este Octubre Rosa nos unimos a la campaña de concientización y prevención del cáncer de mama. Conocé nuestros servicios de energía eléctrica, internet, televisión y servicios sociales.",
  keywords:
    "cooperativa eléctrica, San José de la Dormida, Córdoba, Octubre Rosa, concientización cáncer de mama, prevención, energía eléctrica, internet, televisión, servicios sociales, comunidad, socios",

  // 👇 Controla el favicon en navegadores
  icons: {
    icon: "/favicon.ico",
  },

  // 👇 Previsualización en WhatsApp y redes sociales adaptada al Mes Rosa
  openGraph: {
    title: "Cooperativa Eléctrica Ltda. de San José de la Dormida — Octubre Rosa 🩷",
    description:
      "Nos unimos al Mes Rosa por la concientización y prevención del cáncer de mama. Servicios que conectan, comunidad que crece.",
    url: "https://cooperativaladormida.com/",
    siteName: "Cooperativa Eléctrica San José de la Dormida",
    images: [
      {
        url: "/octubrelogo.webp", // Logo del Mes Rosa para WhatsApp y redes
        width: 1200,
        height: 630,
        alt: "Logo Octubre Rosa - Cooperativa Eléctrica San José de la Dormida",
      },
    ],
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <meta name="facebook-domain-verification" content="0nxwl112pm8f3hnhrf96zrsmnou8lx" />
      </head>
      <body className={inter.className}>
        {children}
        <TorneoClausuraWelcome />
        <Chatbot />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}