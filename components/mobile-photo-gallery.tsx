"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MobilePhotoGalleryProps {
  photos: Array<{
    id: string
    url: string
    comment?: string
    timestamp?: Date
  }>
  onClose: () => void
}

export function MobilePhotoGallery({ photos, onClose }: MobilePhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [scale, setScale] = useState(1)

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
    setScale(1) // Réinitialiser le zoom
  }

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
    setScale(1) // Réinitialiser le zoom
  }

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3))
  }

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5))
  }

  const downloadPhoto = () => {
    const link = document.createElement("a")
    link.href = photos[currentIndex].url
    link.download = `photo-${photos[currentIndex].id}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (photos.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
        <div className="text-white text-center p-4">
          <p>Aucune photo disponible</p>
          <Button variant="outline" className="mt-4" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    )
  }

  const currentPhoto = photos[currentIndex]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-black text-white">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
        <div className="text-sm">
          {currentIndex + 1} / {photos.length}
        </div>
        <Button variant="ghost" size="icon" onClick={downloadPhoto}>
          <Download className="h-6 w-6" />
        </Button>
      </div>

      {/* Image container */}
      <div className="flex-1 relative overflow-hidden">
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `scale(${scale})`,
            transition: "transform 0.2s ease-out",
          }}
        >
          <img
            src={currentPhoto.url || "/placeholder.svg"}
            alt={`Photo ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Navigation buttons */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-30 text-white rounded-full"
          onClick={prevPhoto}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-30 text-white rounded-full"
          onClick={nextPhoto}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>

      {/* Footer with info and controls */}
      <div className="bg-black text-white p-4">
        {currentPhoto.comment && <p className="mb-2 text-sm">{currentPhoto.comment}</p>}
        {currentPhoto.timestamp && <p className="text-xs text-gray-400">{currentPhoto.timestamp.toLocaleString()}</p>}

        <div className="flex justify-center mt-2 space-x-4">
          <Button variant="ghost" size="sm" onClick={zoomOut} disabled={scale <= 0.5}>
            <ZoomOut className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={zoomIn} disabled={scale >= 3}>
            <ZoomIn className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
