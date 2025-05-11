export async function registerForPushNotifications() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.log("Push notifications are not supported in this browser")
    return false
  }

  try {
    // Enregistrer le service worker
    const registration = await navigator.serviceWorker.register("/service-worker.js")
    console.log("Service Worker registered with scope:", registration.scope)

    // Demander la permission pour les notifications
    const permission = await Notification.requestPermission()
    if (permission !== "granted") {
      console.log("Notification permission not granted")
      return false
    }

    // Obtenir l'abonnement push existant
    let subscription = await registration.pushManager.getSubscription()

    // Si aucun abonnement n'existe, en créer un nouveau
    if (!subscription) {
      // Ceci est normalement récupéré depuis votre serveur
      const vapidPublicKey = "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U"

      // Convertir la clé en tableau d'octets
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)

      // Créer un nouvel abonnement
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      })

      console.log("New subscription created")
    }

    // Envoyer l'abonnement à votre serveur
    // await sendSubscriptionToServer(subscription);

    console.log("Push notification subscription successful:", subscription)
    return true
  } catch (error) {
    console.error("Error registering for push notifications:", error)
    return false
  }
}

// Fonction utilitaire pour convertir une clé base64 en Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Fonction pour afficher une notification
export function showNotification(title: string, options: NotificationOptions = {}) {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications")
    return
  }

  if (Notification.permission === "granted") {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        icon: "/images/gpis_gie_logo.jpeg",
        badge: "/images/gpis_gie_logo.jpeg",
        vibrate: [200, 100, 200],
        ...options,
      })
    })
  }
}
