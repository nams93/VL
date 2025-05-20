"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { getAutoSyncService, type AutoSyncConfig, type AutoSyncStatus } from "@/lib/auto-sync-service"
import { Clock, Wifi, Battery, RefreshCw, BellRing, AlertTriangle } from "lucide-react"

export function AutoSyncSettings() {
  const [config, setConfig] = useState<AutoSyncConfig>({
    enabled: true,
    interval: 15,
    onlyWhenOnline: true,
    onlyWhenCharging: false,
    onlyOnWifi: false,
    retryOnFailure: true,
    maxRetries: 3,
    notifyOnComplete: true,
  })
  const [status, setStatus] = useState<AutoSyncStatus>({
    enabled: true,
    syncInProgress: false,
    lastSyncTime: 0,
    lastSyncSuccess: false,
    nextSyncTime: 0,
    isOnline: true,
  })
  const [timeRemaining, setTimeRemaining] = useState("")

  useEffect(() => {
    const autoSyncService = getAutoSyncService()
    setConfig(autoSyncService.getConfig())
    setStatus(autoSyncService.getStatus())

    // Ajouter un écouteur pour les mises à jour d'état
    autoSyncService.addStatusListener(handleStatusUpdate)

    // Mettre à jour le temps restant
    const interval = setInterval(updateTimeRemaining, 1000)

    return () => {
      autoSyncService.removeStatusListener(handleStatusUpdate)
      clearInterval(interval)
    }
  }, [])

  const handleStatusUpdate = (newStatus: AutoSyncStatus) => {
    setStatus(newStatus)
    updateTimeRemaining()
  }

  const updateTimeRemaining = () => {
    if (!status.enabled || status.nextSyncTime === 0) {
      setTimeRemaining("--:--")
      return
    }

    const now = Date.now()
    const remaining = Math.max(0, status.nextSyncTime - now)

    if (remaining === 0) {
      setTimeRemaining("Maintenant")
      return
    }

    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)
    setTimeRemaining(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`)
  }

  const handleConfigChange = (key: keyof AutoSyncConfig, value: any) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)
    const autoSyncService = getAutoSyncService()
    autoSyncService.updateConfig(newConfig)
  }

  const handleForceSyncNow = async () => {
    const autoSyncService = getAutoSyncService()
    await autoSyncService.forceSyncNow()
  }

  const formatLastSyncTime = () => {
    if (status.lastSyncTime === 0) {
      return "Jamais"
    }

    const date = new Date(status.lastSyncTime)
    return date.toLocaleString()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Synchronisation Automatique</CardTitle>
          <Switch checked={config.enabled} onCheckedChange={(checked) => handleConfigChange("enabled", checked)} />
        </div>
        <CardDescription>Configurez la synchronisation automatique de vos données avec Supabase</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Intervalle de synchronisation</Label>
              <div className="text-sm text-gray-500">
                {config.interval} minute{config.interval > 1 ? "s" : ""}
              </div>
            </div>
            <div className="w-[180px]">
              <Slider
                value={[config.interval]}
                min={5}
                max={60}
                step={5}
                disabled={!config.enabled}
                onValueChange={(value) => handleConfigChange("interval", value[0])}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Conditions de synchronisation</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wifi className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="wifi-only">Uniquement sur WiFi</Label>
                </div>
                <Switch
                  id="wifi-only"
                  checked={config.onlyOnWifi}
                  disabled={!config.enabled}
                  onCheckedChange={(checked) => handleConfigChange("onlyOnWifi", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Battery className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="charging-only">Uniquement en charge</Label>
                </div>
                <Switch
                  id="charging-only"
                  checked={config.onlyWhenCharging}
                  disabled={!config.enabled}
                  onCheckedChange={(checked) => handleConfigChange("onlyWhenCharging", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BellRing className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="notify">Notifier après synchronisation</Label>
                </div>
                <Switch
                  id="notify"
                  checked={config.notifyOnComplete}
                  disabled={!config.enabled}
                  onCheckedChange={(checked) => handleConfigChange("notifyOnComplete", checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>État de la synchronisation</Label>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">Dernière synchronisation</div>
                <div className="text-sm font-medium">{formatLastSyncTime()}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">Statut</div>
                <Badge
                  variant="outline"
                  className={
                    status.lastSyncSuccess
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }
                >
                  {status.lastSyncSuccess ? "Réussi" : "Échoué"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">Prochaine synchronisation</div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1 text-gray-500" />
                  <div className="text-sm font-medium">{timeRemaining}</div>
                </div>
              </div>
            </div>
          </div>

          {!status.isOnline && (
            <div className="flex items-center p-2 bg-yellow-50 text-yellow-800 rounded-md">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="text-sm">
                Vous êtes hors ligne. La synchronisation reprendra lorsque vous serez connecté.
              </span>
            </div>
          )}
        </div>

        <Button
          onClick={handleForceSyncNow}
          disabled={!status.isOnline || status.syncInProgress || !config.enabled}
          className="w-full"
        >
          {status.syncInProgress ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Synchronisation en cours...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Synchroniser maintenant
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
