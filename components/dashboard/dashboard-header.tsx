"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Bell } from "lucide-react"
import { useState, useEffect } from "react"

export function DashboardHeader() {
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const loadPendingCount = () => {
      try {
        const stored = localStorage.getItem("pendingInspections")
        if (stored) {
          const inspections = JSON.parse(stored)
          const pending = inspections.filter((i: any) => i.status === "en-attente")
          setPendingCount(pending.length)
        }
      } catch (error) {
        console.error("Erreur lors du chargement des inspections:", error)
      }
    }

    loadPendingCount()
    // Dans un environnement réel, nous utiliserions un intervalle ou un websocket
    const interval = setInterval(loadPendingCount, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/images/gpis_gie_logo.jpeg" alt="Logo GPIS GIE" className="h-10 w-auto" />
            <h1 className="text-xl font-bold hidden md:block">Tableau de Bord - Gestion des Véhicules</h1>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Accueil
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

