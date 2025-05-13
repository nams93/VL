"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { notificationService } from "@/lib/notification-service"
import { Badge } from "@/components/ui/badge"
import { authService } from "@/lib/auth-service"

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Charger les notifications
    const loadNotifications = () => {
      const currentAgent = authService.getCurrentAgent()
      if (currentAgent) {
        const allNotifications = notificationService.getAllNotifications()
        const agentNotifications = notificationService.getNotificationsForAgent(currentAgent.id)
        setNotifications(agentNotifications)
        setUnreadCount(agentNotifications.filter((n) => !n.read).length)
      }
    }

    loadNotifications()
    // Rafraîchir les notifications toutes les 30 secondes
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkAllAsRead = () => {
    const currentAgent = authService.getCurrentAgent()
    if (currentAgent) {
      notificationService.markAllAsRead(currentAgent.id)
      setNotifications(notifications.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    }
  }

  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id)
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-xs">
              Tout marquer comme lu
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-auto">
          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 ${notification.read ? "" : "bg-blue-50"}`}
                  onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${getNotificationTypeColor(notification.type)}`}>
                      {getNotificationTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium">{notification.title}</h4>
                        <span className="text-xs text-gray-500">{notification.time}</span>
                      </div>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      {!notification.read && (
                        <Badge className="mt-2 bg-blue-100 text-blue-800 hover:bg-blue-200">Nouveau</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>Aucune notification</p>
            </div>
          )}
        </div>
        <div className="p-2 border-t">
          <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setIsOpen(false)}>
            Voir toutes les notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function getNotificationTypeColor(type: string) {
  switch (type) {
    case "alert":
      return "bg-red-100 text-red-700"
    case "warning":
      return "bg-amber-100 text-amber-700"
    case "info":
      return "bg-blue-100 text-blue-700"
    case "success":
      return "bg-green-100 text-green-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

function getNotificationTypeIcon(type: string) {
  // Vous pouvez importer et utiliser différentes icônes en fonction du type
  return <Bell className="h-4 w-4" />
}
