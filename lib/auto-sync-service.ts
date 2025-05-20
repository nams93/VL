import { getCloudSyncService } from "./cloud-sync-service"

// Types pour les paramètres de synchronisation automatique
export interface AutoSyncConfig {
  enabled: boolean
  interval: number // en minutes
  onlyWhenOnline: boolean
  onlyWhenCharging: boolean
  onlyOnWifi: boolean
  retryOnFailure: boolean
  maxRetries: number
  notifyOnComplete: boolean
}

// Valeurs par défaut pour la configuration
export const DEFAULT_AUTO_SYNC_CONFIG: AutoSyncConfig = {
  enabled: true,
  interval: 15, // 15 minutes par défaut
  onlyWhenOnline: true,
  onlyWhenCharging: false,
  onlyOnWifi: false,
  retryOnFailure: true,
  maxRetries: 3,
  notifyOnComplete: true,
}

// Classe pour gérer la synchronisation automatique
export class AutoSyncService {
  private config: AutoSyncConfig
  private syncIntervalId: NodeJS.Timeout | null = null
  private retryCount = 0
  private lastSyncTime = 0
  private lastSyncSuccess = false
  private isInitialized = false
  private syncInProgress = false
  private listeners: Array<(status: AutoSyncStatus) => void> = []

  constructor(initialConfig?: Partial<AutoSyncConfig>) {
    // Charger la configuration depuis le localStorage ou utiliser les valeurs par défaut
    const savedConfig = this.loadConfigFromStorage()
    this.config = {
      ...DEFAULT_AUTO_SYNC_CONFIG,
      ...savedConfig,
      ...initialConfig,
    }
  }

  // Initialiser le service
  init() {
    if (this.isInitialized) return

    // Charger la dernière heure de synchronisation depuis le localStorage
    this.lastSyncTime = Number.parseInt(localStorage.getItem("gpis-last-sync-time") || "0", 10)
    this.lastSyncSuccess = localStorage.getItem("gpis-last-sync-success") === "true"

    // Démarrer la synchronisation automatique si elle est activée
    if (this.config.enabled) {
      this.startAutoSync()
    }

    // Ajouter des écouteurs pour les événements en ligne/hors ligne
    window.addEventListener("online", this.handleOnlineStatus)
    window.addEventListener("offline", this.handleOnlineStatus)

    // Ajouter un écouteur pour l'état de la batterie si disponible
    if ("getBattery" in navigator) {
      this.setupBatteryMonitoring()
    }

    // Ajouter un écouteur pour l'état de la connexion réseau si disponible
    if ("connection" in navigator) {
      this.setupNetworkMonitoring()
    }

    this.isInitialized = true
    console.log("Service de synchronisation automatique initialisé")
  }

