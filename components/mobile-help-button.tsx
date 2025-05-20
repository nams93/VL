"use client"

import { useState } from "react"
import { HelpCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useMobileDevice } from "@/hooks/use-mobile-device"
import { useTheme } from "@/components/theme-provider"

export function MobileHelpButton() {
  const isMobile = useMobileDevice()
  const [isOpen, setIsOpen] = useState(false)
  const { theme } = useTheme()

  if (!isMobile) return null

  return (
    <>
      {/* Bouton d'aide flottant */}
      <Button
        className="fixed right-4 bottom-20 z-40 rounded-full h-12 w-12 shadow-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-300"
        onClick={() => setIsOpen(true)}
      >
        <HelpCircle className="h-6 w-6" />
        <span className="sr-only">Aide</span>
      </Button>

      {/* Modal d'aide */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4 transition-colors duration-300">
          <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-900 transition-colors duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Aide & Support</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <CardDescription>Comment pouvons-nous vous aider ?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="space-y-2">
                <h3 className="font-medium text-sm">Problèmes de connexion</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Si vous rencontrez des problèmes de connexion, vérifiez votre réseau et essayez de vous reconnecter.
                  L'application fonctionne également en mode hors ligne.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-sm">Synchronisation des données</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Les données sont automatiquement synchronisées lorsque vous êtes en ligne. Un indicateur de
                  synchronisation apparaît en haut de l'écran.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-sm">Contact support</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Pour toute assistance, contactez le support technique au 01 23 45 67 89 ou par email à
                  support@gpis-gie.fr
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => setIsOpen(false)}>
                Fermer
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  )
}
