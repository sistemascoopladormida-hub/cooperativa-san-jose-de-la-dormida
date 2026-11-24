-- Bootstrap mínimo para pruebas fp_* (solo staging / supabase local)
\set ON_ERROR_STOP on

-- Tabla de control de ejecución (opcional, idempotente)
CREATE TABLE IF NOT EXISTS public.fp_test_suite_meta (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  bootstrapped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT
);

INSERT INTO public.fp_test_suite_meta (notes)
VALUES ('Suite fp_* — no usar en producción')
ON CONFLICT (id) DO UPDATE
SET bootstrapped_at = NOW();

-- Helper: falla la prueba si la llamada NO lanza excepción
CREATE OR REPLACE FUNCTION public.fp_test_expect_denied(p_sql TEXT, p_substring TEXT DEFAULT 'Permiso denegado')
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  EXECUTE p_sql;
  RAISE EXCEPTION 'TEST_FAIL: se esperaba excepción (%)', p_substring;
EXCEPTION
  WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%' || p_substring || '%' AND p_substring <> '' THEN
      RAISE EXCEPTION 'TEST_FAIL: excepción inesperada: %', SQLERRM;
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.fp_test_expect_denied(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fp_test_expect_denied(TEXT, TEXT) TO postgres, service_role;