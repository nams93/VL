"use client"

import { useEffect, useState } from "react"
import { getAutoSyncService, type AutoSyncStatus } from "@/lib/auto-sync-service"
import { RefreshCw, Clock } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

export function AutoSyncIndicator() {
  const [status, setStatus] = useState<AutoSyncStatus | null>(null)
  const [timeUntilNextSync, setTimeUntilNextSync] = useState<string>("")

  useEffect(() => {
    const autoSyncService = getAutoSyncService()
    setStatus(autoSyncService.getStatus())

    // Ajouter un écouteur pour les changements d'état
    autoSyncService.addStatusListener(handleStatusChange)

    // Mettre à jour le temps jusqu'à la prochaine synchronisation
    const interval = setInterval(updateTimeUntilNextSync, 10000)

    return () => {
      autoSyncService.removeStatusListener(handleStatusChange)
      clearInterval(interval)
    }
  }, [])

  const handleStatusChange = (newStatus: AutoSyncStatus) => {
    setStatus(newStatus)
    updateTimeUntilNextSync()
  }

  const updateTimeUntilNextSync = () => {
    if (!status || !status.enabled || status.nextSyncTime <= 0) {
      setTimeUntilNextSync("")
      return
    }

    const now = Date.now()
    if (status.nextSyncTime <= now) {
      setTimeUntilNextSync("Bientôt")
      return
    }

    try {
      const timeString = formatDistanceToNow(status.nextSyncTime, {
        addSuffix: false,
        locale: fr,
      })
      setTimeUntilNextSync(timeString)
    } catch (error) {
      console.error("Erreur lors du formatage du temps:", error)
      setTimeUntilNextSync("")
    }
  }

  if (!status || !status.enabled) {
    return null
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            {status.syncInProgress ? (
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Clock className="h-3 w-3 mr-1" />
            )}
            <span className="hidden sm:inline">
              {status.syncInProgress ? "Synchronisation..." : `Sync: ${timeUntilNextSync}`}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {status.syncInProgress
              ? "Synchronisation en cours..."
              : `Prochaine synchronisation dans ${timeUntilNextSync}`}
          </p>
          <p className="text-xs mt-1">
            Dernière synchronisation:{" "}
            {status.lastSyncTime > 0
              ? formatDistanceToNow(status.lastSyncTime, { addSuffix: true, locale: fr })
              : "Jamais"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
