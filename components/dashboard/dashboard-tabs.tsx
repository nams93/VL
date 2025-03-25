"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VehicleFleetOverview } from "@/components/dashboard/vehicle-fleet-overview"
import { InspectionHistory } from "@/components/dashboard/inspection-history"
import { AgentPerformance } from "@/components/dashboard/agent-performance"
import { VehicleDetails } from "@/components/dashboard/vehicle-details"
import { PendingInspections } from "@/components/dashboard/pending-inspections"
import { FuelCardTracking } from "@/components/dashboard/fuel-card-tracking"

export function DashboardTabs() {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="grid grid-cols-6 md:w-auto w-full">
        <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
        <TabsTrigger value="inspections">Inspections</TabsTrigger>
        <TabsTrigger value="agents">Agents</TabsTrigger>
        <TabsTrigger value="vehicles">Véhicules</TabsTrigger>
        <TabsTrigger value="pending">À valider</TabsTrigger>
        <TabsTrigger value="fuelTracking">Carburant</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <VehicleFleetOverview onSelectVehicle={setSelectedVehicle} />
      </TabsContent>

      <TabsContent value="inspections" className="space-y-4">
        <InspectionHistory />
      </TabsContent>

      <TabsContent value="agents" className="space-y-4">
        <AgentPerformance />
      </TabsContent>

      <TabsContent value="vehicles" className="space-y-4">
        <VehicleDetails selectedVehicle={selectedVehicle} />
      </TabsContent>

      <TabsContent value="pending" className="space-y-4">
        <PendingInspections />
      </TabsContent>

      <TabsContent value="fuelTracking" className="space-y-4">
        <FuelCardTracking />
      </TabsContent>
    </Tabs>
  )
}

