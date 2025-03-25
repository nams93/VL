"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Download, User, CheckCircle, Clock, BarChart3, Calendar, ArrowUpDown, Car } from "lucide-react"

// Types
type AgentStatus = "actif" | "inactif" | "congé"

type Agent = {
  id: string
  name: string
  status: AgentStatus
  inspections: number
  conformRate: number
  lastInspection: string
  vehiclesInspected: string[]
}

// Données fictives
const agents: Agent[] = [
  {
    id: "a1",
    name: "Jean Dupont",
    status: "actif",
    inspections: 45,
    conformRate: 92,
    lastInspection: "30/07/2023",
    vehiclesInspected: ["AB-123-CD", "MN-012-OP", "YZ-901-AB"],
  },
  {
    id: "a2",
    name: "Marie Martin",
    status: "actif",
    inspections: 38,
    conformRate: 87,
    lastInspection: "29/07/2023",
    vehiclesInspected: ["EF-456-GH", "QR-345-ST"],
  },
  {
    id: "a3",
    name: "Pierre Durand",
    status: "congé",
    inspections: 27,
    conformRate: 85,
    lastInspection: "25/07/2023",
    vehiclesInspected: ["IJ-789-KL", "UV-678-WX"],
  },
  {
    id: "a4",
    name: "Sophie Petit",
    status: "actif",
    inspections: 42,
    conformRate: 95,
    lastInspection: "30/07/2023",
    vehiclesInspected: ["CD-234-EF", "AB-123-CD"],
  },
  {
    id: "a5",
    name: "Lucas Bernard",
    status: "inactif",
    inspections: 15,
    conformRate: 80,
    lastInspection: "15/07/2023",
    vehiclesInspected: ["MN-012-OP"],
  },
  {
    id: "a6",
    name: "Emma Leroy",
    status: "actif",
    inspections: 32,
    conformRate: 91,
    lastInspection: "28/07/2023",
    vehiclesInspected: ["QR-345-ST", "UV-678-WX"],
  },
  {
    id: "a7",
    name: "Thomas Dubois",
    status: "actif",
    inspections: 29,
    conformRate: 89,
    lastInspection: "27/07/2023",
    vehiclesInspected: ["YZ-901-AB"],
  },
  {
    id: "a8",
    name: "Julie Moreau",
    status: "congé",
    inspections: 22,
    conformRate: 86,
    lastInspection: "20/07/2023",
    vehiclesInspected: ["CD-234-EF"],
  },
]

