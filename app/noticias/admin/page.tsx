"use client"

import React, { useState, FormEvent } from "react"
import Image from "next/image"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Lock, Newspaper, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const ADMIN_PASSWORD = "Ingresonoticias2026."

export default function NoticiasAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const [authError, setAuthError] = useState<string | null>(null)

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
    } catch (error) {
      console.error(error)
      setSubmitError("Error inesperado al crear la noticia.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Pantalla de login estilo /conversaciones
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 relative overflow-hidden">
        {/* Logo de fondo */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <Image
            src="/images/logocoopnuevo.png"
            alt="Logo fondo"
            width={600}
            height={600}
            className="object-contain"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex justify-center mb-4"
              >
                <div className="relative">
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    <Image
                      src="/images/logocoopnuevo.png"
                      alt="Cooperativa La Dormida"
                      width={80}
                      height={80}
                      className="mx-auto"
                    />
                  </motion.div>
                  <motion.div
                    className="absolute -top-2 -right-2"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Sparkles className="h-6 w-6 text-yellow-400" />
                  </motion.div>
                </div>
              </motion.div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
                <Newspaper className="w-6 h-6" />
                Panel de Noticias
              </CardTitle>
              <p className="text-sm text-gray-500 mt-2">
                Ingreso exclusivo para crear y publicar noticias en el sitio.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuth} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Ingresa la contraseña"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full pl-10 h-12 text-lg"
                      required
                    />
                  </div>
                </motion.div>
                <AnimatePresence>
                  {authError && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-sm text-red-500 text-center bg-red-50 p-2 rounded"
                    >
                      {authError}
                    </motion.p>
                  )}
                </AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    type="submit"
                    className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Ingresar
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Panel ya autenticado con formulario de noticia
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Newspaper className="w-7 h-7 text-coop-green" />
            Panel administrativo de noticias
          </h1>
          <p className="text-gray-600 mt-2">
            Cargá nuevas noticias para que se muestren en la web de la cooperativa.
          </p>
        </div>

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
                    Se recomienda una imagen horizontal (por ejemplo 1200x630). Se sube al
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
      </main>

      <Footer />
    </div>
  )
}
