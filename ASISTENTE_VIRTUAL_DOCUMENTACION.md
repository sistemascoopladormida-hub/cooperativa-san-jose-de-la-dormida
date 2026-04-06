# Asistente Virtual - Documentacion Tecnica Completa

## Objetivo del sistema

El asistente virtual de Cooperativa La Dormida opera en dos canales:

- **Chatbot web** (widget en la web).
- **Chatbot de WhatsApp** (webhook de Meta WhatsApp Cloud API).

Su objetivo principal es:

- Responder consultas generales (servicios, horarios, contacto, etc.).
- Detectar y procesar solicitudes de factura.
- Buscar facturas en Google Drive.
- Entregar facturas al usuario (PDF en WhatsApp o link de descarga en web).
- Registrar historial de conversaciones y solicitudes en Supabase.

---

## Vista general de arquitectura

```mermaid
flowchart LR
  A[Usuario Web] --> B[components/chatbot.tsx]
  B --> C[POST /api/chat]
  C --> D[lib/invoice-detector.ts]
  C --> E[lib/drive.ts]
  C --> F[OpenAI via lib/chatbot.ts]
  C --> G[lib/conversations.ts]
  C --> H[lib/invoices.ts]
  C --> I[GET /api/chat/invoice]

  J[Usuario WhatsApp] --> K[Meta WhatsApp Cloud API]
  K --> L[/api/webhook/whatsapp]
  L --> M[lib/webhook-handlers.ts]
  M --> D
  M --> E
  M --> N[lib/whatsapp.ts + lib/whatsapp-messages.ts]
  M --> G
  M --> H
  M --> F

  O[Panel /conversaciones] --> P[/api/conversaciones/data]
  O --> Q[/api/conversaciones/send]
  Q --> N
  Q --> G
```

---

## Componentes y archivos principales

### Canal WhatsApp

- `app/api/webhook/whatsapp/route.ts`
  - Verificacion del webhook (`GET`).
  - Recepcion de eventos (`POST`).
  - Validacion de firma HMAC (`x-hub-signature-256` + `WHATSAPP_APP_SECRET`).
  - Deduplicacion por `whatsapp_message_id`.
  - Manejo inline de `"Activar facturas"`.
  - Derivacion a `processTextMessage(...)`.

- `app/api/webhook/route.ts`
  - Ruta webhook alternativa con logica similar.
  - Tambien llama `processTextMessage(...)`.

- `lib/webhook-handlers.ts`
  - Orquestador principal del flujo WhatsApp.
  - Funciones clave:
    - `processTextMessage`
    - `handleInvoiceRequest`
    - `handleAccountNumberQuestion`
    - `sendAccountNumberImage`
    - `handleInvoiceViaWhatsAppRequest`

### Canal web

- `components/chatbot.tsx`
  - UI del chat.
  - Mantiene mensajes locales.
  - Genera `sessionId` persistente en `localStorage`.
  - Llama `POST /api/chat`.

- `app/api/chat/route.ts`
  - Motor del chatbot web.
  - Aplica deteccion de intencion de factura.
  - Busca factura con Drive.
  - Responde con OpenAI si no aplica flujo de factura.

- `app/api/chat/invoice/route.ts`
  - Descarga de PDF por `fileId`.

### Modulos compartidos de negocio

- `lib/invoice-detector.ts`
  - Deteccion de intencion de factura.
  - Extraccion de cuenta, mes, meses, anio, tipo.
  - Soporta periodo numerico (`periodo 1..12` -> enero..diciembre).

- `lib/drive.ts`
  - Busqueda de carpetas y PDFs en Google Drive.
  - Extraccion de numero de cuenta desde nombre de archivo PDF.
  - Descarga de PDF.

- `lib/chatbot.ts`
  - Integracion OpenAI para respuestas generales.

- `lib/whatsapp.ts`, `lib/whatsapp-messages.ts`
  - Envio de documentos, imagenes y texto por WhatsApp.

- `lib/conversations.ts`
  - Persistencia de conversaciones y mensajes en Supabase.
  - Deduplicacion de mensajes entrantes.

- `lib/invoices.ts`
  - Limite mensual de solicitudes.
  - Registro de solicitudes de factura.

- `lib/activacion-facturas.ts`
  - Deteccion y respuesta para opt-in de facturas.

- `lib/service-request-detector.ts`
  - Detecta altas de servicio (deriva a administracion).

- `lib/service-outage-detector.ts`
  - Detecta reclamos por corte de servicio.

---

## Flujo completo - WhatsApp

### 1) Entrada y seguridad

1. Meta envia evento al webhook.
2. `POST /api/webhook/whatsapp`:
   - Lee `rawBody`.
   - Verifica firma HMAC.
   - Parsea `entry[].changes[].value.messages[]`.
   - Procesa solo `message.type === "text"`.

### 2) Deduplicacion

Antes de procesar, verifica `isMessageAlreadyProcessed(whatsappMessageId)`:

- Si ya existe, se ignora.
- Si no existe, continua.

### 3) Activacion de facturas (opt-in)

