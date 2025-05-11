// Types pour les notifications
export type NotificationType = "info" | "warning" | "error" | "success"

export type Notification = {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: string
  read: boolean
  agentId?: string // Si la notification est destinée à un agent spécifique
  link?: string // Lien optionnel pour rediriger l'utilisateur
}

// Clé pour le stockage local
const NOTIFICATIONS_STORAGE_KEY = "gpis-notifications"

// Service de notifications
export const notificationService = {
  // Ajouter une notification
  addNotification: (
    type: NotificationType,
    title: string,
    message: string,
    agentId?: string,
    link?: string,
  ): Notification => {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      agentId,
      link,
    }

    // Récupérer les notifications existantes
    const storedNotifications = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
    const notifications: Notification[] = storedNotifications ? JSON.parse(storedNotifications) : []

    // Ajouter la nouvelle notification
    notifications.push(notification)

    // Limiter le nombre de notifications à 100 pour éviter de surcharger le localStorage
    if (notifications.length > 100) {
      notifications.splice(0, notifications.length - 100)
    }

    // Sauvegarder les notifications
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications))

    return notification
  },

  // Récupérer toutes les notifications
  getAllNotifications: (): Notification[] => {
    const storedNotifications = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
    if (!storedNotifications) return []

    try {
      const notifications: Notification[] = JSON.parse(storedNotifications)
      return notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications:", error)
      return []
    }
  },

  // Récupérer les notifications pour un agent
  getNotificationsForAgent: (agentId: string): Notification[] => {
    const notifications = notificationService.getAllNotifications()

    // Filtrer les notifications pour cet agent ou les notifications globales (sans agentId)
    return notifications.filter((notif) => !notif.agentId || notif.agentId === agentId)
  },

  // Récupérer les notifications non lues pour un agent
  getUnreadNotificationsForAgent: (agentId: string): Notification[] => {
    const notifications = notificationService.getNotificationsForAgent(agentId)
    return notifications.filter((notif) => !notif.read)
  },

  // Marquer une notification comme lue
  markAsRead: (notificationId: string): void => {
    const notifications = notificationService.getAllNotifications()

    // Mettre à jour la notification
    const updatedNotifications = notifications.map((notif) => {
      if (notif.id === notificationId) {
        return { ...notif, read: true }
      }
      return notif
    })

    // Sauvegarder les notifications
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications))
  },

  // Marquer toutes les notifications d'un agent comme lues
  markAllAsRead: (agentId: string): void => {
    const notifications = notificationService.getAllNotifications()

    // Mettre à jour les notifications
    const updatedNotifications = notifications.map((notif) => {
      if (!notif.agentId || notif.agentId === agentId) {
        return { ...notif, read: true }
      }
      return notif
    })

    // Sauvegarder les notifications
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications))
  },

  // Supprimer une notification
  deleteNotification: (notificationId: string): void => {
    const notifications = notificationService.getAllNotifications()

    // Filtrer la notification à supprimer
    const updatedNotifications = notifications.filter((notif) => notif.id !== notificationId)

    // Sauvegarder les notifications
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications))
  },

  // Supprimer toutes les notifications d'un agent
  deleteAllNotificationsForAgent: (agentId: string): void => {
    const notifications = notificationService.getAllNotifications()

    // Filtrer les notifications à conserver (celles qui ne sont pas pour cet agent)
    const updatedNotifications = notifications.filter((notif) => notif.agentId && notif.agentId !== agentId)

    // Sauvegarder les notifications
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications))
  },

  // Effacer toutes les notifications
  clearAllNotifications: (): void => {
    localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY)
  },

  // Créer des notifications automatiques basées sur l'état du système
  createAutomaticNotifications: (): void => {
    // Cette fonction pourrait être appelée périodiquement pour générer des notifications
    // basées sur l'état du système, comme des inspections en attente, des problèmes
    // détectés sur les véhicules, etc.

    // Exemple : vérifier les inspections en attente
    const pendingInspections = JSON.parse(localStorage.getItem("pendingInspections") || "[]")

    pendingInspections.forEach((inspection: any) => {
      if (inspection.status === "en_attente" && inspection.agentId) {
        // Vérifier si une notification existe déjà pour cette inspection
        const notifications = notificationService.getAllNotifications()
        const existingNotification = notifications.find(
          (notif) => notif.message.includes(inspection.id) && notif.agentId === inspection.agentId,
        )

        if (!existingNotification) {
          notificationService.addNotification(
            "warning",
            "Inspection en attente",
            `L'inspection ${inspection.id} est en attente de validation.`,
            inspection.agentId,
            `/update-inspection/${inspection.id}`,
          )
        }
      }
    })
  },
}
