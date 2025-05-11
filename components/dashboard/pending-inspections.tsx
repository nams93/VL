"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Clock, Eye, AlertTriangle, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SignaturePad } from "@/components/signature-pad"

export function PendingInspections() {
  const [pendingInspections, setPendingInspections] = useState<any[]>([])
  const [selectedInspection, setSelectedInspection] = useState<any | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [cdeSignature, setCdeSignature] = useState<string | null>(null)
  const [cdeName, setCdeName] = useState("")

  // Charger les inspections en attente depuis localStorage
  useEffect(() => {
    const loadPendingInspections = () => {
      try {
        const stored = localStorage.getItem("pendingInspections")
        if (stored) {
          setPendingInspections(JSON.parse(stored))
        }
      } catch (error) {
        console.error("Erreur lors du chargement des inspections:", error)
      }
    }

    loadPendingInspections()
    // Actualiser les données périodiquement
    const interval = setInterval(loadPendingInspections, 5000)
    return () => clearInterval(interval)
  }, [])

  // Filtrer les inspections en fonction du terme de recherche
  const filteredInspections = pendingInspections.filter(
    (inspection) =>
      inspection.vehicleInfo.immatriculation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Fonction pour valider une inspection
  const validateInspection = (inspection: any, isApproved: boolean) => {
    // Si c'est une validation et qu'il n'y a pas de signature CDE, demander une signature
    if (isApproved && !inspection.cdeSignature && !cdeSignature) {
      alert("Veuillez ajouter votre signature CDE avant de valider l'inspection.")
      return
    }

    // Mettre à jour le statut de l'inspection
    const updatedInspections = pendingInspections.map((item) => {
      if (item.id === inspection.id) {
        return {
          ...item,
          status: isApproved ? "conforme" : "non-conforme",
          validatedAt: new Date().toISOString(),
          validatedBy: cdeName || "Admin",
          cdeSignature: cdeSignature || item.cdeSignature,
          cdeName: cdeName || item.cdeName,
        }
      }
      return item
    })

    // Mettre à jour localStorage pour persister les données
    localStorage.setItem("pendingInspections", JSON.stringify(updatedInspections))
    setPendingInspections(updatedInspections)
    setSelectedInspection(null)
    setCdeSignature(null)
    setCdeName("")

    // Afficher un message de confirmation
    alert(`L'inspection ${inspection.id} a été ${isApproved ? "validée" : "rejetée"} avec succès.`)
  }

  return (
    <div className="space-y-4">
      {selectedInspection ? (
        <InspectionDetail
          inspection={selectedInspection}
          onBack={() => setSelectedInspection(null)}
          onValidate={(isApproved) => validateInspection(selectedInspection, isApproved)}
          cdeSignature={cdeSignature}
          setCdeSignature={setCdeSignature}
          cdeName={cdeName}
          setCdeName={setCdeName}
        />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Inspections en attente de validation</CardTitle>
                <CardDescription>Validez les inspections soumises par les agents</CardDescription>
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
                      <th className="py-3 px-4 text-left font-medium">Immatriculation</th>
                      <th className="py-3 px-4 text-left font-medium">Date</th>
                      <th className="py-3 px-4 text-left font-medium">Agent</th>
                      <th className="py-3 px-4 text-left font-medium">Statut</th>
                      <th className="py-3 px-4 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInspections.length > 0 ? (
                      filteredInspections.map((inspection) => (
                        <tr key={inspection.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{inspection.id}</td>
                          <td className="py-3 px-4">{inspection.vehicleInfo.immatriculation}</td>
                          <td className="py-3 px-4">{new Date(inspection.date).toLocaleDateString()}</td>
                          <td className="py-3 px-4">{inspection.agentName}</td>
                          <td className="py-3 px-4">
                            <StatusBadge status={inspection.status} />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => setSelectedInspection(inspection)}>
                                <Eye className="h-3 w-3 mr-1" /> Examiner
                              </Button>
                              {inspection.status === "en-attente" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                                    onClick={() => validateInspection(inspection, true)}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" /> Valider
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                                    onClick={() => validateInspection(inspection, false)}
                                  >
                                    <XCircle className="h-3 w-3 mr-1" /> Rejeter
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-4 px-4 text-center text-gray-500">
                          Aucune inspection en attente de validation
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

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "conforme":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <CheckCircle className="h-3 w-3 mr-1" /> Validée
        </Badge>
      )
    case "non-conforme":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          <XCircle className="h-3 w-3 mr-1" /> Rejetée
        </Badge>
      )
    case "en-attente":
    default:
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          <Clock className="h-3 w-3 mr-1" /> En attente
        </Badge>
      )
  }
}

function InspectionDetail({
  inspection,
  onBack,
  onValidate,
  cdeSignature,
  setCdeSignature,
  cdeName,
  setCdeName,
}: {
  inspection: any
  onBack: () => void
  onValidate: (isApproved: boolean) => void
  cdeSignature: string | null
  setCdeSignature: (signature: string | null) => void
  cdeName: string
  setCdeName: (name: string) => void
}) {
  // Calculer le nombre de problèmes
  const calculateIssues = () => {
    let issues = 0

    // Vérifier les feux avant
    inspection.lightsFront.forEach((item: any) => {
      if (item.value === "non") issues++
    })

    // Vérifier les feux arrière
    inspection.lightsRear.forEach((item: any) => {
      if (item.value === "non") issues++
    })

    // Vérifier les équipements avant
    inspection.equipmentFront.forEach((item: any) => {
      if (item.value === "non") issues++
    })

    // Vérifier les équipements arrière
    inspection.equipmentRear.forEach((item: any) => {
      if (item.value === "non") issues++
    })

    return issues
  }

  const issuesCount = calculateIssues()
  const hasIssues = issuesCount > 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
              ← Retour à la liste
            </Button>
            <CardTitle>Détail de l'inspection {inspection.id}</CardTitle>
            <CardDescription>
              Véhicule {inspection.vehicleInfo.immatriculation} - {new Date(inspection.date).toLocaleDateString()}
            </CardDescription>
          </div>
          {inspection.status === "en-attente" && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                onClick={() => onValidate(true)}
              >
                <CheckCircle className="h-4 w-4 mr-2" /> Valider l'inspection
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                onClick={() => onValidate(false)}
              >
                <XCircle className="h-4 w-4 mr-2" /> Rejeter l'inspection
              </Button>
            </div>
          )}
        </div>

        {hasIssues && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            <div>
              <p className="font-medium text-amber-800">Attention: {issuesCount} problème(s) détecté(s)</p>
              <p className="text-sm text-amber-700">
                Cette inspection contient des éléments non conformes qui nécessitent votre attention.
              </p>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary">
          <TabsList className="w-full">
            <TabsTrigger value="summary">Résumé</TabsTrigger>
            <TabsTrigger value="lights">Feux</TabsTrigger>
            <TabsTrigger value="equipment">Équipements</TabsTrigger>
            <TabsTrigger value="observations">Observations</TabsTrigger>
            <TabsTrigger value="signatures">Signatures</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="p-4 border rounded-md mt-4">
            <h3 className="font-medium mb-4">Résumé de l'inspection</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm font-medium mb-1">Feux</div>
                  <div className="text-2xl font-bold">
                    {!hasIssues ? (
                      <span className="text-green-600">100%</span>
                    ) : (
                      <span className="text-red-600">75%</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {!hasIssues ? "Tous conformes" : `${issuesCount} problèmes détectés`}
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm font-medium mb-1">Équipements</div>
                  <div className="text-2xl font-bold">
                    {!hasIssues ? (
                      <span className="text-green-600">100%</span>
                    ) : (
                      <span className="text-red-600">83%</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {!hasIssues ? "Tous conformes" : `${issuesCount} éléments manquants`}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-sm font-medium mb-1">Observations</div>
                <p className="text-sm">{inspection.observations || "Aucune observation particulière."}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-sm font-medium mb-1">Signatures</div>
                <div className="flex justify-between">
                  <div>
                    <div className="text-xs text-gray-500">Agent:</div>
                    <div className="text-sm font-medium">
                      {inspection.agentSignature ? (
                        <span className="text-green-600">{inspection.agentName} ✓</span>
                      ) : (
                        <span className="text-red-600">Non signé ✗</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">CDE:</div>
                    <div className="text-sm font-medium">
                      {inspection.cdeSignature || cdeSignature ? (
                        <span className="text-green-600">{inspection.cdeName || cdeName} ✓</span>
                      ) : (
                        <span className="text-red-600">Non signé ✗</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="lights" className="p-4 border rounded-md mt-4">
            <h3 className="font-medium mb-4">État des feux</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Feux avant</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">Élément</th>
                      <th className="py-2 text-center">État</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspection.lightsFront.map((item: any, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{item.label}</td>
                        <td className="py-2 text-center">
                          {item.value === "oui" ? (
                            <span className="text-green-600">✓</span>
                          ) : item.value === "non" ? (
                            <span className="text-red-600">✗</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Feux arrière</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">Élément</th>
                      <th className="py-2 text-center">État</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspection.lightsRear.map((item: any, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{item.label}</td>
                        <td className="py-2 text-center">
                          {item.value === "oui" ? (
                            <span className="text-green-600">✓</span>
                          ) : item.value === "non" ? (
                            <span className="text-red-600">✗</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="equipment" className="p-4 border rounded-md mt-4">
            <h3 className="font-medium mb-4">État des équipements</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Équipements avant</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">Élément</th>
                      <th className="py-2 text-center">État</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspection.equipmentFront.map((item: any, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{item.label}</td>
                        <td className="py-2 text-center">
                          {item.value === "oui" ? (
                            <span className="text-green-600">✓</span>
                          ) : item.value === "non" ? (
                            <span className="text-red-600">✗</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Équipements arrière</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">Élément</th>
                      <th className="py-2 text-center">État</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspection.equipmentRear.map((item: any, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{item.label}</td>
                        <td className="py-2 text-center">
                          {item.value === "oui" ? (
                            <span className="text-green-600">✓</span>
                          ) : item.value === "non" ? (
                            <span className="text-red-600">✗</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="observations" className="p-4 border rounded-md mt-4">
            <h3 className="font-medium mb-4">Observations</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm">
                {inspection.observations || "Aucune observation particulière. Le véhicule est en bon état général."}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="signatures" className="p-4 border rounded-md mt-4">
            <h3 className="font-medium mb-4">Signatures</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-md p-4">
                <h4 className="text-sm font-medium mb-2">Signature agent contrôleur</h4>
                {inspection.agentSignature ? (
                  <div className="bg-gray-50 p-4 rounded-md flex flex-col items-center">
                    <div className="italic text-blue-600 text-lg mb-2">{inspection.agentName}</div>
                    <img
                      src={inspection.agentSignature || "/placeholder.svg"}
                      alt="Signature de l'agent"
                      className="max-h-24 border border-gray-200 rounded-md"
                    />
                    <div className="text-xs text-gray-500 mt-2">
                      Signé le {new Date(inspection.date).toLocaleDateString()} à{" "}
                      {new Date(inspection.date).toLocaleTimeString()}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-md flex flex-col items-center">
                    <div className="text-red-600 mb-2">Signature manquante</div>
                  </div>
                )}
              </div>

              <div className="border rounded-md p-4">
                <h4 className="text-sm font-medium mb-2">Signature CDE</h4>
                {inspection.cdeSignature ? (
                  <div className="bg-gray-50 p-4 rounded-md flex flex-col items-center">
                    <div className="italic text-blue-600 text-lg mb-2">{inspection.cdeName}</div>
                    <img
                      src={inspection.cdeSignature || "/placeholder.svg"}
                      alt="Signature du CDE"
                      className="max-h-24 border border-gray-200 rounded-md"
                    />
                    <div className="text-xs text-gray-500 mt-2">
                      Signé le {new Date(inspection.date).toLocaleDateString()} à{" "}
                      {new Date(inspection.date).toLocaleTimeString()}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label htmlFor="cde-name" className="block text-xs text-gray-600 mb-1">
                      Nom et prénom du CDE
                    </label>
                    <Input
                      placeholder="Nom et prénom du CDE"
                      value={cdeName}
                      onChange={(e) => setCdeName(e.target.value)}
                      className="h-8 text-sm mb-2"
                    />
                    <SignaturePad onSignatureChange={setCdeSignature} label="Ajouter votre signature CDE" />
                    {cdeSignature ? (
                      <div className="text-center text-green-600 text-sm">
                        Signature ajoutée. Veuillez valider l'inspection pour l'enregistrer.
                      </div>
                    ) : (
                      <div className="text-center text-amber-600 text-sm">
                        Veuillez signer en tant que CDE avant de valider l'inspection.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
