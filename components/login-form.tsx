"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authService } from "@/lib/auth-service"
import { activityTrackingService } from "@/lib/activity-tracking-service"

export function LoginForm() {
  const router = useRouter()
  const [agentId, setAgentId] = useState("")
  const [agentName, setAgentName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!agentId) {
      setError("Veuillez saisir votre identifiant")
      setLoading(false)
      return
    }

    try {
      // Connexion de l'agent
      const agent = authService.login(agentId, agentName)

      // Suivre l'activité de connexion
      activityTrackingService.trackActivity(agent.id, agent.name, "login", "Connexion réussie", "/login")

      // Rediriger vers la page appropriée en fonction du rôle
      if (agent.role === "admin") {
        router.push("/admin")
      } else if (agent.role === "supervisor") {
        router.push("/supervisor")
      } else {
        router.push("/")
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error)
      setError("Une erreur est survenue lors de la connexion")
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
          <CardDescription>Entrez votre identifiant pour accéder au système</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agentId">Identifiant</Label>
                <Input
                  id="agentId"
                  placeholder="Votre identifiant"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agentName">Nom (optionnel)</Label>
                <Input
                  id="agentName"
                  placeholder="Votre nom"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                />
              </div>
              {error && <div className="text-sm text-red-500">{error}</div>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Connexion en cours..." : "Se connecter"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
