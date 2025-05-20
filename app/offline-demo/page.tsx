"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNetworkStatus } from "@/hooks/use-network-status"
import { useOfflineStorage } from "@/hooks/use-offline-storage"
import { OfflineQueueManager } from "@/components/offline-queue-manager"
import { enqueueAction } from "@/lib/offline-queue"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { WifiOff, Wifi, Save, Upload, RefreshCw, Database, Trash2 } from "lucide-react"

export default function OfflineDemoPage() {
  const { isOnline } = useNetworkStatus()
  const [activeTab, setActiveTab] = useState("storage")
  const [noteTitle, setNoteTitle] = useState("")
  const [noteContent, setNoteContent] = useState("")

  // Utiliser le hook de stockage hors ligne
  const {
    value: notes,
    setValue: setNotes,
    pendingChanges,
    lastSynced,
    sync,
  } = useOfflineStorage<Array<{ id: string; title: string; content: string; createdAt: number }>>(
    "offline-demo-notes",
    [],
    { syncOnReconnect: true },
  )

  // Ajouter une note
  const addNote = () => {
    if (!noteTitle.trim()) {
      alert("Veuillez saisir un titre pour la note")
      return
    }

    const newNote = {
      id: `note-${Date.now()}`,
      title: noteTitle,
      content: noteContent,
      createdAt: Date.now(),
    }

    setNotes([...notes, newNote])
    setNoteTitle("")
    setNoteContent("")
  }

  // Supprimer une note
  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id))
  }

  // Ajouter une action à la file d'attente
  const addToQueue = (type: string) => {
    try {
      let payload

      switch (type) {
        case "save-inspection":
          payload = {
            id: `inspection-${Date.now()}`,
            vehicleId: "VH-" + Math.floor(Math.random() * 1000),
            timestamp: Date.now(),
            items: [
              { id: "item1", status: Math.random() > 0.5 ? "ok" : "issue" },
              { id: "item2", status: Math.random() > 0.5 ? "ok" : "issue" },
              { id: "item3", status: Math.random() > 0.5 ? "ok" : "issue" },
            ],
          }
          break

        case "upload-photo":
          payload = {
            id: `photo-${Date.now()}`,
            inspectionId: `inspection-${Math.floor(Math.random() * 1000)}`,
            timestamp: Date.now(),
            size: Math.floor(Math.random() * 5000000) + 1000000,
            format: "jpeg",
          }
          break

        case "update-equipment":
          payload = {
            id: `equipment-${Date.now()}`,
            type: Math.random() > 0.5 ? "radio" : "deporte",
            status: Math.random() > 0.7 ? "issue" : "ok",
            timestamp: Date.now(),
          }
          break

        default:
          payload = { timestamp: Date.now() }
      }

      const actionId = enqueueAction(type, payload)
      alert(`Action ajoutée à la file d'attente avec l'ID: ${actionId}`)
    } catch (error) {
      console.error("Erreur lors de l'ajout à la file d'attente:", error)
      alert("Erreur lors de l'ajout à la file d'attente")
    }
  }

  // Formater la date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Démonstration du mode hors ligne</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Cette page démontre les fonctionnalités de l'application en mode hors ligne.
        </p>

        <div className="flex items-center mt-4 p-3 rounded-md bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
          <div className="mr-3 p-2 rounded-full bg-blue-100 dark:bg-blue-800">
            {isOnline ? (
              <Wifi className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            ) : (
              <WifiOff className="h-6 w-6 text-red-600 dark:text-red-400" />
            )}
          </div>
          <div>
            <h3 className="font-medium">
              Statut de connexion:{" "}
              <span className={isOnline ? "text-green-600" : "text-red-600"}>
                {isOnline ? "En ligne" : "Hors ligne"}
              </span>
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {isOnline
                ? "Vous êtes connecté à Internet. Toutes les fonctionnalités sont disponibles."
                : "Vous êtes actuellement hors ligne. Les données sont enregistrées localement et seront synchronisées lorsque vous serez à nouveau en ligne."}
            </p>
            <div className="mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // Simuler un changement d'état de connexion
                  const event = new Event(isOnline ? "offline" : "online")
                  window.dispatchEvent(event)
                }}
                className="text-xs"
              >
                Simuler {isOnline ? "déconnexion" : "connexion"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="storage">Stockage hors ligne</TabsTrigger>
          <TabsTrigger value="queue">File d'attente</TabsTrigger>
        </TabsList>

        <TabsContent value="storage" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stockage hors ligne</CardTitle>
              <CardDescription>
                Créez et gérez des notes qui sont automatiquement sauvegardées localement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Statut de synchronisation:</span>
                    <div className="flex items-center">
                      {pendingChanges ? (
                        <span className="text-amber-600 dark:text-amber-400 flex items-center">
                          <Database className="h-3 w-3 mr-1" />
                          Modifications non synchronisées
                        </span>
                      ) : (
                        <span className="text-green-600 dark:text-green-400 flex items-center">
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Synchronisé
                        </span>
                      )}
                    </div>
                  </div>
                  {lastSynced && (
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Dernière synchronisation: {lastSynced.toLocaleString()}
                    </div>
                  )}
                  {pendingChanges && isOnline && (
                    <div className="mt-2">
                      <Button size="sm" onClick={sync} className="text-xs h-7 bg-blue-600 hover:bg-blue-700">
                        <Upload className="h-3 w-3 mr-1" />
                        Synchroniser maintenant
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label htmlFor="note-title" className="block text-sm font-medium mb-1">
                      Titre de la note
                    </label>
                    <Input
                      id="note-title"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="Saisissez un titre"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="note-content" className="block text-sm font-medium mb-1">
                      Contenu
                    </label>
                    <Textarea
                      id="note-content"
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Saisissez le contenu de votre note"
                      className="text-sm min-h-[100px]"
                    />
                  </div>
                  <Button onClick={addNote} className="w-full bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer la note
                  </Button>
                </div>

                <div className="mt-4">
                  <h3 className="font-medium mb-2">Notes enregistrées ({notes.length})</h3>
                  {notes.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400 border rounded-md">
                      Aucune note enregistrée
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {notes.map((note) => (
                        <div key={note.id} className="border rounded-md p-3 bg-white dark:bg-gray-800">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">{note.title}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNote(note.id)}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm mt-1 whitespace-pre-wrap">{note.content}</p>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Créée le {formatDate(note.createdAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ajouter à la file d'attente</CardTitle>
              <CardDescription>
                Ajoutez des actions à la file d'attente pour les traiter lorsque vous serez en ligne
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button
                    onClick={() => addToQueue("save-inspection")}
                    variant="outline"
                    className="h-auto py-3 flex flex-col items-center"
                  >
                    <Save className="h-5 w-5 mb-1" />
                    <span>Ajouter une inspection</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Enregistrer une inspection de véhicule
                    </span>
                  </Button>

                  <Button
                    onClick={() => addToQueue("upload-photo")}
                    variant="outline"
                    className="h-auto py-3 flex flex-col items-center"
                  >
                    <Upload className="h-5 w-5 mb-1" />
                    <span>Ajouter une photo</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Télécharger une photo d'inspection
                    </span>
                  </Button>

                  <Button
                    onClick={() => addToQueue("update-equipment")}
                    variant="outline"
                    className="h-auto py-3 flex flex-col items-center"
                  >
                    <RefreshCw className="h-5 w-5 mb-1" />
                    <span>Mettre à jour un équipement</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Mettre à jour l'état d'un équipement radio
                    </span>
                  </Button>
                </div>

                <div className="mt-6">
                  <OfflineQueueManager />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
