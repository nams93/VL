import { RadioEquipmentForm } from "@/components/radio-equipment-form"

export const metadata = {
  title: "Modifier Fiche Radio - GPIS",
  description: "Modifier une fiche de perception ou réintégration des équipements radio et déportés",
}

export default function RadioEquipmentEditPage({ params }: { params: { id: string } }) {
  return <RadioEquipmentForm formId={params.id} isEditing={true} />
}
