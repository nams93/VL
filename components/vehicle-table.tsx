"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, ArrowUpDown, Search, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type Vehicle = {
  id: string
  immatriculation: string
  type: string
  chauffeur: string
  statut: "actif" | "inactif" | "maintenance"
  carburant: number
  kilometrage: number
  derniereMaj: string
}

const vehicles: Vehicle[] = [
  {
    id: "v1",
    immatriculation: "AB-123-CD",
    type: "Camion",
    chauffeur: "Jean Dupont",
    statut: "actif",
    carburant: 75,
    kilometrage: 12500,
    derniereMaj: "Il y a 5 minutes",
  },
  {
    id: "v2",
    immatriculation: "EF-456-GH",
    type: "Voiture",
    chauffeur: "Marie Martin",
    statut: "actif",
    carburant: 45,
    kilometrage: 8700,
    derniereMaj: "Il y a 10 minutes",
  },
  {
    id: "v3",
    immatriculation: "IJ-789-KL",
    type: "Camionnette",
    chauffeur: "Pierre Durand",
    statut: "maintenance",
    carburant: 90,
    kilometrage: 5200,
    derniereMaj: "Il y a 1 heure",
  },
  {
    id: "v4",
    immatriculation: "MN-012-OP",
    type: "Camion",
    chauffeur: "Sophie Petit",
    statut: "inactif",
    carburant: 30,
    kilometrage: 18900,
    derniereMaj: "Il y a 2 heures",
  },
  {
    id: "v5",
    immatriculation: "QR-345-ST",
    type: "Voiture",
    chauffeur: "Lucas Bernard",
    statut: "actif",
    carburant: 60,
    kilometrage: 3500,
    derniereMaj: "Il y a 15 minutes",
  },
]

type VehicleTableProps = {
  onSelectVehicle: (id: string) => void
}

export function VehicleTable({ onSelectVehicle }: VehicleTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.immatriculation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.chauffeur.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un véhicule..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent">
                  Immatriculation
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Chauffeur</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Carburant</TableHead>
              <TableHead>Kilométrage</TableHead>
              <TableHead>Dernière Mise à Jour</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-medium">{vehicle.immatriculation}</TableCell>
                <TableCell>{vehicle.type}</TableCell>
                <TableCell>{vehicle.chauffeur}</TableCell>
                <TableCell>
                  <StatusBadge status={vehicle.statut} />
                </TableCell>
                <TableCell>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${getFuelColor(vehicle.carburant)}`}
                      style={{ width: `${vehicle.carburant}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{vehicle.carburant}%</span>
                </TableCell>
                <TableCell>{vehicle.kilometrage} km</TableCell>
                <TableCell>{vehicle.derniereMaj}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Ouvrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onSelectVehicle(vehicle.id)}>Contrôler</DropdownMenuItem>
                      <DropdownMenuItem>Voir détails</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Historique</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: Vehicle["statut"] }) {
  if (status === "actif") {
    return (
      <Badge className="bg-green-500 hover:bg-green-600">
        <CheckCircle className="mr-1 h-3 w-3" /> Actif
      </Badge>
    )
  } else if (status === "inactif") {
    return (
      <Badge variant="outline" className="text-gray-500 border-gray-300">
        <Clock className="mr-1 h-3 w-3" /> Inactif
      </Badge>
    )
  } else {
    return (
      <Badge variant="secondary" className="bg-amber-200 text-amber-800 hover:bg-amber-300">
        <AlertCircle className="mr-1 h-3 w-3" /> Maintenance
      </Badge>
    )
  }
}

function getFuelColor(level: number) {
  if (level > 60) return "bg-green-500"
  if (level > 30) return "bg-amber-500"
  return "bg-red-500"
}

