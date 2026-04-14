# Documentación técnica: Chatbot web y asistente virtual de WhatsApp

Este documento describe **cómo está implementado** el asistente virtual de Cooperativa La Dormida en el código actual del repositorio: arquitectura, flujos de datos, integraciones externas, persistencia y diferencias entre el **canal web** y **WhatsApp**.

---

## 1. Resumen ejecutivo

| Aspecto | Chatbot web | WhatsApp |
|--------|-------------|----------|
| **Interfaz** | Widget React (`components/chatbot.tsx`) embebido en `app/layout.tsx` | Cliente WhatsApp del usuario → **Meta WhatsApp Cloud API** |
| **Entrada HTTP** | `POST /api/chat` | `GET`/`POST` en `/api/webhook/whatsapp` (y ruta hermana `/api/webhook`) |
| **Identidad del usuario** | `sessionId` en `localStorage` → clave lógica `WEB-{sessionId}` | Número E.164 sin `+` (campo `from` del webhook) |
| **Motor conversacional principal** | OpenAI `gpt-4o-mini` en `app/api/chat/route.ts` | Misma familia de modelo en `lib/chatbot.ts`, tras reglas previas en `lib/webhook-handlers.ts` |
| **Entrega de facturas** | URL relativa `GET /api/chat/invoice?fileId=...&fileName=...` (descarga PDF) | Envío de documento por Graph API (`lib/whatsapp.ts` → `sendDocumentMessage`) |
| **Contexto de facturación** | Últimos 10 mensajes en el cuerpo del `POST` | Historial en Supabase + detección en mensaje actual (`getRecentMessages` / `detectInvoiceRequest`) |

Ambos canales comparten: contexto institucional (`lib/cooperative-context.ts`), detección heurística de intención de factura (`lib/invoice-detector.ts`), búsqueda en Google Drive (`lib/drive.ts`), límites de uso (`lib/invoices.ts`) y persistencia de conversaciones (`lib/conversations.ts` + Supabase).

---

## 2. Stack y dependencias relevantes

- **Framework**: Next.js (App Router), rutas API en `app/api/...`.
- **UI del chat**: React cliente (`"use client"`), Framer Motion, `react-markdown` para renderizar respuestas del asistente.
- **LLM**: OpenAI API (`openai`), modelo **`gpt-4o-mini`**, `temperature: 0.7`, `max_tokens: 500`.
- **WhatsApp**: Meta **Graph API** (`graph.facebook.com`), versión por defecto `v22.0` (configurable con `WHATSAPP_API_VERSION` en el webhook dedicado).
- **Base de datos**: Supabase (tablas `conversations`, `messages`, `invoice_requests` según uso en código).
- **Almacenamiento de facturas**: Google Drive vía `lib/drive.ts` (IDs de archivo, descarga de PDF).

---

## 3. Modelo de datos y persistencia (Supabase)

### 3.1. Tabla `conversations`

- Se identifica por `phone_number`, que en la práctica es:
  - **WhatsApp**: número del remitente (`from`).
  - **Web**: cadena `WEB-{sessionId}` donde `sessionId` lo genera el navegador.

Funciones clave en `lib/conversations.ts`:

- `getOrCreateConversation(phoneNumber)`: busca por `phone_number` o inserta fila nueva.
- `updateWhatsappOptIn(phoneNumber, optIn)`: marca opt-in de campaña “Activar facturas” y timestamp `fecha_opt_in`.

### 3.2. Tabla `messages`

- `conversation_id`, `role` (`user` | `assistant`), `content`, `whatsapp_message_id` (ID de mensaje de Meta cuando aplica).
- `message_source` opcional (`chatbot` | `activacion_facturas`): el insert reintenta sin la columna si el esquema antiguo no la tiene (compatibilidad defensiva).

### 3.3. Deduplicación de webhooks WhatsApp

- `isMessageAlreadyProcessed(whatsappMessageId)`: consulta si ya existe un mensaje con ese `whatsapp_message_id`.
- Meta puede reenviar eventos; evitar procesar dos veces el mismo mensaje es crítico para no duplicar respuestas ni cargos de API.

### 3.4. Historial para el LLM (solo WhatsApp en `lib/chatbot.ts`)

- `getConversationHistory(phoneNumber)` lee hasta **20** mensajes ordenados por tiempo.
- `getRecentMessages(conversationId, limit)` se usa en el flujo de facturas WhatsApp para reconstruir números de cuenta y meses mencionados antes.

