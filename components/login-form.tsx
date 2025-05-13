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
import { AlertCircle } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const [agentId, setAgentId] = useState("")
  const [agentName, setAgentName] = useState("")
  const [errors, setErrors] = useState<{
    agentId?: string
    agentName?: string
    general?: string
  }>({})
  const [loading, setLoading] = useState(false)

  // Gérer le changement de l'ID avec validation
  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Accepter uniquement les chiffres et limiter à 4 caractères
    if (/^\d{0,4}$/.test(value)) {
      setAgentId(value)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: {
      agentId?: string
      agentName?: string
    } = {}

    // Vérifier si l'ID est vide
    if (!agentId.trim()) {
      newErrors.agentId = "L'identifiant est obligatoire"
    }
    // Vérifier si l'ID est au format 4 chiffres, sauf pour les comptes spéciaux (Bravo)
    else if (!/^\d{4}$/.test(agentId) && !agentId.startsWith("Bravo ")) {
      newErrors.agentId = "Merci de mettre votre matricule à 4 chiffres"
    }

    if (!agentName.trim()) {
      newErrors.agentName = "Le nom et prénom sont obligatoires"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Valider le formulaire
    if (!validateForm()) {
      return
    }

    setLoading(true)

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
      setErrors({ general: "Une erreur est survenue lors de la connexion" })
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
          <CardDescription>Entrez votre identifiant et votre nom pour accéder au système</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agentId" className="flex items-center">
                  Identifiant <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="agentId"
                  placeholder="4 chiffres"
                  value={agentId}
                  onChange={handleIdChange}
                  className={errors.agentId ? "border-red-500" : ""}
                  required
                  inputMode="numeric"
                  maxLength={4}
                />
                {errors.agentId && (
                  <div className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-200 flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.agentId}
                  </div>
                )}
                <div className="text-sm text-gray-500 mt-2">
                  <p>
                    Votre matricule doit contenir exactement 4 chiffres. Les opérateurs COS peuvent se connecter avec
                    leur identifiant Bravo (ex: Bravo 01).
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="agentName" className="flex items-center">
                  Nom et prénom <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="agentName"
                  placeholder="Votre nom et prénom"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className={errors.agentName ? "border-red-500" : ""}
                  required
                />
                {errors.agentName && (
                  <div className="text-sm text-red-500 flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.agentName}
                  </div>
                )}
              </div>
              {errors.general && (
                <div className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-200 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {errors.general}
                </div>
              )}
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
