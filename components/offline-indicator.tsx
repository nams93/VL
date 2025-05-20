"use client"

import { useNetworkStatus } from "@/hooks/use-network-status"
import { WifiOff, Database } from "lucide-react"
import { countPendingItems } from "@/lib/indexed-db-service"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function OfflineIndicator() {
  const { isOnline } = useNetworkStatus()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const checkPendingItems = async () => {
      try {
        const items = await countPendingItems()
        const total = items.inspections + items.photos + items.radioEquipment
        setPendingCount(total)
      } catch (error) {
        console.error("Erreur lors de la vérification des éléments en attente:", error)
      }
    }

    checkPendingItems()

    // Vérifier périodiquement les éléments en attente
    const interval = setInterval(checkPendingItems, 15000) // Toutes les 15 secondes
    return () => clearInterval(interval)
  }, [])

  if (isOnline && pendingCount === 0) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="fixed top-4 right-4 z-50">
            <Badge
              variant="outline"
              className={`flex items-center gap-1 py-1 px-2 ${
                !isOnline
                  ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
                  : "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800"
              }`}
            >
              {!isOnline ? (
                <>
                  <WifiOff className="h-3 w-3" />
                  <span className="text-xs font-medium">Hors ligne</span>
                </>
              ) : (
                <>
                  <Database className="h-3 w-3" />
                  <span className="text-xs font-medium">{pendingCount} en attente</span>
                </>
              )}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {!isOnline
            ? "Vous êtes actuellement hors ligne. Les données sont enregistrées localement."
            : `${pendingCount} élément${pendingCount > 1 ? "s" : ""} en attente de synchronisation.`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
