import { cn } from "@/lib/utils"

type VehicleFunctionBadgeProps = {
  fonction: string
  size?: "default" | "sm" | "lg"
  className?: string
}

export function VehicleFunctionBadge({ fonction, size = "default", className }: VehicleFunctionBadgeProps) {
  // Déterminer la couleur en fonction du type de fonction
  const getVariant = (fonction: string) => {
    switch (fonction) {
      case "PATROUILLE":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800"
      case "K9":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800"
      case "ASTREINTE":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 border-orange-200 dark:border-orange-800"
      case "DG":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-800"
      case "LOG":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
      case "LIAISON":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
    }
  }

  // Déterminer la taille
  const getSize = (size: string) => {
    switch (size) {
      case "sm":
        return "text-xs px-1.5 py-0.5"
      case "lg":
        return "text-sm px-3 py-1"
      default:
        return "text-xs px-2 py-0.5"
    }
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded border font-medium",
        getVariant(fonction),
        getSize(size),
        className,
      )}
    >
      {fonction}
    </span>
  )
}
