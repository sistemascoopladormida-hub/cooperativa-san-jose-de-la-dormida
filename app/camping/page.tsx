"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Clock,
  Calendar,
  DollarSign,
  Wifi,
  Droplet,
  Zap,
  UtensilsCrossed,
  Trees,
  Camera,
  ArrowRight,
  CheckCircle,
  Mountain,
  Waves,
  Sun,
  Users,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

// Función helper para obtener URLs de imágenes desde Supabase Storage
const getSupabaseImageUrl = (imagePath: string): string => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  
  if (!supabaseUrl) {
    console.error("NEXT_PUBLIC_SUPABASE_URL no está configurado")
    // Fallback a ruta local si no hay URL de Supabase
    return imagePath
  }
  
  // Las imágenes están en el bucket "news-images" dentro de la carpeta "camping"
  const bucketName = "news-images"
  const folderPath = "camping"
  // Remover el "/images/" del path si existe ya que en Supabase solo necesitamos el nombre del archivo
  const fileName = imagePath.replace("/images/", "")
  // Construir la URL pública del storage de Supabase: bucket/carpeta/archivo
  const url = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${folderPath}/${fileName}`
  
  return url
}

export default function CampingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  // Debug: Verificar URLs de imágenes (remover en producción)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('Ejemplo de URL de imagen:', getSupabaseImageUrl("/images/1.png"))
    }
  }, [])

  // Imágenes para el carrusel del hero - desde Supabase Storage
  const heroImages = [
    {
      id: 1,
      desktop: getSupabaseImageUrl("/images/11.png"),
      mobile: getSupabaseImageUrl("/images/1.png"),
      alt: "Vista panorámica del camping Pisco Huasi",
      title: "Vista Panorámica",
    },
    {
      id: 2,
      desktop: getSupabaseImageUrl("/images/12.png"),
      mobile: getSupabaseImageUrl("/images/2.png"),
      alt: "Instalaciones del camping",
      title: "Instalaciones",
    },
    {
      id: 3,
      desktop: getSupabaseImageUrl("/images/13.png"),
      mobile: getSupabaseImageUrl("/images/3.png"),
      alt: "Naturaleza y río",
      title: "Naturaleza",
    },
    {
      id: 4,
      desktop: getSupabaseImageUrl("/images/14.png"),
      mobile: getSupabaseImageUrl("/images/4.png"),
      alt: "Mirador y vistas",
      title: "Mirador",
    },
    {
      id: 5,
      desktop: getSupabaseImageUrl("/images/10.png"),
      mobile: getSupabaseImageUrl("/images/5.png"),
      alt: "Áreas comunes y asadores",
      title: "Áreas Comunes",
    },
    {
        id: 6,
        desktop: getSupabaseImageUrl("/images/11.png"),
        mobile: getSupabaseImageUrl("/images/6.png"),
        alt: "Cartel de camping",
        title: "Cartel de camping",
      },
  ]

  // Auto-play del carrusel
  useEffect(() => {
    if (!isAutoPlay) return
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }, 5000) // Cambia cada 5 segundos

    return () => clearInterval(interval)
  }, [isAutoPlay, heroImages.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    setIsAutoPlay(false)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length)
    setIsAutoPlay(false)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlay(false)
  }

  // Touch handlers para swipe en móvil
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    
    const distance = touchStartX.current - touchEndX.current
    const minSwipeDistance = 50

    if (distance > minSwipeDistance) {
      nextSlide()
    } else if (distance < -minSwipeDistance) {
      prevSlide()
    }

    touchStartX.current = null
    touchEndX.current = null
  }
  const services = [
    {
      icon: Wifi,
      title: "WiFi",
      description: "Conexión a internet disponible",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Droplet,
      title: "Agua Potable",
      description: "Acceso a agua potable y agua caliente",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
    },
    {
      icon: Zap,
      title: "Energía Eléctrica",
      description: "Dos hectáreas con energía eléctrica",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      icon: UtensilsCrossed,
      title: "Proveeduría",
      description: "Proveeduría disponible en el camping",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: Trees,
      title: "Espacio Perimetrado",
      description: "Predio seguro y perimetrado",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Mountain,
      title: "Mirador",
      description: "Mirador con vistas panorámicas",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Waves,
      title: "Bajada de Río",
      description: "Acceso directo al río",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
    {
      icon: Users,
      title: "Mesas y Asadores",
      description: "Áreas para asar y mesas para disfrutar",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ]

  const pricing = [
    {
      title: "Ingreso",
      price: "$3.000",
      period: "por persona",
      description: "Acceso al camping",
      icon: Sun,
      color: "from-yellow-400 to-orange-500",
    },
    {
      title: "Acampe",
      price: "$8.000",
      period: "por persona",
      description: "Pernocte y disfrute",
      icon: Trees,
      color: "from-green-400 to-emerald-600",
    },
  ]

  // ============================================
  // ESPECIFICACIONES DE IMÁGENES PARA EL USUARIO
  // ============================================
  // 
  // CARRUSEL HERO (5 imágenes para deslizar):
  // - camping-hero-1-desktop.png: 1920x800px (Vista Panorámica)
  // - 1.png (mobile): 800x600px
  // - camping-hero-2-desktop.png: 1920x800px (Instalaciones)
  // - 2.png (mobile): 800x600px
  // - camping-hero-3-desktop.png: 1920x800px (Naturaleza)
  // - 3.png (mobile): 800x600px
  // - camping-hero-4-desktop.png: 1920x800px (Mirador)
  // - 4.png (mobile): 800x600px
  // - camping-hero-5-desktop.png: 1920x800px (Áreas Comunes)
  // - 5.png (mobile): 800x600px
  //
  // GALERÍA:
  // - camping-gallery-1.jpg: 1200x800px
  // - camping-gallery-2.jpg: 1200x800px
  // - camping-gallery-3.jpg: 1200x800px
  // - camping-gallery-4.jpg: 1200x800px

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cooperativaladormida.com"

  // Datos estructurados JSON-LD para SEO - Campground
  const campgroundData = {
    "@context": "https://schema.org",
    "@type": "Campground",
    name: "Camping Pisco Huasi",
    description: "Camping familiar ubicado en Quebrada del Tigre, con energía eléctrica, WiFi, agua potable, mirador y bajada de río. Abierto de martes a domingo de 9:00 a 21:00 hs.",
    url: `${siteUrl}/camping`,
    image: [
      getSupabaseImageUrl("/images/11.png"),
      getSupabaseImageUrl("/images/12.png"),
      getSupabaseImageUrl("/images/13.png"),
      getSupabaseImageUrl("/images/7.png"),
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Quebrada del Tigre",
      addressRegion: "Córdoba",
      addressCountry: "AR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -30.30211407479485,
      longitude: -63.994973724436285,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "09:00",
        closes: "21:00",
      },
    ],
    priceRange: "$3000 - $8000",
    amenities: [
      "WiFi",
      "Agua potable",
      "Agua caliente",
      "Energía eléctrica",
      "Sanitarios",
      "Proveeduría",
      "Mesas",
      "Asadores",
      "Mirador",
      "Bajada de río",
      "Espacio perimetrado",
    ],
    containsPlace: {
      "@type": "Place",
      name: "Quebrada del Tigre",
    },
    parentOrganization: {
      "@type": "Organization",
      name: "Cooperativa Eléctrica Limitada de San José de la Dormida",
      url: siteUrl,
    },
  }

  // Breadcrumbs para SEO
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Camping Pisco Huasi",
        item: `${siteUrl}/camping`,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/30">
      {/* Schema.org JSON-LD para SEO - Campground */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(campgroundData) }}
      />
      {/* Schema.org JSON-LD para SEO - Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      
      <Header />

      {/* Hero Section with Enhanced Image Carousel */}
      <section
        className="relative text-white overflow-hidden h-screen max-h-[900px] lg:max-h-[100vh]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Carousel Container with Parallax Effect */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            {heroImages.map((image, index) => {
              if (index !== currentSlide) return null
              
              return (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                  className="absolute inset-0"
                >
                  {/* Desktop Image */}
                  <div className="hidden lg:block absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-coop-green/95 via-coop-blue/90 to-coop-purple/95">
                      <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)`
                      }}></div>
                    </div>
                    <div className="absolute inset-0">
                      <Image
                        src={image.desktop}
                        alt={image.alt}
                        fill
                        priority={index === 0}
                        className="object-cover"
                        sizes="100vw"
                        unoptimized
                      />
                    </div>
                  </div>

                  {/* Mobile Image */}
                  <div className="lg:hidden absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-coop-green/95 via-coop-blue/90 to-coop-purple/95">
                      <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)`
                      }}></div>
                    </div>
                    <div className="absolute inset-0">
                      <Image
                        src={image.mobile}
                        alt={image.alt}
                        fill
                        priority={index === 0}
                        className="object-cover"
                        sizes="100vw"
                        unoptimized
                      />
                    </div>
                  </div>

                  {/* Dynamic Overlay - Más oscuro abajo, más claro arriba */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70"></div>
                  
                  {/* Shine Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 5,
                      ease: "linear"
                    }}
                  />
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Background decorative elements - más sutiles */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <motion.div
            className="absolute top-0 right-0 w-[600px] h-[600px] bg-coop-orange rounded-full blur-3xl"
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
        </div>

        {/* Main Content - Layout Mejorado */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Top Bar with Badge and Slide Counter */}
          <div className="container mx-auto px-4 pt-8 lg:pt-12">
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge className="px-4 py-2 text-sm bg-white/15 backdrop-blur-md border border-white/30 text-white hover:bg-white/25 transition-all shadow-lg">
                  <Trees className="w-4 h-4 mr-2" />
                  Quebrada del Tigre
                </Badge>
              </motion.div>

              {/* Slide Counter - Estilo Moderno */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-3 bg-white/15 backdrop-blur-md border border-white/30 rounded-full px-4 py-2 shadow-lg"
              >
                <span className="text-sm font-medium text-white/90 transition-all duration-300">{currentSlide + 1}</span>
                <div className="w-px h-4 bg-white/30"></div>
                <span className="text-sm font-medium text-white/60">{heroImages.length}</span>
              </motion.div>
            </div>
          </div>

          {/* Center Content - Mejor Distribución */}
          <div className="flex-1 flex items-center justify-center lg:justify-start">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="max-w-3xl lg:max-w-2xl">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="space-y-6"
                >
                  {/* Image Title Badge - Solo el texto cambia, sin animación */}
                  <div>
                    <Badge className="mb-4 px-4 py-1.5 text-xs bg-coop-orange/90 text-white border-0 font-semibold transition-opacity duration-300">
                      {heroImages[currentSlide].title}
                    </Badge>
                  </div>

                  <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-[1.1] tracking-tight">
                    <span className="block text-white drop-shadow-2xl">
                      Camping
                    </span>
                    <span className="block mt-2 bg-gradient-to-r from-coop-orange via-orange-300 to-coop-orange bg-clip-text text-transparent drop-shadow-lg">
                      Pisco Huasi
                    </span>
                    <span className="block mt-3 text-2xl sm:text-3xl lg:text-4xl text-white/90 font-semibold">
                      Verano 2026
                    </span>
                  </h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-lg sm:text-xl lg:text-2xl text-white/95 leading-relaxed font-medium max-w-2xl drop-shadow-lg"
                  >
                    Viví el verano con familia y amigos, rodeado de naturaleza, tranquilidad y buenos momentos.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4 pt-4"
                  >
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <a href="#informacion">
                        <Button
                          size="lg"
                          className="bg-coop-orange text-white hover:bg-coop-orange/90 shadow-2xl hover:shadow-coop-orange/50 transition-all duration-300 font-bold px-8 py-7 text-base group"
                        >
                          Más Información
                          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </a>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <a href="#ubicacion">
                        <Button
                          size="lg"
                          variant="outline"
                          className="border-2 border-white/40 bg-white/15 backdrop-blur-md text-white shadow-xl hover:bg-white/25 hover:border-white/60 transition-all duration-300 font-semibold px-8 py-7 text-base"
                        >
                          <MapPin className="mr-2 w-5 h-5" />
                          Ver Ubicación
                        </Button>
                      </a>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Navigation and Thumbnails */}
          <div className="container mx-auto px-4 pb-6 lg:pb-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Thumbnail Navigation - Desktop */}
              <div className="hidden lg:flex items-center gap-3">
                {heroImages.map((image, index) => (
                  <motion.button
                    key={image.id}
                    onClick={() => goToSlide(index)}
                    className={`relative overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                      index === currentSlide
                        ? "border-white scale-110 shadow-2xl ring-4 ring-white/30"
                        : "border-white/30 hover:border-white/60 opacity-60 hover:opacity-100"
                    }`}
                    whileHover={{ scale: index === currentSlide ? 1.1 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-20 h-12 relative">
                      <Image
                        src={image.desktop}
                        alt={image.alt}
                        fill
                        className="object-cover"
                        sizes="80px"
                        unoptimized
                      />
                      <div className={`absolute inset-0 transition-opacity ${
                        index === currentSlide ? "opacity-0" : "opacity-50 bg-black"
                      }`}></div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Dot Indicators - Mobile & Backup */}
              <div className="flex lg:hidden items-center gap-2">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentSlide
                        ? "bg-white w-10 h-3 shadow-lg"
                        : "bg-white/50 hover:bg-white/70 w-3 h-3"
                    }`}
                    aria-label={`Ir a imagen ${index + 1}`}
                  />
                ))}
              </div>

              {/* Navigation Arrows - Mejoradas */}
              <div className="flex items-center gap-4">
                <button
                  onClick={prevSlide}
                  className="group relative bg-white/15 backdrop-blur-md hover:bg-white/25 border-2 border-white/30 hover:border-white/50 rounded-full p-4 transition-all duration-300 hover:scale-110 hover:shadow-xl"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>

                <button
                  onClick={nextSlide}
                  className="group relative bg-white/15 backdrop-blur-md hover:bg-white/25 border-2 border-white/30 hover:border-white/50 rounded-full p-4 transition-all duration-300 hover:scale-110 hover:shadow-xl"
                  aria-label="Siguiente imagen"
                >
                  <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-l from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar - Visual Indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20">
          <motion.div
            key={currentSlide}
            className="h-full bg-gradient-to-r from-coop-orange via-orange-300 to-coop-orange"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 5, ease: "linear" }}
          />
        </div>
      </section>

      {/* Quick Info Cards */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className="text-center border-2 border-coop-green/20 hover:border-coop-green/40 transition-all">
                <CardHeader>
                  <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-coop-green/10 to-coop-green/5 rounded-full flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-coop-green" />
                  </div>
                  <CardTitle className="text-lg">Horarios</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 font-semibold">Martes a Domingo</p>
                  <p className="text-coop-green font-bold text-lg">9:00 a 21:00 hs</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className="text-center border-2 border-coop-blue/20 hover:border-coop-blue/40 transition-all">
                <CardHeader>
                  <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-coop-blue/10 to-coop-blue/5 rounded-full flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-coop-blue" />
                  </div>
                  <CardTitle className="text-lg">Ubicación</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 font-semibold">Quebrada del Tigre</p>
                  <p className="text-coop-blue font-bold text-lg">Campo cercano</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className="text-center border-2 border-coop-orange/20 hover:border-coop-orange/40 transition-all">
                <CardHeader>
                  <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-coop-orange/10 to-coop-orange/5 rounded-full flex items-center justify-center">
                    <Trees className="w-8 h-8 text-coop-orange" />
                  </div>
                  <CardTitle className="text-lg">Predio</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 font-semibold">Dos hectáreas</p>
                  <p className="text-coop-orange font-bold text-lg">Perimetrado</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="informacion" className="py-20 lg:py-28 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-coop-green rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-coop-orange rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-coop-green/10 rounded-full mb-6">
              <DollarSign className="w-4 h-4 text-coop-green" />
              <span className="text-sm font-medium text-coop-green">Precios Verano 2026</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Tarifas
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Precios accesibles para disfrutar de la naturaleza con familia y amigos
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricing.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -10 }}
              >
                <Card className="h-full border-2 border-gray-200 hover:border-coop-green/40 transition-all overflow-hidden relative group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-coop-green/10 to-coop-green/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon className="w-10 h-10 text-coop-green" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="mb-4">
                      <span className="text-5xl font-bold text-coop-green">{item.price}</span>
                      <p className="text-gray-600 mt-2">{item.period}</p>
                    </div>
                    <p className="text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-coop-blue/10 rounded-full mb-6">
              <CheckCircle className="w-4 h-4 text-coop-blue" />
              <span className="text-sm font-medium text-coop-blue">Servicios Disponibles</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Servicios e Instalaciones
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Todo lo necesario para disfrutar de una estadía cómoda y placentera
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Card className={`h-full border-2 ${service.bgColor} border-transparent hover:border-gray-300 transition-all`}>
                  <CardHeader className="text-center">
                    <div className={`mx-auto mb-4 w-16 h-16 ${service.bgColor} rounded-full flex items-center justify-center`}>
                      <service.icon className={`w-8 h-8 ${service.color}`} />
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">{service.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Additional Info */}
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="border-2 border-coop-green/20 bg-gradient-to-br from-green-50/50 to-emerald-50/30">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 text-center">
                  Características del Predio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Dos hectáreas de predio perimetrado",
                    "Energía eléctrica disponible",
                    "Mirador con vistas panorámicas",
                    "Agua potable y agua caliente",
                    "Mesas y asadores disponibles",
                    "Bajada de río para disfrutar",
                    "Sanitarios disponibles",
                    "WiFi para mantenerte conectado",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-coop-green flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Image Gallery Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-coop-purple/10 rounded-full mb-6">
              <Camera className="w-4 h-4 text-coop-purple" />
              <span className="text-sm font-medium text-coop-purple">Galería</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Conocé Nuestro Camping
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Disfrutá de un vistazo a las instalaciones y el entorno natural
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {/* Image 1 - Desktop: 1200x800px */}
            <motion.div
              className="relative h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl group"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* TODO: Agregar imagen galería 1: /images/camping-gallery-1.jpg - Dimensiones: 1200x800px */}
              <div className="absolute inset-0 bg-gradient-to-br from-coop-green/20 via-coop-blue/20 to-coop-purple/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="w-24 h-24 text-white/30" />
                </div>
              </div>
              <Image
                src={getSupabaseImageUrl("/images/7.png")}
                alt="Vista del camping Pisco Huasi"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
              />
            </motion.div>

            {/* Image 2 - Desktop: 1200x800px */}
            <motion.div
              className="relative h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl group"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-coop-blue/20 via-coop-purple/20 to-coop-green/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="w-24 h-24 text-white/30" />
                </div>
              </div>
              <Image
                src={getSupabaseImageUrl("/images/8.png")}
                alt="Instalaciones del camping"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
              />
            </motion.div>

            {/* Image 3 - Desktop: 1200x800px */}
            <motion.div
              className="relative h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl group"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-coop-purple/20 via-coop-green/20 to-coop-orange/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="w-24 h-24 text-white/30" />
                </div>
              </div>
              <Image
                src={getSupabaseImageUrl("/images/9.png")}
                alt="Naturaleza del camping"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
              />
            </motion.div>

            {/* Image 4 - Desktop: 1200x800px */}
            <motion.div
              className="relative h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl group"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-coop-orange/20 via-coop-green/20 to-coop-blue/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="w-24 h-24 text-white/30" />
                </div>
              </div>
              <Image
                src={getSupabaseImageUrl("/images/10.png")}
                alt="Actividades en el camping"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="ubicacion" className="py-20 lg:py-28 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-coop-green/10 rounded-full mb-6">
              <MapPin className="w-4 h-4 text-coop-green" />
              <span className="text-sm font-medium text-coop-green">Ubicación</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Cómo Llegar
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Encontranos en Quebrada del Tigre, en un campo cercano a la cooperativa
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            <motion.div
              className="rounded-2xl overflow-hidden shadow-2xl border-4 border-coop-green/20"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative w-full h-64 md:h-96 lg:h-[500px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3444.717109344487!2d-63.994973724436285!3d-30.30211407479485!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9431f54fe655e5ff%3A0xaf1221ec0fb7dc72!2sCamping%20Pisco%20Huasi!5e0!3m2!1ses!2sar!4v1767112413345!5m2!1ses!2sar"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-coop-green via-coop-blue to-coop-purple text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <motion.div
            className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"
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
            className="absolute bottom-0 right-0 w-96 h-96 bg-coop-orange rounded-full blur-3xl"
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
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                ¿Listo para disfrutar del verano?
              </h2>
              <p className="text-lg sm:text-xl text-green-50 leading-relaxed max-w-2xl mx-auto">
                Te esperamos en Camping Pisco Huasi para vivir momentos inolvidables rodeado de naturaleza y tranquilidad.
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <a href="tel:+54352140130">
                  <Button
                    size="lg"
                    className="bg-coop-orange text-white hover:bg-coop-orange/90 shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold px-8 py-6 text-base w-full sm:w-auto"
                  >
                    <Phone className="mr-2 w-5 h-5" />
                    Llamar Ahora
                  </Button>
                </a>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/contacto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white/30 bg-white/20 backdrop-blur-sm text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold px-8 py-6 text-base w-full sm:w-auto"
                  >
                    <Mail className="mr-2 w-5 h-5" />
                    Contactar
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              className="pt-8 border-t border-white/20"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-green-50">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">Martes a Domingo: 9:00 - 21:00 hs</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span className="font-semibold">Quebrada del Tigre</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

