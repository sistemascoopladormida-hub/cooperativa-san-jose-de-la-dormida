# Configuración de Supabase para Conversaciones

## Pasos para configurar la base de datos

### 1. Crear las tablas en Supabase

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Haz clic en "SQL Editor" en el menú lateral
3. Copia y pega el contenido del archivo `supabase-schema.sql`
4. Ejecuta el script SQL

### 2. Configurar variables de entorno

Asegúrate de tener estas variables en tu archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

**Importante**: Usa `SUPABASE_SERVICE_ROLE_KEY` (no la anon key) porque necesitamos bypass de RLS para guardar conversaciones desde el servidor.

### 3. Verificar la conexión

Una vez configurado, las conversaciones de WhatsApp se guardarán automáticamente en Supabase cuando:
- Un usuario envía un mensaje por WhatsApp
- El chatbot responde

## Estructura de las tablas

### `conversations`
- `id`: ID único de la conversación
- `phone_number`: Número de teléfono de WhatsApp
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

### `messages`
- `id`: ID único del mensaje
- `conversation_id`: ID de la conversación (foreign key)
- `role`: 'user' o 'assistant'
- `content`: Contenido del mensaje
- `whatsapp_message_id`: ID del mensaje en WhatsApp (opcional)
- `created_at`: Fecha de creación

## Consultar conversaciones

Puedes consultar las conversaciones directamente desde Supabase:

```sql
-- Ver todas las conversaciones
SELECT * FROM conversations ORDER BY updated_at DESC;

-- Ver mensajes de una conversación específica
SELECT * FROM messages 
WHERE conversation_id = 1 
ORDER BY created_at ASC;

-- Ver conversación completa con mensajes
SELECT 
  c.phone_number,
  m.role,
  m.content,
  m.created_at
FROM conversations c
JOIN messages m ON m.conversation_id = c.id
WHERE c.phone_number = '+5491234567890'
ORDER BY m.created_at ASC;
```

## Próximos pasos (opcional)

1. Crear una UI de administración para ver las conversaciones
2. Agregar filtros y búsqueda
3. Exportar conversaciones
4. Agregar estadísticas (mensajes por día, conversaciones activas, etc.)

