"use client"

import { useState, useEffect } from "react"
import { Bell, Info, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { notificationService, type NotificationType } from "@/lib/notification-service"
import { Badge } from "@/components/ui/badge"
import { authService } from "@/lib/auth-service"
import Link from "next/link"

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Charger les notifications
    const loadNotifications = () => {
      const currentUser = authService.getCurrentUser()
      if (currentUser) {
        const agentNotifications = notificationService.getNotificationsForAgent(currentUser.id)
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
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      notificationService.markAllAsRead(currentUser.id)
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
        <div className="flex items-center justify-between p-2 border-b">
          <h3 className="font-medium text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-xs h-7 px-2">
              Tout marquer comme lu
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-auto">
          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-2 ${notification.read ? "" : "bg-blue-50"}`}
                  onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-2">
                    <div className={`p-1 rounded-full ${getNotificationTypeColor(notification.type)}`}>
                      {getNotificationTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-xs font-medium line-clamp-1">{notification.title}</h4>
                        <span className="text-[10px] text-gray-500">{formatTimestamp(notification.timestamp)}</span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-1">{notification.message}</p>
                      {!notification.read && (
                        <Badge className="mt-1 py-0 h-4 text-[10px] bg-blue-100 text-blue-800 hover:bg-blue-200">
                          Nouveau
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 text-center text-gray-500">
              <Bell className="h-6 w-6 mx-auto mb-1 text-gray-300" />
              <p className="text-xs">Aucune notification</p>
            </div>
          )}
        </div>
        <div className="p-2 border-t">
          <Link href="/notifications">
            <Button variant="outline" size="sm" className="w-full text-xs h-7" onClick={() => setIsOpen(false)}>
              Voir toutes les notifications
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function getNotificationTypeColor(type: NotificationType) {
  switch (type) {
    case "error":
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

function getNotificationTypeIcon(type: NotificationType) {
  switch (type) {
    case "info":
      return <Info className="h-3 w-3" />
    case "warning":
      return <AlertTriangle className="h-3 w-3" />
    case "error":
      return <AlertCircle className="h-3 w-3" />
    case "success":
      return <CheckCircle className="h-3 w-3" />
    default:
      return <Bell className="h-3 w-3" />
  }
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return "À l'instant"
  if (diffMins < 60) return `Il y a ${diffMins} min`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `Il y a ${diffHours}h`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `Il y a ${diffDays}j`

  return date.toLocaleDateString()
}
