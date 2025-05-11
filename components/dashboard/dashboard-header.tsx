"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/notification-bell"
import { ConnectionStatus } from "@/components/connection-status"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  showNotifications?: boolean
  showConnectionStatus?: boolean
  actions?: React.ReactNode
}

export function DashboardHeader({
  title,
  subtitle,
  showNotifications = true,
  showConnectionStatus = true,
  actions,
}: DashboardHeaderProps) {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    // Récupérer le rôle de l'utilisateur depuis le localStorage
    const role = localStorage.getItem("userRole")
    setUserRole(role)
  }, [])

  const handleLogout = () => {
    // Supprimer les informations d'authentification
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("agentId")
    localStorage.removeItem("userRole")

    // Rediriger vers la page de connexion
    router.push("/login")
  }

  return (
    <div className="border-b pb-4 mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="text-gray-500">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          {showConnectionStatus && <ConnectionStatus />}
          {showNotifications && <NotificationBell />}
          {actions}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Déconnexion
          </Button>
        </div>
      </div>
    </div>
  )
}
