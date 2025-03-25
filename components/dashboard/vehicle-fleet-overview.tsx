"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Car, Truck, AlertTriangle, CheckCircle, Clock, Search, Filter, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Types
type VehicleStatus = "conforme" | "non-conforme" | "en-attente" | "maintenance"

type Vehicle = {
  id: string
  immatriculation: string
  type: "voiture" | "camion" | "utilitaire"
  status: VehicleStatus
  lastInspection: string
  nextInspection: string
  agent: string
  issues: number
}

// Données fictives
const vehicles: Vehicle[] = [
  {
    id: "v1",
    immatriculation: "AB-123-CD",
    type: "voiture",
    status: "conforme",
    lastInspection: "15/05/2023",
    nextInspection: "15/11/2023",
    agent: "Jean Dupont",
    issues: 0,
  },
  {
    id: "v2",
    immatriculation: "EF-456-GH",
    type: "camion",
    status: "non-conforme",
    lastInspection: "20/06/2023",
    nextInspection: "20/07/2023",
    agent: "Marie Martin",
    issues: 3,
  },
  {
    id: "v3",
    immatriculation: "IJ-789-KL",
    type: "utilitaire",
    status: "maintenance",
    lastInspection: "05/07/2023",
    nextInspection: "05/08/2023",
    agent: "Pierre Durand",
    issues: 2,
  },
  {
    id: "v4",
    immatriculation: "MN-012-OP",
    type: "voiture",
    status: "en-attente",
    lastInspection: "10/04/2023",
    nextInspection: "10/10/2023",
    agent: "Sophie Petit",
    issues: 0,
  },
  {
    id: "v5",
    immatriculation: "QR-345-ST",
    type: "camion",
    status: "conforme",
    lastInspection: "25/07/2023",
    nextInspection: "25/01/2024",
    agent: "Lucas Bernard",
    issues: 0,
  },
  {
    id: "v6",
    immatriculation: "UV-678-WX",
    type: "utilitaire",
    status: "non-conforme",
    lastInspection: "30/06/2023",
    nextInspection: "30/07/2023",
    agent: "Emma Leroy",
    issues: 1,
  },
  {
    id: "v7",
    immatriculation: "YZ-901-AB",
    type: "voiture",
    status: "conforme",
    lastInspection: "12/07/2023",
    nextInspection: "12/01/2024",
    agent: "Thomas Dubois",
    issues: 0,
  },
  {
    id: "v8",
    immatriculation: "CD-234-EF",
    type: "camion",
    status: "maintenance",
    lastInspection: "18/05/2023",
    nextInspection: "18/06/2023",
    agent: "Julie Moreau",
    issues: 4,
  },
]

type VehicleFleetOverviewProps = {
  onSelectVehicle: (vehicleId: string) => void
}

