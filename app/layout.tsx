import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Chatbot from "@/components/chatbot"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Cooperativa La Dormida - Blog informativo",
  description:
    "Página web informativa de la Cooperativa Eléctrica La Dormida.",
  keywords: "cooperativa, electricidad, internet, television, farmacia, La Dormida",
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
