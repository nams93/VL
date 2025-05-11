"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Car,
} from "lucide-react"

// Types
type InspectionStatus = "conforme" | "non-conforme" | "en-attente"

type Inspection = {
  id: string
  vehicleId: string
  immatriculation: string
  date: string
  agent: string
  status: InspectionStatus
  issues: number
  signatureAgent: boolean
  signatureCDE: boolean
}

// Données fictives
const inspections: Inspection[] = [
  {
    id: "INS-001",
    vehicleId: "v1",
    immatriculation: "AB-123-CD",
    date: "15/05/2023",
    agent: "Jean Dupont",
    status: "conforme",
    issues: 0,
    signatureAgent: true,
    signatureCDE: true,
  },
  {
    id: "INS-002",
    vehicleId: "v2",
    immatriculation: "EF-456-GH",
    date: "20/06/2023",
    agent: "Marie Martin",
    status: "non-conforme",
    issues: 3,
    signatureAgent: true,
    signatureCDE: true,
  },
  {
    id: "INS-003",
    vehicleId: "v3",
    immatriculation: "IJ-789-KL",
    date: "05/07/2023",
    agent: "Pierre Durand",
    status: "conforme",
    issues: 0,
    signatureAgent: true,
    signatureCDE: true,
  },
  {
    id: "INS-004",
    vehicleId: "v1",
    immatriculation: "AB-123-CD",
    date: "10/07/2023",
    agent: "Sophie Petit",
    status: "conforme",
    issues: 0,
    signatureAgent: true,
    signatureCDE: true,
  },
  {
    id: "INS-005",
    vehicleId: "v4",
    immatriculation: "MN-012-OP",
    date: "25/07/2023",
    agent: "Lucas Bernard",
    status: "non-conforme",
    issues: 2,
    signatureAgent: true,
    signatureCDE: false,
  },
  {
    id: "INS-006",
    vehicleId: "v5",
    immatriculation: "QR-345-ST",
    date: "28/07/2023",
    agent: "Emma Leroy",
    status: "en-attente",
    issues: 0,
    signatureAgent: true,
    signatureCDE: false,
  },
  {
    id: "INS-007",
    vehicleId: "v6",
    immatriculation: "UV-678-WX",
    date: "30/07/2023",
    agent: "Thomas Dubois",
    status: "en-attente",
    issues: 0,
    signatureAgent: false,
    signatureCDE: false,
  },
]

