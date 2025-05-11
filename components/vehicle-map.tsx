"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Truck, Car, AlertTriangle, MapPin, Layers, Navigation, Search } from "lucide-react"
import dynamic from "next/dynamic"

// Import dynamique de react-leaflet pour éviter les erreurs SSR
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })
const ZoomControl = dynamic(() => import("react-leaflet").then((mod) => mod.ZoomControl), { ssr: false })

// Importer L de manière dynamique pour éviter les erreurs SSR
const LeafletIcon = dynamic(() => import("./leaflet-icon").then((mod) => mod.LeafletIcon), { ssr: false })

type Vehicle = {
  id: string
  immatriculation: string
  type: "Camion" | "Voiture" | "Camionnette"
  statut: "actif" | "inactif" | "maintenance"
  position: {
    latitude: number
    longitude: number
    adresse: string
  }
}

const vehicles: Vehicle[] = [
  {
    id: "v1",
    immatriculation: "AB-123-CD",
    type: "Camion",
    statut: "actif",
    position: {
      latitude: 48.8566,
      longitude: 2.3522,
      adresse: "Avenue des Champs-Élysées, Paris",
    },
  },
  {
    id: "v2",
    immatriculation: "EF-456-GH",
    type: "Voiture",
    statut: "actif",
    position: {
      latitude: 45.764,
      longitude: 4.8357,
      adresse: "Rue de la République, Lyon",
    },
  },
  {
    id: "v3",
    immatriculation: "IJ-789-KL",
    type: "Camionnette",
    statut: "maintenance",
    position: {
      latitude: 43.2965,
      longitude: 5.3698,
      adresse: "Vieux Port, Marseille",
    },
  },
  {
    id: "v4",
    immatriculation: "MN-012-OP",
    type: "Camion",
    statut: "inactif",
    position: {
      latitude: 47.2184,
      longitude: -1.5536,
      adresse: "Place du Commerce, Nantes",
    },
  },
  {
    id: "v5",
    immatriculation: "QR-345-ST",
    type: "Voiture",
    statut: "actif",
    position: {
      latitude: 43.6045,
      longitude: 1.4442,
      adresse: "Place du Capitole, Toulouse",
    },
  },
]

// Définition des types de carte disponibles
const mapTypes = [
  { id: "streets", name: "Rues", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" },
  {
    id: "satellite",
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  },
  { id: "topo", name: "Topographique", url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" },
  { id: "dark", name: "Sombre", url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png" },
  { id: "light", name: "Clair", url: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png" },
]

export function VehicleMap() {
  const [isClient, setIsClient] = useState(false)
  const [mapType, setMapType] = useState(mapTypes[0])
  const [filters, setFilters] = useState({
    showTrucks: true,
    showCars: true,
    showActive: true,
    showInactive: true,
    showMaintenance: true,
  })

  // Vérifier si nous sommes côté client pour éviter les erreurs SSR
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Filtrer les véhicules en fonction des filtres actifs
  const filteredVehicles = vehicles.filter((vehicle) => {
    if (vehicle.type === "Camion" && !filters.showTrucks) return false
    if ((vehicle.type === "Voiture" || vehicle.type === "Camionnette") && !filters.showCars) return false
    if (vehicle.statut === "actif" && !filters.showActive) return false
    if (vehicle.statut === "inactif" && !filters.showInactive) return false
    if (vehicle.statut === "maintenance" && !filters.showMaintenance) return false
    return true
  })

  // Gérer les changements de filtres
  const handleFilterChange = (filterName: keyof typeof filters) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: !prev[filterName],
    }))
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
      <Card className="md:col-span-3">
        <CardHeader className="pb-0">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Carte des Véhicules</CardTitle>
              <CardDescription>Localisation en temps réel de tous les véhicules</CardDescription>
            </div>
            <div className="flex space-x-2">
              <DropdownMapStyle currentMapType={mapType} mapTypes={mapTypes} onChangeMapType={setMapType} />
              <Button variant="outline" size="sm" className="hidden md:flex">
                <Search className="h-4 w-4 mr-2" />
                Rechercher une zone
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          <div className="relative w-full h-[500px] overflow-hidden rounded-b-lg">
            {!isClient ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {/* Importer le CSS de Leaflet */}
                <link
                  rel="stylesheet"
                  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                  integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                  crossOrigin=""
                />

                <MapContainer
                  center={[46.2276, 2.3522]} // Centre de la France
                  zoom={5}
                  style={{ height: "100%", width: "100%" }}
                  zoomControl={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url={mapType.url}
                  />
                  <ZoomControl position="topright" />

                  {filteredVehicles.map((vehicle) => (
                    <ClientVehicleMarker key={vehicle.id} vehicle={vehicle} />
                  ))}
                </MapContainer>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Légende</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center">
                <Truck className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">Camion</span>
              </div>
              <div className="flex items-center">
                <Car className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">Voiture/Camionnette</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm">Actif</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-gray-400 mr-2"></div>
                <span className="text-sm">Inactif</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-amber-400 mr-2"></div>
                <span className="text-sm">Maintenance</span>
              </div>
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                <span className="text-sm">Alerte</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show-trucks"
                  className="mr-2"
                  checked={filters.showTrucks}
                  onChange={() => handleFilterChange("showTrucks")}
                />
                <label htmlFor="show-trucks" className="text-sm">
                  Afficher les camions
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show-cars"
                  className="mr-2"
                  checked={filters.showCars}
                  onChange={() => handleFilterChange("showCars")}
                />
                <label htmlFor="show-cars" className="text-sm">
                  Afficher les voitures
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show-active"
                  className="mr-2"
                  checked={filters.showActive}
                  onChange={() => handleFilterChange("showActive")}
                />
                <label htmlFor="show-active" className="text-sm">
                  Véhicules actifs
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show-inactive"
                  className="mr-2"
                  checked={filters.showInactive}
                  onChange={() => handleFilterChange("showInactive")}
                />
                <label htmlFor="show-inactive" className="text-sm">
                  Véhicules inactifs
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show-maintenance"
                  className="mr-2"
                  checked={filters.showMaintenance}
                  onChange={() => handleFilterChange("showMaintenance")}
                />
                <label htmlFor="show-maintenance" className="text-sm">
                  Véhicules en maintenance
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                <MapPin className="h-4 w-4 mr-2" />
                Centrer sur ma position
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <Navigation className="h-4 w-4 mr-2" />
                Suivre tous les véhicules
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Composant pour le menu déroulant des styles de carte
function DropdownMapStyle({
  currentMapType,
  mapTypes,
  onChangeMapType,
}: {
  currentMapType: { id: string; name: string; url: string }
  mapTypes: Array<{ id: string; name: string; url: string }>
  onChangeMapType: (mapType: { id: string; name: string; url: string }) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)} className="flex items-center">
        <Layers className="h-4 w-4 mr-2" />
        {currentMapType.name}
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border">
          <div className="py-1">
            {mapTypes.map((type) => (
              <button
                key={type.id}
                className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${
                  currentMapType.id === type.id ? "bg-gray-100 font-medium" : ""
                }`}
                onClick={() => {
                  onChangeMapType(type)
                  setIsOpen(false)
                }}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Composant pour les marqueurs de véhicules côté client
const ClientVehicleMarker = dynamic(() => import("./client-vehicle-marker").then((mod) => mod.ClientVehicleMarker), {
  ssr: false,
  loading: () => <div>Chargement...</div>,
})
