"use client"

import { useState, useEffect } from "react"
import { WifiOff, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export function OfflineMode() {
  const [isOnline, setIsOnline] = useState(true)
  const [showBanner, setShowBanner] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    // Vérifier l'état de la connexion au chargement
    setIsOnline(navigator.onLine)

    // Configurer les écouteurs d'événements
    const handleOnline = () => {
      setIsOnline(true)
      // Afficher brièvement une notification de reconnexion
      setShowBanner(true)
      setTimeout(() => setShowBanner(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowBanner(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!showBanner) return null

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 px-4 py-2 pointer-events-none">
      <Card
        className={`mx-auto max-w-md pointer-events-auto transition-colors duration-300 ${
          isOnline
            ? "bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800"
            : "bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800"
        }`}
      >
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            {isOnline ? (
              <RefreshCw className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 animate-spin" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            )}
            <div>
              <p
                className={`text-sm font-medium ${
                  isOnline ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"
                }`}
              >
                {isOnline ? "Connexion rétablie" : "Mode hors ligne activé"}
              </p>
              <p
                className={`text-xs ${
                  isOnline ? "text-green-600 dark:text-green-300" : "text-red-600 dark:text-red-300"
                }`}
              >
                {isOnline
                  ? "Synchronisation des données en cours..."
                  : "Les modifications seront enregistrées localement"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBanner(false)}
            className={`h-8 px-2 ${
              isOnline
                ? "text-green-700 hover:bg-green-100 dark:text-green-300 dark:hover:bg-green-800"
                : "text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-800"
            }`}
          >
            Fermer
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
