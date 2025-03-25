"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, CheckCircle, Clock, Calendar, PenToolIcon as Tool } from "lucide-react"

// Types
type MaintenanceType = "vidange" | "pneus" | "freins" | "revision" | "controle_technique"
type MaintenanceStatus = "à_prévoir" | "urgent" | "planifié" | "effectué"

type MaintenanceAlert = {
  id: string
  vehicleId: string
  immatriculation: string
  type: MaintenanceType
  status: MaintenanceStatus
  dueKilometers: number
  dueDate: string
  currentKilometers: number
  lastMaintenanceKilometers: number
  lastMaintenanceDate: string
  notes?: string
}

// Données fictives
const maintenanceAlerts: MaintenanceAlert[] = [
  {
    id: "m1",
    vehicleId: "v1",
    immatriculation: "AB-123-CD",
    type: "vidange",
    status: "à_prévoir",
    dueKilometers: 13000,
    dueDate: "15/05/2025",
    currentKilometers: 12658,
    lastMaintenanceKilometers: 7500,
    lastMaintenanceDate: "10/11/2024",
  },
  {
    id: "m2",
    vehicleId: "v2",
    immatriculation: "EF-456-GH",
    type: "pneus",
    status: "urgent",
    dueKilometers: 8500,
    dueDate: "01/04/2025",
    currentKilometers: 8956,
    lastMaintenanceKilometers: 4000,
    lastMaintenanceDate: "15/09/2024",
    notes: "Usure importante des pneus avant",
  },
  {
    id: "m3",
    vehicleId: "v3",
    immatriculation: "IJ-789-KL",
    type: "revision",
    status: "planifié",
    dueKilometers: 6000,
    dueDate: "20/04/2025",
    currentKilometers: 5450,
    lastMaintenanceKilometers: 1000,
    lastMaintenanceDate: "05/01/2025",
    notes: "Rendez-vous pris au garage le 15/04/2025",
  },
  {
    id: "m4",
    vehicleId: "v4",
    immatriculation: "MN-012-OP",
    type: "controle_technique",
    status: "effectué",
    dueKilometers: 20000,
    dueDate: "30/06/2025",
    currentKilometers: 19125,
    lastMaintenanceKilometers: 19000,
    lastMaintenanceDate: "25/03/2025",
  },
  {
    id: "m5",
    vehicleId: "v5",
    immatriculation: "QR-345-ST",
    type: "freins",
    status: "à_prévoir",
    dueKilometers: 4500,
    dueDate: "15/05/2025",
    currentKilometers: 3780,
    lastMaintenanceKilometers: 1500,
    lastMaintenanceDate: "10/02/2025",
  },
]

