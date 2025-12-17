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
      details: ["Av. Perón 557 - CP 5244", "Córdoba, San José de la Dormida"],
      color: "text-blue-600",
    },
    {
      icon: Phone,
      title: "Teléfono",
      details: ["3521-401330", "Consultorios médicos PFC (turnos): 3521 401387"],
      color: "text-green-600",
    },
    {
      icon: Mail,
      title: "Email",
      details: ["sistemascoopladormida@gmail.com"],
      color: "text-purple-600",
    },
    {
      icon: Clock,
      title: "Horarios",
      details: ["Lunes a Viernes: 7:00 - 12:00"],
      color: "text-orange-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-coop-blue via-coop-purple via-coop-green to-coop-orange text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">Reclamos</h1>
            <p className="text-xl text-green-100">
              Canal exclusivo para ingresar tus reclamos y problemas con los servicios de la cooperativa.
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
                <CardTitle className="text-2xl">Ingresá tu reclamo</CardTitle>
                <CardDescription>
                  Completá el formulario con el mayor detalle posible para que podamos ayudarte más rápido.
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
                      <Label htmlFor="asunto">Tipo de reclamo *</Label>
                        <Input
                          id="asunto"
                          value={formData.asunto}
                          onChange={(e) => setFormData({ ...formData, asunto: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mensaje">Detalle del reclamo *</Label>
                      <Textarea
                        id="mensaje"
                        rows={6}
                        value={formData.mensaje}
                        onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                        placeholder="Ejemplo: Corte de luz en mi domicilio desde las 22 hs. Zona, referencia, número de cliente, etc."
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-coop-blue via-coop-purple to-coop-green hover:from-coop-blue/90 hover:via-coop-purple/90 hover:to-coop-green/90 text-white"
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

            {/* Emergency Contact - Teléfonos de Guardia */}
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Emergencias 24hs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-red-700 font-semibold text-sm mb-1">Ambulancia</p>
                  <a href="tel:+543521406183" className="text-red-600 hover:text-red-800 transition-colors text-base font-medium">
                    3521 406183
                  </a>
                </div>
                <div>
                  <p className="text-red-700 font-semibold text-sm mb-1">Eléctrica</p>
                  <a href="tel:+543521406186" className="text-red-600 hover:text-red-800 transition-colors text-base font-medium">
                    3521 406186
                  </a>
                </div>
                <div>
                  <p className="text-red-700 font-semibold text-sm mb-1">Internet</p>
                  <a href="tel:+543521438313" className="text-red-600 hover:text-red-800 transition-colors text-base font-medium">
                    3521 438313
                  </a>
                </div>
                <div>
                  <p className="text-red-700 font-semibold text-sm mb-1">Administración</p>
                  <a href="tel:+54352140130" className="text-red-600 hover:text-red-800 transition-colors text-base font-medium">
                    3521 40130
                  </a>
                </div>
                <div>
                  <p className="text-red-700 font-semibold text-sm mb-1">Sepelio</p>
                  <a href="tel:+543521406189" className="text-red-600 hover:text-red-800 transition-colors text-base font-medium">
                    3521 406189
                  </a>
                </div>
                <div>
                  <p className="text-red-700 font-semibold text-sm mb-1">Consultorios médicos PFC (turnos)</p>
                  <a
                    href="tel:+5493521401387"
                    className="text-red-600 hover:text-red-800 transition-colors text-base font-medium"
                  >
                    3521 401387
                  </a>
                </div>
                <p className="text-red-600 text-xs mt-3 pt-3 border-t border-red-200">Disponibles las 24 horas, los 7 días de la semana</p>
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
              <div className="h-64 lg:h-96 rounded-lg overflow-hidden w-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4083.952033554102!2d-63.95051042443432!3d-30.35400197476918!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x943221a8da44c6a3%3A0x182c8f6bd4ec1f8a!2sCooperativa%20El%C3%A9ctrica%20de%20San%20Jos%C3%A9%20de%20La%20Dormida!5e1!3m2!1ses!2sar!4v1765809953275!5m2!1ses!2sar"
                  className="w-full h-full"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
