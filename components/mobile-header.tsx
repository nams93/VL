"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Menu, X, User, LogOut, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { authService } from "@/lib/auth-service"
import { useTheme } from "@/components/theme-provider"

interface MobileHeaderProps {
  title: string
  showBackButton?: boolean
  backUrl?: string
}

export function MobileHeader({ title, showBackButton = false, backUrl = "/" }: MobileHeaderProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const currentAgent = authService.getCurrentAgent()
  const { theme, setTheme } = useTheme()

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

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-800 dark:to-blue-700 shadow-md sticky top-0 z-20 text-white transition-colors duration-300">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center">
          {showBackButton ? (
            <Button variant="ghost" size="sm" onClick={handleBack} className="mr-2 text-white hover:bg-white/20">
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
            <img
              src="/images/gpis_gie_logo.jpeg"
              alt="GPIS GIE Logo"
              className="h-10 w-auto rounded mr-3 border border-white/50"
            />
          )}
          <h1 className="text-lg font-bold truncate">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">{title}</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-white hover:bg-white/20 rounded-full"
            aria-label="Changer de thème"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white hover:bg-white/20"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 absolute w-full shadow-lg z-30 animate-slideIn transition-colors duration-300">
          <div className="flex flex-col space-y-3">
            {currentAgent && (
              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors duration-300">
                <User className="h-5 w-5 mr-3 text-blue-500 dark:text-blue-400" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{currentAgent.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">ID: {currentAgent.id}</div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors duration-300">
              <div className="font-medium text-gray-900 dark:text-gray-100">Mode sombre</div>
              <div className="flex items-center">
                <button
                  onClick={() => setTheme("light")}
                  className={`p-2 rounded-l-md ${
                    theme === "light"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  <Sun className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`p-2 rounded-r-md ${
                    theme === "dark"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  <Moon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full flex items-center justify-center border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
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
