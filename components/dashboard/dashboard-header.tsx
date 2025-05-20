"use client"

import { Bell, Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle" // Import du composant ThemeToggle

type DashboardHeaderProps = {
  title?: string
  subtitle?: string
  showNotifications?: boolean
  showConnectionStatus?: boolean
}

export function DashboardHeader({
  title = "Tableau de Bord",
  subtitle = "Gestion et suivi du parc automobile",
  showNotifications = true,
  showConnectionStatus = true,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <img src="/images/gpis_gie_logo.jpeg" alt="GPIS Logo" className="h-8 w-auto" />
            <span className="hidden font-bold sm:inline-block bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              GPIS - Gestion des Véhicules
            </span>
          </a>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <a className="transition-colors hover:text-foreground/80 text-foreground/60" href="/dashboard">
              Tableau de bord
            </a>
            <a className="transition-colors hover:text-foreground/80 text-foreground/60" href="/vehicle-inspection">
              Inspection
            </a>
            <a className="transition-colors hover:text-foreground/80 text-foreground/60" href="/radio-equipment">
              Équipement Radio
            </a>
            <a className="transition-colors hover:text-foreground/80 text-foreground/60" href="/end-of-shift">
              Fin de Vacation
            </a>
          </nav>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="mr-2 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <a className="flex items-center" href="/">
              <img src="/images/gpis_gie_logo.jpeg" alt="GPIS Logo" className="h-8 w-auto mr-2" />
              <span className="font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                GPIS
              </span>
            </a>
            <nav className="flex flex-col gap-4 mt-8">
              <a className="text-foreground/60 transition-colors hover:text-foreground/80" href="/dashboard">
                Tableau de bord
              </a>
              <a className="text-foreground/60 transition-colors hover:text-foreground/80" href="/vehicle-inspection">
                Inspection
              </a>
              <a className="text-foreground/60 transition-colors hover:text-foreground/80" href="/radio-equipment">
                Équipement Radio
              </a>
              <a className="text-foreground/60 transition-colors hover:text-foreground/80" href="/end-of-shift">
                Fin de Vacation
              </a>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[300px]"
              />
            </div>
          </div>
          <ThemeToggle /> {/* Ajout du bouton de bascule de thème */}
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-600 text-[10px] font-medium text-white">
              3
            </span>
            <span className="sr-only">Notifications</span>
          </Button>
          <Button variant="outline" size="sm" className="ml-auto">
            Déconnexion
          </Button>
        </div>
      </div>
    </header>
  )
}
