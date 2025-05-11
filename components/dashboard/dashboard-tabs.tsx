"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VehicleFleetOverview } from "@/components/dashboard/vehicle-fleet-overview"
import { InspectionHistory } from "@/components/dashboard/inspection-history"
import { AgentPerformance } from "@/components/dashboard/agent-performance"
import { VehicleDetails } from "@/components/dashboard/vehicle-details"
import { MaintenanceAlerts } from "@/components/dashboard/maintenance-alerts"
import { PendingInspections } from "@/components/dashboard/pending-inspections"
import { RadioEquipmentHistory } from "@/components/dashboard/radio-equipment-history"
import { AgentPerceptions } from "@/components/dashboard/agent-perceptions"

export function DashboardTabs() {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
        <TabsTrigger value="vehicles">Véhicules</TabsTrigger>
        <TabsTrigger value="inspections">Inspections</TabsTrigger>
        <TabsTrigger value="radio">Équipements Radio</TabsTrigger>
        <TabsTrigger value="agents">Agents</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <VehicleFleetOverview />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <MaintenanceAlerts />
          <PendingInspections />
        </div>
      </TabsContent>
      <TabsContent value="vehicles" className="space-y-4">
        <VehicleDetails />
      </TabsContent>
      <TabsContent value="inspections" className="space-y-4">
        <InspectionHistory />
      </TabsContent>
      <TabsContent value="radio" className="space-y-4">
        <RadioEquipmentHistory />
      </TabsContent>
      <TabsContent value="agents" className="space-y-4">
        <AgentPerformance />
        <AgentPerceptions />
      </TabsContent>
    </Tabs>
  )
}