export function AgentPerformance() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<AgentStatus | "all">("all")
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  // Filtrer les agents
  const filteredAgents = agents.filter((agent) => {
    // Filtre de recherche
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtre de statut
    const matchesStatus = statusFilter === "all" || agent.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      {selectedAgent ? (
        <AgentDetail agent={selectedAgent} onBack={() => setSelectedAgent(null)} />
      ) : (
        <>
          {/* En-tête et filtres */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Performance des Agents</CardTitle>
                  <CardDescription>Suivi des agents contrôleurs et de leurs inspections</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Rechercher un agent..."
                      className="pl-8 h-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as AgentStatus | "all")}
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="actif">Actif</option>
                      <option value="inactif">Inactif</option>
                      <option value="congé">En congé</option>
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
                        <th className="py-3 px-4 text-left font-medium">Agent</th>
                        <th className="py-3 px-4 text-left font-medium">Statut</th>
                        <th className="py-3 px-4 text-left font-medium">
                          <div className="flex items-center">
                            Inspections
                            <ArrowUpDown className="ml-1 h-3 w-3" />
                          </div>
                        </th>
                        <th className="py-3 px-4 text-left font-medium">
                          <div className="flex items-center">
                            Taux de conformité
                            <ArrowUpDown className="ml-1 h-3 w-3" />
                          </div>
                        </th>
                        <th className="py-3 px-4 text-left font-medium">Dernière inspection</th>
                        <th className="py-3 px-4 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAgents.length > 0 ? (
                        filteredAgents.map((agent) => (
                          <tr key={agent.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-2 text-gray-400" />
                                {agent.name}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <AgentStatusBadge status={agent.status} />
                            </td>
                            <td className="py-3 px-4">{agent.inspections}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <span className={`mr-2 ${getConformRateColor(agent.conformRate)}`}>
                                  {agent.conformRate}%
                                </span>
                                <Progress
                                  value={agent.conformRate}
                                  className="h-1.5 w-16 bg-gray-200"
                                  indicatorClassName={getConformRateProgressColor(agent.conformRate)}
                                />
                              </div>
                            </td>
                            <td className="py-3 px-4">{agent.lastInspection}</td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" onClick={() => setSelectedAgent(agent)}>
                                  Détails
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                                >
                                  Historique
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-4 px-4 text-center text-gray-500">
                            Aucun agent ne correspond aux critères de recherche
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  Affichage de {filteredAgents.length} agents sur {agents.length}
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

function AgentStatusBadge({ status }: { status: AgentStatus }) {
  switch (status) {
    case "actif":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <CheckCircle className="h-3 w-3 mr-1" /> Actif
        </Badge>
      )
    case "inactif":
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
          <Clock className="h-3 w-3 mr-1" /> Inactif
        </Badge>
      )
    case "congé":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          <Calendar className="h-3 w-3 mr-1" /> En congé
        </Badge>
      )
  }
}

function getConformRateColor(rate: number): string {
  if (rate >= 90) return "text-green-600"
  if (rate >= 80) return "text-amber-600"
  return "text-red-600"
}

function getConformRateProgressColor(rate: number): string {
  if (rate >= 90) return "bg-green-500"
  if (rate >= 80) return "bg-amber-500"
  return "bg-red-500"
}

function AgentDetail({ agent, onBack }: { agent: Agent; onBack: () => void }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
              ← Retour à la liste
            </Button>
            <CardTitle>Profil de l'agent: {agent.name}</CardTitle>
            <CardDescription>Détails des performances et des inspections</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" /> Exporter
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
                <User className="h-4 w-4 mr-2 text-blue-600" /> Informations de l'agent
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nom:</span>
                  <span className="font-medium">{agent.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Statut:</span>
                  <span className="font-medium">
                    <AgentStatusBadge status={agent.status} />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Inspections:</span>
                  <span className="font-medium">{agent.inspections}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Taux de conformité:</span>
                  <span className={`font-medium ${getConformRateColor(agent.conformRate)}`}>{agent.conformRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Dernière inspection:</span>
                  <span className="font-medium">{agent.lastInspection}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2 flex items-center">
                <BarChart3 className="h-4 w-4 mr-2 text-blue-600" /> Statistiques
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Taux de conformité</span>
                    <span className={getConformRateColor(agent.conformRate)}>{agent.conformRate}%</span>
                  </div>
                  <Progress
                    value={agent.conformRate}
                    className="h-2 bg-gray-200"
                    indicatorClassName={getConformRateProgressColor(agent.conformRate)}
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Inspections ce mois</span>
                    <span>
                      {Math.round(agent.inspections * 0.3)}/{agent.inspections}
                    </span>
                  </div>
                  <Progress value={30} className="h-2 bg-gray-200" indicatorClassName="bg-blue-500" />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Signatures complètes</span>
                    <span>92%</span>
                  </div>
                  <Progress value={92} className="h-2 bg-gray-200" indicatorClassName="bg-green-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <Tabs defaultValue="inspections">
              <TabsList className="w-full">
                <TabsTrigger value="inspections">Inspections récentes</TabsTrigger>
                <TabsTrigger value="vehicles">Véhicules inspectés</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="inspections" className="p-4 border rounded-md mt-4">
                <h3 className="font-medium mb-4">Dernières inspections réalisées</h3>

                <div className="space-y-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left">Date</th>
                        <th className="py-2 text-left">Véhicule</th>
                        <th className="py-2 text-left">Statut</th>
                        <th className="py-2 text-left">Signatures</th>
                        <th className="py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2">{agent.lastInspection}</td>
                        <td className="py-2">{agent.vehiclesInspected[0]}</td>
                        <td className="py-2">
                          <Badge className="bg-green-100 text-green-800">Conforme</Badge>
                        </td>
                        <td className="py-2">
                          <Badge className="bg-green-100 text-green-800">Complètes</Badge>
                        </td>
                        <td className="py-2">
                          <Button variant="outline" size="sm">
                            Voir
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">
                          {new Date(
                            new Date(agent.lastInspection.split("/").reverse().join("-")).getTime() - 86400000 * 2,
                          )
                            .toLocaleDateString("fr-FR")
                            .replace(/\//g, "/")}
                        </td>
                        <td className="py-2">{agent.vehiclesInspected[1] || agent.vehiclesInspected[0]}</td>
                        <td className="py-2">
                          <Badge className="bg-amber-100 text-amber-800">Non-conforme</Badge>
                        </td>
                        <td className="py-2">
                          <Badge className="bg-amber-100 text-amber-800">Partielles</Badge>
                        </td>
                        <td className="py-2">
                          <Button variant="outline" size="sm">
                            Voir
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">
                          {new Date(
                            new Date(agent.lastInspection.split("/").reverse().join("-")).getTime() - 86400000 * 5,
                          )
                            .toLocaleDateString("fr-FR")
                            .replace(/\//g, "/")}
                        </td>
                        <td className="py-2">{agent.vehiclesInspected[2] || agent.vehiclesInspected[0]}</td>
                        <td className="py-2">
                          <Badge className="bg-green-100 text-green-800">Conforme</Badge>
                        </td>
                        <td className="py-2">
                          <Badge className="bg-green-100 text-green-800">Complètes</Badge>
                        </td>
                        <td className="py-2">
                          <Button variant="outline" size="sm">
                            Voir
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="text-center">
                    <Button variant="outline" size="sm">
                      Voir toutes les inspections
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="vehicles" className="p-4 border rounded-md mt-4">
                <h3 className="font-medium mb-4">Véhicules inspectés</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {agent.vehiclesInspected.map((vehicle, index) => (
                    <Card key={index} className="bg-gray-50 border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                              <Car className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">{vehicle}</div>
                              <div className="text-xs text-gray-500">
                                Dernière inspection:{" "}
                                {new Date(
                                  new Date(agent.lastInspection.split("/").reverse().join("-")).getTime() -
                                    86400000 * index,
                                )
                                  .toLocaleDateString("fr-FR")
                                  .replace(/\//g, "/")}
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Détails
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="performance" className="p-4 border rounded-md mt-4">
                <h3 className="font-medium mb-4">Analyse de performance</h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-md text-center">
                      <div className="text-xs text-gray-500 mb-1">Inspections totales</div>
                      <div className="text-2xl font-bold">{agent.inspections}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md text-center">
                      <div className="text-xs text-gray-500 mb-1">Taux de conformité</div>
                      <div className={`text-2xl font-bold ${getConformRateColor(agent.conformRate)}`}>
                        {agent.conformRate}%
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md text-center">
                      <div className="text-xs text-gray-500 mb-1">Véhicules inspectés</div>
                      <div className="text-2xl font-bold">{agent.vehiclesInspected.length}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="text-sm font-medium mb-3">Évolution mensuelle</h4>
                    <div className="h-40 bg-white rounded-md border p-2">
                      <div className="text-center text-gray-500 text-sm h-full flex items-center justify-center">
                        Graphique d'évolution des inspections
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="text-sm font-medium mb-3">Comparaison avec les autres agents</h4>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 text-left">Métrique</th>
                          <th className="py-2 text-left">{agent.name}</th>
                          <th className="py-2 text-left">Moyenne</th>
                          <th className="py-2 text-left">Classement</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2">Inspections</td>
                          <td className="py-2 font-medium">{agent.inspections}</td>
                          <td className="py-2">31</td>
                          <td className="py-2 text-green-600">1er / 8</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Taux de conformité</td>
                          <td className="py-2 font-medium">{agent.conformRate}%</td>
                          <td className="py-2">88%</td>
                          <td className="py-2 text-green-600">2ème / 8</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Signatures complètes</td>
                          <td className="py-2 font-medium">92%</td>
                          <td className="py-2">85%</td>
                          <td className="py-2 text-green-600">3ème / 8</td>
                        </tr>
                      </tbody>
                    </table>
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

