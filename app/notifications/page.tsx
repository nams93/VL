"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Bell, Check, Trash2, ExternalLink, Info, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { authService } from "@/lib/auth-service"
import { notificationService, type Notification, type NotificationType } from "@/lib/notification-service"

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<string>("all")

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const user = authService.getCurrentUser()
    if (!user) {
      router.push("/login")
      return
    }

    setCurrentUser(user)
    loadNotifications()
  }, [router])

  const loadNotifications = () => {
    const user = authService.getCurrentUser()
    if (user) {
      const userNotifications = notificationService.getNotificationsForAgent(user.id)
      setNotifications(userNotifications)
    }
  }

  const markAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId)
    loadNotifications()
  }

  const deleteNotification = (notificationId: string) => {
    notificationService.deleteNotification(notificationId)
    loadNotifications()
  }

  const markAllAsRead = () => {
    if (currentUser) {
      notificationService.markAllAsRead(currentUser.id)
      loadNotifications()
    }
  }

  // Filtrer les notifications en fonction de l'onglet actif
  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notif.read
    return notif.type === activeTab
  })

  // Obtenir le nombre de notifications non lues
  const unreadCount = notifications.filter((notif) => !notif.read).length

  // Obtenir le nombre de notifications par type
  const infoCount = notifications.filter((notif) => notif.type === "info").length
  const warningCount = notifications.filter((notif) => notif.type === "warning").length
  const errorCount = notifications.filter((notif) => notif.type === "error").length
  const successCount = notifications.filter((notif) => notif.type === "success").length

  // Fonction pour obtenir l'icône en fonction du type de notification
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>

        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="outline">Retour au tableau de bord</Button>
          </Link>

          {unreadCount > 0 && (
            <Button onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Tout marquer comme lu
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Centre de notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">Toutes ({notifications.length})</TabsTrigger>
              <TabsTrigger value="unread">Non lues ({unreadCount})</TabsTrigger>
              <TabsTrigger value="info">Informations ({infoCount})</TabsTrigger>
              <TabsTrigger value="warning">Avertissements ({warningCount})</TabsTrigger>
              <TabsTrigger value="error">Erreurs ({errorCount})</TabsTrigger>
              <TabsTrigger value="success">Succès ({successCount})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredNotifications.length > 0 ? (
                <div className="space-y-2">
                  {filteredNotifications.map((notif) => (
                    <div key={notif.id} className={`p-4 border rounded-md ${!notif.read ? "bg-gray-50" : ""}`}>
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getNotificationIcon(notif.type)}</div>

                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div className="font-medium">{notif.title}</div>
                            <div className="text-sm text-gray-500">{new Date(notif.timestamp).toLocaleString()}</div>
                          </div>

                          <div className="text-sm mt-1">{notif.message}</div>

                          {notif.link && (
                            <Link
                              href={notif.link}
                              className="text-sm text-blue-600 flex items-center mt-2 hover:underline"
                            >
                              Voir les détails
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Link>
                          )}
                        </div>

                        <div className="flex gap-1">
                          {!notif.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => markAsRead(notif.id)}
                              title="Marquer comme lu"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => deleteNotification(notif.id)}
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Aucune notification {activeTab !== "all" ? "dans cette catégorie" : ""}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
