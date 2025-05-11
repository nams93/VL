"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { SignaturePad } from "@/components/signature-pad"
import { AlertTriangle, Save, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export function InspectionUpdateForm() {
  const router = useRouter()
  const [inspections, setInspections] = useState<any[]>([])
  const [selectedInspection, setSelectedInspection] = useState<any | null>(null)
  const [additionalObservations, setAdditionalObservations] = useState("")
  const [agentName, setAgentName] = useState("")
  const [agentSignature, setAgentSignature] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedImmatriculation, setSelectedImmatriculation] = useState<string>("")

  // Charger les inspections depuis localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("pendingInspections")
      if (stored) {
        const parsedInspections = JSON.parse(stored)
        // Trier par date décroissante (plus récentes d'abord)
        const sortedInspections = parsedInspections.sort(
          (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )
        setInspections(sortedInspections)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des inspections:", error)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInspection) return
    if (!agentSignature) {
      alert("Veuillez signer le formulaire avant de soumettre la mise à jour.")
      return
    }

    setIsSubmitting(true)

    // Créer la mise à jour
    const update = {
      timestamp: new Date().toISOString(),
      observations: additionalObservations,
      agentName,
      agentSignature,
    }

    // Mettre à jour l'inspection sélectionnée
    const updatedInspections = inspections.map((inspection) => {
      if (inspection.id === selectedInspection.id) {
        // Ajouter la mise à jour à l'inspection
        const updates = inspection.updates || []
        return {
          ...inspection,
          updates: [...updates, update],
          lastUpdateDate: new Date().toISOString(),
        }
      }
      return inspection
    })

    // Sauvegarder dans localStorage
    localStorage.setItem("pendingInspections", JSON.stringify(updatedInspections))

    // Afficher le message de succès
    setIsSubmitting(false)
    setShowSuccess(true)

    // Rediriger après 2 secondes
    setTimeout(() => {
      router.push("/dashboard")
    }, 2000)
  }

  return (
    <div className="container mx-auto py-6 max-w-3xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Mise à jour d'une inspection</CardTitle>
          <CardDescription>Ajoutez des observations supplémentaires à une inspection existante</CardDescription>
        </CardHeader>
        <CardContent>
          {showSuccess ? (
            <div className="bg-green-50 p-4 rounded-md text-green-700 text-center">
              <p className="font-medium">Mise à jour enregistrée avec succès!</p>
              <p className="text-sm mt-1">Redirection en cours...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Sélection par immatriculation d'abord */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Sélectionnez un véhicule par immatriculation</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    onChange={(e) => {
                      // Filtrer les inspections par immatriculation
                      const immatriculation = e.target.value
                      setSelectedImmatriculation(immatriculation)
                      setSelectedInspection(null) // Réinitialiser l'inspection sélectionnée
                    }}
                    required
                  >
                    <option value="">-- Sélectionnez une immatriculation --</option>
                    {/* Extraire les immatriculations uniques */}
                    {Array.from(new Set(inspections.map((i) => i.vehicleInfo.immatriculation))).map((immat) => (
                      <option key={immat} value={immat}>
                        {immat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Une fois l'immatriculation sélectionnée, afficher les inspections pour ce véhicule */}
                {selectedImmatriculation && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Sélectionnez une inspection pour {selectedImmatriculation}
                    </label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={selectedInspection?.id || ""}
                      onChange={(e) => {
                        const selected = inspections.find((i) => i.id === e.target.value)
                        setSelectedInspection(selected || null)
                      }}
                      required
                    >
                      <option value="">-- Sélectionnez une inspection --</option>
                      {inspections
                        .filter((i) => i.vehicleInfo.immatriculation === selectedImmatriculation)
                        .map((inspection) => (
                          <option key={inspection.id} value={inspection.id}>
                            {new Date(inspection.date).toLocaleDateString()}{" "}
                            {new Date(inspection.date).toLocaleTimeString()} - {inspection.agentName}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              {selectedInspection && (
                <>
                  {/* Détails de l'inspection sélectionnée */}
                  <div className="bg-blue-50 p-3 rounded-md">
                    <h3 className="font-medium mb-2">Détails de l'inspection</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">ID:</span> {selectedInspection.id}
                      </div>
                      <div>
                        <span className="font-medium">Véhicule:</span> {selectedInspection.vehicleInfo.immatriculation}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span>{" "}
                        {new Date(selectedInspection.date).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Agent:</span> {selectedInspection.agentName}
                      </div>
                    </div>
                  </div>

                  {/* Observations existantes */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Observations existantes</label>
                    <div className="p-3 border rounded-md bg-gray-50 min-h-[80px]">
                      {selectedInspection.observations || "Aucune observation"}
                    </div>
                  </div>

                  {/* Mises à jour précédentes */}
                  {selectedInspection.updates && selectedInspection.updates.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Mises à jour précédentes</label>
                      <div className="border rounded-md divide-y">
                        {selectedInspection.updates.map((update: any, index: number) => (
                          <div key={index} className="p-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium">{update.agentName}</span>
                              <span className="text-gray-500">{new Date(update.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="text-sm">{update.observations}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nouvelles observations */}
                  <div>
                    <label htmlFor="additional-observations" className="block text-sm font-medium mb-1">
                      Observations supplémentaires
                    </label>
                    <div className="bg-amber-50 p-2 rounded-md mb-2 flex items-start">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                      <p className="text-xs text-amber-700">
                        Ces observations seront ajoutées à l'inspection existante. Elles ne remplaceront pas les
                        observations précédentes.
                      </p>
                    </div>
                    <Textarea
                      id="additional-observations"
                      placeholder="Saisissez vos observations supplémentaires ici..."
                      className="min-h-[120px]"
                      value={additionalObservations}
                      onChange={(e) => setAdditionalObservations(e.target.value)}
                      required
                    />
                  </div>

                  {/* Informations de l'agent */}
                  <div>
                    <label htmlFor="agent-name" className="block text-sm font-medium mb-1">
                      Nom de l'agent
                    </label>
                    <input
                      type="text"
                      id="agent-name"
                      className="w-full p-2 border rounded-md"
                      placeholder="Votre nom complet"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Signature */}
                  <div>
                    <SignaturePad onSignatureChange={setAgentSignature} label="Signature de l'agent" />
                  </div>

                  {/* Bouton de soumission */}
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                      <Save className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Enregistrement..." : "Enregistrer la mise à jour"}
                    </Button>
                  </div>
                </>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
