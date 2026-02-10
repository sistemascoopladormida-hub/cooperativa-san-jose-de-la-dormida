"use client"

import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Maximize2, BookOpen } from "lucide-react"

export default function RevistaPage() {
  const revistaUrl = "https://online.fliphtml5.com/revistacooperativaladormida/revista/"

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
            Revista de la Cooperativa
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Leé la revista digital de la Cooperativa La Dormida con un efecto interactivo de
            páginas, como una revista impresa. Podés ampliarla a pantalla completa para una mejor
            experiencia.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <a href={revistaUrl} target="_blank" rel="noopener noreferrer">
              <Button className="bg-gradient-to-r from-coop-blue via-coop-purple to-coop-green hover:from-coop-blue/90 hover:via-coop-purple/90 hover:to-coop-green/90 text-white font-semibold px-6 shadow-lg hover:shadow-xl transition-all duration-300">
                Abrir en pestaña nueva
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
            <Button
              variant="outline"
              className="border-coop-blue/40 text-coop-blue hover:bg-coop-blue/5"
              onClick={() => {
                // En móviles abrimos en pestaña nueva para evitar que el usuario quede "atrapado"
                if (typeof window !== "undefined" && window.innerWidth < 768) {
                  window.open(revistaUrl, "_blank", "noopener,noreferrer")
                  return
                }

                const iframe = document.getElementById("revista-iframe") as HTMLIFrameElement | null
                if (iframe?.requestFullscreen) {
                  iframe.requestFullscreen().catch(() => {
                    // Si falla, abrimos en pestaña nueva como fallback
                    window.open(revistaUrl, "_blank", "noopener,noreferrer")
                  })
                } else if (typeof window !== "undefined") {
                  window.open(revistaUrl, "_blank", "noopener,noreferrer")
                }
              }}
            >
              Ver en pantalla completa
              <Maximize2 className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </section>

        {/* Revista embed */}
        <Card className="shadow-xl border border-gray-200/70 overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-coop-blue" />
              Revista Cooperativa La Dormida
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Usá las flechas o controles del visor para pasar de página. También podés hacer zoom
              y cambiar a modo pantalla completa desde los íconos del visor.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 bg-gray-50">
            <div className="relative w-full bg-gray-200">
              {/* Relación de aspecto responsiva */}
              <div style={{ paddingTop: "min(80vh, max(60%, 324px))" }} />
              <iframe
                id="revista-iframe"
                style={{
                  position: "absolute",
                  border: "none",
                  width: "100%",
                  height: "100%",
                  left: 0,
                  top: 0,
                }}
                src={revistaUrl}
                title="Revista Cooperativa La Dormida"
                scrolling="no"
                frameBorder="0"
                allowFullScreen
              />
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}


