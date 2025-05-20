"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Clipboard, BarChart3, Radio, FileEdit, LogIn, Lock, Menu, X, User, Bell } from "lucide-react"
import { authService } from "@/lib/auth-service"
import { useMobileDevice } from "@/hooks/use-mobile-device"

export default function Home() {
  const router = useRouter()
  const isMobile = useMobileDevice()
  const [agentId, setAgentId] = useState("")
  const [agentName, setAgentName] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [formError, setFormError] = useState("")

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
    setFormError("")

    if (!agentId.trim()) {
      setFormError("Veuillez saisir votre ID d'agent.")
      return
    }

    if (!agentName.trim()) {
      setFormError("Veuillez saisir votre nom et prénom.")
      return
    }

    // Connexion avec l'ID de l'agent
    const displayName = agentName.trim()
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

  // Style de fond avec l'image du véhicule GPIS
  const backgroundStyle = {
    backgroundImage: "url('/images/gpis_vehicle_street.jpeg')",
    backgroundSize: "cover",
    backgroundPosition: isMobile ? "left center" : "center", // Ajustement pour mobile
    backgroundRepeat: "no-repeat",
    backgroundAttachment: isMobile ? "initial" : "fixed", // Fixed sur desktop, scroll sur mobile
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4" style={backgroundStyle}>
        <div className="z-10 max-w-5xl w-full flex flex-col items-center justify-center">
          <div className="text-white text-xl">Chargement...</div>
        </div>
      </main>
    )
  }

  // Si l'agent n'est pas connecté, afficher le formulaire de connexion
  if (!isLoggedIn) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4" style={backgroundStyle}>
        {/* Overlay semi-transparent pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-black/50 pointer-events-none"></div>

        <div className="z-10 w-full max-w-md px-4">
          <Card className="bg-white shadow-lg">
            <CardHeader className="text-center p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-center">
                <img
                  src="/images/gpis_gie_logo.jpeg"
                  alt="GPIS GIE Logo"
                  className="h-16 sm:h-20 rounded-lg shadow-md"
                />
              </div>
              <CardTitle className="text-lg sm:text-xl">Système de Gestion des Véhicules</CardTitle>
              <CardDescription>Veuillez vous identifier pour continuer</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleLogin} className="space-y-4">
                {formError && (
                  <div className="bg-red-50 text-red-600 p-2 rounded-md text-sm mb-2 flex items-start">
                    <span className="text-red-600 mr-2 mt-0.5">⚠️</span>
                    <span>{formError}</span>
                  </div>
                )}
                <div>
                  <label htmlFor="agent-id" className="block text-sm font-medium text-gray-700 mb-1">
                    ID Agent <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="agent-id"
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                    placeholder="Insérer votre Matricule"
                    className="w-full h-10 sm:h-9 text-base sm:text-sm"
                    required
                    autoComplete="username"
                  />
                </div>
                <div>
                  <label htmlFor="agent-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom et prénom <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="agent-name"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="Votre nom complet"
                    className="w-full h-10 sm:h-9 text-base sm:text-sm"
                    required
                    autoComplete="name"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12 sm:h-10 text-base sm:text-sm mt-2"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Se connecter
                </Button>
              </form>
            </CardContent>
            <CardFooter className="text-xs text-gray-500 text-center p-4 sm:p-6">
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
    <main className="min-h-screen flex flex-col" style={backgroundStyle}>
      {/* Overlay semi-transparent pour améliorer la lisibilité */}
      <div className="absolute inset-0 bg-black/50 pointer-events-none"></div>

      {/* Header mobile avec menu hamburger */}
      <header className="bg-white shadow-md sticky top-0 z-20 relative">
        <div className="container mx-auto flex items-center justify-between p-3 sm:p-4">
          <div className="flex items-center">
            <img
              src="/images/gpis_gie_logo.jpeg"
              alt="GPIS GIE Logo"
              className="h-8 sm:h-10 w-auto rounded mr-2 sm:mr-3"
            />
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
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t p-4 absolute w-full shadow-lg z-30 animate-in slide-in-from-top duration-300">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                <User className="h-5 w-5 mr-3 text-blue-500" />
                <div>
                  <div className="font-medium">{agentName}</div>
                  <div className="text-xs text-gray-500">ID: {agentId}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center justify-center"
                  onClick={() => navigateTo("/notifications")}
                >
                  <Bell className="h-4 w-4 mr-1" />
                  Notifications
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center justify-center text-red-600 border-red-200 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-10 relative z-10">
        <div className="mb-4 sm:mb-6 mt-2 sm:mt-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white drop-shadow-md">
            Système de Gestion des Véhicules
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <Card className="bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <Clipboard className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                Inspection Véhicule
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Formulaire d'inspection</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0 md:p-6 md:pt-0">
              <p className="text-xs sm:text-sm text-gray-600">
                Remplissez le formulaire d'inspection pour documenter l'état du véhicule.
              </p>
            </CardContent>
            <CardFooter className="p-3 pt-0 sm:p-4 sm:pt-0 md:p-6 md:pt-0">
              <Button className="w-full h-10 sm:h-9 text-sm" onClick={() => navigateTo("/vehicle-inspection")}>
                Accéder
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <Radio className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                Perception Radio
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Nouvelle perception</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0 md:p-6 md:pt-0">
              <p className="text-xs sm:text-sm text-gray-600">
                Créez une nouvelle fiche de perception des équipements radio et déportés.
              </p>
            </CardContent>
            <CardFooter className="p-3 pt-0 sm:p-4 sm:pt-0 md:p-6 md:pt-0">
              <Button className="w-full h-10 sm:h-9 text-sm" onClick={() => navigateTo("/radio-equipment")}>
                Accéder
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-white hover:shadow-lg transition-shadow border-amber-200">
            <CardHeader className="bg-amber-50 p-3 sm:p-4 md:p-6">
              <CardTitle className="flex items-center text-base sm:text-lg text-amber-700">
                <FileEdit className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-amber-600" />
                Fin de Vacation
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Mise à jour des fiches</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0 md:p-6 md:pt-0">
              <p className="text-xs sm:text-sm text-gray-600">
                <strong>Fin de service :</strong> Mettez à jour vos fiches de perception avec les observations de
                réintégration.
              </p>
            </CardContent>
            <CardFooter className="p-3 pt-0 sm:p-4 sm:pt-0 md:p-6 md:pt-0">
              <Button
                className="w-full h-10 sm:h-9 text-sm bg-amber-600 hover:bg-amber-700"
                onClick={() => navigateTo("/radio-equipment-list")}
              >
                Mettre à jour
              </Button>
            </CardFooter>
          </Card>

          {isAdmin ? (
            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardHeader className="p-3 sm:p-4 md:p-6">
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                  Tableau de Bord
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Statistiques et rapports</CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0 md:p-6 md:pt-0">
                <p className="text-xs sm:text-sm text-gray-600">
                  Consultez les statistiques, l'historique des inspections et gérez la flotte.
                </p>
              </CardContent>
              <CardFooter className="p-3 pt-0 sm:p-4 sm:pt-0 md:p-6 md:pt-0">
                <Button className="w-full h-10 sm:h-9 text-sm" onClick={() => navigateTo("/dashboard")}>
                  Accéder
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardHeader className="p-3 sm:p-4 md:p-6">
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-400" />
                  Tableau de Bord
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Accès restreint</CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0 md:p-6 md:pt-0">
                <p className="text-xs sm:text-sm text-gray-600">Cet accès est réservé au COS et à la DSSI.</p>
              </CardContent>
              <CardFooter className="p-3 pt-0 sm:p-4 sm:pt-0 md:p-6 md:pt-0">
                <div className="w-full flex items-center justify-center p-2 bg-gray-100 rounded text-gray-500 text-xs sm:text-sm">
                  <Lock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Accès restreint
                </div>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>

      {/* Navigation mobile en bas de l'écran */}
      <nav className="md:hidden bg-white border-t fixed bottom-0 left-0 right-0 z-20 shadow-lg">
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => navigateTo("/vehicle-inspection")}
            className="flex flex-col items-center justify-center py-2 active:bg-gray-100 transition-colors"
          >
            <Clipboard className="h-5 w-5 text-blue-600" />
            <span className="text-[10px] mt-1 font-medium">Inspection</span>
          </button>

          <button
            onClick={() => navigateTo("/radio-equipment")}
            className="flex flex-col items-center justify-center py-2 active:bg-gray-100 transition-colors"
          >
            <Radio className="h-5 w-5 text-blue-600" />
            <span className="text-[10px] mt-1 font-medium">Radio</span>
          </button>

          <button
            onClick={() => navigateTo("/radio-equipment-list")}
            className="flex flex-col items-center justify-center py-2 active:bg-gray-100 transition-colors"
          >
            <FileEdit className="h-5 w-5 text-amber-600" />
            <span className="text-[10px] mt-1 font-medium">Fin service</span>
          </button>

          <button
            onClick={() => (isAdmin ? navigateTo("/dashboard") : null)}
            className={`flex flex-col items-center justify-center py-2 active:bg-gray-100 transition-colors ${
              !isAdmin ? "opacity-50" : ""
            }`}
            disabled={!isAdmin}
          >
            <BarChart3 className={`h-5 w-5 ${isAdmin ? "text-blue-600" : "text-gray-400"}`} />
            <span className="text-[10px] mt-1 font-medium">Tableau</span>
          </button>
        </div>
      </nav>

      {/* Espace en bas pour éviter que le contenu ne soit caché par la navigation mobile */}
      <div className="h-14 md:hidden"></div>
    </main>
  )
}
