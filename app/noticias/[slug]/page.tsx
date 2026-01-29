import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Calendar, User, Tag, ArrowLeft, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { supabase } from "@/lib/supabase"
import { featuredNews as staticFeaturedNews, news as staticNews, type NewsPost } from "../posts"

interface Props {
  params: Promise<{ slug: string }>
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

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
  image_urls: string[] | null
  read_time: string | null
  tags: string[] | null
}

type FullNewsPost = NewsPost & { images: string[] }

function mapDbToNewsPost(dbPost: DbNewsPost): FullNewsPost {
  const images =
    dbPost.image_urls && dbPost.image_urls.length > 0
      ? dbPost.image_urls
      : dbPost.image_url
        ? [dbPost.image_url]
        : []
  return {
    id: dbPost.id,
    slug: dbPost.slug,
    title: dbPost.title,
    excerpt: dbPost.excerpt,
    content: dbPost.content,
    date: dbPost.date,
    author: dbPost.author,
    category: dbPost.category,
    image: images[0],
    images,
    readTime: dbPost.read_time ?? undefined,
    tags: dbPost.tags ?? undefined,
  }
}

export const dynamic = "force-dynamic"

export default async function NoticiaIndividual({ params }: Props) {
  const { slug } = await params

  // 1) Intentar obtener la noticia desde Supabase
  const { data: dbPost, error } = await supabase
    .from("news_posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle<DbNewsPost>()

  let post: FullNewsPost | undefined
  let related: FullNewsPost[] = []

  if (!error && dbPost) {
    post = mapDbToNewsPost(dbPost)

    const { data: dbRelated } = await supabase
      .from("news_posts")
      .select("*")
      .eq("category", dbPost.category)
      .neq("slug", dbPost.slug)
      .order("date", { ascending: false })
      .limit(2)

    if (dbRelated) {
      related = dbRelated.map(mapDbToNewsPost)
    }
  } else {
    // 2) Fallback al contenido estático existente
    const staticPost =
      slug === staticFeaturedNews.slug
        ? staticFeaturedNews
        : staticNews.find((n) => n.slug === slug)

    if (!staticPost) return notFound()

    post = {
      ...staticPost,
      images: staticPost.image ? [staticPost.image] : [],
    }

    related = staticNews
      .filter((n) => n.category === post!.category && n.slug !== post!.slug)
      .slice(0, 2)
  }

  if (!post) return notFound()

  const images = "images" in post && Array.isArray(post.images) ? post.images : (post.image ? [post.image] : [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero de la noticia */}
      <section className="bg-gradient-to-br from-coop-blue via-coop-purple to-coop-green text-white">
        <div className="container mx-auto px-4 py-10 lg:py-16">
          <Link
            href="/noticias"
            className="inline-flex items-center text-sm text-green-100 hover:text-white mb-4 hover:underline transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver a noticias
          </Link>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] items-start">
            <div>
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/20 backdrop-blur">
                  {post.category}
                </span>
                {post.readTime && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black/20">
                    {post.readTime} de lectura
                  </span>
                )}
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold leading-tight mb-4">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-green-100/90">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(post.date).toLocaleDateString("es-AR")}
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {post.author}
                </div>
              </div>
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-0.5 rounded-full bg-white/10 text-xs font-medium"
                    >
                      <Tag className="w-3 h-3 mr-1" /> {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {images.length > 0 && (
              <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden shadow-lg ring-1 ring-white/20">
                <Image
                  src={images[0] || "/placeholder.svg"}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 420px, 100vw"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contenido y relacionadas */}
      <main className="container mx-auto px-4 py-10 lg:py-14 grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        <article className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8">
          {images.length > 1 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Galería de imágenes</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((src, idx) => (
                  <div key={src} className="relative aspect-[4/5] rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                    <Image
                      src={src}
                      alt={`${post.title} - imagen ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="(min-width: 640px) 33vw, 50vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="prose prose-lg max-w-none prose-headings:scroll-mt-24 prose-a:text-coop-green">
            <p className="whitespace-pre-line leading-relaxed text-gray-800">
              {post.content}
            </p>
          </div>
        </article>

        <aside className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Detalles de la noticia
            </h2>
            <dl className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Categoría</dt>
                <dd className="font-medium text-right">{post.category}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Fecha</dt>
                <dd className="font-medium text-right">
                  {new Date(post.date).toLocaleDateString("es-AR")}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Autor</dt>
                <dd className="font-medium text-right">{post.author}</dd>
              </div>
              {post.readTime && (
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Tiempo de lectura</dt>
                  <dd className="font-medium text-right">{post.readTime}</dd>
                </div>
              )}
            </dl>
          </div>

          {related.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2 uppercase tracking-wide">
                <ArrowRight className="w-4 h-4 text-coop-green" /> Noticias relacionadas
              </h2>
              <ul className="space-y-3">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/noticias/${r.slug}`}
                      className="group block"
                    >
                      <p className="text-sm font-medium text-gray-800 group-hover:text-coop-blue transition-colors">
                        {r.title}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                        <span>
                          {new Date(r.date).toLocaleDateString("es-AR")}
                        </span>
                        {r.readTime && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                            <span>{r.readTime}</span>
                          </>
                        )}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </main>

      <Footer />
    </div>
  )
}

// Función helper para normalizar URLs de imágenes
function normalizeImageUrl(imageUrl: string | null | undefined): string | undefined {
  if (!imageUrl) return undefined

  // Si ya es una URL absoluta (http/https), retornarla tal cual
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl
  }

  // Si es una ruta de Supabase Storage (puede venir como ruta relativa o nombre de archivo)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  if (supabaseUrl) {
    // Si la imagen está en Supabase Storage (bucket news-images)
    // Puede venir como: "/images/nombre.jpg" o "nombre.jpg" o ruta completa
    if (imageUrl.includes("/images/") || imageUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
      const bucketName = "news-images"
      // Remover "/images/" si existe
      const fileName = imageUrl.replace("/images/", "")
      // Construir la URL pública de Supabase Storage
      const cleanFileName = fileName.startsWith("/") ? fileName.substring(1) : fileName
      return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${cleanFileName}`
    }

    // Si ya incluye el dominio de Supabase, retornarla
    if (imageUrl.includes(supabaseUrl)) {
      return imageUrl
    }

    // Si es una ruta que empieza con /storage/, construir la URL completa
    if (imageUrl.startsWith("/storage/")) {
      return `${supabaseUrl}${imageUrl}`
    }
  }

  // Si es una ruta local, construir URL absoluta con SITE_URL
  const cleanPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`
  return `${SITE_URL}${cleanPath}`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params

  // 1) Intentar obtener metadata desde Supabase
  const { data: dbPost } = await supabase
    .from("news_posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle<DbNewsPost>()

  let title = "Noticia no encontrada"
  let description = "La noticia que buscas no existe o fue eliminada."
  let imageUrl: string | undefined
  let author = "Cooperativa Eléctrica Ltda."
  let publishedTime: string | undefined
  let articleUrl = `${SITE_URL}/noticias/${slug}`

  if (dbPost) {
    title = dbPost.title + " | Cooperativa La Dormida"
    description = dbPost.excerpt || "Noticia de la Cooperativa Eléctrica Ltda. de San José de la Dormida"
    imageUrl = normalizeImageUrl(dbPost.image_url)
    author = dbPost.author || author
    publishedTime = dbPost.date ? new Date(dbPost.date).toISOString() : undefined
  } else {
    const staticPost =
      slug === staticFeaturedNews.slug
        ? staticFeaturedNews
        : staticNews.find((n) => n.slug === slug)
    if (staticPost) {
      title = staticPost.title + " | Cooperativa La Dormida"
      description = staticPost.excerpt || "Noticia de la Cooperativa Eléctrica Ltda. de San José de la Dormida"
      imageUrl = normalizeImageUrl(staticPost.image)
      author = staticPost.author || author
      publishedTime = new Date(staticPost.date).toISOString()
    }
  }

  // Imagen por defecto si no hay imagen
  const defaultImage = `${SITE_URL}/logo.png`
  const ogImage = imageUrl || defaultImage

  return {
    title,
    description,
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      title,
      description,
      url: articleUrl,
      siteName: "Cooperativa La Dormida",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "article",
      publishedTime,
      authors: [author],
      locale: "es_AR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: "@cooperativaladormida",
      site: "@cooperativaladormida",
    },
  }
}
