-- Tabla para almacenar los empleados de los boxes de atención
-- Ejecutar este script en Supabase SQL Editor para crear las tablas

CREATE TABLE IF NOT EXISTS empleados_boxes (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  box_numero INTEGER NOT NULL UNIQUE, -- 1, 2, 3, 4
  activo BOOLEAN NOT NULL DEFAULT true,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para almacenar los tokens QR de cada empleado/box
CREATE TABLE IF NOT EXISTS qr_tokens_boxes (
  id BIGSERIAL PRIMARY KEY,
  empleado_id BIGINT NOT NULL REFERENCES empleados_boxes(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_expiracion TIMESTAMPTZ, -- Opcional: si se quiere que los tokens expiren
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para almacenar las respuestas de las encuestas de boxes
CREATE TABLE IF NOT EXISTS encuestas_boxes (
  id BIGSERIAL PRIMARY KEY,
  token TEXT NOT NULL,
  empleado_id BIGINT NOT NULL REFERENCES empleados_boxes(id),
  box_numero INTEGER NOT NULL,
  nombre_empleado TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente', -- pendiente, completada
  completada_en TIMESTAMPTZ,
  respuestas JSONB NOT NULL, -- Almacenar las respuestas de la encuesta
  comentarios TEXT, -- Comentarios adicionales del usuario
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_qr_tokens_token ON qr_tokens_boxes(token);
CREATE INDEX IF NOT EXISTS idx_qr_tokens_empleado ON qr_tokens_boxes(empleado_id);
CREATE INDEX IF NOT EXISTS idx_qr_tokens_activo ON qr_tokens_boxes(activo);

CREATE INDEX IF NOT EXISTS idx_encuestas_boxes_token ON encuestas_boxes(token);
CREATE INDEX IF NOT EXISTS idx_encuestas_boxes_empleado ON encuestas_boxes(empleado_id);
CREATE INDEX IF NOT EXISTS idx_encuestas_boxes_box ON encuestas_boxes(box_numero);
CREATE INDEX IF NOT EXISTS idx_encuestas_boxes_estado ON encuestas_boxes(estado);
CREATE INDEX IF NOT EXISTS idx_encuestas_boxes_completada_en ON encuestas_boxes(completada_en);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_empleados_boxes_updated_at ON empleados_boxes;
CREATE TRIGGER update_empleados_boxes_updated_at
  BEFORE UPDATE ON empleados_boxes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_qr_tokens_boxes_updated_at ON qr_tokens_boxes;
CREATE TRIGGER update_qr_tokens_boxes_updated_at
  BEFORE UPDATE ON qr_tokens_boxes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_encuestas_boxes_updated_at ON encuestas_boxes;
CREATE TRIGGER update_encuestas_boxes_updated_at
  BEFORE UPDATE ON encuestas_boxes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentación
COMMENT ON TABLE empleados_boxes IS 'Almacena los empleados asignados a cada box de atención';
COMMENT ON TABLE qr_tokens_boxes IS 'Almacena los tokens únicos QR para cada empleado/box';
COMMENT ON TABLE encuestas_boxes IS 'Almacena las respuestas de las encuestas de satisfacción de los boxes de atención';
COMMENT ON COLUMN qr_tokens_boxes.token IS 'Token único que identifica el QR en la URL';
COMMENT ON COLUMN encuestas_boxes.respuestas IS 'JSON con las respuestas de la encuesta cuando se completa';
