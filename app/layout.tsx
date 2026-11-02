import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Chatbot from "@/components/chatbot"
import SubsidioLuzWelcome from "@/components/home/subsidio-luz-welcome"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Cooperativa Eléctrica Ltda. de San José de la Dormida",
  description:
    "Sitio oficial de la Cooperativa Eléctrica Ltda. de San José de la Dormida. Información institucional, servicios de energía eléctrica, internet, televisión y servicios sociales, canales de contacto y noticias para la comunidad.",
  keywords:
    "cooperativa eléctrica, San José de la Dormida, Córdoba, energía eléctrica, internet, televisión, servicios sociales, comunidad, socios",

  icons: {
    icon: "/favicon.ico",
  },

  openGraph: {
    title: "Cooperativa Eléctrica Ltda. de San José de la Dormida",
    description:
      "Servicios que conectan, comunidad que crece. Información sobre energía eléctrica, internet, TV y servicios sociales.",
    url: "https://cooperativaladormida.com/",
    siteName: "Cooperativa Eléctrica San José de la Dormida",
    images: [
      {
        url: "/images/logocoopnuevo.png",
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
      <head>
        <meta name="facebook-domain-verification" content="0nxwl112pm8f3hnhrf96zrsmnou8lx" />
      </head>
      <body className={inter.className}>
        {children}
        <SubsidioLuzWelcome />
        <Chatbot />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
