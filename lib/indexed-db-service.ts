// Service pour gérer le stockage local avec IndexedDB
const DB_NAME = "gpis_vehicle_db"
const DB_VERSION = 1

// Types pour les données stockées
export interface StoredInspection {
  id: string
  vehicleId: string
  agentId: string
  timestamp: number
  data: any
  photos: StoredPhoto[]
  syncStatus: "pending" | "synced" | "error"
  lastSyncAttempt?: number
}

export interface StoredPhoto {
  id: string
  inspectionId: string
  view: string
  dataUrl: string
  comment: string
  timestamp: number
  gpsCoordinates?: {
    latitude: number
    longitude: number
  }
  syncStatus: "pending" | "synced" | "error"
}

export interface StoredRadioEquipment {
  id: string
  vehicleId: string
  agentId: string
  timestamp: number
  data: any
  syncStatus: "pending" | "synced" | "error"
  lastSyncAttempt?: number
}

// Initialiser la base de données
export const initDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("Ce navigateur ne supporte pas IndexedDB"))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = (event) => {
      reject(new Error("Erreur lors de l'ouverture de la base de données"))
    }

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Créer les object stores (tables) si elles n'existent pas
      if (!db.objectStoreNames.contains("inspections")) {
        const inspectionsStore = db.createObjectStore("inspections", { keyPath: "id" })
        inspectionsStore.createIndex("by_syncStatus", "syncStatus", { unique: false })
        inspectionsStore.createIndex("by_vehicleId", "vehicleId", { unique: false })
      }

      if (!db.objectStoreNames.contains("photos")) {
        const photosStore = db.createObjectStore("photos", { keyPath: "id" })
        photosStore.createIndex("by_inspectionId", "inspectionId", { unique: false })
        photosStore.createIndex("by_syncStatus", "syncStatus", { unique: false })
      }

      if (!db.objectStoreNames.contains("radioEquipment")) {
        const radioStore = db.createObjectStore("radioEquipment", { keyPath: "id" })
        radioStore.createIndex("by_syncStatus", "syncStatus", { unique: false })
        radioStore.createIndex("by_vehicleId", "vehicleId", { unique: false })
      }
    }
  })
}

// Fonction générique pour ajouter des données à un object store
export const addToStore = function addToStore(storeName: string, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    initDatabase()
      .then((db) => {
        const transaction = db.transaction(storeName, "readwrite")
        const store = transaction.objectStore(storeName)
        const request = store.add(data)

        request.onsuccess = () => {
          resolve(data)
        }

        request.onerror = () => {
          reject(new Error(`Erreur lors de l'ajout de données à ${storeName}`))
        }

        transaction.oncomplete = () => {
          db.close()
        }
      })
      .catch(reject)
  })
}

// Fonction générique pour mettre à jour des données dans un object store
export const updateInStore = function updateInStore(storeName: string, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    initDatabase()
      .then((db) => {
        const transaction = db.transaction(storeName, "readwrite")
        const store = transaction.objectStore(storeName)
        const request = store.put(data)

        request.onsuccess = () => {
          resolve(data)
        }

        request.onerror = () => {
          reject(new Error(`Erreur lors de la mise à jour de données dans ${storeName}`))
        }

        transaction.oncomplete = () => {
          db.close()
        }
      })
      .catch(reject)
  })
}

// Fonction générique pour récupérer des données d'un object store par ID
export const getFromStore = function getFromStore(storeName: string, id: string): Promise<any | null> {
  return new Promise((resolve, reject) => {
    initDatabase()
      .then((db) => {
        const transaction = db.transaction(storeName, "readonly")
        const store = transaction.objectStore(storeName)
        const request = store.get(id)

        request.onsuccess = () => {
          resolve(request.result || null)
        }

        request.onerror = () => {
          reject(new Error(`Erreur lors de la récupération de données de ${storeName}`))
        }

        transaction.oncomplete = () => {
          db.close()
        }
      })
      .catch(reject)
  })
}

// Fonction pour récupérer toutes les données d'un object store
export const getAllFromStore = function getAllFromStore(storeName: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    initDatabase()
      .then((db) => {
        const transaction = db.transaction(storeName, "readonly")
        const store = transaction.objectStore(storeName)
        const request = store.getAll()

        request.onsuccess = () => {
          resolve(request.result)
        }

        request.onerror = () => {
          reject(new Error(`Erreur lors de la récupération de toutes les données de ${storeName}`))
        }

        transaction.oncomplete = () => {
          db.close()
        }
      })
      .catch(reject)
  })
}

// Fonction pour récupérer les données par index
export const getByIndex = function getByIndex(storeName: string, indexName: string, value: any): Promise<any[]> {
  return new Promise((resolve, reject) => {
    initDatabase()
      .then((db) => {
        const transaction = db.transaction(storeName, "readonly")
        const store = transaction.objectStore(storeName)
        const index = store.index(indexName)
        const request = index.getAll(value)

        request.onsuccess = () => {
          resolve(request.result)
        }

        request.onerror = () => {
          reject(new Error(`Erreur lors de la récupération de données par index ${indexName}`))
        }

        transaction.oncomplete = () => {
          db.close()
        }
      })
      .catch(reject)
  })
}

// Fonction pour supprimer des données d'un object store
export const deleteFromStore = (storeName: string, id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    initDatabase()
      .then((db) => {
        const transaction = db.transaction(storeName, "readwrite")
        const store = transaction.objectStore(storeName)
        const request = store.delete(id)

        request.onsuccess = () => {
          resolve()
        }

        request.onerror = () => {
          reject(new Error(`Erreur lors de la suppression de données de ${storeName}`))
        }

        transaction.oncomplete = () => {
          db.close()
        }
      })
      .catch(reject)
  })
}

// Fonction pour compter les éléments en attente de synchronisation
export const countPendingItems = async (): Promise<{ inspections: number; photos: number; radioEquipment: number }> => {
  try {
    const pendingInspections = await getByIndex("inspections", "by_syncStatus", "pending")
    const pendingPhotos = await getByIndex("photos", "by_syncStatus", "pending")
    const pendingRadioEquipment = await getByIndex("radioEquipment", "by_syncStatus", "pending")

    return {
      inspections: pendingInspections.length,
      photos: pendingPhotos.length,
      radioEquipment: pendingRadioEquipment.length,
    }
  } catch (error) {
    console.error("Erreur lors du comptage des éléments en attente:", error)
    return { inspections: 0, photos: 0, radioEquipment: 0 }
  }
}

// Fonction pour effacer toutes les données (utile pour le déboggage)
export const clearAllData = async (): Promise<void> => {
  try {
    const db = await initDatabase()
    const storeNames = Array.from(db.objectStoreNames)

    for (const storeName of storeNames) {
      const transaction = db.transaction(storeName, "readwrite")
      const store = transaction.objectStore(storeName)
      store.clear()
    }

    db.close()
  } catch (error) {
    console.error("Erreur lors de l'effacement des données:", error)
    throw error
  }
}

export const savePhotoLocally = async (photo: Omit<StoredPhoto, "syncStatus">): Promise<StoredPhoto> => {
  const photoToSave: StoredPhoto = {
    ...photo,
    syncStatus: "pending",
  }

  try {
    await addToStore("photos", photoToSave)
    return photoToSave
  } catch (error) {
    console.error("Erreur lors de l'enregistrement local de la photo:", error)
    throw error
  }
}
