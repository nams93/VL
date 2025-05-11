"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Trash2, Save } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { MobileCamera } from "@/components/mobile-camera"
import { useMobileDevice } from "@/hooks/use-mobile-device"
import { v4 as uuidv4 } from "uuid"
import { savePhotoLocally, type StoredPhoto } from "@/lib/indexed-db-service"
import { isOnline } from "@/lib/sync-service"

type PhotoWithComment = {
  id: string
  url: string
  comment: string
  timestamp: Date
  gpsCoordinates?: {
    latitude: number
    longitude: number
  }
}

type VehicleView = "front" | "back" | "left" | "right" | "interior" | "other"

interface VehiclePhotoCaptureProps {
  inspectionId: string
  vehicleId: string
  onPhotosUpdated?: (photoCount: number) => void
}

export function VehiclePhotoCapture({ inspectionId, vehicleId, onPhotosUpdated }: VehiclePhotoCaptureProps) {
  const { isMobile } = useMobileDevice()
  const [activeView, setActiveView] = useState<VehicleView>("front")
  const [photos, setPhotos] = useState<Record<VehicleView, PhotoWithComment[]>>({
    front: [],
    back: [],
    left: [],
    right: [],
    interior: [],
    other: [],
  })
  const [newPhotoComment, setNewPhotoComment] = useState("")
  const [isCapturing, setIsCapturing] = useState(false)
  const [showMobileCamera, setShowMobileCamera] = useState(false)
  const [captureLocation, setcaptureLocation] = useState<GeolocationCoordinates | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Fonction pour obtenir la géolocalisation actuelle
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setcaptureLocation(position.coords)
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error)
        },
      )
    }
  }

  // Fonction pour formater les coordonnées GPS
  const formatGPSCoordinates = (coords: GeolocationCoordinates | null) => {
    if (!coords) return "Non disponible"
    return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`
  }

  // Dans un environnement réel, cette fonction utiliserait l'API de la caméra
  // Pour cette démo, nous simulons l'ajout d'une photo
  const capturePhoto = () => {
    if (isMobile) {
      // Sur mobile, ouvrir le composant de caméra mobile
      setShowMobileCamera(true)
      getCurrentLocation() // Capturer la position GPS
    } else {
      // Simuler une photo avec une URL d'espace réservé
      const newPhotoUrl = `/placeholder.svg?height=400&width=600&query=vehicle ${activeView} photo`

      const newPhoto: PhotoWithComment = {
        id: `photo-${uuidv4()}`,
        url: newPhotoUrl,
        comment: newPhotoComment,
        timestamp: new Date(),
        gpsCoordinates: captureLocation
          ? {
              latitude: captureLocation.latitude,
              longitude: captureLocation.longitude,
            }
          : undefined,
      }

      setPhotos({
        ...photos,
        [activeView]: [...photos[activeView], newPhoto],
      })

      // Réinitialiser le commentaire
      setNewPhotoComment("")
      setIsCapturing(false)

      // Notifier le parent du changement
      const totalCount = countTotalPhotos({ ...photos, [activeView]: [...photos[activeView], newPhoto] })
      if (onPhotosUpdated) onPhotosUpdated(totalCount)
    }
  }

  // Gérer la photo capturée par la caméra mobile
  const handleMobileCapture = (imageData: string) => {
    const newPhoto: PhotoWithComment = {
      id: `photo-${uuidv4()}`,
      url: imageData,
      comment: newPhotoComment,
      timestamp: new Date(),
      gpsCoordinates: captureLocation
        ? {
            latitude: captureLocation.latitude,
            longitude: captureLocation.longitude,
          }
        : undefined,
    }

    const updatedPhotos = {
      ...photos,
      [activeView]: [...photos[activeView], newPhoto],
    }

    setPhotos(updatedPhotos)

    // Réinitialiser le commentaire et fermer la caméra
    setNewPhotoComment("")
    setShowMobileCamera(false)

    // Notifier le parent du changement
    const totalCount = countTotalPhotos(updatedPhotos)
    if (onPhotosUpdated) onPhotosUpdated(totalCount)
  }

  // Supprimer une photo
  const deletePhoto = (viewType: VehicleView, photoId: string) => {
    const updatedPhotos = {
      ...photos,
      [viewType]: photos[viewType].filter((photo) => photo.id !== photoId),
    }

    setPhotos(updatedPhotos)

    // Notifier le parent du changement
    const totalCount = countTotalPhotos(updatedPhotos)
    if (onPhotosUpdated) onPhotosUpdated(totalCount)
  }

  // Mettre à jour le commentaire d'une photo
  const updatePhotoComment = (viewType: VehicleView, photoId: string, comment: string) => {
    setPhotos({
      ...photos,
      [viewType]: photos[viewType].map((photo) => (photo.id === photoId ? { ...photo, comment } : photo)),
    })
  }

  // Compter le nombre total de photos
  const countTotalPhotos = (photoSet: Record<VehicleView, PhotoWithComment[]>) => {
    return Object.values(photoSet).reduce((sum, viewPhotos) => sum + viewPhotos.length, 0)
  }

  const totalPhotos = countTotalPhotos(photos)

  // Sauvegarder toutes les photos dans IndexedDB
  const saveAllPhotos = async () => {
    setIsSaving(true)

    try {
      // Convertir toutes les photos en format StoredPhoto
      const allPhotos = Object.entries(photos).flatMap(([view, viewPhotos]) =>
        viewPhotos.map(
          (photo) =>
            ({
              id: photo.id,
              inspectionId,
              view,
              dataUrl: photo.url,
              comment: photo.comment,
              timestamp: photo.timestamp.getTime(),
              gpsCoordinates: photo.gpsCoordinates,
              syncStatus: isOnline() ? "synced" : "pending",
            }) as StoredPhoto,
        ),
      )

      // Sauvegarder chaque photo
      for (const photo of allPhotos) {
        await savePhotoLocally(photo)
      }

      alert(`${totalPhotos} photo(s) sauvegardée(s) avec succès!`)
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des photos:", error)
      alert("Erreur lors de la sauvegarde des photos. Veuillez réessayer.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      {showMobileCamera ? (
        <MobileCamera onCapture={handleMobileCapture} onCancel={() => setShowMobileCamera(false)} aspectRatio="4:3" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Photos du Véhicule</CardTitle>
            <CardDescription>Prenez des photos du véhicule pour documenter son état actuel</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeView} onValueChange={(value) => setActiveView(value as VehicleView)} className="w-full">
              <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
                <TabsTrigger value="front">Avant</TabsTrigger>
                <TabsTrigger value="back">Arrière</TabsTrigger>
                <TabsTrigger value="left">Gauche</TabsTrigger>
                <TabsTrigger value="right">Droite</TabsTrigger>
                <TabsTrigger value="interior">Intérieur</TabsTrigger>
                <TabsTrigger value="other">Autre</TabsTrigger>
              </TabsList>

              {(["front", "back", "left", "right", "interior", "other"] as VehicleView[]).map((view) => (
                <TabsContent key={view} value={view} className="space-y-4">
                  <div className="border rounded-md p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium capitalize">Vue {view}</h3>
                      <span className="text-sm text-gray-500">{photos[view].length} photo(s)</span>
                    </div>

                    {/* Interface de capture de photo */}
                    {isCapturing && !isMobile ? (
                      <div className="space-y-4 border p-4 rounded-md bg-gray-50">
                        <div className="aspect-video bg-gray-200 flex items-center justify-center rounded-md">
                          <div className="text-center">
                            <Camera className="h-12 w-12 mx-auto text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">Aperçu de la caméra</p>
                          </div>
                        </div>

                        <Textarea
                          placeholder="Ajouter un commentaire à cette photo (optionnel)"
                          value={newPhotoComment}
                          onChange={(e) => setNewPhotoComment(e.target.value)}
                          className="resize-none"
                        />

                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => setIsCapturing(false)}>
                            Annuler
                          </Button>
                          <Button onClick={capturePhoto}>Prendre la photo</Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={isMobile ? capturePhoto : () => setIsCapturing(true)}
                        className="w-full py-8 flex flex-col gap-2"
                      >
                        <Camera className="h-6 w-6" />
                        <span>{isMobile ? "Prendre une photo" : "Simuler une photo"}</span>
                      </Button>
                    )}

                    {/* Photos prises */}
                    {photos[view].length > 0 && (
                      <div className="mt-4 space-y-4">
                        <h4 className="text-sm font-medium">Photos capturées</h4>
                        <div className="grid grid-cols-1 gap-4">
                          {photos[view].map((photo) => (
                            <div key={photo.id} className="border rounded-md overflow-hidden">
                              <img
                                src={photo.url || "/placeholder.svg"}
                                alt={`Photo ${view}`}
                                className="w-full h-48 object-cover"
                              />
                              <div className="p-3">
                                <Textarea
                                  placeholder="Ajouter un commentaire (optionnel)"
                                  value={photo.comment}
                                  onChange={(e) => updatePhotoComment(view, photo.id, e.target.value)}
                                  className="resize-none mb-2 text-sm"
                                  rows={2}
                                />
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-500">
                                    {photo.timestamp.toLocaleString()}
                                    {photo.gpsCoordinates && (
                                      <div className="text-xs text-gray-400 mt-1">
                                        GPS: {photo.gpsCoordinates.latitude.toFixed(6)},{" "}
                                        {photo.gpsCoordinates.longitude.toFixed(6)}
                                      </div>
                                    )}
                                  </span>
                                  <Button variant="destructive" size="sm" onClick={() => deletePhoto(view, photo.id)}>
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Supprimer
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {/* Résumé des photos */}
            <div className="mt-6 border-t pt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Résumé des photos</h3>
                <span className="text-sm">{totalPhotos} photo(s) au total</span>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2">
                {(["front", "back", "left", "right", "interior", "other"] as VehicleView[]).map((view) => (
                  <div key={view} className="text-center">
                    <div className="text-xs font-medium capitalize">{view}</div>
                    <div className="text-lg font-bold">{photos[view].length}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                disabled={totalPhotos === 0 || isSaving}
                onClick={saveAllPhotos}
                className={isMobile ? "w-full py-3 text-lg" : ""}
              >
                {isSaving ? (
                  <>Sauvegarde en cours...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Enregistrer toutes les photos
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
