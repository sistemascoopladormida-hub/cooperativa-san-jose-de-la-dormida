-- Agregar columna técnico a la tabla encuestas_visitas
-- Ejecutar este script en Supabase SQL Editor para agregar el campo técnico

-- Agregar columna técnico si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'encuestas_visitas' 
        AND column_name = 'tecnico'
    ) THEN
        ALTER TABLE encuestas_visitas 
        ADD COLUMN tecnico TEXT;
        
        COMMENT ON COLUMN encuestas_visitas.tecnico IS 'Nombre del técnico que realizó la visita';
    END IF;
END $$;
