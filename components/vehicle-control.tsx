"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Lock,
  Unlock,
  Power,
  Thermometer,
  Fan,
  Droplets,
  Gauge,
  BatteryFull,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Truck,
  Car,
} from "lucide-react"

type VehicleControlProps = {
  selectedVehicleId: string | null
}

type VehicleDetails = {
  id: string
  immatriculation: string
  type: "Camion" | "Voiture" | "Camionnette"
  chauffeur: string
  statut: "actif" | "inactif" | "maintenance"
  carburant: number
  kilometrage: number
  temperature: number
  batterie: number
  position: {
    latitude: number
    longitude: number
    adresse: string
  }
  verrouille: boolean
  moteurAllume: boolean
  climatisation: boolean
  vitesse: number
}

const vehiclesData: Record<string, VehicleDetails> = {
  v1: {
    id: "v1",
    immatriculation: "AB-123-CD",
    type: "Camion",
    chauffeur: "Jean Dupont",
    statut: "actif",
    carburant: 75,
    kilometrage: 12500,
    temperature: 22,
    batterie: 95,
    position: {
      latitude: 48.8566,
      longitude: 2.3522,
      adresse: "Avenue des Champs-Élysées, Paris",
    },
    verrouille: false,
    moteurAllume: true,
    climatisation: true,
    vitesse: 65,
  },
  v2: {
    id: "v2",
    immatriculation: "EF-456-GH",
    type: "Voiture",
    chauffeur: "Marie Martin",
    statut: "actif",
    carburant: 45,
    kilometrage: 8700,
    temperature: 20,
    batterie: 80,
    position: {
      latitude: 45.764,
      longitude: 4.8357,
      adresse: "Rue de la République, Lyon",
    },
    verrouille: false,
    moteurAllume: true,
    climatisation: false,
    vitesse: 30,
  },
  v3: {
    id: "v3",
    immatriculation: "IJ-789-KL",
    type: "Camionnette",
    chauffeur: "Pierre Durand",
    statut: "maintenance",
    carburant: 90,
    kilometrage: 5200,
    temperature: 18,
    batterie: 100,
    position: {
      latitude: 43.2965,
      longitude: 5.3698,
      adresse: "Vieux Port, Marseille",
    },
    verrouille: true,
    moteurAllume: false,
    climatisation: false,
    vitesse: 0,
  },
  v4: {
    id: "v4",
    immatriculation: "MN-012-OP",
    type: "Camion",
    chauffeur: "Sophie Petit",
    statut: "inactif",
    carburant: 30,
    kilometrage: 18900,
    temperature: 15,
    batterie: 60,
    position: {
      latitude: 47.2184,
      longitude: -1.5536,
      adresse: "Place du Commerce, Nantes",
    },
    verrouille: true,
    moteurAllume: false,
    climatisation: false,
    vitesse: 0,
  },
  v5: {
    id: "v5",
    immatriculation: "QR-345-ST",
    type: "Voiture",
    chauffeur: "Lucas Bernard",
    statut: "actif",
    carburant: 60,
    kilometrage: 3500,
    temperature: 24,
    batterie: 85,
    position: {
      latitude: 43.6045,
      longitude: 1.4442,
      adresse: "Place du Capitole, Toulouse",
    },
    verrouille: false,
    moteurAllume: true,
    climatisation: true,
    vitesse: 45,
  },
}

