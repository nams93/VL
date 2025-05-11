import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { MobileNavigation } from "@/components/mobile-navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GPIS - Gestion des Véhicules",
  description: "Système de gestion et d'inspection des véhicules GPIS",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body
        className={`${inter.className} min-h-screen bg-cover bg-center bg-no-repeat`}
        style={{
          backgroundImage: "url('/images/gpis_vehicle_background.png')",
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#f8fafc",
          backgroundBlendMode: "lighten",
        }}
      >
        <div className="min-h-screen bg-white/90">
          {children}
          <MobileNavigation />
          {/* Espace en bas pour éviter que le contenu ne soit caché par la navigation mobile */}
          <div className="h-16 md:hidden"></div>
        </div>
      </body>
    </html>
  )
}
