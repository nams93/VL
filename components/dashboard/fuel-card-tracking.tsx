"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Download,
  Calendar,
  Gauge,
  Car,
  Clock,
  BarChart3,
  PlusCircle,
  FileText,
  AlertTriangle,
  PenToolIcon as Tool,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FuelTransactionForm } from "./fuel-transaction-form"
// Ajouter l'import du nouveau composant en haut du fichier
import { FuelImportForm } from "./fuel-import-form"
// Ajouter l'import du nouveau composant en haut du fichier
import { MaintenanceAlerts } from "./maintenance-alerts"

// Types
type FuelTransaction = {
  id: string
  vehicleId: string
  immatriculation: string
  cardNumber: string
  date: string
  amount: number // en litres
  cost: number // en euros
  location: string
  kilometerReading: number
  driver: string
  status: "validé" | "en attente" | "anomalie"
}

type VehicleFuelStats = {
  id: string
  immatriculation: string
  cardNumber: string
  lastRefill: string
  totalConsumption: number
  averageConsumption: number // L/100km
  monthlyBudget: number
  budgetUsed: number
  currentKilometers: number
  lastMonthKilometers: number
  alerts: string[]
}

// Données fictives
const fuelTransactions: FuelTransaction[] = [
  {
    id: "TX-001",
    vehicleId: "v1",
    immatriculation: "AB-123-CD",
    cardNumber: "7845 **** **** 1234",
    date: "27/03/2025",
    amount: 45.5,
    cost: 78.35,
    location: "Station Total - Paris",
    kilometerReading: 12658,
    driver: "Jean Dupont",
    status: "validé",
  },
  {
    id: "TX-002",
    vehicleId: "v2",
    immatriculation: "EF-456-GH",
    cardNumber: "7845 **** **** 5678",
    date: "25/03/2025",
    amount: 38.2,
    cost: 65.8,
    location: "Station Esso - Lyon",
    kilometerReading: 8956,
    driver: "Marie Martin",
    status: "validé",
  },
  {
    id: "TX-003",
    vehicleId: "v3",
    immatriculation: "IJ-789-KL",
    cardNumber: "7845 **** **** 9012",
    date: "24/03/2025",
    amount: 55.0,
    cost: 94.6,
    location: "Station TotalEnergies - Marseille",
    kilometerReading: 5450,
    driver: "Pierre Durand",
    status: "anomalie",
  },
  {
    id: "TX-004",
    vehicleId: "v1",
    immatriculation: "AB-123-CD",
    cardNumber: "7845 **** **** 1234",
    date: "20/03/2025",
    amount: 42.3,
    cost: 72.75,
    location: "Station BP - Paris",
    kilometerReading: 12350,
    driver: "Jean Dupont",
    status: "validé",
  },
  {
    id: "TX-005",
    vehicleId: "v4",
    immatriculation: "MN-012-OP",
    cardNumber: "7845 **** **** 3456",
    date: "18/03/2025",
    amount: 62.5,
    cost: 107.5,
    location: "Station Avia - Nantes",
    kilometerReading: 19125,
    driver: "Sophie Petit",
    status: "en attente",
  },
  {
    id: "TX-006",
    vehicleId: "v5",
    immatriculation: "QR-345-ST",
    cardNumber: "7845 **** **** 7890",
    date: "15/03/2025",
    amount: 35.8,
    cost: 61.58,
    location: "Station Total - Toulouse",
    kilometerReading: 3780,
    driver: "Lucas Bernard",
    status: "validé",
  },
  {
    id: "TX-007",
    vehicleId: "v1",
    immatriculation: "AB-123-CD",
    cardNumber: "7845 **** **** 1234",
    date: "12/03/2025",
    amount: 48.2,
    cost: 82.9,
    location: "Station Intermarché - Paris",
    kilometerReading: 12050,
    driver: "Jean Dupont",
    status: "validé",
  },
  {
    id: "TX-008",
    vehicleId: "v2",
    immatriculation: "EF-456-GH",
    cardNumber: "7845 **** **** 5678",
    date: "10/03/2025",
    amount: 41.6,
    cost: 71.55,
    location: "Station Carrefour - Lyon",
    kilometerReading: 8650,
    driver: "Marie Martin",
    status: "validé",
  },
]

