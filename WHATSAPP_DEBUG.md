# Guía de Diagnóstico para el Chatbot de WhatsApp

## 🔍 Problema Identificado

El webhook está recibiendo mensajes correctamente, pero no se están enviando respuestas.

## ✅ Lo que está funcionando

Según tus logs:

- ✅ El webhook recibe mensajes (WEBHOOK_RECEIVED)
- ✅ El mensaje se procesa (MESSAGE_RECEIVED)
- ✅ Se detecta la solicitud del chatbot (CHATBOT_REQUEST)

## ❌ Lo que falta

No aparecen logs de:

- `CHATBOT_RESPONSE` - La respuesta del chatbot
- `SEND_TEXT_MESSAGE_CALLED` - El intento de enviar el mensaje
- `SEND_MESSAGE_OK` o `SEND_MESSAGE_ERROR` - El resultado del envío

## 🔧 Verificaciones Necesarias

### 1. Variables de Entorno

**IMPORTANTE:** Del log que compartiste, el `phone_number_id` del webhook es:

```
"phone_number_id": "837375206130953"
```

**Verifica que en tu `.env.local` y en tu hosting (Vercel/Netlify) tengas:**

```env
WHATSAPP_PHONE_NUMBER_ID=837375206130953
WHATSAPP_TOKEN=EAA... (tu token completo)
OPENAI_API_KEY=sk-... (tu clave de OpenAI)
WHATSAPP_VERIFY_TOKEN=tu_token_secreto
```

**⚠️ CRÍTICO:** El `WHATSAPP_PHONE_NUMBER_ID` debe ser **exactamente** `837375206130953` (sin espacios, sin comillas).

### 2. Verificar en la Consola

Después de hacer un deploy con los cambios, cuando envíes un mensaje, deberías ver estos logs en orden:

```
WEBHOOK_RECEIVED: {...}
WEBHOOK_PROCESSING_START: { hasPhoneIdEnv: true, ... }
MESSAGE_RECEIVED: {...}
CHATBOT_REQUEST: { from: '...', text: '...' }
CHATBOT_RESPONSE: { from: '...', responseLength: ..., responsePreview: '...' }
SEND_TEXT_MESSAGE_CALLED: { to: '...', hasToken: true, hasPhoneId: true, ... }
SENDING_TO_WHATSAPP_API: { url: '...', to: '...', textLength: ... }
SEND_MESSAGE_OK: { messageId: '...', to: '...' }
```

### 3. Posibles Problemas y Soluciones

#### Problema A: Variables de entorno no configuradas

**Síntomas:**

- Logs muestran `hasToken: false` o `hasPhoneId: false`
- Error: `SEND_MESSAGE_ERROR: Variables de entorno faltantes`

**Solución:**

1. Verifica que las variables estén en `.env.local` (para desarrollo local)
2. **MÁS IMPORTANTE:** Configúralas en tu hosting:
   - **Vercel:** Settings → Environment Variables
   - **Netlify:** Site settings → Environment variables
3. Haz un nuevo deploy después de agregar las variables

#### Problema B: phone_number_id incorrecto

**Síntomas:**

- Log muestra: `WEBHOOK_WARNING: phone_number_id no coincide`
- El webhook tiene un ID diferente al de la variable de entorno

**Solución:**

- Usa exactamente el ID que aparece en el webhook: `837375206130953`

#### Problema C: Token de WhatsApp inválido o expirado

**Síntomas:**

- Log muestra: `SEND_MESSAGE_ERROR` con código 401 o 403
- Error: `Invalid OAuth access token` o `Permission denied`

**Solución:**

1. Ve a Meta for Developers → Tu App → WhatsApp → API Setup
2. Genera un nuevo Access Token
3. Asegúrate de que tenga permisos: `whatsapp_business_messaging`
4. Actualiza `WHATSAPP_TOKEN` en las variables de entorno
5. Haz un nuevo deploy

#### Problema D: OpenAI API Key inválida

**Síntomas:**

- Log muestra: `CHATBOT_PROCESSING_ERROR`
- Error relacionado con OpenAI

**Solución:**

1. Verifica que tu API Key de OpenAI sea válida
2. Verifica que tengas créditos disponibles
3. Verifica que la clave tenga el formato correcto: `sk-...`

#### Problema E: Error silencioso en getChatbotResponse

**Síntomas:**

- Ves `CHATBOT_REQUEST` pero no ves `CHATBOT_RESPONSE`
- No hay logs de error

**Solución:**

- Con los nuevos logs, deberías ver el error específico
- Revisa los logs completos después de enviar un mensaje

### 4. Pasos de Diagnóstico

1. **Verifica las variables de entorno en tu hosting:**

   ```bash
   # En Vercel, ve a Settings → Environment Variables
   # Verifica que todas estén configuradas
   ```

2. **Haz un nuevo deploy:**

   ```bash
   git add .
   git commit -m "Add debug logging"
   git push
   ```

3. **Envía un mensaje de prueba:**

   - Envía "Hola" desde WhatsApp
   - Revisa los logs en tiempo real

4. **Revisa los logs completos:**

   - Busca todos los logs que empiezan con:
     - `WEBHOOK_`
     - `CHATBOT_`
     - `SEND_`
     - `ERROR`

5. **Comparte los logs completos:**
   - Si el problema persiste, comparte todos los logs desde `WEBHOOK_RECEIVED` hasta el final

## 📋 Checklist de Verificación

- [ ] `WHATSAPP_PHONE_NUMBER_ID` = `837375206130953` (exactamente este valor)
- [ ] `WHATSAPP_TOKEN` está configurado y es válido
- [ ] `OPENAI_API_KEY` está configurado y tiene créditos
- [ ] Variables de entorno configuradas en el hosting (no solo en `.env.local`)
- [ ] Se hizo un nuevo deploy después de configurar las variables
- [ ] El webhook está verificado en Meta Business
- [ ] El token de WhatsApp tiene permisos necesarios

## 🔗 Enlaces Útiles

- **Meta for Developers:** https://developers.facebook.com/
- **WhatsApp API Docs:** https://developers.facebook.com/docs/whatsapp/cloud-api
- **Verificar Token:** https://developers.facebook.com/tools/debug/accesstoken/

## 📞 Si el Problema Persiste

Si después de verificar todo lo anterior el problema continúa:

1. Comparte los logs completos desde que recibes el mensaje
2. Verifica que el número de teléfono desde el que envías esté registrado en Meta Business (para modo de prueba)
3. Verifica que el webhook esté suscrito a los eventos `messages` en Meta Business
