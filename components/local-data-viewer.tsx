"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Database, Trash2, RefreshCw } from "lucide-react"
import { getAllFromStore, clearAllData } from "@/lib/indexed-db-service"

export function LocalDataViewer() {
  const [activeTab, setActiveTab] = useState("inspections")
  const [inspections, setInspections] = useState([])
  const [photos, setPhotos] = useState([])
  const [radioEquipment, setRadioEquipment] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isClearing, setIsClearing] = useState(false)

  // Charger les données
  const loadData = async () => {
    setIsLoading(true)
    try {
      const inspectionsData = await getAllFromStore("inspections")
      const photosData = await getAllFromStore("photos")
      const radioData = await getAllFromStore("radioEquipment")

      setInspections(inspectionsData)
      setPhotos(photosData)
      setRadioEquipment(radioData)
    } catch (error) {
      console.error("Erreur lors du chargement des données locales:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Effacer toutes les données
  const handleClearData = async () => {
    if (!confirm("Êtes-vous sûr de vouloir effacer toutes les données locales ? Cette action est irréversible.")) {
      return
    }

    setIsClearing(true)
    try {
      await clearAllData()
      await loadData() // Recharger les données (qui seront vides)
    } catch (error) {
      console.error("Erreur lors de l'effacement des données:", error)
    } finally {
      setIsClearing(false)
    }
  }

  // Charger les données au montage du composant
  useEffect(() => {
    loadData()
  }, [])

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Données Stockées Localement
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
            <Button variant="destructive" size="sm" onClick={handleClearData} disabled={isClearing}>
              <Trash2 className="h-4 w-4 mr-1" />
              {isClearing ? "Effacement..." : "Effacer tout"}
            </Button>
          </div>
        </div>
        <CardDescription>Visualisez et gérez les données stockées localement sur votre appareil.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="inspections">Inspections ({inspections.length})</TabsTrigger>
            <TabsTrigger value="photos">Photos ({photos.length})</TabsTrigger>
            <TabsTrigger value="radioEquipment">Équipements Radio ({radioEquipment.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="inspections">
            {isLoading ? (
              <div className="text-center py-8">Chargement des inspections...</div>
            ) : inspections.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Aucune inspection stockée localement</div>
            ) : (
              <div className="space-y-4">
                {inspections.map((inspection: any) => (
                  <Card key={inspection.id}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-sm font-medium">ID</div>
                          <div className="text-xs text-gray-500">{inspection.id}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Véhicule</div>
                          <div className="text-xs text-gray-500">{inspection.vehicleId}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Agent</div>
                          <div className="text-xs text-gray-500">{inspection.agentId}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Statut</div>
                          <div
                            className={`text-xs ${
                              inspection.syncStatus === "synced"
                                ? "text-green-500"
                                : inspection.syncStatus === "error"
                                  ? "text-red-500"
                                  : "text-amber-500"
                            }`}
                          >
                            {inspection.syncStatus === "synced"
                              ? "Synchronisé"
                              : inspection.syncStatus === "error"
                                ? "Erreur"
                                : "En attente"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Date</div>
                          <div className="text-xs text-gray-500">{new Date(inspection.timestamp).toLocaleString()}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="photos">
            {isLoading ? (
              <div className="text-center py-8">Chargement des photos...</div>
            ) : photos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Aucune photo stockée localement</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {photos.map((photo: any) => (
                  <Card key={photo.id}>
                    <CardContent className="p-4">
                      <div className="aspect-video bg-gray-100 mb-2 overflow-hidden rounded">
                        <img
                          src={photo.dataUrl || "/placeholder.svg"}
                          alt="Photo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="font-medium">Vue</div>
                          <div className="text-gray-500">{photo.view}</div>
                        </div>
                        <div>
                          <div className="font-medium">Statut</div>
                          <div
                            className={`${
                              photo.syncStatus === "synced"
                                ? "text-green-500"
                                : photo.syncStatus === "error"
                                  ? "text-red-500"
                                  : "text-amber-500"
                            }`}
                          >
                            {photo.syncStatus === "synced"
                              ? "Synchronisé"
                              : photo.syncStatus === "error"
                                ? "Erreur"
                                : "En attente"}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="font-medium">Commentaire</div>
                          <div className="text-gray-500 truncate">{photo.comment || "Aucun commentaire"}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="radioEquipment">
            {isLoading ? (
              <div className="text-center py-8">Chargement des équipements radio...</div>
            ) : radioEquipment.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Aucun équipement radio stocké localement</div>
            ) : (
              <div className="space-y-4">
                {radioEquipment.map((equipment: any) => (
                  <Card key={equipment.id}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-sm font-medium">ID</div>
                          <div className="text-xs text-gray-500">{equipment.id}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Véhicule</div>
                          <div className="text-xs text-gray-500">{equipment.vehicleId}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Agent</div>
                          <div className="text-xs text-gray-500">{equipment.agentId}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Statut</div>
                          <div
                            className={`text-xs ${
                              equipment.syncStatus === "synced"
                                ? "text-green-500"
                                : equipment.syncStatus === "error"
                                  ? "text-red-500"
                                  : "text-amber-500"
                            }`}
                          >
                            {equipment.syncStatus === "synced"
                              ? "Synchronisé"
                              : equipment.syncStatus === "error"
                                ? "Erreur"
                                : "En attente"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Date</div>
                          <div className="text-xs text-gray-500">{new Date(equipment.timestamp).toLocaleString()}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
