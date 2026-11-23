-- =============================================================================
-- Cooperativa La Dormida — Limpieza Supabase (módulos eliminados del sitio)
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Elimina tablas de:
--   • Encuestas de visitas técnicas
--   • Encuestas de boxes + empleados + tokens QR
--
-- ⚠️ IRREVERSIBLE: hacé backup o exportá datos antes si los necesitás.
-- =============================================================================

BEGIN;

-- 1) Triggers (nombres del esquema original)
DROP TRIGGER IF EXISTS update_encuestas_boxes_updated_at ON public.encuestas_boxes;
DROP TRIGGER IF EXISTS update_qr_tokens_boxes_updated_at ON public.qr_tokens_boxes;
DROP TRIGGER IF EXISTS update_empleados_boxes_updated_at ON public.empleados_boxes;
DROP TRIGGER IF EXISTS update_encuestas_visitas_updated_at ON public.encuestas_visitas;

-- 2) Tablas (orden por dependencias FK: encuestas_boxes → empleados_boxes)
DROP TABLE IF EXISTS public.encuestas_boxes CASCADE;
DROP TABLE IF EXISTS public.qr_tokens_boxes CASCADE;
DROP TABLE IF EXISTS public.empleados_boxes CASCADE;
DROP TABLE IF EXISTS public.encuestas_visitas CASCADE;

COMMIT;

-- -----------------------------------------------------------------------------
-- Opcional: función compartida de updated_at
-- Solo ejecutá esto si no tenés OTRAS tablas usando update_updated_at_column().
-- Verificá antes con:
--
--   SELECT event_object_table AS tabla, trigger_name
--   FROM information_schema.triggers
--   WHERE action_statement LIKE '%update_updated_at_column%';
--
-- Si la consulta devuelve 0 filas, podés borrar la función:
--
--   DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
-- -----------------------------------------------------------------------------

-- Verificación rápida post-limpieza:
-- SELECT tablename FROM pg_tables
-- WHERE schemaname = 'public'
--   AND tablename IN (
--     'encuestas_visitas',
--     'encuestas_boxes',
--     'empleados_boxes',
--     'qr_tokens_boxes'
--   );
-- (debe devolver 0 filas)