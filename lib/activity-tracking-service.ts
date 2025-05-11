// Types pour le suivi d'activité
export type ActivityType =
  | "login"
  | "logout"
  | "vehicle-inspection"
  | "radio-perception"
  | "radio-reintegration"
  | "form-update"
  | "view-dashboard"
  | "admin-action"
  | "idle"

export type AgentActivity = {
  agentId: string
  agentName: string
  activityType: ActivityType
  timestamp: string
  details?: string
  location?: string
  vehicleId?: string
  formId?: string
}

// Clés pour le stockage local
const ACTIVITY_STORAGE_KEY = "gpis-activity-history"
const ACTIVE_AGENTS_KEY = "gpis-active-agents"

// Service de suivi d'activité
export const activityTrackingService = {
  // Suivre une activité
  trackActivity: (
    agentId: string,
    agentName: string,
    activityType: ActivityType,
    details?: string,
    location?: string,
    vehicleId?: string,
    formId?: string,
  ): void => {
    // Créer l'enregistrement d'activité
    const activity: AgentActivity = {
      agentId,
      agentName,
      activityType,
      timestamp: new Date().toISOString(),
      details,
      location,
      vehicleId,
      formId,
    }

    // Récupérer l'historique d'activité existant
    const storedActivities = localStorage.getItem(ACTIVITY_STORAGE_KEY)
    const activities: AgentActivity[] = storedActivities ? JSON.parse(storedActivities) : []

    // Ajouter la nouvelle activité
    activities.push(activity)

    // Limiter l'historique à 1000 entrées pour éviter de surcharger le localStorage
    if (activities.length > 1000) {
      activities.splice(0, activities.length - 1000)
    }

    // Sauvegarder l'historique
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activities))

    // Mettre à jour l'état de l'agent actif
    activityTrackingService.updateAgentStatus(agentId, agentName, activityType, details, location)
  },

  // Mettre à jour le statut d'un agent
  updateAgentStatus: (
    agentId: string,
    agentName: string,
    activityType: ActivityType,
    details?: string,
    location?: string,
  ): void => {
    // Récupérer les agents actifs
    const storedAgents = localStorage.getItem(ACTIVE_AGENTS_KEY)
    const activeAgents = storedAgents ? JSON.parse(storedAgents) : {}

    // Mettre à jour ou ajouter l'agent
    activeAgents[agentId] = {
      agentName,
      lastActivity: activityType,
      lastDetails: details,
      lastTimestamp: new Date().toISOString(),
      location,
    }

    // Sauvegarder les agents actifs
    localStorage.setItem(ACTIVE_AGENTS_KEY, JSON.stringify(activeAgents))
  },

  // Récupérer les agents actifs
  getActiveAgents: (): Record<string, any> => {
    const storedAgents = localStorage.getItem(ACTIVE_AGENTS_KEY)
    if (!storedAgents) return {}

    try {
      return JSON.parse(storedAgents)
    } catch (error) {
      console.error("Erreur lors de la récupération des agents actifs:", error)
      return {}
    }
  },

  // Récupérer toutes les activités
  getAllActivities: (limit = 100): AgentActivity[] => {
    const storedActivities = localStorage.getItem(ACTIVITY_STORAGE_KEY)
    if (!storedActivities) return []

    try {
      const activities: AgentActivity[] = JSON.parse(storedActivities)
      // Trier par date décroissante et limiter le nombre
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit)
    } catch (error) {
      console.error("Erreur lors de la récupération des activités:", error)
      return []
    }
  },

  // Récupérer les activités d'un agent
  getAgentActivities: (agentId: string, limit = 100): AgentActivity[] => {
    const storedActivities = localStorage.getItem(ACTIVITY_STORAGE_KEY)
    if (!storedActivities) return []

    try {
      const activities: AgentActivity[] = JSON.parse(storedActivities)
      // Filtrer par agent, trier par date décroissante et limiter le nombre
      return activities
        .filter((activity) => activity.agentId === agentId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit)
    } catch (error) {
      console.error("Erreur lors de la récupération des activités de l'agent:", error)
      return []
    }
  },

  // Nettoyer les agents inactifs (plus de 2 heures d'inactivité)
  cleanupInactiveAgents: (): void => {
    const storedAgents = localStorage.getItem(ACTIVE_AGENTS_KEY)
    if (!storedAgents) return

    try {
      const activeAgents = JSON.parse(storedAgents)
      const now = new Date()
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)

      // Filtrer les agents inactifs
      const updatedAgents: Record<string, any> = {}

      Object.entries(activeAgents).forEach(([agentId, data]: [string, any]) => {
        const lastActivity = new Date(data.lastTimestamp)

        if (lastActivity >= twoHoursAgo) {
          // L'agent est toujours actif
          updatedAgents[agentId] = data
        } else if (data.lastActivity !== "logout") {
          // L'agent est inactif mais n'a pas explicitement fait de déconnexion
          // Marquer comme inactif
          activityTrackingService.trackActivity(
            agentId,
            data.agentName,
            "idle",
            "Agent inactif depuis plus de 2 heures",
          )
        }
      })

      // Sauvegarder les agents actifs mis à jour
      localStorage.setItem(ACTIVE_AGENTS_KEY, JSON.stringify(updatedAgents))
    } catch (error) {
      console.error("Erreur lors du nettoyage des agents inactifs:", error)
    }
  },

  // Récupérer tous les agents qui ont été actifs
  getAllAgents: (): { id: string; name: string }[] => {
    const storedActivities = localStorage.getItem(ACTIVITY_STORAGE_KEY)
    if (!storedActivities) return []

    try {
      const activities: AgentActivity[] = JSON.parse(storedActivities)

      // Extraire les agents uniques
      const agentsMap = new Map<string, string>()

      activities.forEach((activity) => {
        if (!agentsMap.has(activity.agentId)) {
          agentsMap.set(activity.agentId, activity.agentName)
        }
      })

      // Convertir en tableau
      return Array.from(agentsMap.entries()).map(([id, name]) => ({ id, name }))
    } catch (error) {
      console.error("Erreur lors de la récupération de tous les agents:", error)
      return []
    }
  },

  // Effacer toutes les activités
  clearAllActivities: (): void => {
    localStorage.removeItem(ACTIVITY_STORAGE_KEY)
  },

  // Obtenir une description lisible du type d'activité
  getActivityDescription: (activityType: ActivityType): string => {
    switch (activityType) {
      case "login":
        return "Connexion"
      case "logout":
        return "Déconnexion"
      case "vehicle-inspection":
        return "Inspection véhicule"
      case "radio-perception":
        return "Perception radio"
      case "radio-reintegration":
        return "Réintégration radio"
      case "form-update":
        return "Mise à jour formulaire"
      case "view-dashboard":
        return "Consultation tableau de bord"
      case "admin-action":
        return "Action administrative"
      case "idle":
        return "Inactif"
      default:
        return activityType
    }
  },
}
