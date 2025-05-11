"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { authService } from "@/lib/auth-service"
import { activityTrackingService, type ActivityType } from "@/lib/activity-tracking-service"

// Mapper les chemins d'URL aux types d'activité
const pathToActivityMap: Record<string, ActivityType> = {
  "/": "view-dashboard",
  "/dashboard": "view-dashboard",
  "/vehicle-inspection": "vehicle-inspection",
  "/radio-equipment": "radio-perception",
  "/update-inspection": "form-update",
}

// Obtenir le type d'activité à partir du chemin
const getActivityTypeFromPath = (path: string): ActivityType => {
  // Vérifier les correspondances exactes
  if (path in pathToActivityMap) {
    return pathToActivityMap[path]
  }

  // Vérifier les correspondances partielles
  if (path.includes("radio-equipment")) return "radio-perception"
  if (path.includes("vehicle-inspection")) return "vehicle-inspection"
  if (path.includes("update-inspection")) return "form-update"

  // Par défaut
  return "view-dashboard"
}

export function ActivityTracker() {
  const pathname = usePathname()
  const lastActivityTime = useRef<number>(Date.now())
  const idleTimeout = useRef<NodeJS.Timeout | null>(null)

  // Suivre le changement de page
  useEffect(() => {
    const currentAgent = authService.getCurrentAgent()
    if (!currentAgent) return

    const activityType = getActivityTypeFromPath(pathname)

    // Enregistrer l'activité
    activityTrackingService.trackActivity(
      currentAgent.id,
      currentAgent.name,
      activityType,
      `Navigation vers ${pathname}`,
      undefined,
      undefined,
      pathname,
    )

    // Réinitialiser le timer d'inactivité
    lastActivityTime.current = Date.now()
    if (idleTimeout.current) {
      clearTimeout(idleTimeout.current)
    }

    // Configurer un nouveau timer d'inactivité (5 minutes)
    idleTimeout.current = setTimeout(
      () => {
        activityTrackingService.trackActivity(
          currentAgent.id,
          currentAgent.name,
          "idle",
          "Inactif depuis 5 minutes",
          undefined,
          undefined,
          pathname,
        )
      },
      5 * 60 * 1000,
    )

    // Nettoyage
    return () => {
      if (idleTimeout.current) {
        clearTimeout(idleTimeout.current)
      }
    }
  }, [pathname])

  // Suivre l'activité de l'utilisateur (clics, frappes)
  useEffect(() => {
    const handleUserActivity = () => {
      lastActivityTime.current = Date.now()
    }

    // Ajouter des écouteurs d'événements
    window.addEventListener("click", handleUserActivity)
    window.addEventListener("keypress", handleUserActivity)
    window.addEventListener("scroll", handleUserActivity)
    window.addEventListener("mousemove", handleUserActivity)

    // Nettoyage
    return () => {
      window.removeEventListener("click", handleUserActivity)
      window.removeEventListener("keypress", handleUserActivity)
      window.removeEventListener("scroll", handleUserActivity)
      window.removeEventListener("mousemove", handleUserActivity)
    }
  }, [])

  // Composant invisible
  return null
}
