"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, X, AlertCircle } from "lucide-react"
import { Vehicle3DViewer } from "@/components/vehicle-3d-model"

// Type simplifié pour les éléments à vérifier
type CheckItem = {
  label: string
  value: "oui" | "non" | null
}

type VehicleInspectionInteractiveProps = {
  lightsFront: CheckItem[]
  lightsRear: CheckItem[]
  equipments: CheckItem[]
  onUpdateLightsFront: (items: CheckItem[]) => void
  onUpdateLightsRear: (items: CheckItem[]) => void
  onUpdateEquipments: (items: CheckItem[]) => void
}

export function VehicleInspectionInteractive({
  lightsFront = [],
  lightsRear = [],
  equipments = [],
  onUpdateLightsFront,
  onUpdateLightsRear,
  onUpdateEquipments,
}: VehicleInspectionInteractiveProps) {
  const [activeView, setActiveView] = useState("front")
  const [use3DView, setUse3DView] = useState(false)

  // Fonction pour mettre à jour la valeur d'un élément (pour la vue 2D)
  const toggleItemValue = (items: CheckItem[], updateItems: (items: CheckItem[]) => void, index: number) => {
    if (!Array.isArray(items) || !items[index]) return

    const newItems = [...items]
    if (newItems[index].value === null) {
      newItems[index].value = "oui"
    } else if (newItems[index].value === "oui") {
      newItems[index].value = "non"
    } else {
      newItems[index].value = null
    }
    updateItems(newItems)
  }

  // Obtenir la couleur du marqueur en fonction de la valeur
  const getMarkerColor = (value: "oui" | "non" | null) => {
    switch (value) {
      case "oui":
        return "bg-green-500"
      case "non":
        return "bg-red-500"
      default:
        return "bg-gray-300"
    }
  }

  // Obtenir l'icône du marqueur en fonction de la valeur
  const getMarkerIcon = (value: "oui" | "non" | null) => {
    switch (value) {
      case "oui":
        return <Check className="h-3 w-3 text-white" />
      case "non":
        return <X className="h-3 w-3 text-white" />
      default:
        return <AlertCircle className="h-3 w-3 text-gray-500" />
    }
  }

  // S'assurer que les tableaux sont initialisés
  const safeLightsFront = Array.isArray(lightsFront) ? lightsFront : []
  const safeLightsRear = Array.isArray(lightsRear) ? lightsRear : []
  const safeEquipments = Array.isArray(equipments) ? equipments : []

  // Composant pour afficher une image avec des points d'inspection
  const ImageWithCheckpoints = ({
    src,
    alt,
    items,
    updateItems,
  }: {
    src: string
    alt: string
    items: CheckItem[]
    updateItems: (items: CheckItem[]) => void
  }) => (
    <div className="relative w-full h-64 bg-gray-100 rounded-md overflow-hidden border">
      <div className="relative w-full h-full">
        {/* Utilisation d'une balise img standard au lieu du composant Image de Next.js */}
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          className="w-full h-full object-cover rounded-md"
          onError={(e) => {
            e.currentTarget.src = "/placeholder-d1ogb.png"
            e.currentTarget.alt = "Image non disponible"
          }}
        />

        {/* Points d'inspection superposés sur l'image */}
        {items.map((item, index) => {
          // Positions aléatoires mais fixes pour les points d'inspection
          // Dans un vrai système, ces positions seraient définies précisément
          const left = 15 + ((index * 20) % 70)
          const top = 15 + ((index * 15) % 70)

          return (
            <div
              key={index}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ left: `${left}%`, top: `${top}%` }}
              onClick={() => toggleItemValue(items, updateItems, index)}
              title={item.label}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${getMarkerColor(item.value)} shadow-lg border-2 border-white`}
              >
                {getMarkerIcon(item.value)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Inspection Visuelle Interactive</CardTitle>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Vue 3D</span>
          <button
            onClick={() => setUse3DView(!use3DView)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
              use3DView ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                use3DView ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="front">Vue Avant</TabsTrigger>
            <TabsTrigger value="rear">Vue Arrière</TabsTrigger>
            <TabsTrigger value="equipment">Équipements</TabsTrigger>
          </TabsList>

          <TabsContent value="front" className="space-y-4">
            {use3DView ? (
              <Vehicle3DViewer view="front" items={safeLightsFront} onUpdateItems={onUpdateLightsFront} />
            ) : (
              <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="text-sm font-medium mb-2">Feux Avant</h3>
                <ImageWithCheckpoints
                  src="/images/vehicle-front.jpeg"
                  alt="Vue avant du véhicule"
                  items={safeLightsFront}
                  updateItems={onUpdateLightsFront}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                  {safeLightsFront.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center p-2 rounded-md cursor-pointer ${
                        item.value === "oui"
                          ? "bg-green-50 border border-green-200"
                          : item.value === "non"
                            ? "bg-red-50 border border-red-200"
                            : "bg-white border"
                      }`}
                      onClick={() => toggleItemValue(safeLightsFront, onUpdateLightsFront, index)}
                    >
                      <div
                        className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${getMarkerColor(
                          item.value,
                        )}`}
                      >
                        {item.value === "oui" && <Check className="h-2 w-2 text-white" />}
                        {item.value === "non" && <X className="h-2 w-2 text-white" />}
                      </div>
                      <span className="text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="rear" className="space-y-4">
            {use3DView ? (
              <Vehicle3DViewer view="rear" items={safeLightsRear} onUpdateItems={onUpdateLightsRear} />
            ) : (
              <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="text-sm font-medium mb-2">Feux Arrière</h3>
                <ImageWithCheckpoints
                  src="/images/vehicle-rear.jpeg"
                  alt="Vue arrière du véhicule"
                  items={safeLightsRear}
                  updateItems={onUpdateLightsRear}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                  {safeLightsRear.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center p-2 rounded-md cursor-pointer ${
                        item.value === "oui"
                          ? "bg-green-50 border border-green-200"
                          : item.value === "non"
                            ? "bg-red-50 border border-red-200"
                            : "bg-white border"
                      }`}
                      onClick={() => toggleItemValue(safeLightsRear, onUpdateLightsRear, index)}
                    >
                      <div
                        className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${getMarkerColor(
                          item.value,
                        )}`}
                      >
                        {item.value === "oui" && <Check className="h-2 w-2 text-white" />}
                        {item.value === "non" && <X className="h-2 w-2 text-white" />}
                      </div>
                      <span className="text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="equipment" className="space-y-4">
            {use3DView ? (
              <Vehicle3DViewer view="interior" items={safeEquipments} onUpdateItems={onUpdateEquipments} />
            ) : (
              <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="text-sm font-medium mb-2">Équipements</h3>
                <ImageWithCheckpoints
                  src="/images/vehicle-interior.jpeg"
                  alt="Vue intérieure du véhicule"
                  items={safeEquipments}
                  updateItems={onUpdateEquipments}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                  {safeEquipments.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center p-2 rounded-md cursor-pointer ${
                        item.value === "oui"
                          ? "bg-green-50 border border-green-200"
                          : item.value === "non"
                            ? "bg-red-50 border border-red-200"
                            : "bg-white border"
                      }`}
                      onClick={() => toggleItemValue(safeEquipments, onUpdateEquipments, index)}
                    >
                      <div
                        className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${getMarkerColor(
                          item.value,
                        )}`}
                      >
                        {item.value === "oui" && <Check className="h-2 w-2 text-white" />}
                        {item.value === "non" && <X className="h-2 w-2 text-white" />}
                      </div>
                      <span className="text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-4 text-xs text-gray-500">
          <p>Cliquez sur les éléments dans la liste ou directement sur l'image pour changer leur état.</p>
          <div className="flex items-center mt-1 space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
              <span>Oui</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
              <span>Non</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gray-300 mr-1"></div>
              <span>Non vérifié</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
