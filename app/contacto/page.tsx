"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react"

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    asunto: "",
    mensaje: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulación de envío
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
      setFormData({ nombre: "", email: "", telefono: "", asunto: "", mensaje: "" })
    }, 2000)
  }

  const contactInfo = [
    {
      icon: MapPin,
      title: "Dirección",
      details: ["Av. Principal 123", "La Dormida, Provincia"],
      color: "text-blue-600",
    },
    {
      icon: Phone,
      title: "Teléfonos",
      details: ["(0123) 456-7890", "(0123) 456-7891"],
      color: "text-green-600",
    },
    {
      icon: Mail,
      title: "Email",
      details: ["info@coopladormida.com.ar", "reclamos@coopladormida.com.ar"],
      color: "text-purple-600",
    },
    {
      icon: Clock,
      title: "Horarios",
      details: ["Lun-Vie: 8:00 - 17:00", "Sáb: 8:00 - 12:00"],
      color: "text-orange-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-coop-green to-green-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">Contacto</h1>
            <p className="text-xl text-green-100">
              Estamos aquí para ayudarte. Contáctanos por cualquier consulta o sugerencia.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Envíanos un mensaje</CardTitle>
                <CardDescription>
                  Completa el formulario y nos pondremos en contacto contigo a la brevedad.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      ¡Mensaje enviado correctamente! Te responderemos dentro de las próximas 24 horas.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre completo *</Label>
                        <Input
                          id="nombre"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input
                          id="telefono"
                          value={formData.telefono}
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="asunto">Asunto *</Label>
                        <Input
                          id="asunto"
                          value={formData.asunto}
                          onChange={(e) => setFormData({ ...formData, asunto: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mensaje">Mensaje *</Label>
                      <Textarea
                        id="mensaje"
                        rows={6}
                        value={formData.mensaje}
                        onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                        placeholder="Describe tu consulta o sugerencia..."
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-coop-green hover:bg-coop-green/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        "Enviando..."
                      ) : (
                        <>
                          <Send className="mr-2 w-4 h-4" />
                          Enviar Mensaje
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <info.icon className={`w-5 h-5 mr-3 ${info.color}`} />
                    {info.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {info.details.map((detail, detailIndex) => (
                    <p key={detailIndex} className="text-gray-600">
                      {detail}
                    </p>
                  ))}
                </CardContent>
              </Card>
            ))}

            {/* Emergency Contact */}
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800">Emergencias 24hs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-700 font-semibold">📞 (0123) 456-7899</p>
                <p className="text-red-600 text-sm mt-1">Para cortes de luz, fugas de gas o emergencias técnicas</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Nuestra Ubicación</CardTitle>
              <CardDescription>Visítanos en nuestras oficinas centrales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-200 h-64 lg:h-96 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-lg font-medium">Mapa Interactivo</p>
                  <p className="text-sm">Av. Principal 123, La Dormida</p>
                  <p className="text-xs mt-2">(Aquí se integraría Google Maps o similar)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
