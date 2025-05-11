"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CameraIcon as FlipCamera, X, Check, ImageIcon } from "lucide-react"

interface MobileCameraProps {
  onCapture: (imageData: string) => void
  onCancel: () => void
  aspectRatio?: "square" | "4:3" | "16:9"
}

export function MobileCamera({ onCapture, onCancel, aspectRatio = "4:3" }: MobileCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Calculer les dimensions en fonction du ratio d'aspect
  const getAspectRatioDimensions = () => {
    switch (aspectRatio) {
      case "square":
        return { width: 1, height: 1 }
      case "4:3":
        return { width: 4, height: 3 }
      case "16:9":
        return { width: 16, height: 9 }
      default:
        return { width: 4, height: 3 }
    }
  }

  const { width: aspectWidth, height: aspectHeight } = getAspectRatioDimensions()

  // Initialiser la caméra
  useEffect(() => {
    async function setupCamera() {
      try {
        // Vérifier si l'appareil a plusieurs caméras
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter((device) => device.kind === "videoinput")
        setHasMultipleCameras(videoDevices.length > 1)

        // Demander l'accès à la caméra
        const constraints = {
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
        setStream(mediaStream)

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (err) {
        console.error("Erreur lors de l'accès à la caméra:", err)
        setError("Impossible d'accéder à la caméra. Veuillez vérifier les permissions.")
      }
    }

    setupCamera()

    // Nettoyer le flux vidéo lors du démontage
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [facingMode])

  // Basculer entre les caméras avant et arrière
  const toggleCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
  }

  // Prendre une photo
  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        // Définir les dimensions du canvas pour correspondre à la vidéo
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Dessiner l'image de la vidéo sur le canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convertir le canvas en URL de données
        const imageData = canvas.toDataURL("image/jpeg")
        setCapturedImage(imageData)
      }
    }
  }

  // Confirmer la photo capturée
  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage)
    }
  }

  // Retourner à la caméra
  const retakePhoto = () => {
    setCapturedImage(null)
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-red-50 rounded-lg">
        <p className="text-red-600 mb-4">{error}</p>
        <Button variant="outline" onClick={onCancel}>
          Fermer
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex justify-between items-center p-4 bg-black text-white">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-6 w-6" />
        </Button>
        <h2 className="text-lg font-medium">Prendre une photo</h2>
        <div className="w-10"></div> {/* Espace pour équilibrer le header */}
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-black">
        {!capturedImage ? (
          // Affichage de la caméra
          <div
            className="relative w-full h-full flex items-center justify-center"
            style={{
              maxWidth: "100vw",
              maxHeight: `calc(100vw * ${aspectHeight / aspectWidth})`,
              aspectRatio: `${aspectWidth}/${aspectHeight}`,
            }}
          >
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          </div>
        ) : (
          // Affichage de l'image capturée
          <div
            className="relative w-full h-full flex items-center justify-center"
            style={{
              maxWidth: "100vw",
              maxHeight: `calc(100vw * ${aspectHeight / aspectWidth})`,
              aspectRatio: `${aspectWidth}/${aspectHeight}`,
            }}
          >
            <img src={capturedImage || "/placeholder.svg"} alt="Captured" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Canvas caché pour la capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="p-4 bg-black flex justify-around items-center">
        {!capturedImage ? (
          // Contrôles de la caméra
          <>
            <Button variant="ghost" size="icon" className="text-white">
              <ImageIcon className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full h-16 w-16 flex items-center justify-center border-2 border-white"
              onClick={takePhoto}
            >
              <div className="h-12 w-12 rounded-full bg-white"></div>
            </Button>
            {hasMultipleCameras && (
              <Button variant="ghost" size="icon" className="text-white" onClick={toggleCamera}>
                <FlipCamera className="h-6 w-6" />
              </Button>
            )}
          </>
        ) : (
          // Contrôles de confirmation
          <>
            <Button variant="ghost" size="icon" className="text-white" onClick={retakePhoto}>
              <X className="h-8 w-8" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white" onClick={confirmPhoto}>
              <Check className="h-8 w-8" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
