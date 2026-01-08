"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Cloud,
  Droplets,
  Wind,
  Sun,
  Thermometer,
  Gauge,
  Eye,
  RefreshCw,
  MapPin,
  Calendar,
  CloudRain,
  Sun as SunIcon,
  Cloudy,
} from "lucide-react"
import dynamic from "next/dynamic"
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

// Importar los mapas dinámicamente para evitar problemas de SSR
const WeatherMap = dynamic(() => import("@/components/clima/weather-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
      <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
    </div>
  ),
})

const WeatherRadarMap = dynamic(() => import("@/components/clima/weather-radar-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
      <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
    </div>
  ),
})

const TemperatureHeatmap = dynamic(() => import("@/components/clima/temperature-heatmap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
      <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
    </div>
  ),
})

const WindMap = dynamic(() => import("@/components/clima/wind-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
      <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
    </div>
  ),
})

interface WeatherData {
  location: {
    name: string
    region: string
    country: string
    lat: number
    lon: number
    localtime: string
  }
  current: {
    temp: number
    feelsLike: number
    condition: string
    icon: string
    humidity: number
    windSpeed: number
    windDir: string
    windDegree: number
    pressure: number
    precip: number
    cloud: number
    uv: number
    visibility: number
  }
  forecast: Array<{
    date: string
    dateEpoch: number
    maxTemp: number
    minTemp: number
    avgTemp: number
    condition: string
    icon: string
    chanceOfRain: number
    totalPrecip: number
    maxWind: number
    avgHumidity: number
    uv: number
    hours: Array<{
      time: string
      timeEpoch: number
      temp: number
      condition: string
      icon: string
      chanceOfRain: number
      precip: number
      humidity: number
      windSpeed: number
    }>
  }>
}

