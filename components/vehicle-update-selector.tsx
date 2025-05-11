"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, FileEdit, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export function VehicleUpdateSelector() {
  const [inspections, setInspections] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [vehicleGroups, setVehicleGroups] = useState<{ [key: string]: any[] }>({})

  // Charger les inspections depuis localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("pendingInspections")
      if (stored) {
        const parsedInspections = JSON.parse(stored)

        // Grouper les inspections par immatriculation
        const groups: { [key: string]: any[] } = {}
        parsedInspections.forEach((inspection: any) => {
          const immat = inspection.vehicleInfo.immatriculation
          if (!groups[immat]) {
            groups[immat] = []
          }
          groups[immat].push(inspection)
        })

        // Trier chaque groupe par date (plus récent d'abord)
        Object.keys(groups).forEach((immat) => {
          groups[immat].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        })

        setVehicleGroups(groups)
        setInspections(parsedInspections)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des inspections:", error)
    }
  }, [])

  // Filtrer les immatriculations en fonction de la recherche
  const filteredImmatriculations = Object.keys(vehicleGroups).filter((immat) =>
    immat.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Mise à jour d'inspection par véhicule</CardTitle>
          <CardDescription>
            Sélectionnez un véhicule par immatriculation pour mettre à jour son inspection
          </CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Rechercher par immatriculation..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredImmatriculations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredImmatriculations.map((immat) => (
                <Card key={immat} className="overflow-hidden">
                  <CardHeader className="bg-blue-50 py-3">
                    <CardTitle className="text-lg flex justify-between items-center">
                      <span>Véhicule {immat}</span>
                      <span className="text-sm text-gray-500">{vehicleGroups[immat].length} inspection(s)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {vehicleGroups[immat].slice(0, 3).map((inspection, index) => (
                        <div key={inspection.id} className="p-3 hover:bg-gray-50">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{new Date(inspection.date).toLocaleDateString()}</p>
                              <p className="text-sm text-gray-500">
                                <Clock className="inline h-3 w-3 mr-1" />
                                {new Date(inspection.date).toLocaleTimeString()} - {inspection.agentName}
                              </p>
                            </div>
                            <Link href={`/update-inspection/${inspection.id}`}>
                              <Button variant="outline" size="sm">
                                <FileEdit className="h-3 w-3 mr-1" /> Mettre à jour
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                      {vehicleGroups[immat].length > 3 && (
                        <div className="p-3 text-center text-sm text-gray-500">
                          + {vehicleGroups[immat].length - 3} autres inspections
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? <p>Aucun véhicule ne correspond à votre recherche</p> : <p>Aucune inspection disponible</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
