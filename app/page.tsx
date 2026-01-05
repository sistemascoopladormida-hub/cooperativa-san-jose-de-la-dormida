"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Zap, Wifi, Tv, Heart, Truck, Users, ArrowRight, CheckCircle, Phone, Mail, ShieldCheck, Sparkles, TrendingUp, Award, AlertCircle, PhoneCall, Zap as ZapIcon, Wifi as WifiIcon, FileText, Building2, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"

type Service = {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  color: string
  bgGradient: string
}

function ServicesCarousel({ services }: { services: Service[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    // Verificar después de que el componente se monte
    const timer = setTimeout(() => {
      checkScrollButtons()
    }, 100)
    
    const scrollElement = scrollRef.current
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScrollButtons)
      window.addEventListener('resize', checkScrollButtons)
    }
    return () => {
      clearTimeout(timer)
      if (scrollElement) {
        scrollElement.removeEventListener('scroll', checkScrollButtons)
      }
      window.removeEventListener('resize', checkScrollButtons)
    }
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scrollRef.current) {
      setIsDragging(true)
      const rect = scrollRef.current.getBoundingClientRect()
      setStartX(e.pageX - rect.left)
      setScrollLeft(scrollRef.current.scrollLeft)
      scrollRef.current.style.cursor = 'grabbing'
      scrollRef.current.style.userSelect = 'none'
    }
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab'
      scrollRef.current.style.userSelect = 'auto'
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab'
      scrollRef.current.style.userSelect = 'auto'
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const rect = scrollRef.current.getBoundingClientRect()
    const x = e.pageX - rect.left
    const walk = (x - startX) * 2
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  // Prevenir el drag cuando se hace click en un link o botón
  const handleCardMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('a') || target.closest('button')) {
      e.stopPropagation()
    }
  }

  return (
    <div className="mb-12 relative -mx-4 px-4 lg:px-16">
      {/* Botón izquierdo - Solo visible en desktop */}
      {canScrollLeft && (
        <Button
          onClick={() => scroll('left')}
          className="hidden lg:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white shadow-lg hover:shadow-xl border-2 border-coop-green/20 hover:border-coop-green/40 transition-all hover:scale-110"
          aria-label="Scroll izquierda"
        >
          <ChevronLeft className="w-6 h-6 text-coop-green" />
        </Button>
      )}

      {/* Botón derecho - Solo visible en desktop */}
      {canScrollRight && (
        <Button
          onClick={() => scroll('right')}
          className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white shadow-lg hover:shadow-xl border-2 border-coop-green/20 hover:border-coop-green/40 transition-all hover:scale-110"
          aria-label="Scroll derecha"
        >
          <ChevronRight className="w-6 h-6 text-coop-green" />
        </Button>
      )}

      <motion.div
        ref={scrollRef}
        className="flex gap-6 lg:gap-8 overflow-x-auto py-4 scrollbar-horizontal scroll-smooth cursor-grab active:cursor-grabbing"
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.15,
            },
          },
        }}
      >
        {services.map((service, index) => (
          <motion.div
            key={index}
            className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[350px] lg:w-[300px]"
            variants={{
              hidden: { opacity: 0, y: 50, scale: 0.9 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                },
              },
            }}
            whileHover={{
              y: -8,
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
          >
            <Card
              className="group hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-coop-green/20 overflow-hidden relative bg-white h-full"
              onMouseDown={handleCardMouseDown}
            >
              {/* Service image placeholder */}
              {/* TODO: Agregar imagen de servicio desktop: /images/service-{service.title.toLowerCase()}-desktop.jpg - Dimensiones: 600x400px */}
              <div className="hidden lg:block relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${service.bgGradient} opacity-50 group-hover:opacity-70 transition-opacity`}></div>
                <service.icon className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 ${service.color} opacity-20 group-hover:opacity-30 transition-opacity`} />
              </div>

              {/* Service image placeholder - Mobile */}
              {/* TODO: Agregar imagen de servicio mobile: /images/service-{service.title.toLowerCase()}-mobile.jpg - Dimensiones: 400x300px */}
              <div className="lg:hidden relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${service.bgGradient} opacity-50 group-hover:opacity-70 transition-opacity`}></div>
                <service.icon className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 ${service.color} opacity-20 group-hover:opacity-30 transition-opacity`} />
              </div>

              <CardHeader className="text-center pb-4">
                <div className="mb-4 flex justify-center">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${service.bgGradient} group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className={`w-8 h-8 ${service.color}`} />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-coop-green transition-colors">
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-center text-gray-600 leading-relaxed">
                  {service.description}
                </CardDescription>
                <div className="mt-6 flex justify-center">
                  <Link href={`/servicios#${service.title.toLowerCase()}`} className="group/link">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-coop-green hover:text-white hover:bg-coop-green group-hover/link:gap-2"
                    >
                      Más info
                      <ArrowRight className="ml-1 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export default function HomePage() {
  const services = [
    {
      icon: Zap,
      title: "Electricidad",
      description: "Suministro eléctrico confiable las 24 horas",
      color: "text-yellow-600",
      bgGradient: "from-yellow-50 to-yellow-100/50",
    },
    {
      icon: Wifi,
      title: "Internet",
      description: "Conexión de alta velocidad para tu hogar",
      color: "text-blue-600",
      bgGradient: "from-blue-50 to-blue-100/50",
    },
    {
      icon: Tv,
      title: "Televisión",
      description: "Amplia variedad de canales y entretenimiento",
      color: "text-purple-600",
      bgGradient: "from-purple-50 to-purple-100/50",
    },
    {
      icon: ShieldCheck,
      title: "Programa PFC",
      description: "Cobertura integral en salud: ambulancia, sepelio, análisis, óptica y consultorios especializados",
      color: "text-emerald-600",
      bgGradient: "from-emerald-50 to-emerald-100/50",
    },
    {
      icon: Heart,
      title: "Farmacia Social",
      description: "Medicamentos y perfumería con 3 cuotas sin interés y 10% de descuento en efectivo",
      color: "text-pink-600",
      bgGradient: "from-pink-50 to-pink-100/50",
    },
  ]

  const benefits = [
    "Tarifas preferenciales para socios",
    "Atención personalizada y cercana",
    "Servicios sociales y beneficios especiales",
    "Más de 60 años de experiencia",
    "Compromiso con la comunidad local",
    "Tecnología moderna y confiable",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/30">
      <Header />

      {/* Hero Section - Enhanced with Framer Motion */}
      <motion.section 
        className="relative text-white overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background Image - Desktop */}
        <div className="hidden lg:block absolute inset-0">
          <Image
            src="/images/hero-desktop.png"
            alt="Cooperativa Eléctrica La Dormida - Edificio principal"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          {/* Overlay para mejorar legibilidad del texto */}
          <div className="absolute inset-0 bg-gradient-to-br from-coop-blue/80 via-coop-purple/40 via-coop-green/40 to-coop-orange/40"></div>
        </div>
        
        {/* Background Image - Mobile */}
        <div className="lg:hidden absolute inset-0">
          <Image
            src="/images/hero-mobile.png"
            alt="Cooperativa Eléctrica La Dormida - Edificio principal"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          {/* Overlay para mejorar legibilidad del texto */}
          <div className="absolute inset-0 bg-gradient-to-br from-coop-blue/80 via-coop-purple/40 via-coop-green/40 to-coop-orange/40"></div>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <motion.div 
            className="absolute top-0 right-0 w-96 h-96 bg-coop-orange rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div 
            className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
        
        <div className="container mx-auto px-4 py-20 lg:py-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-coop-orange" />
                </motion.div>
                <span className="text-sm font-medium">Más de 60 años sirviendo a la comunidad</span>
              </motion.div>
              
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <motion.h1 
                  className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Bienvenido a la
                  <motion.span 
                    className="text-coop-orange block bg-gradient-to-r from-coop-orange to-orange-300 bg-clip-text text-transparent"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    Cooperativa
                  </motion.span>
                  <motion.span 
                    className="block"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    de San Jose De La Dormida
                  </motion.span>
                </motion.h1>
                <motion.p 
                  className="text-lg sm:text-xl lg:text-2xl text-green-50 leading-relaxed max-w-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 }}
                >
                  Servicios de calidad para nuestra comunidad. Electricidad, Internet, TV y más, con el compromiso de siempre.
                </motion.p>
              </motion.div>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <a 
                    href="https://www.cooponlineweb.com.ar/SANJOSEDELADORMIDA/Login" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <Button 
                      size="lg" 
                      className="bg-coop-orange text-white hover:bg-coop-orange/90 w-full sm:w-auto shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold text-base px-8 py-6"
                    >
                      Pagar Factura
                      <motion.span
                        className="inline-block ml-2"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.span>
                    </Button>
                  </a>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <a 
                    href="https://ersep.cba.gov.ar/prestador/cooperativa-electrica-limitada-de-san-jose-de-la-dormida/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-white/30 bg-white/20 backdrop-blur-sm text-white w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-base px-8 py-6"
                    >
                      Cuadro Tarifario
                      <motion.span
                        className="inline-block ml-2"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.span>
                    </Button>
                  </a>
                </motion.div>
              </motion.div>

              {/* Stats */}
              <motion.div 
                className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                {[
                  { value: "2,500+", label: "Familias" },
                  { value: "50+", label: "Años" },
                  { value: "24/7", label: "Atención" },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.6 + index * 0.1 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <motion.div 
                      className="text-3xl lg:text-4xl font-bold text-coop-orange"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1.8 + index * 0.1 }}
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-sm text-green-100 mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            
          </div>
        </div>
      </motion.section>

      {/* Services Section - Enhanced with Framer Motion */}
      <motion.section 
        className="py-20 lg:py-28 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <motion.div 
            className="absolute top-20 left-10 w-72 h-72 bg-coop-green rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div 
            className="absolute bottom-20 right-10 w-96 h-96 bg-coop-orange rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -20, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 bg-coop-green/10 rounded-full mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              >
                <TrendingUp className="w-4 h-4 text-coop-green" />
              </motion.div>
              <span className="text-sm font-medium text-coop-green">Servicios de Calidad</span>
            </motion.div>
            <motion.h2 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Nuestros Servicios
            </motion.h2>
            <motion.p 
              className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Ofrecemos una amplia gama de servicios esenciales para satisfacer las necesidades de nuestra comunidad con excelencia y compromiso
            </motion.p>
          </motion.div>

          <ServicesCarousel services={services} />

          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/servicios" className="group inline-block">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-coop-blue via-coop-purple to-coop-green hover:from-coop-blue/90 hover:via-coop-purple/90 hover:to-coop-green/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold px-8 py-6 text-base"
                >
                  Ver Todos los Servicios
                  <motion.span
                    className="inline-block ml-2"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.span>
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Benefits Section - Enhanced with Framer Motion */}
      <motion.section 
        className="py-20 lg:py-28 bg-white relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-coop-orange/10 rounded-full mb-6">
                  <Award className="w-4 h-4 text-coop-green" />
                  <span className="text-sm font-medium text-coop-green">Ventajas Exclusivas</span>
                </div>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
                  ¿Por qué elegir nuestra Cooperativa?
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Somos más que un proveedor de servicios, somos una comunidad comprometida con tu bienestar.
                </p>
              </div>
              
              <motion.div 
                className="space-y-5"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
              >
                {benefits.map((benefit, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group"
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { 
                        opacity: 1, 
                        x: 0,
                        transition: {
                          type: "spring",
                          stiffness: 100,
                        },
                      },
                    }}
                    whileHover={{ x: 5, scale: 1.02 }}
                  >
                    <motion.div 
                      className="flex-shrink-0 mt-0.5"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="w-8 h-8 rounded-full bg-coop-green/10 flex items-center justify-center group-hover:bg-coop-green/20 transition-colors">
                        <CheckCircle className="w-5 h-5 text-coop-green" />
                      </div>
                    </motion.div>
                    <span className="text-lg text-gray-700 font-medium pt-0.5">{benefit}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            
            {/* Benefits Image Section */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            >
              {/* Community image - Desktop */}
              {/* TODO: Agregar imagen comunidad desktop: /images/community-desktop.jpg - Dimensiones: 1000x800px */}
              <motion.div 
                className="hidden lg:block relative w-full aspect-[5/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-coop-orange/20"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-coop-blue/20 via-coop-purple/20 via-coop-green/20 to-coop-orange/20 flex items-center justify-center">
                  <Users className="w-32 h-32 text-coop-green/30" />
                </div>
              </motion.div>
              
              {/* Community image - Mobile */}
              {/* TODO: Agregar imagen comunidad mobile: /images/community-mobile.jpg - Dimensiones: 600x500px */}
              <motion.div 
                className="lg:hidden relative w-full aspect-[6/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-coop-orange/20"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-coop-blue/20 via-coop-purple/20 via-coop-green/20 to-coop-orange/20 flex items-center justify-center">
                  <Users className="w-24 h-24 text-coop-green/30" />
                </div>
              </motion.div>
              
              {/* CTA Card Overlay */}
              <motion.div 
                className="absolute -bottom-6 -right-2 lg:-bottom-8 lg:-right-8 bg-white rounded-2xl shadow-2xl p-6 lg:p-8 border-2 border-coop-orange/30 max-w-xs"
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-coop-blue via-coop-purple to-coop-green rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Consulta nuestras tarifas</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Accede al cuadro tarifario oficial de ERSeP con toda la información actualizada.
                    </p>
                    <a 
                      href="https://ersep.cba.gov.ar/prestador/cooperativa-electrica-limitada-de-san-jose-de-la-dormida/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button className="w-full bg-gradient-to-r from-coop-blue via-coop-purple to-coop-green hover:from-coop-blue/90 hover:via-coop-purple/90 hover:to-coop-green/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        Ver Cuadro Tarifario
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* PFC Section - Enhanced with Framer Motion */}
      <motion.section 
        className="py-20 lg:py-28 bg-gradient-to-br from-gray-50 via-coop-green/5 to-gray-50 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        {/* Background decoration */}
        <motion.div 
          className="absolute top-0 right-0 w-96 h-96 bg-coop-green/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-96 h-96 bg-coop-orange/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* PFC Image Section */}
            <motion.div 
              className="relative order-2 lg:order-1"
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            >
              {/* PFC image - Desktop */}
              {/* TODO: Agregar imagen PFC desktop: /images/pfc-desktop.jpg - Dimensiones: 1000x800px */}
              <div className="hidden lg:block relative w-full aspect-[5/4] rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-coop-blue/30 via-coop-purple/30 via-coop-green/30 to-coop-orange/30 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <ShieldCheck className="w-32 h-32 text-coop-green/40 mx-auto" />
                    <div className="text-coop-green/60 font-semibold text-lg">Programa PFC</div>
                  </div>
                </div>
              </div>
              
              {/* PFC image - Mobile */}
              {/* TODO: Agregar imagen PFC mobile: /images/pfc-mobile.jpg - Dimensiones: 600x500px */}
              <div className="lg:hidden relative w-full aspect-[6/5] rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-coop-blue/30 via-coop-purple/30 via-coop-green/30 to-coop-orange/30 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <ShieldCheck className="w-24 h-24 text-coop-green/40 mx-auto" />
                    <div className="text-coop-green/60 font-semibold">Programa PFC</div>
                  </div>
                </div>
              </div>
              
              {/* Badge */}
              <motion.div 
                className="absolute -top-4 -right-4 lg:-top-6 lg:-right-6 bg-coop-orange rounded-full p-4 lg:p-6 shadow-xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ scale: 1.1, rotate: 360 }}
              >
                <ShieldCheck className="w-8 h-8 lg:w-10 lg:h-10 text-coop-green" />
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="space-y-8 order-1 lg:order-2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-coop-green/10 rounded-full mb-6">
                  <ShieldCheck className="w-4 h-4 text-coop-green" />
                  <span className="text-sm font-medium text-coop-green">Programa Especial</span>
                </div>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
                
                  Plan de financiamiento Colectivo
                  <span className="block text-coop-green mt-2">(PFC)</span>
                </h2>
                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-8">
                  Descubre cómo el PFC apoya la salud y el bienestar integral de nuestros socios con programas especializados y atención personalizada.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-coop-green/10 hover:bg-white/80 transition-colors">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-full bg-coop-green/10 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-coop-green" />
                    </div>
                  </div>
                  <span className="text-lg text-gray-700 font-medium pt-0.5">Beneficios médicos y de salud</span>
                </div>
                <div className="flex items-start space-x-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-coop-green/10 hover:bg-white/80 transition-colors">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-full bg-coop-green/10 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-coop-green" />
                    </div>
                  </div>
                  <span className="text-lg text-gray-700 font-medium pt-0.5">Acceso a especialistas y programas preventivos</span>
                </div>
                <div className="flex items-start space-x-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-coop-green/10 hover:bg-white/80 transition-colors">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-full bg-coop-green/10 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-coop-green" />
                    </div>
                  </div>
                  <span className="text-lg text-gray-700 font-medium pt-0.5">Apoyo integral para una mejor calidad de vida</span>
                </div>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/pfc" className="inline-block group">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-coop-blue via-coop-purple to-coop-green hover:from-coop-blue/90 hover:via-coop-purple/90 hover:to-coop-green/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold px-8 py-6 text-base"
                  >
                    Más Información sobre PFC
                    <motion.span
                      className="inline-block ml-2"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.span>
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section - Enhanced with Framer Motion */}
      <motion.section 
        className="relative bg-gradient-to-br from-coop-blue via-coop-purple via-coop-green to-coop-orange text-white py-20 lg:py-28 overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <motion.div 
            className="absolute top-0 left-0 w-96 h-96 bg-coop-orange rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div 
            className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto space-y-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Phone className="w-4 h-4 text-coop-orange" />
                </motion.div>
                <span className="text-sm font-medium">Estamos aquí para ayudarte</span>
              </motion.div>
              <motion.h2 
                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                ¿Necesitas ayuda o tienes consultas?
              </motion.h2>
              <motion.p 
                className="text-lg sm:text-xl text-green-50 leading-relaxed max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Nuestro equipo está aquí para ayudarte. Contáctanos por cualquier medio y te responderemos a la brevedad.
              </motion.p>
            </motion.div>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/contacto" className="group inline-block">
                  <Button 
                    size="lg" 
                    className="bg-coop-orange text-white hover:bg-coop-orange/90 shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold px-8 py-6 text-base w-full sm:w-auto"
                  >
                    <motion.div
                      className="inline-flex items-center"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Phone className="mr-2 w-5 h-5" />
                    </motion.div>
                    Contactar
                  </Button>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/reclamos" className="group inline-block">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white/30 bg-white/20 backdrop-blur-sm text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold px-8 py-6 text-base w-full sm:w-auto"
                  >
                    <motion.div
                      className="inline-flex items-center"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Mail className="mr-2 w-5 h-5" />
                    </motion.div>
                    Hacer Reclamo
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Teléfonos de Guardia Section - Prominent and Accessible */}
      <motion.section 
        className="py-16 lg:py-20 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 relative overflow-hidden border-t-4 border-red-500"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 rounded-full mb-4">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-bold text-red-700">EMERGENCIAS 24/7</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Teléfonos de Guardia
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Contacta con nuestros servicios de guardia las 24 horas del día, los 7 días de la semana
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Ambulancia */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group"
            >
              <Card className="h-full border-2 border-red-200 bg-white hover:border-red-400 hover:shadow-xl transition-all duration-300">
                <CardHeader className="text-center pb-3">
                  <div className="mb-4 flex justify-center">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-red-100 to-red-200 group-hover:from-red-200 group-hover:to-red-300 transition-all duration-300">
                      <Truck className="w-8 h-8 text-red-600" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Traslado Social</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <a 
                    href="tel:+543521406183" 
                    className="text-2xl font-bold text-red-600 hover:text-red-700 transition-colors inline-flex items-center gap-2 group/link"
                  >
                    <PhoneCall className="w-5 h-5 group-hover/link:scale-110 transition-transform" />
                    3521 406183
                  </a>
                </CardContent>
              </Card>
            </motion.div>

            {/* Eléctrica */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group"
            >
              <Card className="h-full border-2 border-yellow-200 bg-white hover:border-yellow-400 hover:shadow-xl transition-all duration-300">
                <CardHeader className="text-center pb-3">
                  <div className="mb-4 flex justify-center">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-100 to-yellow-200 group-hover:from-yellow-200 group-hover:to-yellow-300 transition-all duration-300">
                      <ZapIcon className="w-8 h-8 text-yellow-600" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Eléctrica</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <a 
                    href="tel:+543521406186" 
                    className="text-2xl font-bold text-yellow-600 hover:text-yellow-700 transition-colors inline-flex items-center gap-2 group/link"
                  >
                    <PhoneCall className="w-5 h-5 group-hover/link:scale-110 transition-transform" />
                    3521 406186
                  </a>
                </CardContent>
              </Card>
            </motion.div>

            {/* Internet */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group"
            >
              <Card className="h-full border-2 border-blue-200 bg-white hover:border-blue-400 hover:shadow-xl transition-all duration-300">
                <CardHeader className="text-center pb-3">
                  <div className="mb-4 flex justify-center">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                      <WifiIcon className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Internet / TV</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <a 
                    href="tel:+543521438313" 
                    className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-2 group/link"
                  >
                    <PhoneCall className="w-5 h-5 group-hover/link:scale-110 transition-transform" />
                    3521 438313
                  </a>
                </CardContent>
              </Card>
            </motion.div>

            {/* Administración */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group"
            >
              <Card className="h-full border-2 border-green-200 bg-white hover:border-green-400 hover:shadow-xl transition-all duration-300">
                <CardHeader className="text-center pb-3">
                  <div className="mb-4 flex justify-center">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300">
                      <Building2 className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Administración</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <a 
                    href="tel:+54352140130" 
                    className="text-2xl font-bold text-green-600 hover:text-green-700 transition-colors inline-flex items-center gap-2 group/link"
                  >
                    <PhoneCall className="w-5 h-5 group-hover/link:scale-110 transition-transform" />
                    3521 40130
                  </a>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sepelio */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group sm:col-span-2 lg:col-span-1"
            >
              <Card className="h-full border-2 border-gray-200 bg-white hover:border-gray-400 hover:shadow-xl transition-all duration-300">
                <CardHeader className="text-center pb-3">
                  <div className="mb-4 flex justify-center">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-gray-200 group-hover:to-gray-300 transition-all duration-300">
                      <FileText className="w-8 h-8 text-gray-600" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Servicio Funebres</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <a 
                    href="tel:+543521406189" 
                    className="text-2xl font-bold text-gray-600 hover:text-gray-700 transition-colors inline-flex items-center gap-2 group/link"
                  >
                    <PhoneCall className="w-5 h-5 group-hover/link:scale-110 transition-transform" />
                    3521 406189
                  </a>
                </CardContent>
              </Card>
            </motion.div>

            {/* Consultorios Médicos PFC (turnos) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.6 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group sm:col-span-2 lg:col-span-1"
            >
              <Card className="h-full border-2 border-emerald-200 bg-white hover:border-emerald-400 hover:shadow-xl transition-all duration-300">
                <CardHeader className="text-center pb-3">
                  <div className="mb-4 flex justify-center">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 group-hover:from-emerald-200 group-hover:to-emerald-300 transition-all duration-300">
                      <PhoneCall className="w-8 h-8 text-emerald-700" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Consultorios Médicos PFC
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <p className="text-sm text-gray-600 mb-2">
                    Turnos para consultorios médicos del servicio PFC
                  </p>
                  <a
                    href="tel:+5493521401387"
                    className="text-2xl font-bold text-emerald-700 hover:text-emerald-800 transition-colors inline-flex items-center gap-2 group/link"
                  >
                    <PhoneCall className="w-5 h-5 group-hover/link:scale-110 transition-transform" />
                    3521 401387
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Call to action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-12"
          >
            <p className="text-gray-600 text-lg mb-4">
              <span className="font-semibold text-red-600">¿Emergencia?</span> No dudes en contactarnos
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Disponibles las 24 horas, los 7 días de la semana</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </div>
  )
}
