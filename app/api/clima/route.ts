import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

// Coordenadas de San José de la Dormida, Córdoba, Argentina
const LATITUD = -30.3544
const LONGITUD = -63.9458

interface WeatherAPIResponse {
  location: {
    name: string
    region: string
    country: string
    lat: number
    lon: number
    tz_id: string
    localtime: string
  }
  current: {
    temp_c: number
    temp_f: number
    condition: {
      text: string
      icon: string
      code: number
    }
    wind_mph: number
    wind_kph: number
    wind_degree: number
    wind_dir: string
    pressure_mb: number
    pressure_in: number
    precip_mm: number
    precip_in: number
    humidity: number
    cloud: number
    feelslike_c: number
    feelslike_f: number
    vis_km: number
    vis_miles: number
    uv: number
    gust_mph: number
    gust_kph: number
  }
  forecast: {
    forecastday: Array<{
      date: string
      date_epoch: number
      day: {
        maxtemp_c: number
        maxtemp_f: number
        mintemp_c: number
        mintemp_f: number
        avgtemp_c: number
        avgtemp_f: number
        maxwind_mph: number
        maxwind_kph: number
        totalprecip_mm: number
        totalprecip_in: number
        totalsnow_cm: number
        avgvis_km: number
        avgvis_miles: number
        avghumidity: number
        daily_will_it_rain: number
        daily_chance_of_rain: number
        daily_will_it_snow: number
        daily_chance_of_snow: number
        condition: {
          text: string
          icon: string
          code: number
        }
        uv: number
      }
      hour: Array<{
        time_epoch: number
        time: string
        temp_c: number
        temp_f: number
        condition: {
          text: string
          icon: string
          code: number
        }
        wind_mph: number
        wind_kph: number
        wind_degree: number
        wind_dir: string
        pressure_mb: number
        pressure_in: number
        precip_mm: number
        precip_in: number
        humidity: number
        cloud: number
        feelslike_c: number
        feelslike_f: number
        windchill_c: number
        windchill_f: number
        heatindex_c: number
        heatindex_f: number
        dewpoint_c: number
        dewpoint_f: number
        will_it_rain: number
        chance_of_rain: number
        will_it_snow: number
        chance_of_snow: number
        vis_km: number
        vis_miles: number
        gust_mph: number
        gust_kph: number
        uv: number
      }>
    }>
  }
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.WEATHER_API_KEY

    if (!apiKey) {
      console.error("WEATHER_API_KEY no está configurada")
      return NextResponse.json(
        { error: "API key de clima no configurada" },
        { status: 500 }
      )
    }

    // Obtener datos actuales y pronóstico de 7 días
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${LATITUD},${LONGITUD}&days=7&lang=es&aqi=no&alerts=no`

    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache por 5 minutos
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error de WeatherAPI:", response.status, errorText)
      return NextResponse.json(
        { error: "Error al obtener datos del clima" },
        { status: response.status }
      )
    }

    const data: WeatherAPIResponse = await response.json()

    // Formatear datos para el frontend
    const formattedData = {
      location: {
        name: data.location.name,
        region: data.location.region,
        country: data.location.country,
        lat: data.location.lat,
        lon: data.location.lon,
        localtime: data.location.localtime,
      },
      current: {
        temp: data.current.temp_c,
        feelsLike: data.current.feelslike_c,
        condition: data.current.condition.text,
        icon: data.current.condition.icon,
        humidity: data.current.humidity,
        windSpeed: data.current.wind_kph,
        windDir: data.current.wind_dir,
        windDegree: data.current.wind_degree,
        pressure: data.current.pressure_mb,
        precip: data.current.precip_mm,
        cloud: data.current.cloud,
        uv: data.current.uv,
        visibility: data.current.vis_km,
      },
      forecast: data.forecast.forecastday.map((day) => ({
        date: day.date,
        dateEpoch: day.date_epoch,
        maxTemp: day.day.maxtemp_c,
        minTemp: day.day.mintemp_c,
        avgTemp: day.day.avgtemp_c,
        condition: day.day.condition.text,
        icon: day.day.condition.icon,
        chanceOfRain: day.day.daily_chance_of_rain,
        totalPrecip: day.day.totalprecip_mm,
        maxWind: day.day.maxwind_kph,
        avgHumidity: day.day.avghumidity,
        uv: day.day.uv,
        hours: day.hour.map((hour) => ({
          time: hour.time,
          timeEpoch: hour.time_epoch,
          temp: hour.temp_c,
          condition: hour.condition.text,
          icon: hour.condition.icon,
          chanceOfRain: hour.chance_of_rain,
          precip: hour.precip_mm,
          humidity: hour.humidity,
          windSpeed: hour.wind_kph,
        })),
      })),
    }

    return NextResponse.json(formattedData, { status: 200 })
  } catch (error) {
    console.error("Error en /api/clima:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
