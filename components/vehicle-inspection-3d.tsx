"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { VehicleInspectionInteractive } from "@/components/vehicle-inspection-interactive"
import { VehicleInspectionForm } from "@/components/vehicle-inspection-form"

type VehicleInspection3DProps = {
  onComplete: (data: any, licensePlate: string) => void
}

export function VehicleInspection3D({ onComplete }: VehicleInspection3DProps) {
  // État pour stocker les données d'inspection
  const [licensePlate, setLicensePlate] = useState("")
  const [mileage, setMileage] = useState("")
  const [notes, setNotes] = useState("")
  const [step, setStep] = useState(1)

  // États pour les éléments à vérifier
  const [lightsFront, setLightsFront] = useState([
    { label: "Phares", value: null },
    { label: "Clignotants", value: null },
    { label: "Feux de position", value: null },
    { label: "Feux antibrouillard", value: null },
  ])

  const [lightsRear, setLightsRear] = useState([
    { label: "Feux arrière", value: null },
    { label: "Feux stop", value: null },
    { label: "Clignotants", value: null },
    { label: "Feux de recul", value: null },
    { label: "Éclairage plaque", value: null },
  ])

  const [equipments, setEquipments] = useState([
    { label: "Gilet de sécurité", value: null },
    { label: "Triangle", value: null },
    { label: "Trousse de secours", value: null },
    { label: "Extincteur", value: null },
    { label: "Radio", value: null },
    { label: "GPS", value: null },
  ])

  // Fonction pour passer à l'étape suivante
  const nextStep = () => {
    setStep(step + 1)
  }

  // Fonction pour revenir à l'étape précédente
  const prevStep = () => {
    setStep(step - 1)
  }

  // Fonction pour soumettre l'inspection
  const submitInspection = () => {
    const inspectionData = {
      licensePlate,
      mileage,
      notes,
      lightsFront,
      lightsRear,
      equipments,
      timestamp: new Date().toISOString(),
    }

    onComplete(inspectionData, licensePlate)
  }

  // Vérifier si tous les éléments ont été inspectés
  const allItemsChecked = () => {
    const allItems = [...lightsFront, ...lightsRear, ...equipments]
    return allItems.every((item) => item.value !== null)
  }

  // Afficher l'étape appropriée
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Informations du véhicule</h2>
              <p className="text-gray-600 mb-4">Veuillez saisir les informations de base du véhicule.</p>

              <VehicleInspectionForm
                licensePlate={licensePlate}
                setLicensePlate={setLicensePlate}
                mileage={mileage}
                setMileage={setMileage}
                notes={notes}
                setNotes={setNotes}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={nextStep} disabled={!licensePlate}>
                Continuer
              </Button>
            </div>
          </>
        )
      case 2:
        return (
          <>
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Inspection visuelle</h2>
              <p className="text-gray-600 mb-4">
                Vérifiez l'état des éléments suivants. Cliquez sur les points d'inspection pour changer leur état.
              </p>

              <VehicleInspectionInteractive
                lightsFront={lightsFront}
                lightsRear={lightsRear}
                equipments={equipments}
                onUpdateLightsFront={setLightsFront}
                onUpdateLightsRear={setLightsRear}
                onUpdateEquipments={setEquipments}
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                Retour
              </Button>
              <Button onClick={nextStep} disabled={!allItemsChecked()}>
                Continuer
              </Button>
            </div>
          </>
        )
      case 3:
        return (
          <>
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Confirmation</h2>
              <p className="text-gray-600 mb-4">Veuillez vérifier les informations avant de soumettre l'inspection.</p>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Informations du véhicule</h3>
                  <p>
                    <span className="font-medium">Plaque d'immatriculation:</span> {licensePlate}
                  </p>
                  <p>
                    <span className="font-medium">Kilométrage:</span> {mileage} km
                  </p>
                  {notes && (
                    <p>
                      <span className="font-medium">Notes:</span> {notes}
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Résumé de l'inspection</h3>
                  <p>
                    <span className="font-medium">Éléments vérifiés:</span>{" "}
                    {lightsFront.length + lightsRear.length + equipments.length}
                  </p>
                  <p>
                    <span className="font-medium">Éléments OK:</span>{" "}
                    {[...lightsFront, ...lightsRear, ...equipments].filter((item) => item.value === "oui").length}
                  </p>
                  <p>
                    <span className="font-medium">Éléments à vérifier:</span>{" "}
                    {[...lightsFront, ...lightsRear, ...equipments].filter((item) => item.value === "non").length}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                Retour
              </Button>
              <Button onClick={submitInspection}>Soumettre l'inspection</Button>
            </div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1 ? "bg-blue-600" : "bg-gray-300"
                } text-white font-medium mr-2`}
              >
                1
              </div>
              <span className={`${step >= 1 ? "text-blue-600 font-medium" : "text-gray-500"}`}>Informations</span>
            </div>
            <div className="h-0.5 w-12 bg-gray-200 mx-2"></div>
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2 ? "bg-blue-600" : "bg-gray-300"
                } text-white font-medium mr-2`}
              >
                2
              </div>
              <span className={`${step >= 2 ? "text-blue-600 font-medium" : "text-gray-500"}`}>Inspection</span>
            </div>
            <div className="h-0.5 w-12 bg-gray-200 mx-2"></div>
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 3 ? "bg-blue-600" : "bg-gray-300"
                } text-white font-medium mr-2`}
              >
                3
              </div>
              <span className={`${step >= 3 ? "text-blue-600 font-medium" : "text-gray-500"}`}>Confirmation</span>
            </div>
          </div>
        </div>

        {renderStep()}
      </CardContent>
    </Card>
  )
}
