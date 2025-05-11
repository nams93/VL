"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Download, Eye, Radio, Smartphone, Calendar, User } from "lucide-react"

export function RadioEquipmentHistory() {
  const [equipmentForms, setEquipmentForms] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "perception" | "reintegration">("all")
  const [selectedForm, setSelectedForm] = useState<any | null>(null)

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
      form.id.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtre de type
    const matchesType = typeFilter === "all" || form.type === typeFilter

    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-4">
      {selectedForm ? (
        <EquipmentFormDetail form={selectedForm} onBack={() => setSelectedForm(null)} />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Historique des Équipements Radio et Déportés</CardTitle>
                <CardDescription>Suivi des perceptions et réintégrations des équipements</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Rechercher..."
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
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="py-3 px-4 text-left font-medium">ID</th>
                      <th className="py-3 px-4 text-left font-medium">Date</th>
                      <th className="py-3 px-4 text-left font-medium">Indicatif</th>
                      <th className="py-3 px-4 text-left font-medium">Agent</th>
                      <th className="py-3 px-4 text-left font-medium">Type</th>
                      <th className="py-3 px-4 text-left font-medium">Équipements</th>
                      <th className="py-3 px-4 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredForms.length > 0 ? (
                      filteredForms.map((form) => (
                        <tr key={form.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{form.id}</td>
                          <td className="py-3 px-4">{new Date(form.date).toLocaleDateString()}</td>
                          <td className="py-3 px-4">{form.agentInfo.indicatifPatrouille}</td>
                          <td className="py-3 px-4">{form.agentInfo.agentName}</td>
                          <td className="py-3 px-4">
                            <TypeBadge type={form.type} />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-1">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                <Radio className="h-3 w-3 mr-1" />
                                {form.radios.filter((r: any) => r.id).length}
                              </Badge>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Smartphone className="h-3 w-3 mr-1" />
                                {form.deportes.filter((d: any) => d.id).length}
                              </Badge>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => setSelectedForm(form)}>
                                <Eye className="h-3 w-3 mr-1" /> Voir
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                              >
                                <Download className="h-3 w-3 mr-1" /> PDF
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-4 px-4 text-center text-gray-500">
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
      )}
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
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{type}</Badge>
  }
}

function EquipmentFormDetail({ form, onBack }: { form: any; onBack: () => void }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
              ← Retour à la liste
            </Button>
            <CardTitle>Détail du formulaire {form.id}</CardTitle>
            <CardDescription>
              {form.type === "perception" ? "Perception" : "Réintégration"} - {new Date(form.date).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" /> Exporter PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2 flex items-center">
                <User className="h-4 w-4 mr-2 text-blue-600" /> Informations générales
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Indicatif:</span>
                  <span className="font-medium">{form.agentInfo.indicatifPatrouille}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Agent:</span>
                  <span className="font-medium">{form.agentInfo.agentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="font-medium">{new Date(form.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium capitalize">{form.type}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-blue-600" /> Signatures
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Agent:</span>
                  <span className="font-medium">
                    {form.agentSignature ? (
                      <span className="text-green-600">✓ Signé</span>
                    ) : (
                      <span className="text-red-600">✗ Non signé</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">CDE:</span>
                  <span className="font-medium">
                    {form.cdeSignature ? (
                      <span className="text-green-600">✓ Signé</span>
                    ) : (
                      <span className="text-red-600">✗ Non signé</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <Tabs defaultValue="deportes">
              <TabsList className="w-full">
                <TabsTrigger value="deportes">Déportés</TabsTrigger>
                <TabsTrigger value="radios">Radios</TabsTrigger>
              </TabsList>

              <TabsContent value="deportes" className="p-4 border rounded-md mt-4">
                <h3 className="font-medium mb-4">Équipements déportés</h3>

                <div className="space-y-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left">N° Déporté</th>
                        <th className="py-2 text-left">Constatations</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.deportes
                        .filter((d: any) => d.id)
                        .map((deporte: any, index: number) => (
                          <tr key={index} className="border-b">
                            <td className="py-2 font-medium">{deporte.id}</td>
                            <td className="py-2">
                              {form.type === "perception"
                                ? deporte.perceptionNote || "Aucune constatation"
                                : deporte.reintegrationNote || "Aucune constatation"}
                            </td>
                          </tr>
                        ))}
                      {form.deportes.filter((d: any) => d.id).length === 0 && (
                        <tr>
                          <td colSpan={2} className="py-4 text-center text-gray-500">
                            Aucun équipement déporté enregistré
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="radios" className="p-4 border rounded-md mt-4">
                <h3 className="font-medium mb-4">Équipements radio</h3>

                <div className="space-y-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left">N° Radio</th>
                        <th className="py-2 text-left">Constatations</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.radios
                        .filter((r: any) => r.id)
                        .map((radio: any, index: number) => (
                          <tr key={index} className="border-b">
                            <td className="py-2 font-medium">{radio.id}</td>
                            <td className="py-2">
                              {form.type === "perception"
                                ? radio.perceptionNote || "Aucune constatation"
                                : radio.reintegrationNote || "Aucune constatation"}
                            </td>
                          </tr>
                        ))}
                      {form.radios.filter((r: any) => r.id).length === 0 && (
                        <tr>
                          <td colSpan={2} className="py-4 text-center text-gray-500">
                            Aucun équipement radio enregistré
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
