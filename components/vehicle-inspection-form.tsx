"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Download, Save, RotateCcw } from "lucide-react"
import { SignaturePad } from "@/components/signature-pad"
import { InspectionConfirmation } from "@/components/inspection-confirmation"

type CheckItem = {
  label: string
  value: "oui" | "non" | null
}

export function VehicleInspectionForm() {
  // État pour les sections de vérification
  const [lightsFront, setLightsFront] = useState<CheckItem[]>([
    { label: "Feu de position", value: null },
    { label: "Feu de croisement", value: null },
    { label: "Feu de route", value: null },
    { label: "Clignotants", value: null },
    { label: "Feu de brouillard", value: null },
  ])

  const [lightsRear, setLightsRear] = useState<CheckItem[]>([
    { label: "Feu de stop", value: null },
    { label: "Feu de recul", value: null },
    { label: "Feu de route", value: null },
    { label: "Clignotants", value: null },
    { label: "Feu de plaque", value: null },
    { label: "Feu de brouillard", value: null },
  ])

  const [equipmentFront, setEquipmentFront] = useState<CheckItem[]>([
    { label: "Lot de bord", value: null },
    { label: "Carnet de bord", value: null },
    { label: "Roue de secours", value: null },
    { label: "Crick", value: null },
    { label: "Cône de Lubeck", value: null },
    { label: "Extincteur", value: null },
  ])

  const [equipmentRear, setEquipmentRear] = useState<CheckItem[]>([
    { label: "Constat amiable", value: null },
    { label: "Carte grise", value: null },
    { label: "Attestation assurance", value: null },
    { label: "Fonctionnement radio", value: null },
    { label: "Bouclier", value: null },
    { label: "Cahier remise OPJ", value: null },
  ])

  const [observations, setObservations] = useState("")
  const [agentName, setAgentName] = useState("")
  const [cdeName, setCdeName] = useState("")
  const [vehicleInfo, setVehicleInfo] = useState({
    immatriculation: "",
    date: new Date().toISOString().split("T")[0],
  })

  // État pour les signatures
  const [agentSignature, setAgentSignature] = useState<string | null>(null)
  const [cdeSignature, setCdeSignature] = useState<string | null>(null)

  const [showConfirmation, setShowConfirmation] = useState(false)
  const [submittedInspection, setSubmittedInspection] = useState<{
    id: string
    vehicleInfo: typeof vehicleInfo
    agentName: string
  } | null>(null)

  // Fonction pour mettre à jour les valeurs des éléments à vérifier
  const updateCheckItem = (
    section: CheckItem[],
    setSection: React.Dispatch<React.SetStateAction<CheckItem[]>>,
    index: number,
    value: "oui" | "non",
  ) => {
    const newSection = [...section]
    newSection[index].value = value
    setSection(newSection)
  }

  // Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    setLightsFront(lightsFront.map((item) => ({ ...item, value: null })))
    setLightsRear(lightsRear.map((item) => ({ ...item, value: null })))
    setEquipmentFront(equipmentFront.map((item) => ({ ...item, value: null })))
    setEquipmentRear(equipmentRear.map((item) => ({ ...item, value: null })))
    setObservations("")
    setAgentName("")
    setCdeName("")
    setAgentSignature(null)
    setCdeSignature(null)
    setVehicleInfo({
      immatriculation: "",
      date: new Date().toISOString().split("T")[0],
    })
  }

  // Fonction pour envoyer le formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Vérifier si l'agent a signé
    if (!agentSignature) {
      alert("Veuillez signer le formulaire en tant qu'agent contrôleur avant de l'envoyer.")
      return
    }

    // Générer un ID d'inspection
    const inspectionId = `INS-${new Date().getTime().toString().slice(-6)}`

    // Créer l'objet d'inspection à envoyer
    const inspectionData = {
      id: inspectionId,
      vehicleInfo,
      lightsFront,
      lightsRear,
      equipmentFront,
      equipmentRear,
      observations,
      agentName,
      cdeName,
      agentSignature,
      cdeSignature,
      date: new Date().toISOString(),
      status: "en-attente", // Statut initial: en attente de validation
    }

    // Dans un environnement réel, nous enverions ces données à une API
    // Pour cette démo, nous allons simuler l'envoi et afficher une confirmation
    console.log("Données d'inspection envoyées:", inspectionData)

    // Stocker temporairement dans localStorage pour la démo
    const pendingInspections = JSON.parse(localStorage.getItem("pendingInspections") || "[]")
    pendingInspections.push(inspectionData)
    localStorage.setItem("pendingInspections", JSON.stringify(pendingInspections))

    // Afficher la confirmation
    setSubmittedInspection({
      id: inspectionId,
      vehicleInfo,
      agentName,
    })
    setShowConfirmation(true)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      {/* Logo et informations du véhicule */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 bg-blue-50 p-4 rounded-md shadow-sm">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="mr-3">
            <img src="/images/gpis_gie_logo.jpeg" alt="Logo GPIS GIE" className="h-12 w-auto" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Fiche d'inspection véhicule</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="immatriculation" className="block text-xs font-medium text-gray-700">
              Immatriculation
            </label>
            <Input
              id="immatriculation"
              value={vehicleInfo.immatriculation}
              onChange={(e) => setVehicleInfo({ ...vehicleInfo, immatriculation: e.target.value })}
              placeholder="Ex: GH-351-PY"
              className="h-8 text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="date" className="block text-xs font-medium text-gray-700">
              Date
            </label>
            <Input
              id="date"
              type="date"
              value={vehicleInfo.date}
              onChange={(e) => setVehicleInfo({ ...vehicleInfo, date: e.target.value })}
              className="h-8 text-sm"
              required
            />
          </div>
        </div>
      </div>

      {/* Section FONCTIONNEMENT FEU */}
      <div className="bg-white border rounded-md mb-4 shadow-sm">
        <div className="bg-blue-50 p-2 text-center font-medium border-b rounded-t-md">FONCTIONNEMENT FEU</div>
        <div className="grid grid-cols-2 divide-x">
          {/* Colonne Avant */}
          <div>
            <div className="bg-gray-50 p-1 text-center font-medium border-b">Avant</div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-1 w-1/2"></th>
                  <th className="text-center p-1 w-1/4">oui</th>
                  <th className="text-center p-1 w-1/4">non</th>
                </tr>
              </thead>
              <tbody>
                {lightsFront.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-1">{item.label}</td>
                    <td className="text-center p-1">
                      <input
                        type="radio"
                        name={`light-front-${index}`}
                        checked={item.value === "oui"}
                        onChange={() => updateCheckItem(lightsFront, setLightsFront, index, "oui")}
                        className="h-4 w-4 accent-blue-600"
                        required={item.value === null}
                      />
                    </td>
                    <td className="text-center p-1">
                      <input
                        type="radio"
                        name={`light-front-${index}`}
                        checked={item.value === "non"}
                        onChange={() => updateCheckItem(lightsFront, setLightsFront, index, "non")}
                        className="h-4 w-4 accent-blue-600"
                        required={item.value === null}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Colonne Arrière */}
          <div>
            <div className="bg-gray-50 p-1 text-center font-medium border-b">Arrière</div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-1 w-1/2"></th>
                  <th className="text-center p-1 w-1/4">oui</th>
                  <th className="text-center p-1 w-1/4">non</th>
                </tr>
              </thead>
              <tbody>
                {lightsRear.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-1">{item.label}</td>
                    <td className="text-center p-1">
                      <input
                        type="radio"
                        name={`light-rear-${index}`}
                        checked={item.value === "oui"}
                        onChange={() => updateCheckItem(lightsRear, setLightsRear, index, "oui")}
                        className="h-4 w-4 accent-blue-600"
                        required={item.value === null}
                      />
                    </td>
                    <td className="text-center p-1">
                      <input
                        type="radio"
                        name={`light-rear-${index}`}
                        checked={item.value === "non"}
                        onChange={() => updateCheckItem(lightsRear, setLightsRear, index, "non")}
                        className="h-4 w-4 accent-blue-600"
                        required={item.value === null}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section EQUIPEMENTS */}
      <div className="bg-white border rounded-md mb-4 shadow-sm">
        <div className="bg-blue-50 p-2 text-center font-medium border-b rounded-t-md">EQUIPEMENTS</div>
        <div className="grid grid-cols-2 divide-x">
          {/* Colonne Avant */}
          <div>
            <div className="bg-gray-50 p-1 text-center font-medium border-b">Avant</div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-1 w-1/2"></th>
                  <th className="text-center p-1 w-1/4">oui</th>
                  <th className="text-center p-1 w-1/4">non</th>
                </tr>
              </thead>
              <tbody>
                {equipmentFront.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-1">{item.label}</td>
                    <td className="text-center p-1">
                      <input
                        type="radio"
                        name={`equipment-front-${index}`}
                        checked={item.value === "oui"}
                        onChange={() => updateCheckItem(equipmentFront, setEquipmentFront, index, "oui")}
                        className="h-4 w-4 accent-blue-600"
                        required={item.value === null}
                      />
                    </td>
                    <td className="text-center p-1">
                      <input
                        type="radio"
                        name={`equipment-front-${index}`}
                        checked={item.value === "non"}
                        onChange={() => updateCheckItem(equipmentFront, setEquipmentFront, index, "non")}
                        className="h-4 w-4 accent-blue-600"
                        required={item.value === null}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Colonne Arrière */}
          <div>
            <div className="bg-gray-50 p-1 text-center font-medium border-b">Arrière</div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-1 w-1/2"></th>
                  <th className="text-center p-1 w-1/4">oui</th>
                  <th className="text-center p-1 w-1/4">non</th>
                </tr>
              </thead>
              <tbody>
                {equipmentRear.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-1">{item.label}</td>
                    <td className="text-center p-1">
                      <input
                        type="radio"
                        name={`equipment-rear-${index}`}
                        checked={item.value === "oui"}
                        onChange={() => updateCheckItem(equipmentRear, setEquipmentRear, index, "oui")}
                        className="h-4 w-4 accent-blue-600"
                        required={item.value === null}
                      />
                    </td>
                    <td className="text-center p-1">
                      <input
                        type="radio"
                        name={`equipment-rear-${index}`}
                        checked={item.value === "non"}
                        onChange={() => updateCheckItem(equipmentRear, setEquipmentRear, index, "non")}
                        className="h-4 w-4 accent-blue-600"
                        required={item.value === null}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section CONSTATATIONS/OBSERVATIONS DIVERSES */}
      <div className="bg-white border rounded-md mb-4 shadow-sm">
        <div className="bg-blue-50 p-2 text-center font-medium border-b rounded-t-md">
          CONSTATATIONS/OBSERVATIONS DIVERSES*
        </div>
        <div className="p-2">
          <Textarea
            placeholder="Saisissez vos observations ici..."
            className="min-h-[150px] text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">* notifier seulement les nouvelles dégradations constatées</p>
        </div>
      </div>

      {/* Section Signatures */}
      <div className="bg-white border rounded-md mb-4 shadow-sm">
        <div className="bg-blue-50 p-2 text-center font-medium border-b rounded-t-md">SIGNATURES</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {/* Signature Agent Contrôleur */}
          <div className="border rounded-md p-3">
            <h3 className="text-sm font-medium mb-2">Signature agent contrôleur :</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="agent-name" className="block text-xs text-gray-600 mb-1">
                  Nom et prénom
                </label>
                <Input
                  id="agent-name"
                  placeholder="Nom et prénom de l'agent"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="h-8 text-sm"
                  required
                />
              </div>
              <SignaturePad onSignatureChange={setAgentSignature} label="Signature" />
            </div>
          </div>

          {/* Signature CDE */}
          <div className="border rounded-md p-3">
            <h3 className="text-sm font-medium mb-2">Signature CDE :</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="cde-name" className="block text-xs text-gray-600 mb-1">
                  Nom et prénom du CDE
                </label>
                <Input
                  id="cde-name"
                  placeholder="Nom et prénom du CDE"
                  value={cdeName}
                  onChange={(e) => setCdeName(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <SignaturePad onSignatureChange={setCdeSignature} label="Signature" />
              <p className="text-xs text-gray-500 italic">
                Note: La signature du CDE est optionnelle et peut être ajoutée ultérieurement.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" size="sm" className="bg-white hover:bg-gray-50">
          <Download className="mr-2 h-4 w-4" />
          Exporter PDF
        </Button>
        <div className="space-x-2">
          <Button type="button" variant="outline" size="sm" onClick={resetForm} className="bg-white hover:bg-gray-50">
            <RotateCcw className="mr-2 h-4 w-4" />
            Réinitialiser
          </Button>
          <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Save className="mr-2 h-4 w-4" />
            Envoyer pour validation
          </Button>
        </div>
      </div>
      {showConfirmation && submittedInspection && (
        <InspectionConfirmation
          inspectionId={submittedInspection.id}
          vehicleInfo={submittedInspection.vehicleInfo}
          agentName={submittedInspection.agentName}
        />
      )}
    </form>
  )
}

