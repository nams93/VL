"use client"

import { Marker, Popup } from "react-leaflet"
import L from "leaflet"

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

export function ClientVehicleMarker({ vehicle }: { vehicle: Vehicle }) {
  // Obtenir la couleur en fonction du statut
  const getStatusColor = () => {
    switch (vehicle.statut) {
      case "actif":
        return "bg-green-500"
      case "inactif":
        return "bg-gray-400"
      case "maintenance":
        return "bg-amber-400"
    }
  }

  // Créer une icône personnalisée pour le marqueur
  const customIcon = L.divIcon({
    className: "",
    html: `
      <div class="flex items-center justify-center">
        <div class="h-8 w-8 rounded-full ${getStatusColor()} flex items-center justify-center shadow-md">
          ${
            vehicle.type === "Camion"
              ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><path d="M15 18H9"/><circle cx="17" cy="18" r="2"/></svg>'
              : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>'
          }
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })

  return (
    <Marker position={[vehicle.position.latitude, vehicle.position.longitude]} icon={customIcon}>
      <Popup>
        <div className="p-2">
          <div className="font-bold">{vehicle.immatriculation}</div>
          <div>{vehicle.type}</div>
          <div>{vehicle.position.adresse}</div>
          <div className="mt-2">
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                vehicle.statut === "actif"
                  ? "bg-green-100 text-green-800"
                  : vehicle.statut === "inactif"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-amber-100 text-amber-800"
              }`}
            >
              {vehicle.statut.charAt(0).toUpperCase() + vehicle.statut.slice(1)}
            </span>
          </div>
        </div>
      </Popup>
    </Marker>
  )
}
