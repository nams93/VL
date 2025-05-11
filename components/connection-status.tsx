"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff } from "lucide-react"
import { isOnline, setupConnectivityListeners } from "@/lib/sync-service"

export function ConnectionStatus() {
  const [online, setOnline] = useState(isOnline())

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    // Configurer les écouteurs d'événements
    const cleanup = setupConnectivityListeners(handleOnline, handleOffline)

    // Nettoyer les écouteurs
    return cleanup
  }, [])

  if (online) {
    return (
      <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
        <Wifi className="h-3 w-3 mr-1" />
        <span>Connecté</span>
      </div>
    )
  }

  return (
    <div className="flex items-center text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
      <WifiOff className="h-3 w-3 mr-1" />
      <span>Hors ligne</span>
    </div>
  )
}
