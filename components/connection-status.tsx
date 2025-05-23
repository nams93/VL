"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useSyncState } from "@/hooks/use-sync-state"
import { useTheme } from "@/components/theme-provider"

export function ConnectionStatus() {
  const { isOnline, pendingItems } = useSyncState()
  const [showPending, setShowPending] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    // Afficher le nombre d'éléments en attente pendant 5 secondes si > 0
    if (pendingItems > 0) {
      setShowPending(true)
      const timer = setTimeout(() => setShowPending(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [pendingItems])

  return (
    <Badge
      variant="outline"
      className={`flex items-center gap-1 transition-colors duration-300 ${
        isOnline
          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
          : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="h-3 w-3" />
          <span className="text-xs">
            {showPending && pendingItems > 0 ? `Synchronisation: ${pendingItems} en attente` : "Connecté"}
          </span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          <span className="text-xs">Hors ligne</span>
        </>
      )}
    </Badge>
  )
}
