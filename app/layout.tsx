import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins, Montserrat } from "next/font/google"
import "./globals.css"
import { MobileNavigation } from "@/components/mobile-navigation"
import { MobileHelpButton } from "@/components/mobile-help-button"
import { ScrollToTop } from "@/components/scroll-to-top"
import { NetworkStatusAlert } from "@/components/network-status-alert"
import { ThemeProvider } from "@/components/theme-provider"
import { OfflineBanner } from "@/components/offline-banner"
import { OfflineIndicator } from "@/components/offline-indicator"

// Définition correcte des polices avec next/font/google
const inter = Inter({ subsets: ["latin"] })
const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
})
const montserrat = Montserrat({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
})

export const metadata: Metadata = {
  title: "GPIS - Gestion des Véhicules",
  description: "Système de gestion et d'inspection des véhicules GPIS",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0046ad" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1a202c" media="(prefers-color-scheme: dark)" />
      </head>
      <body className={`${inter.className} ${poppins.variable} ${montserrat.variable} min-h-screen gpis-background`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem storageKey="gpis-theme">
          <div className="min-h-screen gpis-background-overlay transition-colors duration-300">
            {children}
            <NetworkStatusAlert />
            <OfflineBanner />
            <OfflineIndicator />
            <MobileNavigation />
            <MobileHelpButton />
            <ScrollToTop />
            <div className="h-16 md:hidden"></div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