### 3.5. Solicitudes de factura y límites (`lib/invoices.ts`)

- `invoice_requests` almacena `phone_number` (mismo identificador que arriba: teléfono o `WEB-...`), `account_number`, `file_name`, `month`, `year`, `requested_at`.
- **`MAX_INVOICES_PER_MONTH`**: valor centralizado (revisar el archivo para el número actual; el código usa este constante en mensajes al usuario).
- `canRequestMoreInvoices` / `getInvoiceRequestCountThisMonth`: ventana **mes calendario** por `requested_at`.

---

## 4. Contexto de conocimiento (RAG “estático”)

No hay recuperación vectorial: el “conocimiento” del asistente es un **string largo** exportado por `lib/cooperative-context.ts` como `cooperativeContext`.

- Se inyecta en el **system prompt** tanto en `app/api/chat/route.ts` (web) como en `lib/chatbot.ts` (WhatsApp).
- Incluye datos de contacto, servicios, precios orientativos, enlaces (p. ej. ERSeP), guardias, etc.

Cualquier cambio de datos institucionales debe reflejarse editando ese archivo (o el mecanismo que lo alimente).

---

## 5. Canal web: de la UI a la API

### 5.1. Componente `components/chatbot.tsx`

**Estado local**

- Lista de mensajes con `sender: "user" | "bot"`, texto, timestamp; campos opcionales `image`, `invoice` (descarga web).

**Sesión**

- Clave `localStorage`: `chatbot_web_session_id`.
- Si no existe, se genera un ID pseudoaleatorio (`web-{timestamp base36}-...`).
- Ese valor se envía como `sessionId` en cada `POST` para correlacionar la conversación en backend con `WEB-{sessionId}`.

**Petición**

- `fetch('/api/chat', { method: 'POST', body: JSON.stringify({ messages, sessionId }) })`.
- Solo se envían los **últimos 10** mensajes (usuario + bot), mapeados a `{ text, sender }`.

**Respuesta esperada (JSON)**

- `response`: texto principal.
- `showImage`: si viene definido (p. ej. `"ubicacion de numero de cuenta"`), el cliente construye la ruta `/images/{encodeURIComponent(showImage)}.jpeg`.
- `invoice`: opcional, con `downloadUrl`, `fileName`, `type` para mostrar botón “Descargar factura”.

**Renderizado**

- Mensajes del bot pasan por `ReactMarkdown` con componentes personalizados (enlaces, listas, énfasis).
- Factura: bloque con enlace al `downloadUrl` (misma origen del sitio, típicamente `/api/chat/invoice?...`).

### 5.2. Ruta `POST app/api/chat/route.ts`

**Runtime**: `nodejs` (necesario para SDK de OpenAI, Drive, etc.).

**Orden lógico de decisión** (simplificado):

1. **Derivación sin LLM**: `isNewServiceRequest` → mensaje fijo de derivación a Administración.
2. **Reclamo por corte**: `isServiceOutageComplaint` → respuesta fija de guardia/reclamos.
3. **Ayuda “dónde está el número de cuenta”**: `isAccountNumberHelpQuestion` → texto de ayuda + `showImage`.
4. **Feedback “factura incorrecta”**: `isWrongInvoiceFeedback` → texto + `showImage`.
5. **Rama facturas** (solo si `hasInvoiceRequestIntent` y no es pregunta “solo informativa” sobre disponibilidad de facturas):
   - Detección de dirección/nombre vs cuenta: `detectAddressOrNameInsteadOfAccount`.
   - `detectInvoiceRequest` + resolución de **continuación** leyendo mensajes previos en el array (p. ej. número en mensaje anterior cuando el usuario dice “y la de noviembre”).
   - Inferencia de **año** si hay mes pero no año (reglas de borde: enero + nov/dic → año anterior, etc.).
   - Límite mensual vía `canRequestMoreInvoices(`WEB-${sessionId}`)` (o `WEB-anonymous` si falta sesión).
   - `findInvoiceInDrive` → si hay resultado: `recordInvoiceRequest`, respuesta con `invoice.downloadUrl` apuntando a `/api/chat/invoice`.
6. **Fallback LLM**: prompt de sistema con `cooperativeContext` + historial mapeado a roles OpenAI + `sanitizeInvoicePromiseResponse` para evitar que el modelo “prometa” enviar facturas sin datos.

**Persistencia web**

- Función interna `logWebMessages`: `getOrCreateConversation(\`WEB-${sessionId}\`)` y `saveMessage` para user y assistant **después** de conocer la respuesta final (incluidos los caminos sin OpenAI).