interface WeatherModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getWeatherIcon(condition: string): React.ComponentType<{ className?: string }> {
  const lowerCondition = condition.toLowerCase()
  if (lowerCondition.includes("sol") || lowerCondition.includes("clear")) return SunIcon
  if (lowerCondition.includes("lluvia") || lowerCondition.includes("rain")) return CloudRain
  if (lowerCondition.includes("nublado") || lowerCondition.includes("cloud")) return Cloudy
  return Cloud
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`
}

function formatTime(timeString: string): string {
  const date = new Date(timeString)
  return date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
}

export default function WeatherModal({ open, onOpenChange }: WeatherModalProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchWeatherData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/clima")
      if (!response.ok) {
        throw new Error("Error al obtener datos del clima")
      }
      const data = await response.json()
      setWeatherData(data)
      setLastUpdate(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      console.error("Error fetching weather:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchWeatherData()
      // Actualizar cada 10 minutos
      const interval = setInterval(fetchWeatherData, 600000)
      return () => clearInterval(interval)
    }
  }, [open])

  // Preparar datos para gráficos
  const temperatureData = weatherData?.forecast.map((day) => ({
    date: formatDate(day.date),
    max: Math.round(day.maxTemp),
    min: Math.round(day.minTemp),
    avg: Math.round(day.avgTemp),
  })) || []

  const precipitationData = weatherData?.forecast.map((day) => ({
    date: formatDate(day.date),
    precipitacion: day.totalPrecip.toFixed(1),
    probabilidad: day.chanceOfRain,
  })) || []

  // Datos horarios para el día actual (próximas 24 horas)
  const hourlyData = weatherData?.forecast[0]?.hours
    .slice(0, 24)
    .map((hour) => ({
      hora: formatTime(hour.time),
      temperatura: Math.round(hour.temp),
      precipitacion: hour.precip,
      humedad: hour.humidity,
    })) || []

  const CurrentWeatherIcon = weatherData ? getWeatherIcon(weatherData.current.condition) : Cloud

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] w-full p-0 overflow-hidden flex flex-col !top-4 sm:!top-[50%] !translate-y-0 sm:!translate-y-[-50%] rounded-t-2xl sm:rounded-lg [&_.absolute]:!top-12 [&_.absolute]:sm:!top-4 [&_.absolute]:!z-[60]">
        <DialogHeader className="px-6 pt-16 sm:pt-6 pb-4 border-b relative">
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-2">
              <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2 sm:gap-3">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-coop-green flex-shrink-0" />
                <span>Clima en San José de la Dormida</span>
              </DialogTitle>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Córdoba, Argentina</p>
              {lastUpdate && (
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  Última actualización: {lastUpdate.toLocaleTimeString("es-AR")}
                </p>
              )}
            </div>
            <Button
              onClick={fetchWeatherData}
              disabled={loading}
              variant="outline"
              size="sm"
              className="hidden sm:flex flex-shrink-0"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>
          {/* Botón de actualizar para móvil - dentro del header */}
          <Button
            onClick={fetchWeatherData}
            disabled={loading}
            variant="outline"
            size="sm"
            className="sm:hidden mt-4 w-full"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && !weatherData ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center space-y-4">
                <RefreshCw className="w-12 h-12 text-coop-green animate-spin mx-auto" />
                <p className="text-gray-600">Cargando datos del clima...</p>
              </div>
            </div>
          ) : error && !weatherData ? (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-red-600">Error al cargar el clima</CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={fetchWeatherData} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reintentar
                </Button>
              </CardContent>
            </Card>
          ) : weatherData ? (
            <div className="space-y-6">
              {/* Clima Actual */}
              <Card className="border-2 border-coop-green/20 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-coop-blue/10 via-coop-purple/10 to-coop-green/10">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <CurrentWeatherIcon className="w-5 h-5 text-coop-green" />
                    Clima Actual
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Temperatura Principal */}
                    <div className="md:col-span-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-4 mb-4">
                            <img
                              src={weatherData.current.icon.replace("//cdn.weatherapi.com", "https://cdn.weatherapi.com")}
                              alt={weatherData.current.condition}
                              className="w-20 h-20 lg:w-24 lg:h-24"
                            />
                            <div>
                              <div className="text-5xl lg:text-6xl font-bold text-gray-900">
                                {Math.round(weatherData.current.temp)}°
                              </div>
                              <div className="text-lg lg:text-xl text-gray-600 mt-2">
                                {weatherData.current.condition}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                Sensación térmica: {Math.round(weatherData.current.feelsLike)}°
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detalles */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Droplets className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                          <span className="text-sm font-medium">Humedad</span>
                        </div>
                        <span className="font-bold text-gray-900">{weatherData.current.humidity}%</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Wind className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
                          <span className="text-sm font-medium">Viento</span>
                        </div>
                        <span className="font-bold text-gray-900 text-sm">
                          {Math.round(weatherData.current.windSpeed)} km/h {weatherData.current.windDir}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Gauge className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
                          <span className="text-sm font-medium">Presión</span>
                        </div>
                        <span className="font-bold text-gray-900">{weatherData.current.pressure} mb</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Eye className="w-4 h-4 lg:w-5 lg:h-5 text-orange-600" />
                          <span className="text-sm font-medium">Visibilidad</span>
                        </div>
                        <span className="font-bold text-gray-900">{weatherData.current.visibility} km</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Sun className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-600" />
                          <span className="text-sm font-medium">Índice UV</span>
                        </div>
                        <span className="font-bold text-gray-900">{weatherData.current.uv}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs para Pronóstico, Gráficos y Mapas */}
              <Tabs defaultValue="pronostico" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-4 gap-2 lg:gap-1 p-1.5 lg:p-1">
                  <TabsTrigger 
                    value="pronostico"
                    className="px-3 py-2 lg:py-1.5 text-xs lg:text-sm font-medium"
                  >
                    Pronóstico
                  </TabsTrigger>
                  <TabsTrigger 
                    value="graficos"
                    className="px-3 py-2 lg:py-1.5 text-xs lg:text-sm font-medium"
                  >
                    Gráficos
                  </TabsTrigger>
                  <TabsTrigger 
                    value="mapas"
                    className="px-3 py-2 lg:py-1.5 text-xs lg:text-sm font-medium"
                  >
                    Mapas
                  </TabsTrigger>
                  <TabsTrigger 
                    value="radar"
                    className="px-3 py-2 lg:py-1.5 text-xs lg:text-sm font-medium"
                  >
                    Radar
                  </TabsTrigger>
                </TabsList>

                {/* Pronóstico de 7 días */}
                <TabsContent value="pronostico" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-coop-green" />
                        Pronóstico Extendido
                      </CardTitle>
                      <CardDescription>Pronóstico para los próximos 7 días</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 lg:gap-4">
                        {weatherData.forecast.slice(0, 7).map((day, index) => {
                          const DayIcon = getWeatherIcon(day.condition)
                          return (
                            <Card key={day.date} className="border-2 border-gray-200 hover:border-coop-green/40 transition-all">
                              <CardContent className="pt-4 pb-4">
                                <div className="text-center space-y-2">
                                  <div className="font-semibold text-sm text-gray-900">
                                    {index === 0 ? "Hoy" : formatDate(day.date)}
                                  </div>
                                  <img
                                    src={day.icon.replace("//cdn.weatherapi.com", "https://cdn.weatherapi.com")}
                                    alt={day.condition}
                                    className="w-12 h-12 lg:w-16 lg:h-16 mx-auto"
                                  />
                                  <div className="text-xs text-gray-600">{day.condition}</div>
                                  <div className="flex items-center justify-center gap-1">
                                    <span className="text-lg font-bold text-gray-900">
                                      {Math.round(day.maxTemp)}°
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      / {Math.round(day.minTemp)}°
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <Droplets className="w-3 h-3" />
                                      {day.chanceOfRain}%
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Gráficos */}
                <TabsContent value="graficos" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Thermometer className="w-5 h-5 text-coop-green" />
                        Temperaturas
                      </CardTitle>
                      <CardDescription>Evolución de temperaturas máximas, mínimas y promedio</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={temperatureData}>
                          <defs>
                            <linearGradient id="colorMaxModal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorMinModal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="max"
                            stroke="#f97316"
                            fillOpacity={1}
                            fill="url(#colorMaxModal)"
                            name="Máxima"
                          />
                          <Area
                            type="monotone"
                            dataKey="avg"
                            stroke="#22c55e"
                            fillOpacity={1}
                            fill="#22c55e"
                            name="Promedio"
                          />
                          <Area
                            type="monotone"
                            dataKey="min"
                            stroke="#3b82f6"
                            fillOpacity={1}
                            fill="url(#colorMinModal)"
                            name="Mínima"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CloudRain className="w-5 h-5 text-coop-green" />
                        Precipitaciones
                      </CardTitle>
                      <CardDescription>Precipitación esperada y probabilidad de lluvia</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={precipitationData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Bar yAxisId="left" dataKey="precipitacion" fill="#3b82f6" name="Precipitación (mm)" />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="probabilidad"
                            stroke="#ef4444"
                            strokeWidth={2}
                            name="Probabilidad (%)"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Thermometer className="w-5 h-5 text-coop-green" />
                        Pronóstico Horario (24h)
                      </CardTitle>
                      <CardDescription>Temperatura y condiciones hora por hora</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={hourlyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="hora" />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="temperatura"
                            stroke="#f97316"
                            strokeWidth={2}
                            name="Temperatura (°C)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Mapas Interactivos */}
                <TabsContent value="mapas" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-coop-green" />
                        Ubicación en Córdoba
                      </CardTitle>
                      <CardDescription>
                        Mapa de la provincia de Córdoba mostrando la ubicación de San José de la Dormida
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <WeatherMap
                        lat={weatherData.location.lat}
                        lon={weatherData.location.lon}
                        locationName={weatherData.location.name}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Thermometer className="w-5 h-5 text-coop-green" />
                        Mapa de Temperatura
                      </CardTitle>
                      <CardDescription>
                        Visualización de temperatura en la región con gráfico de calor
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TemperatureHeatmap
                        lat={weatherData.location.lat}
                        lon={weatherData.location.lon}
                        currentTemp={weatherData.current.temp}
                        forecast={weatherData.forecast}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wind className="w-5 h-5 text-coop-green" />
                        Mapa de Vientos
                      </CardTitle>
                      <CardDescription>
                        Dirección y velocidad del viento en la región
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <WindMap
                        lat={weatherData.location.lat}
                        lon={weatherData.location.lon}
                        windSpeed={weatherData.current.windSpeed}
                        windDir={weatherData.current.windDir}
                        windDegree={weatherData.current.windDegree}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Radar de Precipitación */}
                <TabsContent value="radar" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CloudRain className="w-5 h-5 text-coop-green" />
                        Radar de Precipitación
                      </CardTitle>
                      <CardDescription>
                        Mapa de radar en tiempo real mostrando precipitaciones y condiciones meteorológicas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <WeatherRadarMap
                        lat={weatherData.location.lat}
                        lon={weatherData.location.lon}
                        locationName={weatherData.location.name}
                        currentCondition={weatherData.current.condition}
                        cloud={weatherData.current.cloud}
                        uv={weatherData.current.uv}
                        condition={weatherData.current.condition}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
