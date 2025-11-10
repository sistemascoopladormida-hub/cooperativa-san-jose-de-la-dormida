import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Calendar, User, Tag, ArrowLeft, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { featuredNews, news, type NewsPost } from "../posts"
import type { Metadata } from "next"

interface Props {
  params: { slug: string }
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function NoticiaIndividual({ params }: Props) {
  const { slug } = await params;
  const post: NewsPost | undefined =
    slug === featuredNews.slug
      ? featuredNews
      : news.find(n => n.slug === slug);

  if (!post) return notFound();

  // Noticias relacionadas (misma categoría, excluyendo la actual)
  const related = news.filter(n => n.category === post.category && n.slug !== post.slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Link href="/noticias" className="inline-flex items-center text-coop-green mb-6 hover:underline">
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
                  <Link href={`/noticias/${r.slug}`} className="text-coop-green hover:underline font-medium">
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

export function generateStaticParams() {
  return [
    { slug: featuredNews.slug },
    ...news.map((n: NewsPost) => ({ slug: n.slug }))
  ]
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;
  const post = slug === featuredNews.slug ? featuredNews : news.find(n => n.slug === slug);
  if (!post) return { title: "Noticia no encontrada" };
  const imageUrl = post.image ? (post.image.startsWith('http') ? post.image : `${SITE_URL}${post.image}`) : undefined;
  return {
    title: post.title + " | Cooperativa La Dormida",
    description: post.excerpt,
    openGraph: {
      title: post.title + " | Cooperativa La Dormida",
      description: post.excerpt,
      images: imageUrl ? [imageUrl] : undefined,
      type: "article"
    },
    twitter: {
      card: "summary_large_image",
      title: post.title + " | Cooperativa La Dormida",
      description: post.excerpt,
      images: imageUrl ? [imageUrl] : undefined
    }
  };
}