// Ce fichier contient la logique pour enregistrer et gérer un Service Worker
// qui permettra à l'application de fonctionner hors ligne

export async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js")
      console.log("Service Worker enregistré avec succès:", registration.scope)
      return registration
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du Service Worker:", error)
      return null
    }
  }
  return null
}

export async function unregisterServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        const result = await registration.unregister()
        console.log("Service Worker désinscrit:", result)
        return result
      }
      return false
    } catch (error) {
      console.error("Erreur lors de la désinscription du Service Worker:", error)
      return false
    }
  }
  return false
}

export async function updateServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.update()
        console.log("Service Worker mis à jour")
        return true
      }
      return false
    } catch (error) {
      console.error("Erreur lors de la mise à jour du Service Worker:", error)
      return false
    }
  }
  return false
}

export function addServiceWorkerMessageListener(callback: (event: MessageEvent) => void) {
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.addEventListener("message", callback)
    return true
  }
  return false
}

export function sendMessageToServiceWorker(message: any) {
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message)
    return true
  }
  return false
}

// Fonction pour vérifier si l'application est installée (PWA)
export function isPWAInstalled() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true
}

// Fonction pour détecter les mises à jour disponibles
export async function checkForUpdates(): Promise<boolean> {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.update()
        return !!registration.waiting
      }
      return false
    } catch (error) {
      console.error("Erreur lors de la vérification des mises à jour:", error)
      return false
    }
  }
  return false
}

// Fonction pour appliquer les mises à jour disponibles
export function applyUpdates() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" })

        // Recharger la page après l'activation du nouveau Service Worker
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          window.location.reload()
        })

        return true
      }
      return false
    })
  }
  return false
}