export function MaintenanceAlerts() {
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | "all">("all")
  const [typeFilter, setTypeFilter] = useState<MaintenanceType | "all">("all")

  // Filtrer les alertes
  const filteredAlerts = maintenanceAlerts.filter((alert) => {
    const matchesStatus = statusFilter === "all" || alert.status === statusFilter
    const matchesType = typeFilter === "all" || alert.type === typeFilter
    return matchesStatus && matchesType
  })

  // Obtenir le nombre d'alertes par statut
  const alertCounts = {
    urgent: maintenanceAlerts.filter((a) => a.status === "urgent").length,
    à_prévoir: maintenanceAlerts.filter((a) => a.status === "à_prévoir").length,
    planifié: maintenanceAlerts.filter((a) => a.status === "planifié").length,
    effectué: maintenanceAlerts.filter((a) => a.status === "effectué").length,
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Alertes d'entretien</CardTitle>
            <CardDescription>Suivi des entretiens basés sur le kilométrage et les dates</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              Tous ({maintenanceAlerts.length})
            </Button>
            <Button
              variant={statusFilter === "urgent" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("urgent")}
              className={statusFilter !== "urgent" ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" : ""}
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Urgent ({alertCounts.urgent})
            </Button>
            <Button
              variant={statusFilter === "à_prévoir" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("à_prévoir")}
              className={
                statusFilter !== "à_prévoir" ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" : ""
              }
            >
              <Clock className="h-3 w-3 mr-1" />À prévoir ({alertCounts.à_prévoir})
            </Button>
            <Button
              variant={statusFilter === "planifié" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("planifié")}
              className={
                statusFilter !== "planifié" ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" : ""
              }
            >
              <Calendar className="h-3 w-3 mr-1" />
              Planifié ({alertCounts.planifié})
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">Liste</TabsTrigger>
            <TabsTrigger value="calendar">Calendrier</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="py-3 px-4 text-left font-medium">Véhicule</th>
                      <th className="py-3 px-4 text-left font-medium">Type d'entretien</th>
                      <th className="py-3 px-4 text-left font-medium">Statut</th>
                      <th className="py-3 px-4 text-left font-medium">Kilométrage</th>
                      <th className="py-3 px-4 text-left font-medium">Date prévue</th>
                      <th className="py-3 px-4 text-left font-medium">Progression</th>
                      <th className="py-3 px-4 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAlerts.length > 0 ? (
                      filteredAlerts.map((alert) => (
                        <tr key={alert.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{alert.immatriculation}</td>
                          <td className="py-3 px-4">
                            <MaintenanceTypeBadge type={alert.type} />
                          </td>
                          <td className="py-3 px-4">
                            <MaintenanceStatusBadge status={alert.status} />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span>{alert.currentKilometers} km</span>
                              <span className="text-xs text-gray-500">Prévu à {alert.dueKilometers} km</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span>{alert.dueDate}</span>
                              <span className="text-xs text-gray-500">Dernier: {alert.lastMaintenanceDate}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 w-40">
                            <div className="space-y-1">
                              <Progress
                                value={Math.min(
                                  100,
                                  ((alert.currentKilometers - alert.lastMaintenanceKilometers) /
                                    (alert.dueKilometers - alert.lastMaintenanceKilometers)) *
                                    100,
                                )}
                                className="h-2"
                                indicatorClassName={
                                  alert.status === "urgent"
                                    ? "bg-red-500"
                                    : alert.status === "à_prévoir"
                                      ? "bg-amber-500"
                                      : alert.status === "planifié"
                                        ? "bg-blue-500"
                                        : "bg-green-500"
                                }
                              />
                              <div className="flex justify-between text-xs">
                                <span>
                                  {Math.round(
                                    ((alert.currentKilometers - alert.lastMaintenanceKilometers) /
                                      (alert.dueKilometers - alert.lastMaintenanceKilometers)) *
                                      100,
                                  )}
                                  %
                                </span>
                                <span>
                                  {alert.dueKilometers - alert.currentKilometers > 0
                                    ? `Dans ${alert.dueKilometers - alert.currentKilometers} km`
                                    : "Dépassé"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Tool className="h-3 w-3 mr-1" />
                                {alert.status === "effectué"
                                  ? "Détails"
                                  : alert.status === "planifié"
                                    ? "Modifier"
                                    : "Planifier"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-4 px-4 text-center text-gray-500">
                          Aucune alerte d'entretien ne correspond aux critères de recherche
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <div className="h-80 bg-gray-50 flex items-center justify-center rounded-md">
              <div className="text-center text-gray-500">
                <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                <p>Calendrier des entretiens prévus</p>
                <p className="text-sm text-gray-400 mt-2">Fonctionnalité en développement</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function MaintenanceTypeBadge({ type }: { type: MaintenanceType }) {
  switch (type) {
    case "vidange":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Vidange
        </Badge>
      )
    case "pneus":
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          Pneus
        </Badge>
      )
    case "freins":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          Freins
        </Badge>
      )
    case "revision":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Révision
        </Badge>
      )
    case "controle_technique":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          Contrôle technique
        </Badge>
      )
  }
}

function MaintenanceStatusBadge({ status }: { status: MaintenanceStatus }) {
  switch (status) {
    case "urgent":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <AlertTriangle className="h-3 w-3 mr-1" /> Urgent
        </Badge>
      )
    case "à_prévoir":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <Clock className="h-3 w-3 mr-1" /> À prévoir
        </Badge>
      )
    case "planifié":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Calendar className="h-3 w-3 mr-1" /> Planifié
        </Badge>
      )
    case "effectué":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" /> Effectué
        </Badge>
      )
  }
}

