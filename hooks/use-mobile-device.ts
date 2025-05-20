"use client"

import { useState, useEffect } from "react"

export function useMobileDevice(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Fonction pour vérifier si l'appareil est mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Vérifier au chargement
    checkMobile()

    // Ajouter un écouteur d'événement pour le redimensionnement
    window.addEventListener("resize", checkMobile)

    // Nettoyer l'écouteur d'événement
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}
