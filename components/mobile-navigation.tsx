"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Home, LayoutDashboard, ClipboardCheck, Radio, Settings, Menu, X, LogOut, User, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useMobileDevice } from "@/hooks/use-mobile-device"
import { NotificationBell } from "@/components/notification-bell"

export function MobileNavigation() {
  const isMobile = useMobileDevice()
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    // Récupérer les informations utilisateur depuis le localStorage
    const role = localStorage.getItem("userRole")
    const name = localStorage.getItem("userName") || localStorage.getItem("agentId")
    setUserRole(role)
    setUserName(name)
  }, [])

  const handleLogout = () => {
    // Supprimer les informations d'authentification
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("agentId")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userName")

    // Rediriger vers la page de connexion
    router.push("/login")
    setIsOpen(false)
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    setIsOpen(false)
  }

  if (!isMobile) return null

  const navItems = [
    { icon: <Home className="h-5 w-5" />, label: "Accueil", path: "/" },
    { icon: <LayoutDashboard className="h-5 w-5" />, label: "Tableau de bord", path: "/dashboard" },
    { icon: <ClipboardCheck className="h-5 w-5" />, label: "Inspection", path: "/vehicle-inspection" },
    { icon: <Radio className="h-5 w-5" />, label: "Radio/Déporté", path: "/radio-equipment" },
    { icon: <Settings className="h-5 w-5" />, label: "Paramètres", path: "/settings" },
  ]

  return (
    <>
      {/* Barre de navigation fixe en bas */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.slice(0, 4).map((item, index) => (
            <button
              key={index}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 ${
                pathname === item.path ? "text-blue-600" : "text-gray-500"
              }`}
              onClick={() => handleNavigation(item.path)}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center flex-1 h-full py-1 text-gray-500">
                <Menu className="h-5 w-5" />
                <span className="text-xs mt-1">Menu</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85%] sm:w-[385px] p-0">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">Menu</h2>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{userName || "Utilisateur"}</div>
                      <div className="text-xs text-gray-500">Rôle: {userRole || "Agent"}</div>
                    </div>
                    <NotificationBell />
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-4">
                  <div className="space-y-1">
                    {navItems.map((item, index) => (
                      <button
                        key={index}
                        className={`flex items-center gap-3 w-full p-3 rounded-lg ${
                          pathname === item.path ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                        }`}
                        onClick={() => handleNavigation(item.path)}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Autres options</h3>
                    <div className="space-y-1">
                      <button
                        className="flex items-center gap-3 w-full p-3 rounded-lg text-gray-700 hover:bg-gray-100"
                        onClick={() => handleNavigation("/help")}
                      >
                        <HelpCircle className="h-5 w-5" />
                        <span>Aide et support</span>
                      </button>
                      <button
                        className="flex items-center gap-3 w-full p-3 rounded-lg text-red-600 hover:bg-red-50"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t text-center text-xs text-gray-500">
                  GPIS GIE © {new Date().getFullYear()} - v1.0.0
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Espace en bas pour éviter que le contenu ne soit caché par la barre de navigation */}
      <div className="h-16 md:h-0" />
    </>
  )
}
