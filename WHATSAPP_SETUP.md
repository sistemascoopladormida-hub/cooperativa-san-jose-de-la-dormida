# Configuración del Chatbot de WhatsApp

## 📋 Variables de Entorno Requeridas

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# OpenAI API Key (requerido para el chatbot inteligente)
OPENAI_API_KEY=sk-...

# WhatsApp Cloud API - Configuración del Webhook
# Token de verificación para el webhook (puede ser cualquier string seguro)
WHATSAPP_VERIFY_TOKEN=tu_token_secreto_aqui

# Access Token de WhatsApp Cloud API (obtenido de Meta Business)
WHATSAPP_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Phone Number ID de WhatsApp (obtenido de Meta Business)
WHATSAPP_PHONE_ID=123456789012345

# App Secret de WhatsApp (opcional pero recomendado para verificación HMAC)
WHATSAPP_APP_SECRET=tu_app_secret_aqui
```

## 🔧 Cómo Obtener las Credenciales de WhatsApp

1. **Ve a Meta for Developers**: https://developers.facebook.com/
2. **Crea o selecciona una App** de tipo "Business"
3. **Agrega el producto "WhatsApp"** a tu app
4. **Obtén las credenciales**:
   - **WHATSAPP_TOKEN**: Access Token (puede ser temporal o permanente)
   - **WHATSAPP_PHONE_ID**: Phone Number ID (en la sección de WhatsApp)
   - **WHATSAPP_APP_SECRET**: App Secret (en Configuración > Básico)
   - **WHATSAPP_VERIFY_TOKEN**: Crea uno tú mismo (cualquier string seguro)

## 🌐 Configuración del Webhook en Meta

1. **URL del Webhook**: `https://tu-dominio.com/api/webhook`
2. **Token de verificación**: El mismo que configuraste en `WHATSAPP_VERIFY_TOKEN`
3. **Campos a suscribir**: 
   - `messages`
   - `message_status`

## ✅ Checklist de Verificación

- [ ] Variables de entorno configuradas en `.env.local`
- [ ] Variables de entorno configuradas en el hosting (Vercel/Netlify)
- [ ] Webhook configurado en Meta Business
- [ ] Webhook verificado (debe responder al GET con el challenge)
- [ ] OPENAI_API_KEY válida y con créditos disponibles
- [ ] WHATSAPP_TOKEN válido y con permisos necesarios
- [ ] El endpoint `/api/webhook` es accesible públicamente (HTTPS)

## 🧪 Pruebas

### Verificar el Webhook (GET)
```bash
curl "https://tu-dominio.com/api/webhook?hub.mode=subscribe&hub.verify_token=TU_VERIFY_TOKEN&hub.challenge=CHALLENGE_123"
```

Debería devolver: `CHALLENGE_123`

### Enviar un Mensaje de Prueba
Usa la herramienta de pruebas de Meta Business o envía un mensaje real desde WhatsApp.

## 📝 Notas Importantes

- El webhook debe estar en HTTPS (Vercel/Netlify lo proporcionan automáticamente)
- El `WHATSAPP_TOKEN` puede expirar si es temporal - considera usar tokens permanentes
- El `WHATSAPP_APP_SECRET` es opcional pero recomendado para seguridad
- Los números de teléfono deben estar en formato internacional sin el signo `+` (ej: `5491234567890`)

## 🐛 Solución de Problemas

### Error: "WHATSAPP_VERIFY_TOKEN no configurado"
- Verifica que la variable esté en `.env.local` y en el hosting

### Error: "Firma inválida"
- Verifica que `WHATSAPP_APP_SECRET` esté correctamente configurado
- O remueve la verificación de firma (solo para desarrollo)

### Error: "WHATSAPP_TOKEN o WHATSAPP_PHONE_ID no configurados"
- Verifica que ambas variables estén configuradas
- Verifica que el token tenga permisos para enviar mensajes

### El webhook no recibe mensajes
- Verifica que el webhook esté suscrito en Meta Business
- Verifica que la URL sea accesible públicamente
- Revisa los logs del servidor para ver errores

