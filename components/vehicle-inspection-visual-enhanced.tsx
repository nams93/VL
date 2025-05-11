"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Undo, Save, Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type DamageMarker = {
  id: string
  x: number
  y: number
  type: "scratch" | "dent" | "broken" | "other"
  description: string
  severity: "minor" | "moderate" | "severe"
}

export function VehicleInspectionVisualEnhanced() {
  const [activeView, setActiveView] = useState("front")
  const [markers, setMarkers] = useState<Record<string, DamageMarker[]>>({
    front: [],
    back: [],
    left: [],
    right: [],
  })
  const [isAddingMarker, setIsAddingMarker] = useState(false)
  const [newMarkerType, setNewMarkerType] = useState<DamageMarker["type"]>("scratch")
  const [newMarkerSeverity, setNewMarkerSeverity] = useState<DamageMarker["severity"]>("minor")
  const [newMarkerDescription, setNewMarkerDescription] = useState("")
  const [photos, setPhotos] = useState<Record<string, string[]>>({
    front: [],
    back: [],
    left: [],
    right: [],
  })

  // Ajouter un marqueur sur l'image
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingMarker) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    const newMarker: DamageMarker = {
      id: `marker-${Date.now()}`,
      x,
      y,
      type: newMarkerType,
      description: newMarkerDescription || `${newMarkerType} - ${newMarkerSeverity}`,
      severity: newMarkerSeverity,
    }

    setMarkers({
      ...markers,
      [activeView]: [...markers[activeView], newMarker],
    })

    // Réinitialiser l'état d'ajout de marqueur
    setIsAddingMarker(false)
    setNewMarkerDescription("")
  }

  // Supprimer un marqueur
  const removeMarker = (markerId: string) => {
    setMarkers({
      ...markers,
      [activeView]: markers[activeView].filter((marker) => marker.id !== markerId),
    })
  }

  // Simuler l'ajout d'une photo (dans un environnement réel, cela utiliserait l'API de la caméra)
  const addPhoto = () => {
    // Simuler une photo avec une URL d'espace réservé
    const newPhotoUrl = `/placeholder.svg?height=300&width=400&query=car ${activeView} photo`
    setPhotos({
      ...photos,
      [activeView]: [...photos[activeView], newPhotoUrl],
    })
  }

  // Obtenir la couleur du marqueur en fonction de la gravité
  const getMarkerColor = (severity: DamageMarker["severity"]) => {
    switch (severity) {
      case "minor":
        return "bg-yellow-500"
      case "moderate":
        return "bg-orange-500"
      case "severe":
        return "bg-red-500"
      default:
        return "bg-blue-500"
    }
  }

  // Obtenir l'icône du marqueur en fonction du type
  const getMarkerIcon = (type: DamageMarker["type"]) => {
    switch (type) {
      case "scratch":
        return "—"
      case "dent":
        return "◉"
      case "broken":
        return "✱"
      default:
        return "+"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inspection Visuelle Interactive</CardTitle>
        <CardDescription>
          Marquez les dommages sur le véhicule et ajoutez des photos pour documenter son état
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="front">Avant</TabsTrigger>
            <TabsTrigger value="back">Arrière</TabsTrigger>
            <TabsTrigger value="left">Gauche</TabsTrigger>
            <TabsTrigger value="right">Droite</TabsTrigger>
          </TabsList>

          {["front", "back", "left", "right"].map((view) => (
            <TabsContent key={view} value={view} className="space-y-4">
              <div className="border rounded-md p-2">
                <div className="relative w-full h-64 bg-gray-100 rounded-md overflow-hidden" onClick={handleImageClick}>
                  {/* Image du véhicule */}
                  <img
                    src={`/images/car-${view}.png`}
                    alt={`Vue ${view} du véhicule`}
                    className="w-full h-full object-contain"
                  />

                  {/* Marqueurs de dommages */}
                  {markers[view].map((marker) => (
                    <div
                      key={marker.id}
                      className={`absolute w-6 h-6 flex items-center justify-center rounded-full ${getMarkerColor(
                        marker.severity,
                      )} text-white cursor-pointer transform -translate-x-1/2 -translate-y-1/2`}
                      style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                      title={marker.description}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (window.confirm("Voulez-vous supprimer ce marqueur ?")) {
                          removeMarker(marker.id)
                        }
                      }}
                    >
                      {getMarkerIcon(marker.type)}
                    </div>
                  ))}
                </div>

                {/* Contrôles pour ajouter des marqueurs */}
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <h3 className="text-sm font-medium mb-2">Ajouter un marqueur de dommage</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Button
                      variant={isAddingMarker ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsAddingMarker(!isAddingMarker)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {isAddingMarker ? "Cliquez sur l'image" : "Ajouter un marqueur"}
                    </Button>

                    {isAddingMarker && (
                      <>
                        <select
                          className="px-2 py-1 border rounded-md text-sm"
                          value={newMarkerType}
                          onChange={(e) => setNewMarkerType(e.target.value as DamageMarker["type"])}
                        >
                          <option value="scratch">Rayure</option>
                          <option value="dent">Bosse</option>
                          <option value="broken">Cassé</option>
                          <option value="other">Autre</option>
                        </select>

                        <select
                          className="px-2 py-1 border rounded-md text-sm"
                          value={newMarkerSeverity}
                          onChange={(e) => setNewMarkerSeverity(e.target.value as DamageMarker["severity"])}
                        >
                          <option value="minor">Mineur</option>
                          <option value="moderate">Modéré</option>
                          <option value="severe">Sévère</option>
                        </select>

                        <input
                          type="text"
                          placeholder="Description (optionnelle)"
                          className="px-2 py-1 border rounded-md text-sm flex-grow"
                          value={newMarkerDescription}
                          onChange={(e) => setNewMarkerDescription(e.target.value)}
                        />
                      </>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <div>
                      <span className="text-sm text-gray-500">
                        {markers[view].length} marqueur(s) • {photos[view].length} photo(s)
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => addPhoto()}>
                        <Camera className="h-4 w-4 mr-1" />
                        Ajouter une photo
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setMarkers({ ...markers, [view]: [] })
                          setPhotos({ ...photos, [view]: [] })
                        }}
                      >
                        <Undo className="h-4 w-4 mr-1" />
                        Réinitialiser
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photos prises */}
              {photos[view].length > 0 && (
                <div className="border rounded-md p-3">
                  <h3 className="text-sm font-medium mb-2">Photos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {photos[view].map((photo, index) => (
                      <div key={index} className="relative border rounded-md overflow-hidden h-32">
                        <img
                          src={photo || "/placeholder.svg"}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => {
                            const newPhotos = [...photos[view]]
                            newPhotos.splice(index, 1)
                            setPhotos({ ...photos, [view]: newPhotos })
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Résumé des dommages */}
        <div className="mt-6 border-t pt-4">
          <h3 className="text-sm font-medium mb-2">Résumé des dommages</h3>
          <div className="space-y-2">
            {Object.entries(markers).map(([view, viewMarkers]) =>
              viewMarkers.length > 0 ? (
                <div key={view} className="bg-gray-50 p-2 rounded-md">
                  <h4 className="font-medium text-sm capitalize">{view}</h4>
                  <ul className="text-sm list-disc pl-5">
                    {viewMarkers.map((marker) => (
                      <li key={marker.id}>
                        {marker.description} ({marker.severity})
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null,
            )}
            {Object.values(markers).flat().length === 0 && (
              <p className="text-sm text-gray-500">Aucun dommage signalé</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button>
            <Save className="h-4 w-4 mr-1" />
            Enregistrer l'inspection visuelle
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
