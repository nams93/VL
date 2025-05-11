"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, RefreshCw, FileText, Radio } from "lucide-react"
import { activityTrackingService } from "@/lib/activity-tracking-service"

export function AgentPerceptions() {
  const [agents, setAgents] = useState<any[]>([])
  const [radioPerceptions, setRadioPerceptions] = useState<any[]>([])
  const [vehiclePerceptions, setVehiclePerceptions] = useState<any[]>([])
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  // Charger les données
  useEffect(() => {
    loadPerceptionData()

    // Actualiser les données toutes les 30 secondes
    const interval = setInterval(loadPerceptionData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Charger les données de perception
  const loadPerceptionData = () => {
    try {
      // Récupérer tous les agents qui ont été actifs
      const allAgents = activityTrackingService.getAllAgents()
      setAgents(allAgents)

      // Récupérer les perceptions radio
      const storedRadioForms = localStorage.getItem("radioEquipmentForms")
      const radioForms = storedRadioForms ? JSON.parse(storedRadioForms) : []
      setRadioPerceptions(radioForms)

      // Récupérer les perceptions véhicule
      const storedInspections = localStorage.getItem("pendingInspections")
      const inspections = storedInspections ? JSON.parse(storedInspections) : []
      setVehiclePerceptions(inspections)

      // Si un agent est sélectionné, mettre à jour ses données
      if (selectedAgent) {
        loadAgentPerceptions(selectedAgent)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données de perception:", error)
    }
  }

  // Actualiser manuellement les données
  const handleRefresh = () => {
    setRefreshing(true)
    loadPerceptionData()
    setTimeout(() => setRefreshing(false), 500)
  }

  // Charger les perceptions d'un agent spécifique
  const loadAgentPerceptions = (agentId: string) => {
    setSelectedAgent(agentId)
  }

  // Filtrer les agents
  const filteredAgents = agents.filter((agent) => {
    return agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || agent.id.includes(searchTerm)
  })

  // Obtenir les perceptions d'un agent
  const getAgentRadioPerceptions = (agentId: string) => {
    return radioPerceptions.filter((form) => form.agentId === agentId)
  }

  const getAgentVehiclePerceptions = (agentId: string) => {
    return vehiclePerceptions.filter((form) => form.agentId === agentId)
  }

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Perceptions par agent</CardTitle>
        <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2" disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un agent..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="border rounded-md max-h-[500px] overflow-y-auto">
              {filteredAgents.length > 0 ? (
                <ul className="divide-y">
                  {filteredAgents.map((agent) => {
                    const radioCount = getAgentRadioPerceptions(agent.id).length
                    const vehicleCount = getAgentVehiclePerceptions(agent.id).length

                    return (
                      <li
                        key={agent.id}
                        className={`p-3 hover:bg-gray-50 cursor-pointer ${
                          selectedAgent === agent.id ? "bg-blue-50" : ""
                        }`}
                        onClick={() => loadAgentPerceptions(agent.id)}
                      >
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-sm text-gray-500">ID: {agent.id}</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <Badge className="bg-blue-100 text-blue-800">
                            <FileText className="h-3 w-3 mr-1" /> {vehicleCount}
                          </Badge>
                          <Badge className="bg-purple-100 text-purple-800">
                            <Radio className="h-3 w-3 mr-1" /> {radioCount}
                          </Badge>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? "Aucun agent ne correspond à votre recherche" : "Aucun agent trouvé"}
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-3">
            {selectedAgent ? (
              <Tabs defaultValue="vehicle">
                <TabsList className="mb-4">
                  <TabsTrigger value="vehicle">
                    Perceptions véhicule ({getAgentVehiclePerceptions(selectedAgent).length})
                  </TabsTrigger>
                  <TabsTrigger value="radio">
                    Perceptions radio ({getAgentRadioPerceptions(selectedAgent).length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="vehicle">
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Véhicule
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {getAgentVehiclePerceptions(selectedAgent).length > 0 ? (
                          getAgentVehiclePerceptions(selectedAgent).map((perception) => (
                            <tr key={perception.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">{perception.id}</td>
                              <td className="px-4 py-3">{formatDate(perception.date)}</td>
                              <td className="px-4 py-3">{perception.vehicleInfo?.immatriculation || "Non spécifié"}</td>
                              <td className="px-4 py-3">
                                <Badge
                                  className={
                                    perception.status === "validé"
                                      ? "bg-green-100 text-green-800"
                                      : perception.status === "en-attente"
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-gray-100 text-gray-800"
                                  }
                                >
                                  {perception.status}
                                </Badge>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-3 text-center text-gray-500">
                              Aucune perception véhicule pour cet agent
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="radio">
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Véhicule
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {getAgentRadioPerceptions(selectedAgent).length > 0 ? (
                          getAgentRadioPerceptions(selectedAgent).map((perception) => (
                            <tr key={perception.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">{perception.id}</td>
                              <td className="px-4 py-3">{formatDate(perception.date)}</td>
                              <td className="px-4 py-3">
                                <Badge
                                  className={
                                    perception.type === "perception"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-indigo-100 text-indigo-800"
                                  }
                                >
                                  {perception.type === "perception" ? "Perception" : "Réintégration"}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                {perception.agentInfo?.vehicleImmatriculation || "Non spécifié"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-3 text-center text-gray-500">
                              Aucune perception radio pour cet agent
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex h-full items-center justify-center border rounded-md p-8">
                <div className="text-center text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium">Sélectionnez un agent</h3>
                  <p className="mt-1">Choisissez un agent dans la liste pour voir ses perceptions</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
