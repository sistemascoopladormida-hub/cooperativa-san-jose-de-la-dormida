"use client"

import React, { useState, FormEvent, useEffect } from "react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Loader2,
  Lock,
  Newspaper,
  Plus,
  Edit,
  Trash2,
  X,
  Calendar,
  User,
  Tag,
} from "lucide-react"
import Image from "next/image"

const ADMIN_PASSWORD = "Ingresonoticias2026."

type NewsPost = {
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

export default function NoticiasAdminPage(): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const [authError, setAuthError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"create" | "manage">("create")

  // Estados para crear noticia
  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [date, setDate] = useState("")
  const [author, setAuthor] = useState("")
  const [category, setCategory] = useState("")
  const [readTime, setReadTime] = useState("")
  const [tags, setTags] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  // Estados para gestionar noticias
  const [newsList, setNewsList] = useState<NewsPost[]>([])
  const [isLoadingNews, setIsLoadingNews] = useState(false)
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  // Estados para editar noticia
  const [editTitle, setEditTitle] = useState("")
  const [editExcerpt, setEditExcerpt] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editDate, setEditDate] = useState("")
  const [editAuthor, setEditAuthor] = useState("")
  const [editCategory, setEditCategory] = useState("")
  const [editReadTime, setEditReadTime] = useState("")
  const [editTags, setEditTags] = useState("")
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null)
  const [deleteImage, setDeleteImage] = useState(false)

  const handleAuth = (e: FormEvent) => {
    e.preventDefault()
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setAuthError(null)
    } else {
      setAuthError("Contraseña incorrecta.")
      setIsAuthenticated(false)
    }
  }

  const loadNewsList = async () => {
    setIsLoadingNews(true)
    try {
      const res = await fetch("/api/noticias/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: ADMIN_PASSWORD }),
      })

      const data = await res.json()

      if (!res.ok) {
        console.error("Error cargando noticias:", data.error)
        return
      }

      setNewsList(data.posts || [])
    } catch (error) {
      console.error("Error cargando noticias:", error)
    } finally {
      setIsLoadingNews(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && activeTab === "manage") {
      loadNewsList()
    }
  }, [isAuthenticated, activeTab])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitSuccess(null)

    if (!isAuthenticated) {
      setSubmitError("Debes ingresar la contraseña correcta para publicar noticias.")
      return
    }

    try {
      setIsSubmitting(true)

      const formData = new FormData()
      formData.append("password", ADMIN_PASSWORD)
      formData.append("title", title)
      formData.append("excerpt", excerpt)
      formData.append("content", content)
      formData.append("date", date)
      formData.append("author", author)
      formData.append("category", category)
      if (readTime) formData.append("readTime", readTime)
      if (tags) formData.append("tags", tags)
      if (imageFile) formData.append("image", imageFile)

      const res = await fetch("/api/noticias/create", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setSubmitError(data.error || "No se pudo crear la noticia.")
        return
      }

      setSubmitSuccess("Noticia creada correctamente.")
      // Limpiar formulario
      setTitle("")
      setExcerpt("")
      setContent("")
      setDate("")
      setAuthor("")
      setCategory("")
      setReadTime("")
      setTags("")
      setImageFile(null)
      const fileInput = document.getElementById("image") as HTMLInputElement | null
      if (fileInput) fileInput.value = ""

      // Recargar lista si estamos en la pestaña de gestión
      if (activeTab === "manage") {
        loadNewsList()
      }
    } catch (error) {
      console.error(error)
      setSubmitError("Error inesperado al crear la noticia.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (post: NewsPost) => {
    setEditingPost(post)
    setEditTitle(post.title)
    setEditExcerpt(post.excerpt)
    setEditContent(post.content)
    setEditDate(post.date.split("T")[0])
    setEditAuthor(post.author)
    setEditCategory(post.category)
    setEditReadTime(post.read_time || "")
    setEditTags(post.tags?.join(", ") || "")
    setEditImageUrl(post.image_url)
    setDeleteImage(false)
    setIsEditing(true)
  }

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!editingPost) return

    setSubmitError(null)
    setSubmitSuccess(null)

    try {
      setIsSubmitting(true)

      const formData = new FormData()
      formData.append("password", ADMIN_PASSWORD)
      formData.append("id", editingPost.id.toString())
      formData.append("title", editTitle)
      formData.append("excerpt", editExcerpt)
      formData.append("content", editContent)
      formData.append("date", editDate)
      formData.append("author", editAuthor)
      formData.append("category", editCategory)
      if (editReadTime) formData.append("readTime", editReadTime)
      if (editTags) formData.append("tags", editTags)
      if (editImageFile) formData.append("image", editImageFile)
      if (deleteImage) formData.append("deleteImage", "true")

      const res = await fetch("/api/noticias/update", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setSubmitError(data.error || "No se pudo actualizar la noticia.")
        return
      }

      setSubmitSuccess("Noticia actualizada correctamente.")
      setIsEditing(false)
      setEditingPost(null)
      loadNewsList()
    } catch (error) {
      console.error(error)
      setSubmitError("Error inesperado al actualizar la noticia.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id)
      return
    }

    try {
      setIsDeleting(true)
      const res = await fetch("/api/noticias/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: ADMIN_PASSWORD, id }),
      })

      const data = await res.json()

      if (!res.ok) {
        setSubmitError(data.error || "No se pudo eliminar la noticia.")
        return
      }

      setSubmitSuccess("Noticia eliminada correctamente.")
      setDeleteConfirmId(null)
      loadNewsList()
    } catch (error) {
      console.error(error)
      setSubmitError("Error inesperado al eliminar la noticia.")
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Newspaper className="w-7 h-7 text-coop-green" />
            Panel administrativo de noticias
          </h1>
          <p className="text-gray-600 mt-2">
            Acceso exclusivo para cargar, editar y eliminar noticias en el sitio.
          </p>
        </div>

        {/* Bloque de autenticación simple por contraseña */}
        {!isAuthenticated && (
          <Card className="mb-10 border-2 border-dashed border-coop-green/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-coop-green" />
                Ingreso restringido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Contraseña de administración</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Ingresa la contraseña para acceder"
                    required
                  />
                </div>
                {authError && (
                  <Alert variant="destructive">
                    <AlertDescription>{authError}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="bg-coop-green hover:bg-coop-green/90">
                  Ingresar
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Contenido principal cuando está autenticado */}
        {isAuthenticated && (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b">
              <button
                onClick={() => setActiveTab("create")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "create"
                    ? "border-b-2 border-coop-green text-coop-green"
                    : "text-gray-600 hover:text-coop-green"
                }`}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Crear noticia
              </button>
              <button
                onClick={() => setActiveTab("manage")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "manage"
                    ? "border-b-2 border-coop-green text-coop-green"
                    : "text-gray-600 hover:text-coop-green"
                }`}
              >
                <Newspaper className="w-4 h-4 inline mr-2" />
                Gestionar noticias
              </button>
            </div>

            {/* Formulario de creación */}
            {activeTab === "create" && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Cargar nueva noticia</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Título *</Label>
                        <Input
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date">Fecha de publicación *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="author">Autor *</Label>
                        <Input
                          id="author"
                          value={author}
                          onChange={(e) => setAuthor(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Categoría *</Label>
                        <Input
                          id="category"
                          placeholder="Ej: Importante, Mantenimiento, Promociones…"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="readTime">Tiempo de lectura (opcional)</Label>
                        <Input
                          id="readTime"
                          placeholder="Ej: 3 min"
                          value={readTime}
                          onChange={(e) => setReadTime(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tags">Tags (separados por coma)</Label>
                        <Input
                          id="tags"
                          placeholder="ej: internet, mantenimiento, vecinos"
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="excerpt">Resumen / Bajada *</Label>
                      <Textarea
                        id="excerpt"
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        required
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">Contenido completo *</Label>
                      <Textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows={8}
                      />
                      <p className="text-xs text-gray-500">
                        Puedes pegar el texto completo de la noticia. Si luego necesitas edición
                        avanzada (negritas, listas, etc.), se puede mejorar esta pantalla.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image">Imagen principal (opcional)</Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null
                          setImageFile(file)
                        }}
                      />
                      <p className="text-xs text-gray-500">
                        Se recomienda una imagen en formato 1080x1350px (vertical 4:5). Se sube al
                        Storage de Supabase.
                      </p>
                    </div>

                    {submitError && (
                      <Alert variant="destructive">
                        <AlertDescription>{submitError}</AlertDescription>
                      </Alert>
                    )}

                    {submitSuccess && (
                      <Alert>
                        <AlertDescription>{submitSuccess}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-coop-blue via-coop-purple to-coop-green text-white"
                        disabled={isSubmitting}
                      >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Publicar noticia
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Lista de noticias para gestionar */}
            {activeTab === "manage" && (
              <div className="space-y-4">
                {isLoadingNews ? (
                  <Card>
                    <CardContent className="py-10 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-coop-green" />
                      <p className="mt-2 text-gray-600">Cargando noticias...</p>
                    </CardContent>
                  </Card>
                ) : newsList.length === 0 ? (
                  <Card>
                    <CardContent className="py-10 text-center">
                      <p className="text-gray-600">No hay noticias publicadas aún.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {submitError && (
                      <Alert variant="destructive">
                        <AlertDescription>{submitError}</AlertDescription>
                      </Alert>
                    )}

                    {submitSuccess && (
                      <Alert>
                        <AlertDescription>{submitSuccess}</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid gap-4">
                      {newsList.map((post) => (
                        <Card key={post.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-4">
                              {post.image_url && (
                                <div className="relative w-full md:w-32 h-32 flex-shrink-0">
                                  <Image
                                    src={post.image_url}
                                    alt={post.title}
                                    fill
                                    className="object-cover rounded"
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                  {post.excerpt}
                                </p>
                                <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(post.date)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {post.author}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Tag className="w-3 h-3" />
                                    {post.category}
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEdit(post)}
                                    className="flex items-center gap-1"
                                  >
                                    <Edit className="w-3 h-3" />
                                    Editar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(post.id)}
                                    disabled={isDeleting}
                                    className="flex items-center gap-1"
                                  >
                                    {isDeleting && deleteConfirmId === post.id ? (
                                      <>
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        Eliminando...
                                      </>
                                    ) : deleteConfirmId === post.id ? (
                                      "¿Confirmar?"
                                    ) : (
                                      <>
                                        <Trash2 className="w-3 h-3" />
                                        Eliminar
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Modal de edición */}
            {isEditing && editingPost && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Editar noticia</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false)
                        setEditingPost(null)
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleEditSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-title">Título *</Label>
                          <Input
                            id="edit-title"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-date">Fecha de publicación *</Label>
                          <Input
                            id="edit-date"
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-author">Autor *</Label>
                          <Input
                            id="edit-author"
                            value={editAuthor}
                            onChange={(e) => setEditAuthor(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-category">Categoría *</Label>
                          <Input
                            id="edit-category"
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-readTime">Tiempo de lectura (opcional)</Label>
                          <Input
                            id="edit-readTime"
                            value={editReadTime}
                            onChange={(e) => setEditReadTime(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-tags">Tags (separados por coma)</Label>
                          <Input
                            id="edit-tags"
                            value={editTags}
                            onChange={(e) => setEditTags(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-excerpt">Resumen / Bajada *</Label>
                        <Textarea
                          id="edit-excerpt"
                          value={editExcerpt}
                          onChange={(e) => setEditExcerpt(e.target.value)}
                          required
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-content">Contenido completo *</Label>
                        <Textarea
                          id="edit-content"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          required
                          rows={8}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-image">Imagen principal</Label>
                        {editImageUrl && !deleteImage && (
                          <div className="relative w-full h-48 mb-2">
                            <Image
                              src={editImageUrl}
                              alt="Imagen actual"
                              fill
                              className="object-cover rounded"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => setDeleteImage(true)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Eliminar imagen
                            </Button>
                          </div>
                        )}
                        {deleteImage && (
                          <Alert>
                            <AlertDescription>
                              La imagen será eliminada al guardar. Puedes subir una nueva imagen
                              abajo.
                            </AlertDescription>
                          </Alert>
                        )}
                        <Input
                          id="edit-image"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null
                            setEditImageFile(file)
                            if (file) setDeleteImage(false)
                          }}
                        />
                        <p className="text-xs text-gray-500">
                          Se recomienda una imagen en formato 1080x1350px (vertical 4:5).
                        </p>
                      </div>

                      {submitError && (
                        <Alert variant="destructive">
                          <AlertDescription>{submitError}</AlertDescription>
                        </Alert>
                      )}

                      {submitSuccess && (
                        <Alert>
                          <AlertDescription>{submitSuccess}</AlertDescription>
                        </Alert>
                      )}

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false)
                            setEditingPost(null)
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          className="bg-gradient-to-r from-coop-blue via-coop-purple to-coop-green text-white"
                          disabled={isSubmitting}
                        >
                          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Guardar cambios
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
