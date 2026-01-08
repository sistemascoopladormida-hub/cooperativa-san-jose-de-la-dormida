"use client"

import { useEffect, useRef, useState } from "react"
import { MapContainer, TileLayer, useMap, Circle, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import { ChevronDown, ChevronUp, Info, Sun, Cloud, CloudSun } from "lucide-react"
import "leaflet/dist/leaflet.css"

interface WeatherRadarMapProps {
  lat: number
  lon: number
  locationName: string
  currentCondition?: string
  cloud?: number
  uv?: number
  condition?: string
}

// Componente para ajustar el viewport
function MapViewport({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView([lat, lon], 9, { animate: true })
  }, [map, lat, lon])
  
  return null
}

// Componente para el radar de RainViewer
function RainViewerLayer({ 
  onRadarLoad, 
  onRadarTime 
}: { 
  onRadarLoad: (loaded: boolean) => void
  onRadarTime: (time: string | null) => void
}) {
  const map = useMap()
  const layerRef = useRef<L.TileLayer | null>(null)

  useEffect(() => {
    let isMounted = true
    
    // RainViewer API - obtener frames disponibles
    const fetchRadarFrames = async () => {
      try {
        const response = await fetch("https://api.rainviewer.com/public/weather-maps.json", {
          cache: "no-store",
        })
        const data = await response.json()
        
        if (isMounted && data && data.radar && data.radar.past && data.radar.past.length > 0) {
          // Usar el frame más reciente
          const latestFrame = data.radar.past[data.radar.past.length - 1]
          // Usar esquema de colores 1 (estándar) con mejor opacidad
          // Esquema 1: azul claro, azul, amarillo, naranja, rojo
          const radarUrl = `https://tilecache.rainviewer.com/v2/radar/${latestFrame.time}/256/{z}/{x}/{y}/1/1_1.png`
          
          // Remover capa anterior si existe
          if (layerRef.current) {
            map.removeLayer(layerRef.current)
          }
          
          // Agregar nueva capa de radar con mayor opacidad
          const radarLayer = L.tileLayer(radarUrl, {
            opacity: 0.85, // Mayor opacidad para que se vea mejor
            zIndex: 1000,
            attribution: 'Radar: <a href="https://www.rainviewer.com">RainViewer</a>',
          })
          
          radarLayer.addTo(map)
          layerRef.current = radarLayer
          
          // Convertir timestamp a hora legible
          const date = new Date(latestFrame.time * 1000)
          const timeString = date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
          onRadarTime(timeString)
          onRadarLoad(true)
        } else {
          onRadarLoad(false)
          onRadarTime(null)
        }
      } catch (error) {
        console.error("Error cargando radar:", error)
        onRadarLoad(false)
        onRadarTime(null)
      }
    }

    fetchRadarFrames()
    
    // Actualizar cada 5 minutos
    const interval = setInterval(fetchRadarFrames, 300000)
    
    return () => {
      isMounted = false
      clearInterval(interval)
      if (layerRef.current) {
        map.removeLayer(layerRef.current)
      }
    }
  }, [map, onRadarLoad, onRadarTime])

  return null
}

