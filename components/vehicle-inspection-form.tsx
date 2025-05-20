"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Save, RotateCcw, AlertTriangle } from "lucide-react"
import { SignaturePad } from "@/components/signature-pad"
import { InspectionConfirmation } from "@/components/inspection-confirmation"
import { VehicleInspectionInteractive } from "@/components/vehicle-inspection-interactive"
import { VehicleFunctionBadge } from "@/components/vehicle-function-badge"
import { useToast } from "@/hooks/use-toast"
import { vehiclesData, getAllVehicles } from "@/lib/vehicle-data"

// Importer le service d'authentification
import { authService } from "@/lib/auth-service"

type CheckItem = {
  label: string
  value: "oui" | "non" | null
  position?: { x: number; y: number }
}

export function VehicleInspectionForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [formId, setFormId] = useState<string>("")
  const [isAuthorized, setIsAuthorized] = useState(true)
  const [currentAgent, setCurrentAgent] = useState<any>(null)
  const [showClassicForm, setShowClassicForm] = useState(false)

  // État pour les sections de vérification
  const [lightsFront, setLightsFront] = useState<CheckItem[]>([
    { label: "Feu de position", value: null },
    { label: "Feu de croisement", value: null },
    { label: "Clignotants", value: null },
  ])

  const [lightsRear, setLightsRear] = useState<CheckItem[]>([
    { label: "Feu de stop", value: null },
    { label: "Feu de recul", value: null },
    { label: "Clignotants", value: null },
  ])

  const [equipments, setEquipments] = useState<CheckItem[]>([
    { label: "Carnet de bord", value: null },
    { label: "Extincteur", value: null },
    { label: "Cahier remise OPJ", value: null },
  ])

  const [observations, setObservations] = useState("")
  const [agentName, setAgentName] = useState("")
  const [cdeName, setCdeName] = useState("")
  const [vehicleInfo, setVehicleInfo] = useState({
    immatriculation: "",
    date: new Date().toISOString().split("T")[0],
  })
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("")

  // État pour les signatures
  const [agentSignature, setAgentSignature] = useState<string | null>(null)
  const [cdeSignature, setCdeSignature] = useState<string | null>(null)

  const [showConfirmation, setShowConfirmation] = useState(false)
  const [submittedInspection, setSubmittedInspection] = useState<{
    id: string
    vehicleInfo: typeof vehicleInfo
    agentName: string
  } | null>(null)

  // Vérifier l'authentification au chargement du composant
  useEffect(() => {
    const agent = authService.getCurrentAgent()

    // Si aucun agent n'est connecté, rediriger vers la page d'accueil
    if (!agent) {
      router.push("/")
      return
    }

    setCurrentAgent(agent)
    setAgentName(agent.name)

    // Générer un ID d'inspection
    const newFormId = `INS-${new Date().getTime().toString().slice(-6)}`
    setFormId(newFormId)
  }, [router])

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
    setEquipments(equipments.map((item) => ({ ...item, value: null })))
    setObservations("")
    setCdeName("")
    setAgentSignature(null)
    setCdeSignature(null)
    setVehicleInfo({
      immatriculation: "",
      date: new Date().toISOString().split("T")[0],
    })
    setSelectedVehicleId("")
  }

  // Fonction pour gérer le changement de véhicule
  const handleVehicleChange = (value: string) => {
    setSelectedVehicleId(value)
    if (value && vehiclesData[value]) {
      const vehicle = vehiclesData[value]
      setVehicleInfo({
        ...vehicleInfo,
        immatriculation: vehicle.immatriculation,
      })

      // Notification pour la fonction du véhicule
      toast({
        title: `Véhicule ${vehicle.immatriculation} sélectionné`,
        description: `Fonction: ${vehicle.fonction} - Kilométrage: ${vehicle.kilometrage} km`,
        variant:
          vehicle.fonction === "PATROUILLE"
            ? "default"
            : vehicle.fonction === "K9"
              ? "success"
              : vehicle.fonction === "ASTREINTE"
                ? "warning"
                : vehicle.fonction === "DG"
                  ? "destructive"
                  : "secondary",
      })
    }
  }

  // Fonction pour envoyer le formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Vérifier si l'agent a signé
    if (!agentSignature) {
      alert("Veuillez signer le formulaire en tant qu'agent contrôleur avant de l'envoyer.")
      return
    }

    // Vérifier si la plaque d'immatriculation est renseignée
    if (!vehicleInfo.immatriculation) {
      alert("Veuillez saisir la plaque d'immatriculation du véhicule.")
      return
    }

    // Enregistrer le formulaire avec la plaque d'immatriculation
    authService.registerForm(formId, "inspection", vehicleInfo.immatriculation)

    // Créer l'objet d'inspection à envoyer
    const inspectionData = {
      id: formId,
      vehicleInfo,
      lightsFront,
      lightsRear,
      equipments,
      observations,
      agentName,
      agentId: currentAgent?.id || "",
      cdeName,
      agentSignature,
      cdeSignature,
      date: new Date().toISOString(),
      status: "en-attente", // Statut initial: en attente de validation
    }

    // Stocker dans localStorage pour la persistance des données
    const pendingInspections = JSON.parse(localStorage.getItem("pendingInspections") || "[]")
    pendingInspections.push(inspectionData)
    localStorage.setItem("pendingInspections", JSON.stringify(pendingInspections))

    console.log("Inspection enregistrée:", inspectionData)

    // Afficher la confirmation
    setSubmittedInspection({
      id: formId,
      vehicleInfo,
      agentName,
    })
    setShowConfirmation(true)
  }

  // Si aucun agent n'est connecté, ne rien afficher (la redirection se fera via useEffect)
  if (!currentAgent) {
    return null
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      {/* Logo et informations du véhicule */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 bg-blue-50 dark:bg-blue-950 p-4 rounded-md shadow-sm">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="mr-3">
            <img src="/images/gpis_gie_logo.jpeg" alt="Logo GPIS GIE" className="h-12 w-auto" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Fiche d'inspection véhicule</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="vehicle-select" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Véhicule
            </label>
            <Select value={selectedVehicleId} onValueChange={handleVehicleChange}>
              <SelectTrigger id="vehicle-select" className="h-8 text-sm">
                <SelectValue placeholder="Sélectionner un véhicule" />
              </SelectTrigger>
              <SelectContent>
                {getAllVehicles().map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{vehicle.immatriculation}</span>
                      <VehicleFunctionBadge fonction={vehicle.fonction} size="sm" className="ml-2" />
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="date" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
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

      {/* Bandeau d'information sur l'agent */}
      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md mb-4 flex items-center">
        <div className="mr-2 bg-blue-100 dark:bg-blue-900 rounded-full p-1">
          <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <span className="font-medium">Agent connecté:</span> {currentAgent.name} (ID: {currentAgent.id})
        </div>
      </div>

      {/* Interface visuelle interactive */}
      <VehicleInspectionInteractive
        lightsFront={lightsFront}
        lightsRear={lightsRear}
        equipments={equipments}
        onUpdateLightsFront={setLightsFront}
        onUpdateLightsRear={setLightsRear}
        onUpdateEquipments={setEquipments}
      />

      {/* Bouton pour basculer vers le formulaire classique */}
      <div className="mb-4 flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowClassicForm(!showClassicForm)}
          className="text-xs"
        >
          {showClassicForm ? "Masquer le formulaire détaillé" : "Afficher le formulaire détaillé"}
        </Button>
      </div>

      {/* Formulaire classique (optionnel) */}
      {showClassicForm && (
        <>
          {/* Section FONCTIONNEMENT FEU */}
          <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md mb-4 shadow-sm">
            <div className="bg-blue-50 dark:bg-blue-950 p-2 text-center font-medium border-b dark:border-gray-700 rounded-t-md">
              FONCTIONNEMENT FEU
            </div>
            <div className="grid grid-cols-2 divide-x dark:divide-gray-700">
              {/* Colonne Avant */}
              <div>
                <div className="bg-gray-50 dark:bg-gray-900 p-1 text-center font-medium border-b dark:border-gray-700">
                  Avant
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                      <th className="text-left p-1 w-1/2"></th>
                      <th className="text-center p-1 w-1/4">oui</th>
                      <th className="text-center p-1 w-1/4">non</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lightsFront.map((item, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900"}
                      >
                        <td className="p-1">{item.label}</td>
                        <td className="text-center p-1">
                          <div
                            onClick={() => updateCheckItem(lightsFront, setLightsFront, index, "oui")}
                            className={`h-5 w-5 rounded-full border-2 flex items-center justify-center cursor-pointer ${
                              item.value === "oui"
                                ? "border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-900"
                                : "border-gray-300 dark:border-gray-600"
                            }`}
                          >
                            {item.value === "oui" && (
                              <div className="h-3 w-3 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                            )}
                          </div>
                        </td>
                        <td className="text-center p-1">
                          <div
                            onClick={() => updateCheckItem(lightsFront, setLightsFront, index, "non")}
                            className={`h-5 w-5 rounded-full border-2 flex items-center justify-center cursor-pointer ${
                              item.value === "non"
                                ? "border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-900"
                                : "border-gray-300 dark:border-gray-600"
                            }`}
                          >
                            {item.value === "non" && (
                              <div className="h-3 w-3 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Colonne Arrière */}
              <div>
                <div className="bg-gray-50 dark:bg-gray-900 p-1 text-center font-medium border-b dark:border-gray-700">
                  Arrière
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                      <th className="text-left p-1 w-1/2"></th>
                      <th className="text-center p-1 w-1/4">oui</th>
                      <th className="text-center p-1 w-1/4">non</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lightsRear.map((item, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900"}
                      >
                        <td className="p-1">{item.label}</td>
                        <td className="text-center p-1">
                          <div
                            onClick={() => updateCheckItem(lightsRear, setLightsRear, index, "oui")}
                            className={`h-5 w-5 rounded-full border-2 flex items-center justify-center cursor-pointer ${
                              item.value === "oui"
                                ? "border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-900"
                                : "border-gray-300 dark:border-gray-600"
                            }`}
                          >
                            {item.value === "oui" && (
                              <div className="h-3 w-3 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                            )}
                          </div>
                        </td>
                        <td className="text-center p-1">
                          <div
                            onClick={() => updateCheckItem(lightsRear, setLightsRear, index, "non")}
                            className={`h-5 w-5 rounded-full border-2 flex items-center justify-center cursor-pointer ${
                              item.value === "non"
                                ? "border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-900"
                                : "border-gray-300 dark:border-gray-600"
                            }`}
                          >
                            {item.value === "non" && (
                              <div className="h-3 w-3 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section EQUIPEMENTS */}
          <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md mb-4 shadow-sm">
            <div className="bg-blue-50 dark:bg-blue-950 p-2 text-center font-medium border-b dark:border-gray-700 rounded-t-md">
              EQUIPEMENTS
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <th className="text-left p-1 w-1/2"></th>
                  <th className="text-center p-1 w-1/4">oui</th>
                  <th className="text-center p-1 w-1/4">non</th>
                </tr>
              </thead>
              <tbody>
                {equipments.map((item, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900"}
                  >
                    <td className="p-1">{item.label}</td>
                    <td className="text-center p-1">
                      <div
                        onClick={() => updateCheckItem(equipments, setEquipments, index, "oui")}
                        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center cursor-pointer ${
                          item.value === "oui"
                            ? "border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-900"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {item.value === "oui" && (
                          <div className="h-3 w-3 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                        )}
                      </div>
                    </td>
                    <td className="text-center p-1">
                      <div
                        onClick={() => updateCheckItem(equipments, setEquipments, index, "non")}
                        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center cursor-pointer ${
                          item.value === "non"
                            ? "border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-900"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {item.value === "non" && (
                          <div className="h-3 w-3 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Section CONSTATATIONS/OBSERVATIONS DIVERSES */}
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md mb-4 shadow-sm">
        <div className="bg-blue-50 dark:bg-blue-950 p-2 text-center font-medium border-b dark:border-gray-700 rounded-t-md">
          CONSTATATIONS/OBSERVATIONS DIVERSES*
        </div>
        <div className="p-2">
          <Textarea
            placeholder="Saisissez vos observations ici..."
            className="min-h-[150px] text-sm border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-100"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            * notifier seulement les nouvelles dégradations constatées
          </p>
        </div>
      </div>

      {/* Section Signatures */}
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md mb-4 shadow-sm">
        <div className="bg-blue-50 dark:bg-blue-950 p-2 text-center font-medium border-b dark:border-gray-700 rounded-t-md">
          SIGNATURES
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {/* Signature Agent Contrôleur */}
          <div className="border dark:border-gray-700 rounded-md p-3">
            <h3 className="text-sm font-medium mb-2">Signature agent contrôleur :</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="agent-name" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Nom et prénom
                </label>
                <Input
                  id="agent-name"
                  placeholder="Nom et prénom de l'agent"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="h-8 text-sm dark:bg-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <SignaturePad onSignatureChange={setAgentSignature} label="Signature" />
            </div>
          </div>

          {/* Signature CDE */}
          <div className="border dark:border-gray-700 rounded-md p-3">
            <h3 className="text-sm font-medium mb-2">Signature CDE :</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="cde-name" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Nom et prénom du CDE
                </label>
                <Input
                  id="cde-name"
                  placeholder="Nom et prénom du CDE"
                  value={cdeName}
                  onChange={(e) => setCdeName(e.target.value)}
                  className="h-8 text-sm dark:bg-gray-900 dark:text-gray-100"
                />
              </div>
              <SignaturePad onSignatureChange={setCdeSignature} label="Signature" />
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                Note: La signature du CDE est optionnelle et peut être ajoutée ultérieurement.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Download className="mr-2 h-4 w-4" />
          Exporter PDF
        </Button>
        <div className="space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetForm}
            className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Réinitialiser
          </Button>
          <Button
            type="submit"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
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
