-- Agregar campo para rastrear si se envió la imagen de actualización de datos
-- Este campo permite asegurar que la imagen solo se envíe una vez por usuario

-- Agregar la columna si no existe
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS data_update_image_sent BOOLEAN DEFAULT FALSE;

-- Comentario para documentación
COMMENT ON COLUMN conversations.data_update_image_sent IS 'Indica si ya se envió la imagen de actualización de datos a este usuario (solo se envía una vez)';

