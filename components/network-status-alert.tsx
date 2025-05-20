"use client"

import { useNetworkStatus } from "@/hooks/use-network-status"
import { Wifi, WifiOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useEffect, useState } from "react"
import { useTheme } from "@/components/theme-provider"

export function NetworkStatusAlert() {
  const { isOnline, effectiveConnectionType } = useNetworkStatus()
  const [showAlert, setShowAlert] = useState(false)
  const [message, setMessage] = useState("")
  const { theme } = useTheme()

  useEffect(() => {
    if (!isOnline) {
      setMessage("Vous êtes hors ligne. Les données seront synchronisées lorsque la connexion sera rétablie.")
      setShowAlert(true)
    } else if (effectiveConnectionType === "slow-2g" || effectiveConnectionType === "2g") {
      setMessage("Connexion réseau faible. Certaines fonctionnalités peuvent être limitées.")
      setShowAlert(true)
    } else {
      setShowAlert(false)
    }
  }, [isOnline, effectiveConnectionType])

  if (!showAlert) return null

  return (
    <Alert
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isOnline
          ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800"
          : "bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800"
      }`}
    >
      {isOnline ? (
        <Wifi className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      ) : (
        <WifiOff className="h-4 w-4 text-red-600 dark:text-red-400" />
      )}
      <AlertDescription
        className={`${isOnline ? "text-yellow-700 dark:text-yellow-300" : "text-red-700 dark:text-red-300"}`}
      >
        {message}
      </AlertDescription>
    </Alert>
  )
}
