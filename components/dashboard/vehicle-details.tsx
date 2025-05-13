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

type VehicleDetailsProps = {
  selectedVehicle: string | null
}

export function VehicleDetails({ selectedVehicle }: VehicleDetailsProps) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  useEffect(() => {
    // Charger les véhicules depuis le localStorage
    try {
      const storedVehicles = JSON.parse(localStorage.getItem("vehicles") || "[]")
      if (storedVehicles.length > 0) {
        // Convertir les données stockées au format attendu
        const formattedVehicles = storedVehicles.map((v) => ({
          id: v.id || v.immatriculation,
          immatriculation: v.immatriculation,
          type: v.type || "voiture",
          status: mapVehicleStatus(v.status),
          lastInspection: formatDate(v.lastInspection || new Date().toISOString()),
          nextInspection: formatDate(v.nextInspection || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()),
          agent: v.agent || "Non assigné",
          issues: v.issues || 0,
        }))
        setVehicles(formattedVehicles)
      } else {
        // Utiliser des données fictives si aucune donnée n'est disponible
        setVehicles([
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
        ])
      }
    } catch (error) {
      console.error("Erreur lors du chargement des véhicules:", error)
    }
  }, [])

  useEffect(() => {
    if (selectedVehicle && vehicles.length > 0) {
      const found = vehicles.find((v) => v.id === selectedVehicle)
      if (found) {
        setVehicle(found)
      }
    } else {
      setVehicle(null)
    }
  }, [selectedVehicle, vehicles])

  // Fonction pour mapper les statuts de véhicule
  const mapVehicleStatus = (status: string): VehicleStatus => {
    switch (status) {
      case "disponible":
        return "conforme"
      case "en_service":
        return "conforme"
      case "maintenance":
        return "maintenance"
      case "hors_service":
        return "non-conforme"
      case "en_attente":
        return "en-attente"
      default:
        return "en-attente"
    }
  }

  // Fonction pour formater les dates
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("fr-FR")
    } catch {
      return dateString
    }
  }

  if (!vehicle) {
    return (
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Détails du véhicule</CardTitle>
          <CardDescription>Sélectionnez un véhicule pour voir ses détails</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-col items-center justify-center py-8">
            <Car className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 text-center text-sm">
              Aucun véhicule sélectionné. Veuillez sélectionner un véhicule dans la liste pour afficher ses détails.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-4 w-full max-w-2xl">
              {vehicles.slice(0, 8).map((v) => (
                <Button
                  key={v.id}
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-1.5 justify-start"
                  onClick={() => setVehicle(v)}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {v.type === "voiture" && <Car className="h-3 w-3 flex-shrink-0" />}
                    {v.type === "camion" && <Truck className="h-3 w-3 flex-shrink-0" />}
                    {v.type === "utilitaire" && <Car className="h-3 w-3 flex-shrink-0" />}
                    <span className="truncate">{v.immatriculation}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" size="sm" onClick={() => setVehicle(null)} className="mb-1 h-7 text-xs">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Retour
            </Button>
            <CardTitle className="flex items-center text-base">
              {vehicle.type === "voiture" && <Car className="h-4 w-4 mr-1.5" />}
              {vehicle.type === "camion" && <Truck className="h-4 w-4 mr-1.5" />}
              {vehicle.type === "utilitaire" && <Car className="h-4 w-4 mr-1.5" />}
              Véhicule {vehicle.immatriculation}
            </CardTitle>
            <CardDescription className="flex items-center text-xs">
              {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)} -
              <StatusBadge status={vehicle.status} issues={vehicle.issues} className="ml-1" />
            </CardDescription>
          </div>
          <div className="flex space-x-1">
            <Button variant="outline" size="sm" className="h-7 text-xs">
              <FileText className="h-3.5 w-3.5 mr-1" /> Rapport
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              <Calendar className="h-3.5 w-3.5 mr-1" /> Planifier
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <Tabs defaultValue="overview">
          <TabsList className="w-full h-8">
            <TabsTrigger value="overview" className="text-xs">
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="inspections" className="text-xs">
              Historique
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="text-xs">
              Maintenance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-3 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card>
                <CardHeader className="pb-1 pt-2">
                  <CardTitle className="text-xs font-medium">Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Immatriculation:</span>
                      <span className="font-medium">{vehicle.immatriculation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-medium">
                        {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Statut:</span>
                      <StatusBadge status={vehicle.status} issues={vehicle.issues} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Dernière inspection:</span>
                      <span className="font-medium">{vehicle.lastInspection}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Prochaine inspection:</span>
                      <span className="font-medium">{vehicle.nextInspection}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Agent responsable:</span>
                      <span className="font-medium">{vehicle.agent}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-1 pt-2">
                  <CardTitle className="text-xs font-medium">État actuel</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="text-center">
                      {vehicle.status === "conforme" && (
                        <div className="bg-green-50 p-2 rounded-md">
                          <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
                          <div className="font-medium text-green-700 text-xs">Véhicule conforme</div>
                          <div className="text-[10px] text-green-600">Tous les contrôles sont validés</div>
                        </div>
                      )}
                      {vehicle.status === "non-conforme" && (
                        <div className="bg-red-50 p-2 rounded-md">
                          <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-1" />
                          <div className="font-medium text-red-700 text-xs">Véhicule non-conforme</div>
                          <div className="text-[10px] text-red-600">{vehicle.issues} problèmes détectés</div>
                        </div>
                      )}
                      {vehicle.status === "maintenance" && (
                        <div className="bg-amber-50 p-2 rounded-md">
                          <Tool className="h-6 w-6 text-amber-500 mx-auto mb-1" />
                          <div className="font-medium text-amber-700 text-xs">En maintenance</div>
                          <div className="text-[10px] text-amber-600">{vehicle.issues} problèmes à résoudre</div>
                        </div>
                      )}
                      {vehicle.status === "en-attente" && (
                        <div className="bg-blue-50 p-2 rounded-md">
                          <Clock className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                          <div className="font-medium text-blue-700 text-xs">En attente d'inspection</div>
                          <div className="text-[10px] text-blue-600">Inspection à planifier</div>
                        </div>
                      )}
                    </div>

                    <div className="pt-1">
                      <div className="text-[10px] text-gray-500 mb-0.5">Dernière mise à jour:</div>
                      <div className="text-xs">Il y a 3 jours par {vehicle.agent}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-1 pt-2">
                  <CardTitle className="text-xs font-medium">Actions rapides</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="space-y-1.5">
                    <Button variant="outline" size="sm" className="w-full justify-start h-7 text-xs">
                      <FileText className="h-3.5 w-3.5 mr-1.5" /> Voir le dernier rapport
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start h-7 text-xs">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" /> Planifier une inspection
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start h-7 text-xs">
                      <Tool className="h-3.5 w-3.5 mr-1.5" /> Signaler un problème
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start h-7 text-xs text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100"
                    >
                      <Car className="h-3.5 w-3.5 mr-1.5" /> Nouvelle inspection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-1 pt-2">
                <CardTitle className="text-xs font-medium">Historique récent</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-3 text-xs">
                  <div className="border-l-2 border-blue-500 pl-3 pb-2">
                    <div className="font-medium">{vehicle.lastInspection} - Inspection</div>
                    <div className="text-[10px] text-gray-500">Réalisée par {vehicle.agent}</div>
                    <div className="mt-1">
                      {vehicle.status === "conforme"
                        ? "Inspection complète réalisée. Aucun problème détecté."
                        : `Inspection complète réalisée. ${vehicle.issues} problèmes détectés.`}
                    </div>
                  </div>

                  <div className="border-l-2 border-green-500 pl-3 pb-2">
                    <div className="font-medium">
                      {new Date(
                        new Date(vehicle.lastInspection.split("/").reverse().join("-")).getTime() - 86400000 * 30,
                      )
                        .toLocaleDateString("fr-FR")
                        .replace(/\//g, "/")}{" "}
                      - Maintenance
                    </div>
                    <div className="text-[10px] text-gray-500">Réalisée par Service Technique</div>
                    <div className="mt-1">Maintenance préventive réalisée. Remplacement des filtres et vidange.</div>
                  </div>

                  <div className="border-l-2 border-amber-500 pl-3">
                    <div className="font-medium">
                      {new Date(
                        new Date(vehicle.lastInspection.split("/").reverse().join("-")).getTime() - 86400000 * 60,
                      )
                        .toLocaleDateString("fr-FR")
                        .replace(/\//g, "/")}{" "}
                      - Inspection
                    </div>
                    <div className="text-[10px] text-gray-500">Réalisée par Thomas Dubois</div>
                    <div className="mt-1">Inspection complète réalisée. Problème mineur détecté sur l'éclairage.</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inspections" className="mt-3">
            <Card>
              <CardHeader className="pb-1 pt-2">
                <CardTitle className="text-xs font-medium">Historique des inspections</CardTitle>
                <CardDescription className="text-[10px]">
                  Toutes les inspections réalisées sur ce véhicule
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3">
                <div className="rounded-md border overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="py-2 px-3 text-left font-medium">Date</th>
                        <th className="py-2 px-3 text-left font-medium">Agent</th>
                        <th className="py-2 px-3 text-left font-medium">Statut</th>
                        <th className="py-2 px-3 text-left font-medium">Problèmes</th>
                        <th className="py-2 px-3 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 px-3">{vehicle.lastInspection}</td>
                        <td className="py-2 px-3">{vehicle.agent}</td>
                        <td className="py-2 px-3">
                          <StatusBadge status={vehicle.status} issues={vehicle.issues} />
                        </td>
                        <td className="py-2 px-3">{vehicle.issues}</td>
                        <td className="py-2 px-3">
                          <Button variant="outline" size="sm" className="h-6 text-[10px]">
                            Voir
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3">
                          {new Date(
                            new Date(vehicle.lastInspection.split("/").reverse().join("-")).getTime() - 86400000 * 60,
                          )
                            .toLocaleDateString("fr-FR")
                            .replace(/\//g, "/")}
                        </td>
                        <td className="py-2 px-3">Thomas Dubois</td>
                        <td className="py-2 px-3">
                          <Badge className="text-[10px] h-4 px-1 bg-amber-100 text-amber-800">
                            <AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> Non-conforme
                          </Badge>
                        </td>
                        <td className="py-2 px-3">1</td>
                        <td className="py-2 px-3">
                          <Button variant="outline" size="sm" className="h-6 text-[10px]">
                            Voir
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3">
                          {new Date(
                            new Date(vehicle.lastInspection.split("/").reverse().join("-")).getTime() - 86400000 * 120,
                          )
                            .toLocaleDateString("fr-FR")
                            .replace(/\//g, "/")}
                        </td>
                        <td className="py-2 px-3">Marie Martin</td>
                        <td className="py-2 px-3">
                          <Badge className="text-[10px] h-4 px-1 bg-green-100 text-green-800">
                            <CheckCircle className="h-2.5 w-2.5 mr-0.5" /> Conforme
                          </Badge>
                        </td>
                        <td className="py-2 px-3">0</td>
                        <td className="py-2 px-3">
                          <Button variant="outline" size="sm" className="h-6 text-[10px]">
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

          <TabsContent value="maintenance" className="mt-3">
            <Card>
              <CardHeader className="pb-1 pt-2">
                <CardTitle className="text-xs font-medium">Historique de maintenance</CardTitle>
                <CardDescription className="text-[10px]">
                  Toutes les opérations de maintenance réalisées
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3">
                <div className="rounded-md border overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="py-2 px-3 text-left font-medium">Date</th>
                        <th className="py-2 px-3 text-left font-medium">Type</th>
                        <th className="py-2 px-3 text-left font-medium">Technicien</th>
                        <th className="py-2 px-3 text-left font-medium">Description</th>
                        <th className="py-2 px-3 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 px-3">
                          {new Date(
                            new Date(vehicle.lastInspection.split("/").reverse().join("-")).getTime() - 86400000 * 30,
                          )
                            .toLocaleDateString("fr-FR")
                            .replace(/\//g, "/")}
                        </td>
                        <td className="py-2 px-3">Préventive</td>
                        <td className="py-2 px-3">Service Technique</td>
                        <td className="py-2 px-3">Remplacement des filtres et vidange</td>
                        <td className="py-2 px-3">
                          <Button variant="outline" size="sm" className="h-6 text-[10px]">
                            Détails
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3">
                          {new Date(
                            new Date(vehicle.lastInspection.split("/").reverse().join("-")).getTime() - 86400000 * 90,
                          )
                            .toLocaleDateString("fr-FR")
                            .replace(/\//g, "/")}
                        </td>
                        <td className="py-2 px-3">Corrective</td>
                        <td className="py-2 px-3">Service Technique</td>
                        <td className="py-2 px-3">Remplacement du phare avant droit</td>
                        <td className="py-2 px-3">
                          <Button variant="outline" size="sm" className="h-6 text-[10px]">
                            Détails
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3">
                          {new Date(
                            new Date(vehicle.lastInspection.split("/").reverse().join("-")).getTime() - 86400000 * 180,
                          )
                            .toLocaleDateString("fr-FR")
                            .replace(/\//g, "/")}
                        </td>
                        <td className="py-2 px-3">Préventive</td>
                        <td className="py-2 px-3">Service Technique</td>
                        <td className="py-2 px-3">Révision complète</td>
                        <td className="py-2 px-3">
                          <Button variant="outline" size="sm" className="h-6 text-[10px]">
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
        <Badge className={`text-[10px] h-4 px-1 bg-green-100 text-green-800 hover:bg-green-200 ${className}`}>
          <CheckCircle className="h-2.5 w-2.5 mr-0.5" /> Conforme
        </Badge>
      )
    case "non-conforme":
      return (
        <Badge className={`text-[10px] h-4 px-1 bg-red-100 text-red-800 hover:bg-red-200 ${className}`}>
          <AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> Non-conforme {issues > 0 && `(${issues})`}
        </Badge>
      )
    case "maintenance":
      return (
        <Badge className={`text-[10px] h-4 px-1 bg-amber-100 text-amber-800 hover:bg-amber-200 ${className}`}>
          <AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> Maintenance {issues > 0 && `(${issues})`}
        </Badge>
      )
    case "en-attente":
      return (
        <Badge className={`text-[10px] h-4 px-1 bg-blue-100 text-blue-800 hover:bg-blue-200 ${className}`}>
          <Clock className="h-2.5 w-2.5 mr-0.5" /> En attente
        </Badge>
      )
  }
}
