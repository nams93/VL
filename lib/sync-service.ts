import {
  type StoredInspection,
  type StoredPhoto,
  type StoredRadioEquipment,
  getByIndex,
  updateInStore,
} from "./indexed-db-service"

// Configuration
const API_BASE_URL = "/api" // À remplacer par l'URL réelle de votre API
const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY = 5000 // 5 secondes

// Interface pour les résultats de synchronisation
interface SyncResult {
  success: boolean
  totalProcessed: number
  successCount: number
  errorCount: number
  details: {
    inspections: { success: number; error: number }
    photos: { success: number; error: number }
    radioEquipment: { success: number; error: number }
  }
}

// Vérifier l'état de la connexion
export const isOnline = (): boolean => {
  return navigator.onLine
}

// Écouter les changements d'état de la connexion
export const setupConnectivityListeners = (onlineCallback: () => void, offlineCallback: () => void): (() => void) => {
  window.addEventListener("online", onlineCallback)
  window.addEventListener("offline", offlineCallback)

  // Retourner une fonction pour nettoyer les écouteurs
  return () => {
    window.removeEventListener("online", onlineCallback)
    window.removeEventListener("offline", offlineCallback)
  }
}

// Synchroniser les inspections en attente
const syncPendingInspections = async (): Promise<{ success: number; error: number }> => {
  try {
    const pendingInspections = await getByIndex<StoredInspection>("inspections", "by_syncStatus", "pending")

    let successCount = 0
    let errorCount = 0

    for (const inspection of pendingInspections) {
      try {
        // Dans une application réelle, vous feriez un appel API ici
        // Simulons une réponse réussie pour 90% des cas
        const isSuccess = Math.random() > 0.1

        if (isSuccess) {
          // Simuler un délai réseau
          await new Promise((resolve) => setTimeout(resolve, 300))

          // Mettre à jour le statut de synchronisation
          inspection.syncStatus = "synced"
          inspection.lastSyncAttempt = Date.now()
          await updateInStore("inspections", inspection)
          successCount++
        } else {
          throw new Error("Erreur simulée de synchronisation")
        }
      } catch (error) {
        console.error(`Erreur lors de la synchronisation de l'inspection ${inspection.id}:`, error)

        // Mettre à jour le statut d'erreur
        inspection.syncStatus = "error"
        inspection.lastSyncAttempt = Date.now()
        await updateInStore("inspections", inspection)
        errorCount++
      }
    }

    return { success: successCount, error: errorCount }
  } catch (error) {
    console.error("Erreur lors de la synchronisation des inspections:", error)
    return { success: 0, error: 0 }
  }
}

// Synchroniser les photos en attente
const syncPendingPhotos = async (): Promise<{ success: number; error: number }> => {
  try {
    const pendingPhotos = await getByIndex<StoredPhoto>("photos", "by_syncStatus", "pending")

    let successCount = 0
    let errorCount = 0

    for (const photo of pendingPhotos) {
      try {
        // Dans une application réelle, vous feriez un appel API ici
        // Les photos sont généralement plus volumineuses, simulons un délai plus long
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Simulons une réponse réussie pour 85% des cas (les photos échouent plus souvent)
        const isSuccess = Math.random() > 0.15

        if (isSuccess) {
          // Mettre à jour le statut de synchronisation
          photo.syncStatus = "synced"
          await updateInStore("photos", photo)
          successCount++
        } else {
          throw new Error("Erreur simulée de synchronisation de photo")
        }
      } catch (error) {
        console.error(`Erreur lors de la synchronisation de la photo ${photo.id}:`, error)

        // Mettre à jour le statut d'erreur
        photo.syncStatus = "error"
        await updateInStore("photos", photo)
        errorCount++
      }
    }

    return { success: successCount, error: errorCount }
  } catch (error) {
    console.error("Erreur lors de la synchronisation des photos:", error)
    return { success: 0, error: 0 }
  }
}

// Synchroniser les équipements radio en attente
const syncPendingRadioEquipment = async (): Promise<{ success: number; error: number }> => {
  try {
    const pendingRadioEquipment = await getByIndex<StoredRadioEquipment>("radioEquipment", "by_syncStatus", "pending")

    let successCount = 0
    let errorCount = 0

    for (const equipment of pendingRadioEquipment) {
      try {
        // Dans une application réelle, vous feriez un appel API ici
        await new Promise((resolve) => setTimeout(resolve, 200))

        // Simulons une réponse réussie pour 95% des cas
        const isSuccess = Math.random() > 0.05

        if (isSuccess) {
          // Mettre à jour le statut de synchronisation
          equipment.syncStatus = "synced"
          equipment.lastSyncAttempt = Date.now()
          await updateInStore("radioEquipment", equipment)
          successCount++
        } else {
          throw new Error("Erreur simulée de synchronisation d'équipement radio")
        }
      } catch (error) {
        console.error(`Erreur lors de la synchronisation de l'équipement radio ${equipment.id}:`, error)

        // Mettre à jour le statut d'erreur
        equipment.syncStatus = "error"
        equipment.lastSyncAttempt = Date.now()
        await updateInStore("radioEquipment", equipment)
        errorCount++
      }
    }

    return { success: successCount, error: errorCount }
  } catch (error) {
    console.error("Erreur lors de la synchronisation des équipements radio:", error)
    return { success: 0, error: 0 }
  }
}

