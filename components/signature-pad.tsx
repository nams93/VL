"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface SignaturePadProps {
  onSignatureChange: (signature: string | null) => void
  label?: string
  initialSignature?: string | null
}

export function SignaturePad({ onSignatureChange, label = "Signature", initialSignature = null }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  // Initialiser le canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    // Définir la taille du canvas
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Effacer le canvas
    context.fillStyle = "#f9fafb"
    context.fillRect(0, 0, canvas.width, canvas.height)

    // Dessiner la ligne de signature
    context.beginPath()
    context.moveTo(10, canvas.height - 10)
    context.lineTo(canvas.width - 10, canvas.height - 10)
    context.strokeStyle = "#d1d5db"
    context.lineWidth = 1
    context.stroke()

    // Si une signature initiale est fournie, l'afficher
    if (initialSignature) {
      const img = new Image()
      img.onload = () => {
        context.drawImage(img, 0, 0)
        setHasSignature(true)
      }
      img.src = initialSignature
    }
  }, [initialSignature])

  // Gérer le redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      // Sauvegarder la signature actuelle
      const currentSignature = canvas.toDataURL()

      // Redimensionner le canvas
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight

      // Restaurer la signature
      if (hasSignature) {
        const img = new Image()
        img.onload = () => {
          const context = canvas.getContext("2d")
          if (!context) return

          context.drawImage(img, 0, 0, canvas.width, canvas.height)
        }
        img.src = currentSignature
      } else {
        // Redessiner le canvas vide
        const context = canvas.getContext("2d")
        if (!context) return

        context.fillStyle = "#f9fafb"
        context.fillRect(0, 0, canvas.width, canvas.height)

        context.beginPath()
        context.moveTo(10, canvas.height - 10)
        context.lineTo(canvas.width - 10, canvas.height - 10)
        context.strokeStyle = "#d1d5db"
        context.lineWidth = 1
        context.stroke()
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [hasSignature])

  // Commencer à dessiner
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    setIsDrawing(true)

    // Obtenir les coordonnées
    let clientX, clientY
    if ("touches" in e) {
      // Événement tactile
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      // Événement souris
      clientX = e.clientX
      clientY = e.clientY
    }

    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    context.beginPath()
    context.moveTo(x, y)
    context.strokeStyle = "#000"
    context.lineWidth = 2
    context.lineCap = "round"
  }

  // Dessiner
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    // Obtenir les coordonnées
    let clientX, clientY
    if ("touches" in e) {
      // Événement tactile
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
      e.preventDefault() // Empêcher le défilement sur les appareils tactiles
    } else {
      // Événement souris
      clientX = e.clientX
      clientY = e.clientY
    }

    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    context.lineTo(x, y)
    context.stroke()

    setHasSignature(true)
  }

  // Arrêter de dessiner
  const stopDrawing = () => {
    if (!isDrawing) return

    setIsDrawing(false)

    const canvas = canvasRef.current
    if (!canvas) return

    // Envoyer la signature au parent
    const signature = canvas.toDataURL()
    onSignatureChange(signature)
  }

  // Effacer la signature
  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    // Effacer le canvas
    context.fillStyle = "#f9fafb"
    context.fillRect(0, 0, canvas.width, canvas.height)

    // Redessiner la ligne de signature
    context.beginPath()
    context.moveTo(10, canvas.height - 10)
    context.lineTo(canvas.width - 10, canvas.height - 10)
    context.strokeStyle = "#d1d5db"
    context.lineWidth = 1
    context.stroke()

    setHasSignature(false)
    onSignatureChange(null)
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-xs text-gray-600">{label}</label>
        {hasSignature && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSignature}
            className="h-6 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3 mr-1" /> Effacer
          </Button>
        )}
      </div>
      <div className="border rounded-md overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-24 bg-gray-50 touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
    </div>
  )
}
