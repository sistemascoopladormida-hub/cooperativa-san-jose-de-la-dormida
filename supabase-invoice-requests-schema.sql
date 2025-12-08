-- Tabla para rastrear solicitudes de facturas por número de teléfono
-- Esta tabla permite controlar cuántas facturas ha solicitado cada usuario

CREATE TABLE IF NOT EXISTS invoice_requests (
  id BIGSERIAL PRIMARY KEY,
  phone_number TEXT NOT NULL,
  account_number TEXT NOT NULL,
  file_name TEXT NOT NULL,
  month TEXT,
  year TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas por número de teléfono
CREATE INDEX IF NOT EXISTS idx_invoice_requests_phone_number 
ON invoice_requests(phone_number);

-- Índice para búsquedas por número de cuenta
CREATE INDEX IF NOT EXISTS idx_invoice_requests_account_number 
ON invoice_requests(account_number);

-- Índice para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_invoice_requests_requested_at 
ON invoice_requests(requested_at);

-- Comentarios para documentación
COMMENT ON TABLE invoice_requests IS 'Registra todas las solicitudes de facturas enviadas por WhatsApp';
COMMENT ON COLUMN invoice_requests.phone_number IS 'Número de teléfono de WhatsApp que solicitó la factura';
COMMENT ON COLUMN invoice_requests.account_number IS 'Número de cuenta de la factura solicitada';
COMMENT ON COLUMN invoice_requests.file_name IS 'Nombre del archivo PDF de la factura enviada';
COMMENT ON COLUMN invoice_requests.month IS 'Mes de la factura solicitada (opcional)';
COMMENT ON COLUMN invoice_requests.year IS 'Año de la factura solicitada (opcional)';
COMMENT ON COLUMN invoice_requests.requested_at IS 'Fecha y hora en que se solicitó la factura';

