"use client"

import { useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix para los iconos de Leaflet en Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

interface WeatherMapProps {
  lat: number
  lon: number
  locationName: string
}

// Componente para ajustar el viewport del mapa
function MapViewport({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView([lat, lon], 8, { animate: true })
  }, [map, lat, lon])
  
  return null
}

export default function WeatherMap({ lat, lon, locationName }: WeatherMapProps) {
  // Crear un icono personalizado
  const customIcon = L.icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border-2 border-gray-200">
      <MapContainer
        center={[lat, lon]}
        zoom={8}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewport lat={lat} lon={lon} />
        <Marker position={[lat, lon]} icon={customIcon}>
          <Popup>
            <div className="text-center">
              <h3 className="font-bold text-coop-green">{locationName}</h3>
              <p className="text-sm text-gray-600">San José de la Dormida</p>
              <p className="text-sm text-gray-600">Córdoba, Argentina</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
