"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { SignaturePad } from "@/components/signature-pad"
import { AlertTriangle, Save, ArrowLeft, ShieldAlert } from "lucide-react"
import { Input } from "@/components/ui/input"

// Importer le service d'authentification simplifié
import { authService } from "@/lib/auth-service"

export default function UpdateInspectionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const inspectionId = params.id as string

  const [inspection, setInspection] = useState<any | null>(null)
  const [additionalObservations, setAdditionalObservations] = useState("")
  const [agentName, setAgentName] = useState("")
  const [agentSignature, setAgentSignature] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showAgentIdPrompt, setShowAgentIdPrompt] = useState(false)
  const [agentId, setAgentId] = useState("")

  // Vérifier l'authentification et l'autorisation au chargement du composant
  useEffect(() => {
    const checkAuthorization = async () => {
      setIsLoading(true)

      // Vérifier si un agent est connecté
      const currentAgent = authService.getCurrentAgent()

      if (!currentAgent) {
        setShowAgentIdPrompt(true)
        setIsLoading(false)
        return
      }

      // Charger l'inspection
      try {
        const stored = localStorage.getItem("pendingInspections")
        if (stored) {
          const parsedInspections = JSON.parse(stored)
          const found = parsedInspections.find((i: any) => i.id === inspectionId)

          if (found) {
            setInspection(found)

            // Vérifier si l'agent actuel est autorisé à modifier cette fiche
            const canEdit = authService.canEditForm(inspectionId)
            setIsAuthorized(canEdit)

            if (!canEdit) {
              // Afficher un message après un court délai
              setTimeout(() => {
                alert("Vous n'êtes pas autorisé à modifier cette fiche. Seul l'agent qui l'a créée peut la modifier.")
              }, 500)
            }
          } else {
            // Inspection non trouvée, rediriger
            router.push("/update-inspection")
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'inspection:", error)
      }

      setIsLoading(false)
    }

    checkAuthorization()
  }, [inspectionId, router])

  // Fonction pour se connecter avec l'ID de l'agent
  const handleAgentIdSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!agentId.trim()) {
      alert("Veuillez saisir votre ID d'agent.")
      return
    }

    // Connexion avec l'ID de l'agent
    authService.login(agentId, `Agent ${agentId}`)

    // Vérifier l'autorisation après connexion
    const canEdit = authService.canEditForm(inspectionId)
    setIsAuthorized(canEdit)
    setShowAgentIdPrompt(false)

    if (!canEdit) {
      alert("Vous n'êtes pas autorisé à modifier cette fiche. Seul l'agent qui l'a créée peut la modifier.")
      router.push("/update-inspection")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inspection) return
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
      agentId: authService.getCurrentAgent()?.id || "",
      agentSignature,
    }

    try {
      // Récupérer toutes les inspections
      const stored = localStorage.getItem("pendingInspections")
      if (stored) {
        const parsedInspections = JSON.parse(stored)

        // Mettre à jour l'inspection spécifique
        const updatedInspections = parsedInspections.map((insp: any) => {
          if (insp.id === inspectionId) {
            // Ajouter la mise à jour à l'inspection
            const updates = insp.updates || []
            return {
              ...insp,
              updates: [...updates, update],
              lastUpdateDate: new Date().toISOString(),
            }
          }
          return insp
        })

        // Sauvegarder dans localStorage
        localStorage.setItem("pendingInspections", JSON.stringify(updatedInspections))

        // Afficher le message de succès
        setIsSubmitting(false)
        setShowSuccess(true)

        // Rediriger après 2 secondes
        setTimeout(() => {
          router.push("/update-inspection")
        }, 2000)
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error)
      setIsSubmitting(false)
      alert("Une erreur est survenue lors de la mise à jour.")
    }
  }

  // Si l'agent n'est pas encore identifié, afficher le formulaire d'identification
  if (showAgentIdPrompt) {
    return (
      <div className="container mx-auto py-6 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Identification requise</CardTitle>
            <CardDescription>Veuillez vous identifier pour accéder à cette fiche d'inspection</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAgentIdSubmit} className="space-y-4">
              <div>
                <label htmlFor="agent-id" className="block text-sm font-medium text-gray-700 mb-1">
                  ID Agent
                </label>
                <Input
                  id="agent-id"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  placeholder="Exemple: A12345"
                  className="w-full"
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Vérifier l'accès
              </Button>

              <div className="text-xs text-gray-500 text-center mt-4">
                <p>Seul l'agent ayant créé cette fiche peut la modifier.</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si la page est en cours de chargement
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 max-w-3xl">
        <div className="text-center py-8">Chargement...</div>
      </div>
    )
  }

  // Si l'utilisateur n'est pas autorisé
  if (!isAuthorized) {
    return (
      <div className="container mx-auto py-6 max-w-3xl">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-700 mb-4">Accès non autorisé</h2>
              <p className="text-red-600 mb-4">
                Vous n'êtes pas autorisé à modifier cette fiche. Seul l'agent qui l'a créée peut la modifier.
              </p>
              <Button onClick={() => router.push("/update-inspection")} className="bg-red-600 hover:bg-red-700">
                Retour à la liste
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si l'inspection n'a pas été trouvée
  if (!inspection) {
    return (
      <div className="container mx-auto py-6 max-w-3xl">
        <div className="text-center py-8">Fiche d'inspection non trouvée</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-3xl">
      <Button variant="ghost" onClick={() => router.push("/update-inspection")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Mise à jour de l'inspection</CardTitle>
          <CardDescription>
            Véhicule {inspection.vehicleInfo.immatriculation} - {new Date(inspection.date).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showSuccess ? (
            <div className="bg-green-50 p-4 rounded-md text-green-700 text-center">
              <p className="font-medium">Mise à jour enregistrée avec succès!</p>
              <p className="text-sm mt-1">Redirection en cours...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Bandeau d'information sur l'agent */}
              <div className="bg-blue-50 p-3 rounded-md flex items-center">
                <div className="mr-2 bg-blue-100 rounded-full p-1">
                  <AlertTriangle className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-sm text-blue-700">
                  <span className="font-medium">Agent connecté:</span> {authService.getCurrentAgent()?.name} (ID:{" "}
                  {authService.getCurrentAgent()?.id})
                </div>
              </div>

              {/* Détails de l'inspection */}
              <div className="bg-blue-50 p-3 rounded-md">
                <h3 className="font-medium mb-2">Détails de l'inspection</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">ID:</span> {inspection.id}
                  </div>
                  <div>
                    <span className="font-medium">Véhicule:</span> {inspection.vehicleInfo.immatriculation}
                  </div>
                  <div>
                    <span className="font-medium">Date:</span> {new Date(inspection.date).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Agent:</span> {inspection.agentName}
                  </div>
                </div>
              </div>

              {/* Observations existantes */}
              <div>
                <label className="block text-sm font-medium mb-1">Observations existantes</label>
                <div className="p-3 border rounded-md bg-gray-50 min-h-[80px]">
                  {inspection.observations || "Aucune observation"}
                </div>
              </div>

              {/* Mises à jour précédentes */}
              {inspection.updates && inspection.updates.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1">Mises à jour précédentes</label>
                  <div className="border rounded-md divide-y">
                    {inspection.updates.map((update: any, index: number) => (
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
                <Input
                  id="agent-name"
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
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