export function VehicleControl({ selectedVehicleId }: VehicleControlProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleDetails | null>(null)
  const [temperature, setTemperature] = useState<number>(22)
  const [isLocked, setIsLocked] = useState<boolean>(false)
  const [isEngineOn, setIsEngineOn] = useState<boolean>(false)
  const [isAcOn, setIsAcOn] = useState<boolean>(false)
  const [selectedVehicleOption, setSelectedVehicleOption] = useState<string>("")

  useEffect(() => {
    if (selectedVehicleId && vehiclesData[selectedVehicleId]) {
      const vehicle = vehiclesData[selectedVehicleId]
      setSelectedVehicle(vehicle)
      setSelectedVehicleOption(selectedVehicleId)
      setTemperature(vehicle.temperature)
      setIsLocked(vehicle.verrouille)
      setIsEngineOn(vehicle.moteurAllume)
      setIsAcOn(vehicle.climatisation)
    } else if (Object.keys(vehiclesData).length > 0) {
      setSelectedVehicleOption("")
      setSelectedVehicle(null)
    }
  }, [selectedVehicleId])

  const handleVehicleChange = (value: string) => {
    setSelectedVehicleOption(value)
    if (value && vehiclesData[value]) {
      const vehicle = vehiclesData[value]
      setSelectedVehicle(vehicle)
      setTemperature(vehicle.temperature)
      setIsLocked(vehicle.verrouille)
      setIsEngineOn(vehicle.moteurAllume)
      setIsAcOn(vehicle.climatisation)
    } else {
      setSelectedVehicle(null)
    }
  }

  const toggleLock = () => {
    setIsLocked(!isLocked)
  }

  const toggleEngine = () => {
    setIsEngineOn(!isEngineOn)
  }

  const toggleAc = () => {
    setIsAcOn(!isAcOn)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Select value={selectedVehicleOption} onValueChange={handleVehicleChange}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Sélectionner un véhicule" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(vehiclesData).map((vehicle) => (
              <SelectItem key={vehicle.id} value={vehicle.id}>
                {vehicle.immatriculation} - {vehicle.type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedVehicle && (
          <Badge
            variant={
              selectedVehicle.statut === "actif"
                ? "default"
                : selectedVehicle.statut === "maintenance"
                  ? "secondary"
                  : "outline"
            }
          >
            {selectedVehicle.statut === "actif" ? (
              <CheckCircle2 className="mr-1 h-3 w-3" />
            ) : selectedVehicle.statut === "maintenance" ? (
              <AlertTriangle className="mr-1 h-3 w-3" />
            ) : (
              <Power className="mr-1 h-3 w-3" />
            )}
            {selectedVehicle.statut.charAt(0).toUpperCase() + selectedVehicle.statut.slice(1)}
          </Badge>
        )}
      </div>

      {selectedVehicle ? (
        <Tabs defaultValue="controle" className="space-y-4">
          <TabsList>
            <TabsTrigger value="controle">Contrôle</TabsTrigger>
            <TabsTrigger value="infos">Informations</TabsTrigger>
            <TabsTrigger value="position">Position</TabsTrigger>
          </TabsList>

          <TabsContent value="controle" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contrôle du Véhicule</CardTitle>
                  <CardDescription>Contrôlez les fonctions principales du véhicule</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {isLocked ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
                      <Label htmlFor="lock-toggle">Verrouillage</Label>
                    </div>
                    <Switch id="lock-toggle" checked={isLocked} onCheckedChange={toggleLock} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Power className="h-5 w-5" />
                      <Label htmlFor="engine-toggle">Moteur</Label>
                    </div>
                    <Switch
                      id="engine-toggle"
                      checked={isEngineOn}
                      onCheckedChange={toggleEngine}
                      disabled={isLocked}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Fan className="h-5 w-5" />
                      <Label htmlFor="ac-toggle">Climatisation</Label>
                    </div>
                    <Switch
                      id="ac-toggle"
                      checked={isAcOn}
                      onCheckedChange={toggleAc}
                      disabled={!isEngineOn || isLocked}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="temp-slider">Température</Label>
                      <span className="text-sm font-medium">{temperature}°C</span>
                    </div>
                    <Slider
                      id="temp-slider"
                      min={16}
                      max={30}
                      step={1}
                      value={[temperature]}
                      onValueChange={(value) => setTemperature(value[0])}
                      disabled={!isAcOn || !isEngineOn || isLocked}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" disabled={isLocked}>
                    Appliquer les changements
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions Rapides</CardTitle>
                  <CardDescription>Commandes rapides pour le véhicule</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full mb-2" variant="outline" disabled={isLocked}>
                    Klaxonner
                  </Button>
                  <Button className="w-full mb-2" variant="outline" disabled={isLocked}>
                    Allumer les phares
                  </Button>
                  <Button className="w-full mb-2" variant="outline" disabled={isLocked || !isEngineOn}>
                    Préchauffer le véhicule
                  </Button>
                  <Button className="w-full" variant="destructive" disabled={isLocked || !isEngineOn}>
                    Arrêt d&apos;urgence
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="infos">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informations du Véhicule</CardTitle>
                  <CardDescription>Détails et statut actuel</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Immatriculation:</span>
                    <span className="text-sm">{selectedVehicle.immatriculation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Type:</span>
                    <span className="text-sm">{selectedVehicle.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Chauffeur:</span>
                    <span className="text-sm">{selectedVehicle.chauffeur}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Kilométrage:</span>
                    <span className="text-sm">{selectedVehicle.kilometrage} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Vitesse actuelle:</span>
                    <span className="text-sm">{selectedVehicle.vitesse} km/h</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>État des Systèmes</CardTitle>
                  <CardDescription>Niveaux et statuts des systèmes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <Droplets className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Carburant</span>
                      </div>
                      <span className="text-sm">{selectedVehicle.carburant}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${selectedVehicle.carburant > 60 ? "bg-green-500" : selectedVehicle.carburant > 30 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${selectedVehicle.carburant}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <BatteryFull className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Batterie</span>
                      </div>
                      <span className="text-sm">{selectedVehicle.batterie}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: `${selectedVehicle.batterie}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <Thermometer className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Température</span>
                      </div>
                      <span className="text-sm">{selectedVehicle.temperature}°C</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <Gauge className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Pression des pneus</span>
                      </div>
                      <span className="text-sm">OK</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="position">
            <Card>
              <CardHeader>
                <CardTitle>Position du Véhicule</CardTitle>
                <CardDescription>Localisation actuelle et historique</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span className="font-medium">{selectedVehicle.position.adresse}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Latitude: {selectedVehicle.position.latitude}, Longitude: {selectedVehicle.position.longitude}
                  </div>
                  <div className="w-full h-[300px] bg-gray-100 rounded-md relative">
                    <img
                      src="/placeholder.svg?height=300&width=600"
                      alt="Carte de localisation"
                      className="w-full h-full object-cover rounded-md"
                    />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      {selectedVehicle.type === "Camion" ? (
                        <Truck className="h-8 w-8 text-primary" />
                      ) : (
                        <Car className="h-8 w-8 text-primary" />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline">Itinéraire</Button>
                    <Button variant="outline">Historique des positions</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Aucun véhicule sélectionné</CardTitle>
            <CardDescription>Veuillez sélectionner un véhicule pour afficher les contrôles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <Truck className="h-16 w-16 mx-auto text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  Utilisez le sélecteur ci-dessus ou sélectionnez un véhicule depuis l&apos;onglet &quot;Véhicules&quot;
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
