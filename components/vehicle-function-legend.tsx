import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VehicleFunctionBadge } from "./vehicle-function-badge"

export function VehicleFunctionLegend() {
  const functions = [
    { name: "PATROUILLE", description: "Véhicule de patrouille standard" },
    { name: "K9", description: "Véhicule pour unité canine" },
    { name: "ASTREINTE", description: "Véhicule d'astreinte" },
    { name: "DG", description: "Véhicule de la Direction Générale" },
    { name: "LOG", description: "Véhicule logistique" },
    { name: "LIAISON", description: "Véhicule de liaison" },
  ]

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Légende des fonctions</CardTitle>
        <CardDescription>Codes couleur pour les différentes fonctions des véhicules</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {functions.map((func) => (
            <div key={func.name} className="flex items-center space-x-2">
              <VehicleFunctionBadge fonction={func.name} />
              <span className="text-sm text-muted-foreground">{func.description}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
