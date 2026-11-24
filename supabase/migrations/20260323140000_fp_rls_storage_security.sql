-- =============================================================================
-- Cooperativa San José de la Dormida — Facturas de Proveedores
-- Etapa 3: RLS, Storage privado, endurecimiento de RPC
--
-- PREREQUISITO OBLIGATORIO:
--   Ejecutar antes: 20260323130000_fp_facturas_proveedores.sql
--
-- NO modifica tablas ajenas al módulo fp_* (conversations, invoice_requests, etc.)
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 0. Verificación de prerequisitos
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'fp_profiles'
  ) THEN
    RAISE EXCEPTION
      'Etapa 2 no aplicada: falta public.fp_profiles. Ejecute 20260323130000_fp_facturas_proveedores.sql antes de esta migración.';
  END IF;

  IF (
    SELECT COUNT(*)::INTEGER
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename LIKE 'fp\_%' ESCAPE '\'
  ) < 14 THEN
    RAISE EXCEPTION
      'Etapa 2 incompleta: se esperan al menos 14 tablas public.fp_*. Revise la migración anterior.';
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- 1. Helpers de autorización (SECURITY DEFINER, search_path fijo)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fp_require_authenticated()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_uid UUID;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Autenticación requerida';
  END IF;
  RETURN v_uid;
END;
$$;

CREATE OR REPLACE FUNCTION public.fp_current_user_role()
RETURNS public.fp_user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.role
  FROM public.fp_profiles p
  WHERE p.id = auth.uid()
    AND p.is_active = TRUE;
$$;

