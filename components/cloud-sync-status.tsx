"use client"

import { useEffect, useState } from "react"
import { getCloudSyncService } from "@/lib/cloud-sync-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Cloud, CloudOff, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react"

export function CloudSyncStatus() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true)
  const [pendingCounts, setPendingCounts] = useState({ inspections: 0, photos: 0, radioEquipment: 0, total: 0 })
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [lastSyncResult, setLastSyncResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Initialiser le service et obtenir les compteurs
    const initService = async () => {
      const syncService = getCloudSyncService()
      await syncService.init()
      updatePendingCounts()
    }

    initService()

    // Mettre à jour les compteurs toutes les 30 secondes
    const interval = setInterval(updatePendingCounts, 30000)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearInterval(interval)
    }
  }, [])

  const updatePendingCounts = async () => {
    const syncService = getCloudSyncService()
    const counts = await syncService.getPendingCounts()
    setPendingCounts(counts)
    setIsSyncing(syncService.isSyncing())
  }

  const handleSync = async () => {
    if (isSyncing || !isOnline) return

    setIsSyncing(true)
    setSyncProgress(0)
    setLastSyncResult(null)

    const syncService = getCloudSyncService()
    const counts = await syncService.getPendingCounts()
    setTotalItems(counts.total)

    try {
      const success = await syncService.syncWithCloud((progress, total) => {
        setSyncProgress(Math.floor((progress / total) * 100))
      })

      if (success) {
        setLastSyncResult({
          success: true,
          message: "Synchronisation réussie. Toutes les données ont été synchronisées avec Supabase.",
        })
      } else {
        setLastSyncResult({
          success: false,
          message: "La synchronisation a échoué pour certains éléments. Veuillez réessayer.",
        })
      }
    } catch (error) {
      setLastSyncResult({
        success: false,
        message: "Une erreur s'est produite lors de la synchronisation. Veuillez réessayer.",
      })
    } finally {
      setIsSyncing(false)
      updatePendingCounts()
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Synchronisation Cloud</CardTitle>
          {isOnline ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Cloud className="h-3 w-3 mr-1" /> Connecté
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <CloudOff className="h-3 w-3 mr-1" /> Hors ligne
            </Badge>
          )}
        </div>
        <CardDescription>Synchronisez vos données locales avec Supabase</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isOnline && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Connexion requise</AlertTitle>
            <AlertDescription>
              Vous êtes actuellement hors ligne. Connectez-vous à Internet pour synchroniser vos données.
            </AlertDescription>
          </Alert>
        )}

        {lastSyncResult && (
          <Alert variant={lastSyncResult.success ? "default" : "destructive"}>
            {lastSyncResult.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <AlertTitle>{lastSyncResult.success ? "Succès" : "Erreur"}</AlertTitle>
            <AlertDescription>{lastSyncResult.message}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
            <div className="text-2xl font-bold">{pendingCounts.inspections}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Inspections</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
            <div className="text-2xl font-bold">{pendingCounts.photos}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Photos</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
            <div className="text-2xl font-bold">{pendingCounts.radioEquipment}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Équipements</div>
          </div>
        </div>

        {isSyncing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression</span>
              <span>{syncProgress}%</span>
            </div>
            <Progress value={syncProgress} className="h-2" />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSync} disabled={isSyncing || !isOnline || pendingCounts.total === 0} className="w-full">
          {isSyncing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Synchronisation en cours...
            </>
          ) : (
            <>
              <Cloud className="h-4 w-4 mr-2" />
              Synchroniser ({pendingCounts.total} éléments)
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
