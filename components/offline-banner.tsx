"use client"

import { useState, useEffect } from "react"
import { WifiOff, Wifi, RefreshCw, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useNetworkStatus } from "@/hooks/use-network-status"
import { countPendingItems } from "@/lib/indexed-db-service"
import { syncAllPendingData, retryFailedSync } from "@/lib/sync-service"

export function OfflineBanner() {
  const { isOnline, connectionType, effectiveConnectionType } = useNetworkStatus()
  const [pendingItems, setPendingItems] = useState({ inspections: 0, photos: 0, radioEquipment: 0 })
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [syncResult, setSyncResult] = useState<any>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [expanded, setExpanded] = useState(false)

  // Vérifier les éléments en attente de synchronisation
  useEffect(() => {
    const checkPendingItems = async () => {
      try {
        const items = await countPendingItems()
        setPendingItems(items)

        // Afficher la bannière s'il y a des éléments en attente ou si l'utilisateur est hors ligne
        const totalPending = items.inspections + items.photos + items.radioEquipment
        setShowBanner(!isOnline || totalPending > 0)
      } catch (error) {
        console.error("Erreur lors de la vérification des éléments en attente:", error)
      }
    }

    checkPendingItems()

    // Vérifier périodiquement les éléments en attente
    const interval = setInterval(checkPendingItems, 30000) // Toutes les 30 secondes
    return () => clearInterval(interval)
  }, [isOnline])

  // Synchroniser les données lorsque la connexion est rétablie
  useEffect(() => {
    let syncTimeout: NodeJS.Timeout | null = null

    if (isOnline) {
      const totalPending = pendingItems.inspections + pendingItems.photos + pendingItems.radioEquipment

      if (totalPending > 0) {
        // Attendre 3 secondes après la reconnexion avant de synchroniser
        syncTimeout = setTimeout(() => {
          handleSync()
        }, 3000)
      }
    }

    return () => {
      if (syncTimeout) clearTimeout(syncTimeout)
    }
  }, [isOnline, pendingItems])

  // Gérer la synchronisation manuelle
  const handleSync = async () => {
    if (!isOnline || isSyncing) return

    setIsSyncing(true)
    setSyncProgress(0)

    try {
      // Simuler la progression de la synchronisation
      const progressInterval = setInterval(() => {
        setSyncProgress((prev) => {
          const newProgress = prev + Math.random() * 15
          return newProgress > 90 ? 90 : newProgress
        })
      }, 300)

      // Effectuer la synchronisation
      const result = await syncAllPendingData()
      setSyncResult(result)

      // Mettre à jour le nombre d'éléments en attente
      const items = await countPendingItems()
      setPendingItems(items)

      // Terminer la progression
      clearInterval(progressInterval)
      setSyncProgress(100)

      // Masquer la bannière après un certain temps si tout est synchronisé
      const totalPending = items.inspections + items.photos + items.radioEquipment
      if (totalPending === 0) {
        setTimeout(() => {
          setShowBanner(false)
        }, 3000)
      }
    } catch (error) {
      console.error("Erreur lors de la synchronisation:", error)
    } finally {
      setTimeout(() => {
        setIsSyncing(false)
        setSyncProgress(0)
      }, 1000)
    }
  }

  // Réessayer la synchronisation des éléments en échec
  const handleRetry = async () => {
    if (!isOnline || isSyncing) return

    setIsSyncing(true)
    setSyncProgress(0)

    try {
      // Simuler la progression
      const progressInterval = setInterval(() => {
        setSyncProgress((prev) => {
          const newProgress = prev + Math.random() * 10
          return newProgress > 90 ? 90 : newProgress
        })
      }, 200)

      // Réessayer la synchronisation
      const result = await retryFailedSync()
      setSyncResult(result)

      // Mettre à jour le nombre d'éléments en attente
      const items = await countPendingItems()
      setPendingItems(items)

      // Terminer la progression
      clearInterval(progressInterval)
      setSyncProgress(100)
    } catch (error) {
      console.error("Erreur lors de la nouvelle tentative de synchronisation:", error)
    } finally {
      setTimeout(() => {
        setIsSyncing(false)
        setSyncProgress(0)
      }, 1000)
    }
  }

  if (!showBanner) return null

  const totalPending = pendingItems.inspections + pendingItems.photos + pendingItems.radioEquipment

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 px-4 py-2 pointer-events-none">
      <Alert
        className={`mx-auto max-w-md pointer-events-auto shadow-lg border-l-4 ${
          !isOnline
            ? "bg-red-50 border-red-500 dark:bg-red-900/30 dark:border-red-700"
            : totalPending > 0
              ? "bg-amber-50 border-amber-500 dark:bg-amber-900/30 dark:border-amber-700"
              : "bg-green-50 border-green-500 dark:bg-green-900/30 dark:border-green-700"
        }`}
      >
        <div className="flex items-start">
          {!isOnline ? (
            <WifiOff className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" />
          ) : totalPending > 0 ? (
            <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
          ) : (
            <Wifi className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 mr-2 flex-shrink-0" />
          )}

          <div className="flex-1">
            <AlertTitle className="text-sm font-medium mb-1">
              {!isOnline
                ? "Mode hors ligne activé"
                : totalPending > 0
                  ? `${totalPending} élément${totalPending > 1 ? "s" : ""} en attente de synchronisation`
                  : "Toutes les données sont synchronisées"}
            </AlertTitle>

            <AlertDescription className="text-xs">
              {!isOnline
                ? "Vos modifications seront enregistrées localement et synchronisées automatiquement lorsque vous serez à nouveau en ligne."
                : totalPending > 0
                  ? "Vous êtes en ligne. Cliquez sur synchroniser pour envoyer vos données au serveur."
                  : "Vous êtes en ligne et toutes vos données sont à jour."}
            </AlertDescription>

            {/* Détails supplémentaires (affichés lorsque expanded est true) */}
            {expanded && (
              <div className="mt-2 space-y-2 text-xs">
                {/* Informations sur la connexion */}
                {isOnline && (
                  <div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded">
                    <p className="font-medium mb-1">Informations de connexion:</p>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      <span className="text-gray-600 dark:text-gray-400">Type:</span>
                      <span>{connectionType || "Non disponible"}</span>
                      <span className="text-gray-600 dark:text-gray-400">Qualité:</span>
                      <span>{effectiveConnectionType || "Non disponible"}</span>
                    </div>
                  </div>
                )}

                {/* Détails des éléments en attente */}
                {totalPending > 0 && (
                  <div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded">
                    <p className="font-medium mb-1">Éléments en attente:</p>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      <span className="text-gray-600 dark:text-gray-400">Inspections:</span>
                      <span>{pendingItems.inspections}</span>
                      <span className="text-gray-600 dark:text-gray-400">Photos:</span>
                      <span>{pendingItems.photos}</span>
                      <span className="text-gray-600 dark:text-gray-400">Équipements radio:</span>
                      <span>{pendingItems.radioEquipment}</span>
                    </div>
                  </div>
                )}

                {/* Résultat de la dernière synchronisation */}
                {syncResult && (
                  <div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded">
                    <p className="font-medium mb-1">Dernière synchronisation:</p>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      <span className="text-gray-600 dark:text-gray-400">Statut:</span>
                      <span className={syncResult.success ? "text-green-600" : "text-red-600"}>
                        {syncResult.success ? "Réussie" : "Échec partiel"}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">Éléments traités:</span>
                      <span>{syncResult.totalProcessed}</span>
                      <span className="text-gray-600 dark:text-gray-400">Réussis:</span>
                      <span className="text-green-600">{syncResult.successCount}</span>
                      <span className="text-gray-600 dark:text-gray-400">Échoués:</span>
                      <span className="text-red-600">{syncResult.errorCount}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Barre de progression de la synchronisation */}
            {isSyncing && (
              <div className="mt-2">
                <Progress value={syncProgress} className="h-1.5" />
                <p className="text-xs text-center mt-1">Synchronisation en cours... {Math.round(syncProgress)}%</p>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="mt-2 flex items-center justify-between">
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={() => setExpanded(!expanded)}>
                {expanded ? "Moins de détails" : "Plus de détails"}
              </Button>

              <div className="flex gap-1">
                {isOnline && totalPending > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 px-2"
                      onClick={handleRetry}
                      disabled={isSyncing || !isOnline}
                    >
                      Réessayer
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="text-xs h-7 px-2 bg-blue-600 hover:bg-blue-700"
                      onClick={handleSync}
                      disabled={isSyncing || !isOnline}
                    >
                      {isSyncing ? (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          Synchronisation...
                        </>
                      ) : (
                        "Synchroniser"
                      )}
                    </Button>
                  </>
                )}

                <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={() => setShowBanner(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Alert>
    </div>
  )
}
