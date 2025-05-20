"use client"

import { useState, useEffect } from "react"
import { CloudSyncStatus } from "@/components/cloud-sync-status"
import { AutoSyncSettings } from "@/components/auto-sync-settings"
import { AddSyncData } from "@/components/add-sync-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getCloudSyncService } from "@/lib/cloud-sync-service"
import { getSupabaseClient } from "@/lib/supabase-client"
import { RefreshCw, Database, HardDrive, AlertCircle, CheckCircle2, XCircle } from "lucide-react"

export default function SyncDashboardPage() {
  const [localData, setLocalData] = useState<any>({ inspections: [], photos: [], radioEquipment: [] })
  const [cloudData, setCloudData] = useState<any>({ inspections: [], photos: [], radioEquipment: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("status")
  const [dataSource, setDataSource] = useState("local")
  const [dataType, setDataType] = useState("inspections")
  const [syncStatus, setSyncStatus] = useState({
    pendingCount: 0,
    lastSync: null as Date | null,
    isOnline: true,
  })

  useEffect(() => {
    loadData()
    updateSyncStatus()

    // Mettre à jour le statut de synchronisation toutes les 30 secondes
    const interval = setInterval(updateSyncStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const updateSyncStatus = async () => {
    try {
      const syncService = getCloudSyncService()
      const counts = await syncService.getPendingCounts()

      setSyncStatus({
        pendingCount: counts.total,
        lastSync: localStorage.getItem("last-sync-time")
          ? new Date(Number.parseInt(localStorage.getItem("last-sync-time") || "0"))
          : null,
        isOnline: navigator.onLine,
      })
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut de synchronisation:", error)
    }
  }

  const loadData = async () => {
    setIsLoading(true)

    try {
      // Charger les données locales
      const syncService = getCloudSyncService()
      await syncService.init()
      const local = await syncService.getAllLocalData()
      setLocalData(local)

      // Charger les données du cloud si en ligne
      if (navigator.onLine) {
        await loadCloudData()
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCloudData = async () => {
    try {
      const supabase = getSupabaseClient()

      // Charger les inspections
      const { data: inspections, error: inspectionsError } = await supabase
        .from("inspections")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100)

      if (inspectionsError) throw inspectionsError

      // Charger les photos
      const { data: photos, error: photosError } = await supabase
        .from("photos")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100)

      if (photosError) throw photosError

      // Charger les équipements radio
      const { data: radioEquipment, error: radioError } = await supabase
        .from("radio_equipment")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100)

      if (radioError) throw radioError

      setCloudData({
        inspections: inspections || [],
        photos: photos || [],
        radioEquipment: radioEquipment || [],
      })
    } catch (error) {
      console.error("Erreur lors du chargement des données cloud:", error)
    }
  }

  const handleRefresh = async () => {
    await loadData()
    await updateSyncStatus()
  }

  const handleStartSync = async () => {
    try {
      const syncService = getCloudSyncService()
      await syncService.syncWithCloud((progress, total) => {
        console.log(`Progression: ${progress}/${total}`)
      })

      // Mettre à jour les données après la synchronisation
      await loadData()
      await updateSyncStatus()

      // Enregistrer l'heure de la dernière synchronisation
      localStorage.setItem("last-sync-time", Date.now().toString())
    } catch (error) {
      console.error("Erreur lors de la synchronisation:", error)
    }
  }

  const getCurrentData = () => {
    return dataSource === "local" ? localData[dataType] : cloudData[dataType]
  }

  const renderDataContent = () => {
    const data = getCurrentData() || []

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )
    }

    if (data.length === 0) {
      return (
        <Alert className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Aucune donnée disponible</AlertTitle>
          <AlertDescription>
            {dataSource === "local"
              ? "Aucune donnée n'est stockée localement. Créez de nouvelles inspections ou équipements pour commencer."
              : "Aucune donnée n'est stockée dans Supabase. Synchronisez vos données locales pour les envoyer au cloud."}
          </AlertDescription>
        </Alert>
      )
    }

    return (
      <ScrollArea className="h-[400px] rounded-md border">
        <div className="p-4 space-y-4">
          {data.map((item: any) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium truncate">{item.id}</div>
                  <Badge
                    variant="outline"
                    className={
                      (dataSource === "local" ? item.syncStatus : item.sync_status) === "synced"
                        ? "bg-green-100 text-green-800"
                        : (dataSource === "local" ? item.syncStatus : item.sync_status) === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {dataSource === "local" ? item.syncStatus : item.sync_status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500 mb-2">{new Date(item.timestamp).toLocaleString()}</div>
                <div className="text-sm">
                  {dataType === "inspections" && (
                    <>
                      <div>
                        <span className="font-medium">Véhicule:</span>{" "}
                        {dataSource === "local" ? item.vehicleId : item.vehicle_id}
                      </div>
                      <div>
                        <span className="font-medium">Agent:</span>{" "}
                        {dataSource === "local" ? item.agentId : item.agent_id}
                      </div>
                    </>
                  )}
                  {dataType === "photos" && (
                    <>
                      <div>
                        <span className="font-medium">Inspection:</span>{" "}
                        {dataSource === "local" ? item.inspectionId : item.inspection_id}
                      </div>
                      <div>
                        <span className="font-medium">Vue:</span> {item.view}
                      </div>
                      {item.comment && (
                        <div>
                          <span className="font-medium">Commentaire:</span> {item.comment}
                        </div>
                      )}
                    </>
                  )}
                  {dataType === "radioEquipment" && (
                    <>
                      <div>
                        <span className="font-medium">Véhicule:</span>{" "}
                        {dataSource === "local" ? item.vehicleId : item.vehicle_id}
                      </div>
                      <div>
                        <span className="font-medium">Agent:</span>{" "}
                        {dataSource === "local" ? item.agentId : item.agent_id}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tableau de Bord de Synchronisation</h1>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      <Card className="bg-white dark:bg-gray-950">
        <CardHeader>
          <CardTitle>État de la Synchronisation</CardTitle>
          <CardDescription>Statut actuel de la synchronisation entre les données locales et Supabase</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg flex items-center">
              <div className="mr-4">
                {syncStatus.isOnline ? (
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-500" />
                )}
              </div>
              <div>
                <div className="font-medium">Connexion</div>
                <div className="text-sm text-gray-500">{syncStatus.isOnline ? "En ligne" : "Hors ligne"}</div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg flex items-center">
              <div className="mr-4">
                <Database className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <div className="font-medium">Éléments en attente</div>
                <div className="text-sm text-gray-500">{syncStatus.pendingCount} élément(s) à synchroniser</div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg flex items-center">
              <div className="mr-4">
                <RefreshCw className="h-8 w-8 text-purple-500" />
              </div>
              <div>
                <div className="font-medium">Dernière synchronisation</div>
                <div className="text-sm text-gray-500">
                  {syncStatus.lastSync ? syncStatus.lastSync.toLocaleString() : "Jamais synchronisé"}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button
              onClick={handleStartSync}
              disabled={!syncStatus.isOnline || syncStatus.pendingCount === 0}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Synchroniser maintenant
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="status" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status">État</TabsTrigger>
          <TabsTrigger value="auto">Auto Sync</TabsTrigger>
          <TabsTrigger value="data">Données</TabsTrigger>
          <TabsTrigger value="add">Ajouter</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="py-4">
          <CloudSyncStatus />
        </TabsContent>

        <TabsContent value="auto" className="py-4">
          <AutoSyncSettings />
        </TabsContent>

        <TabsContent value="data" className="py-4">
          <Card>
            <CardHeader>
              <CardTitle>Visualisation des Données</CardTitle>
              <CardDescription>Consultez les données stockées localement et dans Supabase</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <Tabs value={dataSource} onValueChange={setDataSource} className="w-full">
                    <TabsList className="grid grid-cols-2">
                      <TabsTrigger value="local" className="flex items-center">
                        <HardDrive className="h-4 w-4 mr-2" />
                        Données locales
                      </TabsTrigger>
                      <TabsTrigger value="cloud" className="flex items-center" disabled={!navigator.onLine}>
                        <Database className="h-4 w-4 mr-2" />
                        Données Supabase
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <Separator />

                <Tabs value={dataType} onValueChange={setDataType}>
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="inspections">
                      Inspections (
                      {dataSource === "local" ? localData.inspections.length : cloudData.inspections.length})
                    </TabsTrigger>
                    <TabsTrigger value="photos">
                      Photos ({dataSource === "local" ? localData.photos.length : cloudData.photos.length})
                    </TabsTrigger>
                    <TabsTrigger value="radioEquipment">
                      Équipements (
                      {dataSource === "local" ? localData.radioEquipment.length : cloudData.radioEquipment.length})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {renderDataContent()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="py-4">
          <AddSyncData />
        </TabsContent>
      </Tabs>
    </div>
  )
}
