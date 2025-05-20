"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SignaturePad } from "@/components/signature-pad"
import { Save, Download, RotateCcw, ArrowLeft, CheckCircle, Info, AlertTriangle, ShieldAlert } from "lucide-react"
// Importer le service d'authentification
import { authService } from "@/lib/auth-service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface RadioEquipmentFormProps {
  formId?: string
  isEditing?: boolean
}

// Options pour les menus déroulants
const DEPORTE_OPTIONS = Array.from({ length: 14 }, (_, i) => `GOLF ${(i + 1).toString().padStart(2, "0")}`)
const RADIO_OPTIONS = Array.from({ length: 14 }, (_, i) => `RADIO ${(i + 1).toString().padStart(2, "0")}`)

const STATUS_OPTIONS = [
  { value: "RAS", label: "RAS", color: "text-green-600" },
  { value: "MANQUE_BOUTON", label: "Manque un bouton", color: "text-orange-500" },
  { value: "NE_MARCHE_PAS", label: "Rien ne marche", color: "text-red-600" },
]

export function RadioEquipmentForm({ formId, isEditing = false }: RadioEquipmentFormProps) {
  const router = useRouter()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [originalForm, setOriginalForm] = useState<any>(null)
  const [showRadioInfo, setShowRadioInfo] = useState(false)
  const [showDeporteInfo, setShowDeporteInfo] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(true)
  const [currentFormId, setCurrentFormId] = useState(formId || "")
  const [isLoading, setIsLoading] = useState(true)
  const [currentAgent, setCurrentAgent] = useState<any>(null)

  // État pour les déportés
  const [deportes, setDeportes] = useState([
    { id: "", perceptionNote: "", reintegrationNote: "" },
    { id: "", perceptionNote: "", reintegrationNote: "" },
    { id: "", perceptionNote: "", reintegrationNote: "" },
    { id: "", perceptionNote: "", reintegrationNote: "" },
  ])

  // État pour les radios
  const [radios, setRadios] = useState([
    { id: "", perceptionNote: "", reintegrationNote: "" },
    { id: "", perceptionNote: "", reintegrationNote: "" },
    { id: "", perceptionNote: "", reintegrationNote: "" },
    { id: "", perceptionNote: "", reintegrationNote: "" },
  ])

  // État pour les informations de l'agent et du CDE
  const [agentInfo, setAgentInfo] = useState({
    agentName: "",
    indicatifPatrouille: "",
    cdeName: "",
    date: new Date().toISOString().split("T")[0],
    cosDate: new Date().toISOString().split("T")[0],
    vehicleImmatriculation: "", // Ajout de la plaque d'immatriculation
  })

  // État pour les signatures
  const [agentSignature, setAgentSignature] = useState<string | null>(null)
  const [cdeSignature, setCdeSignature] = useState<string | null>(null)

  // Vérifier l'authentification au chargement du composant
  useEffect(() => {
    const checkAuthorization = async () => {
      setIsLoading(true)

      // Vérifier si un agent est connecté
      const agent = authService.getCurrentAgent()

      if (!agent) {
        // Rediriger vers la page d'accueil
        router.push("/")
        return
      }

      setCurrentAgent(agent)

      // Update agent name only once when component mounts or when editing a form
      setAgentInfo((prevInfo) => ({
        ...prevInfo,
        agentName: agent.name,
      }))

      if (isEditing && formId) {
        // Vérifier si l'agent est autorisé à modifier cette fiche
        const canEdit = authService.canEditForm(formId)
        setIsAuthorized(canEdit)

        if (!canEdit) {
          setIsLoading(false)
          return
        }

        // Charger les données du formulaire existant
        try {
          const stored = localStorage.getItem("radioEquipmentForms")
          if (stored) {
            const forms = JSON.parse(stored)
            const form = forms.find((f: any) => f.id === formId)
            if (form) {
              setOriginalForm(form)
              setDeportes(form.deportes)
              setRadios(form.radios)
              setAgentInfo(form.agentInfo)
              setAgentSignature(form.agentSignature)
              setCdeSignature(form.cdeSignature)
            } else {
              console.error("Formulaire non trouvé")
            }
          }
        } catch (error) {
          console.error("Erreur lors du chargement du formulaire:", error)
        }
      } else {
        // Nouvelle fiche - générer un ID
        const newFormId = `RADIO-${new Date().getTime().toString().slice(-6)}`
        setCurrentFormId(newFormId)
      }

      setIsLoading(false)
    }

    checkAuthorization()
  }, [isEditing, formId, router])

  // Si la page est en cours de chargement
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="text-center py-8">Chargement...</div>
      </div>
    )
  }

  // Si l'utilisateur n'est pas autorisé
  if (!isAuthorized) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-700 mb-4">Accès non autorisé</h2>
              <p className="text-red-600 mb-4">
                Vous n'êtes pas autorisé à accéder à cette fiche. Seul l'agent qui l'a créée peut la modifier.
              </p>
              <Button onClick={() => router.push("/radio-equipment-list")} className="bg-red-600 hover:bg-red-700">
                Retour à la liste
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Mettre à jour les déportés
  const updateDeporte = (index: number, field: string, value: string) => {
    const newDeportes = [...deportes]
    newDeportes[index] = { ...newDeportes[index], [field]: value }
    setDeportes(newDeportes)
  }

  // Mettre à jour les radios
  const updateRadio = (index: number, field: string, value: string) => {
    const newRadios = [...radios]
    newRadios[index] = { ...newRadios[index], [field]: value }
    setRadios(newRadios)
  }

  // Réinitialiser le formulaire
  const resetForm = () => {
    if (isEditing && originalForm) {
      setDeportes(originalForm.deportes)
      setRadios(originalForm.radios)
      setAgentInfo(originalForm.agentInfo)
      setAgentSignature(originalForm.agentSignature)
      setCdeSignature(originalForm.cdeSignature)
    } else {
      setDeportes(deportes.map(() => ({ id: "", perceptionNote: "", reintegrationNote: "" })))
      setRadios(radios.map(() => ({ id: "", perceptionNote: "", reintegrationNote: "" })))
      setAgentInfo({
        agentName: currentAgent?.name || "",
        indicatifPatrouille: "",
        cdeName: "",
        date: new Date().toISOString().split("T")[0],
        cosDate: new Date().toISOString().split("T")[0],
        vehicleImmatriculation: "",
      })
      setAgentSignature(null)
      setCdeSignature(null)
    }
  }

  // Soumettre le formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Vérifier si l'agent a signé
    if (!agentSignature) {
      alert("Veuillez signer le formulaire en tant qu'agent responsable avant de l'envoyer.")
      return
    }

    // Vérifier si la plaque d'immatriculation est renseignée
    if (!agentInfo.vehicleImmatriculation) {
      alert("Veuillez saisir la plaque d'immatriculation du véhicule.")
      return
    }

    // Enregistrer le formulaire avec la plaque d'immatriculation
    if (!isEditing) {
      authService.registerForm(currentFormId, "radio", agentInfo.vehicleImmatriculation)
    }

    // Créer l'objet de données à envoyer
    const formData = {
      id: currentFormId,
      deportes: deportes.filter((d) => d.id || d.perceptionNote || d.reintegrationNote),
      radios: radios.filter((r) => r.id || r.perceptionNote || r.reintegrationNote),
      agentInfo,
      agentId: currentAgent?.id || "",
      agentSignature,
      cdeSignature,
      date: new Date().toISOString(),
      status: isEditing ? "modified" : "submitted",
      history:
        isEditing && originalForm?.history ? [...originalForm.history, createHistoryEntry()] : [createHistoryEntry()],
    }

    // Stocker dans localStorage pour la persistance des données
    const radioEquipmentForms = JSON.parse(localStorage.getItem("radioEquipmentForms") || "[]")

    if (isEditing) {
      // Mettre à jour le formulaire existant
      const index = radioEquipmentForms.findIndex((f: any) => f.id === formId)
      if (index !== -1) {
        radioEquipmentForms[index] = formData
      } else {
        radioEquipmentForms.push(formData)
      }
    } else {
      // Ajouter un nouveau formulaire
      radioEquipmentForms.push(formData)
    }

    localStorage.setItem("radioEquipmentForms", JSON.stringify(radioEquipmentForms))

    console.log("Formulaire enregistré:", formData)

    // Afficher la confirmation
    setShowConfirmation(true)

    // Rediriger après 3 secondes
    setTimeout(() => {
      router.push("/")
    }, 3000)
  }

  // Créer une entrée d'historique
  const createHistoryEntry = () => {
    // Déterminer quels champs ont été modifiés (si en mode édition)
    let changesDetails = ""

    if (isEditing && originalForm) {
      const changes = []

      // Vérifier les changements dans les informations de l'agent
      if (originalForm.agentInfo.agentName !== agentInfo.agentName) {
        changes.push("nom de l'agent")
      }
      if (originalForm.agentInfo.indicatifPatrouille !== agentInfo.indicatifPatrouille) {
        changes.push("indicatif de patrouille")
      }
      if (originalForm.agentInfo.cdeName !== agentInfo.cdeName) {
        changes.push("nom du CDE")
      }
      if (originalForm.agentInfo.vehicleImmatriculation !== agentInfo.vehicleImmatriculation) {
        changes.push("plaque d'immatriculation")
      }

      // Vérifier les changements dans les équipements
      const originalRadioCount = originalForm.radios.filter((r: any) => r.id).length
      const currentRadioCount = radios.filter((r) => r.id).length
      if (originalRadioCount !== currentRadioCount) {
        changes.push(`nombre d'équipements radio (${originalRadioCount} → ${currentRadioCount})`)
      }

      const originalDeporteCount = originalForm.deportes.filter((d: any) => d.id).length
      const currentDeporteCount = deportes.filter((d) => d.id).length
      if (originalDeporteCount !== currentDeporteCount) {
        changes.push(`nombre d'équipements déportés (${originalDeporteCount} → ${currentDeporteCount})`)
      }

      // Vérifier les signatures
      if (!!originalForm.agentSignature !== !!agentSignature) {
        changes.push("signature de l'agent")
      }
      if (!!originalForm.cdeSignature !== !!cdeSignature) {
        changes.push("signature du CDE")
      }

      changesDetails =
        changes.length > 0 ? `Champs modifiés: ${changes.join(", ")}` : "Aucun changement significatif détecté"
    }

    return {
      date: new Date().toISOString(),
      agent: agentInfo.agentName,
      agentId: currentAgent?.id || "",
      action: isEditing ? `Modification du formulaire. ${changesDetails}` : "Création du formulaire",
    }
  }

  // Retourner à la liste
  const handleBack = () => {
    router.push("/radio-equipment-list")
  }

  // Fonction pour obtenir la classe de couleur en fonction du statut
  const getStatusColorClass = (status: string) => {
    const option = STATUS_OPTIONS.find((opt) => opt.value === status)
    return option ? option.color : "text-gray-700"
  }

  // Fonction pour obtenir le libellé en fonction du statut
  const getStatusLabel = (status: string) => {
    const option = STATUS_OPTIONS.find((opt) => opt.value === status)
    return option ? option.label : status
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="w-full">
              {isEditing && (
                <Button variant="ghost" size="sm" onClick={handleBack} className="mb-2">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Retour à la liste
                </Button>
              )}
              <CardTitle className="text-xl text-center">
                {isEditing ? "MODIFIER " : ""}
                PERCEPTION RADIO ET DÉPORTÉ DE SERVICE
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Logo et informations */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 bg-blue-50 p-4 rounded-md shadow-sm">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="mr-3">
                  <img src="/images/gpis_gie_logo.jpeg" alt="Logo GPIS GIE" className="h-12 w-auto" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="date" className="block text-xs font-medium text-gray-700">
                    Date
                  </label>
                  <Input
                    id="date"
                    type="date"
                    value={agentInfo.date}
                    onChange={(e) => setAgentInfo({ ...agentInfo, date: e.target.value })}
                    className="h-8 text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="indicatif" className="block text-xs font-medium text-gray-700">
                    Indicatif patrouille
                  </label>
                  <Input
                    id="indicatif"
                    value={agentInfo.indicatifPatrouille}
                    onChange={(e) => setAgentInfo({ ...agentInfo, indicatifPatrouille: e.target.value })}
                    placeholder="Ex: P12"
                    className="h-8 text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Bandeau d'information sur l'agent */}
            <div className="bg-blue-50 p-3 rounded-md mb-4 flex items-center">
              <div className="mr-2 bg-blue-100 rounded-full p-1">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-sm text-blue-700">
                <span className="font-medium">Agent connecté:</span> {currentAgent?.name} (ID: {currentAgent?.id})
              </div>
            </div>

            {/* Plaque d'immatriculation */}
            <div className="bg-white border rounded-md mb-4 shadow-sm">
              <div className="bg-blue-50 p-2 text-center font-medium border-b rounded-t-md">VÉHICULE ASSOCIÉ</div>
              <div className="p-4">
                <label htmlFor="immatriculation" className="block text-sm font-medium text-gray-700 mb-2">
                  Plaque d'immatriculation
                </label>
                <Input
                  id="immatriculation"
                  value={agentInfo.vehicleImmatriculation}
                  onChange={(e) => setAgentInfo({ ...agentInfo, vehicleImmatriculation: e.target.value })}
                  placeholder="Ex: GH-351-PY"
                  className="text-sm"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cette plaque d'immatriculation sera utilisée pour lier les équipements radio au véhicule.
                </p>
              </div>
            </div>

            {/* Section DÉPORTÉ */}
            <div className="bg-white border rounded-md mb-4 shadow-sm">
              <div className="bg-blue-50 p-2 flex items-center justify-between border-b rounded-t-md">
                <div className="flex items-center">
                  <span className="font-medium">1/ DÉPORTÉ</span>
                  <button
                    type="button"
                    className="ml-2 text-blue-600 hover:text-blue-800"
                    onClick={() => setShowDeporteInfo(!showDeporteInfo)}
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center">
                  <img src="/images/deporte-equipment.png" alt="Déporté" className="h-10 w-auto object-contain" />
                </div>
              </div>

              {showDeporteInfo && (
                <div className="p-3 bg-blue-50 border-b">
                  <div className="flex items-start">
                    <div className="mr-4 flex-shrink-0">
                      <img src="/images/deporte-equipment.png" alt="Déporté" className="h-24 w-auto object-contain" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">Équipement Déporté</h4>
                      <p className="text-xs text-gray-600">
                        Le déporté est un équipement de sécurité porté par les agents. Vérifiez son état et son
                        fonctionnement lors de la perception et de la réintégration. Notez tout dysfonctionnement ou
                        dommage observé.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 w-1/4">N° DÉPORTÉ</th>
                      <th className="text-left p-2 w-2/5">
                        CONSTATATIONS EFFECTUÉES
                        <br />
                        EN PERCEPTION
                      </th>
                      <th className="text-left p-2 w-2/5">
                        CONSTATATIONS EFFECTUÉES
                        <br />
                        EN RÉINTÉGRATION
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {deportes.map((deporte, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">
                          <Select
                            value={deporte.id || "none"}
                            onValueChange={(value) => updateDeporte(index, "id", value === "none" ? "" : value)}
                          >
                            <SelectTrigger className="h-12 sm:h-9 text-base sm:text-sm">
                              <SelectValue placeholder={`Sélectionner un déporté`} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Sélectionner...</SelectItem>
                              {DEPORTE_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option} className="py-3 sm:py-2">
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2">
                          <Select
                            value={deporte.perceptionNote || "none"}
                            onValueChange={(value) =>
                              updateDeporte(index, "perceptionNote", value === "none" ? "" : value)
                            }
                          >
                            <SelectTrigger
                              className={`h-9 text-sm ${deporte.perceptionNote ? getStatusColorClass(deporte.perceptionNote) : ""}`}
                            >
                              <SelectValue placeholder="État en perception">
                                {deporte.perceptionNote ? getStatusLabel(deporte.perceptionNote) : "État en perception"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Sélectionner...</SelectItem>
                              {STATUS_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value} className={option.color}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2">
                          <Select
                            value={deporte.reintegrationNote || "none"}
                            onValueChange={(value) =>
                              updateDeporte(index, "reintegrationNote", value === "none" ? "" : value)
                            }
                          >
                            <SelectTrigger
                              className={`h-9 text-sm ${deporte.reintegrationNote ? getStatusColorClass(deporte.reintegrationNote) : ""}`}
                            >
                              <SelectValue placeholder="État en réintégration">
                                {deporte.reintegrationNote
                                  ? getStatusLabel(deporte.reintegrationNote)
                                  : "État en réintégration"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Sélectionner...</SelectItem>
                              {STATUS_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value} className={option.color}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Section réservée à l'encadrement */}
                <div className="mt-4 border rounded-md p-3 bg-gray-50">
                  <h3 className="text-sm font-medium mb-2">Réservé à l'encadrement</h3>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Prise en compte COS</label>
                          <div className="flex items-center">
                            <span className="text-sm mr-2">Le</span>
                            <Input
                              type="date"
                              value={agentInfo.cosDate}
                              onChange={(e) => setAgentInfo({ ...agentInfo, cosDate: e.target.value })}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div>
                        <label htmlFor="cde-name" className="block text-xs text-gray-600 mb-1">
                          CDE / ACDE
                        </label>
                        <Input
                          id="cde-name"
                          placeholder="Nom et prénom du CDE"
                          value={agentInfo.cdeName}
                          onChange={(e) => setAgentInfo({ ...agentInfo, cdeName: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div>
                        <label htmlFor="agent-name" className="block text-xs text-gray-600 mb-1">
                          Agent responsable perception
                        </label>
                        <Input
                          id="agent-name"
                          placeholder="Nom et prénom de l'agent"
                          value={agentInfo.agentName}
                          onChange={(e) => setAgentInfo({ ...agentInfo, agentName: e.target.value })}
                          className="h-8 text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section RADIO */}
            <div className="bg-white border rounded-md mb-4 shadow-sm">
              <div className="bg-blue-50 p-2 flex items-center justify-between border-b rounded-t-md">
                <div className="flex items-center">
                  <span className="font-medium">2/ RADIO</span>
                  <button
                    type="button"
                    className="ml-2 text-blue-600 hover:text-blue-800"
                    onClick={() => setShowRadioInfo(!showRadioInfo)}
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center">
                  <img src="/images/radio-equipment.png" alt="Radio" className="h-10 w-auto object-contain" />
                </div>
              </div>

              {showRadioInfo && (
                <div className="p-3 bg-blue-50 border-b">
                  <div className="flex items-start">
                    <div className="mr-4 flex-shrink-0">
                      <img src="/images/radio-equipment.png" alt="Radio" className="h-24 w-auto object-contain" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">Équipement Radio</h4>
                      <p className="text-xs text-gray-600">
                        La radio est un équipement essentiel pour la communication. Lors de la perception, vérifiez
                        l'état de la batterie, le fonctionnement du micro et du haut-parleur. Notez tout problème
                        constaté lors de la perception et de la réintégration.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 w-1/4">N° RADIO</th>
                      <th className="text-left p-2 w-2/5">
                        CONSTATATIONS EFFECTUÉES
                        <br />
                        EN PERCEPTION
                      </th>
                      <th className="text-left p-2 w-2/5">
                        CONSTATATIONS EFFECTUÉES
                        <br />
                        EN RÉINTÉGRATION
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {radios.map((radio, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">
                          <Select
                            value={radio.id || "none"}
                            onValueChange={(value) => updateRadio(index, "id", value === "none" ? "" : value)}
                          >
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue placeholder={`Sélectionner une radio`} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Sélectionner...</SelectItem>
                              {RADIO_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2">
                          <Select
                            value={radio.perceptionNote || "none"}
                            onValueChange={(value) =>
                              updateRadio(index, "perceptionNote", value === "none" ? "" : value)
                            }
                          >
                            <SelectTrigger
                              className={`h-9 text-sm ${radio.perceptionNote ? getStatusColorClass(radio.perceptionNote) : ""}`}
                            >
                              <SelectValue placeholder="État en perception">
                                {radio.perceptionNote ? getStatusLabel(radio.perceptionNote) : "État en perception"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Sélectionner...</SelectItem>
                              {STATUS_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value} className={option.color}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2">
                          <Select
                            value={radio.reintegrationNote || "none"}
                            onValueChange={(value) =>
                              updateRadio(index, "reintegrationNote", value === "none" ? "" : value)
                            }
                          >
                            <SelectTrigger
                              className={`h-9 text-sm ${radio.reintegrationNote ? getStatusColorClass(radio.reintegrationNote) : ""}`}
                            >
                              <SelectValue placeholder="État en réintégration">
                                {radio.reintegrationNote
                                  ? getStatusLabel(radio.reintegrationNote)
                                  : "État en réintégration"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Sélectionner...</SelectItem>
                              {STATUS_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value} className={option.color}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Section signatures */}
                <div className="mt-4 border rounded-md p-3">
                  <h3 className="text-sm font-medium mb-2">Agent responsable perception / CDE :</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Signature Agent */}
                    <div className="border rounded-md p-3">
                      <h4 className="text-xs font-medium mb-2">Signature Agent</h4>
                      <SignaturePad
                        onSignatureChange={setAgentSignature}
                        label="Signature"
                        initialSignature={agentSignature}
                      />
                    </div>

                    {/* Signature CDE */}
                    <div className="border rounded-md p-3">
                      <h4 className="text-xs font-medium mb-2">Signature CDE</h4>
                      <SignaturePad
                        onSignatureChange={setCdeSignature}
                        label="Signature"
                        initialSignature={cdeSignature}
                      />
                      <p className="text-xs text-gray-500 italic mt-1">
                        Note: La signature du CDE est optionnelle et peut être ajoutée ultérieurement.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mention légale */}
            <div className="bg-gray-50 p-3 rounded-md text-xs text-gray-600 italic">
              <p>
                Nous vous informons que le GPIS met en œuvre un traitement de données à caractère personnel ayant pour
                finalités la gestion des véhicules de service. Ces données sont obligatoires. Les données relatives à la
                gestion de la perception des véhicules de service sont destinées au supérieur hiérarchique, à la
                direction ainsi qu'au service logistique. Conformément aux dispositions de la loi 78-17 du 06 janvier
                1978, vous disposez d'un droit d'interrogation, d'accès, de rectification et d'opposition pour motif
                légitime au traitement des données vous concernant, que vous pouvez exercer par courrier postal,
                accompagné d'une copie d'un titre d'identité signé, auprès du Correspondant informatique et libertés, 8
                boulevard Berthier, 75017 Paris, ou par courrier électronique à : cil@gie-gpis.co
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-between">
              <Button type="button" variant="outline" size="sm" className="bg-white hover:bg-gray-50">
                <Download className="mr-2 h-4 w-4" />
                Exporter PDF
              </Button>
              <div className="space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetForm}
                  className="bg-white hover:bg-gray-50"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {isEditing ? "Annuler les modifications" : "Réinitialiser"}
                </Button>
                <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? "Enregistrer les modifications" : "Enregistrer"}
                </Button>
              </div>
            </div>

            {/* Message de confirmation */}
            {showConfirmation && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-lg">
                  <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-50 flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <CardTitle className="text-xl">
                      {isEditing ? "Modifications enregistrées avec succès" : "Formulaire enregistré avec succès"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-md">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Agent:</span>
                        <span className="text-sm">{agentInfo.agentName}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Indicatif:</span>
                        <span className="text-sm">{agentInfo.indicatifPatrouille}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Véhicule:</span>
                        <span className="text-sm">{agentInfo.vehicleImmatriculation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Date:</span>
                        <span className="text-sm">{new Date(agentInfo.date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="text-center space-y-3">
                      <p className="text-lg font-medium text-green-700">
                        Merci de votre perception et bonne vacation !
                      </p>
                      <p className="text-sm text-blue-600">
                        Vous pourrez revenir sur cette fiche ultérieurement pour apporter des modifications si
                        nécessaire.
                      </p>
                      <p className="text-sm text-gray-500">Redirection vers l'accueil dans quelques secondes...</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
