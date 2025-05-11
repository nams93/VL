"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Menu, X, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { authService } from "@/lib/auth-service"

interface MobileHeaderProps {
  title: string
  showBackButton?: boolean
  backUrl?: string
}

export function MobileHeader({ title, showBackButton = false, backUrl = "/" }: MobileHeaderProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const currentAgent = authService.getCurrentAgent()

  const handleLogout = () => {
    authService.logout()
    router.push("/login")
  }

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl)
    } else {
      router.back()
    }
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-20">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center">
          {showBackButton ? (
            <Button variant="ghost" size="sm" onClick={handleBack} className="mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Button>
          ) : (
            <img src="/images/gpis_gie_logo.jpeg" alt="GPIS GIE Logo" className="h-10 w-auto rounded mr-3" />
          )}
          <h1 className="text-lg font-bold truncate">{title}</h1>
        </div>

        <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {menuOpen && (
        <div className="bg-white border-t p-4 absolute w-full shadow-lg z-30">
          <div className="flex flex-col space-y-3">
            {currentAgent && (
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <User className="h-5 w-5 mr-3 text-gray-500" />
                <div>
                  <div className="font-medium">{currentAgent.name}</div>
                  <div className="text-xs text-gray-500">ID: {currentAgent.id}</div>
                </div>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full flex items-center justify-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
