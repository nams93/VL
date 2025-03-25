"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/overview"
import { VehicleTable } from "@/components/vehicle-table"
import { VehicleMap } from "@/components/vehicle-map"
import { StatsCards } from "@/components/stats-cards"
import { VehicleControl } from "@/components/vehicle-control"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ClipboardCheck } from "lucide-react"
import { InspectionHistory } from "@/components/inspection-history"

export default function DashboardPage() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Tableau de Bord</h2>
          <Link href="/vehicle-inspection">
            <Button>
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Nouvelle Inspection
            </Button>
          </Link>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
            <TabsTrigger value="vehicles">Véhicules</TabsTrigger>
            <TabsTrigger value="map">Carte</TabsTrigger>
            <TabsTrigger value="control">Contrôle</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <StatsCards />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Aperçu</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Activité Récente</CardTitle>
                  <CardDescription>Dernières activités des véhicules</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentActivities />
                </CardContent>
              </Card>
            </div>
            <InspectionHistory />
          </TabsContent>
          <TabsContent value="vehicles" className="space-y-4">
            <VehicleTable onSelectVehicle={(id) => setSelectedVehicleId(id)} />
          </TabsContent>
          <TabsContent value="map" className="space-y-4">
            <VehicleMap />
          </TabsContent>
          <TabsContent value="control" className="space-y-4">
            <VehicleControl selectedVehicleId={selectedVehicleId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function RecentActivities() {
  const activities = [
    { id: 1, vehicle: "Camion 01", event: "Départ du dépôt", time: "Il y a 10 minutes" },
    { id: 2, vehicle: "Voiture 03", event: "Arrivée à destination", time: "Il y a 25 minutes" },
    { id: 3, vehicle: "Camionnette 07", event: "Maintenance programmée", time: "Il y a 1 heure" },
    { id: 4, vehicle: "Camion 05", event: "Alerte de carburant", time: "Il y a 2 heures" },
    { id: 5, vehicle: "Voiture 02", event: "Excès de vitesse", time: "Il y a 3 heures" },
  ]

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">{activity.vehicle}</p>
            <p className="text-sm text-muted-foreground">{activity.event}</p>
          </div>
          <div className="ml-auto text-sm text-muted-foreground">{activity.time}</div>
        </div>
      ))}
    </div>
  )
}