### 5.3. Descarga de factura `GET app/api/chat/invoice/route.ts`

- Query: `fileId` (obligatorio), `fileName` (opcional, nombre de descarga).
- `downloadPDFFromDrive(fileId)` → `NextResponse` con `Content-Type: application/pdf`, `Content-Disposition: attachment`.

**Consideración de seguridad**: cualquier cliente que adivine o filtre un `fileId` podría intentar descargar; el documento mejora UX pero no sustituye un control de autorización fuerte (ver sección 9).

---

## 6. Canal WhatsApp: webhook y orquestación

### 6.1. Endpoints duplicados

Existen dos implementaciones de webhook:

- `app/api/webhook/whatsapp/route.ts` — **recomendada** en documentación interna: incluye verificación de firma, deduplicación, flujo especial “Activar facturas” antes de `processTextMessage`, y **no reenvía** a la ruta antigua.
- `app/api/webhook/route.ts` — misma firma HMAC y llamada directa a `processTextMessage`, **sin** el bloque inline de activación de facturas al inicio (la activación igual puede ocurrir dentro de `processTextMessage`).

En Meta solo debe quedar **una URL** suscrita para evitar doble procesamiento si ambas rutas están expuestas.

### 6.2. Verificación `GET` (handshake)

- Parámetros `hub.mode`, `hub.verify_token`, `hub.challenge`.
- Si `mode === "subscribe"` y el token coincide con `WHATSAPP_VERIFY_TOKEN`, responde el `hub.challenge` en texto plano (requisito de Meta).

### 6.3. Recepción `POST`

1. Lee **`rawBody` como texto** (importante para HMAC; no parsear JSON antes de verificar).
2. `x-hub-signature-256`: HMAC-SHA256 con `WHATSAPP_APP_SECRET`. Si falta secreto o header, la función `verifySignature` actual **acepta la petición** (modo permisivo; endurecer en producción).
3. Parseo JSON: recorre `entry[].changes[].value.messages[]`.
4. Filtra `message.type === "text"` únicamente.
5. **Deduplicación** por `whatsapp_message_id`.
6. Si el texto coincide con **activación de facturas** (`isActivacionFactura`), en la ruta `/whatsapp` se hace opt-in, guardado de mensajes y respuesta automática **antes** del orquestador general.
7. Resto: `processTextMessage(from, text, whatsappMessageId)`.

### 6.4. `lib/webhook-handlers.ts` — `processTextMessage`

Orden de evaluación:

1. Otra vez **activación de facturas** (por si el mensaje llega por la ruta `/webhook` sin el bloque previo).
2. `handleAccountNumberQuestion`: envío de imagen explicativa vía `sendImageMessage` (`lib/whatsapp.ts`), con fallback a `sendTextMessage` (`lib/whatsapp-messages.ts`).
3. `isNewServiceRequest` → derivación administración.
4. `isWrongInvoiceFeedback` → si no trae nuevo número válido, imagen de ayuda; si trae cuenta, el flujo puede reintentar búsqueda (según detección).
5. `isServiceOutageComplaint` → respuesta de reclamos/guardia.
6. `handleInvoiceViaWhatsAppRequest` — respuesta educativa para quienes piden “factura por WhatsApp” en sentido de **funcionalidad futura / encuestas Meta** (no confundir con el envío real de PDF que ya hace el bot).
7. **`handleInvoiceRequest`** — núcleo de facturación WhatsApp (ver §7).
8. Si nada aplicó: **`getChatbotResponse`** (`lib/chatbot.ts`) y envío con `sendTextMessage`; guardado del mensaje saliente con `messageId` de Meta.

### 6.5. Envío de medios (`lib/whatsapp.ts`, `lib/whatsapp-messages.ts`)

- **Texto**: POST a `/{phone-number-id}/messages` con `messaging_product: "whatsapp"`, `to` normalizado a dígitos.
- **Imagen**: subida a `/media` (multipart), luego mensaje tipo `image` con `id` de media.
- **Documento (PDF)**: flujo análogo para enviar la factura como archivo.

---

## 7. Lógica compartida de facturas (detección y Drive)

### 7.1. `lib/invoice-detector.ts`

- Extrae **intención** (`hasInvoiceRequestIntent`), **números de cuenta**, **meses**, **año**, **tipo** (servicios vs energía), y **confianza** (`high` | `medium` | `low`).
- Protege contra falsos positivos (“hola” sin intención de pedir factura).

