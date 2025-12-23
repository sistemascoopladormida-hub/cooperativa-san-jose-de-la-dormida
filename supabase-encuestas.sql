-- Tabla para almacenar las encuestas de visitas técnicas
-- Ejecutar este script en Supabase SQL Editor para crear la tabla

CREATE TABLE IF NOT EXISTS encuestas_visitas (
  id BIGSERIAL PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  numero_cuenta TEXT NOT NULL,
  titular TEXT NOT NULL,
  telefono TEXT NOT NULL,
  tipo_servicio TEXT NOT NULL,
  url_encuesta TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente', -- pendiente, enviado, completada, error_envio
  mensaje_id TEXT, -- ID del mensaje de WhatsApp
  error TEXT, -- Mensaje de error si falla el envío
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  enviado_en TIMESTAMPTZ,
  completada_en TIMESTAMPTZ,
  respuestas JSONB, -- Almacenar las respuestas de la encuesta cuando se complete
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_encuestas_token ON encuestas_visitas(token);
CREATE INDEX IF NOT EXISTS idx_encuestas_numero_cuenta ON encuestas_visitas(numero_cuenta);
CREATE INDEX IF NOT EXISTS idx_encuestas_estado ON encuestas_visitas(estado);
CREATE INDEX IF NOT EXISTS idx_encuestas_creado_en ON encuestas_visitas(creado_en);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_encuestas_visitas_updated_at ON encuestas_visitas;
CREATE TRIGGER update_encuestas_visitas_updated_at
  BEFORE UPDATE ON encuestas_visitas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentación
COMMENT ON TABLE encuestas_visitas IS 'Almacena las encuestas de satisfacción de visitas técnicas';
COMMENT ON COLUMN encuestas_visitas.token IS 'Token único que identifica la encuesta en la URL';
COMMENT ON COLUMN encuestas_visitas.estado IS 'Estado: pendiente, enviado, completada, error_envio';
COMMENT ON COLUMN encuestas_visitas.respuestas IS 'JSON con las respuestas de la encuesta cuando se completa';