// Fonction principale de synchronisation
export const syncAllPendingData = async (): Promise<SyncResult> => {
  if (!isOnline()) {
    return {
      success: false,
      totalProcessed: 0,
      successCount: 0,
      errorCount: 0,
      details: {
        inspections: { success: 0, error: 0 },
        photos: { success: 0, error: 0 },
        radioEquipment: { success: 0, error: 0 },
      },
    }
  }

  try {
    // Synchroniser les différents types de données
    const inspectionsResult = await syncPendingInspections()
    const photosResult = await syncPendingPhotos()
    const radioEquipmentResult = await syncPendingRadioEquipment()

    // Calculer les totaux
    const totalSuccess = inspectionsResult.success + photosResult.success + radioEquipmentResult.success
    const totalError = inspectionsResult.error + photosResult.error + radioEquipmentResult.error
    const totalProcessed = totalSuccess + totalError

    return {
      success: totalError === 0,
      totalProcessed,
      successCount: totalSuccess,
      errorCount: totalError,
      details: {
        inspections: inspectionsResult,
        photos: photosResult,
        radioEquipment: radioEquipmentResult,
      },
    }
  } catch (error) {
    console.error("Erreur lors de la synchronisation des données:", error)
    return {
      success: false,
      totalProcessed: 0,
      successCount: 0,
      errorCount: 0,
      details: {
        inspections: { success: 0, error: 0 },
        photos: { success: 0, error: 0 },
        radioEquipment: { success: 0, error: 0 },
      },
    }
  }
}

// Fonction pour réessayer la synchronisation des éléments en erreur
export const retryFailedSync = async (): Promise<SyncResult> => {
  try {
    // Récupérer tous les éléments en erreur
    const failedInspections = await getByIndex<StoredInspection>("inspections", "by_syncStatus", "error")
    const failedPhotos = await getByIndex<StoredPhoto>("photos", "by_syncStatus", "error")
    const failedRadioEquipment = await getByIndex<StoredRadioEquipment>("radioEquipment", "by_syncStatus", "error")

    // Marquer tous les éléments en erreur comme "pending" pour les resynchroniser
    for (const inspection of failedInspections) {
      inspection.syncStatus = "pending"
      await updateInStore("inspections", inspection)
    }

    for (const photo of failedPhotos) {
      photo.syncStatus = "pending"
      await updateInStore("photos", photo)
    }

    for (const equipment of failedRadioEquipment) {
      equipment.syncStatus = "pending"
      await updateInStore("radioEquipment", equipment)
    }

    // Lancer la synchronisation
    return await syncAllPendingData()
  } catch (error) {
    console.error("Erreur lors de la nouvelle tentative de synchronisation:", error)
    return {
      success: false,
      totalProcessed: 0,
      successCount: 0,
      errorCount: 0,
      details: {
        inspections: { success: 0, error: 0 },
        photos: { success: 0, error: 0 },
        radioEquipment: { success: 0, error: 0 },
      },
    }
  }
}

// Fonction pour configurer la synchronisation automatique
export const setupAutoSync = (intervalMinutes = 5): (() => void) => {
  const intervalId = setInterval(
    async () => {
      if (isOnline()) {
        console.log("Exécution de la synchronisation automatique...")
        await syncAllPendingData()
      }
    },
    intervalMinutes * 60 * 1000,
  )

  // Retourner une fonction pour arrêter la synchronisation automatique
  return () => clearInterval(intervalId)
}

// Fonction pour enregistrer une nouvelle inspection en local
export const saveInspectionLocally = async (
  inspection: Omit<StoredInspection, "syncStatus" | "lastSyncAttempt">,
): Promise<StoredInspection> => {
  const inspectionToSave: StoredInspection = {
    ...inspection,
    syncStatus: isOnline() ? "synced" : "pending",
    lastSyncAttempt: isOnline() ? Date.now() : undefined,
  }

  try {
    await updateInStore("inspections", inspectionToSave)

    // Si en ligne, tenter de synchroniser immédiatement
    if (isOnline() && inspectionToSave.syncStatus === "pending") {
      const syncResult = await syncAllPendingData()
      console.log("Résultat de la synchronisation immédiate:", syncResult)
    }

    return inspectionToSave
  } catch (error) {
    console.error("Erreur lors de l'enregistrement local de l'inspection:", error)
    throw error
  }
}

// Fonction pour enregistrer une nouvelle photo en local
export const savePhotoLocally = async (photo: Omit<StoredPhoto, "syncStatus">): Promise<StoredPhoto> => {
  const photoToSave: StoredPhoto = {
    ...photo,
    syncStatus: isOnline() ? "synced" : "pending",
  }

  try {
    await updateInStore("photos", photoToSave)

    // Si en ligne, tenter de synchroniser immédiatement
    if (isOnline() && photoToSave.syncStatus === "pending") {
      const syncResult = await syncAllPendingData()
      console.log("Résultat de la synchronisation immédiate de la photo:", syncResult)
    }

    return photoToSave
  } catch (error) {
    console.error("Erreur lors de l'enregistrement local de la photo:", error)
    throw error
  }
}

// Fonction pour enregistrer un nouvel équipement radio en local
export const saveRadioEquipmentLocally = async (
  equipment: Omit<StoredRadioEquipment, "syncStatus" | "lastSyncAttempt">,
): Promise<StoredRadioEquipment> => {
  const equipmentToSave: StoredRadioEquipment = {
    ...equipment,
    syncStatus: isOnline() ? "synced" : "pending",
    lastSyncAttempt: isOnline() ? Date.now() : undefined,
  }

  try {
    await updateInStore("radioEquipment", equipmentToSave)

    // Si en ligne, tenter de synchroniser immédiatement
    if (isOnline() && equipmentToSave.syncStatus === "pending") {
      const syncResult = await syncAllPendingData()
      console.log("Résultat de la synchronisation immédiate de l'équipement radio:", syncResult)
    }

    return equipmentToSave
  } catch (error) {
    console.error("Erreur lors de l'enregistrement local de l'équipement radio:", error)
    throw error
  }
}
