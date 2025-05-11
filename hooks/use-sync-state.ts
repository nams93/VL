"use client"

import { useState, useEffect, useCallback } from "react"
import { isOnline, setupConnectivityListeners, syncAllPendingData } from "@/lib/sync-service"
import { countPendingItems } from "@/lib/indexed-db-service"

interface SyncState {
  isOnline: boolean
  pendingItems: {
    inspections: number
    photos: number
    radioEquipment: number
    total: number
  }
  isSyncing: boolean
  lastSyncResult: any | null
  lastSyncTime: Date | null
}

export function useSyncState() {
  const [state, setState] = useState<SyncState>({
    isOnline: isOnline(),
    pendingItems: {
      inspections: 0,
      photos: 0,
      radioEquipment: 0,
      total: 0,
    },
    isSyncing: false,
    lastSyncResult: null,
    lastSyncTime: null,
  })

  // Mettre à jour le compteur d'éléments en attente
  const updatePendingCount = useCallback(async () => {
    const counts = await countPendingItems()
    const total = counts.inspections + counts.photos + counts.radioEquipment

    setState((prev) => ({
      ...prev,
      pendingItems: {
        ...counts,
        total,
      },
    }))
  }, [])

  // Gérer le changement d'état de la connexion
  const handleOnline = useCallback(() => {
    setState((prev) => ({ ...prev, isOnline: true }))

    // Optionnel: synchroniser automatiquement lorsque la connexion est rétablie
    if (!state.isSyncing) {
      syncData()
    }
  }, [state.isSyncing])

  const handleOffline = useCallback(() => {
    setState((prev) => ({ ...prev, isOnline: false }))
  }, [])

  // Effectuer la synchronisation
  const syncData = useCallback(async () => {
    if (!state.isOnline || state.isSyncing) return

    setState((prev) => ({ ...prev, isSyncing: true }))

    try {
      // Effectuer la synchronisation
      const result = await syncAllPendingData()

      // Mettre à jour les résultats
      setState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncResult: result,
        lastSyncTime: new Date(),
      }))

      // Mettre à jour le compteur après la synchronisation
      await updatePendingCount()
    } catch (error) {
      console.error("Erreur lors de la synchronisation:", error)
      setState((prev) => ({ ...prev, isSyncing: false }))
    }
  }, [state.isOnline, state.isSyncing, updatePendingCount])

  // Configurer les écouteurs d'événements et charger les données initiales
  useEffect(() => {
    // Mettre à jour le compteur initial
    updatePendingCount()

    // Configurer les écouteurs d'événements pour la connectivité
    const cleanup = setupConnectivityListeners(handleOnline, handleOffline)

    // Configurer un intervalle pour mettre à jour régulièrement le compteur
    const countInterval = setInterval(updatePendingCount, 30000) // Toutes les 30 secondes

    // Nettoyer les écouteurs et l'intervalle
    return () => {
      cleanup()
      clearInterval(countInterval)
    }
  }, [handleOnline, handleOffline, updatePendingCount])

  return {
    ...state,
    syncData,
    updatePendingCount,
  }
}
