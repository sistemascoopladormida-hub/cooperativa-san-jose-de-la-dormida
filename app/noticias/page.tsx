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

  let allNews: NewsPost[] = [...staticNews]
  
  // Si hay noticias destacadas estáticas, agregarlas al inicio
  if (staticFeaturedNews) {
    allNews = [staticFeaturedNews, ...staticNews]
  }

  if (!error && dbPosts && dbPosts.length > 0) {
    const mapped = dbPosts.map(mapDbToNewsPost)
    allNews = mapped
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

      <Footer />
    </div>
  )
}
