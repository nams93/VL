"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Trash2, Edit, Plus, Shield, Users, Settings, Database, RefreshCw, AlertTriangle } from "lucide-react"
import { authService } from "@/lib/auth-service"
import { activityTrackingService } from "@/lib/activity-tracking-service"
import { notificationService } from "@/lib/notification-service"

const ADMIN_ACCOUNTS_KEY = "adminAccounts"

export default function AdminDashboard() {
  const router = useRouter()
  const [adminAccounts, setAdminAccounts] = useState<any[]>([])
  const [newAccount, setNewAccount] = useState({
    id: "",
    name: "",
    role: "supervisor" as "agent" | "supervisor" | "admin",
  })
  const [editAccount, setEditAccount] = useState<any>(null)
  const [systemStats, setSystemStats] = useState({
    totalAgents: 0,
    totalForms: 0,
    totalVehicles: 0,
    activeAgents: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Vérifier si l'utilisateur est administrateur
  useEffect(() => {
    if (!authService.isAdmin()) {
      router.push("/login")
      return
    }

    loadAdminData()
  }, [router])

  const loadAdminData = () => {
    setLoading(true)

    try {
      // Charger les comptes administrateurs
      const accounts = authService.getAdminAccounts()
      setAdminAccounts(accounts)

      // Charger les statistiques du système
      const activeAgents = Object.keys(activityTrackingService.getActiveAgents()).length

      // Récupérer les données du localStorage pour les statistiques
      const radioForms = JSON.parse(localStorage.getItem("radioEquipmentForms") || "[]")
      const inspectionForms = JSON.parse(localStorage.getItem("pendingInspections") || "[]")
      const vehicles = JSON.parse(localStorage.getItem("vehicles") || "[]")

      setSystemStats({
        totalAgents: activityTrackingService.getAllAgents().length,
        totalForms: radioForms.length + inspectionForms.length,
        totalVehicles: vehicles.length,
        activeAgents,
      })

      setLoading(false)
    } catch (error) {
      console.error("Erreur lors du chargement des données admin:", error)
      setError("Erreur lors du chargement des données")
      setLoading(false)
    }
  }

  const handleAddAccount = () => {
    if (!newAccount.id || !newAccount.name) {
      setError("Veuillez remplir tous les champs")
      return
    }

    try {
      authService.addAdminAccount(newAccount.id, newAccount.name, newAccount.role)
      setAdminAccounts(authService.getAdminAccounts())
      setNewAccount({ id: "", name: "", role: "supervisor" })
      setSuccess("Compte ajouté avec succès")

      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(""), 3000)
    } catch (error) {
      console.error("Erreur lors de l'ajout du compte:", error)
      setError("Erreur lors de l'ajout du compte")
    }
  }

  const handleUpdateAccount = () => {
    if (!editAccount || !editAccount.id || !editAccount.name) {
      setError("Informations de compte invalides")
      return
    }

    try {
      authService.addAdminAccount(editAccount.id, editAccount.name, editAccount.role)
      setAdminAccounts(authService.getAdminAccounts())
      setEditAccount(null)
      setSuccess("Compte mis à jour avec succès")

      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(""), 3000)
    } catch (error) {
      console.error("Erreur lors de la mise à jour du compte:", error)
      setError("Erreur lors de la mise à jour du compte")
    }
  }

  const handleDeleteAccount = (id: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le compte ${id} ?`)) {
      try {
        authService.removeAdminAccount(id)
        setAdminAccounts(authService.getAdminAccounts())
        setSuccess("Compte supprimé avec succès")

        // Effacer le message de succès après 3 secondes
        setTimeout(() => setSuccess(""), 3000)
      } catch (error) {
        console.error("Erreur lors de la suppression du compte:", error)
        setError("Erreur lors de la suppression du compte")
      }
    }
  }

  const handleClearData = (dataType: string) => {
    if (
      window.confirm(`Êtes-vous sûr de vouloir effacer toutes les données ${dataType} ? Cette action est irréversible.`)
    ) {
      try {
        switch (dataType) {
          case "activities":
            activityTrackingService.clearAllActivities()
            break
          case "notifications":
            notificationService.clearAllNotifications()
            break
          case "forms":
            localStorage.removeItem("radioEquipmentForms")
            localStorage.removeItem("pendingInspections")
            break
          case "all":
            if (window.confirm("ATTENTION: Ceci effacera TOUTES les données du système. Êtes-vous absolument sûr ?")) {
              // Sauvegarder les comptes admin
              const adminAccounts = authService.getAdminAccounts()

              // Effacer tout le localStorage sauf les comptes admin
              localStorage.clear()

              // Restaurer les comptes admin
              localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(adminAccounts))
            }
            break
        }

        setSuccess(`Données ${dataType} effacées avec succès`)
        loadAdminData()

        // Effacer le message de succès après 3 secondes
        setTimeout(() => setSuccess(""), 3000)
      } catch (error) {
        console.error(`Erreur lors de l'effacement des données ${dataType}:`, error)
        setError(`Erreur lors de l'effacement des données ${dataType}`)
      }
    }
  }

  const handleGenerateTestData = () => {
    if (window.confirm("Voulez-vous générer des données de test pour le système ?")) {
      try {
        // Générer des véhicules de test
        const testVehicles = [
          { id: "V001", immatriculation: "123-ABC-75", model: "Renault Clio", status: "disponible" },
          { id: "V002", immatriculation: "456-DEF-75", model: "Peugeot 308", status: "en_service" },
          { id: "V003", immatriculation: "789-GHI-75", model: "Citroën C3", status: "maintenance" },
        ]
        localStorage.setItem("vehicles", JSON.stringify(testVehicles))

        // Générer des notifications de test
        const currentAgent = authService.getCurrentAgent()
        if (currentAgent) {
          for (let i = 0; i < 5; i++) {
            notificationService.addNotification(
              "info",
              `Notification de test ${i + 1}`,
              `Ceci est une notification de test générée automatiquement (${i + 1})`,
              currentAgent.id,
            )
          }
        }

        setSuccess("Données de test générées avec succès")
        loadAdminData()

        // Effacer le message de succès après 3 secondes
        setTimeout(() => setSuccess(""), 3000)
      } catch (error) {
        console.error("Erreur lors de la génération des données de test:", error)
        setError("Erreur lors de la génération des données de test")
      }
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Administration du système</h1>
          <p className="text-gray-500">Gestion des comptes et des données</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/supervisor")} variant="outline" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Mode Superviseur
          </Button>
          <Button onClick={loadAdminData} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
          <AlertTitle>Succès</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Agents actifs</div>
                <div className="text-2xl font-bold">{systemStats.activeAgents}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Database className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Total formulaires</div>
                <div className="text-2xl font-bold">{systemStats.totalForms}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-amber-100 p-3 rounded-full">
                <Settings className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Véhicules</div>
                <div className="text-2xl font-bold">{systemStats.totalVehicles}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Comptes admin</div>
                <div className="text-2xl font-bold">{adminAccounts.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Gestion des comptes administrateurs</CardTitle>
            <CardDescription>Gérez les comptes ayant des privilèges d'administration et de supervision</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="newId">Identifiant</Label>
                  <Input
                    id="newId"
                    value={newAccount.id}
                    onChange={(e) => setNewAccount({ ...newAccount, id: e.target.value })}
                    placeholder="Identifiant unique"
                  />
                </div>
                <div>
                  <Label htmlFor="newName">Nom</Label>
                  <Input
                    id="newName"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    placeholder="Nom complet"
                  />
                </div>
                <div>
                  <Label htmlFor="newRole">Rôle</Label>
                  <select
                    id="newRole"
                    className="w-full p-2 border rounded-md"
                    value={newAccount.role}
                    onChange={(e) => setNewAccount({ ...newAccount, role: e.target.value as any })}
                  >
                    <option value="supervisor">Superviseur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
              </div>

              <Button onClick={handleAddAccount} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Ajouter un compte
              </Button>
            </div>

            <div className="mt-6">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {adminAccounts.map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{account.id}</td>
                      <td className="px-4 py-3">{account.name}</td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            account.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                          }
                        >
                          {account.role === "admin" ? "Administrateur" : "Superviseur"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => setEditAccount(account)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteAccount(account.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maintenance du système</CardTitle>
            <CardDescription>Outils de gestion des données et de maintenance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Nettoyage des données</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                  onClick={() => handleClearData("activities")}
                >
                  Effacer l'historique d'activités
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                  onClick={() => handleClearData("notifications")}
                >
                  Effacer toutes les notifications
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                  onClick={() => handleClearData("forms")}
                >
                  Effacer tous les formulaires
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left text-red-500"
                  onClick={() => handleClearData("all")}
                >
                  Réinitialiser toutes les données
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Outils de test</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-left" onClick={handleGenerateTestData}>
                  Générer des données de test
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                  onClick={() => {
                    const currentAgent = authService.getCurrentAgent()
                    if (currentAgent) {
                      authService.generateTestNotifications(currentAgent.id)
                      setSuccess("Notifications de test générées")
                      setTimeout(() => setSuccess(""), 3000)
                    }
                  }}
                >
                  Générer des notifications de test
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Navigation</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-left" onClick={() => router.push("/")}>
                  Page d'accueil
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                  onClick={() => router.push("/supervisor")}
                >
                  Mode Superviseur
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                  onClick={() => router.push("/dashboard")}
                >
                  Tableau de bord
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog pour modifier un compte */}
      {editAccount && (
        <Dialog open={!!editAccount} onOpenChange={(open) => !open && setEditAccount(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier le compte</DialogTitle>
              <DialogDescription>Modifiez les informations du compte administrateur</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editId">Identifiant</Label>
                <Input id="editId" value={editAccount.id} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editName">Nom</Label>
                <Input
                  id="editName"
                  value={editAccount.name}
                  onChange={(e) => setEditAccount({ ...editAccount, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRole">Rôle</Label>
                <select
                  id="editRole"
                  className="w-full p-2 border rounded-md"
                  value={editAccount.role}
                  onChange={(e) => setEditAccount({ ...editAccount, role: e.target.value })}
                >
                  <option value="supervisor">Superviseur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditAccount(null)}>
                Annuler
              </Button>
              <Button onClick={handleUpdateAccount}>Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
