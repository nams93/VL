"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VehicleFleetOverview } from "@/components/dashboard/vehicle-fleet-overview"
import { InspectionHistory } from "@/components/dashboard/inspection-history"
import { AgentPerformance } from "@/components/dashboard/agent-performance"
import { VehicleDetails } from "@/components/dashboard/vehicle-details"
import { PendingInspections } from "@/components/dashboard/pending-inspections"
import { RadioEquipmentHistory } from "@/components/dashboard/radio-equipment-history"
import { AgentPerceptions } from "@/components/dashboard/agent-perceptions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Car,
  Users,
  ClipboardCheck,
  Radio,
  Bell,
  Calendar,
  BarChart3,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState({
    vehicles: {
      total: 0,
      active: 0,
      maintenance: 0,
      inactive: 0,
    },
    inspections: {
      total: 0,
      pending: 0,
      completed: 0,
      thisMonth: 0,
    },
    agents: {
      total: 0,
      active: 0,
      onLeave: 0,
    },
    radio: {
      total: 0,
      operational: 0,
      maintenance: 0,
    },
    alerts: [],
    schedules: [],
  })

  // Charger les données réelles
  useEffect(() => {
    loadDashboardData()

    // Actualiser les données toutes les 30 secondes
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = () => {
    try {
      // Récupérer les données des véhicules
      const vehicles = JSON.parse(localStorage.getItem("vehicles") || "[]")

      // Récupérer les données des inspections
      const inspections = JSON.parse(localStorage.getItem("pendingInspections") || "[]")

      // Récupérer les données des équipements radio
      const radioEquipment = JSON.parse(localStorage.getItem("radioEquipmentForms") || "[]")

      // Récupérer les données des agents
      const agents = JSON.parse(localStorage.getItem("agents") || "[]")
      const activeAgents = Object.keys(JSON.parse(localStorage.getItem("gpis-active-agents") || "{}")).length

      // Calculer les statistiques
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()

      const inspectionsThisMonth = inspections.filter((inspection) => {
        const inspectionDate = new Date(inspection.date)
        return inspectionDate.getMonth() === currentMonth && inspectionDate.getFullYear() === currentYear
      }).length

      const pendingInspections = inspections.filter((inspection) => inspection.status === "en-attente").length
      const completedInspections = inspections.filter((inspection) => inspection.status !== "en-attente").length

      const activeVehicles = vehicles.filter(
        (vehicle) => vehicle.status === "disponible" || vehicle.status === "en_service",
      ).length
      const maintenanceVehicles = vehicles.filter((vehicle) => vehicle.status === "maintenance").length
      const inactiveVehicles = vehicles.filter((vehicle) => vehicle.status === "hors_service").length

      const operationalRadios = radioEquipment.filter(
        (item) =>
          item.type === "perception" && item.radios && item.radios.some((radio) => radio.perceptionState === "RAS"),
      ).length

      const maintenanceRadios = radioEquipment.filter(
        (item) =>
          item.type === "perception" && item.radios && item.radios.some((radio) => radio.perceptionState !== "RAS"),
      ).length

      // Récupérer les alertes récentes
      const notifications = JSON.parse(localStorage.getItem("gpis-notifications") || "[]")
      const recentAlerts = notifications
        .filter((notif) => notif.type === "warning" || notif.type === "error")
        .slice(0, 3)
        .map((notif) => ({
          title: notif.title,
          description: notif.message,
          time: formatTimeAgo(new Date(notif.timestamp)),
          status: notif.type === "error" ? "urgent" : "warning",
        }))

      // Générer des activités planifiées basées sur les données
      const maintenanceVehiclesList = vehicles.filter((vehicle) => vehicle.status === "maintenance")
      const schedules = []

      if (maintenanceVehiclesList.length > 0) {
        schedules.push({
          title: "Maintenance programmée",
          description: `${maintenanceVehiclesList.length} véhicule(s) en maintenance`,
          date: "Cette semaine",
        })
      }

      if (pendingInspections > 0) {
        schedules.push({
          title: "Inspections en attente",
          description: `${pendingInspections} inspection(s) à valider`,
          date: "Aujourd'hui",
        })
      }

      if (maintenanceRadios > 0) {
        schedules.push({
          title: "Équipements radio à réparer",
          description: `${maintenanceRadios} équipement(s) signalé(s) défectueux`,
          date: "Prioritaire",
        })
      }

      // Mettre à jour les statistiques
      setStats({
        vehicles: {
          total: vehicles.length,
          active: activeVehicles,
          maintenance: maintenanceVehicles,
          inactive: inactiveVehicles,
        },
        inspections: {
          total: inspections.length,
          pending: pendingInspections,
          completed: completedInspections,
          thisMonth: inspectionsThisMonth,
        },
        agents: {
          total: agents.length || activeAgents,
          active: activeAgents,
          onLeave: (agents.length || activeAgents) - activeAgents,
        },
        radio: {
          total: operationalRadios + maintenanceRadios,
          operational: operationalRadios,
          maintenance: maintenanceRadios,
        },
        alerts: recentAlerts,
        schedules: schedules,
      })
    } catch (error) {
      console.error("Erreur lors du chargement des données du tableau de bord:", error)
    }
  }

  // Fonction pour formater le temps écoulé
  const formatTimeAgo = (date) => {
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 60) {
      return `Il y a ${diffMins} minute${diffMins > 1 ? "s" : ""}`
    }

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? "s" : ""}`
    }

    const diffDays = Math.floor(diffHours / 24)
    return `Il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`
  }

  return (
    <div className="space-y-4">
      {/* Navigation principale - Version compacte */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="bg-white rounded-lg p-1 border shadow-sm">
          <TabsList className="w-full grid grid-cols-5 h-10">
            <TabsTrigger value="overview" className="flex items-center gap-1 text-xs data-[state=active]:bg-blue-50">
              <BarChart3 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Vue d'ensemble</span>
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="flex items-center gap-1 text-xs data-[state=active]:bg-blue-50">
              <Car className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Véhicules</span>
            </TabsTrigger>
            <TabsTrigger value="inspections" className="flex items-center gap-1 text-xs data-[state=active]:bg-blue-50">
              <ClipboardCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Inspections</span>
            </TabsTrigger>
            <TabsTrigger value="radio" className="flex items-center gap-1 text-xs data-[state=active]:bg-blue-50">
              <Radio className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Équipements</span>
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-1 text-xs data-[state=active]:bg-blue-50">
              <Users className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Agents</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Statistiques clés - Version compacte */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <CompactStatCard
              title="Véhicules"
              value={stats.vehicles.total}
              icon={<Car className="h-4 w-4" />}
              details={[
                { label: "Actifs", value: stats.vehicles.active, color: "green" },
                { label: "En maintenance", value: stats.vehicles.maintenance, color: "amber" },
              ]}
            />
            <CompactStatCard
              title="Inspections"
              value={stats.inspections.thisMonth}
              icon={<ClipboardCheck className="h-4 w-4" />}
              details={[
                { label: "En attente", value: stats.inspections.pending, color: "amber" },
                { label: "Complétées", value: stats.inspections.completed, color: "green" },
              ]}
            />
            <CompactStatCard
              title="Agents"
              value={stats.agents.active}
              icon={<Users className="h-4 w-4" />}
              details={[
                { label: "Actifs", value: stats.agents.active, color: "green" },
                { label: "En congé", value: stats.agents.onLeave, color: "blue" },
              ]}
            />
            <CompactStatCard
              title="Équipements"
              value={stats.radio.total}
              icon={<Radio className="h-4 w-4" />}
              details={[
                { label: "Opérationnels", value: stats.radio.operational, color: "green" },
                { label: "En maintenance", value: stats.radio.maintenance, color: "amber" },
              ]}
            />
          </div>
        )}

        {/* Contenu des onglets */}
        <TabsContent value="overview" className="space-y-4 mt-0">
          {/* Aperçu de la flotte et inspections en attente */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-medium">Aperçu de la flotte</CardTitle>
                    <CardDescription>État actuel des véhicules</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    Voir tous
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <VehicleFleetOverview onSelectVehicle={() => {}} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-medium">Inspections en attente</CardTitle>
                    <CardDescription>À compléter prochainement</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    Voir toutes
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <PendingInspections />
              </CardContent>
            </Card>
          </div>

          {/* Alertes et notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Bell className="h-4 w-4 text-amber-500" />
                    Alertes récentes
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                    Voir toutes <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-2">
                  {stats.alerts.length > 0 ? (
                    stats.alerts.map((alert, index) => (
                      <CompactAlertItem
                        key={index}
                        title={alert.title}
                        description={alert.description}
                        time={alert.time}
                        status={alert.status}
                      />
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-500" />
                      <p className="text-sm">Aucune alerte récente</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    Activités planifiées
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                    Calendrier <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-2">
                  {stats.schedules.length > 0 ? (
                    stats.schedules.map((schedule, index) => (
                      <CompactScheduleItem
                        key={index}
                        title={schedule.title}
                        description={schedule.description}
                        date={schedule.date}
                      />
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                      <p className="text-sm">Aucune activité planifiée</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vehicles" className="mt-0">
          <VehicleDetails selectedVehicle={null} />
        </TabsContent>

        <TabsContent value="inspections" className="mt-0">
          <InspectionHistory />
        </TabsContent>

        <TabsContent value="radio" className="mt-0">
          <RadioEquipmentHistory />
        </TabsContent>

        <TabsContent value="agents" className="mt-0">
          <div className="space-y-4">
            <AgentPerformance />
            <AgentPerceptions />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Composant pour les cartes de statistiques compactes
interface CompactStatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  details: Array<{
    label: string
    value: number
    color: string
  }>
}

function CompactStatCard({ title, value, icon, details }: CompactStatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{title}</span>
          <div className={`p-1.5 rounded-full ${getIconBgColor(details[0]?.color || "blue")}`}>{icon}</div>
        </div>
        <div className="text-xl font-bold mb-2">{value}</div>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {details.map((detail, index) => (
            <div key={index} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${getBgColor(detail.color)}`}></div>
              <span className="truncate">
                {detail.label}: <span className="font-medium">{detail.value}</span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Composant pour les éléments d'alerte compacts
