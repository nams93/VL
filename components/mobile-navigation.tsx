"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Home, LayoutDashboard, ClipboardCheck, Radio, FileText, Database } from "lucide-react"
import { useMobileDevice } from "@/hooks/use-mobile-device"
import { useTheme } from "@/components/theme-provider"
import { AutoSyncIndicator } from "@/components/auto-sync-indicator"

export function MobileNavigation() {
  const isMobile = useMobileDevice()
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const { theme } = useTheme()

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
    { icon: <FileText className="h-5 w-5" />, label: "Fin de Vacation", path: "/end-of-shift" },
    { icon: <Database className="h-5 w-5" />, label: "Sync", path: "/sync-dashboard" },
  ]

  return (
    <>
      {/* Barre de navigation fixe en bas avec effet de flou */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 z-50 shadow-lg transition-colors duration-300">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item, index) => (
            <button
              key={index}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors duration-200 ${
                pathname === item.path
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                  : "text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-800"
              }`}
              onClick={() => handleNavigation(item.path)}
            >
              {item.icon}
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="absolute top-1 right-1">
          <AutoSyncIndicator />
        </div>
      </div>

      {/* Espace en bas pour éviter que le contenu ne soit caché par la barre de navigation */}
      <div className="h-16 md:h-0" />
    </>
  )
}
