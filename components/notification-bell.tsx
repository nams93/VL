"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "@/components/theme-provider"

type Notification = {
  id: string
  title: string
  message: string
  timestamp: number
  read: boolean
  type: "info" | "warning" | "error" | "success"
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { theme } = useTheme()

  useEffect(() => {
    // Charger les notifications depuis le stockage local
    const storedNotifications = localStorage.getItem("gpis-notifications")
    if (storedNotifications) {
      const parsedNotifications = JSON.parse(storedNotifications)
      setNotifications(parsedNotifications)

      // Calculer le nombre de notifications non lues
      const unread = parsedNotifications.filter((notif: Notification) => !notif.read).length
      setUnreadCount(unread)
    }
  }, [])

  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map((notif) => {
      if (notif.id === id) {
        return { ...notif, read: true }
      }
      return notif
    })

    setNotifications(updatedNotifications)
    localStorage.setItem("gpis-notifications", JSON.stringify(updatedNotifications))

    // Mettre à jour le compteur
    const unread = updatedNotifications.filter((notif) => !notif.read).length
    setUnreadCount(unread)
  }

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((notif) => ({ ...notif, read: true }))
    setNotifications(updatedNotifications)
    localStorage.setItem("gpis-notifications", JSON.stringify(updatedNotifications))
    setUnreadCount(0)
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "info":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center bg-red-500 text-white dark:bg-red-600"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[70vh] overflow-y-auto">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 text-xs">
              Tout marquer comme lu
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="py-4 px-2 text-center text-sm text-gray-500 dark:text-gray-400">Aucune notification</div>
        ) : (
          notifications.map((notif) => (
            <DropdownMenuItem
              key={notif.id}
              className={`flex flex-col items-start p-3 cursor-pointer transition-colors duration-300 ${
                !notif.read ? "bg-gray-50 dark:bg-gray-800/50" : ""
              }`}
              onClick={() => markAsRead(notif.id)}
            >
              <div className="flex justify-between w-full">
                <div className={`text-xs px-1.5 py-0.5 rounded ${getNotificationColor(notif.type)}`}>
                  {notif.type === "info" && "Information"}
                  {notif.type === "warning" && "Avertissement"}
                  {notif.type === "error" && "Erreur"}
                  {notif.type === "success" && "Succès"}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(notif.timestamp)}</span>
              </div>
              <div className="mt-1 font-medium text-sm">{notif.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.message}</div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
