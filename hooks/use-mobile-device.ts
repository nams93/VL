"use client"

import { useState, useEffect } from "react"

export function useMobileDevice() {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait")

  useEffect(() => {
    // Fonction pour vérifier la taille de l'écran
    const checkDevice = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
      setOrientation(window.innerHeight > window.innerWidth ? "portrait" : "landscape")
    }

    // Vérifier au chargement
    checkDevice()

    // Ajouter un écouteur d'événement pour le redimensionnement
    window.addEventListener("resize", checkDevice)

    // Nettoyer l'écouteur d'événement
    return () => window.removeEventListener("resize", checkDevice)
  }, [])

  return { isMobile, isTablet, orientation }
}
