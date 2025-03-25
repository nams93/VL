"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Eraser } from "lucide-react"

interface SignaturePadProps {
  onSignatureChange: (signature: string | null) => void
  label?: string
  className?: string
}

export function SignaturePad({ onSignatureChange, label, className }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSigned, setHasSigned] = useState(false)

  // Initialiser le canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Définir la taille du canvas pour qu'elle corresponde à sa taille d'affichage
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    // Configurer le style du trait
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.strokeStyle = "#000"

    // Effacer le canvas
    ctx.fillStyle = "#f9fafb" // Couleur de fond gris clair
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  // Gérer le début du dessin
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    setIsDrawing(true)
    setHasSigned(true)

    // Obtenir les coordonnées
    let x, y
    if ("touches" in e) {
      // Événement tactile
      const rect = canvas.getBoundingClientRect()
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      // Événement souris
      x = e.nativeEvent.offsetX
      y = e.nativeEvent.offsetY
    }

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  // Dessiner
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Obtenir les coordonnées
    let x, y
    if ("touches" in e) {
      // Événement tactile
      const rect = canvas.getBoundingClientRect()
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      // Événement souris
      x = e.nativeEvent.offsetX
      y = e.nativeEvent.offsetY
    }

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  // Arrêter le dessin
  const stopDrawing = () => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.closePath()
    setIsDrawing(false)

    // Envoyer la signature
    const signatureData = canvas.toDataURL("image/png")
    onSignatureChange(signatureData)
  }

  // Effacer la signature
  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#f9fafb" // Couleur de fond gris clair
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    setHasSigned(false)
    onSignatureChange(null)
  }

  // Empêcher le défilement sur mobile lors de la signature
  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
      if (isDrawing) {
        e.preventDefault()
      }
    }

    document.addEventListener("touchmove", preventScroll, { passive: false })
    return () => {
      document.removeEventListener("touchmove", preventScroll)
    }
  }, [isDrawing])

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <p className="text-xs text-gray-600 mb-1">{label}</p>}
      <div className="relative border border-gray-300 rounded-md bg-gray-50">
        <canvas
          ref={canvasRef}
          className="w-full h-24 touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {hasSigned && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 bg-white/80 hover:bg-white"
            onClick={clearSignature}
          >
            <Eraser className="h-3 w-3" />
            <span className="sr-only">Effacer la signature</span>
          </Button>
        )}
      </div>
      {!hasSigned && <p className="text-xs text-center text-gray-500">Signez dans l'espace ci-dessus</p>}
    </div>
  )
}

