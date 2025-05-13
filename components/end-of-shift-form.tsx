"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SignaturePad } from "@/components/signature-pad"
import { authService } from "@/lib/auth-service"
import { CheckCircle, AlertTriangle, Clock, Car, Radio, FileText, Edit2, Save } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function EndOfShiftForm() {
  const router = useRouter()
  const [currentAgent, setCurrentAgent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [vehiclePerceptions, setVehiclePerceptions] = useState<any[]>([])
  const [radioPerceptions, setRadioPerceptions] = useState<any[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null)
  const [selectedRadio, setSelectedRadio] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [signature, setSignature] = useState<string | null>(null)
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [kmEnd, setKmEnd] = useState("")
  const [fuelLevel, setFuelLevel] = useState("")
  const [vehicleState, setVehicleState] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)

  // Charger les données de l'agent et ses perceptions
  useEffect(() => {
    const loadAgentData = async () => {
      setIsLoading(true)

      // Récupérer l'agent connecté
      const agent = authService.getCurrentAgent()
      if (!agent) {
        router.push("/login")
        return
      }
      setCurrentAgent(agent)

      // Récupérer les perceptions de véhicule de l'agent
      try {
        const storedInspections = localStorage.getItem("pendingInspections")
        const inspections = storedInspections ? JSON.parse(storedInspections) : []
        const agentInspections = inspections.filter((inspection: any) => inspection.agentId === agent.id)
        setVehiclePerceptions(agentInspections)

        // Sélectionner automatiquement la dernière perception de véhicule
        if (agentInspections.length > 0) {
          setSelectedVehicle(agentInspections[agentInspections.length - 1])
        }
      } catch (error) {
        console.error("Erreur lors du chargement des perceptions de véhicule:", error)
      }

      // Récupérer les perceptions radio de l'agent
      try {
        const storedRadioForms = localStorage.getItem("radioEquipmentForms")
        const radioForms = storedRadioForms ? JSON.parse(storedRadioForms) : []
        const agentRadioForms = radioForms.filter((form: any) => form.agentId === agent.id)
        setRadioPerceptions(agentRadioForms)

        // Sélectionner automatiquement la dernière perception radio
        if (agentRadioForms.length > 0) {
          setSelectedRadio(agentRadioForms[agentRadioForms.length - 1])
        }
      } catch (error) {
        console.error("Erreur lors du chargement des perceptions radio:", error)
      }

      setIsLoading(false)
    }

    loadAgentData()
  }, [router])

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!signature) {
      alert("Veuillez signer le formulaire avant de le soumettre.")
      return
    }

    if (!selectedVehicle) {
      alert("Aucun véhicule sélectionné. Veuillez sélectionner un véhicule.")
      return
    }

    // Créer l'objet de fin de vacation
    const endOfShiftData = {
      id: `EOD-${Date.now()}`,
      date: new Date().toISOString(),
      agentId: currentAgent.id,
      agentName: currentAgent.name,
      vehicleId: selectedVehicle.id,
      vehicleImmatriculation: selectedVehicle.vehicleInfo?.immatriculation || "Non spécifié",
      radioId: selectedRadio?.id || "Non spécifié",
      kmEnd: kmEnd,
      fuelLevel: fuelLevel,
      vehicleState: vehicleState,
      additionalNotes: additionalNotes,
      signature: signature,
      status: "completed",
    }

    // Enregistrer dans localStorage
    try {
      const storedEndOfShifts = localStorage.getItem("endOfShifts") || "[]"
      const endOfShifts = JSON.parse(storedEndOfShifts)
      endOfShifts.push(endOfShiftData)
      localStorage.setItem("endOfShifts", JSON.stringify(endOfShifts))

      // Mettre à jour le statut de la perception de véhicule
      if (selectedVehicle) {
        const updatedInspections = vehiclePerceptions.map((inspection) => {
          if (inspection.id === selectedVehicle.id) {
            return { ...inspection, endOfShiftCompleted: true }
          }
          return inspection
        })

        const allInspections = JSON.parse(localStorage.getItem("pendingInspections") || "[]")
        const updatedAllInspections = allInspections.map((inspection: any) => {
          if (inspection.id === selectedVehicle.id) {
            return { ...inspection, endOfShiftCompleted: true }
          }
          return inspection
        })

        localStorage.setItem("pendingInspections", JSON.stringify(updatedAllInspections))
      }

      // Mettre à jour le statut de la perception radio
      if (selectedRadio) {
        const allRadioForms = JSON.parse(localStorage.getItem("radioEquipmentForms") || "[]")
        const updatedAllRadioForms = allRadioForms.map((form: any) => {
          if (form.id === selectedRadio.id) {
            return { ...form, endOfShiftCompleted: true }
          }
          return form
        })

        localStorage.setItem("radioEquipmentForms", JSON.stringify(updatedAllRadioForms))
      }

      // Afficher la confirmation
      setFormSubmitted(true)

      // Rediriger après 5 secondes
      setTimeout(() => {
        router.push("/")
      }, 5000)
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la fin de vacation:", error)
      alert("Une erreur est survenue lors de l'enregistrement de la fin de vacation.")
    }
  }

  // Si la page est en cours de chargement
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="text-center py-8">Chargement...</div>
      </div>
    )
  }

  // Si le formulaire a été soumis avec succès
  if (formSubmitted) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle className="text-xl">Fin de vacation validée</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-md">
              <p className="text-center text-lg font-medium text-green-700">
                Vous avez validé votre Fin de Vacation
                <br />
                votre fiche est transmise au COS
              </p>
            </div>

            <div className="text-center space-y-3">
              <p className="text-sm text-gray-500">Redirection vers l'accueil dans quelques secondes...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="w-full">
              <CardTitle className="text-xl text-center">FIN DE VACATION</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de l'agent */}
            <div className="bg-blue-50 p-3 rounded-md mb-4 flex items-center">
              <div className="mr-2 bg-blue-100 rounded-full p-1">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-sm text-blue-700">
                <span className="font-medium">Agent connecté:</span> {currentAgent?.name} (ID: {currentAgent?.id})
              </div>
              <div className="ml-auto flex items-center">
                <Clock className="h-4 w-4 mr-1 text-blue-600" />
                <span className="text-sm text-blue-700">{new Date().toLocaleString()}</span>
              </div>
            </div>

            {/* Perception de véhicule */}
            <div className="bg-white border rounded-md mb-4 shadow-sm">
              <div className="bg-blue-50 p-2 flex items-center justify-between border-b rounded-t-md">
                <div className="flex items-center">
                  <Car className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="font-medium">Perception de véhicule</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-blue-600"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  {isEditing ? "Annuler" : "Modifier"}
                </Button>
              </div>

              <div className="p-4">
                {vehiclePerceptions.length > 0 ? (
                  <div className="space-y-4">
                    {!isEditing ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Véhicule:</span>
                            <span className="text-sm">
                              {selectedVehicle?.vehicleInfo?.immatriculation || "Non spécifié"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Date de perception:</span>
                            <span className="text-sm">
                              {selectedVehicle ? formatDate(selectedVehicle.date) : "Non spécifié"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Kilométrage initial:</span>
                            <span className="text-sm">
                              {selectedVehicle?.vehicleInfo?.kilometrage || "Non spécifié"}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">État initial:</span>
                            <span className="text-sm">{selectedVehicle?.vehicleState || "Non spécifié"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Niveau de carburant initial:</span>
                            <span className="text-sm">{selectedVehicle?.fuelLevel || "Non spécifié"}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="vehicle-select" className="block text-sm font-medium text-gray-700 mb-1">
                            Sélectionner un véhicule
                          </label>
                          <Select
                            value={selectedVehicle?.id || ""}
                            onValueChange={(value) => {
                              const vehicle = vehiclePerceptions.find((v) => v.id === value)
                              setSelectedVehicle(vehicle || null)
                            }}
                          >
                            <SelectTrigger id="vehicle-select" className="w-full">
                              <SelectValue placeholder="Sélectionner un véhicule" />
                            </SelectTrigger>
                            <SelectContent>
                              {vehiclePerceptions.map((vehicle) => (
                                <SelectItem key={vehicle.id} value={vehicle.id}>
                                  {vehicle.vehicleInfo?.immatriculation || "Véhicule sans immatriculation"} -{" "}
                                  {formatDate(vehicle.date)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Informations de fin de service */}
                    <div className="border-t pt-4 mt-4">
                      <h3 className="text-sm font-medium mb-3">Informations de fin de service</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="km-end" className="block text-sm font-medium text-gray-700 mb-1">
                            Kilométrage final
                          </label>
                          <Input
                            id="km-end"
                            type="number"
                            value={kmEnd}
                            onChange={(e) => setKmEnd(e.target.value)}
                            placeholder="Ex: 12500"
                            className="h-9"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="fuel-level" className="block text-sm font-medium text-gray-700 mb-1">
                            Niveau de carburant final
                          </label>
                          <Select value={fuelLevel} onValueChange={setFuelLevel}>
                            <SelectTrigger id="fuel-level" className="h-9">
                              <SelectValue placeholder="Sélectionner le niveau" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="vide">Vide</SelectItem>
                              <SelectItem value="1/4">1/4</SelectItem>
                              <SelectItem value="1/2">1/2</SelectItem>
                              <SelectItem value="3/4">3/4</SelectItem>
                              <SelectItem value="plein">Plein</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="mt-4">
                        <label htmlFor="vehicle-state" className="block text-sm font-medium text-gray-700 mb-1">
                          État du véhicule
                        </label>
                        <Select value={vehicleState} onValueChange={setVehicleState}>
                          <SelectTrigger id="vehicle-state" className="h-9">
                            <SelectValue placeholder="Sélectionner l'état" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bon">Bon état</SelectItem>
                            <SelectItem value="moyen">État moyen</SelectItem>
                            <SelectItem value="mauvais">Mauvais état</SelectItem>
                            <SelectItem value="incident">Incident à signaler</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Car className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Aucune perception de véhicule trouvée pour cet agent.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Perception radio */}
            <div className="bg-white border rounded-md mb-4 shadow-sm">
              <div className="bg-blue-50 p-2 flex items-center justify-between border-b rounded-t-md">
                <div className="flex items-center">
                  <Radio className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="font-medium">Perception radio</span>
                </div>
              </div>

              <div className="p-4">
                {radioPerceptions.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">ID Radio:</span>
                          <span className="text-sm">{selectedRadio?.id || "Non spécifié"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Date de perception:</span>
                          <span className="text-sm">
                            {selectedRadio ? formatDate(selectedRadio.date) : "Non spécifié"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Véhicule associé:</span>
                          <span className="text-sm">
                            {selectedRadio?.agentInfo?.vehicleImmatriculation || "Non spécifié"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">État:</span>
                          <span className="text-sm">
                            {selectedRadio?.radios?.length > 0
                              ? selectedRadio.radios[0].perceptionNote || "Non spécifié"
                              : "Non spécifié"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sélection de la radio */}
                    {isEditing && (
                      <div className="border-t pt-4 mt-4">
                        <label htmlFor="radio-select" className="block text-sm font-medium text-gray-700 mb-1">
                          Sélectionner une radio
                        </label>
                        <Select
                          value={selectedRadio?.id || ""}
                          onValueChange={(value) => {
                            const radio = radioPerceptions.find((r) => r.id === value)
                            setSelectedRadio(radio || null)
                          }}
                        >
                          <SelectTrigger id="radio-select" className="w-full">
                            <SelectValue placeholder="Sélectionner une radio" />
                          </SelectTrigger>
                          <SelectContent>
                            {radioPerceptions.map((radio) => (
                              <SelectItem key={radio.id} value={radio.id}>
                                {radio.id} - {formatDate(radio.date)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Radio className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Aucune perception radio trouvée pour cet agent.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes supplémentaires */}
            <div className="bg-white border rounded-md mb-4 shadow-sm">
              <div className="bg-blue-50 p-2 flex items-center justify-between border-b rounded-t-md">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="font-medium">Notes supplémentaires</span>
                </div>
              </div>

              <div className="p-4">
                <Textarea
                  placeholder="Ajoutez des notes ou observations supplémentaires ici..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>

            {/* Signature */}
            <div className="bg-white border rounded-md mb-4 shadow-sm">
              <div className="bg-blue-50 p-2 border-b rounded-t-md">
                <span className="font-medium">Signature de l'agent</span>
              </div>

              <div className="p-4">
                <SignaturePad onSignatureChange={setSignature} label="Signature" initialSignature={signature} />
                <p className="text-xs text-gray-500 mt-2">
                  En signant, vous confirmez que toutes les informations fournies sont exactes.
                </p>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="mr-2 h-4 w-4" />
                Valider la fin de vacation
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
