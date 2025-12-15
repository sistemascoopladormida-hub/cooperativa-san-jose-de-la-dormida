import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Calendar, User, Tag, ArrowLeft, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { featuredNews as staticFeaturedNews, news as staticNews, type NewsPost } from "../posts"
import type { Metadata } from "next"

interface Props {
  params: { slug: string }
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
  read_time: string | null
  tags: string[] | null
}

export const revalidate = 60

function mapDbToNewsPost(post: DbNewsPost): NewsPost {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    date: post.date,
    author: post.author,
    category: post.category,
    image: post.image_url ?? undefined,
    readTime: post.read_time ?? undefined,
    tags: post.tags ?? undefined,
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

async function getPostBySlug(slug: string): Promise<NewsPost | undefined> {
  try {
    const { data, error } = await supabase
      .from("news_posts")
      .select(
        "id, slug, title, excerpt, content, date, author, category, image_url, read_time, tags"
      )
      .eq("slug", slug)
      .maybeSingle()

    if (error && error.code !== "PGRST116") {
      console.error("Error obteniendo noticia desde Supabase:", error)
    }

    if (data) {
      return mapDbToNewsPost(data as DbNewsPost)
    }

    // Fallback: buscar por slug generado desde el título, por si la columna slug está vacía o mal cargada
    const { data: allPosts } = await supabase
      .from("news_posts")
      .select(
        "id, slug, title, excerpt, content, date, author, category, image_url, read_time, tags"
      )
      .order("date", { ascending: false })
      .limit(100)

    if (allPosts && Array.isArray(allPosts)) {
      const matched = (allPosts as DbNewsPost[]).find((p) => slugify(p.title) === slug)
      if (matched) {
        return mapDbToNewsPost(matched)
      }
    }
  } catch (error) {
    console.error("Error inesperado obteniendo noticia:", error)
  }

  // Fallback a datos estáticos existentes
  if (slug === staticFeaturedNews.slug) {
    return staticFeaturedNews
  }
  return staticNews.find((n) => n.slug === slug)
}

async function getRelatedPosts(post: NewsPost): Promise<NewsPost[]> {
  try {
    const { data, error } = await supabase
      .from("news_posts")
      .select(
        "id, slug, title, excerpt, content, date, author, category, image_url, read_time, tags"
      )
      .eq("category", post.category)
      .neq("slug", post.slug)
      .order("date", { ascending: false })
      .limit(2)

    if (!error && data) {
      const related = (data as DbNewsPost[]).map(mapDbToNewsPost)
      if (related.length > 0) return related
    }
  } catch (error) {
    console.error("Error obteniendo relacionadas desde Supabase:", error)
  }

  // Fallback: relacionadas desde array estático
  return staticNews
    .filter((n) => n.category === post.category && n.slug !== post.slug)
    .slice(0, 2)
}

export default async function NoticiaIndividual({ params }: Props) {
  const { slug } = params
  const post = await getPostBySlug(slug)

  if (!post) return notFound()

  const related = await getRelatedPosts(post)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Link href="/noticias" className="inline-flex items-center text-coop-green hover:text-coop-blue mb-6 hover:underline transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Volver a noticias
        </Link>
        <div className="mb-6">
          <Image
            src={post.image || "/placeholder.svg"}
            alt={post.title}
            width={600}
            height={400}
            className="rounded-lg object-cover w-full h-64 mb-4"
          />
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-200 text-gray-700">
              {post.category}
            </span>
            {post.readTime && (
              <span className="inline-block text-xs text-gray-500">• {post.readTime}</span>
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
          <div className="flex items-center text-sm text-gray-500 space-x-4 mb-4">
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
            <div className="flex flex-wrap gap-2 mb-2">
              {post.tags.map(tag => (
                <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs">
                  <Tag className="w-3 h-3 mr-1" /> {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="prose prose-lg max-w-none mb-10">
          <p>{post.content}</p>
        </div>
        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Noticias relacionadas</h2>
            <ul className="space-y-3">
              {related.map(r => (
                <li key={r.slug}>
                  <Link href={`/noticias/${r.slug}`} className="text-coop-green hover:text-coop-blue hover:underline font-medium transition-colors">
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export async function generateStaticParams() {
  try {
    const { data } = await supabase.from("news_posts").select("slug")
    const dbSlugs =
      data?.map((item: { slug: string }) => ({
        slug: item.slug,
      })) ?? []

    return [
      ...dbSlugs,
      { slug: staticFeaturedNews.slug },
      ...staticNews.map((n: NewsPost) => ({ slug: n.slug })),
    ]
  } catch {
    return [
      { slug: staticFeaturedNews.slug },
      ...staticNews.map((n: NewsPost) => ({ slug: n.slug })),
    ]
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const { slug } = params

  try {
    const { data } = await supabase
      .from("news_posts")
      .select("title, excerpt, image_url")
      .eq("slug", slug)
      .single()

    if (data) {
      const post = data as { title: string; excerpt: string; image_url: string | null }
      const imageUrl =
        post.image_url && post.image_url.startsWith("http")
          ? post.image_url
          : post.image_url
            ? `${SITE_URL}${post.image_url}`
            : undefined

      return {
        title: post.title + " | Cooperativa La Dormida",
        description: post.excerpt,
        openGraph: {
          title: post.title + " | Cooperativa La Dormida",
          description: post.excerpt,
          images: imageUrl ? [imageUrl] : undefined,
          type: "article",
        },
        twitter: {
          card: "summary_large_image",
          title: post.title + " | Cooperativa La Dormida",
          description: post.excerpt,
          images: imageUrl ? [imageUrl] : undefined,
        },
      }
    }
  } catch (error) {
    console.error("Error generando metadata desde Supabase:", error)
  }

  const fallbackPost =
    slug === staticFeaturedNews.slug ? staticFeaturedNews : staticNews.find((n) => n.slug === slug)

  if (!fallbackPost) return { title: "Noticia no encontrada" }

  const imageUrl = fallbackPost.image
    ? fallbackPost.image.startsWith("http")
      ? fallbackPost.image
      : `${SITE_URL}${fallbackPost.image}`
    : undefined

  return {
    title: fallbackPost.title + " | Cooperativa La Dormida",
    description: fallbackPost.excerpt,
    openGraph: {
      title: fallbackPost.title + " | Cooperativa La Dormida",
      description: fallbackPost.excerpt,
      images: imageUrl ? [imageUrl] : undefined,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: fallbackPost.title + " | Cooperativa La Dormida",
      description: fallbackPost.excerpt,
      images: imageUrl ? [imageUrl] : undefined,
    },
  }
}
