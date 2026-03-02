# Activación de Facturas por WhatsApp

## 📋 Resumen

Implementación del flujo **"Activar facturas"** para la Cooperativa Eléctrica de San José de la Dormida. Cuando un usuario toca el botón de la plantilla de Meta, el sistema registra el opt-in, envía una confirmación y guarda todo en la base de datos.

**Objetivo:** Mejorar el límite de mensajes diarios de Meta. Cuando los usuarios interactúan con mensajes enviados a través de WhatsApp Business API, Meta considera la conversación como "iniciada por el usuario", lo que favorece el aumento del límite de envíos.

---

## 🔧 Componentes Implementados

### 1. Webhook WhatsApp (`/api/webhook/whatsapp/route.ts`)

Nueva ruta de webhook para recibir eventos de Meta.

#### GET - Verificación del webhook
- Meta envía `hub.mode`, `hub.verify_token`, `hub.challenge`
- Si `mode === "subscribe"` y el token coincide con `WHATSAPP_VERIFY_TOKEN`, responde con el `challenge`
- Requerido para configurar la URL del webhook en Meta for Developers

#### POST - Mensajes entrantes
- Verifica firma HMAC con `WHATSAPP_APP_SECRET`
- Procesa solo mensajes de tipo `text`
- **Si el texto es "Activar facturas":**
  1. Marca `whatsapp_opt_in: true` y `fecha_opt_in` en la conversación
  2. Guarda el mensaje entrante con `message_source: "activacion_facturas"`
  3. Envía respuesta automática vía WhatsApp Cloud API
  4. Guarda el mensaje saliente con `message_source: "activacion_facturas"`
- **Resto de mensajes:** Flujo normal del asistente virtual (`processTextMessage`)

### 2. Helper `isActivacionFactura(text: string)`

```typescript
// lib/activacion-facturas.ts
export function isActivacionFactura(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  return normalized === "activar facturas";
}
```

Retorna `true` cuando el texto coincide exactamente con el botón de la plantilla de Meta.

### 3. Base de datos (Supabase)

**Migración:** `supabase/migrations/20260302000000_add_whatsapp_opt_in.sql`

| Tabla        | Columna          | Tipo      | Descripción                                      |
|-------------|------------------|-----------|--------------------------------------------------|
| conversations | whatsapp_opt_in | BOOLEAN   | Usuario activó recepción de facturas por WhatsApp |
| conversations | fecha_opt_in    | TIMESTAMPTZ | Fecha y hora del opt-in                        |
| messages    | message_source   | TEXT      | Origen: `chatbot` \| `activacion_facturas`       |

### 4. Funciones en `lib/conversations.ts`

- **`updateWhatsappOptIn(phoneNumber, optIn)`**  
  Actualiza `whatsapp_opt_in` y `fecha_opt_in` en la conversación. No falla si ya está en `true`.

- **`saveMessage(..., messageSource?)`**  
  Nuevo parámetro opcional para marcar el origen del mensaje.

### 5. Página `/conversaciones`

- **Badge "Facturas"** en conversaciones con `whatsapp_opt_in === true`
- **Badge "Activación facturas"** en mensajes con `message_source === "activacion_facturas"`
- **Búsqueda:** Filtrar por "factura" o "opt" para ver solo conversaciones con facturas activadas

---

## 📡 Configuración en Meta

### 1. Variables de entorno

```env
WHATSAPP_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_VERIFY_TOKEN=...
WHATSAPP_APP_SECRET=...
WHATSAPP_API_VERSION=v22.0  # opcional, default v22.0
```

### 2. URL del webhook en Meta for Developers

- **URL:** `https://tu-dominio.com/api/webhook/whatsapp`
- **Verificar token:** El mismo valor que `WHATSAPP_VERIFY_TOKEN`
- **Suscribirse a:** `messages`

### 3. Plantilla de mensaje

Crear una plantilla en Meta con un botón cuyo texto sea exactamente:

```
Activar facturas
```

---

## 📤 Envío de mensajes (WhatsApp Cloud API)

```typescript
POST https://graph.facebook.com/v22.0/{{PHONE_NUMBER_ID}}/messages

Headers:
  Authorization: Bearer {{WHATSAPP_TOKEN}}
  Content-Type: application/json

Body:
{
  "messaging_product": "whatsapp",
  "to": "5493512345678",
  "type": "text",
  "text": {
    "body": "¡Solicitud recibida! ✅\n\n..."
  }
}
```

---

## 🔄 Flujo completo

```
Usuario recibe plantilla de Meta
    ↓
Toca botón "Activar facturas"
    ↓
Meta envía mensaje al webhook
    ↓
Webhook detecta "Activar facturas"
    ↓
1. updateWhatsappOptIn(phone, true)
2. saveMessage(..., "activacion_facturas")  // entrante
3. sendWhatsAppMessage(phone, ACTIVACION_FACTURAS_RESPONSE)
4. saveMessage(..., "activacion_facturas")  // saliente
    ↓
Usuario ve confirmación en WhatsApp
    ↓
Mensajes visibles en /conversaciones con badge "Activación facturas"
```

---

## 🧪 Cómo probar (antes de que Meta apruebe la plantilla)

El mensaje que envía el botón de la plantilla es **idéntico** a escribir "Activar facturas" manualmente. Por eso podés probar así:

1. Enviá **"Activar facturas"** al número de WhatsApp del asistente.
2. Deberías recibir la respuesta de confirmación.
3. En `/conversaciones` deberías ver el badge "Facturas" y los mensajes marcados como "Activación facturas".

Cuando Meta apruebe la plantilla, el botón hará exactamente lo mismo: enviará el texto "Activar facturas" al webhook.

---

## ✅ Consideraciones

- **Optional chaining:** Uso de `?.` para eventos variables de Meta
- **Solo texto:** Mensajes no-text se ignoran
- **Normalización:** `trim()` y `toLowerCase()` para detectar "Activar facturas"
- **Idempotencia:** Si el usuario ya tiene `whatsapp_opt_in: true`, se actualiza igual (no rompe)
- **Duplicados:** Se evita procesar el mismo mensaje dos veces con `isMessageAlreadyProcessed`
- **Errores:** `try/catch` y logs en consola

---

## 🚀 Ejecutar migración

```bash
# Con Supabase CLI
supabase db push

# O ejecutar manualmente el SQL en el dashboard de Supabase
```

---

## 📊 Beneficio para límites de Meta

Cuando los usuarios **responden** a mensajes enviados por la empresa (plantillas, notificaciones), Meta considera que la conversación está "iniciada por el usuario". Esto:

1. Extiende la ventana de 24h para enviar mensajes sin plantilla
2. Ayuda a que Meta aumente el límite de mensajes diarios
3. Mejora la calidad de la cuenta en WhatsApp Business API

Por eso es importante que el botón "Activar facturas" envíe un mensaje real del usuario al webhook, generando esta interacción.
