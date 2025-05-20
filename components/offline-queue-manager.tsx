"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getQueue,
  getPendingActions,
  getFailedActions,
  processQueue,
  retryFailedActions,
  cleanupCompletedActions,
} from "@/lib/offline-queue"
import { useNetworkStatus } from "@/hooks/use-network-status"
import {
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trash2,
  AlertTriangle,
  WifiOff,
  Wifi,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

// Gestionnaires d'actions fictifs pour la démonstration
const demoActionHandlers = {
  "save-inspection": async (payload: any) => {
    // Simuler un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 800))
    console.log("Inspection enregistrée:", payload)
    return { success: true }
  },
  "upload-photo": async (payload: any) => {
    // Simuler un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 1200))
    console.log("Photo téléchargée:", payload)
    return { success: true }
  },
  "update-equipment": async (payload: any) => {
    // Simuler un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 600))
    console.log("Équipement mis à jour:", payload)
    return { success: true }
  },
}

export function OfflineQueueManager() {
  const { isOnline } = useNetworkStatus()
  const [queue, setQueue] = useState<any[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [failedCount, setFailedCount] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Charger la file d'attente
  useEffect(() => {
    refreshQueue()
  }, [lastRefresh])

  // Rafraîchir la file d'attente
  const refreshQueue = () => {
    const allQueue = getQueue()
    setQueue(allQueue)
    setPendingCount(getPendingActions().length)
    setFailedCount(getFailedActions().length)
    setCompletedCount(allQueue.filter((action) => action.status === "completed").length)
  }

  // Traiter la file d'attente
  const handleProcessQueue = async () => {
    if (!isOnline) {
      alert("Impossible de traiter la file d'attente en mode hors ligne")
      return
    }

    setIsProcessing(true)

    try {
      const result = await processQueue(demoActionHandlers)
      alert(`Traitement terminé: ${result.succeeded} réussi(s), ${result.failed} échoué(s)`)
      refreshQueue()
    } catch (error) {
      console.error("Erreur lors du traitement de la file d'attente:", error)
      alert("Une erreur est survenue lors du traitement de la file d'attente")
    } finally {
      setIsProcessing(false)
      setLastRefresh(new Date())
    }
  }

  // Réessayer les actions échouées
  const handleRetryFailed = async () => {
    if (!isOnline) {
      alert("Impossible de réessayer les actions en mode hors ligne")
      return
    }

    setIsProcessing(true)

    try {
      const result = await retryFailedActions(demoActionHandlers)
      alert(`Nouvelles tentatives terminées: ${result.succeeded} réussi(s), ${result.failed} échoué(s)`)
      refreshQueue()
    } catch (error) {
      console.error("Erreur lors des nouvelles tentatives:", error)
      alert("Une erreur est survenue lors des nouvelles tentatives")
    } finally {
      setIsProcessing(false)
      setLastRefresh(new Date())
    }
  }

  // Nettoyer les actions terminées
  const handleCleanupCompleted = () => {
    const removedCount = cleanupCompletedActions()
    alert(`${removedCount} action(s) terminée(s) supprimée(s)`)
    setLastRefresh(new Date())
  }

  // Basculer l'état d'expansion d'un élément
  const toggleItemExpanded = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Formater la date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  // Obtenir la couleur de badge en fonction du statut
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "processing":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  // Obtenir l'icône en fonction du statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "processing":
        return <RefreshCw className="h-4 w-4 animate-spin" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "failed":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  // Filtrer la file d'attente en fonction de l'onglet actif
  const filteredQueue = queue.filter((action) => {
    if (activeTab === "all") return true
    return action.status === activeTab
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Gestionnaire de file d'attente hors ligne</CardTitle>
            <CardDescription>Gérez les actions en attente de synchronisation</CardDescription>
          </div>
          <div className="flex items-center">
            {isOnline ? (
              <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                <span>En ligne</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-100 text-red-800 flex items-center gap-1">
                <WifiOff className="h-3 w-3" />
                <span>Hors ligne</span>
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Résumé */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md text-center">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-300">En attente</div>
              <div className="text-xl font-bold text-blue-900 dark:text-blue-200">{pendingCount}</div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md text-center">
              <div className="text-sm font-medium text-amber-800 dark:text-amber-300">En cours</div>
              <div className="text-xl font-bold text-amber-900 dark:text-amber-200">
                {queue.filter((action) => action.status === "processing").length}
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-md text-center">
              <div className="text-sm font-medium text-red-800 dark:text-red-300">Échouées</div>
              <div className="text-xl font-bold text-red-900 dark:text-red-200">{failedCount}</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-md text-center">
              <div className="text-sm font-medium text-green-800 dark:text-green-300">Terminées</div>
              <div className="text-xl font-bold text-green-900 dark:text-green-200">{completedCount}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={refreshQueue} className="text-xs">
              <RefreshCw className="h-3 w-3 mr-1" />
              Actualiser
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={handleProcessQueue}
              disabled={!isOnline || pendingCount === 0 || isProcessing}
              className="text-xs bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>Traiter la file d'attente</>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetryFailed}
              disabled={!isOnline || failedCount === 0 || isProcessing}
              className="text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Réessayer les échecs
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCleanupCompleted}
              disabled={completedCount === 0}
              className="text-xs"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Nettoyer
            </Button>
          </div>

          {/* Liste des actions */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="all" className="text-xs">
                Toutes ({queue.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-xs">
                En attente ({pendingCount})
              </TabsTrigger>
              <TabsTrigger value="failed" className="text-xs">
                Échouées ({failedCount})
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs">
                Terminées ({completedCount})
              </TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-2">
              {filteredQueue.length === 0 ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">Aucune action à afficher</div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {filteredQueue.map((action) => (
                    <div key={action.id} className="border rounded-md overflow-hidden bg-white dark:bg-gray-800">
                      <div
                        className="p-2 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => toggleItemExpanded(action.id)}
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getStatusBadgeClass(action.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(action.status)}
                              <span className="capitalize">{action.status}</span>
                            </span>
                          </Badge>
                          <span className="font-medium text-sm">{action.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(action.timestamp)}
                          </span>
                          {expandedItems[action.id] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </div>

                      {expandedItems[action.id] && (
                        <div className="p-2 border-t bg-gray-50 dark:bg-gray-900/30">
                          <div className="text-xs space-y-2">
                            <div>
                              <span className="font-medium">ID: </span>
                              <span className="font-mono">{action.id}</span>
                            </div>
                            <div>
                              <span className="font-medium">Type: </span>
                              <span>{action.type}</span>
                            </div>
                            <div>
                              <span className="font-medium">Créée le: </span>
                              <span>{formatDate(action.timestamp)}</span>
                            </div>
                            <div>
                              <span className="font-medium">Tentatives: </span>
                              <span>{action.retryCount}</span>
                            </div>
                            {action.error && (
                              <div>
                                <span className="font-medium text-red-600 dark:text-red-400">Erreur: </span>
                                <span className="text-red-600 dark:text-red-400">{action.error}</span>
                              </div>
                            )}
                            <div>
                              <span className="font-medium">Payload: </span>
                              <pre className="mt-1 p-1 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                                {JSON.stringify(action.payload, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}