export function InspectionHistory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<InspectionStatus | "all">("all")
  const [signatureFilter, setSignatureFilter] = useState<"all" | "complete" | "incomplete">("all")
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null)

  // Filtrer les inspections
  const filteredInspections = inspections.filter((inspection) => {
    // Filtre de recherche
    const matchesSearch =
      inspection.immatriculation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.agent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.id.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtre de statut
    const matchesStatus = statusFilter === "all" || inspection.status === statusFilter

    // Filtre de signature
    const isComplete = inspection.signatureAgent && inspection.signatureCDE
    const matchesSignature =
      signatureFilter === "all" ||
      (signatureFilter === "complete" && isComplete) ||
      (signatureFilter === "incomplete" && !isComplete)

    return matchesSearch && matchesStatus && matchesSignature
  })

  return (
    <div className="space-y-4">
      {selectedInspection ? (
        <InspectionDetail inspection={selectedInspection} onBack={() => setSelectedInspection(null)} />
      ) : (
        <>
          {/* En-tête et filtres */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Historique des Inspections</CardTitle>
                  <CardDescription>Suivi des formulaires d'inspection avec signatures</CardDescription>
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
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as InspectionStatus | "all")}
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="conforme">Conforme</option>
                      <option value="non-conforme">Non-conforme</option>
                      <option value="en-attente">En attente</option>
                    </select>
                    <select
                      className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                      value={signatureFilter}
                      onChange={(e) => setSignatureFilter(e.target.value as "all" | "complete" | "incomplete")}
                    >
                      <option value="all">Toutes les signatures</option>
                      <option value="complete">Signatures complètes</option>
                      <option value="incomplete">Signatures incomplètes</option>
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
                        <th className="py-3 px-4 text-left font-medium">Immatriculation</th>
                        <th className="py-3 px-4 text-left font-medium">Date</th>
                        <th className="py-3 px-4 text-left font-medium">Agent</th>
                        <th className="py-3 px-4 text-left font-medium">Statut</th>
                        <th className="py-3 px-4 text-left font-medium">Signatures</th>
                        <th className="py-3 px-4 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInspections.length > 0 ? (
                        filteredInspections.map((inspection) => (
                          <tr key={inspection.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{inspection.id}</td>
                            <td className="py-3 px-4">{inspection.immatriculation}</td>
                            <td className="py-3 px-4">{inspection.date}</td>
                            <td className="py-3 px-4">{inspection.agent}</td>
                            <td className="py-3 px-4">
                              <StatusBadge status={inspection.status} issues={inspection.issues} />
                            </td>
                            <td className="py-3 px-4">
                              <SignatureBadge agent={inspection.signatureAgent} cde={inspection.signatureCDE} />
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" onClick={() => setSelectedInspection(inspection)}>
                                  <Eye className="h-3 w-3 mr-1" /> Voir
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                                >
                                  <FileText className="h-3 w-3 mr-1" /> PDF
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-4 px-4 text-center text-gray-500">
                            Aucune inspection ne correspond aux critères de recherche
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  Affichage de {filteredInspections.length} inspections sur {inspections.length}
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Précédent
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Suivant
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function StatusBadge({ status, issues }: { status: InspectionStatus; issues: number }) {
  switch (status) {
    case "conforme":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <CheckCircle className="h-3 w-3 mr-1" /> Conforme
        </Badge>
      )
    case "non-conforme":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          <AlertTriangle className="h-3 w-3 mr-1" /> Non-conforme ({issues})
        </Badge>
      )
    case "en-attente":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          <Clock className="h-3 w-3 mr-1" /> En attente
        </Badge>
      )
  }
}

function SignatureBadge({ agent, cde }: { agent: boolean; cde: boolean }) {
  if (agent && cde) {
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Complètes</Badge>
  } else if (agent || cde) {
    return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Partielles</Badge>
  } else {
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Manquantes</Badge>
  }
}

function InspectionDetail({ inspection, onBack }: { inspection: Inspection; onBack: () => void }) {
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
              Véhicule {inspection.immatriculation} - {inspection.date}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" /> Exporter PDF
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" /> Planifier
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2 flex items-center">
                <Car className="h-4 w-4 mr-2 text-blue-600" /> Informations du véhicule
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Immatriculation:</span>
                  <span className="font-medium">{inspection.immatriculation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium">Voiture</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Statut:</span>
                  <span className="font-medium">
                    <StatusBadge status={inspection.status} issues={inspection.issues} />
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2 flex items-center">
                <User className="h-4 w-4 mr-2 text-blue-600" /> Informations de l'agent
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nom:</span>
                  <span className="font-medium">{inspection.agent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="font-medium">{inspection.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Signature agent:</span>
                  <span className="font-medium">
                    {inspection.signatureAgent ? (
                      <span className="text-green-600">✓ Présente</span>
                    ) : (
                      <span className="text-red-600">✗ Manquante</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Signature CDE:</span>
                  <span className="font-medium">
                    {inspection.signatureCDE ? (
                      <span className="text-green-600">✓ Présente</span>
                    ) : (
                      <span className="text-red-600">✗ Manquante</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
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
                        {inspection.status === "conforme" ? (
                          <span className="text-green-600">100%</span>
                        ) : (
                          <span className="text-red-600">75%</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {inspection.status === "conforme" ? "Tous conformes" : "3 problèmes détectés"}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="text-sm font-medium mb-1">Équipements</div>
                      <div className="text-2xl font-bold">
                        {inspection.status === "conforme" ? (
                          <span className="text-green-600">100%</span>
                        ) : (
                          <span className="text-red-600">83%</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {inspection.status === "conforme" ? "Tous conformes" : "2 éléments manquants"}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="text-sm font-medium mb-1">Observations</div>
                    <p className="text-sm">
                      {inspection.status === "conforme"
                        ? "Aucune observation particulière. Le véhicule est en bon état général."
                        : "Phare avant droit défectueux. Extincteur à remplacer. Niveau d'huile bas."}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="text-sm font-medium mb-1">Signatures</div>
                    <div className="flex justify-between">
                      <div>
                        <div className="text-xs text-gray-500">Agent:</div>
                        <div className="text-sm font-medium">
                          {inspection.signatureAgent ? (
                            <span className="text-green-600">{inspection.agent} ✓</span>
                          ) : (
                            <span className="text-red-600">Non signé ✗</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">CDE:</div>
                        <div className="text-sm font-medium">
                          {inspection.signatureCDE ? (
                            <span className="text-green-600">Responsable CDE ✓</span>
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
                        <tr className="border-b">
                          <td className="py-2">Feu de position</td>
                          <td className="py-2 text-center">
                            {inspection.status === "conforme" ? (
                              <span className="text-green-600">✓</span>
                            ) : (
                              <span className="text-red-600">✗</span>
                            )}
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Feu de croisement</td>
                          <td className="py-2 text-center">
                            <span className="text-green-600">✓</span>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Feu de route</td>
                          <td className="py-2 text-center">
                            <span className="text-green-600">✓</span>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Clignotants</td>
                          <td className="py-2 text-center">
                            <span className="text-green-600">✓</span>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Feu de brouillard</td>
                          <td className="py-2 text-center">
                            <span className="text-green-600">✓</span>
                          </td>
                        </tr>
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
                        <tr className="border-b">
                          <td className="py-2">Feu de stop</td>
                          <td className="py-2 text-center">
                            <span className="text-green-600">✓</span>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Feu de recul</td>
                          <td className="py-2 text-center">
                            <span className="text-green-600">✓</span>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Feu de route</td>
                          <td className="py-2 text-center">
                            <span className="text-green-600">✓</span>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Clignotants</td>
                          <td className="py-2 text-center">
                            <span className="text-green-600">✓</span>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Feu de plaque</td>
                          <td className="py-2 text-center">
                            <span className="text-green-600">✓</span>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Feu de brouillard</td>
                          <td className="py-2 text-center">
                            <span className="text-green-600">✓</span>
                          </td>
                        </tr>
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
                        <tr className="border-b">
                          <td className="py-2">Lot de bord</td>
                          <td className="py-2 text-center">
                            <span className="text-green-600">✓</span>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Carnet de bord</td>
                          <td className="py-2 text-center">
                            <span className="text-green-600">✓</span>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Roue de secours</td>
                          <td className="py-2 text-center">
                            <span className="text-green-600">✓</span>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Crick</td>
                          <td className="py-2 text-center">
                            <span className="text-green-600">✓</span>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Cône de Lubeck</td>
                          <td className="py-2 text-center">
                            <span className="text-green-600">✓</span>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Extincteur</td>
                          <td className="py-2 text-center">
                            {inspection.status === "conforme" ? (
                              <span className="text-green-600">✓</span>
                            ) : (
                              <span className="text-red-600">✗</span>
                            )}
                          </td>
                        </tr>
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
                        <tr className="border-b">
                          <td className="py-2">Constat amiable</td>
                          <td className="py-2 text-center">
                            <span className="text-green-600">✓</span>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Carte grise</td>
                          <td className="py-2 text-center">
                            <span className="text-green-600">✓</span>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Attestation assurance</td>
                          <td className="py-2 text-center">
                            <span className="text-green-600">✓</span>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Fonctionnement radio</td>
                          <td className="py-2 text-center">
                            <span className="text-green-600">✓</span>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Bouclier</td>
                          <td className="py-2 text-center">
                            {inspection.status === "conforme" ? (
                              <span className="text-green-600">✓</span>
                            ) : (
                              <span className="text-red-600">✗</span>
                            )}
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Cahier remise OPJ</td>
                          <td className="py-2 text-center">
                            <span className="text-green-600">✓</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="observations" className="p-4 border rounded-md mt-4">
                <h3 className="font-medium mb-4">Observations</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm">
                    {inspection.status === "conforme"
                      ? "Aucune observation particulière. Le véhicule est en bon état général."
                      : "Phare avant droit défectueux. Extincteur à remplacer (date de validité dépassée). Niveau d'huile bas, à compléter avant la prochaine sortie. Bouclier arrière légèrement endommagé suite à un accrochage mineur."}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="signatures" className="p-4 border rounded-md mt-4">
                <h3 className="font-medium mb-4">Signatures</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-md p-4">
                    <h4 className="text-sm font-medium mb-2">Signature agent contrôleur</h4>
                    {inspection.signatureAgent ? (
                      <div className="bg-gray-50 p-4 rounded-md flex flex-col items-center">
                        <div className="italic text-blue-600 text-lg mb-2">{inspection.agent}</div>
                        <div className="text-xs text-gray-500">Signé le {inspection.date} à 09:45</div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-md flex flex-col items-center">
                        <div className="text-red-600 mb-2">Signature manquante</div>
                        <Button size="sm" variant="outline">
                          Demander signature
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="border rounded-md p-4">
                    <h4 className="text-sm font-medium mb-2">Signature CDE</h4>
                    {inspection.signatureCDE ? (
                      <div className="bg-gray-50 p-4 rounded-md flex flex-col items-center">
                        <div className="italic text-blue-600 text-lg mb-2">Responsable CDE</div>
                        <div className="text-xs text-gray-500">Signé le {inspection.date} à 14:30</div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-md flex flex-col items-center">
                        <div className="text-red-600 mb-2">Signature manquante</div>
                        <Button size="sm" variant="outline">
                          Demander signature
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