const vehicleFuelStats: VehicleFuelStats[] = [
  {
    id: "v1",
    immatriculation: "AB-123-CD",
    cardNumber: "7845 **** **** 1234",
    lastRefill: "27/03/2025",
    totalConsumption: 136.0,
    averageConsumption: 7.5,
    monthlyBudget: 350,
    budgetUsed: 234,
    currentKilometers: 12658,
    lastMonthKilometers: 11800,
    alerts: [],
  },
  {
    id: "v2",
    immatriculation: "EF-456-GH",
    cardNumber: "7845 **** **** 5678",
    lastRefill: "25/03/2025",
    totalConsumption: 79.8,
    averageConsumption: 6.2,
    monthlyBudget: 250,
    budgetUsed: 137.35,
    currentKilometers: 8956,
    lastMonthKilometers: 8350,
    alerts: [],
  },
  {
    id: "v3",
    immatriculation: "IJ-789-KL",
    cardNumber: "7845 **** **** 9012",
    lastRefill: "24/03/2025",
    totalConsumption: 55.0,
    averageConsumption: 9.8,
    monthlyBudget: 400,
    budgetUsed: 94.6,
    currentKilometers: 5450,
    lastMonthKilometers: 5200,
    alerts: ["Consommation anormale détectée"],
  },
  {
    id: "v4",
    immatriculation: "MN-012-OP",
    cardNumber: "7845 **** **** 3456",
    lastRefill: "18/03/2025",
    totalConsumption: 62.5,
    averageConsumption: 8.1,
    monthlyBudget: 350,
    budgetUsed: 107.5,
    currentKilometers: 19125,
    lastMonthKilometers: 18500,
    alerts: ["Transaction en attente de validation"],
  },
  {
    id: "v5",
    immatriculation: "QR-345-ST",
    cardNumber: "7845 **** **** 7890",
    lastRefill: "15/03/2025",
    totalConsumption: 35.8,
    averageConsumption: 5.9,
    monthlyBudget: 200,
    budgetUsed: 61.58,
    currentKilometers: 3780,
    lastMonthKilometers: 3500,
    alerts: [],
  },
]

