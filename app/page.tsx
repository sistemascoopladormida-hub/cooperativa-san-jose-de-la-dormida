import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Zap, Wifi, Tv, Heart, Users, ArrowRight, CheckCircle, Phone, Mail, ShieldCheck } from "lucide-react"

export default function HomePage() {
  const services = [
    {
      icon: Zap,
      title: "Electricidad",
      description: "Suministro eléctrico confiable las 24 horas",
      color: "text-yellow-600",
    },
    {
      icon: Wifi,
      title: "Internet",
      description: "Conexión de alta velocidad para tu hogar",
      color: "text-blue-600",
    },
    {
      icon: Tv,
      title: "Televisión",
      description: "Amplia variedad de canales y entretenimiento",
      color: "text-purple-600",
    },
    {
      icon: Heart,
      title: "Farmacia Social",
      description: "Medicamentos a precios accesibles para socios",
      color: "text-red-600",
    },
  ]

  const benefits = [
    "Tarifas preferenciales para socios",
    "Atención personalizada y cercana",
    "Servicios sociales y beneficios especiales",
    "Más de 50 años de experiencia",
    "Compromiso con la comunidad local",
    "Tecnología moderna y confiable",
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-coop-green to-green-700 text-white">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Bienvenido a la
                <span className="text-coop-yellow block">Cooperativa</span> de San Jose De La Dormida
              </h1>
              <p className="text-xl lg:text-2xl text-green-100">
                Servicios de calidad para nuestra comunidad. Electricidad, Internet, TV y más.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login">
                  <Button size="lg" className="bg-coop-yellow text-black hover:bg-coop-yellow/90 w-full sm:w-auto">
                    Área Socios
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/asociarse">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white hover:bg-white/40 text-coop-green w-full sm:w-auto"
                  >
                    Asociarse
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <Image
                src="/images/logo-coop.png"
                alt="Cooperativa La Dormida"
                width={300}
                height={300}
                className="w-64 h-64 lg:w-80 lg:h-80 object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Nuestros Servicios</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ofrecemos una amplia gama de servicios para satisfacer las necesidades de nuestra comunidad
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <service.icon className={`w-12 h-12 mx-auto mb-4 ${service.color}`} />
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">{service.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/servicios">
              <Button size="lg" className="bg-coop-green hover:bg-coop-green/90">
                Ver Todos los Servicios
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                ¿Por qué elegir nuestra Cooperativa?
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-coop-green flex-shrink-0" />
                    <span className="text-lg text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-coop-yellow/10 p-8 rounded-2xl">
              <div className="text-center space-y-6">
                <Users className="w-16 h-16 text-coop-green mx-auto" />
                <h3 className="text-2xl font-bold text-gray-900">Únete a nuestra familia cooperativa</h3>
                <p className="text-gray-600">
                  Más de 5,000 familias confían en nosotros para sus servicios esenciales.
                </p>
                <Link href="/asociarse">
                  <Button className="bg-coop-green hover:bg-coop-green/90">Asociarse Ahora</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PFC Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Programa de Fortalecimiento Comunitario (PFC)
              </h2>
              <p className="text-xl text-gray-600">
                Descubre cómo el PFC apoya la salud y el bienestar de nuestros socios.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-coop-green flex-shrink-0" />
                  <span>Beneficios médicos y de salud</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-coop-green flex-shrink-0" />
                  <span>Acceso a especialistas y programas preventivos</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-coop-green flex-shrink-0" />
                  <span>Apoyo integral para una mejor calidad de vida</span>
                </li>
              </ul>
              <Link href="/pfc">
                <Button size="lg" className="bg-coop-green hover:bg-coop-green/90">
                  Más Información sobre PFC
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
            <div className="flex justify-center">
              <ShieldCheck className="w-64 h-64 text-coop-green" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-coop-green text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">¿Necesitas ayuda o tienes consultas?</h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Nuestro equipo está aquí para ayudarte. Contáctanos por cualquier medio.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contacto">
              <Button size="lg" className="bg-coop-yellow text-black hover:bg-coop-yellow/90">
                <Phone className="mr-2 w-5 h-5" />
                Contactar
              </Button>
            </Link>
            <Link href="/reclamos">
              <Button
                size="lg"
                variant="outline"
                className="border-white hover:bg-white/40 text-coop-green"
              >
                <Mail className="mr-2 w-5 h-5" />
                Hacer Reclamo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
