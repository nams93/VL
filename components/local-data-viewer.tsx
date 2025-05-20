"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getAllFromStore } from "@/lib/indexed-db-service"
import { getSupabaseClient } from "@/lib/supabase-service"
import { RefreshCw, Database, HardDrive } from "lucide-react"

export function LocalDataViewer() {
  const [activeTab, setActiveTab] = useState("local")
  const [localData, setLocalData] = useState<{ [key: string]: any[] }>({
    inspections: [],
    photos: [],
    radioEquipment: [],
  })
  const [supabaseData, setSupabaseData] = useState<{ [key: string]: any[] }>({
    inspections: [],
    photos: [],
    radioEquipment: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [dataType, setDataType] = useState("inspections")

  // Charger les données locales
  const loadLocalData = async () => {
    setIsLoading(true)
    try {
      const inspections = await getAllFromStore("inspections")
      const photos = await getAllFromStore("photos")
      const radioEquipment = await getAllFromStore("radioEquipment")

      setLocalData({
        inspections,
        photos,
        radioEquipment,
      })
    } catch (error) {
      console.error("Erreur lors du chargement des données locales:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Charger les données de Supabase
  const loadSupabaseData = async () => {
    setIsLoading(true)
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
      const { data: radioEquipment, error: radioEquipmentError } = await supabase
        .from("radio_equipment")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100)

      if (radioEquipmentError) throw radioEquipmentError

      setSupabaseData({
        inspections: inspections || [],
        photos: photos || [],
        radioEquipment: radioEquipment || [],
      })
    } catch (error) {
      console.error("Erreur lors du chargement des données Supabase:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Charger les données au chargement du composant
  useEffect(() => {
    if (activeTab === "local") {
      loadLocalData()
    } else {
      loadSupabaseData()
    }
  }, [activeTab])

  // Formater la date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  // Obtenir les données actuelles en fonction de l'onglet actif
  const getCurrentData = () => {
    return activeTab === "local" ? localData[dataType] : supabaseData[dataType]
  }

  // Rafraîchir les données
  const handleRefresh = () => {
    if (activeTab === "local") {
      loadLocalData()
    } else {
      loadSupabaseData()
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Visualiseur de données</CardTitle>
            <CardDescription>
              Consultez les données stockées {activeTab === "local" ? "localement" : "dans Supabase"}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2">Actualiser</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="local" className="flex items-center">
                <HardDrive className="h-4 w-4 mr-2" />
                Données locales
              </TabsTrigger>
              <TabsTrigger value="supabase" className="flex items-center">
                <Database className="h-4 w-4 mr-2" />
                Données Supabase
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs value={dataType} onValueChange={setDataType}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="inspections">
                Inspections ({activeTab === "local" ? localData.inspections.length : supabaseData.inspections.length})
              </TabsTrigger>
              <TabsTrigger value="photos">
                Photos ({activeTab === "local" ? localData.photos.length : supabaseData.photos.length})
              </TabsTrigger>
              <TabsTrigger value="radioEquipment">
                Équipements (
                {activeTab === "local" ? localData.radioEquipment.length : supabaseData.radioEquipment.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <ScrollArea className="h-[400px] rounded-md border p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : getCurrentData().length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">Aucune donnée disponible</div>
            ) : (
              <div className="space-y-4">
                {getCurrentData().map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium truncate">{item.id}</div>
                        <Badge
                          variant="outline"
                          className={
                            (activeTab === "local" ? item.syncStatus : item.sync_status) === "synced"
                              ? "bg-green-100 text-green-800"
                              : (activeTab === "local" ? item.syncStatus : item.sync_status) === "pending"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {activeTab === "local" ? item.syncStatus : item.sync_status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500 mb-2">{formatDate(item.timestamp)}</div>
                      <div className="text-sm">
                        {dataType === "inspections" && (
                          <>
                            <div>
                              <span className="font-medium">Véhicule:</span>{" "}
                              {activeTab === "local" ? item.vehicleId : item.vehicle_id}
                            </div>
                            <div>
                              <span className="font-medium">Agent:</span>{" "}
                              {activeTab === "local" ? item.agentId : item.agent_id}
                            </div>
                          </>
                        )}
                        {dataType === "photos" && (
                          <>
                            <div>
                              <span className="font-medium">Inspection:</span>{" "}
                              {activeTab === "local" ? item.inspectionId : item.inspection_id}
                            </div>
                            <div>
                              <span className="font-medium">Vue:</span> {item.view}
                            </div>
                            <div>
                              <span className="font-medium">Commentaire:</span> {item.comment || "Aucun"}
                            </div>
                          </>
                        )}
                        {dataType === "radioEquipment" && (
                          <>
                            <div>
                              <span className="font-medium">Véhicule:</span>{" "}
                              {activeTab === "local" ? item.vehicleId : item.vehicle_id}
                            </div>
                            <div>
                              <span className="font-medium">Agent:</span>{" "}
                              {activeTab === "local" ? item.agentId : item.agent_id}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}
