"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, useMap, Marker, Popup, Circle } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface WindMapProps {
  lat: number
  lon: number
  windSpeed: number
  windDir: string
  windDegree: number
}

// Componente para ajustar el viewport
function MapViewport({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView([lat, lon], 9, { animate: true })
  }, [map, lat, lon])
  
  return null
}

// Crear icono de flecha de viento
function createWindArrowIcon(degree: number, speed: number): L.DivIcon {
  const arrowLength = Math.min(speed / 2, 50) // Longitud proporcional a la velocidad
  const color = speed > 30 ? "#dc2626" : speed > 20 ? "#f97316" : "#22c55e"
  
  return L.divIcon({
    className: "wind-arrow",
    html: `
      <div style="
        transform: rotate(${degree}deg);
        width: ${arrowLength}px;
        height: 2px;
        background: ${color};
        position: relative;
        margin-left: ${arrowLength / 2}px;
      ">
        <div style="
          position: absolute;
          right: -6px;
          top: -4px;
          width: 0;
          height: 0;
          border-left: 8px solid ${color};
          border-top: 4px solid transparent;
          border-bottom: 4px solid transparent;
        "></div>
      </div>
    `,
    iconSize: [arrowLength + 20, 20],
    iconAnchor: [arrowLength / 2 + 10, 10],
  })
}

export default function WindMap({ lat, lon, windSpeed, windDir, windDegree }: WindMapProps) {
  // Convertir dirección de viento a grados si es necesario
  const windDirections: Record<string, number> = {
    N: 0,
    NNE: 22.5,
    NE: 45,
    ENE: 67.5,
    E: 90,
    ESE: 112.5,
    SE: 135,
    SSE: 157.5,
    S: 180,
    SSW: 202.5,
    SW: 225,
    WSW: 247.5,
    W: 270,
    WNW: 292.5,
    NW: 315,
    NNW: 337.5,
  }
  
  const degree = windDegree || windDirections[windDir] || 0

  // Crear múltiples marcadores de viento en un área alrededor de la ubicación
  const windMarkers = [
    { lat, lon, speed: windSpeed, dir: degree, label: "San José de la Dormida" },
    { lat: lat + 0.1, lon: lon + 0.1, speed: windSpeed * 0.9, dir: degree + 10, label: "Norte" },
    { lat: lat - 0.1, lon: lon - 0.1, speed: windSpeed * 1.1, dir: degree - 10, label: "Sur" },
    { lat: lat + 0.05, lon: lon - 0.15, speed: windSpeed * 0.95, dir: degree + 5, label: "Este" },
    { lat: lat - 0.05, lon: lon + 0.15, speed: windSpeed * 1.05, dir: degree - 5, label: "Oeste" },
  ]

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border-2 border-gray-200 relative">
      <MapContainer
        center={[lat, lon]}
        zoom={9}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewport lat={lat} lon={lon} />
        
        {/* Círculo de área de viento */}
        <Circle
          center={[lat, lon]}
          radius={25000}
          pathOptions={{
            fillColor: "#3b82f6",
            fillOpacity: 0.1,
            color: "#3b82f6",
            weight: 2,
            opacity: 0.5,
          }}
        />
        
        {/* Marcadores de viento */}
        {windMarkers.map((marker, index) => (
          <Marker
            key={index}
            position={[marker.lat, marker.lon]}
            icon={createWindArrowIcon(marker.dir, marker.speed)}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-bold text-coop-green">{marker.label}</h3>
                <p className="text-lg font-bold text-blue-600">
                  {Math.round(marker.speed)} km/h
                </p>
                <p className="text-sm text-gray-600">Dirección: {windDir}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Marcador principal de ubicación */}
        <Marker position={[lat, lon]}>
          <Popup>
            <div className="text-center">
              <h3 className="font-bold text-coop-green">San José de la Dormida</h3>
              <p className="text-lg font-bold text-blue-600">
                {Math.round(windSpeed)} km/h
              </p>
              <p className="text-sm text-gray-600">Dirección: {windDir}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      
      {/* Leyenda de viento */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200 z-[1000]">
        <div className="text-sm font-semibold text-gray-900 mb-2">Mapa de Vientos</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-green-500"></div>
            <span className="text-gray-600">&lt; 20 km/h (Suave)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-orange-500"></div>
            <span className="text-gray-600">20-30 km/h (Moderado)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-red-500"></div>
            <span className="text-gray-600">&gt; 30 km/h (Fuerte)</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-600">
            <span className="font-semibold">Velocidad:</span> {Math.round(windSpeed)} km/h
          </div>
          <div className="text-xs text-gray-600">
            <span className="font-semibold">Dirección:</span> {windDir}
          </div>
        </div>
      </div>
    </div>
  )
}
