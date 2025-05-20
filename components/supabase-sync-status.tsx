"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Wifi, WifiOff, RefreshCw, Download, Upload, CheckCircle, AlertTriangle } from "lucide-react"
import { isOnline, syncAllPendingData, retryFailedSync, downloadDataFromSupabase } from "@/lib/supabase-sync-service"
import { countPendingItems } from "@/lib/indexed-db-service"

export function SupabaseSyncStatus() {
  const [online, setOnline] = useState(isOnline())
  const [pendingCounts, setPendingCounts] = useState({ inspections: 0, photos: 0, radioEquipment: 0, total: 0 })
  const [isSyncing, setIsSyncing] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [lastSyncResult, setLastSyncResult] = useState<any>(null)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [lastDownloadResult, setLastDownloadResult] = useState<any>(null)
  const [lastDownloadTime, setLastDownloadTime] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState("sync")
  const [syncProgress, setSyncProgress] = useState(0)

  // Mettre à jour l'état de la connexion
  useEffect(() => {
    const handleOnlineStatus = () => {
      setOnline(isOnline())
    }

    window.addEventListener("online", handleOnlineStatus)
    window.addEventListener("offline", handleOnlineStatus)

    return () => {
      window.removeEventListener("online", handleOnlineStatus)
      window.removeEventListener("offline", handleOnlineStatus)
    }
  }, [])

  // Mettre à jour les compteurs d'éléments en attente
  useEffect(() => {
    const updateCounts = async () => {
      const counts = await countPendingItems()
      const total = counts.inspections + counts.photos + counts.radioEquipment
      setPendingCounts({ ...counts, total })
    }

    updateCounts()
    const interval = setInterval(updateCounts, 30000) // Mettre à jour toutes les 30 secondes

    return () => clearInterval(interval)
  }, [])

  // Synchroniser les données avec Supabase
  const handleSync = async () => {
    if (!online || isSyncing) return

    setIsSyncing(true)
    setSyncProgress(10) // Démarrer la progression

    try {
      // Simuler une progression
      const progressInterval = setInterval(() => {
        setSyncProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      const result = await syncAllPendingData()

      clearInterval(progressInterval)
      setSyncProgress(100) // Terminer la progression

      setLastSyncResult(result)
      setLastSyncTime(new Date())

      // Mettre à jour les compteurs après la synchronisation
      const counts = await countPendingItems()
      const total = counts.inspections + counts.photos + counts.radioEquipment
      setPendingCounts({ ...counts, total })

      // Réinitialiser la progression après un court délai
      setTimeout(() => setSyncProgress(0), 1000)
    } catch (error) {
      console.error("Erreur lors de la synchronisation:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  // Réessayer les synchronisations échouées
  const handleRetry = async () => {
    if (!online || isSyncing) return

    setIsSyncing(true)
    setSyncProgress(10)

    try {
      // Simuler une progression
      const progressInterval = setInterval(() => {
        setSyncProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      const result = await retryFailedSync()

      clearInterval(progressInterval)
      setSyncProgress(100)

      setLastSyncResult(result)
      setLastSyncTime(new Date())

      // Mettre à jour les compteurs après la synchronisation
      const counts = await countPendingItems()
      const total = counts.inspections + counts.photos + counts.radioEquipment
      setPendingCounts({ ...counts, total })

      // Réinitialiser la progression après un court délai
      setTimeout(() => setSyncProgress(0), 1000)
    } catch (error) {
      console.error("Erreur lors de la nouvelle tentative:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  // Télécharger les données depuis Supabase
  const handleDownload = async () => {
    if (!online || isDownloading) return

    setIsDownloading(true)
    setSyncProgress(10)

    try {
      // Simuler une progression
      const progressInterval = setInterval(() => {
        setSyncProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      const result = await downloadDataFromSupabase()

      clearInterval(progressInterval)
      setSyncProgress(100)

      setLastDownloadResult(result)
      setLastDownloadTime(new Date())

      // Réinitialiser la progression après un court délai
      setTimeout(() => setSyncProgress(0), 1000)
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Synchronisation Supabase</CardTitle>
            <CardDescription>Gérez la synchronisation des données avec Supabase</CardDescription>
          </div>
          <Badge
            variant="outline"
            className={
              online
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
            }
          >
            {online ? (
              <>
                <Wifi className="h-3 w-3 mr-1" /> En ligne
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" /> Hors ligne
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Barre de progression */}
          {syncProgress > 0 && <Progress value={syncProgress} className="h-2" />}

          {/* Résumé des éléments en attente */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md text-center">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-300">Inspections</div>
              <div className="text-xl font-bold text-blue-900 dark:text-blue-200">{pendingCounts.inspections}</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-md text-center">
              <div className="text-sm font-medium text-purple-800 dark:text-purple-300">Photos</div>
              <div className="text-xl font-bold text-purple-900 dark:text-purple-200">{pendingCounts.photos}</div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md text-center">
              <div className="text-sm font-medium text-amber-800 dark:text-amber-300">Équipements</div>
              <div className="text-xl font-bold text-amber-900 dark:text-amber-200">{pendingCounts.radioEquipment}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/20 p-2 rounded-md text-center">
              <div className="text-sm font-medium text-gray-800 dark:text-gray-300">Total</div>
              <div className="text-xl font-bold text-gray-900 dark:text-gray-200">{pendingCounts.total}</div>
            </div>
          </div>

          {/* Onglets */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="sync">Synchronisation</TabsTrigger>
              <TabsTrigger value="download">Téléchargement</TabsTrigger>
            </TabsList>

            {/* Onglet de synchronisation */}
            <TabsContent value="sync" className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleSync}
                  disabled={!online || isSyncing || pendingCounts.total === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Synchronisation...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Synchroniser ({pendingCounts.total})
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleRetry} disabled={!online || isSyncing}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer les échecs
                </Button>
              </div>

              {lastSyncResult && (
                <Alert
                  className={
                    lastSyncResult.success
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                  }
                >
                  <div className="flex items-center">
                    {lastSyncResult.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mr-2" />
                    )}
                    <AlertTitle>
                      {lastSyncResult.success ? "Synchronisation réussie" : "Synchronisation partielle"}
                    </AlertTitle>
                  </div>
                  <AlertDescription className="mt-2">
                    <div className="text-sm">
                      <p>{lastSyncTime && `Dernière synchronisation: ${lastSyncTime.toLocaleString()}`}</p>
                      <p className="mt-1">
                        Éléments traités: {lastSyncResult.totalProcessed}({lastSyncResult.successCount} réussis,{" "}
                        {lastSyncResult.errorCount} échoués)
                      </p>
                      <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="font-medium">Inspections:</span> {lastSyncResult.details.inspections.success}{" "}
                          réussies, {lastSyncResult.details.inspections.error} échouées
                        </div>
                        <div>
                          <span className="font-medium">Photos:</span> {lastSyncResult.details.photos.success} réussies,{" "}
                          {lastSyncResult.details.photos.error} échouées
                        </div>
                        <div>
                          <span className="font-medium">Équipements:</span>{" "}
                          {lastSyncResult.details.radioEquipment.success} réussis,{" "}
                          {lastSyncResult.details.radioEquipment.error} échoués
                        </div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* Onglet de téléchargement */}
            <TabsContent value="download" className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleDownload}
                  disabled={!online || isDownloading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isDownloading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Téléchargement...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger depuis Supabase
                    </>
                  )}
                </Button>
              </div>

              {lastDownloadResult && (
                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                    <AlertTitle>Téléchargement terminé</AlertTitle>
                  </div>
                  <AlertDescription className="mt-2">
                    <div className="text-sm">
                      <p>{lastDownloadTime && `Dernier téléchargement: ${lastDownloadTime.toLocaleString()}`}</p>
                      <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="font-medium">Inspections:</span> {lastDownloadResult.inspections}{" "}
                          téléchargées
                        </div>
                        <div>
                          <span className="font-medium">Photos:</span> {lastDownloadResult.photos} téléchargées
                        </div>
                        <div>
                          <span className="font-medium">Équipements:</span> {lastDownloadResult.radioEquipment}{" "}
                          téléchargés
                        </div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}
