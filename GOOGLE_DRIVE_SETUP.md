# Configuración de Google Drive API para Producción

## Problema
El archivo `keyapidrive.json` no está disponible en producción (Vercel) porque está en `.gitignore` por seguridad.

## Solución: Variables de Entorno

Debes configurar las siguientes variables de entorno en Vercel:

### Variables requeridas:

1. **GOOGLE_DRIVE_CLIENT_EMAIL**
   - Valor: `drive-service-account@our-sign-480404-c3.iam.gserviceaccount.com`

2. **GOOGLE_DRIVE_PRIVATE_KEY**
   - Valor: La clave privada completa del JSON (incluyendo `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`)
   - **IMPORTANTE**: En Vercel, cuando pegues la clave privada, asegúrate de que los saltos de línea estén como `\n` (no como saltos de línea reales)
   - Ejemplo del formato:
     ```
     -----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCXirJHe0RK9J8P...\n-----END PRIVATE KEY-----\n
     ```

3. **GOOGLE_DRIVE_PROJECT_ID**
   - Valor: `our-sign-480404-c3`

## Cómo configurar en Vercel:

1. Ve a tu proyecto en Vercel
2. Ve a **Settings** > **Environment Variables**
3. Agrega las 3 variables de entorno:
   - `GOOGLE_DRIVE_CLIENT_EMAIL`
   - `GOOGLE_DRIVE_PRIVATE_KEY`
   - `GOOGLE_DRIVE_PROJECT_ID`
4. Asegúrate de que estén disponibles para **Production**, **Preview** y **Development**
5. Haz un nuevo deploy

## Valores desde keyapidrive.json:

Desde tu archivo `keyapidrive.json`, los valores son:

- **GOOGLE_DRIVE_CLIENT_EMAIL**: `client_email`
- **GOOGLE_DRIVE_PRIVATE_KEY**: `private_key` (copiar exactamente, incluyendo los saltos de línea como `\n`)
- **GOOGLE_DRIVE_PROJECT_ID**: `project_id`

## Nota de Seguridad

✅ El archivo `keyapidrive.json` está en `.gitignore` y NO debe subirse al repositorio.
✅ Las variables de entorno en Vercel están encriptadas y son seguras.

