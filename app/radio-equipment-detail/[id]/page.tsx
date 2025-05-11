import { RadioEquipmentDetail } from "@/components/radio-equipment-detail"

export const metadata = {
  title: "Détail Fiche Radio - GPIS",
  description: "Détail d'une fiche de perception ou réintégration des équipements radio et déportés",
}

export default function RadioEquipmentDetailPage({ params }: { params: { id: string } }) {
  return <RadioEquipmentDetail formId={params.id} />
}
