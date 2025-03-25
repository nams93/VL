import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ClipboardCheck, BarChart3 } from "lucide-react"

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/images/GPIS_background.jpeg')",
      }}
    >
      {/* En-tête avec logo */}
      <header className="bg-black/50 backdrop-blur-sm shadow-sm py-4">
        <div className="container mx-auto px-4 flex items-center">
          <img src="/images/gpis_gie_logo.jpeg" alt="Logo GPIS GIE" className="h-12 w-auto" />
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Titre et description */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Système de Gestion des Véhicules</h1>
            <p className="text-lg text-gray-300">Bienvenue sur la plateforme de gestion des véhicules GPIS</p>
          </div>

          {/* Cartes d'accès rapide */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
            <Link href="/vehicle-inspection" className="block">
              <Card className="h-full transition-all hover:shadow-md hover:border-blue-300 bg-black/50 backdrop-blur-sm border-gray-700">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-900/70 rounded-full flex items-center justify-center mb-4">
                    <ClipboardCheck className="h-8 w-8 text-blue-300" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2 text-white">Inspection de Véhicule</h2>
                  <p className="text-gray-300 mb-4">Remplir un formulaire d'inspection technique pour un véhicule</p>
                  <Button className="mt-auto bg-blue-700 hover:bg-blue-600 text-white">Accéder au formulaire</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard" className="block">
              <Card className="h-full transition-all hover:shadow-md hover:border-green-300 bg-black/50 backdrop-blur-sm border-gray-700">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-green-900/70 rounded-full flex items-center justify-center mb-4">
                    <BarChart3 className="h-8 w-8 text-green-300" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2 text-white">Tableau de Bord</h2>
                  <p className="text-gray-300 mb-4">Visualiser les données et statistiques de la flotte de véhicules</p>
                  <Button className="mt-auto bg-green-700 hover:bg-green-600 text-white">
                    Accéder au tableau de bord
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>

      {/* Pied de page */}
      <footer className="bg-black/50 backdrop-blur-sm border-t border-gray-800 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} GPIS GIE - Tous droits réservés
        </div>
      </footer>
    </div>
  )
}

