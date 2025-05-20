"use client"

import { useState, useEffect } from "react"

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [connectionType, setConnectionType] = useState<string | null>(null)
  const [effectiveConnectionType, setEffectiveConnectionType] = useState<string | null>(null)

  useEffect(() => {
    // Vérifier si le navigateur prend en charge l'API Network Information
    const connection =
      (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

    const updateConnectionStatus = () => {
      setIsOnline(navigator.onLine)

      if (connection) {
        setConnectionType(connection.type)
        setEffectiveConnectionType(connection.effectiveType)
      }
    }

    // Mettre à jour le statut initial
    updateConnectionStatus()

    // Ajouter des écouteurs d'événements pour les changements de connexion
    window.addEventListener("online", updateConnectionStatus)
    window.addEventListener("offline", updateConnectionStatus)

    if (connection) {
      connection.addEventListener("change", updateConnectionStatus)
    }

    // Nettoyer les écouteurs d'événements
    return () => {
      window.removeEventListener("online", updateConnectionStatus)
      window.removeEventListener("offline", updateConnectionStatus)

      if (connection) {
        connection.removeEventListener("change", updateConnectionStatus)
      }
    }
  }, [])

  return { isOnline, connectionType, effectiveConnectionType }
}