CREATE OR REPLACE FUNCTION public.fp_assert_role(p_allowed public.fp_user_role[])
RETURNS VOID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.fp_user_role;
BEGIN
  PERFORM public.fp_require_authenticated();
  v_role := public.fp_current_user_role();
  IF v_role IS NULL THEN
    RAISE EXCEPTION 'Perfil inactivo o inexistente';
  END IF;
  IF NOT (v_role = ANY (p_allowed)) THEN
    RAISE EXCEPTION 'Permiso denegado para el rol %', v_role;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.fp_my_supplier_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id
  FROM public.fp_suppliers s
  WHERE s.profile_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.fp_invoice_owned_by_me(p_invoice_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.fp_invoices i
    INNER JOIN public.fp_suppliers s ON s.id = i.supplier_id
    WHERE i.id = p_invoice_id
      AND s.profile_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.fp_is_staff_reader()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.fp_current_user_role() IN (
    'compras',
    'tesoreria',
    'gerente',
    'desarrollador'
  );
$$;

CREATE OR REPLACE FUNCTION public.fp_assert_actor_is_self(p_actor_id UUID)
RETURNS VOID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID;
  v_role public.fp_user_role;
BEGIN
  v_uid := public.fp_require_authenticated();
  v_role := public.fp_current_user_role();
  IF v_role = 'desarrollador' THEN
    RETURN;
  END IF;
  IF p_actor_id IS DISTINCT FROM v_uid THEN
    RAISE EXCEPTION 'No puede actuar en nombre de otro usuario';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.fp_require_authenticated() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fp_current_user_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fp_assert_role(public.fp_user_role[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fp_my_supplier_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fp_invoice_owned_by_me(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fp_is_staff_reader() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fp_assert_actor_is_self(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.fp_require_authenticated() TO authenticated;
GRANT EXECUTE ON FUNCTION public.fp_current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.fp_assert_role(public.fp_user_role[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fp_my_supplier_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.fp_invoice_owned_by_me(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fp_is_staff_reader() TO authenticated;
GRANT EXECUTE ON FUNCTION public.fp_assert_actor_is_self(UUID) TO authenticated;

-- ---------------------------------------------------------------------------
-- 2. Validación de rutas Storage (evitar path traversal entre proveedores)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fp_assert_storage_path_for_supplier(
  p_path TEXT,
  p_supplier_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_path IS NULL OR char_length(trim(p_path)) = 0 THEN
    RAISE EXCEPTION 'Ruta de almacenamiento vacía';
  END IF;
  IF position('..' IN p_path) > 0 THEN
    RAISE EXCEPTION 'Ruta de almacenamiento inválida';
  END IF;
  IF p_path !~ ('^suppliers/' || p_supplier_id::TEXT || '/documents/.+') THEN
    RAISE EXCEPTION 'La ruta no pertenece al proveedor autorizado';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.fp_assert_storage_path_for_invoice(
  p_path TEXT,
  p_invoice_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_path IS NULL OR char_length(trim(p_path)) = 0 THEN
    RAISE EXCEPTION 'Ruta de almacenamiento vacía';
  END IF;
  IF position('..' IN p_path) > 0 THEN
    RAISE EXCEPTION 'Ruta de almacenamiento inválida';
  END IF;
  IF p_path !~ ('^invoices/' || p_invoice_id::TEXT || '/attachments/.+') THEN
    RAISE EXCEPTION 'La ruta no pertenece a la factura indicada';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.fp_assert_storage_path_for_payment_prep(
  p_path TEXT,
  p_preparation_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  IF p_path IS NULL OR char_length(trim(p_path)) = 0 THEN
    RAISE EXCEPTION 'Ruta de almacenamiento vacía';
  END IF;
  IF position('..' IN p_path) > 0 THEN
    RAISE EXCEPTION 'Ruta de almacenamiento inválida';
  END IF;
  IF p_path !~ ('^payments/pending/' || p_preparation_id::TEXT || '/receipts/.+') THEN
    RAISE EXCEPTION 'La ruta no pertenece a la preparación de pago indicada';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.fp_storage_object_exists(
  p_bucket_id TEXT,
  p_path TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, storage
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM storage.objects o
    WHERE o.bucket_id = p_bucket_id
      AND o.name = p_path
  );
$$;

CREATE OR REPLACE FUNCTION public.fp_storage_object_metadata(
  p_bucket_id TEXT,
  p_path TEXT,
  OUT mime_type TEXT,
  OUT size_bytes BIGINT
)
RETURNS RECORD
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, storage
AS $$
  SELECT o.metadata ->> 'mimetype', (o.metadata ->> 'size')::BIGINT
  FROM storage.objects o
  WHERE o.bucket_id = p_bucket_id
    AND o.name = p_path
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.fp_assert_storage_object_valid(
  p_bucket_id TEXT,
  p_path TEXT,
  p_allowed_mimes TEXT[] DEFAULT ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
  p_max_bytes BIGINT DEFAULT 10485760
)
RETURNS VOID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  v_mime TEXT;
  v_size BIGINT;
BEGIN
  IF p_bucket_id IS DISTINCT FROM 'fp-documents' THEN
    RAISE EXCEPTION 'Bucket no permitido: %', COALESCE(p_bucket_id, '(null)');
  END IF;

  IF NOT public.fp_storage_object_exists(p_bucket_id, p_path) THEN
    RAISE EXCEPTION 'El archivo no existe en Storage';
  END IF;

  SELECT m.mime_type, m.size_bytes
  INTO v_mime, v_size
  FROM public.fp_storage_object_metadata(p_bucket_id, p_path) AS m;

  IF v_mime IS NULL OR NOT (v_mime = ANY (p_allowed_mimes)) THEN
    RAISE EXCEPTION 'Tipo MIME no permitido en Storage: %', COALESCE(v_mime, '(desconocido)');
  END IF;

  IF v_size IS NULL OR v_size <= 0 OR v_size > p_max_bytes THEN
    RAISE EXCEPTION 'Tamaño de archivo inválido o supera el límite (% bytes)', COALESCE(v_size, 0);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.fp_invoice_saldo_disponible(
  p_invoice_id UUID,
  p_exclude_preparation_id UUID DEFAULT NULL
)
RETURNS NUMERIC(14, 2)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT GREATEST(
    i.total_amount
    - COALESCE((
      SELECT SUM(p.amount)
      FROM public.fp_payments p
      WHERE p.invoice_id = i.id
    ), 0)
    - COALESCE((
      SELECT SUM(pp.amount)
      FROM public.fp_payment_preparations pp
      WHERE pp.invoice_id = i.id
        AND pp.status = 'pending_upload'
        AND pp.expires_at > NOW()
        AND (p_exclude_preparation_id IS NULL OR pp.id IS DISTINCT FROM p_exclude_preparation_id)
    ), 0),
    0
  )
  FROM public.fp_invoices i
  WHERE i.id = p_invoice_id;
$$;

REVOKE ALL ON FUNCTION public.fp_storage_object_exists(TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fp_storage_object_metadata(TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fp_assert_storage_object_valid(TEXT, TEXT, TEXT[], BIGINT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fp_invoice_saldo_disponible(UUID, UUID) FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.fp_assert_allowed_document_mime(p_mime TEXT)
RETURNS VOID
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_mime IS NULL OR p_mime NOT IN (
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
  ) THEN
    RAISE EXCEPTION 'Tipo MIME no permitido: %', COALESCE(p_mime, '(null)');
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.fp_assert_storage_path_for_supplier(TEXT, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fp_assert_storage_path_for_invoice(TEXT, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fp_assert_storage_path_for_payment_prep(TEXT, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fp_assert_allowed_document_mime(TEXT) FROM PUBLIC;

-- ---------------------------------------------------------------------------
-- 3. Bloqueo de auto-habilitación y columnas administrativas en proveedores
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fp_suppliers_guard_proveedor_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.fp_user_role;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  v_role := public.fp_current_user_role();

  IF v_role = 'compras' THEN
    RAISE EXCEPTION 'Compras debe usar fp_compras_set_supplier_status para cambios administrativos';
  END IF;

  IF v_role = 'proveedor' AND OLD.profile_id = auth.uid() THEN
    IF NEW.profile_id IS DISTINCT FROM OLD.profile_id THEN
      RAISE EXCEPTION 'No puede cambiar profile_id';
    END IF;
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      RAISE EXCEPTION 'El proveedor no puede modificar status directamente; use RPC autorizadas';
    END IF;
    IF NEW.enabled_at IS DISTINCT FROM OLD.enabled_at
      OR NEW.enabled_by IS DISTINCT FROM OLD.enabled_by
      OR NEW.rejection_reason IS DISTINCT FROM OLD.rejection_reason THEN
      RAISE EXCEPTION 'El proveedor no puede modificar campos de habilitación';
    END IF;
    IF OLD.status = 'habilitado' THEN
      IF NEW.cuit IS DISTINCT FROM OLD.cuit
        OR NEW.razon_social IS DISTINCT FROM OLD.razon_social
        OR NEW.condicion_iva IS DISTINCT FROM OLD.condicion_iva
        OR NEW.domicilio_fiscal IS DISTINCT FROM OLD.domicilio_fiscal THEN
        RAISE EXCEPTION 'Proveedor habilitado: datos fiscales inmutables; solicite revisión a Compras';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.fp_profiles_guard_self_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND OLD.id = auth.uid() THEN
    IF NEW.email IS DISTINCT FROM OLD.email THEN
      RAISE EXCEPTION 'El email se gestiona en Supabase Auth; no puede modificarse en fp_profiles';
    END IF;
    IF NEW.id IS DISTINCT FROM OLD.id THEN
      RAISE EXCEPTION 'No puede cambiar el identificador del perfil';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_fp_profiles_guard_self ON public.fp_profiles;
CREATE TRIGGER tr_fp_profiles_guard_self
  BEFORE UPDATE ON public.fp_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.fp_profiles_guard_self_update();

DROP TRIGGER IF EXISTS tr_fp_suppliers_guard_proveedor ON public.fp_suppliers;
CREATE TRIGGER tr_fp_suppliers_guard_proveedor
  BEFORE UPDATE ON public.fp_suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.fp_suppliers_guard_proveedor_update();

-- ---------------------------------------------------------------------------
-- 4. Endurecimiento de funciones internas (sin GRANT a authenticated)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fp_write_audit(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_action TEXT,
  p_actor_id UUID,
  p_from_status public.fp_invoice_status DEFAULT NULL,
  p_to_status public.fp_invoice_status DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.fp_audit_log (
    entity_type,
    entity_id,
    action,
    actor_id,
    from_status,
    to_status,
    metadata
  )
  VALUES (
    p_entity_type,
    p_entity_id,
    p_action,
    p_actor_id,
    p_from_status,
    p_to_status,
    p_metadata
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.fp_sync_invoice_balance(p_invoice_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total NUMERIC(14, 2);
  v_paid NUMERIC(14, 2);
  v_saldo NUMERIC(14, 2);
  v_status public.fp_invoice_status;
  v_new_status public.fp_invoice_status;
BEGIN
  SELECT total_amount, status
  INTO v_total, v_status
  FROM public.fp_invoices
  WHERE id = p_invoice_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Factura no encontrada';
  END IF;

  IF v_status = 'anulada' THEN
    RETURN;
  END IF;

  SELECT COALESCE(SUM(amount), 0)
  INTO v_paid
  FROM public.fp_payments
  WHERE invoice_id = p_invoice_id;

  v_saldo := v_total - v_paid;

  IF v_saldo < 0 THEN
    RAISE EXCEPTION 'La suma de pagos supera el importe total de la factura';
  END IF;

  IF v_status IN ('pendiente_pago', 'pago_parcial', 'pagada') THEN
    IF v_saldo = 0 AND v_paid > 0 THEN
      v_new_status := 'pagada';
    ELSIF v_paid > 0 AND v_saldo > 0 THEN
      v_new_status := 'pago_parcial';
    ELSE
      v_new_status := 'pendiente_pago';
    END IF;
  ELSE
    v_new_status := v_status;
  END IF;

  UPDATE public.fp_invoices
  SET
    saldo_pendiente = v_saldo,
    status = v_new_status,
    updated_at = NOW()
  WHERE id = p_invoice_id;
END;
$$;

REVOKE ALL ON FUNCTION public.fp_write_audit(
  TEXT, UUID, TEXT, UUID, public.fp_invoice_status, public.fp_invoice_status, JSONB
) FROM PUBLIC;

REVOKE ALL ON FUNCTION public.fp_sync_invoice_balance(UUID) FROM PUBLIC;

-- ---------------------------------------------------------------------------
-- 5. RPC protegidas
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fp_compras_start_review(
  p_invoice_id UUID,
  p_reviewer_id UUID
)
RETURNS public.fp_invoices
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invoice public.fp_invoices;
  v_old_status public.fp_invoice_status;
BEGIN
  PERFORM public.fp_assert_role(ARRAY['compras', 'desarrollador']::public.fp_user_role[]);
  PERFORM public.fp_assert_actor_is_self(p_reviewer_id);

  SELECT * INTO v_invoice FROM public.fp_invoices WHERE id = p_invoice_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Factura no encontrada';
  END IF;

  v_old_status := v_invoice.status;

  IF v_old_status NOT IN ('presentada') THEN
    RAISE EXCEPTION 'La factura no está en estado presentada (actual: %)', v_old_status;
  END IF;

  UPDATE public.fp_invoices
  SET status = 'en_revision', updated_at = NOW()
  WHERE id = p_invoice_id
  RETURNING * INTO v_invoice;

  PERFORM public.fp_write_audit(
    'invoice',
    p_invoice_id,
    'compras_start_review',
    p_reviewer_id,
    v_old_status,
    'en_revision',
    jsonb_build_object('revision_number', v_invoice.revision_number)
  );

  RETURN v_invoice;
END;
$$;

CREATE OR REPLACE FUNCTION public.fp_compras_decide(
  p_invoice_id UUID,
  p_reviewer_id UUID,
  p_decision public.fp_compras_decision,
  p_notes TEXT DEFAULT NULL
)
RETURNS public.fp_invoices
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invoice public.fp_invoices;
  v_old_status public.fp_invoice_status;
  v_new_status public.fp_invoice_status;
BEGIN
  PERFORM public.fp_assert_role(ARRAY['compras', 'desarrollador']::public.fp_user_role[]);
  PERFORM public.fp_assert_actor_is_self(p_reviewer_id);

  SELECT * INTO v_invoice FROM public.fp_invoices WHERE id = p_invoice_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Factura no encontrada';
  END IF;

  v_old_status := v_invoice.status;

  IF v_old_status NOT IN ('en_revision') THEN
    RAISE EXCEPTION 'La factura no está en revisión (actual: %)', v_old_status;
  END IF;

  INSERT INTO public.fp_compras_reviews (
    invoice_id,
    decision,
    reviewer_id,
    notes,
    revision_number
  )
  VALUES (
    p_invoice_id,
    p_decision,
    p_reviewer_id,
    p_notes,
    v_invoice.revision_number
  );

  CASE p_decision
    WHEN 'aprobada' THEN
      v_new_status := 'pendiente_pago';
    WHEN 'observada' THEN
      v_new_status := 'observada';
    WHEN 'rechazada' THEN
      v_new_status := 'rechazada';
  END CASE;

  UPDATE public.fp_invoices
  SET status = v_new_status, updated_at = NOW()
  WHERE id = p_invoice_id
  RETURNING * INTO v_invoice;

  PERFORM public.fp_write_audit(
    'invoice',
    p_invoice_id,
    'compras_decide',
    p_reviewer_id,
    v_old_status,
    v_new_status,
    jsonb_build_object(
      'decision', p_decision,
      'notes', p_notes,
      'revision_number', v_invoice.revision_number
    )
  );

  IF p_decision = 'aprobada' THEN
    PERFORM public.fp_write_audit(
      'invoice',
      p_invoice_id,
      'compras_aprobada',
      p_reviewer_id,
      'aprobada'::public.fp_invoice_status,
      'pendiente_pago',
      jsonb_build_object('via', 'post_control')
    );
  END IF;

  RETURN v_invoice;
END;
$$;

CREATE OR REPLACE FUNCTION public.fp_proveedor_save_observed_invoice_draft(
  p_invoice_id UUID,
  p_actor_id UUID,
  p_invoice_type CHAR(1),
  p_point_of_sale INTEGER,
  p_invoice_number BIGINT,
  p_invoice_date DATE,
  p_currency CHAR(3),
  p_total_amount NUMERIC(14, 2),
  p_correction_reason TEXT,
  p_purchase_order_id UUID DEFAULT NULL
)
RETURNS public.fp_invoices
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invoice public.fp_invoices;
BEGIN
  PERFORM public.fp_assert_role(ARRAY['proveedor', 'desarrollador']::public.fp_user_role[]);
  PERFORM public.fp_assert_actor_is_self(p_actor_id);

  IF p_correction_reason IS NULL OR char_length(trim(p_correction_reason)) = 0 THEN
    RAISE EXCEPTION 'Debe indicar el motivo de la corrección';
  END IF;

  IF p_total_amount IS NULL OR p_total_amount <= 0 THEN
    RAISE EXCEPTION 'El importe total debe ser mayor que cero';
  END IF;

  IF NOT public.fp_invoice_owned_by_me(p_invoice_id) THEN
    RAISE EXCEPTION 'No puede modificar facturas de otro proveedor';
  END IF;

  SELECT * INTO v_invoice FROM public.fp_invoices WHERE id = p_invoice_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Factura no encontrada';
  END IF;

  IF v_invoice.status <> 'observada' THEN
    RAISE EXCEPTION 'Solo pueden corregirse facturas en estado observada';
  END IF;

  IF EXISTS (SELECT 1 FROM public.fp_payments WHERE invoice_id = p_invoice_id) THEN
    RAISE EXCEPTION 'No puede corregir una factura con pagos registrados';
  END IF;

  UPDATE public.fp_invoices
  SET
    invoice_type = p_invoice_type,
    point_of_sale = p_point_of_sale,
    invoice_number = p_invoice_number,
    invoice_date = p_invoice_date,
    currency = p_currency,
    total_amount = p_total_amount,
    purchase_order_id = p_purchase_order_id,
    updated_at = NOW()
  WHERE id = p_invoice_id
  RETURNING * INTO v_invoice;

  PERFORM public.fp_write_audit(
    'invoice',
    p_invoice_id,
    'proveedor_correction_draft',
    p_actor_id,
    'observada',
    'observada',
    jsonb_build_object('correction_reason', p_correction_reason)
  );

  RETURN v_invoice;
END;
$$;

CREATE OR REPLACE FUNCTION public.fp_proveedor_correct_observed_invoice(
  p_invoice_id UUID,
  p_actor_id UUID,
  p_invoice_type CHAR(1),
  p_point_of_sale INTEGER,
  p_invoice_number BIGINT,
  p_invoice_date DATE,
  p_currency CHAR(3),
  p_total_amount NUMERIC(14, 2),
  p_correction_reason TEXT,
  p_new_pdf_storage_path TEXT,
  p_new_pdf_file_name TEXT,
  p_new_pdf_mime_type TEXT,
  p_purchase_order_id UUID DEFAULT NULL
)
RETURNS public.fp_invoices
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invoice public.fp_invoices;
  v_old_status public.fp_invoice_status;
  v_old_revision INTEGER;
  v_new_revision INTEGER;
  v_attachments JSONB;
  v_last_obs TEXT;
  v_pdf_size BIGINT;
  v_meta RECORD;
BEGIN
  PERFORM public.fp_assert_role(ARRAY['proveedor', 'desarrollador']::public.fp_user_role[]);
  PERFORM public.fp_assert_actor_is_self(p_actor_id);

  IF p_correction_reason IS NULL OR char_length(trim(p_correction_reason)) = 0 THEN
    RAISE EXCEPTION 'Debe indicar el motivo de la corrección';
  END IF;

  IF p_total_amount IS NULL OR p_total_amount <= 0 THEN
    RAISE EXCEPTION 'El importe total debe ser mayor que cero';
  END IF;

  IF p_new_pdf_storage_path IS NULL OR char_length(trim(p_new_pdf_storage_path)) = 0 THEN
    RAISE EXCEPTION 'Debe adjuntar el PDF corregido antes de re-presentar';
  END IF;

  IF p_new_pdf_mime_type IS DISTINCT FROM 'application/pdf' THEN
    RAISE EXCEPTION 'El comprobante de factura corregida debe ser PDF';
  END IF;

  PERFORM public.fp_assert_storage_path_for_invoice(p_new_pdf_storage_path, p_invoice_id);

  IF EXISTS (
    SELECT 1 FROM public.fp_invoice_attachments a
    WHERE a.storage_path = p_new_pdf_storage_path
  ) THEN
    RAISE EXCEPTION 'La ruta del PDF ya está registrada en otra factura o revisión';
  END IF;

  PERFORM public.fp_assert_storage_object_valid(
    'fp-documents',
    p_new_pdf_storage_path,
    ARRAY['application/pdf']::TEXT[],
    10485760
  );

  IF NOT public.fp_invoice_owned_by_me(p_invoice_id) THEN
    RAISE EXCEPTION 'No puede modificar facturas de otro proveedor';
  END IF;

  SELECT * INTO v_invoice FROM public.fp_invoices WHERE id = p_invoice_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Factura no encontrada';
  END IF;

  v_old_status := v_invoice.status;
  v_old_revision := v_invoice.revision_number;
  v_new_revision := v_old_revision + 1;

  IF v_old_status <> 'observada' THEN
    RAISE EXCEPTION 'Solo pueden confirmarse correcciones en estado observada';
  END IF;

  IF EXISTS (SELECT 1 FROM public.fp_payments WHERE invoice_id = p_invoice_id) THEN
    RAISE EXCEPTION 'No puede corregir una factura con pagos registrados';
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', a.id,
    'kind', a.kind,
    'storage_path', a.storage_path,
    'file_name', a.file_name,
    'revision_number', a.revision_number
  ) ORDER BY a.created_at), '[]'::JSONB)
  INTO v_attachments
  FROM public.fp_invoice_attachments a
  WHERE a.invoice_id = p_invoice_id;

  SELECT cr.notes INTO v_last_obs
  FROM public.fp_compras_reviews cr
  WHERE cr.invoice_id = p_invoice_id
    AND cr.decision = 'observada'
    AND cr.revision_number = v_old_revision
  ORDER BY cr.reviewed_at DESC
  LIMIT 1;

  SELECT m.size_bytes INTO v_pdf_size
  FROM public.fp_storage_object_metadata('fp-documents', p_new_pdf_storage_path) AS m;

  INSERT INTO public.fp_invoice_revision_snapshots (
    invoice_id,
    revision_number,
    invoice_type,
    point_of_sale,
    invoice_number,
    invoice_date,
    currency,
    total_amount,
    purchase_order_id,
    saldo_pendiente,
    status,
    attachment_metadata,
    correction_reason,
    observation_notes,
    corrected_by
  )
  VALUES (
    p_invoice_id,
    v_old_revision,
    v_invoice.invoice_type,
    v_invoice.point_of_sale,
    v_invoice.invoice_number,
    v_invoice.invoice_date,
    v_invoice.currency,
    v_invoice.total_amount,
    v_invoice.purchase_order_id,
    v_invoice.saldo_pendiente,
    v_invoice.status,
    v_attachments,
    p_correction_reason,
    v_last_obs,
    p_actor_id
  );

  UPDATE public.fp_invoices
  SET
    invoice_type = p_invoice_type,
    point_of_sale = p_point_of_sale,
    invoice_number = p_invoice_number,
    invoice_date = p_invoice_date,
    currency = p_currency,
    total_amount = p_total_amount,
    purchase_order_id = p_purchase_order_id,
    saldo_pendiente = p_total_amount,
    status = 'presentada',
    revision_number = v_new_revision,
    presented_at = NOW(),
    updated_at = NOW()
  WHERE id = p_invoice_id
  RETURNING * INTO v_invoice;

  INSERT INTO public.fp_invoice_attachments (
    invoice_id,
    kind,
    storage_path,
    file_name,
    mime_type,
    size_bytes,
    revision_number,
    uploaded_by
  )
  VALUES (
    p_invoice_id,
    'factura_pdf',
    p_new_pdf_storage_path,
    COALESCE(NULLIF(trim(p_new_pdf_file_name), ''), 'factura-corregida.pdf'),
    p_new_pdf_mime_type,
    v_pdf_size,
    v_new_revision,
    p_actor_id
  );

  PERFORM public.fp_write_audit(
    'invoice',
    p_invoice_id,
    'proveedor_correct_observed',
    p_actor_id,
    v_old_status,
    'presentada',
    jsonb_build_object(
      'revision_number', v_invoice.revision_number,
      'correction_reason', p_correction_reason,
      'new_pdf_storage_path', p_new_pdf_storage_path
    )
  );

  RETURN v_invoice;
END;
$$;

CREATE OR REPLACE FUNCTION public.fp_tesoreria_prepare_payment(
  p_invoice_id UUID,
  p_payment_date DATE,
  p_amount NUMERIC(14, 2),
  p_payment_method public.fp_payment_method,
  p_prepared_by UUID,
  p_notes TEXT DEFAULT NULL,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS public.fp_payment_preparations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invoice public.fp_invoices;
  v_saldo NUMERIC(14, 2);
  v_prep public.fp_payment_preparations;
  v_existing public.fp_payment_preparations;
BEGIN
  PERFORM public.fp_assert_role(ARRAY['tesoreria', 'desarrollador']::public.fp_user_role[]);
  PERFORM public.fp_assert_actor_is_self(p_prepared_by);

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'El importe del pago debe ser mayor que cero';
  END IF;

  IF p_idempotency_key IS NOT NULL THEN
    SELECT * INTO v_existing
    FROM public.fp_payment_preparations
    WHERE idempotency_key = p_idempotency_key
      AND prepared_by = p_prepared_by;

    IF FOUND THEN
      IF v_existing.invoice_id IS DISTINCT FROM p_invoice_id
        OR v_existing.amount IS DISTINCT FROM p_amount
        OR v_existing.payment_method IS DISTINCT FROM p_payment_method
        OR v_existing.prepared_by IS DISTINCT FROM p_prepared_by THEN
        RAISE EXCEPTION 'La clave de idempotencia ya se usó para otra operación';
      END IF;

      IF v_existing.status = 'confirmed' AND v_existing.confirmed_payment_id IS NOT NULL THEN
        RETURN v_existing;
      END IF;

      IF v_existing.status = 'cancelled' OR v_existing.status = 'expired' THEN
        RAISE EXCEPTION 'La preparación asociada a la clave de idempotencia ya no es válida';
      END IF;

      IF v_existing.status = 'pending_upload' AND v_existing.expires_at > NOW() THEN
        RETURN v_existing;
      END IF;
    END IF;
  END IF;

  SELECT * INTO v_invoice FROM public.fp_invoices WHERE id = p_invoice_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Factura no encontrada';
  END IF;

  IF v_invoice.status NOT IN ('pendiente_pago', 'pago_parcial') THEN
    RAISE EXCEPTION 'La factura no admite pagos en estado %', v_invoice.status;
  END IF;

  v_saldo := public.fp_invoice_saldo_disponible(p_invoice_id, NULL);
  IF p_amount > v_saldo THEN
    RAISE EXCEPTION 'El pago (%) supera el saldo disponible (%)', p_amount, v_saldo;
  END IF;

  INSERT INTO public.fp_payment_preparations (
    invoice_id,
    payment_date,
    amount,
    payment_method,
    prepared_by,
    notes,
    status,
    idempotency_key
  )
  VALUES (
    p_invoice_id,
    p_payment_date,
    p_amount,
    p_payment_method,
    p_prepared_by,
    p_notes,
    'pending_upload',
    p_idempotency_key
  )
  RETURNING * INTO v_prep;

  PERFORM public.fp_write_audit(
    'payment_preparation',
    v_prep.id,
    'payment_prepared',
    p_prepared_by,
    NULL,
    NULL,
    jsonb_build_object('invoice_id', p_invoice_id, 'amount', p_amount)
  );

  RETURN v_prep;
END;
$$;

CREATE OR REPLACE FUNCTION public.fp_tesoreria_confirm_payment(
  p_preparation_id UUID,
  p_prepared_by UUID,
  p_receipt_storage_path TEXT,
  p_receipt_file_name TEXT,
  p_receipt_mime_type TEXT,
  p_notification_subject TEXT DEFAULT NULL
)
RETURNS public.fp_payments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prep public.fp_payment_preparations;
  v_invoice public.fp_invoices;
  v_payment public.fp_payments;
  v_supplier public.fp_suppliers;
  v_saldo NUMERIC(14, 2);
  v_saldo_after NUMERIC(14, 2);
  v_paid_after NUMERIC(14, 2);
  v_subject TEXT;
BEGIN
  PERFORM public.fp_assert_role(ARRAY['tesoreria', 'desarrollador']::public.fp_user_role[]);
  PERFORM public.fp_assert_actor_is_self(p_prepared_by);

  IF p_receipt_storage_path IS NULL OR char_length(trim(p_receipt_storage_path)) = 0 THEN
    RAISE EXCEPTION 'El comprobante es obligatorio';
  END IF;

  PERFORM public.fp_assert_allowed_document_mime(p_receipt_mime_type);
  PERFORM public.fp_assert_storage_path_for_payment_prep(p_receipt_storage_path, p_preparation_id);

  PERFORM public.fp_assert_storage_object_valid(
    'fp-documents',
    p_receipt_storage_path,
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']::TEXT[],
    10485760
  );

  IF EXISTS (
    SELECT 1 FROM public.fp_payment_receipts r
    WHERE r.storage_path = p_receipt_storage_path
  ) THEN
    RAISE EXCEPTION 'El comprobante ya fue confirmado en otro pago';
  END IF;

  SELECT * INTO v_prep
  FROM public.fp_payment_preparations
  WHERE id = p_preparation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Preparación de pago no encontrada';
  END IF;

  IF v_prep.status = 'confirmed' AND v_prep.confirmed_payment_id IS NOT NULL THEN
    IF v_prep.receipt_storage_path IS NOT NULL
      AND v_prep.receipt_storage_path IS DISTINCT FROM p_receipt_storage_path
      AND v_prep.prepared_by IS DISTINCT FROM p_prepared_by
      AND public.fp_current_user_role() <> 'desarrollador' THEN
      RAISE EXCEPTION 'La preparación ya fue confirmada con otro comprobante';
    END IF;
    SELECT * INTO v_payment FROM public.fp_payments WHERE id = v_prep.confirmed_payment_id;
    RETURN v_payment;
  END IF;

  IF v_prep.status IN ('cancelled', 'expired') THEN
    RAISE EXCEPTION 'La preparación no puede confirmarse (estado %)', v_prep.status;
  END IF;

  IF v_prep.status <> 'pending_upload' THEN
    RAISE EXCEPTION 'La preparación no está pendiente de confirmación';
  END IF;

  IF v_prep.expires_at <= NOW() THEN
    UPDATE public.fp_payment_preparations
    SET status = 'expired'
    WHERE id = p_preparation_id;
    RAISE EXCEPTION 'La preparación de pago expiró';
  END IF;

  IF v_prep.prepared_by IS DISTINCT FROM p_prepared_by
    AND public.fp_current_user_role() <> 'desarrollador' THEN
    RAISE EXCEPTION 'Solo quien preparó el pago puede confirmarlo';
  END IF;

  SELECT * INTO v_invoice FROM public.fp_invoices WHERE id = v_prep.invoice_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Factura no encontrada';
  END IF;

  IF v_invoice.status NOT IN ('pendiente_pago', 'pago_parcial') THEN
    RAISE EXCEPTION 'La factura no admite pagos en estado %', v_invoice.status;
  END IF;

  v_saldo := public.fp_invoice_saldo_disponible(v_invoice.id, p_preparation_id);
  IF v_prep.amount > v_saldo THEN
    RAISE EXCEPTION 'El importe (%) supera el saldo disponible (%)', v_prep.amount, v_saldo;
  END IF;

  SELECT * INTO v_supplier FROM public.fp_suppliers WHERE id = v_invoice.supplier_id;

  INSERT INTO public.fp_payments (
    invoice_id,
    payment_date,
    amount,
    payment_method,
    registered_by,
    notes,
    preparation_id
  )
  VALUES (
    v_prep.invoice_id,
    v_prep.payment_date,
    v_prep.amount,
    v_prep.payment_method,
    p_prepared_by,
    v_prep.notes,
    v_prep.id
  )
  RETURNING * INTO v_payment;

  INSERT INTO public.fp_payment_receipts (
    payment_id,
    storage_path,
    file_name,
    mime_type
  )
  VALUES (
    v_payment.id,
    p_receipt_storage_path,
    COALESCE(p_receipt_file_name, 'comprobante'),
    p_receipt_mime_type
  );

  UPDATE public.fp_payment_preparations
  SET
    status = 'confirmed',
    confirmed_payment_id = v_payment.id,
    receipt_storage_path = p_receipt_storage_path,
    receipt_file_name = p_receipt_file_name,
    receipt_mime_type = p_receipt_mime_type
  WHERE id = p_preparation_id;

  PERFORM public.fp_sync_invoice_balance(v_prep.invoice_id);

  v_saldo_after := public.fp_invoice_saldo_disponible(v_prep.invoice_id);
  SELECT COALESCE(SUM(amount), 0) INTO v_paid_after
  FROM public.fp_payments
  WHERE invoice_id = v_prep.invoice_id;

  v_subject := COALESCE(
    p_notification_subject,
    format(
      'Comprobante de pago — Factura %s-%s-%s',
      v_invoice.invoice_type,
      lpad(v_invoice.point_of_sale::TEXT, 5, '0'),
      v_invoice.invoice_number::TEXT
    )
  );

  INSERT INTO public.fp_email_notifications (
    payment_id,
    recipient_email,
    subject,
    status,
    payload
  )
  VALUES (
    v_payment.id,
    v_supplier.email,
    v_subject,
    'pending',
    jsonb_build_object(
      'supplier_razon_social', v_supplier.razon_social,
      'invoice_id', v_prep.invoice_id,
      'preparation_id', p_preparation_id,
      'payment_amount', v_prep.amount,
      'payment_date', v_prep.payment_date,
      'payment_method', v_prep.payment_method,
      'saldo_pendiente', v_saldo_after,
      'total_paid', v_paid_after,
      'receipt_storage_path', p_receipt_storage_path,
      'idempotency_key', v_prep.idempotency_key
    )
  );

  PERFORM public.fp_write_audit(
    'payment',
    v_payment.id,
    'payment_confirmed',
    p_prepared_by,
    NULL,
    NULL,
    jsonb_build_object(
      'invoice_id', v_prep.invoice_id,
      'preparation_id', p_preparation_id,
      'amount', v_prep.amount,
      'saldo_pendiente', v_saldo_after
    )
  );

  RETURN v_payment;
END;
$$;

DROP FUNCTION IF EXISTS public.fp_register_payment(
  UUID, DATE, NUMERIC, public.fp_payment_method, UUID, TEXT, TEXT, TEXT, TEXT, TEXT
);

DROP FUNCTION IF EXISTS public.fp_proveedor_resubmit_invoice(UUID, UUID);

CREATE OR REPLACE FUNCTION public.fp_annul_invoice(
  p_invoice_id UUID,
  p_actor_id UUID,
  p_reason TEXT
)
RETURNS public.fp_invoices
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invoice public.fp_invoices;
  v_old_status public.fp_invoice_status;
  v_payment_count INTEGER;
BEGIN
  PERFORM public.fp_assert_role(ARRAY['compras', 'desarrollador']::public.fp_user_role[]);
  PERFORM public.fp_assert_actor_is_self(p_actor_id);

  IF p_reason IS NULL OR char_length(trim(p_reason)) = 0 THEN
    RAISE EXCEPTION 'Debe indicar el motivo de anulación';
  END IF;

  SELECT * INTO v_invoice FROM public.fp_invoices WHERE id = p_invoice_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Factura no encontrada';
  END IF;

  v_old_status := v_invoice.status;

  IF v_old_status IN ('pagada', 'anulada') THEN
    RAISE EXCEPTION 'No se puede anular una factura en estado %', v_old_status;
  END IF;

  SELECT COUNT(*)::INTEGER INTO v_payment_count
  FROM public.fp_payments
  WHERE invoice_id = p_invoice_id;

  IF v_payment_count > 0 THEN
    RAISE EXCEPTION 'No se puede anular una factura con pagos registrados';
  END IF;

  IF v_old_status = 'pago_parcial' THEN
    RAISE EXCEPTION 'No se puede anular una factura con estado %', v_old_status;
  END IF;

  UPDATE public.fp_payment_preparations
  SET status = 'cancelled'
  WHERE invoice_id = p_invoice_id
    AND status = 'pending_upload';

  UPDATE public.fp_invoices
  SET
    status = 'anulada',
    anulment_reason = trim(p_reason),
    anulled_at = NOW(),
    anulled_by = p_actor_id,
    updated_at = NOW()
  WHERE id = p_invoice_id
  RETURNING * INTO v_invoice;

  PERFORM public.fp_write_audit(
    'invoice',
    p_invoice_id,
    'invoice_annulled',
    p_actor_id,
    v_old_status,
    'anulada',
    jsonb_build_object('reason', trim(p_reason))
  );

  RETURN v_invoice;
END;
$$;

-- Compras: habilitación / suspensión de proveedores
CREATE OR REPLACE FUNCTION public.fp_compras_set_supplier_status(
  p_supplier_id UUID,
  p_new_status public.fp_supplier_status,
  p_actor_id UUID,
  p_notes TEXT DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS public.fp_suppliers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_supplier public.fp_suppliers;
  v_event public.fp_enablement_event_type;
BEGIN
  PERFORM public.fp_assert_role(ARRAY['compras', 'desarrollador']::public.fp_user_role[]);
  PERFORM public.fp_assert_actor_is_self(p_actor_id);

  SELECT * INTO v_supplier FROM public.fp_suppliers WHERE id = p_supplier_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Proveedor no encontrado';
  END IF;

  CASE p_new_status
    WHEN 'habilitado' THEN
      v_event := 'habilitacion';
      UPDATE public.fp_suppliers
      SET
        status = 'habilitado',
        enabled_at = NOW(),
        enabled_by = p_actor_id,
        rejection_reason = NULL,
        updated_at = NOW()
      WHERE id = p_supplier_id
      RETURNING * INTO v_supplier;
    WHEN 'suspendido' THEN
      v_event := 'suspension';
      UPDATE public.fp_suppliers
      SET status = 'suspendido', updated_at = NOW()
      WHERE id = p_supplier_id
      RETURNING * INTO v_supplier;
    WHEN 'rechazado' THEN
      v_event := 'rechazo';
      IF p_rejection_reason IS NULL OR char_length(trim(p_rejection_reason)) = 0 THEN
        RAISE EXCEPTION 'Debe indicar motivo de rechazo';
      END IF;
      UPDATE public.fp_suppliers
      SET
        status = 'rechazado',
        rejection_reason = trim(p_rejection_reason),
        updated_at = NOW()
      WHERE id = p_supplier_id
      RETURNING * INTO v_supplier;
    WHEN 'pendiente_habilitacion' THEN
      v_event := 'solicitud';
      UPDATE public.fp_suppliers
      SET status = 'pendiente_habilitacion', updated_at = NOW()
      WHERE id = p_supplier_id
      RETURNING * INTO v_supplier;
    ELSE
      RAISE EXCEPTION 'Transición de estado no permitida vía esta función: %', p_new_status;
  END CASE;

  INSERT INTO public.fp_supplier_enablement_events (
    supplier_id,
    event_type,
    notes,
    actor_id
  )
  VALUES (p_supplier_id, v_event, p_notes, p_actor_id);

  PERFORM public.fp_write_audit(
    'supplier',
    p_supplier_id,
    'supplier_status_changed',
    p_actor_id,
    NULL,
    NULL,
    jsonb_build_object('new_status', p_new_status, 'notes', p_notes)
  );

  RETURN v_supplier;
END;
$$;

-- Proveedor: solicitar habilitación (no auto-habilitación)
CREATE OR REPLACE FUNCTION public.fp_proveedor_request_enablement(
  p_supplier_id UUID,
  p_actor_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS public.fp_suppliers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_supplier public.fp_suppliers;
BEGIN
  PERFORM public.fp_assert_role(ARRAY['proveedor', 'desarrollador']::public.fp_user_role[]);
  PERFORM public.fp_assert_actor_is_self(p_actor_id);

  SELECT * INTO v_supplier FROM public.fp_suppliers WHERE id = p_supplier_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Proveedor no encontrado';
  END IF;

  IF v_supplier.profile_id IS DISTINCT FROM p_actor_id
    AND public.fp_current_user_role() <> 'desarrollador' THEN
    RAISE EXCEPTION 'No puede solicitar habilitación de otro proveedor';
  END IF;

  IF v_supplier.status NOT IN ('borrador', 'pendiente_habilitacion') THEN
    RAISE EXCEPTION 'El proveedor no puede solicitar habilitación en estado %', v_supplier.status;
  END IF;

  UPDATE public.fp_suppliers
  SET status = 'pendiente_habilitacion', updated_at = NOW()
  WHERE id = p_supplier_id
  RETURNING * INTO v_supplier;

  INSERT INTO public.fp_supplier_enablement_events (
    supplier_id,
    event_type,
    notes,
    actor_id
  )
  VALUES (p_supplier_id, 'solicitud', p_notes, p_actor_id);

  RETURN v_supplier;
END;
$$;

-- Desarrollador: asignación de rol (no auto-asignación desarrollador vía registro público)
CREATE OR REPLACE FUNCTION public.fp_developer_set_user_role(
  p_user_id UUID,
  p_new_role public.fp_user_role,
  p_actor_id UUID,
  p_is_active BOOLEAN DEFAULT NULL,
  p_reason TEXT DEFAULT NULL
)
RETURNS public.fp_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile public.fp_profiles;
BEGIN
  PERFORM public.fp_assert_role(ARRAY['desarrollador']::public.fp_user_role[]);
  PERFORM public.fp_assert_actor_is_self(p_actor_id);

  IF p_new_role = 'desarrollador' AND p_user_id = p_actor_id THEN
    RAISE EXCEPTION 'Use otro desarrollador para gestionar su propio rol';
  END IF;

  SELECT * INTO v_profile FROM public.fp_profiles WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuario no encontrado';
  END IF;

  UPDATE public.fp_profiles
  SET
    role = p_new_role,
    is_active = COALESCE(p_is_active, is_active),
    updated_at = NOW()
  WHERE id = p_user_id
  RETURNING * INTO v_profile;

  PERFORM public.fp_write_audit(
    'profile',
    p_user_id,
    'role_assigned',
    p_actor_id,
    NULL,
    NULL,
    jsonb_build_object(
      'new_role', p_new_role,
      'is_active', v_profile.is_active,
      'reason', p_reason
    )
  );

  RETURN v_profile;
END;
$$;

REVOKE ALL ON FUNCTION public.fp_compras_start_review(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fp_compras_decide(UUID, UUID, public.fp_compras_decision, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fp_proveedor_save_observed_invoice_draft(
  UUID, UUID, CHAR, INTEGER, BIGINT, DATE, CHAR, NUMERIC, TEXT, UUID
) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fp_proveedor_correct_observed_invoice(
  UUID, UUID, CHAR, INTEGER, BIGINT, DATE, CHAR, NUMERIC, TEXT, TEXT, TEXT, TEXT, UUID
) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fp_tesoreria_prepare_payment(
  UUID, DATE, NUMERIC, public.fp_payment_method, UUID, TEXT, TEXT
) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fp_tesoreria_confirm_payment(
  UUID, UUID, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fp_annul_invoice(UUID, UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fp_compras_set_supplier_status(
  UUID, public.fp_supplier_status, UUID, TEXT, TEXT
) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fp_proveedor_request_enablement(UUID, UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fp_developer_set_user_role(
  UUID, public.fp_user_role, UUID, BOOLEAN, TEXT
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.fp_compras_start_review(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fp_compras_decide(UUID, UUID, public.fp_compras_decision, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fp_proveedor_save_observed_invoice_draft(
  UUID, UUID, CHAR, INTEGER, BIGINT, DATE, CHAR, NUMERIC, TEXT, UUID
) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fp_proveedor_correct_observed_invoice(
  UUID, UUID, CHAR, INTEGER, BIGINT, DATE, CHAR, NUMERIC, TEXT, TEXT, TEXT, TEXT, UUID
) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fp_tesoreria_prepare_payment(
  UUID, DATE, NUMERIC, public.fp_payment_method, UUID, TEXT, TEXT
) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fp_tesoreria_confirm_payment(
  UUID, UUID, TEXT, TEXT, TEXT, TEXT
) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fp_annul_invoice(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fp_compras_set_supplier_status(
  UUID, public.fp_supplier_status, UUID, TEXT, TEXT
) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fp_proveedor_request_enablement(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fp_developer_set_user_role(
  UUID, public.fp_user_role, UUID, BOOLEAN, TEXT
) TO authenticated;

-- ---------------------------------------------------------------------------
-- 6. RLS — habilitar en tablas fp_*
-- ---------------------------------------------------------------------------
ALTER TABLE public.fp_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fp_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fp_supplier_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fp_supplier_enablement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fp_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fp_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fp_invoice_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fp_compras_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fp_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fp_payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fp_email_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fp_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fp_payment_preparations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fp_invoice_revision_snapshots ENABLE ROW LEVEL SECURITY;

-- fp_profiles
DROP POLICY IF EXISTS fp_profiles_select ON public.fp_profiles;
CREATE POLICY fp_profiles_select ON public.fp_profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR public.fp_current_user_role() IN ('compras', 'tesoreria', 'gerente', 'desarrollador')
  );

DROP POLICY IF EXISTS fp_profiles_update_self ON public.fp_profiles;
CREATE POLICY fp_profiles_update_self ON public.fp_profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- fp_suppliers
DROP POLICY IF EXISTS fp_suppliers_select ON public.fp_suppliers;
CREATE POLICY fp_suppliers_select ON public.fp_suppliers
  FOR SELECT TO authenticated
  USING (
    profile_id = auth.uid()
    OR public.fp_is_staff_reader()
  );

DROP POLICY IF EXISTS fp_suppliers_insert_proveedor ON public.fp_suppliers;
CREATE POLICY fp_suppliers_insert_proveedor ON public.fp_suppliers
  FOR INSERT TO authenticated
  WITH CHECK (
    profile_id = auth.uid()
    AND public.fp_current_user_role() IN ('proveedor', 'desarrollador')
    AND status IN ('borrador', 'pendiente_habilitacion')
  );

DROP POLICY IF EXISTS fp_suppliers_update_proveedor ON public.fp_suppliers;
CREATE POLICY fp_suppliers_update_proveedor ON public.fp_suppliers
  FOR UPDATE TO authenticated
  USING (
    profile_id = auth.uid()
    AND public.fp_current_user_role() IN ('proveedor', 'desarrollador')
  )
  WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS fp_suppliers_update_desarrollador ON public.fp_suppliers;
CREATE POLICY fp_suppliers_update_desarrollador ON public.fp_suppliers
  FOR UPDATE TO authenticated
  USING (public.fp_current_user_role() = 'desarrollador')
  WITH CHECK (public.fp_current_user_role() = 'desarrollador');

-- fp_supplier_documents
DROP POLICY IF EXISTS fp_supplier_documents_select ON public.fp_supplier_documents;
CREATE POLICY fp_supplier_documents_select ON public.fp_supplier_documents
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.fp_suppliers s
      WHERE s.id = supplier_id
        AND (s.profile_id = auth.uid() OR public.fp_is_staff_reader())
    )
  );

DROP POLICY IF EXISTS fp_supplier_documents_insert ON public.fp_supplier_documents;
CREATE POLICY fp_supplier_documents_insert ON public.fp_supplier_documents
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.fp_suppliers s
      WHERE s.id = supplier_id
        AND (
          (s.profile_id = auth.uid() AND public.fp_current_user_role() = 'proveedor')
          OR public.fp_current_user_role() = 'desarrollador'
        )
    )
  );

DROP POLICY IF EXISTS fp_supplier_documents_delete ON public.fp_supplier_documents;
CREATE POLICY fp_supplier_documents_delete ON public.fp_supplier_documents
  FOR DELETE TO authenticated
  USING (public.fp_current_user_role() = 'desarrollador');

-- fp_supplier_enablement_events (solo lectura; escritura vía RPC SECURITY DEFINER)
DROP POLICY IF EXISTS fp_enablement_events_select ON public.fp_supplier_enablement_events;
CREATE POLICY fp_enablement_events_select ON public.fp_supplier_enablement_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.fp_suppliers s
      WHERE s.id = supplier_id
        AND (s.profile_id = auth.uid() OR public.fp_is_staff_reader())
    )
  );

-- fp_purchase_orders
DROP POLICY IF EXISTS fp_purchase_orders_select ON public.fp_purchase_orders;
CREATE POLICY fp_purchase_orders_select ON public.fp_purchase_orders
  FOR SELECT TO authenticated
  USING (
    public.fp_current_user_role() IN ('compras', 'tesoreria', 'gerente', 'desarrollador')
    OR (
      supplier_id IS NOT NULL
      AND supplier_id = public.fp_my_supplier_id()
    )
  );

DROP POLICY IF EXISTS fp_purchase_orders_write_compras ON public.fp_purchase_orders;
CREATE POLICY fp_purchase_orders_write_compras ON public.fp_purchase_orders
  FOR ALL TO authenticated
  USING (public.fp_current_user_role() IN ('compras', 'desarrollador'))
  WITH CHECK (public.fp_current_user_role() IN ('compras', 'desarrollador'));

-- fp_invoices
DROP POLICY IF EXISTS fp_invoices_select ON public.fp_invoices;
CREATE POLICY fp_invoices_select ON public.fp_invoices
  FOR SELECT TO authenticated
  USING (
    public.fp_current_user_role() IN ('compras', 'gerente', 'desarrollador')
    OR (
      public.fp_current_user_role() = 'tesoreria'
      AND status IN ('pendiente_pago', 'pago_parcial', 'pagada')
    )
    OR (
      public.fp_current_user_role() = 'proveedor'
      AND supplier_id = public.fp_my_supplier_id()
    )
  );

DROP POLICY IF EXISTS fp_invoices_insert_proveedor ON public.fp_invoices;
CREATE POLICY fp_invoices_insert_proveedor ON public.fp_invoices
  FOR INSERT TO authenticated
  WITH CHECK (
    public.fp_current_user_role() IN ('proveedor', 'desarrollador')
    AND supplier_id = public.fp_my_supplier_id()
    AND created_by = auth.uid()
    AND status = 'presentada'
    AND EXISTS (
      SELECT 1 FROM public.fp_suppliers s
      WHERE s.id = supplier_id
        AND s.status = 'habilitado'
    )
  );

-- Sin UPDATE directo de estados (RPC / desarrollador)
DROP POLICY IF EXISTS fp_invoices_update_developer ON public.fp_invoices;
CREATE POLICY fp_invoices_update_developer ON public.fp_invoices
  FOR UPDATE TO authenticated
  USING (public.fp_current_user_role() = 'desarrollador')
  WITH CHECK (public.fp_current_user_role() = 'desarrollador');

-- fp_invoice_attachments
DROP POLICY IF EXISTS fp_invoice_attachments_select ON public.fp_invoice_attachments;
CREATE POLICY fp_invoice_attachments_select ON public.fp_invoice_attachments
  FOR SELECT TO authenticated
  USING (
    public.fp_is_staff_reader()
    OR EXISTS (
      SELECT 1
      FROM public.fp_invoices i
      WHERE i.id = invoice_id
        AND i.supplier_id = public.fp_my_supplier_id()
    )
  );

DROP POLICY IF EXISTS fp_invoice_attachments_insert ON public.fp_invoice_attachments;
CREATE POLICY fp_invoice_attachments_insert ON public.fp_invoice_attachments
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.fp_invoices i
      WHERE i.id = invoice_id
        AND (
          (
            i.supplier_id = public.fp_my_supplier_id()
            AND i.status IN ('presentada', 'observada')
            AND public.fp_current_user_role() = 'proveedor'
          )
          OR public.fp_current_user_role() = 'desarrollador'
        )
    )
  );

-- fp_compras_reviews (solo lectura vía RLS)
DROP POLICY IF EXISTS fp_compras_reviews_select ON public.fp_compras_reviews;
CREATE POLICY fp_compras_reviews_select ON public.fp_compras_reviews
  FOR SELECT TO authenticated
  USING (
    public.fp_is_staff_reader()
    OR public.fp_invoice_owned_by_me(invoice_id)
  );

-- fp_payments
DROP POLICY IF EXISTS fp_payments_select ON public.fp_payments;
CREATE POLICY fp_payments_select ON public.fp_payments
  FOR SELECT TO authenticated
  USING (
    public.fp_current_user_role() IN ('tesoreria', 'gerente', 'desarrollador', 'compras')
    OR public.fp_invoice_owned_by_me(invoice_id)
  );

-- fp_payment_receipts
DROP POLICY IF EXISTS fp_payment_receipts_select ON public.fp_payment_receipts;
CREATE POLICY fp_payment_receipts_select ON public.fp_payment_receipts
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.fp_payments p
      INNER JOIN public.fp_invoices i ON i.id = p.invoice_id
      WHERE p.id = payment_id
        AND (
          public.fp_current_user_role() IN ('tesoreria', 'gerente', 'desarrollador', 'compras')
          OR i.supplier_id = public.fp_my_supplier_id()
        )
    )
  );

-- fp_email_notifications
DROP POLICY IF EXISTS fp_email_notifications_select ON public.fp_email_notifications;
CREATE POLICY fp_email_notifications_select ON public.fp_email_notifications
  FOR SELECT TO authenticated
  USING (
    public.fp_current_user_role() IN ('tesoreria', 'gerente', 'desarrollador', 'compras')
    OR EXISTS (
      SELECT 1
      FROM public.fp_payments p
      INNER JOIN public.fp_invoices i ON i.id = p.invoice_id
      WHERE p.id = payment_id
        AND i.supplier_id = public.fp_my_supplier_id()
    )
  );

-- fp_email_notifications: sin UPDATE para authenticated (worker con service role en servidor)

-- fp_audit_log (solo lectura interna; sin INSERT/UPDATE/DELETE para authenticated)
DROP POLICY IF EXISTS fp_audit_log_select ON public.fp_audit_log;
CREATE POLICY fp_audit_log_select ON public.fp_audit_log
  FOR SELECT TO authenticated
  USING (
    public.fp_current_user_role() IN ('compras', 'tesoreria', 'gerente', 'desarrollador')
  );

DROP POLICY IF EXISTS fp_payment_preparations_select ON public.fp_payment_preparations;
CREATE POLICY fp_payment_preparations_select ON public.fp_payment_preparations
  FOR SELECT TO authenticated
  USING (
    public.fp_current_user_role() IN ('tesoreria', 'gerente', 'desarrollador', 'compras')
    OR EXISTS (
      SELECT 1 FROM public.fp_invoices i
      WHERE i.id = invoice_id AND i.supplier_id = public.fp_my_supplier_id()
    )
  );

DROP POLICY IF EXISTS fp_revision_snapshots_select ON public.fp_invoice_revision_snapshots;
CREATE POLICY fp_revision_snapshots_select ON public.fp_invoice_revision_snapshots
  FOR SELECT TO authenticated
  USING (
    public.fp_is_staff_reader()
    OR public.fp_invoice_owned_by_me(invoice_id)
  );

-- ---------------------------------------------------------------------------
-- 7. Storage bucket privado fp-documents
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'fp-documents',
  'fp-documents',
  FALSE,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']::TEXT[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = FALSE,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Helpers lectura de paths (primer segmento / uuid)
CREATE OR REPLACE FUNCTION public.fp_storage_supplier_id_from_path(p_name TEXT)
RETURNS UUID
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT NULLIF((storage.foldername(p_name))[2], '')::UUID;
$$;

CREATE OR REPLACE FUNCTION public.fp_storage_invoice_id_from_path(p_name TEXT)
RETURNS UUID
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT NULLIF((storage.foldername(p_name))[2], '')::UUID;
$$;

CREATE OR REPLACE FUNCTION public.fp_storage_preparation_id_from_path(p_name TEXT)
RETURNS UUID
LANGUAGE sql
IMMUTABLE
SET search_path = public, storage
AS $$
  SELECT NULLIF((storage.foldername(p_name))[3], '')::UUID;
$$;

REVOKE ALL ON FUNCTION public.fp_storage_supplier_id_from_path(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fp_storage_invoice_id_from_path(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fp_storage_preparation_id_from_path(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fp_storage_supplier_id_from_path(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fp_storage_invoice_id_from_path(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fp_storage_preparation_id_from_path(TEXT) TO authenticated;

-- SELECT
DROP POLICY IF EXISTS "fp_storage_select_staff" ON storage.objects;
CREATE POLICY "fp_storage_select_staff"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'fp-documents'
    AND public.fp_current_user_role() IN ('compras', 'tesoreria', 'gerente', 'desarrollador')
  );

DROP POLICY IF EXISTS "fp_storage_select_proveedor_supplier_docs" ON storage.objects;
CREATE POLICY "fp_storage_select_proveedor_supplier_docs"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'fp-documents'
    AND (storage.foldername(name))[1] = 'suppliers'
    AND public.fp_storage_supplier_id_from_path(name) = public.fp_my_supplier_id()
  );

DROP POLICY IF EXISTS "fp_storage_select_proveedor_invoice_docs" ON storage.objects;
CREATE POLICY "fp_storage_select_proveedor_invoice_docs"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'fp-documents'
    AND (storage.foldername(name))[1] = 'invoices'
    AND EXISTS (
      SELECT 1 FROM public.fp_invoices i
      WHERE i.id = public.fp_storage_invoice_id_from_path(name)
        AND i.supplier_id = public.fp_my_supplier_id()
    )
  );

DROP POLICY IF EXISTS "fp_storage_select_proveedor_payment_receipts" ON storage.objects;
CREATE POLICY "fp_storage_select_proveedor_payment_receipts"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'fp-documents'
    AND (storage.foldername(name))[1] = 'payments'
    AND (storage.foldername(name))[2] = 'pending'
    AND EXISTS (
      SELECT 1
      FROM public.fp_payment_preparations pp
      INNER JOIN public.fp_invoices i ON i.id = pp.invoice_id
      WHERE pp.id = public.fp_storage_preparation_id_from_path(name)
        AND i.supplier_id = public.fp_my_supplier_id()
        AND pp.status = 'confirmed'
    )
  );

DROP POLICY IF EXISTS "fp_storage_select_confirmed_payment_receipts" ON storage.objects;
CREATE POLICY "fp_storage_select_confirmed_payment_receipts"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'fp-documents'
    AND (storage.foldername(name))[1] = 'payments'
    AND (storage.foldername(name))[2] = 'pending'
    AND EXISTS (
      SELECT 1
      FROM public.fp_payment_receipts r
      INNER JOIN public.fp_payments p ON p.id = r.payment_id
      WHERE r.storage_path = name
    )
  );

-- INSERT
DROP POLICY IF EXISTS "fp_storage_insert_proveedor_supplier_docs" ON storage.objects;
CREATE POLICY "fp_storage_insert_proveedor_supplier_docs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'fp-documents'
    AND (storage.foldername(name))[1] = 'suppliers'
    AND public.fp_storage_supplier_id_from_path(name) = public.fp_my_supplier_id()
    AND public.fp_current_user_role() IN ('proveedor', 'desarrollador')
  );

DROP POLICY IF EXISTS "fp_storage_insert_proveedor_invoice_attachments" ON storage.objects;
CREATE POLICY "fp_storage_insert_proveedor_invoice_attachments"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'fp-documents'
    AND (storage.foldername(name))[1] = 'invoices'
    AND EXISTS (
      SELECT 1 FROM public.fp_invoices i
      WHERE i.id = public.fp_storage_invoice_id_from_path(name)
        AND i.supplier_id = public.fp_my_supplier_id()
        AND i.status IN ('presentada', 'observada')
        AND public.fp_current_user_role() IN ('proveedor', 'desarrollador')
    )
  );

DROP POLICY IF EXISTS "fp_storage_insert_tesoreria_payment_prep" ON storage.objects;
CREATE POLICY "fp_storage_insert_tesoreria_payment_prep"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'fp-documents'
    AND (storage.foldername(name))[1] = 'payments'
    AND (storage.foldername(name))[2] = 'pending'
    AND (storage.foldername(name))[4] = 'receipts'
    AND public.fp_current_user_role() IN ('tesoreria', 'desarrollador')
    AND EXISTS (
      SELECT 1 FROM public.fp_payment_preparations pp
      WHERE pp.id = public.fp_storage_preparation_id_from_path(name)
        AND pp.prepared_by = auth.uid()
        AND pp.status = 'pending_upload'
        AND pp.expires_at > NOW()
    )
  );

DROP POLICY IF EXISTS "fp_storage_all_desarrollador" ON storage.objects;
CREATE POLICY "fp_storage_all_desarrollador"
  ON storage.objects FOR ALL TO authenticated
  USING (
    bucket_id = 'fp-documents'
    AND public.fp_current_user_role() = 'desarrollador'
  )
  WITH CHECK (
    bucket_id = 'fp-documents'
    AND public.fp_current_user_role() = 'desarrollador'
  );

-- Sin políticas DELETE/UPDATE para roles operativos salvo desarrollador

COMMIT;