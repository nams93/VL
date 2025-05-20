"use client"

import { useEffect, useState } from "react"
import { getAutoSyncService, type AutoSyncStatus, type AutoSyncConfig } from "@/lib/auto-sync-service"

export function useAutoSync() {
  const [status, setStatus] = useState<AutoSyncStatus | null>(null)
  const [config, setConfig] = useState<AutoSyncConfig | null>(null)

  useEffect(() => {
    const autoSyncService = getAutoSyncService()

    // Initialiser l'état
    setConfig(autoSyncService.getConfig())
    setStatus(autoSyncService.getStatus())

    // S'abonner aux changements d'état
    const handleStatusChange = (newStatus: AutoSyncStatus) => {
      setStatus(newStatus)
    }

    autoSyncService.addStatusListener(handleStatusChange)

    return () => {
      autoSyncService.removeStatusListener(handleStatusChange)
    }
  }, [])

  const updateConfig = (newConfig: Partial<AutoSyncConfig>) => {
    const autoSyncService = getAutoSyncService()
    autoSyncService.updateConfig(newConfig)
    setConfig({ ...autoSyncService.getConfig() })
  }

  const forceSyncNow = async () => {
    const autoSyncService = getAutoSyncService()
    return await autoSyncService.forceSyncNow()
  }

  return {
    status,
    config,
    updateConfig,
    forceSyncNow,
  }
}
