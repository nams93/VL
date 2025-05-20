"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  style?: React.CSSProperties
}

export function LazyImage({ src, alt, className, style }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.src = src
    img.onload = () => setIsLoaded(true)
    img.onerror = () => setError(true)
  }, [src])

  if (error) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`} style={style}>
        <span className="text-gray-400 text-sm">Image non disponible</span>
      </div>
    )
  }

  return (
    <>
      {!isLoaded && <Skeleton className={`${className} bg-gray-200`} style={style} />}
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className={`${className} ${isLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
        style={{
          ...style,
          display: isLoaded ? "block" : "none",
        }}
      />
    </>
  )
}
