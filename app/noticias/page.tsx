import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Calendar, Clock, User, ArrowRight, Megaphone, AlertTriangle, Info } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { news as staticNews, featuredNews as staticFeaturedNews, type NewsPost } from "./posts"

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

export const dynamic = "force-dynamic"

export default async function NoticiasPage() {
  // 1) Intentar leer desde Supabase
  const { data: dbPosts, error } = await supabase
    .from("news_posts")
    .select("*")
    .order("date", { ascending: false })

  let featuredNews = staticFeaturedNews
  let news: NewsPost[] = staticNews

  if (!error && dbPosts && dbPosts.length > 0) {
    const mapped = dbPosts.map(mapDbToNewsPost)
    featuredNews = mapped[0]
    news = mapped.slice(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-coop-blue via-coop-purple via-coop-green to-coop-orange text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">Noticias y Novedades</h1>
            <p className="text-xl text-green-100">Mantente informado sobre las últimas novedades de tu cooperativa</p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Featured News */}
        <div className="mb-12">
          <Card className="overflow-hidden border-2 border-coop-green/20">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative h-64 lg:h-auto">
                <Image
                  src={featuredNews.image || "/placeholder.svg"}
                  alt={featuredNews.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className={`${getCategoryColor(featuredNews.category)} flex items-center gap-1`}>
                    {getCategoryIcon(featuredNews.category)}
                    {featuredNews.category}
                  </Badge>
                </div>
              </div>
              <div className="p-6 lg:p-8">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-2xl lg:text-3xl mb-3">{featuredNews.title}</CardTitle>
                  <CardDescription className="text-base">{featuredNews.excerpt}</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(featuredNews.date).toLocaleDateString("es-AR")}
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {featuredNews.author}
                    </div>
                  </div>
                  <Button asChild className="bg-gradient-to-r from-coop-blue via-coop-purple to-coop-green hover:from-coop-blue/90 hover:via-coop-purple/90 hover:to-coop-green/90 text-white">
                    <Link href={`/noticias/${featuredNews.slug}`}>
                      Leer Completa
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </div>
            </div>
          </Card>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((article) => (
            <Card key={article.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
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

      <Footer />
    </div>
  )
}