export function VehicleFleetOverview({ onSelectVehicle }: VehicleFleetOverviewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | "all">("all")
  const [typeFilter, setTypeFilter] = useState<Vehicle["type"] | "all">("all")

  // Filtrer les véhicules
  const filteredVehicles = vehicles.filter((vehicle) => {
    // Filtre de recherche
    const matchesSearch =
      vehicle.immatriculation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.agent.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtre de statut
    const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter

    // Filtre de type
    const matchesType = typeFilter === "all" || vehicle.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // Calculer les statistiques
  const stats = {
    total: vehicles.length,
    conforme: vehicles.filter((v) => v.status === "conforme").length,
    nonConforme: vehicles.filter((v) => v.status === "non-conforme").length,
    maintenance: vehicles.filter((v) => v.status === "maintenance").length,
    enAttente: vehicles.filter((v) => v.status === "en-attente").length,
    voitures: vehicles.filter((v) => v.type === "voiture").length,
    camions: vehicles.filter((v) => v.type === "camion").length,
    utilitaires: vehicles.filter((v) => v.type === "utilitaire").length,
  }

  return (
    <div className="space-y-4">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">État du Parc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length} véhicules</div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span>Conformes</span>
                <span className="font-medium">
                  {stats.conforme} ({Math.round((stats.conforme / stats.total) * 100)}%)
                </span>
              </div>
              <Progress
                value={(stats.conforme / stats.total) * 100}
                className="h-1 bg-gray-200"
                indicatorClassName="bg-green-500"
              />

              <div className="flex justify-between text-xs">
                <span>Non-conformes</span>
                <span className="font-medium">
                  {stats.nonConforme} ({Math.round((stats.nonConforme / stats.total) * 100)}%)
                </span>
              </div>
              <Progress
                value={(stats.nonConforme / stats.total) * 100}
                className="h-1 bg-gray-200"
                indicatorClassName="bg-red-500"
              />

              <div className="flex justify-between text-xs">
                <span>Maintenance</span>
                <span className="font-medium">
                  {stats.maintenance} ({Math.round((stats.maintenance / stats.total) * 100)}%)
                </span>
              </div>
              <Progress
                value={(stats.maintenance / stats.total) * 100}
                className="h-1 bg-gray-200"
                indicatorClassName="bg-amber-500"
              />

              <div className="flex justify-between text-xs">
                <span>En attente</span>
                <span className="font-medium">
                  {stats.enAttente} ({Math.round((stats.enAttente / stats.total) * 100)}%)
                </span>
              </div>
              <Progress
                value={(stats.enAttente / stats.total) * 100}
                className="h-1 bg-gray-200"
                indicatorClassName="bg-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Types de Véhicules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-md">
                <Car className="h-6 w-6 text-blue-500 mb-1" />
                <span className="text-xl font-bold">{stats.voitures}</span>
                <span className="text-xs text-gray-500">Voitures</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-md">
                <Truck className="h-6 w-6 text-blue-500 mb-1" />
                <span className="text-xl font-bold">{stats.camions}</span>
                <span className="text-xs text-gray-500">Camions</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-md">
                <Car className="h-6 w-6 text-blue-500 mb-1" />
                <span className="text-xl font-bold">{stats.utilitaires}</span>
                <span className="text-xs text-gray-500">Utilitaires</span>
              </div>
            </div>
            <div className="text-center text-sm text-gray-500">Répartition des véhicules par type</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inspections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-2xl font-bold">12</div>
                <div className="text-xs text-gray-500">Inspections ce mois</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-500">5</div>
                <div className="text-xs text-gray-500">À planifier</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs">Dernière inspection</span>
                <span className="text-xs font-medium">30/07/2023</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs">Prochaine inspection</span>
                <span className="text-xs font-medium">02/08/2023</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs">Taux de conformité</span>
                <span className="text-xs font-medium">75%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Agents Contrôleurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8 agents</div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span>Jean Dupont</span>
                <span className="font-medium">15 inspections</span>
              </div>
              <Progress value={75} className="h-1 bg-gray-200" />

              <div className="flex justify-between text-xs">
                <span>Marie Martin</span>
                <span className="font-medium">12 inspections</span>
              </div>
              <Progress value={60} className="h-1 bg-gray-200" />

              <div className="flex justify-between text-xs">
                <span>Pierre Durand</span>
                <span className="font-medium">10 inspections</span>
              </div>
              <Progress value={50} className="h-1 bg-gray-200" />

              <div className="text-center mt-2">
                <Button variant="link" size="sm" className="text-xs">
                  Voir tous les agents
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des véhicules */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Parc Automobile</CardTitle>
              <CardDescription>Traçabilité et état de tous les véhicules</CardDescription>
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
                  onChange={(e) => setStatusFilter(e.target.value as VehicleStatus | "all")}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="conforme">Conforme</option>
                  <option value="non-conforme">Non-conforme</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="en-attente">En attente</option>
                </select>
                <select
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as Vehicle["type"] | "all")}
                >
                  <option value="all">Tous les types</option>
                  <option value="voiture">Voiture</option>
                  <option value="camion">Camion</option>
                  <option value="utilitaire">Utilitaire</option>
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
                    <th className="py-3 px-4 text-left font-medium">Immatriculation</th>
                    <th className="py-3 px-4 text-left font-medium">Type</th>
                    <th className="py-3 px-4 text-left font-medium">Statut</th>
                    <th className="py-3 px-4 text-left font-medium">Dernière Inspection</th>
                    <th className="py-3 px-4 text-left font-medium">Prochaine Inspection</th>
                    <th className="py-3 px-4 text-left font-medium">Agent</th>
                    <th className="py-3 px-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.length > 0 ? (
                    filteredVehicles.map((vehicle) => (
                      <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{vehicle.immatriculation}</td>
                        <td className="py-3 px-4">
                          {vehicle.type === "voiture" && <Car className="h-4 w-4 inline mr-1" />}
                          {vehicle.type === "camion" && <Truck className="h-4 w-4 inline mr-1" />}
                          {vehicle.type === "utilitaire" && <Car className="h-4 w-4 inline mr-1" />}
                          {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={vehicle.status} issues={vehicle.issues} />
                        </td>
                        <td className="py-3 px-4">{vehicle.lastInspection}</td>
                        <td className="py-3 px-4">{vehicle.nextInspection}</td>
                        <td className="py-3 px-4">{vehicle.agent}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => onSelectVehicle(vehicle.id)}>
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
                      <td colSpan={7} className="py-4 px-4 text-center text-gray-500">
                        Aucun véhicule ne correspond aux critères de recherche
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              Affichage de {filteredVehicles.length} véhicules sur {vehicles.length}
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
    </div>
  )
}

function StatusBadge({ status, issues }: { status: VehicleStatus; issues: number }) {
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
    case "maintenance":
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
          <AlertTriangle className="h-3 w-3 mr-1" /> Maintenance ({issues})
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

