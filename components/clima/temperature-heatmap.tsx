"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, useMap, Circle, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface TemperatureHeatmapProps {
  lat: number
  lon: number
  currentTemp: number
  forecast: Array<{
    date: string
    maxTemp: number
    minTemp: number
    avgTemp: number
  }>
}

// Componente para ajustar el viewport
function MapViewport({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView([lat, lon], 8, { animate: true })
  }, [map, lat, lon])
  
  return null
}

// Función para obtener color según temperatura
function getTemperatureColor(temp: number): string {
  if (temp < 0) return "#1e3a8a" // Azul muy oscuro (frío extremo)
  if (temp < 10) return "#3b82f6" // Azul (frío)
  if (temp < 20) return "#22c55e" // Verde (templado)
  if (temp < 30) return "#eab308" // Amarillo (cálido)
  if (temp < 35) return "#f97316" // Naranja (caliente)
  return "#dc2626" // Rojo (muy caliente)
}

export default function TemperatureHeatmap({ lat, lon, currentTemp, forecast }: TemperatureHeatmapProps) {
  // Crear círculos de calor alrededor de la ubicación
  const heatCircles = [
    { radius: 20000, temp: currentTemp, label: "Temperatura actual" },
    { radius: 30000, temp: currentTemp + 2, label: "Área circundante" },
    { radius: 40000, temp: currentTemp - 1, label: "Región extendida" },
  ]

  // Promedio de temperatura de los próximos días para el área
  const avgForecastTemp = forecast.length > 0
    ? forecast.slice(0, 3).reduce((sum, day) => sum + day.avgTemp, 0) / Math.min(3, forecast.length)
    : currentTemp

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border-2 border-gray-200 relative">
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
        
        {/* Círculos de calor */}
        {heatCircles.map((circle, index) => (
          <Circle
            key={index}
            center={[lat, lon]}
            radius={circle.radius}
            pathOptions={{
              fillColor: getTemperatureColor(circle.temp),
              fillOpacity: 0.3 - index * 0.1,
              color: getTemperatureColor(circle.temp),
              weight: 2,
              opacity: 0.6,
            }}
          />
        ))}
        
        {/* Marcador principal */}
        <Marker position={[lat, lon]}>
          <Popup>
            <div className="text-center">
              <h3 className="font-bold text-coop-green">San José de la Dormida</h3>
              <p className="text-lg font-bold" style={{ color: getTemperatureColor(currentTemp) }}>
                {Math.round(currentTemp)}°C
              </p>
              <p className="text-sm text-gray-600">Temperatura actual</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      
      {/* Leyenda de temperatura */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200 z-[1000]">
        <div className="text-sm font-semibold text-gray-900 mb-2">Mapa de Temperatura</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: getTemperatureColor(5) }}></div>
            <span className="text-gray-600">&lt; 10°C (Frío)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: getTemperatureColor(15) }}></div>
            <span className="text-gray-600">10-20°C (Templado)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: getTemperatureColor(25) }}></div>
            <span className="text-gray-600">20-30°C (Cálido)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: getTemperatureColor(35) }}></div>
            <span className="text-gray-600">&gt; 30°C (Caliente)</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-600">
            <span className="font-semibold">Actual:</span> {Math.round(currentTemp)}°C
          </div>
          <div className="text-xs text-gray-600">
            <span className="font-semibold">Promedio 3 días:</span> {Math.round(avgForecastTemp)}°C
          </div>
        </div>
      </div>
    </div>
  )
}
