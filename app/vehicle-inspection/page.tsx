import { VehicleInspectionForm } from "@/components/vehicle-inspection-form"
import { VehicleInspectionVisual } from "@/components/vehicle-inspection-visual"

export const metadata = {
  title: "Inspection de Véhicule",
  description: "Formulaire d'inspection technique des véhicules",
}

export default function VehicleInspectionPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Formulaire d'Inspection de Véhicule</h1>
        <p className="text-muted-foreground">Complétez ce formulaire pour enregistrer l'état technique d'un véhicule</p>
      </div>

      <div className="space-y-8">
        <VehicleInspectionVisual />
        <VehicleInspectionForm />
      </div>
    </div>
  )
}

