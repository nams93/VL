"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download, Edit, User, Calendar, Radio, Smartphone, History } from "lucide-react"

export function RadioEquipmentDetail({ formId }: { formId: string }) {
  const router = useRouter()
  const [form, setForm] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("radioEquipmentForms")
      if (stored) {
        const forms = JSON.parse(stored)
        const foundForm = forms.find((f: any) => f.id === formId)
        if (foundForm) {
          setForm(foundForm)
        } else {
          console.error("Formulaire non trouvé")
        }
      }
      setLoading(false)
    } catch (error) {
      console.error("Erreur lors du chargement du formulaire:", error)
      setLoading(false)
    }
  }, [formId])

  const handleEdit = () => {
    router.push(`/radio-equipment-edit/${formId}`)
  }

  const handleBack = () => {
    router.push("/radio-equipment-list")
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <Card>
          <CardContent className="p-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Formulaire non trouvé</h2>
              <p className="text-gray-500 mb-4">Le formulaire que vous recherchez n'existe pas ou a été supprimé.</p>
              <Button onClick={handleBack}>Retour à la liste</Button>
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
            <div>
              <Button variant="ghost" size="sm" onClick={handleBack} className="mb-2">
                <ArrowLeft className="h-4 w-4 mr-2" /> Retour à la liste
              </Button>
              <CardTitle>Détail du formulaire {form.id}</CardTitle>
              <CardDescription>
                {form.type === "perception" ? "Perception" : "Réintégration"} -{" "}
                {new Date(form.date).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" /> Exporter PDF
              </Button>
              <Button size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" /> Modifier
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
                  <div className="flex justify-between">
                    <span className="text-gray-500">Statut:</span>
                    <StatusBadge status={form.status || "submitted"} />
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

              {form.history && form.history.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2 flex items-center">
                    <History className="h-4 w-4 mr-2 text-blue-600" /> Historique des modifications
                  </h3>
                  <div className="space-y-2 text-sm max-h-80 overflow-y-auto pr-1">
                    {form.history.map((entry: any, index: number) => (
                      <div key={index} className="border-b pb-2 last:border-0 last:pb-0">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Date:</span>
                          <span className="font-medium">{new Date(entry.date).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Agent:</span>
                          <span className="font-medium">{entry.agent}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Action:</span>
                          <span className="font-medium text-right">{entry.action}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <Tabs defaultValue="deportes">
                <TabsList className="w-full">
                  <TabsTrigger value="deportes">Déportés</TabsTrigger>
                  <TabsTrigger value="radios">Radios</TabsTrigger>
                </TabsList>

                <TabsContent value="deportes" className="p-4 border rounded-md mt-4">
                  <h3 className="font-medium mb-4 flex items-center">
                    <Smartphone className="h-4 w-4 mr-2 text-blue-600" /> Équipements déportés
                  </h3>

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
                  <h3 className="font-medium mb-4 flex items-center">
                    <Radio className="h-4 w-4 mr-2 text-blue-600" /> Équipements radio
                  </h3>

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
    </div>
  )
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
