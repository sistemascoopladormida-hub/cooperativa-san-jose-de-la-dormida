"use client"

import { useEffect, useRef, useState } from "react"
import { MapContainer, TileLayer, useMap, Circle, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface WeatherRadarMapProps {
  lat: number
  lon: number
  locationName: string
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

export default function WeatherRadarMap({ lat, lon, locationName }: WeatherRadarMapProps) {
  const [radarLoaded, setRadarLoaded] = useState(false)
  const [radarTime, setRadarTime] = useState<string | null>(null)

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
      
      {/* Leyenda mejorada */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-xl border-2 border-gray-300 z-[1000] max-w-xs">
        <div className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          Radar de Precipitación
        </div>
        
        {radarLoaded ? (
          <>
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-5 h-5 rounded border-2 border-gray-300" style={{ 
                  background: "linear-gradient(to bottom, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)" 
                }}></div>
                <span className="text-gray-700 font-medium">Celeste/Azul claro - Lluvia ligera</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-5 h-5 rounded border-2 border-gray-300" style={{ 
                  background: "linear-gradient(to bottom, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)" 
                }}></div>
                <span className="text-gray-700 font-medium">Azul - Lluvia moderada</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-5 h-5 rounded border-2 border-gray-300" style={{ 
                  background: "linear-gradient(to bottom, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" 
                }}></div>
                <span className="text-gray-700 font-medium">Amarillo/Naranja - Lluvia fuerte</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-5 h-5 rounded border-2 border-gray-300 bg-red-600"></div>
                <span className="text-gray-700 font-medium">Rojo - Lluvia intensa</span>
              </div>
            </div>
            
            {radarTime && (
              <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                Última actualización: {radarTime}
              </div>
            )}
          </>
        ) : (
          <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
            Cargando datos del radar...
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
          Fuente: <a href="https://www.rainviewer.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">RainViewer</a>
        </div>
      </div>
      
      {/* Nota importante */}
      <div className="absolute top-4 right-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-3 shadow-lg z-[1000] max-w-xs">
        <div className="text-xs font-semibold text-blue-900 mb-1">⚠️ Importante</div>
        <div className="text-xs text-blue-700">
          Los colores del radar muestran la <strong>precipitación real</strong>. El verde que ves es del mapa base (campos/vegetación), no del radar.
        </div>
      </div>
    </div>
  )
}
