"use client"

import { VehicleInspectionForm } from "@/components/vehicle-inspection-form"
import { VehiclePhotoCapture } from "@/components/vehicle-photo-capture"
import { SyncStatus } from "@/components/sync-status"
import { OfflineMode } from "@/components/offline-mode"
import { useState } from "react"
import { v4 as uuidv4 } from "uuid"

export default function VehicleInspectionPage() {
  const [inspectionId] = useState(`inspection-${uuidv4()}`)
  const [vehicleId, setVehicleId] = useState("")

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Inspection de Véhicule</h1>

      {/* Afficher le mode hors ligne si nécessaire */}
      <OfflineMode />

      {/* Afficher l'état de synchronisation */}
      <SyncStatus />

      <VehicleInspectionForm onVehicleIdChange={(id) => setVehicleId(id)} />

      {vehicleId && <VehiclePhotoCapture inspectionId={inspectionId} vehicleId={vehicleId} />}
    </div>
  )
}