export function FuelCardTracking() {
  const [searchTerm, setSearchTerm] = useState("")
  const [transactionStatusFilter, setTransactionStatusFilter] = useState<"all" | "validé" | "en attente" | "anomalie">(
    "all",
  )
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<"7j" | "30j" | "90j">("30j")
  const [isFormOpen, setIsFormOpen] = useState(false)
  // Ajouter un nouvel état pour le formulaire d'importation
  const [isImportFormOpen, setIsImportFormOpen] = useState(false)
  // Ajouter un nouvel état pour l'onglet d'entretien
  const [activeTab, setActiveTab] = useState<"overview" | "maintenance">("overview")

  // Filtrer les transactions
  const filteredTransactions = fuelTransactions.filter((transaction) => {
    // Filtre de recherche
    const matchesSearch =
      transaction.immatriculation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.cardNumber.includes(searchTerm)

    // Filtre de statut
    const matchesStatus = transactionStatusFilter === "all" || transaction.status === transactionStatusFilter

    // Filtre de véhicule
    const matchesVehicle = !selectedVehicle || transaction.vehicleId === selectedVehicle

    return matchesSearch && matchesStatus && matchesVehicle
  })

  // Filtrer les statistiques des véhicules
  const filteredVehicleStats = vehicleFuelStats.filter((vehicle) => {
    return (
      !searchTerm ||
      vehicle.immatriculation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.cardNumber.includes(searchTerm)
    )
  })

  // Sélectionner un véhicule pour voir ses détails
  const getSelectedVehicleStats = () => {
    if (!selectedVehicle) return null
    return vehicleFuelStats.find((vehicle) => vehicle.id === selectedVehicle) || null
  }

  // Obtenir les transactions d'un véhicule spécifique
  const getVehicleTransactions = (vehicleId: string) => {
    return fuelTransactions
      .filter((transaction) => transaction.vehicleId === vehicleId)
      .sort(
        (a, b) =>
          new Date(b.date.split("/").reverse().join("-")).getTime() -
          new Date(a.date.split("/").reverse().join("-")).getTime(),
      )
  }

  // Obtenir les statistiques globales
  const getGlobalStats = () => {
    const totalConsumption = vehicleFuelStats.reduce((sum, vehicle) => sum + vehicle.totalConsumption, 0)
    const totalBudget = vehicleFuelStats.reduce((sum, vehicle) => sum + vehicle.monthlyBudget, 0)
    const totalBudgetUsed = vehicleFuelStats.reduce((sum, vehicle) => sum + vehicle.budgetUsed, 0)
    const averageConsumption =
      vehicleFuelStats.reduce((sum, vehicle) => sum + vehicle.averageConsumption, 0) / vehicleFuelStats.length

    return { totalConsumption, totalBudget, totalBudgetUsed, averageConsumption }
  }

  // Gérer la soumission du formulaire de transaction
  const handleTransactionSubmit = (transaction: any) => {
    console.log("Nouvelle transaction:", transaction)

    // Dans un environnement réel, nous enverrions ces données à une API
    // Pour cette démo, nous allons simuler l'ajout à notre état local
    const updatedTransactions = [transaction, ...fuelTransactions]

    // Mettre à jour les statistiques du véhicule
    const vehicleIndex = vehicleFuelStats.findIndex((v) => v.id === transaction.vehicleId)
    if (vehicleIndex !== -1) {
      const updatedStats = [...vehicleFuelStats]
      updatedStats[vehicleIndex] = {
        ...updatedStats[vehicleIndex],
        lastRefill: transaction.date,
        totalConsumption: updatedStats[vehicleIndex].totalConsumption + transaction.amount,
        budgetUsed: updatedStats[vehicleIndex].budgetUsed + transaction.cost,
        currentKilometers: transaction.kilometerReading,
      }

      // Recalculer la consommation moyenne
      // Dans un environnement réel, ce calcul serait plus complexe et précis
      if (transaction.kilometerReading > updatedStats[vehicleIndex].lastMonthKilometers) {
        const distance = transaction.kilometerReading - updatedStats[vehicleIndex].lastMonthKilometers
        const consumption = updatedStats[vehicleIndex].totalConsumption
        updatedStats[vehicleIndex].averageConsumption = (consumption / distance) * 100
      }

      // Mettre à jour l'état (dans un environnement réel, cela serait persisté dans une base de données)
      // Pour cette démo, nous ne pouvons pas modifier directement les variables, mais dans une implémentation réelle,
      // ces données seraient mises à jour dans la base de données
    }

    alert("Transaction enregistrée avec succès!")
  }

  // Ajouter une fonction pour gérer l'importation
  const handleImportSubmit = (importedData: any[]) => {
    console.log("Données importées:", importedData)

    // Dans un environnement réel, nous traiterions ces données pour les convertir
    // au format attendu par notre application et les enregistrer

    alert(`${importedData.length} transactions importées avec succès!`)
  }

  const globalStats = getGlobalStats()
  const selectedVehicleStats = getSelectedVehicleStats()
  const selectedVehicleTransactions = selectedVehicle ? getVehicleTransactions(selectedVehicle) : []

  return (
    <div className="space-y-4">
      {selectedVehicle ? (
        <VehicleConsumptionDetail
          vehicleStats={selectedVehicleStats!}
          transactions={selectedVehicleTransactions}
          onBack={() => setSelectedVehicle(null)}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      ) : (
        <>
          {/* En-tête et filtres */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Traçabilité des Cartes Essence et Kilométrage</CardTitle>
                  <CardDescription>Suivi de consommation de carburant et de la distance parcourue</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant={activeTab === "overview" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("overview")}
                  >
                    Consommation
                  </Button>
                  <Button
                    variant={activeTab === "maintenance" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("maintenance")}
                  >
                    <Tool className="h-4 w-4 mr-1" />
                    Entretiens
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {activeTab === "overview" ? (
            <>
              {/* Statistiques globales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Consommation Totale</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{globalStats.totalConsumption.toFixed(1)} L</div>
                    <div className="text-xs text-muted-foreground">
                      Période: {dateRange === "7j" ? "7 jours" : dateRange === "30j" ? "30 jours" : "90 jours"}
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs">
                        <span>Coût estimé</span>
                        <span className="font-medium">{(globalStats.totalConsumption * 1.72).toFixed(2)} €</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Consommation Moyenne</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{globalStats.averageConsumption.toFixed(1)} L/100km</div>
                    <div className="text-xs text-muted-foreground">Tous véhicules confondus</div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs items-center">
                        <span>Performance</span>
                        <Badge
                          variant={globalStats.averageConsumption < 7.5 ? "success" : "default"}
                          className="text-xs"
                        >
                          {globalStats.averageConsumption < 7.5 ? "Bonne" : "Moyenne"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Budget Carburant</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {globalStats.totalBudgetUsed.toFixed(2)} € / {globalStats.totalBudget} €
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((globalStats.totalBudgetUsed / globalStats.totalBudget) * 100)}% du budget utilisé
                    </div>
                    <div className="mt-2">
                      <Progress value={(globalStats.totalBudgetUsed / globalStats.totalBudget) * 100} className="h-1" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Dernières Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{fuelTransactions.length}</div>
                    <div className="text-xs text-muted-foreground">
                      Dont {fuelTransactions.filter((t) => t.status === "en attente").length} en attente et{" "}
                      {fuelTransactions.filter((t) => t.status === "anomalie").length} anomalies
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => setIsFormOpen(true)}
                      >
                        <PlusCircle className="h-3 w-3 mr-1" /> Enregistrer transaction
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => setIsImportFormOpen(true)}
                      >
                        <FileText className="h-3 w-3 mr-1" /> Importer CSV
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tableau des véhicules avec conso */}
              <Card>
                <CardHeader>
                  <CardTitle>Consommation par Véhicule</CardTitle>
                  <CardDescription>Consommation de carburant et kilométrage par véhicule</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="py-3 px-4 text-left font-medium">Immatriculation</th>
                            <th className="py-3 px-4 text-left font-medium">Carte Essence</th>
                            <th className="py-3 px-4 text-left font-medium">Dernier Plein</th>
                            <th className="py-3 px-4 text-left font-medium">Conso. Totale</th>
                            <th className="py-3 px-4 text-left font-medium">Conso. Moy.</th>
                            <th className="py-3 px-4 text-left font-medium">Kilométrage</th>
                            <th className="py-3 px-4 text-left font-medium">Budget</th>
                            <th className="py-3 px-4 text-left font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredVehicleStats.length > 0 ? (
                            filteredVehicleStats.map((vehicle) => (
                              <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium">{vehicle.immatriculation}</td>
                                <td className="py-3 px-4">{vehicle.cardNumber}</td>
                                <td className="py-3 px-4">{vehicle.lastRefill}</td>
                                <td className="py-3 px-4">{vehicle.totalConsumption.toFixed(1)} L</td>
                                <td className="py-3 px-4">
                                  <Badge
                                    variant={
                                      vehicle.averageConsumption < 7
                                        ? "success"
                                        : vehicle.averageConsumption < 9
                                          ? "default"
                                          : "destructive"
                                    }
                                    className="font-normal"
                                  >
                                    {vehicle.averageConsumption.toFixed(1)} L/100km
                                  </Badge>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center">
                                    <span className="mr-2">{vehicle.currentKilometers} km</span>
                                    {vehicle.currentKilometers - vehicle.lastMonthKilometers > 0 && (
                                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                        +{vehicle.currentKilometers - vehicle.lastMonthKilometers} km
                                      </Badge>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span>{Math.round((vehicle.budgetUsed / vehicle.monthlyBudget) * 100)}%</span>
                                      <span>
                                        {vehicle.budgetUsed.toFixed(0)} € / {vehicle.monthlyBudget} €
                                      </span>
                                    </div>
                                    <Progress
                                      value={(vehicle.budgetUsed / vehicle.monthlyBudget) * 100}
                                      className="h-1"
                                      indicatorClassName={
                                        vehicle.budgetUsed / vehicle.monthlyBudget > 0.9
                                          ? "bg-red-500"
                                          : vehicle.budgetUsed / vehicle.monthlyBudget > 0.7
                                            ? "bg-amber-500"
                                            : "bg-green-500"
                                      }
                                    />
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => setSelectedVehicle(vehicle.id)}>
                                      Détails
                                    </Button>
                                    {vehicle.alerts.length > 0 && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-amber-600 bg-amber-50 border-amber-200"
                                      >
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        Alertes ({vehicle.alerts.length})
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={8} className="py-4 px-4 text-center text-gray-500">
                                Aucun véhicule ne correspond aux critères de recherche
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Historique des transactions */}
              <Card>
                <CardHeader>
                  <CardTitle>Historique des Transactions</CardTitle>
                  <CardDescription>Dernières transactions des cartes essence</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="py-3 px-4 text-left font-medium">ID</th>
                            <th className="py-3 px-4 text-left font-medium">Date</th>
                            <th className="py-3 px-4 text-left font-medium">Véhicule</th>
                            <th className="py-3 px-4 text-left font-medium">Carte</th>
                            <th className="py-3 px-4 text-left font-medium">Station</th>
                            <th className="py-3 px-4 text-left font-medium">Carburant</th>
                            <th className="py-3 px-4 text-left font-medium">Coût</th>
                            <th className="py-3 px-4 text-left font-medium">Kilométrage</th>
                            <th className="py-3 px-4 text-left font-medium">Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTransactions.length > 0 ? (
                            filteredTransactions.map((transaction) => (
                              <tr key={transaction.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium">{transaction.id}</td>
                                <td className="py-3 px-4">{transaction.date}</td>
                                <td className="py-3 px-4">{transaction.immatriculation}</td>
                                <td className="py-3 px-4">{transaction.cardNumber}</td>
                                <td className="py-3 px-4">{transaction.location}</td>
                                <td className="py-3 px-4">{transaction.amount.toFixed(1)} L</td>
                                <td className="py-3 px-4">{transaction.cost.toFixed(2)} €</td>
                                <td className="py-3 px-4">{transaction.kilometerReading} km</td>
                                <td className="py-3 px-4">
                                  <TransactionStatusBadge status={transaction.status} />
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={9} className="py-4 px-4 text-center text-gray-500">
                                Aucune transaction ne correspond aux critères de recherche
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <MaintenanceAlerts />
          )}
        </>
      )}

      {/* Formulaires */}
      <FuelTransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleTransactionSubmit}
        vehicles={vehicleFuelStats.map((v) => ({
          id: v.id,
          immatriculation: v.immatriculation,
          cardNumber: v.cardNumber,
          currentKilometers: v.currentKilometers,
        }))}
      />

      <FuelImportForm
        isOpen={isImportFormOpen}
        onClose={() => setIsImportFormOpen(false)}
        onImport={handleImportSubmit}
      />
    </div>
  )
}

function TransactionStatusBadge({ status }: { status: FuelTransaction["status"] }) {
  switch (status) {
    case "validé":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Validé
        </Badge>
      )
    case "en attente":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Clock className="h-3 w-3 mr-1" /> En attente
        </Badge>
      )
    case "anomalie":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <AlertTriangle className="h-3 w-3 mr-1" /> Anomalie
        </Badge>
      )
  }
}

interface VehicleConsumptionDetailProps {
  vehicleStats: VehicleFuelStats
  transactions: FuelTransaction[]
  onBack: () => void
  dateRange: "7j" | "30j" | "90j"
  onDateRangeChange: (range: "7j" | "30j" | "90j") => void
}

function VehicleConsumptionDetail({
  vehicleStats,
  transactions,
  onBack,
  dateRange,
  onDateRangeChange,
}: VehicleConsumptionDetailProps) {
  const [selectedTab, setSelectedTab] = useState("overview")

  // Calcul des consommations mensuelles (exemple)
  const monthlyConsumptionData = [
    { month: "Jan", consumption: 138.2, distance: 980 },
    { month: "Fév", consumption: 142.5, distance: 1050 },
    { month: "Mar", consumption: 136.0, distance: 1020 },
    { month: "Avr", consumption: 0, distance: 0 },
    { month: "Mai", consumption: 0, distance: 0 },
    { month: "Juin", consumption: 0, distance: 0 },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
              ← Retour
            </Button>
            <CardTitle className="flex items-center">
              <Car className="h-5 w-5 mr-2" />
              Véhicule {vehicleStats.immatriculation} - Suivi de consommation
            </CardTitle>
            <CardDescription>
              Carte essence: {vehicleStats.cardNumber} - Kilométrage actuel: {vehicleStats.currentKilometers} km
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Select value={dateRange} onValueChange={(value: any) => onDateRangeChange(value)}>
              <SelectTrigger className="h-8 w-28">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7j">7 jours</SelectItem>
                <SelectItem value="30j">30 jours</SelectItem>
                <SelectItem value="90j">90 jours</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" /> Exporter PDF
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" /> Rapport
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="w-full">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="consumption">Consommation</TabsTrigger>
            <TabsTrigger value="mileage">Kilométrage</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Immatriculation:</span>
                    <span className="text-sm font-medium">{vehicleStats.immatriculation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Numéro de carte:</span>
                    <span className="text-sm font-medium">{vehicleStats.cardNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Dernier plein:</span>
                    <span className="text-sm font-medium">{vehicleStats.lastRefill}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Kilométrage actuel:</span>
                    <span className="text-sm font-medium">{vehicleStats.currentKilometers} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Distance parcourue (mois):</span>
                    <span className="text-sm font-medium">
                      +{vehicleStats.currentKilometers - vehicleStats.lastMonthKilometers} km
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Consommation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center space-y-1">
                    <div className="text-2xl font-bold">{vehicleStats.averageConsumption.toFixed(1)} L/100km</div>
                    <div className="text-xs text-gray-500">Consommation moyenne</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Consommation totale:</span>
                      <span className="text-sm font-medium">{vehicleStats.totalConsumption.toFixed(1)} L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Coût estimé:</span>
                      <span className="text-sm font-medium">{(vehicleStats.totalConsumption * 1.72).toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Performance:</span>
                      <Badge
                        variant={
                          vehicleStats.averageConsumption < 7
                            ? "success"
                            : vehicleStats.averageConsumption < 9
                              ? "default"
                              : "destructive"
                        }
                      >
                        {vehicleStats.averageConsumption < 7
                          ? "Bonne"
                          : vehicleStats.averageConsumption < 9
                            ? "Moyenne"
                            : "Élevée"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Budget carburant</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center space-y-1">
                    <div className="text-2xl font-bold">{vehicleStats.budgetUsed.toFixed(2)} €</div>
                    <div className="text-xs text-gray-500">sur {vehicleStats.monthlyBudget} € alloués</div>
                    <Progress
                      value={(vehicleStats.budgetUsed / vehicleStats.monthlyBudget) * 100}
                      className="h-2 mt-2"
                      indicatorClassName={
                        vehicleStats.budgetUsed / vehicleStats.monthlyBudget > 0.9
                          ? "bg-red-500"
                          : vehicleStats.budgetUsed / vehicleStats.monthlyBudget > 0.7
                            ? "bg-amber-500"
                            : "bg-green-500"
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Pourcentage utilisé:</span>
                      <span className="text-sm font-medium">
                        {Math.round((vehicleStats.budgetUsed / vehicleStats.monthlyBudget) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Reste disponible:</span>
                      <span className="text-sm font-medium">
                        {(vehicleStats.monthlyBudget - vehicleStats.budgetUsed).toFixed(2)} €
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Statut:</span>
                      <Badge
                        variant={vehicleStats.budgetUsed / vehicleStats.monthlyBudget > 0.9 ? "destructive" : "success"}
                      >
                        {vehicleStats.budgetUsed / vehicleStats.monthlyBudget > 0.9 ? "Critique" : "Conforme"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dernières transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="py-3 px-4 text-left font-medium">Date</th>
                        <th className="py-3 px-4 text-left font-medium">Station</th>
                        <th className="py-3 px-4 text-left font-medium">Litres</th>
                        <th className="py-3 px-4 text-left font-medium">Coût</th>
                        <th className="py-3 px-4 text-left font-medium">Kilométrage</th>
                        <th className="py-3 px-4 text-left font-medium">Conducteur</th>
                        <th className="py-3 px-4 text-left font-medium">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 5).map((transaction) => (
                        <tr key={transaction.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{transaction.date}</td>
                          <td className="py-3 px-4">{transaction.location}</td>
                          <td className="py-3 px-4">{transaction.amount.toFixed(1)} L</td>
                          <td className="py-3 px-4">{transaction.cost.toFixed(2)} €</td>
                          <td className="py-3 px-4">{transaction.kilometerReading} km</td>
                          <td className="py-3 px-4">{transaction.driver}</td>
                          <td className="py-3 px-4">
                            <TransactionStatusBadge status={transaction.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Évolution de la consommation</CardTitle>
                </CardHeader>
                <CardContent className="h-72 bg-gray-50 flex items-center justify-center rounded-md">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                    <p>Graphique de consommation mensuelle</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Évolution du kilométrage</CardTitle>
                </CardHeader>
                <CardContent className="h-72 bg-gray-50 flex items-center justify-center rounded-md">
                  <div className="text-center text-gray-500">
                    <Gauge className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                    <p>Graphique d'évolution du kilométrage</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Historique des transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="py-3 px-4 text-left font-medium">ID</th>
                        <th className="py-3 px-4 text-left font-medium">Date</th>
                        <th className="py-3 px-4 text-left font-medium">Station</th>
                        <th className="py-3 px-4 text-left font-medium">Litres</th>
                        <th className="py-3 px-4 text-left font-medium">Coût</th>
                        <th className="py-3 px-4 text-left font-medium">Kilométrage</th>
                        <th className="py-3 px-4 text-left font-medium">Prix/L</th>
                        <th className="py-3 px-4 text-left font-medium">Conducteur</th>
                        <th className="py-3 px-4 text-left font-medium">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{transaction.id}</td>
                          <td className="py-3 px-4">{transaction.date}</td>
                          <td className="py-3 px-4">{transaction.location}</td>
                          <td className="py-3 px-4">{transaction.amount.toFixed(1)} L</td>
                          <td className="py-3 px-4">{transaction.cost.toFixed(2)} €</td>
                          <td className="py-3 px-4">{transaction.kilometerReading} km</td>
                          <td className="py-3 px-4">{(transaction.cost / transaction.amount).toFixed(3)} €/L</td>
                          <td className="py-3 px-4">{transaction.driver}</td>
                          <td className="py-3 px-4">
                            <TransactionStatusBadge status={transaction.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consumption" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Analyse de consommation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-80 bg-gray-50 flex items-center justify-center rounded-md">
                    <div className="text-center text-gray-500">
                      <BarChart3 className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                      <p>Graphique de consommation mensuelle</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Statistiques détaillées</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="text-sm">Consommation moyenne</div>
                          <div className="text-xl font-bold">{vehicleStats.averageConsumption.toFixed(1)} L/100km</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="text-sm">Consommation totale</div>
                          <div className="text-xl font-bold">{vehicleStats.totalConsumption.toFixed(1)} L</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="text-sm">Coût total</div>
                          <div className="text-xl font-bold">{vehicleStats.budgetUsed.toFixed(2)} €</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="text-sm">Coût moyen/100km</div>
                          <div className="text-xl font-bold">
                            {(vehicleStats.averageConsumption * 1.72).toFixed(2)} €
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Consommation mensuelle</h3>
                      <div className="space-y-2">
                        {monthlyConsumptionData.map((month) => (
                          <div key={month.month} className="flex items-center">
                            <div className="w-10">{month.month}</div>
                            <div className="flex-1 mx-2">
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500"
                                  style={{
                                    width: `${month.consumption ? Math.min(100, (month.consumption / 150) * 100) : 0}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                            <div className="w-20 text-right">{month.consumption.toFixed(1)} L</div>
                            <div className="w-20 text-right text-gray-500">{month.distance} km</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mileage" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Suivi du kilométrage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-80 bg-gray-50 flex items-center justify-center rounded-md">
                    <div className="text-center text-gray-500">
                      <Gauge className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                      <p>Graphique d'évolution du kilométrage</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Relevés de kilométrage</h3>
                      <div className="rounded-md border">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="py-2 px-4 text-left font-medium">Date</th>
                              <th className="py-2 px-4 text-left font-medium">Kilométrage</th>
                              <th className="py-2 px-4 text-left font-medium">Distance</th>
                              <th className="py-2 px-4 text-left font-medium">Contexte</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactions.map((transaction, index) => {
                              const prevKm =
                                index < transactions.length - 1 ? transactions[index + 1].kilometerReading : null
                              const distance = prevKm ? transaction.kilometerReading - prevKm : null

                              return (
                                <tr key={transaction.id} className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-4">{transaction.date}</td>
                                  <td className="py-2 px-4">{transaction.kilometerReading} km</td>
                                  <td className="py-2 px-4">
                                    {distance !== null ? (
                                      <Badge variant={distance > 0 ? "outline" : "default"} className="font-normal">
                                        +{distance} km
                                      </Badge>
                                    ) : (
                                      "-"
                                    )}
                                  </td>
                                  <td className="py-2 px-4">Plein de carburant</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Statistiques de distance</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="text-sm">Kilométrage actuel</div>
                          <div className="text-xl font-bold">{vehicleStats.currentKilometers} km</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="text-sm">Distance mensuelle</div>
                          <div className="text-xl font-bold">
                            +{vehicleStats.currentKilometers - vehicleStats.lastMonthKilometers} km
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="text-sm">Distance moyenne/jour</div>
                          <div className="text-xl font-bold">
                            {Math.round((vehicleStats.currentKilometers - vehicleStats.lastMonthKilometers) / 30)} km
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="text-sm">Prochaine révision</div>
                          <div className="text-xl font-bold">
                            Dans {15000 - (vehicleStats.currentKilometers % 15000)} km
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

