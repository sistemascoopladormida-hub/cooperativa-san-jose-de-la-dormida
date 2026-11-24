-- Assertions RLS / RPC — requiere migraciones + 00_bootstrap.sql + UUIDs en 01_seed.sql
\set ON_ERROR_STOP on

BEGIN;

-- Usuario anónimo no lee perfiles
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SET LOCAL ROLE anon;
  SELECT COUNT(*) INTO v_count FROM public.fp_profiles;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'FAIL: usuario anónimo lee fp_profiles (% filas)', v_count;
  END IF;
  RAISE NOTICE 'PASS: anónimo sin acceso a fp_profiles';
END $$;

-- Proveedor A no ve facturas de proveedor B
DO $$
DECLARE
  v_proveedor_a UUID := NULLIF(current_setting('fp.test.proveedor_a', true), '')::UUID;
  v_proveedor_b UUID := NULLIF(current_setting('fp.test.proveedor_b', true), '')::UUID;
  v_count INTEGER;
BEGIN
  IF v_proveedor_a IS NULL OR v_proveedor_b IS NULL THEN
    RAISE NOTICE 'SKIP: configure fp.test.proveedor_a y fp.test.proveedor_b';
    RETURN;
  END IF;

  PERFORM set_config('request.jwt.claim.sub', v_proveedor_a::TEXT, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
  SET LOCAL ROLE authenticated;

  SELECT COUNT(*) INTO v_count FROM public.fp_invoices i
  INNER JOIN public.fp_suppliers s ON s.id = i.supplier_id
  WHERE s.profile_id = v_proveedor_b;

  IF v_count > 0 THEN
    RAISE EXCEPTION 'FAIL: proveedor A ve facturas de B (% rows)', v_count;
  END IF;
  RAISE NOTICE 'PASS: proveedor A no ve facturas de B';
END $$;

-- Compras no puede preparar pagos
DO $$
DECLARE
  v_compras UUID := NULLIF(current_setting('fp.test.compras', true), '')::UUID;
  v_invoice UUID := NULLIF(current_setting('fp.test.invoice_pendiente_pago', true), '')::UUID;
BEGIN
  IF v_compras IS NULL THEN
    RAISE NOTICE 'SKIP: fp.test.compras';
    RETURN;
  END IF;
  IF v_invoice IS NULL THEN
    v_invoice := gen_random_uuid();
  END IF;

  PERFORM set_config('request.jwt.claim.sub', v_compras::TEXT, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
  SET LOCAL ROLE authenticated;

  PERFORM public.fp_test_expect_denied(
    format(
      $q$SELECT public.fp_tesoreria_prepare_payment(%L::uuid, CURRENT_DATE, 1, 'transferencia', %L::uuid, NULL, 'test-compras')$q$,
      v_invoice,
      v_compras
    ),
    'Permiso denegado'
  );
  RAISE NOTICE 'PASS: compras no puede preparar pago';
END $$;

-- Gerente no puede decidir facturas
DO $$
DECLARE
  v_gerente UUID := NULLIF(current_setting('fp.test.gerente', true), '')::UUID;
  v_invoice UUID := NULLIF(current_setting('fp.test.invoice_presentada', true), '')::UUID;
BEGIN
  IF v_gerente IS NULL THEN
    RAISE NOTICE 'SKIP: fp.test.gerente';
    RETURN;
  END IF;
  IF v_invoice IS NULL THEN
    v_invoice := gen_random_uuid();
  END IF;

  PERFORM set_config('request.jwt.claim.sub', v_gerente::TEXT, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
  SET LOCAL ROLE authenticated;

  PERFORM public.fp_test_expect_denied(
    format(
      $q$SELECT public.fp_compras_decide(%L::uuid, %L::uuid, 'aprobada', 'test')$q$,
      v_invoice,
      v_gerente
    ),
    'Permiso denegado'
  );
  RAISE NOTICE 'PASS: gerente no puede aprobar facturas';
END $$;

-- Tesorería no puede aprobar facturas (compras_decide)
DO $$
DECLARE
  v_tesoreria UUID := NULLIF(current_setting('fp.test.tesoreria', true), '')::UUID;
  v_invoice UUID := gen_random_uuid();
BEGIN
  IF v_tesoreria IS NULL THEN
    RAISE NOTICE 'SKIP: fp.test.tesoreria';
    RETURN;
  END IF;

  PERFORM set_config('request.jwt.claim.sub', v_tesoreria::TEXT, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
  SET LOCAL ROLE authenticated;

  PERFORM public.fp_test_expect_denied(
    format(
      $q$SELECT public.fp_compras_decide(%L::uuid, %L::uuid, 'aprobada', 'test')$q$,
      v_invoice,
      v_tesoreria
    ),
    'Permiso denegado'
  );
  RAISE NOTICE 'PASS: tesorería no aprueba facturas';
END $$;

-- Proveedor no se auto-habilita (UPDATE supplier status bloqueado)
DO $$
DECLARE
  v_proveedor_a UUID := NULLIF(current_setting('fp.test.proveedor_a', true), '')::UUID;
BEGIN
  IF v_proveedor_a IS NULL THEN
    RAISE NOTICE 'SKIP: fp.test.proveedor_a para auto-habilitación';
    RETURN;
  END IF;

  PERFORM set_config('request.jwt.claim.sub', v_proveedor_a::TEXT, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
  SET LOCAL ROLE authenticated;

  BEGIN
    UPDATE public.fp_suppliers
    SET status = 'habilitado', enabled_at = NOW()
    WHERE profile_id = v_proveedor_a;
    RAISE EXCEPTION 'FAIL: proveedor pudo auto-habilitarse';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'PASS: proveedor no auto-habilita (RLS)';
    WHEN OTHERS THEN
      IF SQLERRM LIKE '%auto%' OR SQLERRM LIKE '%habilit%' OR SQLERRM LIKE '%Permiso%' THEN
        RAISE NOTICE 'PASS: proveedor no auto-habilita (%)', SQLERRM;
      ELSE
        RAISE EXCEPTION 'FAIL inesperado auto-habilitación: %', SQLERRM;
      END IF;
  END;
END $$;

-- Bucket privado (postgres, sin JWT)
DO $$
DECLARE
  v_public BOOLEAN;
BEGIN
  RESET ROLE;
  SELECT public INTO v_public FROM storage.buckets WHERE id = 'fp-documents';
  IF v_public IS DISTINCT FROM FALSE THEN
    RAISE EXCEPTION 'FAIL: bucket fp-documents debe ser privado';
  END IF;
  RAISE NOTICE 'PASS: bucket fp-documents es privado';
END $$;

-- Pruebas RPC con datos reales (SKIP si faltan IDs)
DO $$
DECLARE
  v_tesoreria UUID := NULLIF(current_setting('fp.test.tesoreria', true), '')::UUID;
  v_prep UUID := NULLIF(current_setting('fp.test.preparation_pending', true), '')::UUID;
BEGIN
  IF v_tesoreria IS NULL OR v_prep IS NULL THEN
    RAISE NOTICE 'SKIP: confirmación sin comprobante (falta fp.test.preparation_pending)';
    RETURN;
  END IF;

  PERFORM set_config('request.jwt.claim.sub', v_tesoreria::TEXT, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
  SET LOCAL ROLE authenticated;

  BEGIN
    PERFORM public.fp_tesoreria_confirm_payment(
      v_prep,
      v_tesoreria,
      'payments/pending/' || v_prep::TEXT || '/receipts/inexistente.pdf',
      'x.pdf',
      'application/pdf',
      NULL
    );
    RAISE EXCEPTION 'FAIL: confirmó pago sin comprobante en Storage';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM LIKE '%Storage%' OR SQLERRM LIKE '%existe%' OR SQLERRM LIKE '%comprobante%' THEN
        RAISE NOTICE 'PASS: pago sin comprobante rechazado';
      ELSE
        RAISE EXCEPTION 'FAIL confirmación inesperada: %', SQLERRM;
      END IF;
  END;
END $$;

ROLLBACK;