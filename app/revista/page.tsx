"use client"

import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function RevistaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <section className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-gray-900">Revista Digital</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explorá la revista digital de la Cooperativa La Dormida con un efecto interactivo de
            páginas, como una revista impresa.
          </p>
        </section>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Revista Cooperativa La Dormida</CardTitle>
            <CardDescription>
              Navegá la revista en pantalla completa y usá las flechas para pasar de página.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full" style={{ paddingTop: "max(60%, 324px)" }}>
              <iframe
                style={{
                  position: "absolute",
                  border: "none",
                  width: "100%",
                  height: "100%",
                  left: 0,
                  top: 0,
                }}
                src="https://online.fliphtml5.com/revistacooperativaladormida/revista/"
                title="Revista Cooperativa La Dormida"
                seamless
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

