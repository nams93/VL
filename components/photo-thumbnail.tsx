"use client"

import { useState } from "react"
import { MobilePhotoGallery } from "@/components/mobile-photo-gallery"

interface PhotoThumbnailProps {
  photo: {
    id: string
    url: string
    comment?: string
    timestamp?: Date
  }
  onDelete?: (id: string) => void
}

export function PhotoThumbnail({ photo, onDelete }: PhotoThumbnailProps) {
  const [showGallery, setShowGallery] = useState(false)

  return (
    <>
      <div className="border rounded-md overflow-hidden cursor-pointer" onClick={() => setShowGallery(true)}>
        <div className="relative aspect-square">
          <img
            src={photo.url || "/placeholder.svg"}
            alt={photo.comment || "Photo"}
            className="w-full h-full object-cover"
          />
        </div>
        {photo.comment && <div className="p-2 text-xs truncate bg-gray-50">{photo.comment}</div>}
      </div>

      {showGallery && <MobilePhotoGallery photos={[photo]} onClose={() => setShowGallery(false)} />}
    </>
  )
}
