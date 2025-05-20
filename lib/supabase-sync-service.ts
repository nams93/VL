import { getSupabaseClient } from "./supabase-service"
import {
  type StoredInspection,
  type StoredPhoto,
  type StoredRadioEquipment,
  getByIndex,
  updateInStore,
} from "./indexed-db-service"

// Interface pour les résultats de synchronisation
export interface SyncResult {
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
    const supabase = getSupabaseClient()
    const pendingInspections = await getByIndex<StoredInspection>("inspections", "by_syncStatus", "pending")

    let successCount = 0
    let errorCount = 0

    for (const inspection of pendingInspections) {
      try {
        // Convertir l'objet StoredInspection en format compatible avec Supabase
        const supabaseInspection = {
          id: inspection.id,
          vehicle_id: inspection.vehicleId,
          agent_id: inspection.agentId,
          timestamp: inspection.timestamp,
          data: inspection.data,
          sync_status: "synced",
          last_sync_attempt: Date.now(),
        }

        // Insérer ou mettre à jour l'inspection dans Supabase
        const { error } = await supabase.from("inspections").upsert(supabaseInspection, { onConflict: "id" })

        if (error) {
          throw new Error(error.message)
        }

        // Mettre à jour le statut de synchronisation dans IndexedDB
        inspection.syncStatus = "synced"
        inspection.lastSyncAttempt = Date.now()
        await updateInStore("inspections", inspection)
        successCount++
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
    const supabase = getSupabaseClient()
    const pendingPhotos = await getByIndex<StoredPhoto>("photos", "by_syncStatus", "pending")

    let successCount = 0
    let errorCount = 0

    for (const photo of pendingPhotos) {
      try {
        // Convertir l'objet StoredPhoto en format compatible avec Supabase
        const supabasePhoto = {
          id: photo.id,
          inspection_id: photo.inspectionId,
          view: photo.view,
          data_url: photo.dataUrl,
          comment: photo.comment,
          timestamp: photo.timestamp,
          gps_coordinates: photo.gpsCoordinates,
          sync_status: "synced",
        }

        // Insérer ou mettre à jour la photo dans Supabase
        const { error } = await supabase.from("photos").upsert(supabasePhoto, { onConflict: "id" })

        if (error) {
          throw new Error(error.message)
        }

        // Mettre à jour le statut de synchronisation dans IndexedDB
        photo.syncStatus = "synced"
        await updateInStore("photos", photo)
        successCount++
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
    const supabase = getSupabaseClient()
    const pendingRadioEquipment = await getByIndex<StoredRadioEquipment>("radioEquipment", "by_syncStatus", "pending")

    let successCount = 0
    let errorCount = 0

    for (const equipment of pendingRadioEquipment) {
      try {
        // Convertir l'objet StoredRadioEquipment en format compatible avec Supabase
        const supabaseEquipment = {
          id: equipment.id,
          vehicle_id: equipment.vehicleId,
          agent_id: equipment.agentId,
          timestamp: equipment.timestamp,
          data: equipment.data,
          sync_status: "synced",
          last_sync_attempt: Date.now(),
        }

        // Insérer ou mettre à jour l'équipement radio dans Supabase
        const { error } = await supabase.from("radio_equipment").upsert(supabaseEquipment, { onConflict: "id" })

        if (error) {
          throw new Error(error.message)
        }

        // Mettre à jour le statut de synchronisation dans IndexedDB
        equipment.syncStatus = "synced"
        equipment.lastSyncAttempt = Date.now()
        await updateInStore("radioEquipment", equipment)
        successCount++
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

// Fonction pour télécharger les données depuis Supabase vers IndexedDB
export const downloadDataFromSupabase = async (): Promise<{
  inspections: number
  photos: number
  radioEquipment: number
}> => {
  if (!isOnline()) {
    return { inspections: 0, photos: 0, radioEquipment: 0 }
  }

  const supabase = getSupabaseClient()
  let inspectionsCount = 0
  let photosCount = 0
  let radioEquipmentCount = 0

  try {
    // Télécharger les inspections
    const { data: inspections, error: inspectionsError } = await supabase.from("inspections").select("*")

    if (inspectionsError) {
      throw new Error(`Erreur lors du téléchargement des inspections: ${inspectionsError.message}`)
    }

    // Convertir et stocker les inspections dans IndexedDB
    for (const inspection of inspections || []) {
      const storedInspection: StoredInspection = {
        id: inspection.id,
        vehicleId: inspection.vehicle_id,
        agentId: inspection.agent_id,
        timestamp: inspection.timestamp,
        data: inspection.data,
        photos: [], // Les photos seront ajoutées séparément
        syncStatus: "synced",
        lastSyncAttempt: inspection.last_sync_attempt,
      }

      await updateInStore("inspections", storedInspection)
      inspectionsCount++
    }

    // Télécharger les photos
    const { data: photos, error: photosError } = await supabase.from("photos").select("*")

    if (photosError) {
      throw new Error(`Erreur lors du téléchargement des photos: ${photosError.message}`)
    }

    // Convertir et stocker les photos dans IndexedDB
    for (const photo of photos || []) {
      const storedPhoto: StoredPhoto = {
        id: photo.id,
        inspectionId: photo.inspection_id,
        view: photo.view,
        dataUrl: photo.data_url,
        comment: photo.comment,
        timestamp: photo.timestamp,
        gpsCoordinates: photo.gps_coordinates,
        syncStatus: "synced",
      }

      await updateInStore("photos", storedPhoto)
      photosCount++
    }

    // Télécharger les équipements radio
    const { data: radioEquipment, error: radioEquipmentError } = await supabase.from("radio_equipment").select("*")

    if (radioEquipmentError) {
      throw new Error(`Erreur lors du téléchargement des équipements radio: ${radioEquipmentError.message}`)
    }

    // Convertir et stocker les équipements radio dans IndexedDB
    for (const equipment of radioEquipment || []) {
      const storedEquipment: StoredRadioEquipment = {
        id: equipment.id,
        vehicleId: equipment.vehicle_id,
        agentId: equipment.agent_id,
        timestamp: equipment.timestamp,
        data: equipment.data,
        syncStatus: "synced",
        lastSyncAttempt: equipment.last_sync_attempt,
      }

      await updateInStore("radioEquipment", storedEquipment)
      radioEquipmentCount++
    }

    return {
      inspections: inspectionsCount,
      photos: photosCount,
      radioEquipment: radioEquipmentCount,
    }
  } catch (error) {
    console.error("Erreur lors du téléchargement des données depuis Supabase:", error)
    throw error
  }
}
