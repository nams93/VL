"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, AlertTriangle } from "lucide-react"

interface MobileGeolocationProps {
  onLocationUpdate: (latitude: number, longitude: number, accuracy: number) => void
}

export function MobileGeolocation({ onLocationUpdate }: MobileGeolocationProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [location, setLocation] = useState<{
    latitude: number
    longitude: number
    accuracy: number
  } | null>(null)

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas prise en charge par votre navigateur")
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        setLocation({ latitude, longitude, accuracy })
        onLocationUpdate(latitude, longitude, accuracy)
        setLoading(false)
      },
      (error) => {
        setLoading(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError("L'utilisateur a refusé la demande de géolocalisation")
            break
          case error.POSITION_UNAVAILABLE:
            setError("Les informations de localisation ne sont pas disponibles")
            break
          case error.TIMEOUT:
            setError("La demande de localisation a expiré")
            break
          default:
            setError("Une erreur inconnue s'est produite")
            break
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {location ? (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center mb-2">
            <MapPin className="h-5 w-5 text-green-600 mr-2" />
            <span className="font-medium text-green-700">Position enregistrée</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
            <div>Latitude: {location.latitude.toFixed(6)}</div>
            <div>Longitude: {location.longitude.toFixed(6)}</div>
            <div className="col-span-2">Précision: ±{Math.round(location.accuracy)} mètres</div>
          </div>
          <Button variant="outline" size="sm" onClick={getLocation} disabled={loading} className="mt-2 w-full">
            {loading ? "Localisation en cours..." : "Actualiser la position"}
          </Button>
        </div>
      ) : (
        <Button onClick={getLocation} disabled={loading} className="w-full flex items-center justify-center">
          <MapPin className="mr-2 h-4 w-4" />
          {loading ? "Localisation en cours..." : "Obtenir ma position"}
        </Button>
      )}
    </div>
  )
}
