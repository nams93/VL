import { VehicleUpdateSelector } from "@/components/vehicle-update-selector"

export const metadata = {
  title: "Mise à jour d'inspection - GPIS",
  description: "Sélectionnez un véhicule pour mettre à jour son inspection",
}

export default function UpdateInspectionPage() {
  return <VehicleUpdateSelector />
}
