import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Revista Digital | Cooperativa La Dormida",
  description:
    "Leé la revista digital de la Cooperativa Eléctrica Ltda. de San José de la Dormida con efecto de revista interactiva, noticias e información para la comunidad.",
  openGraph: {
    title: "Revista Digital | Cooperativa La Dormida",
    description:
      "Revista digital interactiva de la Cooperativa Eléctrica Ltda. de San José de la Dormida. Noticias, novedades e información para la comunidad.",
    url: "https://cooperativaladormida.com/revista",
    siteName: "Cooperativa La Dormida",
    images: [
      {
        url: "/images/revista-cover.png",
        width: 1200,
        height: 630,
        alt: "Portada de la revista digital de la Cooperativa La Dormida",
      },
    ],
    type: "article",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Revista Digital | Cooperativa La Dormida",
    description:
      "Revista digital interactiva de la Cooperativa Eléctrica Ltda. de San José de la Dormida con efecto de pasada de páginas.",
    images: ["/images/revista-cover.png"],
  },
}

export default function RevistaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

