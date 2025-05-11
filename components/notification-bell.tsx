"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { authService } from "@/lib/auth-service"
import { notificationService, type Notification } from "@/lib/notification-service"

export function NotificationBell() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    // Charger les notifications au chargement du composant
    loadNotifications()

    // Créer des notifications automatiques
    notificationService.createAutomaticNotifications()

    // Actualiser les notifications toutes les minutes
    const interval = setInterval(loadNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadNotifications = () => {
    const currentAgent = authService.getCurrentAgent()
    if (currentAgent) {
      const agentNotifications = notificationService.getNotificationsForAgent(currentAgent.id)
      setNotifications(agentNotifications)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    // Marquer comme lu
    notificationService.markAsRead(notification.id)

    // Fermer le menu
    setShowNotifications(false)

    // Recharger les notifications
    loadNotifications()

    // Rediriger si un lien est spécifié
    if (notification.link) {
      router.push(notification.link)
    }
  }

  const handleMarkAllAsRead = () => {
    const currentAgent = authService.getCurrentAgent()
    if (currentAgent) {
      notificationService.markAllAsRead(currentAgent.id)
      loadNotifications()
    }
  }

  const handleViewAllNotifications = () => {
    setShowNotifications(false)
    router.push("/notifications")
  }

  // Filtrer les notifications non lues
  const unreadNotifications = notifications.filter((notif) => !notif.read)

  // Obtenir la couleur de la notification
  const getNotificationColor = (type: string) => {
    switch (type) {
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800"
      case "warning":
        return "bg-amber-50 border-amber-200 text-amber-800"
      case "error":
        return "bg-red-50 border-red-200 text-red-800"
      case "success":
        return "bg-green-50 border-green-200 text-green-800"
      default:
        return "bg-gray-50 border-gray-200 text-gray-800"
    }
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setShowNotifications(!showNotifications)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadNotifications.length > 0 && (
          <Badge
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white"
            aria-label={`${unreadNotifications.length} notifications non lues`}
          >
            {unreadNotifications.length}
          </Badge>
        )}
      </Button>

      {showNotifications && (
        <Card className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto z-50 shadow-lg">
          <div className="p-3 border-b flex justify-between items-center">
            <div className="font-medium">Notifications</div>
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                Tout marquer comme lu
              </Button>
            )}
          </div>

          {notifications.length > 0 ? (
            <div>
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!notification.read ? "bg-blue-50" : ""}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex justify-between">
                    <div className="font-medium flex items-center gap-2">
                      {!notification.read && <div className="h-2 w-2 bg-blue-500 rounded-full" aria-hidden="true" />}
                      {notification.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(notification.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div className="text-sm mt-1">{notification.message}</div>
                  {notification.link && <div className="text-xs text-blue-500 mt-1">Cliquer pour voir les détails</div>}
                </div>
              ))}

              {notifications.length > 5 && (
                <div className="p-3 text-center border-t">
                  <Button variant="link" onClick={handleViewAllNotifications}>
                    Voir toutes les notifications ({notifications.length})
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">Aucune notification</div>
          )}
        </Card>
      )}
    </div>
  )
}
