"use client"

import { useState } from "react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Maximize2, BookOpen, ChevronLeft, ChevronRight } from "lucide-react"

type RevistaItem = {
  id: string
  titulo: string
  descripcion: string
  url: string
}

const REVISTAS: RevistaItem[] = [
  {
    id: "marzo-2026",
    titulo: "REVISTA MARZO 2026",
    descripcion:
      "Edición de marzo 2026. Revisá novedades, servicios y contenido institucional de la cooperativa.",
    url: "https://online.fliphtml5.com/rutabi/REVISTA-MARZO-2026/",
  },
  {
    id: "febrero-2026",
    titulo: "REVISTA FEBRERO 2026",
    descripcion:
      "Edición de febrero 2026. Incluye información de la cooperativa, servicios y anuncios para socios.",
    url: "https://online.fliphtml5.com/revistacooperativaladormida/REVISTA-FEB-2026/",
  },
]

export default function RevistaPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const revistaActual = REVISTAS[currentIndex]

  const handleFullscreen = (iframeId: string, revistaUrl: string) => {
    // En móviles abrimos en pestaña nueva para evitar que el usuario quede "atrapado"
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      window.open(revistaUrl, "_blank", "noopener,noreferrer")
      return
    }

    const iframe = document.getElementById(iframeId) as HTMLIFrameElement | null
    if (iframe?.requestFullscreen) {
      iframe.requestFullscreen().catch(() => {
        window.open(revistaUrl, "_blank", "noopener,noreferrer")
      })
    } else if (typeof window !== "undefined") {
      window.open(revistaUrl, "_blank", "noopener,noreferrer")
    }
  }

  const goPrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }

  const goNext = () => {
    setCurrentIndex((prev) => (prev < REVISTAS.length - 1 ? prev + 1 : prev))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100">
      <Header />

      <main className="container mx-auto px-4 py-12 lg:py-16">
        {/* Hero */}
        <section className="mb-10 lg:mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-coop-blue/5 border border-coop-blue/20 mb-4">
            <BookOpen className="w-4 h-4 text-coop-blue" />
            <span className="text-xs font-semibold text-coop-blue uppercase tracking-wide">
              Revista Digital
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 leading-tight">
            Revistas de la Cooperativa
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Historial completo de revistas digitales de la Cooperativa La Dormida. Podés leer cada
            edición directamente desde la web o abrirla en una pestaña nueva.
          </p>
        </section>

        {/* Historial de revistas (una visible a la vez) */}
        <section className="space-y-6">
          <Card className="shadow-sm border border-gray-200/70 bg-white">
            <CardContent className="py-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="w-4 h-4 text-coop-blue" />
                  <span>
                    Revista {currentIndex + 1} de {REVISTAS.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goPrev}
                    disabled={currentIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Anterior
                  </Button>
                  <select
                    className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700"
                    value={currentIndex}
                    onChange={(e) => setCurrentIndex(Number(e.target.value))}
                  >
                    {REVISTAS.map((revista, idx) => (
                      <option key={revista.id} value={idx}>
                        {revista.titulo}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goNext}
                    disabled={currentIndex === REVISTAS.length - 1}
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border border-gray-200/70 overflow-hidden bg-white">
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-coop-blue" />
                    {revistaActual.titulo}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-2">
                    {revistaActual.descripcion}
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href={revistaActual.url} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-gradient-to-r from-coop-blue via-coop-purple to-coop-green hover:from-coop-blue/90 hover:via-coop-purple/90 hover:to-coop-green/90 text-white font-semibold px-6 shadow-lg hover:shadow-xl transition-all duration-300">
                      Abrir en pestaña nueva
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                  <Button
                    variant="outline"
                    className="border-coop-blue/40 text-coop-blue hover:bg-coop-blue/5"
                    onClick={() =>
                      handleFullscreen(`revista-iframe-${revistaActual.id}`, revistaActual.url)
                    }
                  >
                    Ver en pantalla completa
                    <Maximize2 className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 bg-gray-50">
              <div className="relative w-full h-0" style={{ paddingTop: "max(60%, 324px)" }}>
                <iframe
                  id={`revista-iframe-${revistaActual.id}`}
                  className="absolute left-0 top-0 w-full h-full border-0"
                  src={revistaActual.url}
                  title={revistaActual.titulo}
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen
                />
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  )
}


