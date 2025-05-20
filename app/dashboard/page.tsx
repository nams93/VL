"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"
import { authService } from "@/lib/auth-service"
import { CompactNotifications } from "@/components/dashboard/compact-notifications"

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier si l'utilisateur est administrateur ou superviseur
    const currentAgent = authService.getCurrentAgent()
    if (!currentAgent || (currentAgent.role !== "admin" && currentAgent.role !== "supervisor")) {
      // Rediriger vers la page de connexion si l'utilisateur n'a pas les droits nécessaires
      router.push("/")
      return
    }

    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-xl font-bold">Chargement du tableau de bord...</div>
          <div className="text-gray-500">Vérification des autorisations...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-3 px-3 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent drop-shadow-md">
          Système de Gestion des Véhicules
        </h1>
      </div>
      <DashboardHeader
        title="Tableau de Bord"
        subtitle="Gestion et suivi du parc automobile"
        showNotifications={true}
        showConnectionStatus={true}
      />
      <div className="mt-3">
        <DashboardTabs />
      </div>
      <div className="col-span-12 md:col-span-4 lg:col-span-3">
        <CompactNotifications />
      </div>
    </div>
  )
}
