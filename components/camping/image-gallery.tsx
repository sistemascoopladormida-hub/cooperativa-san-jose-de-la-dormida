"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface GalleryImage {
  url: string
  name: string
  createdAt?: string
}

export default function ImageGallery() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchImages = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/camping/gallery")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar las imágenes")
      }

      setImages(data.images || [])
    } catch (err) {
      console.error("Error al cargar imágenes:", err)
      setError(err instanceof Error ? err.message : "Error al cargar las imágenes")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchImages()

    // Escuchar evento personalizado para refrescar la galería
    const handleRefresh = () => {
      fetchImages()
    }
    window.addEventListener("refresh-gallery", handleRefresh)

    return () => {
      window.removeEventListener("refresh-gallery", handleRefresh)
    }
  }, [])

  const openLightbox = (image: GalleryImage) => {
    setSelectedImage(image)
  }

  const closeLightbox = () => {
    setSelectedImage(null)
  }

  const navigateImage = (direction: "prev" | "next") => {
    if (!selectedImage) return

    const currentIndex = images.findIndex((img) => img.url === selectedImage.url)
    let newIndex: number

    if (direction === "prev") {
      newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1
    } else {
      newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0
    }

    setSelectedImage(images[newIndex])
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return

      if (e.key === "Escape") {
        closeLightbox()
      } else if (e.key === "ArrowLeft") {
        navigateImage("prev")
      } else if (e.key === "ArrowRight") {
        navigateImage("next")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedImage, images])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-coop-purple" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-2 border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-800 text-center">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (images.length === 0) {
    return (
      <Card className="border-2 border-gray-200 bg-gray-50">
        <CardContent className="pt-6">
          <p className="text-gray-600 text-center">
            Aún no hay imágenes en la galería. ¡Sé el primero en compartir tu experiencia!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <motion.div
            key={image.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => openLightbox(image)}
          >
            <Image
              src={image.url}
              alt={`Imagen del camping ${index + 1}`}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            {/* Botón cerrar - Posicionado debajo del header */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={(e) => {
                e.stopPropagation()
                closeLightbox()
              }}
              className="absolute top-20 sm:top-24 right-4 sm:right-6 p-2.5 sm:p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all duration-300 z-20 shadow-lg hover:shadow-xl hover:scale-110 border border-white/20"
              aria-label="Cerrar"
            >
              <X className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={2.5} />
            </motion.button>

            {/* Navegación */}
            {images.length > 1 && (
              <>
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateImage("prev")
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all duration-300 z-20 shadow-lg hover:shadow-xl hover:scale-110 border border-white/20"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="w-8 h-8" strokeWidth={2.5} />
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateImage("next")
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all duration-300 z-20 shadow-lg hover:shadow-xl hover:scale-110 border border-white/20"
                  aria-label="Siguiente imagen"
                >
                  <ChevronRight className="w-8 h-8" strokeWidth={2.5} />
                </motion.button>
              </>
            )}

            {/* Imagen */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-7xl max-h-[90vh] w-full h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage.url}
                alt="Imagen ampliada"
                fill
                className="object-contain"
                sizes="100vw"
                unoptimized
              />
            </motion.div>

            {/* Contador */}
            {images.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-semibold border border-white/20 shadow-lg"
              >
                {images.findIndex((img) => img.url === selectedImage.url) + 1} / {images.length}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