Si texto coincide con activacion:

- `updateWhatsappOptIn(from, true)`.
- Guarda mensajes con `message_source: "activacion_facturas"`.
- Envia respuesta automatica de activacion.

### 4) Orquestacion de `processTextMessage(...)`

Orden de decisiones (prioridad):

1. Activacion facturas.
2. Ayuda de "donde esta el numero de cuenta" -> imagen explicativa.
3. Alta de servicio -> derivacion a administracion.
4. Feedback "factura incorrecta":
   - Si trae cuenta valida, reintenta busqueda.
   - Si no trae cuenta valida, envia ayuda.
5. Reclamo por corte de servicio -> derivacion guardia.
6. Pedido de "factura por WhatsApp" (encuestas Meta) -> mensaje de estado de funcionalidad.
7. Solicitud de factura (`handleInvoiceRequest`).
8. Si no aplica nada: respuesta general con OpenAI.

### 5) `handleInvoiceRequest` (corazon del proceso)

1. Verifica intencion explicita (`hasInvoiceRequestIntent`).
2. Detecta si usuario envio direccion/nombre en vez de cuenta.
3. Construye contexto con mensajes recientes (`getRecentMessages`).
4. Ejecuta `detectInvoiceRequest(text)`:
   - `accountNumbers`, `accountNumber`
   - `month`, `months`
   - `year`, `type`, `confidence`
5. Combina datos del mensaje actual + contexto (con reglas para evitar errores).
6. Si no hay cuenta, solicita cuenta y corta.
7. Infiere anio cuando no viene explicitamente.
8. Aplica limite mensual (`MAX_INVOICES_PER_MONTH = 5`).
9. Busca facturas en Drive por cuenta y mes(es).
10. Si encuentra:
    - Descarga PDF.
    - Envia documento por WhatsApp.
    - Registra solicitud (`invoice_requests`).
    - Envia confirmacion final.
11. Si no encuentra:
    - Envia mensaje de no encontrado + imagen de ayuda.

### 6) Persistencia WhatsApp

- Mensajes entrantes/salientes se guardan en `messages`.
- Conversacion en `conversations` por `phone_number`.
- Solicitudes exitosas de factura en `invoice_requests`.

---

## Flujo completo - Chatbot web

### 1) Cliente web (`components/chatbot.tsx`)

- Mantiene `messages` en estado local.
- Genera `sessionId` persistente en `localStorage` (`WEB-...`).
- Envia los ultimos mensajes a `POST /api/chat`.

### 2) API web (`/api/chat`)

Aplica logica muy similar a WhatsApp:

1. Alta de servicio -> derivacion.
2. Reclamo por corte -> derivacion.
3. Ayuda numero de cuenta -> texto + `showImage`.
4. Feedback factura incorrecta -> texto + `showImage`.
5. Flujo factura:
   - Deteccion de intencion.
   - Extraccion cuenta/mes/anio.
   - Rescate de cuenta desde contexto reciente.
   - Limite mensual por `WEB-${sessionId}`.
   - Busqueda en Drive.
6. Si encuentra factura:
   - Devuelve `invoice.downloadUrl` para descargar desde `/api/chat/invoice`.
7. Si no aplica factura:
   - OpenAI (`gpt-4o-mini`) con `cooperativeContext`.

### 3) Persistencia web

- Usa `phone_number = WEB-${sessionId}` en `conversations`.
- Guarda mensajes de usuario y asistente via `logWebMessages`.

---

## Logica de deteccion de factura

Archivo: `lib/invoice-detector.ts`

### Entrada principal

- `detectInvoiceRequest(message)`

### Salida principal

- `accountNumbers: string[]`
- `accountNumber: string | null`
- `month?: string`
- `months?: string[]`
- `year?: string`
- `type?: "servicios" | "electricidad"`
- `confidence: "high" | "medium" | "low"`

### Reglas clave

- Normaliza typos comunes (`cuebta` -> `cuenta`).
- Prioriza patrones explicitos (`mi cuenta es 4047`, `socio 2751`, etc.).
- Evita tomar DNI o secuencias largas como cuenta.
- Evita direcciones/nombres como falsos positivos.
- Detecta meses por nombre.
- Detecta **periodo numerico**:
  - `periodo 1 = enero`
  - `periodo 2 = febrero`
  - ...
  - `periodo 12 = diciembre`
- Detecta "mes pasado/anterior".
- Detecta anio con regex `20xx`.

---

## Logica de busqueda de facturas en Drive

Archivo: `lib/drive.ts`

### Funciones importantes

- `findInvoiceInDrive(accountNumber, month?, year?, requestedType?)`
- `extractAccountNumber(filename)`
- `downloadPDFFromDrive(fileId)`

### Comportamiento

1. Resuelve mes/anio objetivo (inferencias incluidas).
2. Busca carpeta padre `Facturas`.
3. Define estructura por mes/anio:
   - Carpeta unificada (`facturas-{Mes}-{anio}`) o
   - Carpetas separadas (`servicios-{mes}-{anio}`, `electricidad-{mes}-{anio}`).
