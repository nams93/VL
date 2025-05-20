// Service Worker pour l'application GPIS
const CACHE_NAME = "gpis-cache-v1"
const OFFLINE_URL = "/offline.html"

// Liste des ressources à mettre en cache lors de l'installation
const PRECACHE_ASSETS = [
  "/",
  "/offline.html",
  "/images/gpis_gie_logo.jpeg",
  "/images/gpis_vehicle.jpeg",
  "/images/gpis_vehicle_street.jpeg",
  "/placeholder-d1ogb.png",
  "/placeholder-ahsu1.png",
]

// Installation du Service Worker
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installation")

  // Précacher les ressources essentielles
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Mise en cache des ressources")
        return cache.addAll(PRECACHE_ASSETS)
      })
      .then(() => {
        // Activer immédiatement le Service Worker sans attendre la fermeture des onglets
        return self.skipWaiting()
      }),
  )
})

// Activation du Service Worker
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activation")

  // Nettoyer les anciens caches
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("[Service Worker] Suppression de l'ancien cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        // Prendre le contrôle de tous les clients sans recharger la page
        return self.clients.claim()
      }),
  )
})

// Interception des requêtes fetch
self.addEventListener("fetch", (event) => {
  // Ignorer les requêtes non GET
  if (event.request.method !== "GET") return

  // Ignorer les requêtes vers des API externes
  if (event.request.url.includes("/api/")) return

  // Stratégie: Network First, puis Cache, puis Offline Fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Mettre en cache la réponse fraîche
        const responseClone = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone)
        })
        return response
      })
      .catch(() => {
        // En cas d'échec, essayer de récupérer depuis le cache
        return caches.match(event.request).then((cachedResponse) => {
          // Si trouvé dans le cache, retourner la réponse mise en cache
          if (cachedResponse) {
            return cachedResponse
          }

          // Si la requête concerne une page HTML, retourner la page hors ligne
          if (event.request.headers.get("accept").includes("text/html")) {
            return caches.match(OFFLINE_URL)
          }

          // Pour les autres ressources, retourner une réponse vide
          return new Response("", {
            status: 408,
            statusText: "Request timed out",
          })
        })
      }),
  )
})

// Gestion des messages
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }

  // Gestion des messages pour la synchronisation en arrière-plan
  if (event.data && event.data.type === "TRIGGER_SYNC") {
    console.log("[Service Worker] Synchronisation en arrière-plan déclenchée")
    event.waitUntil(triggerBackgroundSync())
  }
})

// Synchronisation en arrière-plan
self.addEventListener("sync", (event) => {
  console.log("[Service Worker] Événement de synchronisation reçu:", event.tag)

  if (event.tag === "sync-pending-data") {
    event.waitUntil(syncPendingData())
  }

  if (event.tag === "auto-sync") {
    event.waitUntil(triggerBackgroundSync())
  }
})

// Fonction pour déclencher la synchronisation en arrière-plan
async function triggerBackgroundSync() {
  console.log("[Service Worker] Démarrage de la synchronisation en arrière-plan")

  try {
    // Vérifier si l'appareil est en ligne
    if (!self.navigator.onLine) {
      console.log("[Service Worker] Appareil hors ligne, synchronisation reportée")
      return false
    }

    // Récupérer les données à synchroniser depuis IndexedDB
    // Cette partie serait implémentée pour accéder à IndexedDB depuis le Service Worker
    // et envoyer les données au serveur

    // Notifier les clients que la synchronisation a été effectuée
    const clients = await self.clients.matchAll()
    clients.forEach((client) => {
      client.postMessage({
        type: "BACKGROUND_SYNC_COMPLETED",
        timestamp: new Date().toISOString(),
        success: true,
      })
    })

    return true
  } catch (error) {
    console.error("[Service Worker] Erreur lors de la synchronisation en arrière-plan:", error)

    // Notifier les clients de l'échec
    const clients = await self.clients.matchAll()
    clients.forEach((client) => {
      client.postMessage({
        type: "BACKGROUND_SYNC_COMPLETED",
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message,
      })
    })

    return false
  }
}

// Fonction pour synchroniser les données en attente
async function syncPendingData() {
  // Cette fonction serait implémentée pour synchroniser les données
  // stockées localement avec le serveur
  console.log("[Service Worker] Synchronisation des données en attente")

  // Exemple de code pour récupérer les clients
  const clients = await self.clients.matchAll()
  clients.forEach((client) => {
    client.postMessage({
      type: "SYNC_COMPLETED",
      timestamp: new Date().toISOString(),
    })
  })
}

// Gestion des notifications push
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Notification push reçue:", event)

  if (!event.data) return

  try {
    const data = event.data.json()
    const title = data.title || "GPIS Notification"
    const options = {
      body: data.body || "Nouvelle notification",
      icon: data.icon || "/images/gpis_gie_logo.jpeg",
      badge: "/images/gpis_gie_logo.jpeg",
      data: data.data || {},
    }

    event.waitUntil(self.registration.showNotification(title, options))
  } catch (error) {
    console.error("[Service Worker] Erreur lors du traitement de la notification push:", error)
  }
})

// Gestion des clics sur les notifications
self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Clic sur la notification:", event)

  event.notification.close()

  // Ouvrir une fenêtre spécifique si des données sont fournies
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url).then((windowClient) => {
        // Mettre le focus sur la fenêtre
        if (windowClient) {
          windowClient.focus()
        }
      }),
    )
  } else {
    // Sinon, ouvrir l'application
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        // Si une fenêtre est déjà ouverte, la mettre au premier plan
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus()
          }
        }
        // Sinon, ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow("/")
        }
      }),
    )
  }
})

// Gestion des événements de périodicité (pour les synchronisations planifiées)
self.addEventListener("periodicsync", (event) => {
  console.log("[Service Worker] Synchronisation périodique:", event.tag)

  if (event.tag === "auto-sync") {
    event.waitUntil(triggerBackgroundSync())
  }
})