export default function WeatherRadarMap({ 
  lat, 
  lon, 
  locationName,
  currentCondition,
  cloud = 0,
  uv = 0,
  condition = ""
}: WeatherRadarMapProps) {
  const [radarLoaded, setRadarLoaded] = useState(false)
  const [radarTime, setRadarTime] = useState<string | null>(null)
  const [isLegendOpen, setIsLegendOpen] = useState(false)

  // Determinar intensidad del sol basado en nubosidad y UV
  const getSunIntensity = () => {
    if (cloud >= 75) return { level: "Nublado", icon: Cloud, color: "text-gray-600", bgColor: "bg-gray-100" }
    if (cloud >= 50) return { level: "Parcialmente nublado", icon: CloudSun, color: "text-yellow-600", bgColor: "bg-yellow-50" }
    if (uv >= 8) return { level: "Sol intenso", icon: Sun, color: "text-orange-600", bgColor: "bg-orange-50" }
    if (uv >= 5) return { level: "Sol moderado", icon: Sun, color: "text-yellow-600", bgColor: "bg-yellow-50" }
    if (cloud < 25) return { level: "Soleado", icon: Sun, color: "text-yellow-500", bgColor: "bg-yellow-50" }
    return { level: "Parcialmente soleado", icon: CloudSun, color: "text-yellow-500", bgColor: "bg-yellow-50" }
  }

  const sunInfo = getSunIntensity()
  const SunIcon = sunInfo.icon

  // Crear icono personalizado para la ubicación (blanco con borde)
  const locationIcon = L.divIcon({
    className: "location-marker",
    html: `<div style="
      width: 20px;
      height: 20px;
      background: white;
      border: 3px solid #3b82f6;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border-2 border-gray-200 relative">
      <MapContainer
        center={[lat, lon]}
        zoom={9}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        {/* Mapa base en escala de grises para mejor visualización del radar */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Radar: <a href="https://www.rainviewer.com">RainViewer</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          opacity={0.4}
        />
        <MapViewport lat={lat} lon={lon} />
        <RainViewerLayer 
          onRadarLoad={setRadarLoaded} 
          onRadarTime={setRadarTime}
        />
        
        {/* Marcador de ubicación - cambiado a azul/blanco para no confundir */}
        <Marker position={[lat, lon]} icon={locationIcon}>
          <Popup>
            <div className="text-center">
              <h3 className="font-bold text-coop-green">{locationName}</h3>
              <p className="text-sm text-gray-600">San José de la Dormida</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      
      {/* Leyenda - Colapsable en mobile, siempre visible en desktop */}
      <div className="absolute bottom-4 left-4 z-[1000] max-w-xs lg:max-w-sm">
        {/* Botón para mostrar/ocultar en mobile */}
        <button
          onClick={() => setIsLegendOpen(!isLegendOpen)}
          className="lg:hidden w-full bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-xl border-2 border-gray-300 flex items-center justify-between gap-2 hover:bg-white transition-colors"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-gray-900">Leyenda del Radar</span>
          </div>
          {isLegendOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {/* Contenido de la leyenda */}
        <div
          className={`${
            isLegendOpen ? "block" : "hidden"
          } lg:block bg-white/95 backdrop-blur-sm rounded-lg p-2.5 lg:p-4 shadow-xl border-2 border-gray-300 mt-2 lg:mt-0`}
        >
          <div className="text-xs lg:text-sm font-bold text-gray-900 mb-2 lg:mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>Radar de Precipitación</span>
          </div>
          
          {radarLoaded ? (
            <>
              {/* Información sobre condiciones actuales (Sol/Nubes) */}
              <div className={`mb-2 lg:mb-3 p-2 rounded-lg ${sunInfo.bgColor} border border-gray-200`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <SunIcon className={`w-3.5 h-3.5 lg:w-4 lg:h-4 ${sunInfo.color} flex-shrink-0`} />
                  <span className={`text-[10px] lg:text-xs font-bold ${sunInfo.color}`}>
                    Condición: {sunInfo.level}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 lg:gap-3 text-[9px] lg:text-[10px] text-gray-600 mt-1">
                  {cloud !== undefined && cloud >= 0 && (
                    <span className="flex items-center gap-1">
                      <Cloud className="w-3 h-3" />
                      Nubosidad: {cloud}%
                    </span>
                  )}
                  {uv !== undefined && uv > 0 && (
                    <span className="flex items-center gap-1">
                      <Sun className="w-3 h-3 text-yellow-600" />
                      UV: {uv} {uv >= 8 ? "(Muy alto)" : uv >= 5 ? "(Moderado)" : "(Bajo)"}
                    </span>
                  )}
                </div>
              </div>

              {/* Leyenda de Precipitación */}
              <div className="space-y-1.5 lg:space-y-2 mb-2 lg:mb-3">
                <div className="text-[9px] lg:text-[10px] font-semibold text-gray-500 mb-1">
                  Precipitación:
                </div>
                <div className="flex items-center gap-2 text-[10px] lg:text-xs">
                  <div className="w-4 h-4 lg:w-5 lg:h-5 rounded border border-gray-300 flex-shrink-0" style={{ 
                    background: "linear-gradient(to bottom, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)" 
                  }}></div>
                  <span className="text-gray-700 font-medium">Celeste/Azul - Lluvia ligera</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] lg:text-xs">
                  <div className="w-4 h-4 lg:w-5 lg:h-5 rounded border border-gray-300 flex-shrink-0" style={{ 
                    background: "linear-gradient(to bottom, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)" 
                  }}></div>
                  <span className="text-gray-700 font-medium">Azul oscuro - Lluvia moderada</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] lg:text-xs">
                  <div className="w-4 h-4 lg:w-5 lg:h-5 rounded border border-gray-300 flex-shrink-0" style={{ 
                    background: "linear-gradient(to bottom, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" 
                  }}></div>
                  <span className="text-gray-700 font-medium">Amarillo/Naranja - Lluvia fuerte</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] lg:text-xs">
                  <div className="w-4 h-4 lg:w-5 lg:h-5 rounded border border-gray-300 bg-red-600 flex-shrink-0"></div>
                  <span className="text-gray-700 font-medium">Rojo - Lluvia intensa</span>
                </div>
              </div>

              {/* Nota sobre días soleados */}
              {cloud < 50 && (
                <div className="mb-2 lg:mb-3 p-2 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <Sun className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-yellow-600 flex-shrink-0 mt-0.5 animate-pulse" />
                    <div className="text-[9px] lg:text-[10px] text-yellow-900 leading-relaxed">
                      <span className="font-bold">Condición Soleada:</span> El radar solo muestra <strong>precipitaciones</strong>. 
                      Si no ves colores azules/rojos en el mapa, significa que <strong className="text-orange-700">no hay lluvia</strong> y las condiciones son soleadas o parcialmente nubladas.
                      {uv >= 5 && (
                        <span className="block mt-1 text-orange-700 font-semibold">
                          ⚠️ Índice UV {uv}: Protégete del sol
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {radarTime && (
                <div className="text-[10px] lg:text-xs text-gray-500 pt-1.5 lg:pt-2 border-t border-gray-200">
                  Actualización: {radarTime}
                </div>
              )}
            </>
          ) : (
            <div className="text-[10px] lg:text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
              Cargando datos del radar...
            </div>
          )}
          
          <div className="text-[10px] lg:text-xs text-gray-500 mt-1.5 lg:mt-2 pt-1.5 lg:pt-2 border-t border-gray-200">
            Fuente: <a href="https://www.rainviewer.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">RainViewer</a>
          </div>
        </div>
      </div>
    </div>
  )
}
