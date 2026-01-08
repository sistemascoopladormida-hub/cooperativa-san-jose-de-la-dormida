# Configuración del Módulo de Clima

Este módulo muestra información meteorológica actualizada para San José de la Dormida, Córdoba, Argentina.

## API Utilizada

Se utiliza **WeatherAPI.com** (https://www.weatherapi.com/), una API actualizada y confiable que ofrece:

- Datos meteorológicos en tiempo real
- Pronóstico extendido de 7 días
- Datos horarios detallados
- Tier gratuito generoso (1 millón de requests/mes)

## Configuración

### 1. Obtener API Key

1. Visita https://www.weatherapi.com/
2. Crea una cuenta gratuita
3. Obtén tu API Key desde el dashboard

### 2. Configurar Variable de Entorno

Crea o edita el archivo `.env.local` en la raíz del proyecto y agrega:

```env
WEATHER_API_KEY=tu_api_key_aqui
```

**Importante:** No compartas tu API key públicamente. El archivo `.env.local` ya está en `.gitignore`.

### 3. Alternativas de API

Si prefieres usar otra API, puedes modificar `app/api/clima/route.ts`. Otras opciones recomendadas:

- **Meteosource** (https://www.meteosource.com/)
- **Visual Crossing** (https://www.visualcrossing.com/)
- **Open-Meteo** (https://open-meteo.com/) - Completamente gratuita y sin API key

## Características

- ✅ Clima actual con datos detallados
- ✅ Pronóstico extendido de 7 días
- ✅ Gráficos interactivos de temperatura y precipitación
- ✅ **Mapa de Radar de Precipitación** (RainViewer - gratuito, sin API key)
- ✅ **Mapa de Temperatura** con gráfico de calor
- ✅ **Mapa de Vientos** con dirección y velocidad
- ✅ Mapa de Córdoba mostrando la ubicación
- ✅ Actualización automática cada 10 minutos
- ✅ Diseño responsive y moderno
- ✅ Integración con el diseño de la cooperativa

## Mapas Disponibles

### 1. Radar de Precipitación

- **Fuente:** RainViewer (gratuito, sin API key requerida)
- Muestra precipitaciones en tiempo real
- Actualización automática cada 5 minutos
- Colores indican intensidad de lluvia

### 2. Mapa de Temperatura

- Visualización de temperatura con gráfico de calor
- Círculos de color según temperatura
- Leyenda interactiva
- Datos basados en WeatherAPI

### 3. Mapa de Vientos

- Flechas direccionales mostrando dirección del viento
- Colores según velocidad (verde: suave, naranja: moderado, rojo: fuerte)
- Múltiples marcadores en la región
- Datos en tiempo real

### 4. Mapa de Ubicación

- Mapa estándar de Córdoba
- Marcador en San José de la Dormida
- Interactivo con zoom y pan

## Ubicación

Las coordenadas están configuradas para:

- **Latitud:** -30.3544
- **Longitud:** -63.9458
- **Ubicación:** San José de la Dormida, Córdoba, Argentina

Puedes modificar estas coordenadas en `app/api/clima/route.ts` si es necesario.

## Uso

Una vez configurada la API key, la información del clima estará disponible en `/noticias#clima` (sección de clima dentro de la página de noticias) y también desde el menú de navegación.