4. Lista PDFs y compara cuenta extraida desde nombre.
5. Si hay match, retorna `fileId`, `fileName`, `type`.
6. Si no hay mes/anio en pedido, intenta meses anteriores (fallback).

---

## Logica de limites y auditoria

Archivo: `lib/invoices.ts`

- `MAX_INVOICES_PER_MONTH = 5`.
- `canRequestMoreInvoices(userIdentifier)`.
- `getInvoiceRequestCountThisMonth(userIdentifier)`.
- `recordInvoiceRequest(...)`.

Se cuenta por `requested_at` del mes calendario actual, no por periodo de factura.

---

## Base de datos (Supabase)

## `conversations`

Campos usados:

- `id`
- `phone_number` (WhatsApp real o `WEB-...`)
- `created_at`
- `updated_at`
- `whatsapp_opt_in`
- `fecha_opt_in`

## `messages`

Campos usados:

- `id`
- `conversation_id`
- `role` (`user` | `assistant`)
- `content`
- `whatsapp_message_id` (para deduplicacion)
- `created_at`
- `message_source` (ej. `activacion_facturas`)

## `invoice_requests`

Campos usados:

- `phone_number`
- `account_number`
- `file_name`
- `month`
- `year`
- `requested_at`

---

## Intervencion humana desde UI/UX (`/conversaciones`)

Se incorporo envio manual de respuestas:

- UI: `app/conversaciones/page.tsx`
- API: `app/api/conversaciones/send/route.ts`

Flujo:

1. Operador selecciona conversacion de WhatsApp.
2. Escribe mensaje manual y envia.
3. API envia por WhatsApp (`sendTextMessage`).
4. Guarda mensaje saliente en historial con `whatsapp_message_id`.

Nota:

- Conversaciones `WEB-*` no se pueden responder por WhatsApp desde este endpoint.

---

## Variables de entorno relevantes

### WhatsApp

- `WHATSAPP_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_VERIFY_TOKEN`
- `WHATSAPP_APP_SECRET`
- `WHATSAPP_API_VERSION` (opcional; default `v22.0`)

### OpenAI

- `OPENAI_API_KEY`

### Google Drive

- `GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_DRIVE_PRIVATE_KEY`
- `GOOGLE_DRIVE_PROJECT_ID`

### Supabase

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` / claves usadas por el cliente del proyecto

### Passwords admin migradas a `.env`

- `ADMIN_NOTICIAS_PASSWORD`
- `ADMIN_BOXES_PASSWORD`
- `ADMIN_TECNICO_PASSWORD`
- `ADMIN_CONVERSACIONES_PASSWORD`
- `NEXT_PUBLIC_ADMIN_NOTICIAS_PASSWORD`
- `NEXT_PUBLIC_ADMIN_BOXES_PASSWORD`
- `NEXT_PUBLIC_ADMIN_TECNICO_PASSWORD`
- `NEXT_PUBLIC_ADMIN_CONVERSACIONES_PASSWORD`

---

## Manejo de errores y fallback

- Si falla envio de imagen en WhatsApp -> fallback a texto.
- Si falla busqueda de factura -> mensaje de error orientado + ayuda.
- Si falta OpenAI key -> respuesta de contingencia.
- Si falla DB al guardar, en general no bloquea la respuesta al usuario.

---

## Riesgos y mejoras recomendadas

1. **Webhook duplicado (`/api/webhook` y `/api/webhook/whatsapp`)**
   - Recomiendo dejar una sola ruta canonica.

2. **Firma webhook permisiva si faltan secretos/header**
   - Hoy `verifySignature` devuelve `true` si falta `WHATSAPP_APP_SECRET` o header.
   - En produccion deberia ser estricto.

3. **Descarga web de factura por `fileId`**
   - Endurecer `GET /api/chat/invoice` con token temporal o validacion de sesion.

4. **Deduplicacion con posible condicion de carrera**
   - Considerar constraint unico por `whatsapp_message_id` en DB.

5. **Observabilidad**
   - Centralizar logs estructurados por `conversation_id` y `whatsapp_message_id`.

---

## Checklist operativo

- [ ] Verificar variables `.env` en produccion.
- [ ] Configurar webhook Meta a la ruta canonica.
- [ ] Probar casos de factura:
  - cuenta valida + mes/anio
  - periodo numerico (`periodo 2`)
  - feedback de factura incorrecta + nueva cuenta
- [ ] Probar limite mensual (5).
- [ ] Probar respuesta manual desde `/conversaciones`.

---

## Resumen ejecutivo

El asistente tiene una arquitectura modular y robusta para dos canales (web y WhatsApp), con:

- deteccion avanzada de intencion y entidades de factura,
- integracion con Google Drive para entrega automatica,
- control de limites,
- persistencia completa de historial en Supabase,
- y capacidad de intervencion humana desde panel de conversaciones.

La base actual es buena y operativa. Los principales pasos de madurez son endurecer seguridad de webhook/download y unificar el punto de entrada de WhatsApp.

