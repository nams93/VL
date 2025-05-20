"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { authService } from "@/lib/auth-service"
import { activityTrackingService } from "@/lib/activity-tracking-service"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LoginPage() {
  const router = useRouter()
  const [agentId, setAgentId] = useState("")
  const [agentName, setAgentName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!agentId.trim()) {
      setError("Veuillez entrer votre identifiant")
      return
    }

    // Validation pour le nom si ce n'est pas optionnel
    if (!agentName.trim()) {
      setError("Veuillez entrer votre nom et prénom")
      return
    }

    setLoading(true)

    try {
      const agent = authService.login(agentId, agentName)
      activityTrackingService.trackActivity(agent.id, agent.name, "login", "Connexion réussie", "/login")

      if (agent.role === "admin") {
        router.push("/admin")
      } else if (agent.role === "supervisor") {
        router.push("/supervisor")
      } else {
        router.push("/")
      }
    } catch (error) {
      console.error("Erreur de connexion:", error)
      setError("Identifiant ou nom incorrect")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex justify-center mb-6">
            <div className="relative h-24 w-32">
              <Image src="/images/gpis_gie_logo.jpeg" alt="GPIS GIE Logo" fill style={{ objectFit: "contain" }} />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-2">Système de Gestion des Véhicules</h1>
          <p className="text-gray-500 text-center mb-8 dark:text-gray-400">Veuillez vous identifier pour continuer</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="agentId" className="text-sm font-medium">
                ID Agent
              </label>
              <Input
                id="agentId"
                placeholder="Exemple: A12345"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="agentName" className="text-sm font-medium">
                Nom et prénom <span className="text-red-500">*</span>
              </label>
              <Input
                id="agentName"
                placeholder="Votre nom complet"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                required
              />
            </div>

            {error && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm dark:bg-red-900/30">{error}</div>}

            <Button type="submit" className="w-full" disabled={loading}>
              <span className="mr-2">Se connecter</span>
              {loading ? <span className="animate-spin">⟳</span> : <span>→</span>}
            </Button>
          </form>

          <div className="grid grid-cols-2 gap-4 mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <div>Votre ID sera utilisé pour associer les fiches à votre compte.</div>
            <div>Seul l'agent ayant créé une fiche pourra la modifier ultérieurement.</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
