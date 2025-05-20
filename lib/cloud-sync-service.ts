import { getSupabaseClient } from "./supabase-client"
import { openDB, type DBSchema, type IDBPDatabase } from "idb"

// Types pour IndexedDB
interface SyncDB extends DBSchema {
  inspections: {
    key: string
    value: {
      id: string
      vehicleId: string
      agentId: string
      timestamp: number
      data: any
      syncStatus: "pending" | "synced" | "failed"
      lastSyncAttempt?: number
    }
    indexes: { "by-sync-status": string }
  }
  photos: {
    key: string
    value: {
      id: string
      inspectionId: string
      view: string
      dataUrl: string
      comment?: string
      timestamp: number
      gpsCoordinates?: { latitude: number; longitude: number }
      syncStatus: "pending" | "synced" | "failed"
    }
    indexes: { "by-inspection-id": string; "by-sync-status": string }
  }
  radioEquipment: {
    key: string
    value: {
      id: string
      vehicleId: string
      agentId: string
      timestamp: number
      data: any
      syncStatus: "pending" | "synced" | "failed"
      lastSyncAttempt?: number
    }
    indexes: { "by-sync-status": string }
  }
}

// Classe pour gérer la synchronisation avec Supabase
export class CloudSyncService {
  private db: IDBPDatabase<SyncDB> | null = null
  private isInitialized = false
  private syncInProgress = false
  private supabase = getSupabaseClient()

  // Initialiser la base de données IndexedDB
  async init() {
    if (this.isInitialized) return

    try {
      this.db = await openDB<SyncDB>("gpis-sync-db", 1, {
        upgrade(db) {
          // Store pour les inspections
          if (!db.objectStoreNames.contains("inspections")) {
            const inspectionsStore = db.createObjectStore("inspections", { keyPath: "id" })
            inspectionsStore.createIndex("by-sync-status", "syncStatus")
          }

          // Store pour les photos
          if (!db.objectStoreNames.contains("photos")) {
            const photosStore = db.createObjectStore("photos", { keyPath: "id" })
            photosStore.createIndex("by-inspection-id", "inspectionId")
            photosStore.createIndex("by-sync-status", "syncStatus")
          }

          // Store pour les équipements radio
          if (!db.objectStoreNames.contains("radioEquipment")) {
            const radioStore = db.createObjectStore("radioEquipment", { keyPath: "id" })
            radioStore.createIndex("by-sync-status", "syncStatus")
          }
        },
      })

      this.isInitialized = true
      console.log("Base de données IndexedDB initialisée avec succès")
    } catch (error) {
      console.error("Erreur lors de l'initialisation de la base de données IndexedDB:", error)
    }
  }

  // Ajouter une inspection à synchroniser
  async addInspection(inspection: any) {
    await this.init()
    if (!this.db) return false

    try {
      const inspectionWithSync = {
        ...inspection,
        syncStatus: "pending",
        timestamp: Date.now(),
      }
      await this.db.put("inspections", inspectionWithSync)
      return true
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'inspection:", error)
      return false
    }
  }

  // Ajouter une photo à synchroniser
  async addPhoto(photo: any) {
    await this.init()
    if (!this.db) return false

    try {
      const photoWithSync = {
        ...photo,
        syncStatus: "pending",
        timestamp: Date.now(),
      }
      await this.db.put("photos", photoWithSync)
      return true
    } catch (error) {
      console.error("Erreur lors de l'ajout de la photo:", error)
      return false
    }
  }

  // Ajouter un équipement radio à synchroniser
  async addRadioEquipment(equipment: any) {
    await this.init()
    if (!this.db) return false

    try {
      const equipmentWithSync = {
        ...equipment,
        syncStatus: "pending",
        timestamp: Date.now(),
      }
      await this.db.put("radioEquipment", equipmentWithSync)
      return true
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'équipement radio:", error)
      return false
    }
  }

  // Obtenir le nombre d'éléments en attente de synchronisation
  async getPendingCounts() {
    await this.init()
    if (!this.db) return { inspections: 0, photos: 0, radioEquipment: 0 }

    try {
      const inspections = await this.db.getAllFromIndex("inspections", "by-sync-status", "pending")
      const photos = await this.db.getAllFromIndex("photos", "by-sync-status", "pending")
      const radioEquipment = await this.db.getAllFromIndex("radioEquipment", "by-sync-status", "pending")

      return {
        inspections: inspections.length,
        photos: photos.length,
        radioEquipment: radioEquipment.length,
        total: inspections.length + photos.length + radioEquipment.length,
      }
    } catch (error) {
      console.error("Erreur lors de l'obtention des compteurs d'éléments en attente:", error)
      return { inspections: 0, photos: 0, radioEquipment: 0, total: 0 }
    }
  }

  // Synchroniser les données avec Supabase
  async syncWithCloud(progressCallback?: (progress: number, total: number) => void) {
    await this.init()
    if (!this.db || this.syncInProgress) return false

    this.syncInProgress = true
    let success = true

    try {
      // Synchroniser les inspections
      const pendingInspections = await this.db.getAllFromIndex("inspections", "by-sync-status", "pending")
      const totalItems = pendingInspections.length

      for (let i = 0; i < pendingInspections.length; i++) {
        const inspection = pendingInspections[i]

        // Mettre à jour le statut de synchronisation
        inspection.lastSyncAttempt = Date.now()

        try {
          // Envoyer l'inspection à Supabase
          const { error } = await this.supabase.from("inspections").upsert({
            id: inspection.id,
            vehicle_id: inspection.vehicleId,
            agent_id: inspection.agentId,
            timestamp: inspection.timestamp,
            data: inspection.data,
            sync_status: "synced",
            last_sync_attempt: inspection.lastSyncAttempt,
          })

          if (error) throw error

          // Mettre à jour le statut local
          inspection.syncStatus = "synced"
          await this.db.put("inspections", inspection)
        } catch (error) {
          console.error("Erreur lors de la synchronisation de l'inspection:", error)
          inspection.syncStatus = "failed"
          await this.db.put("inspections", inspection)
          success = false
        }

        // Mettre à jour la progression
        if (progressCallback) {
          progressCallback(i + 1, totalItems)
        }
      }

      // Synchroniser les photos (à implémenter de manière similaire)
      // ...

      // Synchroniser les équipements radio (à implémenter de manière similaire)
      // ...

      return success
    } catch (error) {
      console.error("Erreur lors de la synchronisation avec Supabase:", error)
      return false
    } finally {
      this.syncInProgress = false
    }
  }

  // Obtenir toutes les données locales
  async getAllLocalData() {
    await this.init()
    if (!this.db) return { inspections: [], photos: [], radioEquipment: [] }

    try {
      const inspections = await this.db.getAll("inspections")
      const photos = await this.db.getAll("photos")
      const radioEquipment = await this.db.getAll("radioEquipment")

      return { inspections, photos, radioEquipment }
    } catch (error) {
      console.error("Erreur lors de l'obtention des données locales:", error)
      return { inspections: [], photos: [], radioEquipment: [] }
    }
  }

  // Vérifier si la synchronisation est en cours
  isSyncing() {
    return this.syncInProgress
  }
}

// Singleton pour le service de synchronisation
let cloudSyncService: CloudSyncService | null = null

export const getCloudSyncService = () => {
  if (!cloudSyncService) {
    cloudSyncService = new CloudSyncService()
  }
  return cloudSyncService
}
