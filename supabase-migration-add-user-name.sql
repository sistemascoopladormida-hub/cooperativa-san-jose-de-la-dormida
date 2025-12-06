-- Migración para agregar columna user_name a la tabla conversations
-- Ejecuta este script en Supabase SQL Editor si ya tienes la tabla creada

-- Agregar columna user_name si no existe
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Comentario para documentar la columna
COMMENT ON COLUMN conversations.user_name IS 'Nombre del usuario obtenido desde WhatsApp profile API';

