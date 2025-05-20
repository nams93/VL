/**
 * Service pour gérer une file d'attente d'actions à exécuter lorsque la connexion est rétablie
 */

// Types pour les actions en file d'attente
export type QueuedAction = {
  id: string
  type: string
  payload: any
  timestamp: number
  retryCount: number
  status: "pending" | "processing" | "failed" | "completed"
  error?: string
}

// Clé de stockage local
const QUEUE_STORAGE_KEY = "gpis-offline-queue"

// Obtenir la file d'attente actuelle
export const getQueue = (): QueuedAction[] => {
  try {
    const storedQueue = localStorage.getItem(QUEUE_STORAGE_KEY)
    return storedQueue ? JSON.parse(storedQueue) : []
  } catch (error) {
    console.error("Erreur lors de la récupération de la file d'attente:", error)
    return []
  }
}

// Enregistrer la file d'attente
const saveQueue = (queue: QueuedAction[]): void => {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue))
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la file d'attente:", error)
  }
}

// Ajouter une action à la file d'attente
export const enqueueAction = (type: string, payload: any): string => {
  try {
    const queue = getQueue()
    const id = `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const newAction: QueuedAction = {
      id,
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      status: "pending",
    }

    queue.push(newAction)
    saveQueue(queue)

    return id
  } catch (error) {
    console.error("Erreur lors de l'ajout d'une action à la file d'attente:", error)
    throw error
  }
}

// Mettre à jour le statut d'une action
export const updateActionStatus = (id: string, status: QueuedAction["status"], error?: string): boolean => {
  try {
    const queue = getQueue()
    const actionIndex = queue.findIndex((action) => action.id === id)

    if (actionIndex === -1) {
      return false
    }

    queue[actionIndex] = {
      ...queue[actionIndex],
      status,
      error: error || queue[actionIndex].error,
      retryCount: status === "failed" ? queue[actionIndex].retryCount + 1 : queue[actionIndex].retryCount,
    }

    saveQueue(queue)
    return true
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut d'une action:", error)
    return false
  }
}

// Supprimer une action de la file d'attente
export const removeAction = (id: string): boolean => {
  try {
    const queue = getQueue()
    const newQueue = queue.filter((action) => action.id !== id)

    if (newQueue.length === queue.length) {
      return false
    }

    saveQueue(newQueue)
    return true
  } catch (error) {
    console.error("Erreur lors de la suppression d'une action:", error)
    return false
  }
}

// Obtenir les actions en attente
export const getPendingActions = (): QueuedAction[] => {
  return getQueue().filter((action) => action.status === "pending")
}

// Obtenir les actions échouées
export const getFailedActions = (): QueuedAction[] => {
  return getQueue().filter((action) => action.status === "failed")
}

// Vider la file d'attente
export const clearQueue = (): void => {
  localStorage.removeItem(QUEUE_STORAGE_KEY)
}

// Traiter la file d'attente
export const processQueue = async (
  actionHandlers: Record<string, (payload: any) => Promise<any>>,
): Promise<{
  processed: number
  succeeded: number
  failed: number
}> => {
  const queue = getQueue()
  const pendingActions = queue.filter((action) => action.status === "pending")

  let processed = 0
  let succeeded = 0
  let failed = 0

  for (const action of pendingActions) {
    try {
      // Marquer l'action comme en cours de traitement
      updateActionStatus(action.id, "processing")

      // Vérifier si un gestionnaire existe pour ce type d'action
      const handler = actionHandlers[action.type]
      if (!handler) {
        throw new Error(`Aucun gestionnaire trouvé pour l'action de type ${action.type}`)
      }

      // Exécuter le gestionnaire
      await handler(action.payload)

      // Marquer l'action comme terminée
      updateActionStatus(action.id, "completed")
      succeeded++
    } catch (error) {
      // Marquer l'action comme échouée
      updateActionStatus(action.id, "failed", error instanceof Error ? error.message : String(error))
      failed++
    }

    processed++
  }

  return { processed, succeeded, failed }
}

// Réessayer les actions échouées
export const retryFailedActions = async (
  actionHandlers: Record<string, (payload: any) => Promise<any>>,
  maxRetries = 3,
): Promise<{
  processed: number
  succeeded: number
  failed: number
}> => {
  const queue = getQueue()
  const failedActions = queue.filter((action) => action.status === "failed" && action.retryCount < maxRetries)

  let processed = 0
  let succeeded = 0
  let failed = 0

  for (const action of failedActions) {
    try {
      // Marquer l'action comme en cours de traitement
      updateActionStatus(action.id, "processing")

      // Vérifier si un gestionnaire existe pour ce type d'action
      const handler = actionHandlers[action.type]
      if (!handler) {
        throw new Error(`Aucun gestionnaire trouvé pour l'action de type ${action.type}`)
      }

      // Exécuter le gestionnaire
      await handler(action.payload)

      // Marquer l'action comme terminée
      updateActionStatus(action.id, "completed")
      succeeded++
    } catch (error) {
      // Marquer l'action comme échouée
      updateActionStatus(action.id, "failed", error instanceof Error ? error.message : String(error))
      failed++
    }

    processed++
  }

  return { processed, succeeded, failed }
}

// Nettoyer les actions terminées
export const cleanupCompletedActions = (olderThan: number = 24 * 60 * 60 * 1000): number => {
  try {
    const queue = getQueue()
    const now = Date.now()
    const newQueue = queue.filter((action) => {
      // Conserver les actions non terminées
      if (action.status !== "completed") {
        return true
      }

      // Supprimer les actions terminées plus anciennes que olderThan
      return now - action.timestamp < olderThan
    })

    const removedCount = queue.length - newQueue.length

    if (removedCount > 0) {
      saveQueue(newQueue)
    }

    return removedCount
  } catch (error) {
    console.error("Erreur lors du nettoyage des actions terminées:", error)
    return 0
  }
}
