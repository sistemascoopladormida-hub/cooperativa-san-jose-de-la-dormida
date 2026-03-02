-- Migración: Agregar soporte para activación de facturas por WhatsApp (opt-in)
-- Objetivo: Mejorar límite de mensajes diarios de Meta cuando usuarios interactúan con plantillas

-- 1. Agregar columnas a conversations para opt-in
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'whatsapp_opt_in') THEN
    ALTER TABLE conversations ADD COLUMN whatsapp_opt_in BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'fecha_opt_in') THEN
    ALTER TABLE conversations ADD COLUMN fecha_opt_in TIMESTAMPTZ;
  END IF;
END $$;

-- 2. Agregar columna message_source a messages (para identificar origen)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'message_source') THEN
    ALTER TABLE messages ADD COLUMN message_source TEXT DEFAULT 'chatbot';
  END IF;
END $$;

-- 3. Comentarios para documentación
COMMENT ON COLUMN conversations.whatsapp_opt_in IS 'Usuario activó recepción de facturas por WhatsApp (opt-in)';
COMMENT ON COLUMN conversations.fecha_opt_in IS 'Fecha y hora del opt-in';
COMMENT ON COLUMN messages.message_source IS 'Origen del mensaje: chatbot, activacion_facturas';
