import { VehicleInspectionForm } from "@/components/vehicle-inspection-form"

export default function Home() {
  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="container mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-xl font-bold mb-4 text-center">Formulaire d'Inspection de Véhicule</h1>
          <VehicleInspectionForm />
        </div>
      </div>
    </div>
  )
}

