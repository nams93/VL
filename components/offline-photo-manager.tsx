"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, Upload, AlertTriangle } from "lucide-react"

interface OfflinePhotoManagerProps {
  onSync?: () => void
}

export function OfflinePhotoManager({ onSync }: OfflinePhotoManagerProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingPhotos, setPendingPhotos] = useState<number>(0)
  const [syncInProgress, setSyncInProgress] = useState(false)

  // Vérifier l'état de la connexion
  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    // Vérifier l'état initial
    handleOnlineStatus()

    // Ajouter des écouteurs d'événements
    window.addEventListener("online", handleOnlineStatus)
    window.addEventListener("offline", handleOnlineStatus)

    // Simuler des photos en attente
    const storedPhotos = Object.keys(localStorage).filter((key) => key.startsWith("vehicle-photos-"))
    setPendingPhotos(storedPhotos.length)

    // Nettoyer les écouteurs d'événements
    return () => {
      window.removeEventListener("online", handleOnlineStatus)
      window.removeEventListener("offline", handleOnlineStatus)
    }
  }, [])

  // Simuler la synchronisation des photos
  const syncPhotos = () => {
    if (!isOnline) {
      alert("Impossible de synchroniser en mode hors ligne. Veuillez vous connecter à Internet.")
      return
    }

    setSyncInProgress(true)

    // Simuler un délai de synchronisation
    setTimeout(() => {
      // Dans une application réelle, vous enverriez les photos au serveur ici
      const storedPhotos = Object.keys(localStorage).filter((key) => key.startsWith("vehicle-photos-"))

      // Supprimer les photos synchronisées
      storedPhotos.forEach((key) => {
        localStorage.removeItem(key)
      })

      setPendingPhotos(0)
      setSyncInProgress(false)

      if (onSync) onSync()

      alert("Synchronisation terminée avec succès!")
    }, 2000)
  }

  // Si aucune photo en attente, ne pas afficher le composant
  if (pendingPhotos === 0 && isOnline) {
    return null
  }

  return (
    <Card className={isOnline ? "border-blue-200" : "border-orange-200"}>
      <CardHeader className={isOnline ? "bg-blue-50" : "bg-orange-50"}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center">
            {isOnline ? (
              <Wifi className="h-5 w-5 mr-2 text-blue-600" />
            ) : (
              <WifiOff className="h-5 w-5 mr-2 text-orange-600" />
            )}
            {isOnline ? "Mode connecté" : "Mode hors ligne"}
          </CardTitle>
          {pendingPhotos > 0 && (
            <div className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {pendingPhotos} en attente
            </div>
          )}
        </div>
        <CardDescription>
          {isOnline
            ? "Vous êtes connecté à Internet. Vous pouvez synchroniser vos photos."
            : "Vous êtes en mode hors ligne. Les photos seront synchronisées lorsque vous serez connecté."}
        </CardDescription>
      </CardHeader>
      {pendingPhotos > 0 && (
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm">
              <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
              <span>
                {pendingPhotos} photo{pendingPhotos > 1 ? "s" : ""} en attente de synchronisation
              </span>
            </div>
            <Button
              size="sm"
              onClick={syncPhotos}
              disabled={!isOnline || syncInProgress}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {syncInProgress ? "Synchronisation..." : "Synchroniser maintenant"}
              <Upload className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
