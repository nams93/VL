"use client"

import { useState, useEffect } from "react"
import { RefreshCw, Check, AlertTriangle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useTheme } from "@/components/theme-provider"

export function SyncStatus() {
  const [syncState, setSyncState] = useState<"idle" | "syncing" | "success" | "error">("idle")
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState("")
  const { theme } = useTheme()

  useEffect(() => {
    // Simuler une synchronisation périodique
    const interval = setInterval(() => {
      const shouldSync = Math.random() > 0.7 // 30% de chance de synchroniser

      if (shouldSync) {
        startSync()
      }
    }, 30000) // Vérifier toutes les 30 secondes

    return () => clearInterval(interval)
  }, [])

  const startSync = () => {
    setSyncState("syncing")
    setProgress(0)
    setMessage("Synchronisation en cours...")

    // Simuler une progression
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 20

        if (newProgress >= 100) {
          clearInterval(progressInterval)

          // Simuler une réussite ou un échec
          const isSuccess = Math.random() > 0.1 // 90% de chance de réussite

          if (isSuccess) {
            setSyncState("success")
            setMessage("Synchronisation réussie")
            setTimeout(() => setSyncState("idle"), 3000)
          } else {
            setSyncState("error")
            setMessage("Échec de la synchronisation")
            setTimeout(() => setSyncState("idle"), 5000)
          }

          return 100
        }

        return newProgress
      })
    }, 300)
  }

  if (syncState === "idle") return null

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 px-4">
      <div
        className={`mx-auto max-w-md p-3 rounded-md shadow-md transition-colors duration-300 ${
          syncState === "syncing"
            ? "bg-blue-50 dark:bg-blue-900/30"
            : syncState === "success"
              ? "bg-green-50 dark:bg-green-900/30"
              : "bg-red-50 dark:bg-red-900/30"
        }`}
      >
        <div className="flex items-center mb-2">
          {syncState === "syncing" && (
            <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2 animate-spin" />
          )}
          {syncState === "success" && <Check className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />}
          {syncState === "error" && <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />}
          <span
            className={`text-sm font-medium ${
              syncState === "syncing"
                ? "text-blue-700 dark:text-blue-300"
                : syncState === "success"
                  ? "text-green-700 dark:text-green-300"
                  : "text-red-700 dark:text-red-300"
            }`}
          >
            {message}
          </span>
        </div>
        {syncState === "syncing" && (
          <Progress
            value={progress}
            className="h-1.5 bg-blue-100 dark:bg-blue-800"
            indicatorClassName="bg-blue-600 dark:bg-blue-400"
          />
        )}
      </div>
    </div>
  )
}
