-- Configuración de UUID de prueba (reemplazar tras crear usuarios en auth.users)
\set ON_ERROR_STOP on

-- Ejemplo (descomentar y ajustar en staging):
-- SELECT set_config('fp.test.proveedor_a', '00000000-0000-4000-8000-000000000001', false);
-- SELECT set_config('fp.test.proveedor_b', '00000000-0000-4000-8000-000000000002', false);
-- SELECT set_config('fp.test.compras', '00000000-0000-4000-8000-000000000010', false);
-- SELECT set_config('fp.test.tesoreria', '00000000-0000-4000-8000-000000000011', false);
-- SELECT set_config('fp.test.gerente', '00000000-0000-4000-8000-000000000012', false);
-- SELECT set_config('fp.test.invoice_observada', '00000000-0000-4000-8000-000000000100', false);
-- SELECT set_config('fp.test.preparation_pending', '00000000-0000-4000-8000-000000000200', false);

DO $$
BEGIN
  IF current_setting('fp.test.proveedor_a', true) IS NULL
    OR current_setting('fp.test.proveedor_a', true) = '' THEN
    RAISE NOTICE 'WARN: fp.test.proveedor_a no configurado — varias pruebas harán SKIP';
  END IF;
END $$;