"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Suspense } from "react"
import { Check, X, AlertCircle } from "lucide-react"
import type * as THREE from "three"

// Type pour les éléments à vérifier
type CheckItem = {
  label: string
  value: "oui" | "non" | null
}

// Type pour les props du composant
type Vehicle3DViewerProps = {
  view: "front" | "rear" | "interior"
  items: CheckItem[]
  onUpdateItems: (items: CheckItem[]) => void
}

// Composant pour le modèle 3D du véhicule (simplifié)
function VehicleModel({ view }: { view: "front" | "rear" | "interior" }) {
  const boxRef = useRef<THREE.Mesh>(null)

  // Animation simple pour le modèle
  useFrame((state) => {
    if (boxRef.current) {
      boxRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1
    }
  })

  // Couleur en fonction de la vue
  const color = view === "front" ? "#3b82f6" : view === "rear" ? "#ef4444" : "#10b981"

  return (
    <mesh ref={boxRef} position={[0, 0, 0]}>
      <boxGeometry args={[2, 1, 4]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

// Composant principal pour la visualisation 3D (simplifié)
export function Vehicle3DViewer({ view, items, onUpdateItems }: Vehicle3DViewerProps) {
  // Fonction pour mettre à jour la valeur d'un élément
  const toggleItemValue = (index: number) => {
    const newItems = [...items]
    if (newItems[index].value === null) {
      newItems[index].value = "oui"
    } else if (newItems[index].value === "oui") {
      newItems[index].value = "non"
    } else {
      newItems[index].value = null
    }
    onUpdateItems(newItems)
  }

  // Obtenir la couleur du marqueur en fonction de la valeur
  const getMarkerColor = (value: "oui" | "non" | null) => {
    switch (value) {
      case "oui":
        return "#10b981" // green-500
      case "non":
        return "#ef4444" // red-500
      default:
        return "#d1d5db" // gray-300
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

  return (
    <div className="w-full h-64 bg-gray-100 rounded-md overflow-hidden border">
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <Suspense
            fallback={<div className="w-full h-full flex items-center justify-center">Chargement du modèle 3D...</div>}
          >
            <Canvas>
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
              <VehicleModel view={view} />
              <OrbitControls enablePan={false} minDistance={2} maxDistance={10} />
            </Canvas>
          </Suspense>
        </div>
        <div className="p-2 bg-gray-50">
          <div className="grid grid-cols-3 gap-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center p-2 rounded-md cursor-pointer border"
                onClick={() => toggleItemValue(index)}
              >
                <div
                  className="w-4 h-4 rounded-full mr-2 flex items-center justify-center"
                  style={{ backgroundColor: getMarkerColor(item.value) }}
                >
                  {getMarkerIcon(item.value)}
                </div>
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
