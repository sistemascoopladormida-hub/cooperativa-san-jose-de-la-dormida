"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Calendar, Clock, User, ArrowRight, Megaphone, AlertTriangle, Info, Cloud } from "lucide-react"
import { news as staticNews, featuredNews as staticFeaturedNews, type NewsPost } from "./posts"
import WeatherModal from "@/components/clima/weather-modal"

type DbNewsPost = {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string
  date: string
  author: string
  category: string
  image_url: string | null
  read_time: string | null
  tags: string[] | null
}

function mapDbToNewsPost(dbPost: DbNewsPost): NewsPost {
  return {
    id: dbPost.id,
    slug: dbPost.slug,
    title: dbPost.title,
    excerpt: dbPost.excerpt,
    content: dbPost.content,
    date: dbPost.date,
    author: dbPost.author,
    category: dbPost.category,
    image: dbPost.image_url ?? undefined,
    readTime: dbPost.read_time ?? undefined,
    tags: dbPost.tags ?? undefined,
  }
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Importante":
      return <AlertTriangle className="w-4 h-4" />
    case "Mantenimiento":
      return <Info className="w-4 h-4" />
    case "Promociones":
      return <Megaphone className="w-4 h-4" />
    default:
      return <Info className="w-4 h-4" />
  }
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Importante":
      return "bg-red-100 text-red-800"
    case "Mantenimiento":
      return "bg-orange-100 text-orange-800"
    case "Promociones":
      return "bg-green-100 text-green-800"
    case "Eventos":
      return "bg-blue-100 text-blue-800"
    case "Infraestructura":
      return "bg-purple-100 text-purple-800"
    case "Beneficios":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function NoticiasPage() {
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false)
  const [allNews, setAllNews] = useState<NewsPost[]>([
    ...(staticFeaturedNews ? [staticFeaturedNews] : []),
    ...staticNews,
  ])

  // Cargar noticias desde el cliente usando la API
  useEffect(() => {
    const loadNews = async () => {
      try {
        const response = await fetch("/api/noticias/public")
        
        if (!response.ok) {
          throw new Error("Error al obtener noticias")
        }

        const { posts: dbPosts } = await response.json()

        let news: NewsPost[] = [...staticNews]
        
        if (staticFeaturedNews) {
          news = [staticFeaturedNews, ...staticNews]
        }

        if (dbPosts && dbPosts.length > 0) {
          const mapped = dbPosts.map(mapDbToNewsPost)
          setAllNews(mapped)
        } else {
          setAllNews(news)
        }
      } catch (err) {
        console.error("Error loading news:", err)
        // En caso de error, usar noticias estáticas
        setAllNews([...(staticFeaturedNews ? [staticFeaturedNews] : []), ...staticNews])
      }
    }
    loadNews()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-coop-blue via-coop-purple via-coop-green to-coop-orange text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">Noticias y Novedades</h1>
            <p className="text-xl text-green-100 mb-8">Mantente informado sobre las últimas novedades de tu cooperativa</p>
            <Button
              onClick={() => setIsWeatherModalOpen(true)}
              size="lg"
              className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 text-lg px-8 py-6"
            >
              <Cloud className="w-5 h-5 mr-2" />
              Ver Clima
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">

        {/* News Grid - Todas las noticias con el mismo formato */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allNews.map((article) => (
            <Card key={article.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              {article.image && (
                <div className="relative w-full aspect-[4/5]">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge className={`${getCategoryColor(article.category)} flex items-center gap-1 text-xs`}>
                      {getCategoryIcon(article.category)}
                      {article.category}
                    </Badge>
                  </div>
                </div>
              )}
              <CardHeader>
                {!article.image && (
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`${getCategoryColor(article.category)} flex items-center gap-1`}>
                      {getCategoryIcon(article.category)}
                      {article.category}
                    </Badge>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {article.readTime}
                    </div>
                  </div>
                )}
                {article.image && (
                  <div className="flex items-center justify-end mb-2">
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {article.readTime}
                    </div>
                  </div>
                )}
                <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                <CardDescription className="line-clamp-3">{article.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500 space-x-3">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(article.date).toLocaleDateString("es-AR")}
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/noticias/${article.slug}`}>
                      Leer más
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Cargar más noticias
          </Button>
        </div>
      </div>

      {/* Modal del Clima */}
      <WeatherModal open={isWeatherModalOpen} onOpenChange={setIsWeatherModalOpen} />

      <Footer />
    </div>
  )
}
