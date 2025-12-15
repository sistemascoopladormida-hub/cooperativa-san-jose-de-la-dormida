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

  // 👇 Esto controla el favicon en navegadores (según la doc de Next.js)
  // Debes tener `app/favicon.ico`
  icons: {
    icon: "/favicon.ico",
  },

  // 👇 IMPORTANTE: las previsualizaciones de WhatsApp/redes NO usan el favicon,
  // usan la imagen Open Graph. Aquí defines qué imagen se muestra al compartir el link.
  openGraph: {
    title: "Cooperativa Eléctrica Ltda. de San José de la Dormida",
    description:
      "Servicios que conectan, comunidad que crece. Información sobre energía eléctrica, internet, TV y servicios sociales.",
    url: "https://cooperativaladormida.com/", // cámbialo por tu dominio real
    siteName: "Cooperativa Eléctrica San José de la Dormida",
    images: [
      {
        url: "/images/logocoopnuevo.png", // una imagen cuadrada o 1200x630 aprox
        width: 400,
        height: 400,
        alt: "Logo de la Cooperativa Eléctrica San José de la Dormida",
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
      <body className={inter.className}>
        {children}
        <Chatbot />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
