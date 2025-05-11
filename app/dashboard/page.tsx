"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"
import { authService } from "@/lib/auth-service"

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier si l'utilisateur est administrateur
    const currentAgent = authService.getCurrentAgent()
    if (!currentAgent || currentAgent.role !== "admin") {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas administrateur
      router.push("/login")
      return
    }

    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold">Chargement du tableau de bord...</div>
          <div className="text-gray-500">Vérification des autorisations...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
        </div>
        <DashboardTabs />
      </div>
    </div>
  )
}
