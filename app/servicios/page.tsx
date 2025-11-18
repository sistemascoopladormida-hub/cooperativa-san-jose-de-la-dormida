import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Zap, Wifi, Tv, Shield, Users, ArrowRight, CheckCircle, Star, Clock, Phone, ShieldCheck, PhoneCall, Heart } from "lucide-react"

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
      bgGradient: "from-yellow-50 to-yellow-100/50",
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
      bgGradient: "from-blue-50 to-blue-100/50",
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
      bgGradient: "from-purple-50 to-purple-100/50",
    },
    {
      icon: ShieldCheck,
      title: "Programa PFC",
      description: "Cobertura integral de salud y acompañamiento para toda la familia",
      features: [
        "Traslados en ambulancia para urgencias",
        "Servicio de sepelio completo",
        "Análisis clínicos y estudios de laboratorio",
        "Servicio óptico (un par por año)",
        "Elementos ortopédicos",
        "Consultorios externos: ginecología, fisioterapia, alergista, nutricionista, pedicura, psicología y diabetología",
        "Taller interdisciplinario (fonoaudiología, psicopedagogía, psicología y maestra integradora) para niños y adultos mayores con dificultades de aprendizaje, TEA y otras condiciones",
      ],
      price: "Incluido para socios PFC",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      bgGradient: "from-emerald-50 to-emerald-100/50",
    },
    {
      icon: Heart,
      title: "Farmacia Social",
      description: "Medicamentos y perfumería con beneficios exclusivos para socios",
      features: [
        "3 cuotas sin interés con tarjetas bancarizadas",
        "10% de descuento en compra de contado en medicamentos o perfumería",
        "Aceptamos obras sociales: PAMI, APROSS, UNIMED",
        "Bono solidario aceptado",
      ],
      price: "Beneficios exclusivos",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
      bgGradient: "from-pink-50 to-pink-100/50",
    },
  ]

  const guardContacts: Record<
    string,
    { label: string; phoneDisplay: string; phoneHref: string }
  > = {
    Electricidad: {
      label: "Guardia Eléctrica 24/7",
      phoneDisplay: "3521 406186",
      phoneHref: "+543521406186",
    },
    Internet: {
      label: "Guardia Internet 24/7",
      phoneDisplay: "3521 438313",
      phoneHref: "+543521438313",
    },
    Televisión: {
      label: "Soporte Técnico / Administración",
      phoneDisplay: "3521 40130",
      phoneHref: "+54352140130",
    },
    "Programa PFC": {
      label: "Urgencias Ambulancia PFC",
      phoneDisplay: "3521 406183",
      phoneHref: "+543521406183",
    },
  }

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

      {/* Hero Section - Enhanced */}
      <section className="relative bg-gradient-to-br from-coop-blue via-coop-purple via-coop-green to-coop-orange text-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-coop-orange rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 lg:py-28 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <Zap className="w-4 h-4 text-coop-orange" />
              <span className="text-sm font-medium">Servicios de Calidad</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight tracking-tight">
              Nuestros Servicios
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-green-50 leading-relaxed">
              Ofrecemos servicios esenciales de calidad para mejorar la vida de nuestra comunidad con excelencia y compromiso
            </p>
          </div>
          
          {/* Hero Image - Desktop */}
          {/* TODO: Agregar imagen hero servicios desktop: /images/services-hero-desktop.jpg - Dimensiones: 1400x600px */}
          <div className="hidden lg:block mt-12 relative">
            <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-coop-blue/30 via-coop-purple/30 via-coop-green/30 to-coop-orange/30 flex items-center justify-center">
                <Zap className="w-32 h-32 text-white/30" />
              </div>
            </div>
          </div>
          
          {/* Hero Image - Mobile */}
          {/* TODO: Agregar imagen hero servicios mobile: /images/services-hero-mobile.jpg - Dimensiones: 800x400px */}
          <div className="lg:hidden mt-8 relative">
            <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-coop-blue/30 via-coop-purple/30 via-coop-green/30 to-coop-orange/30 flex items-center justify-center">
                <Zap className="w-24 h-24 text-white/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Services - Enhanced */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-white via-gray-50/50 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-coop-green rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-coop-orange rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-coop-green/10 rounded-full mb-6">
              <Star className="w-4 h-4 text-coop-green" />
              <span className="text-sm font-medium text-coop-green">Servicios Principales</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Servicios Principales
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Servicios esenciales para tu hogar y familia con la mejor calidad y atención
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            {mainServices.map((service, index) => {
              const guard = guardContacts[service.title as keyof typeof guardContacts]
              return (
              <Card 
                key={index} 
                className={`group ${service.borderColor} border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden relative bg-white`}
              >
                {/* Service Image - Desktop */}
                {/* TODO: Agregar imagen servicio {service.title} desktop: /images/service-${service.title.toLowerCase()}-detail-desktop.jpg - Dimensiones: 800x500px */}
                <div className="hidden lg:block relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.bgGradient || 'from-gray-100 to-gray-200'} opacity-60 group-hover:opacity-80 transition-opacity`}></div>
                  <service.icon className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 ${service.color} opacity-20 group-hover:opacity-30 transition-opacity`} />
                </div>
                
                {/* Service Image - Mobile */}
                {/* TODO: Agregar imagen servicio {service.title} mobile: /images/service-${service.title.toLowerCase()}-detail-mobile.jpg - Dimensiones: 600x400px */}
                <div className="lg:hidden relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.bgGradient || 'from-gray-100 to-gray-200'} opacity-60 group-hover:opacity-80 transition-opacity`}></div>
                  <service.icon className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 ${service.color} opacity-20 group-hover:opacity-30 transition-opacity`} />
                </div>
                
                <CardHeader className={`${service.bgColor} pb-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl bg-white/80 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300`}>
                        <service.icon className={`w-8 h-8 ${service.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-2xl lg:text-3xl font-bold">{service.title}</CardTitle>
                        <Badge className="mt-2 bg-white/90 text-gray-900 font-semibold">{service.price}</Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-base mt-4 font-medium">{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 rounded-full bg-coop-green/10 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-coop-green" />
                          </div>
                        </div>
                        <span className="text-gray-700 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {guard && (
                    <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-coop-green/30 bg-coop-green/5 px-4 py-3">
                      <div>
                        <p className="text-xs font-semibold text-coop-green uppercase tracking-wide">Guardia 24/7</p>
                        <p className="text-sm text-gray-700 font-semibold">{guard.label}</p>
                      </div>
                      <a
                        href={`tel:${guard.phoneHref}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-coop-green shadow-sm transition-all hover:bg-coop-green/10"
                      >
                        <PhoneCall className="w-4 h-4" />
                        {guard.phoneDisplay}
                      </a>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="bg-gradient-to-r from-coop-blue via-coop-purple to-coop-green hover:from-coop-blue/90 hover:via-coop-purple/90 hover:to-coop-green/90 flex-1 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold group/btn text-white">
                      Contratar Servicio
                      <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                    <Button variant="outline" className="flex-1 border-2 hover:bg-gray-50 font-semibold">
                      Más Información
                    </Button>
                  </div>
                </CardContent>
              </Card>
              )
            })}
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
              <Button size="lg" className="bg-gradient-to-r from-coop-blue via-coop-purple to-coop-green hover:from-coop-blue/90 hover:via-coop-purple/90 hover:to-coop-green/90 text-white">
                Asociarse Ahora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-r from-coop-blue via-coop-purple to-coop-green text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">¿Necesitas más información?</h2>
              <p className="text-xl text-green-100 mb-6">
                Nuestro equipo está listo para ayudarte a elegir los mejores servicios para tu hogar.
              </p>
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="w-5 h-5" />
                <span>Atención: Lunes a Viernes de 7:00 a 12:00</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5" />
                <a href="tel:+543521401330" className="hover:underline">3521-401330</a>
              </div>
            </div>
            <div className="text-center lg:text-right">
              <Link href="/contacto">
                <Button size="lg" className="bg-coop-orange text-white hover:bg-coop-orange/90">
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
