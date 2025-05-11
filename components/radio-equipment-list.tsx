"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Download, Edit, Eye, Plus, Clock, AlertTriangle, Trash, FileText, Car } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function RadioEquipmentList() {
  const router = useRouter()
  const [equipmentForms, setEquipmentForms] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "perception" | "reintegration">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "submitted" | "modified">("all")
  const [showEndOfShiftAlert, setShowEndOfShiftAlert] = useState(true)

  // Charger les formulaires depuis localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("radioEquipmentForms")
      if (stored) {
        const parsedForms = JSON.parse(stored)
        // Trier par date décroissante (plus récentes d'abord)
        const sortedForms = parsedForms.sort(
          (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )
        setEquipmentForms(sortedForms)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des formulaires:", error)
    }
  }, [])

  // Filtrer les formulaires
  const filteredForms = equipmentForms.filter((form) => {
    // Filtre de recherche
    const matchesSearch =
      form.agentInfo.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.agentInfo.indicatifPatrouille.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (form.agentInfo.vehicleImmatriculation &&
        form.agentInfo.vehicleImmatriculation.toLowerCase().includes(searchTerm.toLowerCase()))

    // Filtre de type
    const matchesType = typeFilter === "all" || form.type === typeFilter

    // Filtre de statut
    const matchesStatus = statusFilter === "all" || form.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  // Identifier les formulaires qui nécessitent une mise à jour (perception sans réintégration)
  const needsUpdateForms = filteredForms.filter((form) => {
    // Vérifier si c'est une perception sans réintégration complète
    const hasPerception = form.type === "perception"
    const hasReintegration =
      form.radios.some((r: any) => r.reintegrationObservations) ||
      form.deportes.some((d: any) => d.reintegrationObservations)

    return hasPerception && !hasReintegration
  })

  // Naviguer vers la page de modification
  const handleEdit = (formId: string) => {
    router.push(`/radio-equipment-edit/${formId}`)
  }

  // Naviguer vers la page de détail
  const handleView = (formId: string) => {
    router.push(`/radio-equipment-detail/${formId}`)
  }

  // Naviguer vers la page de création
  const handleCreate = () => {
    router.push("/radio-equipment")
  }

  // Naviguer vers la page d'inspection de véhicule
  const handleVehicleInspection = () => {
    router.push("/vehicle-inspection")
  }

  // Exporter en PDF
  const handleExportPDF = (formId: string) => {
    alert(`Export PDF de la fiche ${formId} - Fonctionnalité à implémenter`)
  }

  // Supprimer une fiche
  const handleDelete = (formId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette fiche ? Cette action est irréversible.")) {
      try {
        const stored = localStorage.getItem("radioEquipmentForms")
        if (stored) {
          const forms = JSON.parse(stored)
          const updatedForms = forms.filter((f: any) => f.id !== formId)
          localStorage.setItem("radioEquipmentForms", JSON.stringify(updatedForms))
          setEquipmentForms(updatedForms)
        }
      } catch (error) {
        console.error("Erreur lors de la suppression:", error)
      }
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      {showEndOfShiftAlert && needsUpdateForms.length > 0 && (
        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Fin de vacation</AlertTitle>
          <AlertDescription className="text-amber-700">
            Vous avez {needsUpdateForms.length} fiche(s) de perception qui nécessite(nt) une mise à jour avec les
            observations de réintégration. Veuillez les compléter avant la fin de votre service.
          </AlertDescription>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 text-amber-700 border-amber-300"
            onClick={() => setShowEndOfShiftAlert(false)}
          >
            Fermer
          </Button>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Fiches de Perception Radio et Déportés</CardTitle>
              <CardDescription>Gestion des fiches de perception et réintégration des équipements</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleVehicleInspection}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                <Car className="h-4 w-4 mr-2" /> Perception véhicule
              </Button>
              <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" /> Nouvelle fiche radio
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Rechercher par agent, indicatif, immatriculation ou ID..."
                className="pl-8 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as "all" | "perception" | "reintegration")}
              >
                <option value="all">Tous les types</option>
                <option value="perception">Perception</option>
                <option value="reintegration">Réintégration</option>
              </select>
              <select
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "draft" | "submitted" | "modified")}
              >
                <option value="all">Tous les statuts</option>
                <option value="draft">Brouillon</option>
                <option value="submitted">Soumis</option>
                <option value="modified">Modifié</option>
              </select>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="py-3 px-4 text-left font-medium">ID</th>
                    <th className="py-3 px-4 text-left font-medium">Date</th>
                    <th className="py-3 px-4 text-left font-medium">Indicatif</th>
                    <th className="py-3 px-4 text-left font-medium">Agent</th>
                    <th className="py-3 px-4 text-left font-medium">Véhicule</th>
                    <th className="py-3 px-4 text-left font-medium">Type</th>
                    <th className="py-3 px-4 text-left font-medium">Statut</th>
                    <th className="py-3 px-4 text-left font-medium">Équipements</th>
                    <th className="py-3 px-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredForms.length > 0 ? (
                    filteredForms.map((form) => {
                      // Vérifier si cette fiche nécessite une mise à jour
                      const needsUpdate =
                        form.type === "perception" &&
                        !(
                          form.radios.some((r: any) => r.reintegrationObservations) ||
                          form.deportes.some((d: any) => d.reintegrationObservations)
                        )

                      return (
                        <tr key={form.id} className={`border-b hover:bg-gray-50 ${needsUpdate ? "bg-amber-50" : ""}`}>
                          <td className="py-3 px-4 font-medium">{form.id}</td>
                          <td className="py-3 px-4">{new Date(form.date).toLocaleDateString()}</td>
                          <td className="py-3 px-4">{form.agentInfo.indicatifPatrouille}</td>
                          <td className="py-3 px-4">{form.agentInfo.agentName}</td>
                          <td className="py-3 px-4">
                            {form.agentInfo.vehicleImmatriculation ? (
                              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                {form.agentInfo.vehicleImmatriculation}
                              </Badge>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <TypeBadge type={form.type} />
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={form.status || "submitted"} />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-1">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Radios: {form.radios.filter((r: any) => r.id).length}
                              </Badge>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Déportés: {form.deportes.filter((d: any) => d.id).length}
                              </Badge>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleView(form.id)}
                                className="h-8 px-2"
                              >
                                <Eye className="h-3 w-3 mr-1" /> Voir
                              </Button>
                              <Button
                                variant={needsUpdate ? "default" : "outline"}
                                size="sm"
                                className={`h-8 px-2 ${needsUpdate ? "bg-amber-600 hover:bg-amber-700" : "text-blue-600"}`}
                                onClick={() => handleEdit(form.id)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                {needsUpdate ? "Compléter" : "Modifier"}
                              </Button>
                              <div className="dropdown relative group">
                                <Button variant="ghost" size="sm" className="h-8 px-2">
                                  <span className="sr-only">Plus d'actions</span>
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                    />
                                  </svg>
                                </Button>
                                <div className="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                                  <div className="py-1">
                                    <button
                                      onClick={() => handleExportPDF(form.id)}
                                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                      <FileText className="h-4 w-4 mr-2" /> Exporter PDF
                                    </button>
                                    <button
                                      onClick={() => handleDelete(form.id)}
                                      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                    >
                                      <Trash className="h-4 w-4 mr-2" /> Supprimer
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {needsUpdate && (
                              <div className="mt-1 flex items-center text-amber-600 text-xs">
                                <Clock className="h-3 w-3 mr-1" /> Réintégration requise
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-4 px-4 text-center text-gray-500">
                        Aucun formulaire ne correspond aux critères de recherche
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TypeBadge({ type }: { type: string }) {
  switch (type) {
    case "perception":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Perception</Badge>
    case "reintegration":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Réintégration</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{type || "Non défini"}</Badge>
  }
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "draft":
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Brouillon</Badge>
    case "submitted":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Soumis</Badge>
    case "modified":
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Modifié</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>
  }
}
