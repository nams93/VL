"use client"

import { useState, useEffect } from "react"
import { useNetworkStatus } from "@/hooks/use-network-status"

type StorageOptions = {
  syncOnReconnect?: boolean
  expiresIn?: number // Durée en millisecondes
}

export function useOfflineStorage<T>(
  key: string,
  initialValue: T,
  options: StorageOptions = { syncOnReconnect: true },
) {
  const { isOnline } = useNetworkStatus()
  const [value, setValue] = useState<T>(initialValue)
  const [isLoading, setIsLoading] = useState(true)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [pendingChanges, setPendingChanges] = useState(false)

  // Charger les données depuis le stockage local au montage du composant
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const storedItem = localStorage.getItem(key)
        if (storedItem) {
          const { value, timestamp, synced } = JSON.parse(storedItem)

          // Vérifier si les données ont expiré
          if (options.expiresIn) {
            const now = new Date().getTime()
            if (now - timestamp > options.expiresIn) {
              // Les données ont expiré, utiliser la valeur initiale
              setValue(initialValue)
              setLastSynced(null)
              setPendingChanges(false)
              return
            }
          }

          setValue(value)
          setLastSynced(synced ? new Date(synced) : null)
          setPendingChanges(!synced)
        }
      } catch (error) {
        console.error(`Erreur lors du chargement des données pour ${key}:`, error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFromStorage()
  }, [key, initialValue, options.expiresIn])

  // Synchroniser les données lorsque la connexion est rétablie
  useEffect(() => {
    if (isOnline && pendingChanges && options.syncOnReconnect) {
      // Simuler une synchronisation
      setTimeout(() => {
        const now = new Date()
        setLastSynced(now)
        setPendingChanges(false)

        // Mettre à jour le stockage local avec l'état synchronisé
        try {
          const storedItem = localStorage.getItem(key)
          if (storedItem) {
            const parsedItem = JSON.parse(storedItem)
            localStorage.setItem(
              key,
              JSON.stringify({
                ...parsedItem,
                synced: now.toISOString(),
              }),
            )
          }
        } catch (error) {
          console.error(`Erreur lors de la mise à jour du statut de synchronisation pour ${key}:`, error)
        }
      }, 1500)
    }
  }, [isOnline, pendingChanges, key, options.syncOnReconnect])

  // Fonction pour mettre à jour la valeur
  const updateValue = (newValue: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const updatedValue = typeof newValue === "function" ? (newValue as (prev: T) => T)(prev) : newValue

      // Enregistrer dans le stockage local
      try {
        const now = new Date().getTime()
        localStorage.setItem(
          key,
          JSON.stringify({
            value: updatedValue,
            timestamp: now,
            synced: isOnline ? now : null,
          }),
        )

        if (isOnline) {
          setLastSynced(new Date())
          setPendingChanges(false)
        } else {
          setPendingChanges(true)
        }
      } catch (error) {
        console.error(`Erreur lors de l'enregistrement des données pour ${key}:`, error)
      }

      return updatedValue
    })
  }

  // Fonction pour forcer la synchronisation
  const sync = () => {
    if (!isOnline) {
      console.warn("Impossible de synchroniser en mode hors ligne")
      return false
    }

    // Simuler une synchronisation
    const now = new Date()
    setLastSynced(now)
    setPendingChanges(false)

    // Mettre à jour le stockage local avec l'état synchronisé
    try {
      const storedItem = localStorage.getItem(key)
      if (storedItem) {
        const parsedItem = JSON.parse(storedItem)
        localStorage.setItem(
          key,
          JSON.stringify({
            ...parsedItem,
            synced: now.toISOString(),
          }),
        )
      }
      return true
    } catch (error) {
      console.error(`Erreur lors de la synchronisation forcée pour ${key}:`, error)
      return false
    }
  }

  return {
    value,
    setValue: updateValue,
    isLoading,
    lastSynced,
    pendingChanges,
    isOnline,
    sync,
  }
}