  // Démarrer la synchronisation automatique
  startAutoSync() {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId)
    }

    // Convertir l'intervalle en millisecondes
    const intervalMs = this.config.interval * 60 * 1000

    this.syncIntervalId = setInterval(() => {
      this.checkAndSync()
    }, intervalMs)

    console.log(`Synchronisation automatique démarrée avec un intervalle de ${this.config.interval} minutes`)
    this.notifyListeners()
  }

  // Arrêter la synchronisation automatique
  stopAutoSync() {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId)
      this.syncIntervalId = null
    }

    console.log("Synchronisation automatique arrêtée")
    this.notifyListeners()
  }

  // Vérifier les conditions et synchroniser si nécessaire
  async checkAndSync() {
    if (this.syncInProgress) return

    // Vérifier si les conditions sont remplies pour la synchronisation
    if (!this.canSync()) {
      console.log("Conditions non remplies pour la synchronisation automatique")
      return
    }

    this.syncInProgress = true
    this.notifyListeners()

    try {
      console.log("Démarrage de la synchronisation automatique...")
      const syncService = getCloudSyncService()
      const success = await syncService.syncWithCloud()

      this.lastSyncTime = Date.now()
      this.lastSyncSuccess = success
      this.saveLastSyncInfo()

      if (success) {
        console.log("Synchronisation automatique réussie")
        this.retryCount = 0

        // Notifier l'utilisateur si configuré
        if (this.config.notifyOnComplete) {
          this.showSyncNotification(true)
        }
      } else {
        console.log("Échec de la synchronisation automatique")

        // Réessayer si configuré
        if (this.config.retryOnFailure && this.retryCount < this.config.maxRetries) {
          this.retryCount++
          console.log(`Nouvelle tentative ${this.retryCount}/${this.config.maxRetries} dans 1 minute...`)
          setTimeout(() => this.checkAndSync(), 60000) // Réessayer dans 1 minute
        } else {
          this.retryCount = 0
          if (this.config.notifyOnComplete) {
            this.showSyncNotification(false)
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors de la synchronisation automatique:", error)
      this.lastSyncSuccess = false
      this.saveLastSyncInfo()

      if (this.config.notifyOnComplete) {
        this.showSyncNotification(false)
      }
    } finally {
      this.syncInProgress = false
      this.notifyListeners()
    }
  }

  // Vérifier si les conditions sont remplies pour la synchronisation
  private canSync(): boolean {
    // Vérifier si l'appareil est en ligne
    if (this.config.onlyWhenOnline && !navigator.onLine) {
      return false
    }

    // Vérifier si l'appareil est en charge (si la configuration le demande et si l'API est disponible)
    if (this.config.onlyWhenCharging && "getBattery" in navigator) {
      const battery = (navigator as any).battery || (navigator as any).mozBattery
      if (battery && !battery.charging) {
        return false
      }
    }

    // Vérifier si l'appareil est connecté au WiFi (si la configuration le demande et si l'API est disponible)
    if (this.config.onlyOnWifi && "connection" in navigator) {
      const connection = (navigator as any).connection
      if (connection && connection.type !== "wifi") {
        return false
      }
    }

    return true
  }

  // Configurer la surveillance de la batterie
  private async setupBatteryMonitoring() {
    try {
      const battery = await (navigator as any).getBattery()

      battery.addEventListener("chargingchange", () => {
        console.log(`Batterie en charge: ${battery.charging}`)
        if (battery.charging && this.config.onlyWhenCharging) {
          this.checkAndSync()
        }
      })
    } catch (error) {
      console.error("Erreur lors de la configuration de la surveillance de la batterie:", error)
    }
  }

  // Configurer la surveillance du réseau
  private setupNetworkMonitoring() {
    const connection = (navigator as any).connection

    if (connection) {
      connection.addEventListener("change", () => {
        console.log(`Type de connexion: ${connection.type}`)
        if (connection.type === "wifi" && this.config.onlyOnWifi) {
          this.checkAndSync()
        }
      })
    }
  }

  // Gérer les changements d'état en ligne/hors ligne
  private handleOnlineStatus = () => {
    console.log(`État en ligne: ${navigator.onLine}`)
    if (navigator.onLine && this.config.onlyWhenOnline) {
      this.checkAndSync()
    }
    this.notifyListeners()
  }

  // Mettre à jour la configuration
  updateConfig(newConfig: Partial<AutoSyncConfig>) {
    const wasEnabled = this.config.enabled
    const newInterval = newConfig.interval !== undefined && newConfig.interval !== this.config.interval

    this.config = {
      ...this.config,
      ...newConfig,
    }

    // Sauvegarder la configuration
    this.saveConfigToStorage()

    // Redémarrer la synchronisation si nécessaire
    if (this.config.enabled && (!wasEnabled || newInterval)) {
      this.startAutoSync()
    } else if (!this.config.enabled && wasEnabled) {
      this.stopAutoSync()
    }

    console.log("Configuration de synchronisation automatique mise à jour:", this.config)
    this.notifyListeners()
  }

  // Forcer une synchronisation immédiate
  async forceSyncNow() {
    if (this.syncInProgress) return false

    console.log("Synchronisation forcée démarrée...")
    await this.checkAndSync()
    return true
  }

  // Obtenir la configuration actuelle
  getConfig(): AutoSyncConfig {
    return { ...this.config }
  }

  // Obtenir l'état actuel de la synchronisation
  getStatus(): AutoSyncStatus {
    return {
      enabled: this.config.enabled,
      syncInProgress: this.syncInProgress,
      lastSyncTime: this.lastSyncTime,
      lastSyncSuccess: this.lastSyncSuccess,
      nextSyncTime: this.getNextSyncTime(),
      isOnline: navigator.onLine,
    }
  }

  // Calculer la prochaine heure de synchronisation
  private getNextSyncTime(): number {
    if (!this.config.enabled || !this.syncIntervalId) {
      return 0
    }

    const intervalMs = this.config.interval * 60 * 1000
    return this.lastSyncTime + intervalMs
  }

  // Sauvegarder la configuration dans le localStorage
  private saveConfigToStorage() {
    try {
      localStorage.setItem("gpis-auto-sync-config", JSON.stringify(this.config))
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la configuration:", error)
    }
  }

  // Charger la configuration depuis le localStorage
  private loadConfigFromStorage(): Partial<AutoSyncConfig> {
    try {
      const savedConfig = localStorage.getItem("gpis-auto-sync-config")
      return savedConfig ? JSON.parse(savedConfig) : {}
    } catch (error) {
      console.error("Erreur lors du chargement de la configuration:", error)
      return {}
    }
  }

  // Sauvegarder les informations de dernière synchronisation
  private saveLastSyncInfo() {
    try {
      localStorage.setItem("gpis-last-sync-time", this.lastSyncTime.toString())
      localStorage.setItem("gpis-last-sync-success", this.lastSyncSuccess.toString())
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des informations de synchronisation:", error)
    }
  }

  // Afficher une notification de synchronisation
  private showSyncNotification(success: boolean) {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          const title = success ? "Synchronisation réussie" : "Échec de la synchronisation"
          const options = {
            body: success
              ? "Vos données ont été synchronisées avec succès."
              : "La synchronisation de vos données a échoué. Veuillez réessayer plus tard.",
            icon: "/images/gpis_gie_logo.jpeg",
          }
          new Notification(title, options)
        }
      })
    }
  }

  // Ajouter un écouteur pour les changements d'état
  addStatusListener(listener: (status: AutoSyncStatus) => void) {
    this.listeners.push(listener)
    // Notifier immédiatement le nouvel écouteur avec l'état actuel
    listener(this.getStatus())
  }

  // Supprimer un écouteur
  removeStatusListener(listener: (status: AutoSyncStatus) => void) {
    this.listeners = this.listeners.filter((l) => l !== listener)
  }

  // Notifier tous les écouteurs
  private notifyListeners() {
    const status = this.getStatus()
    this.listeners.forEach((listener) => listener(status))
  }

  // Nettoyer les ressources lors de la destruction
  cleanup() {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId)
    }

    window.removeEventListener("online", this.handleOnlineStatus)
    window.removeEventListener("offline", this.handleOnlineStatus)

    this.listeners = []
    this.isInitialized = false
  }
}

// Type pour l'état de la synchronisation automatique
export interface AutoSyncStatus {
  enabled: boolean
  syncInProgress: boolean
  lastSyncTime: number
  lastSyncSuccess: boolean
  nextSyncTime: number
  isOnline: boolean
}

// Singleton pour le service de synchronisation automatique
let autoSyncService: AutoSyncService | null = null

export const getAutoSyncService = () => {
  if (!autoSyncService) {
    autoSyncService = new AutoSyncService()
    if (typeof window !== "undefined") {
      autoSyncService.init()
    }
  }
  return autoSyncService
}
