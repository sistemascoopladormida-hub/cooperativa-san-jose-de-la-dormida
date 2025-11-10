import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Zap, Wifi, Tv, Heart, Shield, Users, ArrowRight, CheckCircle, Star, Clock, Phone } from "lucide-react"

export default function ServiciosPage() {
  const mainServices = [
    {
      icon: Zap,
      title: "Electricidad",
      description: "Suministro eléctrico confiable las 24 horas del día",
      features: [
        "Suministro ininterrumpido",
        "Tarifas preferenciales para socios",
        "Atención técnica 24/7",
        "Medidores inteligentes",
      ],
      price: "Desde $8,500/mes",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    {
      icon: Wifi,
      title: "Internet",
      description: "Conexión de alta velocidad con fibra óptica",
      features: [
        "Velocidades hasta 100 Mbps",
        "Fibra óptica hasta el hogar",
        "Soporte técnico especializado",
        "Sin límite de datos",
      ],
      price: "Desde $4,200/mes",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      icon: Tv,
      title: "Televisión",
      description: "Amplia variedad de canales y entretenimiento",
      features: ["Más de 80 canales", "Canales HD incluidos", "Programación familiar", "Servicio técnico gratuito"],
      price: "Desde $3,800/mes",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      icon: Heart,
      title: "Farmacia Social",
      description: "Medicamentos y productos de salud a precios accesibles",
      features: [
        "Descuentos especiales para socios",
        "Medicamentos genéricos",
        "Atención farmacéutica profesional",
        "Entrega a domicilio",
      ],
      price: "Descuentos hasta 40%",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
  ]

  const socialServices = [
    {
      title: "Servicios Fúnebres",
      description: "Acompañamiento en momentos difíciles",
      icon: Shield,
    },
    {
      title: "Eventos Sociales",
      description: "Actividades para toda la familia",
      icon: Users,
    },
    {
      title: "Asesoramiento Legal",
      description: "Consultas legales gratuitas",
      icon: CheckCircle,
    },
    {
      title: "Descuentos Comerciales",
      description: "Beneficios en comercios adheridos",
      icon: Star,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-coop-green to-green-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">Nuestros Servicios</h1>
            <p className="text-xl text-green-100">
              Ofrecemos servicios esenciales de calidad para mejorar la vida de nuestra comunidad
            </p>
          </div>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Servicios Principales</h2>
            <p className="text-xl text-gray-600">Servicios esenciales para tu hogar y familia</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {mainServices.map((service, index) => (
              <Card key={index} className={`${service.borderColor} border-2 hover:shadow-lg transition-shadow`}>
                <CardHeader className={service.bgColor}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <service.icon className={`w-8 h-8 ${service.color}`} />
                      <div>
                        <CardTitle className="text-2xl">{service.title}</CardTitle>
                        <Badge className="mt-1">{service.price}</Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-base mt-3">{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="bg-coop-green hover:bg-coop-green/90 flex-1">
                      Contratar Servicio
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Más Información
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Services */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Servicios Sociales</h2>
            <p className="text-xl text-gray-600">Beneficios exclusivos para nuestros socios</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {socialServices.map((service, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <service.icon className="w-12 h-12 text-coop-green mx-auto mb-4" />
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{service.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">¿No eres socio aún? Únete y accede a todos estos beneficios</p>
            <Link href="/asociarse">
              <Button size="lg" className="bg-coop-green hover:bg-coop-green/90">
                Asociarse Ahora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-coop-green text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">¿Necesitas más información?</h2>
              <p className="text-xl text-green-100 mb-6">
                Nuestro equipo está listo para ayudarte a elegir los mejores servicios para tu hogar.
              </p>
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="w-5 h-5" />
                <span>Atención: Lunes a Viernes de 8:00 a 17:00</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5" />
                <span>(0123) 456-7890</span>
              </div>
            </div>
            <div className="text-center lg:text-right">
              <Link href="/contacto">
                <Button size="lg" className="bg-coop-yellow text-black hover:bg-coop-yellow/90">
                  Contactar Ahora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
