import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cooperativaladormida.com"
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const STORAGE_BUCKET = "news-images" // Bucket en Supabase
const STORAGE_FOLDER = "camping" // Carpeta dentro del bucket donde están las imágenes

// Función helper para obtener URLs de imágenes desde Supabase Storage
const getSupabaseImageUrl = (imagePath: string): string => {
  const fileName = imagePath.replace("/images/", "")
  // Estructura: bucket/carpeta/archivo
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${STORAGE_FOLDER}/${fileName}`
}

export const metadata: Metadata = {
  title: "Camping Pisco Huasi - Quebrada del Tigre | Verano 2026 | Cooperativa La Dormida",
  description:
    "Disfrutá del verano 2026 en Camping Pisco Huasi, ubicado en Quebrada del Tigre. Camping con energía eléctrica, WiFi, agua potable, mirador, bajada de río y todas las comodidades. Abierto de martes a domingo de 9:00 a 21:00 hs. Ingreso $3.000, acampe $8.000 por persona.",
  keywords: [
    "camping",
    "camping pisco huasi",
    "quebrada del tigre",
    "camping san jose de la dormida",
    "camping cordoba",
    "camping verano 2026",
    "camping con energia electrica",
    "camping naturaleza",
    "camping familiar",
    "camping quebrada del tigre",
    "pisco huasi",
    "cooperativa la dormida camping",
    "camping servicios",
    "camping wifi",
    "camping agua potable",
    "camping mirador",
    "camping rio",
  ].join(", "),
  authors: [{ name: "Cooperativa Eléctrica San José de la Dormida" }],
  creator: "Cooperativa Eléctrica San José de la Dormida",
  publisher: "Cooperativa Eléctrica San José de la Dormida",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: `${SITE_URL}/camping`,
  },
  openGraph: {
    title: "Camping Pisco Huasi - Quebrada del Tigre | Verano 2026",
    description:
      "Viví el verano 2026 con familia y amigos en Camping Pisco Huasi. Dos hectáreas perimetradas con energía eléctrica, WiFi, agua potable, mirador, bajada de río y todas las comodidades. Abierto de martes a domingo de 9:00 a 21:00 hs.",
    url: `${SITE_URL}/camping`,
    siteName: "Cooperativa Eléctrica San José de la Dormida",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: getSupabaseImageUrl("/images/8.png"), // URL absoluta desde Supabase Storage
        width: 1920,
        height: 800,
        alt: "Vista panorámica del Camping Pisco Huasi en Quebrada del Tigre",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Camping Pisco Huasi - Quebrada del Tigre | Verano 2026",
    description:
      "Disfrutá del verano 2026 en Camping Pisco Huasi. Camping con energía eléctrica, WiFi, agua potable, mirador y bajada de río. Abierto de martes a domingo.",
    images: {
      url: getSupabaseImageUrl("/images/8.png"), // URL absoluta desde Supabase Storage
      alt: "Vista panorámica del Camping Pisco Huasi en Quebrada del Tigre",
    },
    creator: "@cooperativaladormida", // Actualizar con el handle real si existe
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Agregar códigos de verificación si los tienes
    // google: "tu-codigo-google",
    // yandex: "tu-codigo-yandex",
    // bing: "tu-codigo-bing",
  },
  category: "Turismo y Recreación",
}

export default function CampingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