interface CompactAlertItemProps {
  title: string
  description: string
  time: string
  status: "urgent" | "warning" | "info" | "success"
}

function CompactAlertItem({ title, description, time, status }: CompactAlertItemProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "urgent":
        return <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
      case "warning":
        return <Clock className="h-3.5 w-3.5 text-amber-500" />
      case "info":
        return <Bell className="h-3.5 w-3.5 text-blue-500" />
      case "success":
        return <CheckCircle className="h-3.5 w-3.5 text-green-500" />
    }
  }

  return (
    <div className="flex items-start gap-2 p-2 rounded-md border bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="mt-0.5">{getStatusIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h4 className="font-medium text-xs truncate">{title}</h4>
          <span className="text-[10px] text-gray-500 ml-1 whitespace-nowrap">{time}</span>
        </div>
        <p className="text-xs text-gray-600 line-clamp-1">{description}</p>
      </div>
    </div>
  )
}

// Composant pour les éléments de calendrier compacts
interface CompactScheduleItemProps {
  title: string
  description: string
  date: string
}

function CompactScheduleItem({ title, description, date }: CompactScheduleItemProps) {
  return (
    <div className="flex items-start gap-2 p-2 rounded-md border bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="mt-0.5">
        <Calendar className="h-3.5 w-3.5 text-blue-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h4 className="font-medium text-xs truncate">{title}</h4>
          <Badge className="text-[10px] h-4 px-1 bg-blue-100 text-blue-800 hover:bg-blue-200">{date}</Badge>
        </div>
        <p className="text-xs text-gray-600 line-clamp-1">{description}</p>
      </div>
    </div>
  )
}

// Fonctions utilitaires pour les couleurs
function getIconBgColor(color: string): string {
  switch (color) {
    case "green":
      return "bg-green-100 text-green-700"
    case "red":
      return "bg-red-100 text-red-700"
    case "amber":
      return "bg-amber-100 text-amber-700"
    case "blue":
    default:
      return "bg-blue-100 text-blue-700"
  }
}

function getBgColor(color: string): string {
  switch (color) {
    case "green":
      return "bg-green-500"
    case "red":
      return "bg-red-500"
    case "amber":
      return "bg-amber-500"
    case "blue":
    default:
      return "bg-blue-500"
  }
}

function getTextColor(color: string): string {
  switch (color) {
    case "green":
      return "text-green-700"
    case "red":
      return "text-red-700"
    case "amber":
      return "text-amber-700"
    case "blue":
    default:
      return "text-blue-700"
  }
}
