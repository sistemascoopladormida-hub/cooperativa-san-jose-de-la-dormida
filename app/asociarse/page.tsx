"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import {
  CheckCircle,
  Users,
  Shield,
  Heart,
  Zap,
  Wifi,
  Tv,
  Star,
  DollarSign,
  Calendar,
  Send,
  FileText,
} from "lucide-react"

export default function AsociarsePage() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    codigoPostal: "",
    ocupacion: "",
    motivacion: "",
    serviciosInteres: [] as string[],
    aceptaTerminos: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const benefits = [
    {
      icon: DollarSign,
      title: "Tarifas Preferenciales",
      description: "Descuentos especiales en todos nuestros servicios",
    },
    {
      icon: Shield,
      title: "Servicios Fúnebres",
      description: "Cobertura completa para ti y tu familia",
    },
    {
      icon: Heart,
      title: "Farmacia Social",
      description: "Medicamentos a precios reducidos",
    },
    {
      icon: Star,
      title: "Descuentos Comerciales",
      description: "Beneficios en comercios adheridos",
    },
    {
      icon: Users,
      title: "Eventos Sociales",
      description: "Participación en actividades comunitarias",
    },
    {
      icon: Calendar,
      title: "Asesoramiento Gratuito",
      description: "Consultas legales y contables sin costo",
    },
  ]

  const services = [
    { id: "electricidad", name: "Electricidad", icon: Zap },
    { id: "internet", name: "Internet", icon: Wifi },
    { id: "television", name: "Televisión", icon: Tv },
    { id: "farmacia", name: "Farmacia Social", icon: Heart },
  ]

  const handleServiceChange = (serviceId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        serviciosInteres: [...formData.serviciosInteres, serviceId],
      })
    } else {
      setFormData({
        ...formData,
        serviciosInteres: formData.serviciosInteres.filter((id) => id !== serviceId),
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulación de envío
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-coop-green to-green-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">Únete a Nuestra Cooperativa</h1>
            <p className="text-xl text-green-100">
              Forma parte de una comunidad comprometida con el desarrollo local y accede a beneficios exclusivos.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Benefits Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Beneficios de ser Socio</h2>
            <p className="text-xl text-gray-600">
              Descubre todas las ventajas que tendrás como miembro de nuestra cooperativa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <benefit.icon className="w-12 h-12 text-coop-green mx-auto mb-4" />
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{benefit.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Application Form */}
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <FileText className="w-6 h-6 mr-3" />
                Solicitud de Asociación
              </CardTitle>
              <CardDescription>Completa todos los campos para procesar tu solicitud de membresía.</CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    ¡Solicitud enviada correctamente! Nos pondremos en contacto contigo dentro de los próximos 5 días
                    hábiles para continuar con el proceso de asociación.
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Información Personal</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre *</Label>
                        <Input
                          id="nombre"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="apellido">Apellido *</Label>
                        <Input
                          id="apellido"
                          value={formData.apellido}
                          onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dni">DNI *</Label>
                        <Input
                          id="dni"
                          value={formData.dni}
                          onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
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
                      <div className="space-y-2">
                        <Label htmlFor="telefono">Teléfono *</Label>
                        <Input
                          id="telefono"
                          value={formData.telefono}
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ocupacion">Ocupación</Label>
                        <Input
                          id="ocupacion"
                          value={formData.ocupacion}
                          onChange={(e) => setFormData({ ...formData, ocupacion: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Dirección</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="direccion">Dirección completa *</Label>
                        <Input
                          id="direccion"
                          value={formData.direccion}
                          onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ciudad">Ciudad *</Label>
                        <Input
                          id="ciudad"
                          value={formData.ciudad}
                          onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="codigoPostal">Código Postal</Label>
                        <Input
                          id="codigoPostal"
                          value={formData.codigoPostal}
                          onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Services Interest */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Servicios de Interés</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {services.map((service) => (
                        <div key={service.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Checkbox
                            id={service.id}
                            checked={formData.serviciosInteres.includes(service.id)}
                            onCheckedChange={(checked) => handleServiceChange(service.id, checked as boolean)}
                          />
                          <service.icon className="w-5 h-5 text-coop-green" />
                          <Label htmlFor={service.id} className="cursor-pointer">
                            {service.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Motivation */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Motivación</h3>
                    <div className="space-y-2">
                      <Label htmlFor="motivacion">¿Por qué quieres asociarte a nuestra cooperativa?</Label>
                      <Textarea
                        id="motivacion"
                        rows={4}
                        value={formData.motivacion}
                        onChange={(e) => setFormData({ ...formData, motivacion: e.target.value })}
                        placeholder="Cuéntanos qué te motiva a formar parte de nuestra comunidad cooperativa..."
                      />
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <Checkbox
                      id="terminos"
                      checked={formData.aceptaTerminos}
                      onCheckedChange={(checked) => setFormData({ ...formData, aceptaTerminos: checked as boolean })}
                      required
                    />
                    <div className="text-sm">
                      <Label htmlFor="terminos" className="cursor-pointer">
                        Acepto los términos y condiciones de la cooperativa *
                      </Label>
                      <p className="text-gray-600 mt-1">
                        Al enviar esta solicitud, acepto cumplir con el estatuto social y reglamentos internos de la
                        Cooperativa La Dormida.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-coop-green hover:bg-coop-green/90"
                    disabled={isSubmitting || !formData.aceptaTerminos}
                  >
                    {isSubmitting ? (
                      "Enviando solicitud..."
                    ) : (
                      <>
                        <Send className="mr-2 w-4 h-4" />
                        Enviar Solicitud de Asociación
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto bg-coop-yellow/10 border-coop-yellow/30">
            <CardHeader>
              <CardTitle className="text-coop-green">Proceso de Asociación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p>
                  1. <strong>Envío de solicitud:</strong> Completa y envía este formulario
                </p>
                <p>
                  2. <strong>Revisión:</strong> Evaluamos tu solicitud (5 días hábiles)
                </p>
                <p>
                  3. <strong>Contacto:</strong> Te contactamos para coordinar la entrevista
                </p>
                <p>
                  4. <strong>Documentación:</strong> Presentas la documentación requerida
                </p>
                <p>
                  5. <strong>Aprobación:</strong> ¡Bienvenido a la cooperativa!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
