"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Clipboard, Radio, FileEdit, BarChart3, Home } from "lucide-react"
import { authService } from "@/lib/auth-service"

export function MobileNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const currentAgent = authService.getCurrentAgent()
    if (currentAgent) {
      setIsAdmin(currentAgent.role === "admin")
    }
  }, [])

  const navigateTo = (path: string) => {
    router.push(path)
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <nav className="md:hidden bg-white border-t fixed bottom-0 left-0 right-0 z-20 shadow-lg">
      <div className="grid grid-cols-5 gap-1">
        <button
          onClick={() => navigateTo("/")}
          className={`flex flex-col items-center justify-center py-3 ${isActive("/") ? "text-blue-600" : "text-gray-600"}`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Accueil</span>
        </button>

        <button
          onClick={() => navigateTo("/vehicle-inspection")}
          className={`flex flex-col items-center justify-center py-3 ${isActive("/vehicle-inspection") ? "text-blue-600" : "text-gray-600"}`}
        >
          <Clipboard className="h-5 w-5" />
          <span className="text-xs mt-1">Inspection</span>
        </button>

        <button
          onClick={() => navigateTo("/radio-equipment")}
          className={`flex flex-col items-center justify-center py-3 ${isActive("/radio-equipment") ? "text-blue-600" : "text-gray-600"}`}
        >
          <Radio className="h-5 w-5" />
          <span className="text-xs mt-1">Radio</span>
        </button>

        <button
          onClick={() => navigateTo("/radio-equipment-list")}
          className={`flex flex-col items-center justify-center py-3 ${isActive("/radio-equipment-list") ? "text-blue-600" : "text-gray-600"}`}
        >
          <FileEdit className="h-5 w-5" />
          <span className="text-xs mt-1">Fin service</span>
        </button>

        <button
          onClick={() => (isAdmin ? navigateTo("/dashboard") : null)}
          className={`flex flex-col items-center justify-center py-3 ${isAdmin ? (isActive("/dashboard") ? "text-blue-600" : "text-gray-600") : "text-gray-400 opacity-50"}`}
          disabled={!isAdmin}
        >
          <BarChart3 className="h-5 w-5" />
          <span className="text-xs mt-1">Tableau</span>
        </button>
      </div>
    </nav>
  )
}
