"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, CheckCircle, Loader2, Image as ImageIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function ImageUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [authorName, setAuthorName] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(selectedFile.type)) {
      setErrorMessage("Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, WEBP)")
      setUploadStatus("error")
      return
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (selectedFile.size > maxSize) {
      setErrorMessage("El archivo es demasiado grande. El tamaño máximo es 5MB")
      setUploadStatus("error")
      return
    }

    setFile(selectedFile)
    setErrorMessage("")
    setUploadStatus("idle")

    // Crear preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleRemoveFile = () => {
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setUploadStatus("idle")
    setErrorMessage("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setErrorMessage("Por favor, selecciona una imagen")
      setUploadStatus("error")
      return
    }

    setIsUploading(true)
    setUploadStatus("idle")
    setErrorMessage("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      if (authorName.trim()) {
        formData.append("authorName", authorName.trim())
      }

      const response = await fetch("/api/camping/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al subir la imagen")
      }

      setUploadStatus("success")
      setFile(null)
      setPreview(null)
      setAuthorName("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Recargar la galería después de 1 segundo
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("refresh-gallery"))
      }, 1000)
    } catch (error) {
      console.error("Error al subir imagen:", error)
      setErrorMessage(error instanceof Error ? error.message : "Error al subir la imagen")
      setUploadStatus("error")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="border-2 border-coop-purple/20 bg-gradient-to-br from-purple-50/50 to-pink-50/30">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-coop-purple/10 rounded-full">
            <Upload className="w-6 h-6 text-coop-purple" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Compartí tu Experiencia
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Subí una foto de tu estadía en el camping para compartirla con la comunidad
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Preview de la imagen */}
          <AnimatePresence>
            {preview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border-2 border-coop-purple/30 bg-gray-100"
              >
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  aria-label="Eliminar imagen"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input de archivo */}
          <div className="space-y-2">
            <Label htmlFor="image-upload" className="text-base font-semibold">
              Seleccionar Imagen
            </Label>
            <div className="relative">
              {/* Input oculto */}
              <input
                id="image-upload"
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
              />
              {/* Botón personalizado */}
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  variant="outline"
                  className="border-2 border-coop-purple/30 bg-white hover:bg-coop-purple/5 hover:border-coop-purple/50 transition-all duration-300 font-semibold"
                >
                  <ImageIcon className="mr-2 w-4 h-4" />
                  Examinar
                </Button>
                {file && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate font-medium">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
                {!file && (
                  <p className="text-sm text-gray-500 flex-1">
                    No se ha seleccionado ningún archivo
                  </p>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Formatos permitidos: JPEG, PNG, WEBP. Tamaño máximo: 5MB
            </p>
          </div>

          {/* Nombre del autor (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="author-name" className="text-base font-semibold">
              Tu Nombre (Opcional)
            </Label>
            <Input
              id="author-name"
              type="text"
              placeholder="Ej: Juan Pérez"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              disabled={isUploading}
              maxLength={50}
            />
            <p className="text-sm text-gray-500">
              Si lo deseas, puedes agregar tu nombre para que aparezca junto a tu foto
            </p>
          </div>

          {/* Mensajes de estado */}
          <AnimatePresence>
            {uploadStatus === "success" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    ¡Imagen subida exitosamente! Ya está visible en la galería.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {uploadStatus === "error" && errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert className="bg-red-50 border-red-200">
                  <X className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {errorMessage}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botón de envío */}
          <Button
            type="submit"
            disabled={!file || isUploading}
            className="w-full bg-gradient-to-r from-coop-purple to-coop-blue hover:from-coop-purple/90 hover:to-coop-blue/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold py-6"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="mr-2 w-5 h-5" />
                Subir Imagen
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

