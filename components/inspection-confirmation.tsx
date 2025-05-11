"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function InspectionConfirmation({
  inspectionId,
  vehicleInfo,
  agentName,
}: {
  inspectionId: string
  vehicleInfo: { immatriculation: string; date: string }
  agentName: string
}) {
  const router = useRouter()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Inspection enregistrée avec succès</h3>
          <div className="mt-3">
            <p className="text-sm text-gray-500">
              L'inspection du véhicule <span className="font-medium">{vehicleInfo.immatriculation}</span> a été
              enregistrée avec succès.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Numéro de référence: <span className="font-medium">{inspectionId}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Agent: <span className="font-medium">{agentName}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Date: <span className="font-medium">{vehicleInfo.date}</span>
            </p>
            <p className="text-sm text-blue-600 mt-3">
              Vous pourrez revenir sur cette fiche ultérieurement pour apporter des modifications si nécessaire.
            </p>
          </div>
          <div className="mt-5 flex flex-col gap-3">
            <Button
              type="button"
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => router.push("/radio-equipment")}
            >
              Passer à la perception radio
            </Button>
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-sm"
              onClick={() => (window.location.href = "/")}
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
