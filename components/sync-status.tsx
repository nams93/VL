"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Wifi, WifiOff, Upload, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react"
import { isOnline, syncAllPendingData, retryFailedSync, setupConnectivityListeners } from "@/lib/sync-service"
import { countPendingItems } from "@/lib/indexed-db-service"

export function SyncStatus() {
  const [online, setOnline] = useState(isOnline())
  const [pendingItems, setPendingItems] = useState({ inspections: 0, photos: 0, radioEquipment: 0 })
  const [totalPending, setTotalPending] = useState(0)
  const [syncInProgress, setSyncInProgress] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [lastSyncResult, setLastSyncResult] = useState<any>(null)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  // Mettre à jour le compteur d'éléments en attente
  const updatePendingCount = async () => {
    const counts = await countPendingItems()
    setPendingItems(counts)
    setTotalPending(counts.inspections + counts.photos + counts.radioEquipment)
  }

  // Gérer le changement d'état de la connexion
  const handleOnline = () => {
    setOnline(true)
    // Optionnel: synchroniser automatiquement lorsque la connexion est rétablie
    if (!syncInProgress) {
      handleSync()
    }
  }

  const handleOffline = () => {
    setOnline(false)
  }

  // Effectuer la synchronisation
  const handleSync = async () => {
    if (!online || syncInProgress) return

    setSyncInProgress(true)
    setSyncProgress(0)

    try {
      // Simuler une progression
      const progressInterval = setInterval(() => {
        setSyncProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + Math.random() * 10
        })
      }, 300)

      // Effectuer la synchronisation
      const result = await syncAllPendingData()

      clearInterval(progressInterval)
      setSyncProgress(100)

      // Mettre à jour les résultats
      setLastSyncResult(result)
      setLastSyncTime(new Date())

      // Mettre à jour le compteur après la synchronisation
      await updatePendingCount()

      // Réinitialiser la progression après un court délai
      setTimeout(() => {
        setSyncProgress(0)
        setSyncInProgress(false)
      }, 1000)
    } catch (error) {
      console.error("Erreur lors de la synchronisation:", error)
      setSyncInProgress(false)
      setSyncProgress(0)
    }
  }

  // Réessayer la synchronisation des éléments en erreur
  const handleRetry = async () => {
    if (!online || syncInProgress) return

    setSyncInProgress(true)
    setSyncProgress(0)

    try {
      // Simuler une progression
      const progressInterval = setInterval(() => {
        setSyncProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + Math.random() * 10
        })
      }, 300)

      // Effectuer la nouvelle tentative
      const result = await retryFailedSync()

      clearInterval(progressInterval)
      setSyncProgress(100)

      // Mettre à jour les résultats
      setLastSyncResult(result)
      setLastSyncTime(new Date())

      // Mettre à jour le compteur après la synchronisation
      await updatePendingCount()

      // Réinitialiser la progression après un court délai
      setTimeout(() => {
        setSyncProgress(0)
        setSyncInProgress(false)
      }, 1000)
    } catch (error) {
      console.error("Erreur lors de la nouvelle tentative:", error)
      setSyncInProgress(false)
      setSyncProgress(0)
    }
  }

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
  }, [])

  // Si aucun élément en attente et pas de résultat récent, ne pas afficher le composant
  if (totalPending === 0 && !lastSyncResult && !syncInProgress) {
    return null
  }

  return (
    <Card className={online ? "border-blue-200" : "border-orange-200"}>
      <CardHeader className={online ? "bg-blue-50" : "bg-orange-50"}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center">
            {online ? (
              <Wifi className="h-5 w-5 mr-2 text-blue-600" />
            ) : (
              <WifiOff className="h-5 w-5 mr-2 text-orange-600" />
            )}
            {online ? "Synchronisation des données" : "Mode hors ligne"}
          </CardTitle>
          {totalPending > 0 && (
            <div className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {totalPending} en attente
            </div>
          )}
        </div>
        <CardDescription>
          {online
            ? "Synchronisez vos données avec le serveur pour assurer leur sauvegarde."
            : "Les données seront synchronisées automatiquement lorsque vous serez connecté."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Afficher la progression de la synchronisation */}
        {syncInProgress && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Synchronisation en cours...</span>
              <span>{Math.round(syncProgress)}%</span>
            </div>
            <Progress value={syncProgress} className="h-2" />
          </div>
        )}

        {/* Afficher le résumé des éléments en attente */}
        {totalPending > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Éléments en attente de synchronisation</h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 p-2 rounded-md">
                <div className="text-xs text-gray-500">Inspections</div>
                <div className="text-lg font-bold">{pendingItems.inspections}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded-md">
                <div className="text-xs text-gray-500">Photos</div>
                <div className="text-lg font-bold">{pendingItems.photos}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded-md">
                <div className="text-xs text-gray-500">Équipements</div>
                <div className="text-lg font-bold">{pendingItems.radioEquipment}</div>
              </div>
            </div>
          </div>
        )}

        {/* Afficher le résultat de la dernière synchronisation */}
        {lastSyncResult && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Dernière synchronisation</h4>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {lastSyncResult.success ? (
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                  )}
                  <span className="text-sm">
                    {lastSyncResult.success ? "Synchronisation réussie" : "Synchronisation partielle"}
                  </span>
                </div>
                {lastSyncTime && <span className="text-xs text-gray-500">{lastSyncTime.toLocaleTimeString()}</span>}
              </div>
              <div className="mt-2 text-xs text-gray-600">
                {lastSyncResult.successCount} élément(s) synchronisé(s), {lastSyncResult.errorCount} erreur(s)
              </div>
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex gap-2 pt-2">
          {lastSyncResult && lastSyncResult.errorCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={!online || syncInProgress}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Réessayer ({lastSyncResult.errorCount})
            </Button>
          )}
          <Button
            onClick={handleSync}
            disabled={!online || syncInProgress || totalPending === 0}
            size="sm"
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-1" />
            {syncInProgress ? "Synchronisation..." : "Synchroniser maintenant"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
