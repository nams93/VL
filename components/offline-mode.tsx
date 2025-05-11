"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WifiOff, Database, Clock, RefreshCw } from "lucide-react"
import { isOnline, setupConnectivityListeners } from "@/lib/sync-service"
import { countPendingItems } from "@/lib/indexed-db-service"

export function OfflineMode() {
  const [online, setOnline] = useState(isOnline())
  const [pendingItems, setPendingItems] = useState({ inspections: 0, photos: 0, radioEquipment: 0 })
  const [totalPending, setTotalPending] = useState(0)
  const [lastOfflineTime, setLastOfflineTime] = useState<Date | null>(null)

  // Mettre à jour le compteur d'éléments en attente
  const updatePendingCount = async () => {
    const counts = await countPendingItems()
    setPendingItems(counts)
    setTotalPending(counts.inspections + counts.photos + counts.radioEquipment)
  }

  // Gérer le changement d'état de la connexion
  const handleOnline = () => {
    setOnline(true)
  }

  const handleOffline = () => {
    setOnline(false)
    setLastOfflineTime(new Date())
  }

  // Tenter de se reconnecter
  const attemptReconnect = () => {
    // Dans une application réelle, vous pourriez implémenter une logique de reconnexion
    // Pour cette démo, nous vérifions simplement l'état actuel
    setOnline(navigator.onLine)
  }

  // Configurer les écouteurs d'événements et charger les données initiales
  useEffect(() => {
    // Mettre à jour le compteur initial
    updatePendingCount()

    // Configurer les écouteurs d'événements pour la connectivité
    const cleanup = setupConnectivityListeners(handleOnline, handleOffline)

    // Configurer un intervalle pour mettre à jour régulièrement le compteur
    const countInterval = setInterval(updatePendingCount, 30000) // Toutes les 30 secondes

    // Nettoyer les écouteurs et l'intervalle
    return () => {
      cleanup()
      clearInterval(countInterval)
    }
  }, [])

  // Si en ligne, ne pas afficher le composant
  if (online) {
    return null
  }

  return (
    <Card className="border-orange-200 mb-4">
      <CardHeader className="bg-orange-50">
        <CardTitle className="text-base flex items-center">
          <WifiOff className="h-5 w-5 mr-2 text-orange-600" />
          Mode hors ligne
        </CardTitle>
        <CardDescription>
          Vous êtes actuellement hors ligne. L'application continue de fonctionner, mais les données ne seront
          synchronisées que lorsque vous serez à nouveau connecté.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Informations sur le mode hors ligne */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center p-3 bg-gray-50 rounded-md">
            <Database className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <div className="text-sm font-medium">Données locales</div>
              <div className="text-2xl font-bold">{totalPending}</div>
              <div className="text-xs text-gray-500">éléments en attente</div>
            </div>
          </div>

          <div className="flex items-center p-3 bg-gray-50 rounded-md">
            <Clock className="h-8 w-8 text-amber-500 mr-3" />
            <div>
              <div className="text-sm font-medium">Hors ligne depuis</div>
              <div className="text-lg font-bold">
                {lastOfflineTime
                  ? new Date(Date.now() - lastOfflineTime.getTime()).toISOString().substr(11, 8)
                  : "00:00:00"}
              </div>
              <div className="text-xs text-gray-500">heures:minutes:secondes</div>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-md">
            <div className="text-sm font-medium mb-2">Détails des données</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xs text-gray-500">Inspections</div>
                <div className="text-lg font-bold">{pendingItems.inspections}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Photos</div>
                <div className="text-lg font-bold">{pendingItems.photos}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Équipements</div>
                <div className="text-lg font-bold">{pendingItems.radioEquipment}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Conseils pour le mode hors ligne */}
        <div className="bg-blue-50 p-3 rounded-md text-sm">
          <h4 className="font-medium text-blue-700 mb-1">Conseils pour le mode hors ligne</h4>
          <ul className="list-disc list-inside text-blue-600 space-y-1">
            <li>Toutes vos données sont sauvegardées localement</li>
            <li>Vous pouvez continuer à travailler normalement</li>
            <li>La synchronisation sera automatique lors de la reconnexion</li>
            <li>Évitez de fermer l'application avant d'être reconnecté</li>
          </ul>
        </div>

        {/* Bouton de reconnexion */}
        <Button onClick={attemptReconnect} className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Vérifier la connexion
        </Button>
      </CardContent>
    </Card>
  )
}
