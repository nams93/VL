"use client"

import { useState } from "react"
import { VehicleInspection3D } from "@/components/vehicle-inspection-3d"
import { useRouter } from "next/navigation"

export default function VehicleInspectionPage() {
  const router = useRouter()
  const [inspectionCompleted, setInspectionCompleted] = useState(false)

  // Fonction pour gérer la complétion de l'inspection
  const handleInspectionComplete = (inspectionData: any, licensePlate: string) => {
    console.log("Inspection complétée:", inspectionData, "Plaque:", licensePlate)
    setInspectionCompleted(true)
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <h1 className="text-2xl font-bold mb-4">Inspection du Véhicule</h1>

      {/* Composant d'inspection */}
      <VehicleInspection3D onComplete={handleInspectionComplete} />
    </div>
  )
}
