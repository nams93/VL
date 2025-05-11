"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, RefreshCw, Clock, AlertTriangle, User, FileText } from "lucide-react"
import { authService } from "@/lib/auth-service"
import { activityTrackingService, type AgentActivity } from "@/lib/activity-tracking-service"

export default function SupervisorDashboard() {
  const router = useRouter()
  const [activeAgents, setActiveAgents] = useState<Record<string, any>>({})
  const [recentActivities, setRecentActivities] = useState<AgentActivity[]>([])
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [agentActivities, setAgentActivities] = useState<AgentActivity[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  // Vérifier si l'utilisateur est superviseur
  useEffect(() => {
    if (!authService.isSupervisor()) {
      router.push("/login")
    }
  }, [router])

  // Charger les données initiales
  useEffect(() => {
    loadDashboardData()

    // Actualiser les données toutes les 30 secondes
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Charger les données du tableau de bord
  const loadDashboardData = () => {
    // Nettoyer les agents inactifs
    activityTrackingService.cleanupInactiveAgents()

    // Récupérer les agents actifs
    const agents = activityTrackingService.getActiveAgents()
    setActiveAgents(agents)

    // Récupérer les activités récentes
    const activities = activityTrackingService.getAllActivities(50)
    setRecentActivities(activities)

    // Si un agent est sélectionné, actualiser ses activités
    if (selectedAgent) {
      const agentActivities = activityTrackingService.getAgentActivities(selectedAgent)
      setAgentActivities(agentActivities)
    }
  }

  // Actualiser manuellement les données
  const handleRefresh = () => {
    setRefreshing(true)
    loadDashboardData()
    setTimeout(() => setRefreshing(false), 500)
  }

  // Sélectionner un agent
  const handleSelectAgent = (agentId: string) => {
    setSelectedAgent(agentId)
    const agentActivities = activityTrackingService.getAgentActivities(agentId)
    setAgentActivities(agentActivities)
  }

  // Filtrer les agents actifs
  const filteredAgents = Object.entries(activeAgents).filter(([agentId, data]) => {
    return data.agentName.toLowerCase().includes(searchTerm.toLowerCase()) || agentId.includes(searchTerm)
  })

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Calculer le temps écoulé
  const getTimeElapsed = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()

    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return "À l'instant"
    if (diffMins === 1) return "Il y a 1 minute"
    if (diffMins < 60) return `Il y a ${diffMins} minutes`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours === 1) return "Il y a 1 heure"
    if (diffHours < 24) return `Il y a ${diffHours} heures`

    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return "Il y a 1 jour"
    return `Il y a ${diffDays} jours`
  }

  // Obtenir la couleur de l'activité
  const getActivityColor = (activity: string) => {
    switch (activity) {
      case "login":
        return "bg-green-100 text-green-800"
      case "logout":
        return "bg-gray-100 text-gray-800"
      case "vehicle-inspection":
        return "bg-blue-100 text-blue-800"
      case "radio-perception":
        return "bg-purple-100 text-purple-800"
      case "radio-reintegration":
        return "bg-indigo-100 text-indigo-800"
      case "form-update":
        return "bg-amber-100 text-amber-800"
      case "view-dashboard":
        return "bg-sky-100 text-sky-800"
      case "idle":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tableau de bord superviseur</h1>
          <p className="text-gray-500">Suivi en temps réel des activités des agents</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2" disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des agents actifs */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Agents actifs</span>
              <Badge className="bg-green-500">{Object.keys(activeAgents).length}</Badge>
            </CardTitle>
            <CardDescription>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un agent..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
              {filteredAgents.length > 0 ? (
                <ul className="divide-y">
                  {filteredAgents.map(([agentId, data]) => (
                    <li
                      key={agentId}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedAgent === agentId ? "bg-blue-50" : ""}`}
                      onClick={() => handleSelectAgent(agentId)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">{data.agentName}</div>
                          <div className="text-sm text-gray-500">ID: {agentId}</div>
                          <div className="mt-1 flex items-center gap-1">
                            <Badge className={getActivityColor(data.lastActivity)}>
                              {activityTrackingService.getActivityDescription(data.lastActivity)}
                            </Badge>
                            {data.location && <span className="text-xs text-gray-500">{data.location}</span>}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">{getTimeElapsed(data.lastTimestamp)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? "Aucun agent ne correspond à votre recherche" : "Aucun agent actif"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Détails de l'agent sélectionné ou activités récentes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <Tabs defaultValue={selectedAgent ? "agent" : "recent"}>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {selectedAgent
                    ? `Activités de ${activeAgents[selectedAgent]?.agentName || selectedAgent}`
                    : "Activités récentes"}
                </CardTitle>
                <TabsList>
                  <TabsTrigger value="recent">Récentes</TabsTrigger>
                  {selectedAgent && <TabsTrigger value="agent">Agent</TabsTrigger>}
                </TabsList>
              </div>
            </Tabs>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue={selectedAgent ? "agent" : "recent"}>
              <TabsContent value="recent" className="m-0">
                <div className="max-h-[500px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Agent
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Activité
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Détails
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Heure
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {recentActivities.map((activity, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-medium">{activity.agentName}</div>
                            <div className="text-xs text-gray-500">{activity.agentId}</div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={getActivityColor(activity.activityType)}>
                              {activityTrackingService.getActivityDescription(activity.activityType)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm">{activity.details}</div>
                            {activity.location && <div className="text-xs text-gray-500">{activity.location}</div>}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm">{formatDate(activity.timestamp)}</div>
                            <div className="text-xs text-gray-500">{getTimeElapsed(activity.timestamp)}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {selectedAgent && (
                <TabsContent value="agent" className="m-0">
                  <div className="max-h-[500px] overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Activité
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Détails
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Heure
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {agentActivities.map((activity, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <Badge className={getActivityColor(activity.activityType)}>
                                {activityTrackingService.getActivityDescription(activity.activityType)}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm">{activity.details}</div>
                              {activity.location && <div className="text-xs text-gray-500">{activity.location}</div>}
                              {activity.formId && (
                                <div className="text-xs text-blue-500">Formulaire: {activity.formId}</div>
                              )}
                              {activity.vehicleId && (
                                <div className="text-xs text-green-500">Véhicule: {activity.vehicleId}</div>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm">{formatDate(activity.timestamp)}</div>
                              <div className="text-xs text-gray-500">{getTimeElapsed(activity.timestamp)}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>

        {/* Statistiques et résumé */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Résumé des activités</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{Object.keys(activeAgents).length}</div>
                    <div className="text-sm text-gray-500">Agents actifs</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {
                        recentActivities.filter(
                          (a) => a.activityType === "vehicle-inspection" || a.activityType === "radio-perception",
                        ).length
                      }
                    </div>
                    <div className="text-sm text-gray-500">Formulaires récents</div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-2 rounded-full">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {recentActivities.filter((a) => a.activityType === "idle").length}
                    </div>
                    <div className="text-sm text-gray-500">Agents inactifs</div>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-full">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-sm text-gray-500">Alertes</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
