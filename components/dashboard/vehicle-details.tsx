"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Car,
  Truck,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Calendar,
  ArrowLeft,
  PenToolIcon as Tool,
} from "lucide-react"

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
]

type VehicleDetailsProps = {
  selectedVehicle: string | null
}

export function VehicleDetails({ selectedVehicle }: VehicleDetailsProps) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)

  useEffect(() => {
    if (selectedVehicle) {
      const found = vehicles.find((v) => v.id === selectedVehicle)
      if (found) {
        setVehicle(found)
      }
    } else {
      setVehicle(null)
    }
  }, [selectedVehicle])

  if (!vehicle) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Détails du véhicule</CardTitle>
          <CardDescription>Sélectionnez un véhicule pour voir ses détails</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <Car className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-center">
              Aucun véhicule sélectionné. Veuillez sélectionner un véhicule dans la liste pour afficher ses détails.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => window.history.back()}>
              Retour à la liste des véhicules
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" size="sm" onClick={() => setVehicle(null)} className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-1" /> Retour
            </Button>
            <CardTitle className="flex items-center">
              {vehicle.type === "voiture" && <Car className="h-5 w-5 mr-2" />}
              {vehicle.type === "camion" && <Truck className="h-5 w-5 mr-2" />}
              {vehicle.type === "utilitaire" && <Car className="h-5 w-5 mr-2" />}
              Véhicule {vehicle.immatriculation}
            </CardTitle>
            <CardDescription>
              {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)} -
              <StatusBadge status={vehicle.status} issues={vehicle.issues} className="ml-2" />
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" /> Rapport
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" /> Planifier
            </Button>
            <Button variant="outline" size="sm">
              <Tool className="h-4 w-4 mr-2" /> Maintenance
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="w-full">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="inspections">Historique des inspections</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Informations générales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Immatriculation:</span>
                      <span className="text-sm font-medium">{vehicle.immatriculation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Type:</span>
                      <span className="text-sm font-medium">
                        {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Statut:</span>
                      <StatusBadge status={vehicle.status} issues={vehicle.issues} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Dernière inspection:</span>
                      <span className="text-sm font-medium">{vehicle.lastInspection}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Prochaine inspection:</span>
                      <span className="text-sm font-medium">{vehicle.nextInspection}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Agent responsable:</span>
                      <span className="text-sm font-medium">{vehicle.agent}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">État actuel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      {vehicle.status === "conforme" && (
                        <div className="bg-green-50 p-3 rounded-md">
                          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                          <div className="font-medium text-green-700">Véhicule conforme</div>
                          <div className="text-xs text-green-600">Tous les contrôles sont validés</div>
                        </div>
                      )}
                      {vehicle.status === "non-conforme" && (
                        <div className="bg-red-50 p-3 rounded-md">
                          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                          <div className="font-medium text-red-700">Véhicule non-conforme</div>
                          <div className="text-xs text-red-600">{vehicle.issues} problèmes détectés</div>
                        </div>
                      )}
                      {vehicle.status === "maintenance" && (
                        <div className="bg-amber-50 p-3 rounded-md">
                          <Tool className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                          <div className="font-medium text-amber-700">En maintenance</div>
                          <div className="text-xs text-amber-600">{vehicle.issues} problèmes à résoudre</div>
                        </div>
                      )}
                      {vehicle.status === "en-attente" && (
                        <div className="bg-blue-50 p-3 rounded-md">
                          <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                          <div className="font-medium text-blue-700">En attente d'inspection</div>
                          <div className="text-xs text-blue-600">Inspection à planifier</div>
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      <div className="text-xs text-gray-500 mb-1">Dernière mise à jour:</div>
                      <div className="text-sm">Il y a 3 jours par {vehicle.agent}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Actions rapides</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" /> Voir le dernier rapport
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" /> Planifier une inspection
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Tool className="h-4 w-4 mr-2" /> Signaler un problème
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100"
                    >
                      <Car className="h-4 w-4 mr-2" /> Nouvelle inspection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Historique récent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-2 border-blue-500 pl-4 pb-4">
                    <div className="text-sm font-medium">{vehicle.lastInspection} - Inspection</div>
                    <div className="text-xs text-gray-500">Réalisée par {vehicle.agent}</div>
                    <div className="mt-1 text-sm">
                      {vehicle.status === "conforme"
                        ? "Inspection complète réalisée. Aucun problème détecté."
                        : `Inspection complète réalisée. ${vehicle.issues} problèmes détectés.`}
                    </div>
                  </div>

                  <div className="border-l-2 border-green-500 pl-4 pb-4">
                    <div className="text-sm font-medium">
                      {new Date(
                        new Date(vehicle.lastInspection.split("/").reverse().join("-")).getTime() - 86400000 * 30,
                      )
                        .toLocaleDateString("fr-FR")
                        .replace(/\//g, "/")}{" "}
                      - Maintenance
                    </div>
                    <div className="text-xs text-gray-500">Réalisée par Service Technique</div>
                    <div className="mt-1 text-sm">
                      Maintenance préventive réalisée. Remplacement des filtres et vidange.
                    </div>
                  </div>

                  <div className="border-l-2 border-amber-500 pl-4">
                    <div className="text-sm font-medium">
                      {new Date(
                        new Date(vehicle.lastInspection.split("/").reverse().join("-")).getTime() - 86400000 * 60,
                      )
                        .toLocaleDateString("fr-FR")
                        .replace(/\//g, "/")}{" "}
                      - Inspection
                    </div>
                    <div className="text-xs text-gray-500">Réalisée par Thomas Dubois</div>
                    <div className="mt-1 text-sm">
                      Inspection complète réalisée. Problème mineur détecté sur l'éclairage.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inspections" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Historique des inspections</CardTitle>
                <CardDescription>Toutes les inspections réalisées sur ce véhicule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="py-3 px-4 text-left font-medium">Date</th>
                        <th className="py-3 px-4 text-left font-medium">Agent</th>
                        <th className="py-3 px-4 text-left font-medium">Statut</th>
                        <th className="py-3 px-4 text-left font-medium">Problèmes</th>
                        <th className="py-3 px-4 text-left font-medium">Signatures</th>
                        <th className="py-3 px-4 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">{vehicle.lastInspection}</td>
                        <td className="py-3 px-4">{vehicle.agent}</td>
                        <td className="py-3 px-4">
                          <StatusBadge status={vehicle.status} issues={vehicle.issues} />
                        </td>
                        <td className="py-3 px-4">{vehicle.issues}</td>
                        <td className="py-3 px-4">
                          <Badge className="bg-green-100 text-green-800">Complètes</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm">
                            Voir
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">
                          {new Date(
                            new Date(vehicle.lastInspection.split("/").reverse().join("-")).getTime() - 86400000 * 60,
                          )
                            .toLocaleDateString("fr-FR")
                            .replace(/\//g, "/")}
                        </td>
                        <td className="py-3 px-4">Thomas Dubois</td>
                        <td className="py-3 px-4">
                          <Badge className="bg-amber-100 text-amber-800">
                            <AlertTriangle className="h-3 w-3 mr-1" /> Non-conforme
                          </Badge>
                        </td>
                        <td className="py-3 px-4">1</td>
                        <td className="py-3 px-4">
                          <Badge className="bg-green-100 text-green-800">Complètes</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm">
                            Voir
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">
                          {new Date(
                            new Date(vehicle.lastInspection.split("/").reverse().join("-")).getTime() - 86400000 * 120,
                          )
                            .toLocaleDateString("fr-FR")
                            .replace(/\//g, "/")}
                        </td>
                        <td className="py-3 px-4">Marie Martin</td>
                        <td className="py-3 px-4">
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" /> Conforme
                          </Badge>
                        </td>
                        <td className="py-3 px-4">0</td>
                        <td className="py-3 px-4">
                          <Badge className="bg-green-100 text-green-800">Complètes</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm">
                            Voir
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Historique de maintenance</CardTitle>
                <CardDescription>Toutes les opérations de maintenance réalisées</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="py-3 px-4 text-left font-medium">Date</th>
                        <th className="py-3 px-4 text-left font-medium">Type</th>
                        <th className="py-3 px-4 text-left font-medium">Technicien</th>
                        <th className="py-3 px-4 text-left font-medium">Description</th>
                        <th className="py-3 px-4 text-left font-medium">Statut</th>
                        <th className="py-3 px-4 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">
                          {new Date(
                            new Date(vehicle.lastInspection.split("/").reverse().join("-")).getTime() - 86400000 * 30,
                          )
                            .toLocaleDateString("fr-FR")
                            .replace(/\//g, "/")}
                        </td>
                        <td className="py-3 px-4">Préventive</td>
                        <td className="py-3 px-4">Service Technique</td>
                        <td className="py-3 px-4">Remplacement des filtres et vidange</td>
                        <td className="py-3 px-4">
                          <Badge className="bg-green-100 text-green-800">Terminée</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm">
                            Détails
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">
                          {new Date(
                            new Date(vehicle.lastInspection.split("/").reverse().join("-")).getTime() - 86400000 * 90,
                          )
                            .toLocaleDateString("fr-FR")
                            .replace(/\//g, "/")}
                        </td>
                        <td className="py-3 px-4">Corrective</td>
                        <td className="py-3 px-4">Service Technique</td>
                        <td className="py-3 px-4">Remplacement du phare avant droit</td>
                        <td className="py-3 px-4">
                          <Badge className="bg-green-100 text-green-800">Terminée</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm">
                            Détails
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">
                          {new Date(
                            new Date(vehicle.lastInspection.split("/").reverse().join("-")).getTime() - 86400000 * 180,
                          )
                            .toLocaleDateString("fr-FR")
                            .replace(/\//g, "/")}
                        </td>
                        <td className="py-3 px-4">Préventive</td>
                        <td className="py-3 px-4">Service Technique</td>
                        <td className="py-3 px-4">Révision complète</td>
                        <td className="py-3 px-4">
                          <Badge className="bg-green-100 text-green-800">Terminée</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm">
                            Détails
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function StatusBadge({
  status,
  issues,
  className = "",
}: { status: VehicleStatus; issues: number; className?: string }) {
  switch (status) {
    case "conforme":
      return (
        <Badge className={`bg-green-100 text-green-800 hover:bg-green-200 ${className}`}>
          <CheckCircle className="h-3 w-3 mr-1" /> Conforme
        </Badge>
      )
    case "non-conforme":
      return (
        <Badge className={`bg-red-100 text-red-800 hover:bg-red-200 ${className}`}>
          <AlertTriangle className="h-3 w-3 mr-1" /> Non-conforme ({issues})
        </Badge>
      )
    case "maintenance":
      return (
        <Badge className={`bg-amber-100 text-amber-800 hover:bg-amber-200 ${className}`}>
          <AlertTriangle className="h-3 w-3 mr-1" /> Maintenance ({issues})
        </Badge>
      )
    case "en-attente":
      return (
        <Badge className={`bg-blue-100 text-blue-800 hover:bg-blue-200 ${className}`}>
          <Clock className="h-3 w-3 mr-1" /> En attente
        </Badge>
      )
  }
}