### 7.2. Diferencias web vs WhatsApp

- **Web**: continuidad con el array `messages` en el POST (hasta 10 turnos).
- **WhatsApp**: además del mensaje actual, se consultan hasta 10 mensajes recientes en BD para armar “contexto” de números y meses (`getRecentMessages` + iteración sobre roles `user`).

### 7.3. `findInvoiceInDrive` / `downloadPDFFromDrive`

- Abstrae la convención de carpetas y nombres de archivo en Drive para localizar el PDF correcto según cuenta, mes, año y tipo.

---

## 8. `lib/chatbot.ts` (solo respuesta LLM para WhatsApp)

- Si falta `OPENAI_API_KEY`, devuelve mensaje de error amable con teléfonos.
- Carga historial con `getConversationHistory(from)` (máx. 20 mensajes en consulta).
- Construye mensajes: `[system, ...history.slice(-10), user actual]` — **nota**: el comentario en código usa slice de 10 sobre historial; el límite de lectura en BD es 20.
- Tras generar, **`saveMessage`** para el mensaje del usuario con `whatsappMessageId` (idempotencia y trazabilidad).
- La respuesta del asistente en WhatsApp se guarda en `processTextMessage` **después** de enviar, usando el `messageId` devuelto por Meta (no el de OpenAI).

**Sanitización**: `sanitizeInvoicePromiseResponse` evita que el modelo prometa enviar facturas sin datos (misma idea que en la API web).

---

## 9. Seguridad y observabilidad (estado actual)

| Tema | Comportamiento en código |
|------|---------------------------|
| Firma webhook | Si faltan `WHATSAPP_APP_SECRET` o header, la verificación puede **pasar** sin validar. |
| Descarga PDF web | `GET /api/chat/invoice` no implementa token de sesión; confía en **secreto del fileId** de Drive. |
| Duplicados | Mitigado por `whatsapp_message_id` en tabla `messages`. |
| Logs | Amplios `console.log` en webhook y handlers para diagnóstico. |

---

## 10. Variables de entorno (referencia)

- **OpenAI**: `OPENAI_API_KEY`.
- **Supabase**: credenciales según `lib/supabase.ts`.
- **Google Drive / APIs**: según `lib/drive.ts` (service account u OAuth, según implementación del proyecto).
- **WhatsApp**: `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`, opcional `WHATSAPP_API_VERSION`.

---

## 11. Panel de conversaciones (contexto operativo)

- Ruta de UI `app/conversaciones/page.tsx` (autenticación vía APIs en `app/api/conversaciones/`).
- Envío manual: `app/api/conversaciones/send/route.ts` usa `sendTextMessage`; **no** permite enviar WhatsApp a conversaciones cuya clave sea `WEB-*` (no hay número real).

---

## 12. Diagrama de flujo simplificado (WhatsApp)

```text
Meta Cloud API
      │
      ▼
POST /api/webhook/whatsapp  (raw body + HMAC)
      │
      ├─► ¿message_id ya en DB? ──sí──► skip
      │
      ├─► ¿Activar facturas? ──sí──► opt-in + respuesta plantilla
      │
      └─► processTextMessage
              │
              ├─► ayuda cuenta / imagen
              ├─► derivaciones (alta servicio, corte, meta-encuesta)
              ├─► factura: Drive + PDF + límites + registros
              └─► getChatbotResponse + sendTextMessage
```

---

## 13. Diagrama de flujo simplificado (Web)

```text
Usuario en navegador
      │
      ▼
chatbot.tsx (sessionId localStorage)
      │
      ▼
POST /api/chat
      │
      ├─► reglas determinísticas (servicio, corte, ayuda cuenta, factura…)
      │
      └─► OpenAI + cooperativeContext
              │
              ▼
      JSON { response, showImage?, invoice? }
              │
              ▼
      UI: Markdown + imagen opcional + enlace /api/chat/invoice
```

---

## 14. Relación con otros documentos

En el repositorio puede existir `ASISTENTE_VIRTUAL_DOCUMENTACION.md` con un resumen parecido. Este archivo (`DOCUMENTACION_TECNICA_ASISTENTE_VIRTUAL.md`) prioriza **detalle de implementación**, **órdenes de evaluación de reglas** y **matices entre rutas** (`/api/webhook` vs `/api/webhook/whatsapp`).

---

*Documento generado a partir del análisis del código fuente del proyecto. Actualizar si cambian rutas, límites o políticas de seguridad.*
