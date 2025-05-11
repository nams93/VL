"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Clipboard, BarChart3, Radio, FileEdit, LogIn, Lock, Menu, X } from "lucide-react"
import { authService } from "@/lib/auth-service"

export default function Home() {
  const router = useRouter()
  const [agentId, setAgentId] = useState("")
  const [agentName, setAgentName] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Vérifier si l'agent est déjà connecté au chargement de la page
  useEffect(() => {
    const currentAgent = authService.getCurrentAgent()
    if (currentAgent) {
      setIsLoggedIn(true)
      setAgentName(currentAgent.name)
      setAgentId(currentAgent.id)
      setIsAdmin(currentAgent.role === "admin")
    }
    setIsLoading(false)
  }, [])

  // Fonction pour se connecter
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    if (!agentId.trim()) {
      alert("Veuillez saisir votre ID d'agent.")
      return
    }

    // Connexion avec l'ID de l'agent
    const displayName = agentName.trim() || `Agent ${agentId}`
    const agent = authService.login(agentId, displayName)
    setIsLoggedIn(true)
    setAgentName(agent.name)
    setIsAdmin(agent.role === "admin")
  }

  // Fonction pour se déconnecter
  const handleLogout = () => {
    authService.logout()
    setIsLoggedIn(false)
    setAgentId("")
    setAgentName("")
    setIsAdmin(false)
  }

  // Fonction pour naviguer et fermer le menu mobile
  const navigateTo = (path: string) => {
    router.push(path)
    setMobileMenuOpen(false)
  }

  if (isLoading) {
    return (
      <main
        className="flex min-h-screen flex-col items-center justify-center p-4 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/gpis_vehicle_background.png')" }}
      >
        <div className="z-10 max-w-5xl w-full flex flex-col items-center justify-center">
          <div className="text-white text-xl">Chargement...</div>
        </div>
      </main>
    )
  }

  // Si l'agent n'est pas connecté, afficher le formulaire de connexion
  if (!isLoggedIn) {
    return (
      <main
        className="flex min-h-screen flex-col items-center justify-center p-4 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/gpis_vehicle_background.png')" }}
      >
        <div className="z-10 w-full max-w-md px-4">
          <Card className="bg-white/95 backdrop-blur-sm shadow-lg">
            <CardHeader className="text-center">
              <div className="mb-4 flex items-center justify-center">
                <img src="/images/gpis_gie_logo.jpeg" alt="GPIS GIE Logo" className="h-20 rounded-lg shadow-md" />
              </div>
              <CardTitle className="text-xl">Système de Gestion des Véhicules</CardTitle>
              <CardDescription>Veuillez vous identifier pour continuer</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="agent-id" className="block text-sm font-medium text-gray-700 mb-1">
                    ID Agent
                  </label>
                  <Input
                    id="agent-id"
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                    placeholder="Exemple: A12345"
                    className="w-full"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="agent-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom et prénom (optionnel)
                  </label>
                  <Input
                    id="agent-name"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="Votre nom complet"
                    className="w-full"
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  <LogIn className="mr-2 h-4 w-4" />
                  Se connecter
                </Button>
              </form>
            </CardContent>
            <CardFooter className="text-xs text-gray-500 text-center">
              <p>Votre ID sera utilisé pour associer les fiches à votre compte.</p>
              <p>Seul l'agent ayant créé une fiche pourra la modifier ultérieurement.</p>
            </CardFooter>
          </Card>
        </div>
      </main>
    )
  }

  // Si l'agent est connecté, afficher le menu principal
  return (
    <main
      className="min-h-screen flex flex-col bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/images/gpis_vehicle_background.png')" }}
    >
      {/* Header mobile avec menu hamburger */}
      <header className="bg-white shadow-md sticky top-0 z-20">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center">
            <img src="/images/gpis_gie_logo.jpeg" alt="GPIS GIE Logo" className="h-10 w-auto rounded mr-3" />
            <div className="hidden md:block">
              <h1 className="text-lg font-bold">Gestion des Véhicules</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center">
              <span className="text-sm text-gray-600 mr-2">{agentName}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Déconnexion
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t p-4 absolute w-full shadow-lg">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{agentName}</span>
                <span className="text-xs text-gray-500">ID: {agentId}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
                Déconnexion
              </Button>
            </div>
          </div>
        )}
      </header>

      <div className="flex-1 container mx-auto px-4 py-6 md:py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-white mb-6 md:mb-10 drop-shadow-lg">
          Système de Gestion des Véhicules
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card className="bg-white/95 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center text-lg">
                <Clipboard className="h-5 w-5 mr-2 text-blue-600" />
                Inspection Véhicule
              </CardTitle>
              <CardDescription>Formulaire d'inspection</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <p className="text-sm text-gray-600">
                Remplissez le formulaire d'inspection pour documenter l'état du véhicule.
              </p>
            </CardContent>
            <CardFooter className="p-4 pt-0 md:p-6 md:pt-0">
              <Button className="w-full" onClick={() => navigateTo("/vehicle-inspection")}>
                Accéder
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center text-lg">
                <Radio className="h-5 w-5 mr-2 text-blue-600" />
                Perception Radio
              </CardTitle>
              <CardDescription>Nouvelle perception</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <p className="text-sm text-gray-600">
                Créez une nouvelle fiche de perception des équipements radio et déportés.
              </p>
            </CardContent>
            <CardFooter className="p-4 pt-0 md:p-6 md:pt-0">
              <Button className="w-full" onClick={() => navigateTo("/radio-equipment")}>
                Accéder
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm hover:shadow-lg transition-shadow border-amber-200">
            <CardHeader className="bg-amber-50 p-4 md:p-6">
              <CardTitle className="flex items-center text-lg text-amber-700">
                <FileEdit className="h-5 w-5 mr-2 text-amber-600" />
                Fin de Vacation
              </CardTitle>
              <CardDescription>Mise à jour des fiches</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <p className="text-sm text-gray-600">
                <strong>Fin de service :</strong> Mettez à jour vos fiches de perception avec les observations de
                réintégration.
              </p>
            </CardContent>
            <CardFooter className="p-4 pt-0 md:p-6 md:pt-0">
              <Button
                className="w-full bg-amber-600 hover:bg-amber-700"
                onClick={() => navigateTo("/radio-equipment-list")}
              >
                Mettre à jour
              </Button>
            </CardFooter>
          </Card>

          {isAdmin ? (
            <Card className="bg-white/95 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center text-lg">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Tableau de Bord
                </CardTitle>
                <CardDescription>Statistiques et rapports</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                <p className="text-sm text-gray-600">
                  Consultez les statistiques, l'historique des inspections et gérez la flotte.
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0 md:p-6 md:pt-0">
                <Button className="w-full" onClick={() => navigateTo("/dashboard")}>
                  Accéder
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="bg-white/95 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center text-lg">
                  <BarChart3 className="h-5 w-5 mr-2 text-gray-400" />
                  Tableau de Bord
                </CardTitle>
                <CardDescription>Accès restreint</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                <p className="text-sm text-gray-600">Cet accès est réservé au COS et à la DSSI.</p>
              </CardContent>
              <CardFooter className="p-4 pt-0 md:p-6 md:pt-0">
                <div className="w-full flex items-center justify-center p-2 bg-gray-100 rounded text-gray-500 text-sm">
                  <Lock className="h-4 w-4 mr-2" />
                  Accès restreint
                </div>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>

      {/* Navigation mobile en bas de l'écran */}
      <nav className="md:hidden bg-white border-t fixed bottom-0 left-0 right-0 z-20">
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => navigateTo("/vehicle-inspection")}
            className="flex flex-col items-center justify-center py-3"
          >
            <Clipboard className="h-5 w-5 text-blue-600" />
            <span className="text-xs mt-1">Inspection</span>
          </button>

          <button
            onClick={() => navigateTo("/radio-equipment")}
            className="flex flex-col items-center justify-center py-3"
          >
            <Radio className="h-5 w-5 text-blue-600" />
            <span className="text-xs mt-1">Radio</span>
          </button>

          <button
            onClick={() => navigateTo("/radio-equipment-list")}
            className="flex flex-col items-center justify-center py-3"
          >
            <FileEdit className="h-5 w-5 text-amber-600" />
            <span className="text-xs mt-1">Fin service</span>
          </button>

          <button
            onClick={() => (isAdmin ? navigateTo("/dashboard") : null)}
            className={`flex flex-col items-center justify-center py-3 ${!isAdmin ? "opacity-50" : ""}`}
            disabled={!isAdmin}
          >
            <BarChart3 className={`h-5 w-5 ${isAdmin ? "text-blue-600" : "text-gray-400"}`} />
            <span className="text-xs mt-1">Tableau</span>
          </button>
        </div>
      </nav>

      {/* Espace en bas pour éviter que le contenu ne soit caché par la navigation mobile */}
      <div className="h-16 md:hidden"></div>
    </main>
  )
}
