"use client"

import { NotificationBell } from "@/components/notification-bell"
import { ConnectionStatus } from "@/components/connection-status"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { LogOut, Settings, User } from "lucide-react"
import { authService } from "@/lib/auth-service"

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  showNotifications?: boolean
  showConnectionStatus?: boolean
}

export function DashboardHeader({
  title,
  subtitle,
  showNotifications = false,
  showConnectionStatus = false,
}: DashboardHeaderProps) {
  const router = useRouter()

  const handleLogout = () => {
    authService.logout()
    router.push("/login")
  }

  const currentAgent = authService.getCurrentAgent()

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
      <div>
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
        {showConnectionStatus && <ConnectionStatus />}

        <div className="flex items-center gap-2">
          {currentAgent && (
            <div className="hidden md:flex items-center mr-2">
              <div className="bg-blue-100 text-blue-700 p-1.5 rounded-full mr-2">
                <User className="h-4 w-4" />
              </div>
              <div className="text-sm">
                <div className="font-medium">{currentAgent.name || "Agent"}</div>
                <div className="text-xs text-gray-500 capitalize">{currentAgent.role || "Utilisateur"}</div>
              </div>
            </div>
          )}

          {showNotifications && <NotificationBell />}

          <Button variant="outline" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
