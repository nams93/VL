"use client"

import { useState, useEffect } from "react"
import { Bell, Info, AlertTriangle, AlertCircle, CheckCircle, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { notificationService, type Notification, type NotificationType } from "@/lib/notification-service"
import { authService } from "@/lib/auth-service"
import Link from "next/link"

export function CompactNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const loadNotifications = () => {
      const currentUser = authService.getCurrentUser()
      if (currentUser) {
        const agentNotifications = notificationService.getNotificationsForAgent(currentUser.id)
        setNotifications(agentNotifications.slice(0, 3)) // Limiter à 3 notifications
      }
    }

    loadNotifications()
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="h-full">
      <CardHeader className="p-3 pb-0">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>Notifications</span>
          <Link href="/notifications" className="text-xs text-blue-600 hover:underline flex items-center">
            Tout voir <ChevronRight className="h-3 w-3 ml-0.5" />
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        {notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-start gap-2 text-xs">
                <div className={`p-1 rounded-full mt-0.5 ${getNotificationTypeColor(notification.type)}`}>
                  {getNotificationTypeIcon(notification.type)}
                </div>
                <div>
                  <div className="font-medium line-clamp-1">{notification.title}</div>
                  <div className="text-gray-500 line-clamp-1">{notification.message}</div>
                  <div className="text-[10px] text-gray-400">{formatTimestamp(notification.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-24 text-gray-400">
            <Bell className="h-8 w-8 mb-1 text-gray-200" />
            <p className="text-xs">Aucune notification</p>
          </div>
        )}
      </CardContent>
    </Card>
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
