"use client"

import { useState, useRef } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Html, Environment, PerspectiveCamera } from "@react-three/drei"
import { Suspense } from "react"
import { Check, X, Plus } from "lucide-react"
import type * as THREE from "three"

// Type pour les points d'inspection
type InspectionPoint = {
  id: string
  label: string
  value: "oui" | "non" | null
  position: [number, number, number] // Position 3D [x, y, z]
  category: "exterior" | "interior" | "equipment"
}

// Type pour les props du composant
type Vehicle3DViewerAdvancedProps = {
  inspectionPoints: InspectionPoint[]
  onUpdatePoint: (id: string, value: "oui" | "non" | null) => void
  onSelectPoint?: (id: string) => void
  xRayMode?: boolean
  activeCategory?: string
}

// Composant pour le modèle 3D du véhicule
function VehicleModel({
  inspectionPoints,
  onUpdatePoint,
  onSelectPoint,
  xRayMode = true,
  activeCategory,
}: Vehicle3DViewerAdvancedProps) {
  const { camera } = useThree()
  const groupRef = useRef<THREE.Group>(null)

  // Filtrer les points par catégorie active
  const filteredPoints = activeCategory
    ? inspectionPoints.filter((point) => point.category === activeCategory)
    : inspectionPoints

  // Obtenir la couleur du marqueur en fonction de la valeur
  const getMarkerColor = (value: "oui" | "non" | null) => {
    switch (value) {
      case "oui":
        return "#10b981" // green-500
      case "non":
        return "#ef4444" // red-500
      default:
        return "#ffffff" // white
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
        return <Plus className="h-3 w-3 text-gray-800" />
    }
  }

  // Animation subtile pour le modèle
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.02
    }
  })

  return (
    <group ref={groupRef}>
      {/* Modèle 3D du véhicule (pour l'exemple, nous utilisons une boîte stylisée) */}
      <group>
        {/* Carrosserie */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 1, 5]} />
          <meshPhysicalMaterial
            color="#3b82f6"
            metalness={0.8}
            roughness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.2}
            opacity={xRayMode ? 0.7 : 1}
            transparent={true}
          />
        </mesh>

        {/* Toit */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[2.2, 0.6, 3.5]} />
          <meshPhysicalMaterial
            color="#3b82f6"
            metalness={0.8}
            roughness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.2}
            opacity={xRayMode ? 0.5 : 1}
            transparent={true}
          />
        </mesh>

        {/* Vitres */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[2.1, 0.5, 3.4]} />
          <meshPhysicalMaterial
            color="#111827"
            metalness={0.1}
            roughness={0.1}
            transmission={0.9}
            opacity={0.7}
            transparent={true}
          />
        </mesh>

        {/* Phares avant */}
        <mesh position={[0.8, 0, 2.4]} castShadow>
          <boxGeometry args={[0.4, 0.3, 0.1]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={xRayMode ? 1 : 0.2} />
        </mesh>
        <mesh position={[-0.8, 0, 2.4]} castShadow>
          <boxGeometry args={[0.4, 0.3, 0.1]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={xRayMode ? 1 : 0.2} />
        </mesh>

        {/* Feux arrière */}
        <mesh position={[0.8, 0, -2.4]} castShadow>
          <boxGeometry args={[0.4, 0.3, 0.1]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={xRayMode ? 1 : 0.2} />
        </mesh>
        <mesh position={[-0.8, 0, -2.4]} castShadow>
          <boxGeometry args={[0.4, 0.3, 0.1]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={xRayMode ? 1 : 0.2} />
        </mesh>

        {/* Roues */}
        <mesh position={[1.3, -0.5, 1.5]} rotation={[Math.PI / 2, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.3, 32]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        <mesh position={[-1.3, -0.5, 1.5]} rotation={[Math.PI / 2, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.3, 32]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        <mesh position={[1.3, -0.5, -1.5]} rotation={[Math.PI / 2, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.3, 32]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        <mesh position={[-1.3, -0.5, -1.5]} rotation={[Math.PI / 2, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.3, 32]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>

        {/* Intérieur (visible en mode rayons X) */}
        {xRayMode && (
          <>
            {/* Sièges */}
            <mesh position={[0.5, 0.1, 0.5]} castShadow>
              <boxGeometry args={[0.8, 0.8, 0.8]} />
              <meshStandardMaterial color="#374151" />
            </mesh>
            <mesh position={[-0.5, 0.1, 0.5]} castShadow>
              <boxGeometry args={[0.8, 0.8, 0.8]} />
              <meshStandardMaterial color="#374151" />
            </mesh>
            <mesh position={[0.5, 0.1, -0.8]} castShadow>
              <boxGeometry args={[0.8, 0.8, 0.8]} />
              <meshStandardMaterial color="#374151" />
            </mesh>
            <mesh position={[-0.5, 0.1, -0.8]} castShadow>
              <boxGeometry args={[0.8, 0.8, 0.8]} />
              <meshStandardMaterial color="#374151" />
            </mesh>

            {/* Tableau de bord */}
            <mesh position={[0, 0.3, 1.5]} castShadow>
              <boxGeometry args={[2, 0.4, 0.5]} />
              <meshStandardMaterial color="#1f2937" />
            </mesh>
          </>
        )}
      </group>

      {/* Points d'inspection */}
      {filteredPoints.map((point) => (
        <Html
          key={point.id}
          position={point.position}
          style={{
            pointerEvents: "auto",
            cursor: "pointer",
          }}
          distanceFactor={10}
          occlude
        >
          <div
            className="w-8 h-8 flex items-center justify-center rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-110"
            style={{
              backgroundColor: getMarkerColor(point.value),
              border: "2px solid white",
            }}
            onClick={() => {
              onUpdatePoint(point.id, point.value === null ? "oui" : point.value === "oui" ? "non" : null)
              if (onSelectPoint) onSelectPoint(point.id)
            }}
            title={point.label}
          >
            {getMarkerIcon(point.value)}
          </div>
        </Html>
      ))}
    </group>
  )
}

// Composant principal pour la visualisation 3D avancée
export function Vehicle3DViewerAdvanced({
  inspectionPoints,
  onUpdatePoint,
  onSelectPoint,
  xRayMode = true,
  activeCategory,
}: Vehicle3DViewerAdvancedProps) {
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([4, 2, 4])

  // Préréglages de caméra
  const cameraPresets = {
    front: [0, 1, 6] as [number, number, number],
    rear: [0, 1, -6] as [number, number, number],
    side: [6, 1, 0] as [number, number, number],
    top: [0, 6, 0] as [number, number, number],
    interior: [0, 1, 0] as [number, number, number],
  }

  return (
    <div className="relative w-full h-[500px] bg-gradient-to-b from-blue-900 to-black rounded-md overflow-hidden border border-blue-500">
      {/* Contrôles de caméra */}
      <div className="absolute top-4 left-4 z-10 flex space-x-2">
        {Object.entries(cameraPresets).map(([name, position]) => (
          <button
            key={name}
            className="px-3 py-1 bg-blue-600 bg-opacity-70 text-white rounded-md text-sm hover:bg-opacity-100 transition-all"
            onClick={() => setCameraPosition(position)}
          >
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </button>
        ))}
      </div>

      {/* Mode rayons X */}
      <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
        <span className="text-white text-sm">Mode rayons X</span>
        <button
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
            xRayMode ? "bg-blue-600" : "bg-gray-200"
          }`}
          onClick={() => onUpdatePoint("xRayMode", xRayMode ? null : "oui")}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              xRayMode ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Légende */}
      <div className="absolute bottom-4 right-4 z-10 bg-black bg-opacity-50 p-2 rounded-md">
        <div className="flex items-center space-x-4 text-white text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-white border border-white mr-1"></div>
            <span>Non vérifié</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 border border-white mr-1"></div>
            <span>OK</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 border border-white mr-1"></div>
            <span>Problème</span>
          </div>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center text-white">Chargement du modèle 3D...</div>
        }
      >
        <Canvas shadows dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={cameraPosition} fov={45} />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <spotLight position={[-10, 10, -10]} angle={0.15} penumbra={1} intensity={0.5} castShadow />
          <VehicleModel
            inspectionPoints={inspectionPoints}
            onUpdatePoint={onUpdatePoint}
            onSelectPoint={onSelectPoint}
            xRayMode={xRayMode}
            activeCategory={activeCategory}
          />
          <OrbitControls enablePan={true} enableZoom={true} minDistance={2} maxDistance={20} target={[0, 0, 0]} />
          <Environment preset="city" />
          <fog attach="fog" args={["#172554", 10, 30]} />
        </Canvas>
      </Suspense>
    </div>
  )
}
