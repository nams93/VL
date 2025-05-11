// Nom du cache
const CACHE_NAME = "gpis-vehicle-cache-v1"

// Liste des ressources à mettre en cache
const RESOURCES_TO_CACHE = [
  "/",
  "/index.html",
  "/globals.css",
  "/images/gpis_gie_logo.jpeg",
  "/images/gpis_vehicle_background.png",
  // Ajoutez d'autres ressources selon vos besoins
]

// Installation du service worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache ouvert")
      return cache.addAll(RESOURCES_TO_CACHE)
    }),
  )
})

// Activation du service worker
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

// Interception des requêtes fetch
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - retourner la réponse du cache
      if (response) {
        return response
      }

      // Cloner la requête
      const fetchRequest = event.request.clone()

      return fetch(fetchRequest)
        .then((response) => {
          // Vérifier si la réponse est valide
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Cloner la réponse
          const responseToCache = response.clone()

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // Si la requête échoue (pas de connexion), retourner une page d'erreur du cache
          if (event.request.mode === "navigate") {
            return caches.match("/offline.html")
          }
        })
    }),
  )
})

// Gestion des notifications push
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json()

    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || "/images/gpis_gie_logo.jpeg",
        badge: data.badge || "/images/gpis_gie_logo.jpeg",
        data: data.data,
        vibrate: [200, 100, 200],
        actions: data.actions || [],
      }),
    )
  }
})

// Gestion des clics sur les notifications
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  // Récupérer les données de la notification
  const data = event.notification.data

  // Si une URL est spécifiée, ouvrir cette URL
  if (data && data.url) {
    event.waitUntil(clients.openWindow(data.url))
  } else {
    // Sinon, ouvrir l'application
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        // Si une fenêtre de l'application est déjà ouverte, la mettre au premier plan
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

// Synchronisation en arrière-plan
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-forms") {
    event.waitUntil(syncForms())
  }
})

// Fonction pour synchroniser les formulaires
async function syncForms() {
  try {
    // Récupérer les données en attente du stockage local
    const pendingData = await getPendingData()

    if (pendingData.length === 0) {
      return
    }

    // Envoyer les données au serveur
    // Dans un environnement réel, vous feriez des appels API ici
    console.log("Synchronisation des données en arrière-plan:", pendingData)

    // Simuler un délai de réseau
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Marquer les données comme synchronisées
    await markDataAsSynced()

    // Afficher une notification de succès
    self.registration.showNotification("Synchronisation réussie", {
      body: `${pendingData.length} formulaire(s) synchronisé(s)`,
      icon: "/images/gpis_gie_logo.jpeg",
    })
  } catch (error) {
    console.error("Erreur lors de la synchronisation:", error)

    // Afficher une notification d'erreur
    self.registration.showNotification("Erreur de synchronisation", {
      body: "Impossible de synchroniser les données. Réessayez plus tard.",
      icon: "/images/gpis_gie_logo.jpeg",
    })
  }
}

// Fonction simulée pour récupérer les données en attente
async function getPendingData() {
  // Dans un environnement réel, vous récupéreriez ces données d'IndexedDB
  return [
    { id: 1, type: "inspection", status: "pending" },
    { id: 2, type: "radio", status: "pending" },
  ]
}

// Fonction simulée pour marquer les données comme synchronisées
async function markDataAsSynced() {
  // Dans un environnement réel, vous mettriez à jour IndexedDB
  return true
}
