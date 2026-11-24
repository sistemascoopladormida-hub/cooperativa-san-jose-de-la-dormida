-- =============================================================================
-- Cooperativa San José de la Dormida — Módulo Facturas de Proveedores (fp_*)
-- Etapa 2: migración inicial (NO ejecutar sin revisión y aprobación)
--
-- Circuito: proveedor → post control Compras → Tesorería → pagos → email → pagada
-- Sin autorización de Gerencia ni autorización de compra en este sistema.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Extensiones
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Tipos ENUM
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE fp_user_role AS ENUM (
    'proveedor',
    'compras',
    'tesoreria',
    'gerente',
    'desarrollador'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE fp_supplier_status AS ENUM (
    'borrador',
    'pendiente_habilitacion',
    'habilitado',
    'suspendido',
    'rechazado'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE fp_condicion_iva AS ENUM (
    'responsable_inscripto',
    'monotributo',
    'exento',
    'no_alcanzado',
    'consumidor_final'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE fp_supplier_document_kind AS ENUM (
    'constancia_afip',
    'constancia_ingresos_brutos',
    'cbu_comprobante',
    'otro'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE fp_enablement_event_type AS ENUM (
    'solicitud',
    'observacion',
    'habilitacion',
    'suspension',
    'rechazo',
    'reactivacion'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE fp_invoice_status AS ENUM (
    'presentada',
    'en_revision',
    'observada',
    'rechazada',
    'aprobada',
    'pendiente_pago',
    'pago_parcial',
    'pagada',
    'anulada'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE fp_compras_decision AS ENUM (
    'aprobada',
    'observada',
    'rechazada'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE fp_invoice_attachment_kind AS ENUM (
    'factura_pdf',
    'nota_credito',
    'nota_debito',
    'respaldo_compra',
    'otro'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE fp_payment_method AS ENUM (
    'transferencia',
    'cheque',
    'efectivo',
    'echeq',
    'otro'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE fp_email_notification_status AS ENUM (
    'pending',
    'sent',
    'failed',
    'skipped'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE fp_payment_preparation_status AS ENUM (
    'pending_upload',
    'confirmed',
    'cancelled',
    'expired'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Utilidad: updated_at exclusiva del módulo fp_* (no toca la función compartida)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fp_update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Validación CUIT argentino (11 dígitos + dígito verificador módulo 11)
CREATE OR REPLACE FUNCTION public.fp_validate_cuit(p_cuit TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  v_digits TEXT;
  v_mult INTEGER[] := ARRAY[5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  v_sum INTEGER := 0;
  v_mod INTEGER;
  v_check INTEGER;
BEGIN
  IF p_cuit IS NULL OR p_cuit !~ '^[0-9]{11}$' THEN
    RETURN FALSE;
  END IF;
  v_digits := p_cuit;
  FOR i IN 1..10 LOOP
    v_sum := v_sum + substr(v_digits, i, 1)::INTEGER * v_mult[i];
  END LOOP;
  v_mod := v_sum % 11;
  v_check := CASE WHEN v_mod = 0 THEN 0 WHEN v_mod = 1 THEN 9 ELSE 11 - v_mod END;
  RETURN substr(v_digits, 11, 1)::INTEGER = v_check;
END;
$$;

-- ---------------------------------------------------------------------------
-- fp_profiles — vínculo con auth.users y rol del módulo
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fp_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role public.fp_user_role NOT NULL DEFAULT 'proveedor',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fp_profiles_email_nonempty CHECK (char_length(trim(email)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_fp_profiles_role ON public.fp_profiles (role);
CREATE INDEX IF NOT EXISTS idx_fp_profiles_is_active ON public.fp_profiles (is_active);

DROP TRIGGER IF EXISTS tr_fp_profiles_updated_at ON public.fp_profiles;
CREATE TRIGGER tr_fp_profiles_updated_at
  BEFORE UPDATE ON public.fp_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.fp_update_updated_at_column();

-- Impedir que un usuario modifique su propio rol o is_active (app + RLS posterior)
CREATE OR REPLACE FUNCTION public.fp_prevent_self_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND OLD.id = auth.uid() THEN
    IF NEW.role IS DISTINCT FROM OLD.role OR NEW.is_active IS DISTINCT FROM OLD.is_active THEN
      RAISE EXCEPTION 'No puede modificar su propio rol o estado de cuenta';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_fp_profiles_prevent_self_escalation ON public.fp_profiles;
CREATE TRIGGER tr_fp_profiles_prevent_self_escalation
  BEFORE UPDATE ON public.fp_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.fp_prevent_self_privilege_escalation();

-- Alta de perfil al registrarse (rol proveedor fijo; desarrollador solo vía admin)
CREATE OR REPLACE FUNCTION public.fp_handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.fp_profiles (id, email, role)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(trim(NEW.email), ''), NULLIF(trim(NEW.raw_user_meta_data ->> 'email'), ''), 'sin-email@proveedor.local'),
    'proveedor'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_fp_on_auth_user_created ON auth.users;
CREATE TRIGGER tr_fp_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.fp_handle_new_auth_user();

-- ---------------------------------------------------------------------------
-- fp_suppliers — datos fiscales y comerciales
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fp_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.fp_profiles (id) ON DELETE CASCADE,
  cuit CHAR(11) NOT NULL,
  razon_social TEXT NOT NULL,
  nombre_comercial TEXT,
  condicion_iva public.fp_condicion_iva NOT NULL,
  domicilio_fiscal TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT NOT NULL,
  contacto_nombre TEXT,
  contacto_email TEXT,
  contacto_telefono TEXT,
  cbu TEXT,
  status public.fp_supplier_status NOT NULL DEFAULT 'borrador',
  enabled_at TIMESTAMPTZ,
  enabled_by UUID REFERENCES public.fp_profiles (id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fp_suppliers_cuit_format CHECK (public.fp_validate_cuit(cuit::TEXT)),
  CONSTRAINT fp_suppliers_razon_social_nonempty CHECK (char_length(trim(razon_social)) > 0),
  CONSTRAINT fp_suppliers_domicilio_nonempty CHECK (char_length(trim(domicilio_fiscal)) > 0),
  CONSTRAINT fp_suppliers_email_nonempty CHECK (char_length(trim(email)) > 0),
  CONSTRAINT fp_suppliers_telefono_nonempty CHECK (char_length(trim(telefono)) > 0),
  CONSTRAINT fp_suppliers_cbu_format CHECK (cbu IS NULL OR cbu ~ '^[0-9]{22}$'),
  CONSTRAINT fp_suppliers_enabled_consistency CHECK (
  (status = 'habilitado' AND enabled_at IS NOT NULL AND enabled_by IS NOT NULL)
    OR (status <> 'habilitado')
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fp_suppliers_cuit ON public.fp_suppliers (cuit);
CREATE INDEX IF NOT EXISTS idx_fp_suppliers_status ON public.fp_suppliers (status);
CREATE INDEX IF NOT EXISTS idx_fp_suppliers_profile_id ON public.fp_suppliers (profile_id);

DROP TRIGGER IF EXISTS tr_fp_suppliers_updated_at ON public.fp_suppliers;
CREATE TRIGGER tr_fp_suppliers_updated_at
  BEFORE UPDATE ON public.fp_suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.fp_update_updated_at_column();

-- ---------------------------------------------------------------------------
-- fp_supplier_documents
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fp_supplier_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.fp_suppliers (id) ON DELETE CASCADE,
  kind public.fp_supplier_document_kind NOT NULL DEFAULT 'otro',
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT,
  uploaded_by UUID REFERENCES public.fp_profiles (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fp_supplier_documents_path_nonempty CHECK (char_length(trim(storage_path)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_fp_supplier_documents_supplier
  ON public.fp_supplier_documents (supplier_id);

-- ---------------------------------------------------------------------------
-- fp_supplier_enablement_events
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fp_supplier_enablement_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.fp_suppliers (id) ON DELETE CASCADE,
  event_type public.fp_enablement_event_type NOT NULL,
  notes TEXT,
  actor_id UUID REFERENCES public.fp_profiles (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fp_supplier_enablement_supplier
  ON public.fp_supplier_enablement_events (supplier_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- fp_purchase_orders — referencia opcional, sin workflow de aprobación
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fp_purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oc_number TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(14, 2),
  supplier_id UUID REFERENCES public.fp_suppliers (id) ON DELETE SET NULL,
  issued_at DATE,
  created_by UUID REFERENCES public.fp_profiles (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fp_purchase_orders_oc_nonempty CHECK (char_length(trim(oc_number)) > 0),
  CONSTRAINT fp_purchase_orders_amount_positive CHECK (amount IS NULL OR amount > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fp_purchase_orders_number
  ON public.fp_purchase_orders (oc_number);
CREATE INDEX IF NOT EXISTS idx_fp_purchase_orders_supplier
  ON public.fp_purchase_orders (supplier_id);

DROP TRIGGER IF EXISTS tr_fp_purchase_orders_updated_at ON public.fp_purchase_orders;
CREATE TRIGGER tr_fp_purchase_orders_updated_at
  BEFORE UPDATE ON public.fp_purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.fp_update_updated_at_column();

-- ---------------------------------------------------------------------------
-- fp_invoices
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fp_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.fp_suppliers (id) ON DELETE RESTRICT,
  purchase_order_id UUID REFERENCES public.fp_purchase_orders (id) ON DELETE SET NULL,
  invoice_type CHAR(1) NOT NULL,
  point_of_sale INTEGER NOT NULL,
  invoice_number BIGINT NOT NULL,
  invoice_date DATE NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'ARS',
  total_amount NUMERIC(14, 2) NOT NULL,
  saldo_pendiente NUMERIC(14, 2) NOT NULL,
  status public.fp_invoice_status NOT NULL DEFAULT 'presentada',
  revision_number INTEGER NOT NULL DEFAULT 1,
  parent_invoice_id UUID REFERENCES public.fp_invoices (id) ON DELETE SET NULL,
  presented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  anulment_reason TEXT,
  anulled_at TIMESTAMPTZ,
  anulled_by UUID REFERENCES public.fp_profiles (id),
  created_by UUID NOT NULL REFERENCES public.fp_profiles (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fp_invoices_total_positive CHECK (total_amount > 0),
  CONSTRAINT fp_invoices_saldo_nonnegative CHECK (saldo_pendiente >= 0),
  CONSTRAINT fp_invoices_saldo_lte_total CHECK (saldo_pendiente <= total_amount),
  CONSTRAINT fp_invoices_point_of_sale_range CHECK (
    point_of_sale >= 1 AND point_of_sale <= 99999
  ),
  CONSTRAINT fp_invoices_revision_positive CHECK (revision_number >= 1),
  CONSTRAINT fp_invoices_type_valid CHECK (invoice_type IN ('A', 'B', 'C', 'M', 'E')),
  CONSTRAINT fp_invoices_anulada_requires_reason CHECK (
    (status <> 'anulada')
    OR (
      anulment_reason IS NOT NULL
      AND char_length(trim(anulment_reason)) > 0
      AND anulled_at IS NOT NULL
      AND anulled_by IS NOT NULL
    )
  ),
  CONSTRAINT fp_invoices_unique_comprobante UNIQUE (
    supplier_id,
    invoice_type,
    point_of_sale,
    invoice_number
  )
);

CREATE INDEX IF NOT EXISTS idx_fp_invoices_supplier ON public.fp_invoices (supplier_id);
CREATE INDEX IF NOT EXISTS idx_fp_invoices_status ON public.fp_invoices (status);
CREATE INDEX IF NOT EXISTS idx_fp_invoices_pendiente_tesoreria
  ON public.fp_invoices (status)
  WHERE status IN ('pendiente_pago', 'pago_parcial');
CREATE INDEX IF NOT EXISTS idx_fp_invoices_presented_at
  ON public.fp_invoices (presented_at DESC);

DROP TRIGGER IF EXISTS tr_fp_invoices_updated_at ON public.fp_invoices;
CREATE TRIGGER tr_fp_invoices_updated_at
  BEFORE UPDATE ON public.fp_invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.fp_update_updated_at_column();

-- Inicializar saldo al crear factura
CREATE OR REPLACE FUNCTION public.fp_invoices_set_initial_saldo()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.saldo_pendiente := NEW.total_amount;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_fp_invoices_initial_saldo ON public.fp_invoices;
CREATE TRIGGER tr_fp_invoices_initial_saldo
  BEFORE INSERT ON public.fp_invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.fp_invoices_set_initial_saldo();

-- ---------------------------------------------------------------------------
-- fp_invoice_attachments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fp_invoice_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.fp_invoices (id) ON DELETE CASCADE,
  kind public.fp_invoice_attachment_kind NOT NULL DEFAULT 'factura_pdf',
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT,
  revision_number INTEGER NOT NULL DEFAULT 1,
  uploaded_by UUID REFERENCES public.fp_profiles (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fp_invoice_attachments_path_nonempty CHECK (char_length(trim(storage_path)) > 0),
  CONSTRAINT fp_invoice_attachments_revision_positive CHECK (revision_number >= 1)
);

CREATE INDEX IF NOT EXISTS idx_fp_invoice_attachments_invoice
  ON public.fp_invoice_attachments (invoice_id, revision_number);

-- ---------------------------------------------------------------------------
-- fp_compras_reviews — historial de post control
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fp_compras_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.fp_invoices (id) ON DELETE CASCADE,
  decision public.fp_compras_decision NOT NULL,
  reviewer_id UUID NOT NULL REFERENCES public.fp_profiles (id),
  notes TEXT,
  revision_number INTEGER NOT NULL,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fp_compras_reviews_notes_observacion CHECK (
    (decision <> 'observada')
    OR (notes IS NOT NULL AND char_length(trim(notes)) > 0)
  ),
  CONSTRAINT fp_compras_reviews_notes_rechazo CHECK (
    (decision <> 'rechazada')
    OR (notes IS NOT NULL AND char_length(trim(notes)) > 0)
  )
);

CREATE INDEX IF NOT EXISTS idx_fp_compras_reviews_invoice
  ON public.fp_compras_reviews (invoice_id, reviewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_fp_compras_reviews_reviewer
  ON public.fp_compras_reviews (reviewer_id);

-- ---------------------------------------------------------------------------
-- fp_payments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fp_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.fp_invoices (id) ON DELETE RESTRICT,
  payment_date DATE NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  payment_method public.fp_payment_method NOT NULL,
  registered_by UUID NOT NULL REFERENCES public.fp_profiles (id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fp_payments_amount_positive CHECK (amount > 0)
);

CREATE INDEX IF NOT EXISTS idx_fp_payments_invoice
  ON public.fp_payments (invoice_id, payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_fp_payments_registered_by
  ON public.fp_payments (registered_by);

DROP TRIGGER IF EXISTS tr_fp_payments_updated_at ON public.fp_payments;
CREATE TRIGGER tr_fp_payments_updated_at
  BEFORE UPDATE ON public.fp_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.fp_update_updated_at_column();

-- ---------------------------------------------------------------------------
-- fp_payment_receipts — un comprobante por pago
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fp_payment_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL UNIQUE REFERENCES public.fp_payments (id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fp_payment_receipts_path_nonempty CHECK (char_length(trim(storage_path)) > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fp_payment_receipts_storage_path
  ON public.fp_payment_receipts (storage_path);

-- ---------------------------------------------------------------------------
-- fp_payment_preparations — pago no confirmado hasta comprobante en Storage
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fp_payment_preparations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.fp_invoices (id) ON DELETE RESTRICT,
  payment_date DATE NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  payment_method public.fp_payment_method NOT NULL,
  prepared_by UUID NOT NULL REFERENCES public.fp_profiles (id),
  notes TEXT,
  status public.fp_payment_preparation_status NOT NULL DEFAULT 'pending_upload',
  idempotency_key TEXT,
  receipt_storage_path TEXT,
  receipt_file_name TEXT,
  receipt_mime_type TEXT,
  confirmed_payment_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  CONSTRAINT fp_payment_preparations_amount_positive CHECK (amount > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fp_payment_preparations_idempotency_actor
  ON public.fp_payment_preparations (prepared_by, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_fp_payment_preparations_invoice
  ON public.fp_payment_preparations (invoice_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fp_payment_preparations_status
  ON public.fp_payment_preparations (status)
  WHERE status = 'pending_upload';

ALTER TABLE public.fp_payments
  ADD COLUMN IF NOT EXISTS preparation_id UUID UNIQUE
    REFERENCES public.fp_payment_preparations (id) ON DELETE RESTRICT;

-- ---------------------------------------------------------------------------
-- fp_invoice_revision_snapshots — historial de revisiones de facturas
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fp_invoice_revision_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.fp_invoices (id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL,
  invoice_type CHAR(1) NOT NULL,
  point_of_sale INTEGER NOT NULL,
  invoice_number BIGINT NOT NULL,
  invoice_date DATE NOT NULL,
  currency CHAR(3) NOT NULL,
  total_amount NUMERIC(14, 2) NOT NULL,
  purchase_order_id UUID REFERENCES public.fp_purchase_orders (id) ON DELETE SET NULL,
  saldo_pendiente NUMERIC(14, 2) NOT NULL,
  status public.fp_invoice_status NOT NULL,
  attachment_metadata JSONB NOT NULL DEFAULT '[]'::JSONB,
  correction_reason TEXT,
  observation_notes TEXT,
  corrected_by UUID NOT NULL REFERENCES public.fp_profiles (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fp_invoice_revision_snapshots_unique_rev
    UNIQUE (invoice_id, revision_number)
);

CREATE INDEX IF NOT EXISTS idx_fp_invoice_revision_snapshots_invoice
  ON public.fp_invoice_revision_snapshots (invoice_id, revision_number DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fp_invoice_attachments_storage_path
  ON public.fp_invoice_attachments (storage_path);

-- ---------------------------------------------------------------------------
-- fp_email_notifications — cola/historial (envío desacoplado del pago)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fp_email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL UNIQUE REFERENCES public.fp_payments (id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status public.fp_email_notification_status NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  provider_message_id TEXT,
  error_message TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fp_email_notifications_recipient_nonempty CHECK (
    char_length(trim(recipient_email)) > 0
  )
);

CREATE INDEX IF NOT EXISTS idx_fp_email_notifications_status
  ON public.fp_email_notifications (status, created_at)
  WHERE status = 'pending';

-- ---------------------------------------------------------------------------
-- fp_audit_log
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fp_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  actor_id UUID REFERENCES public.fp_profiles (id),
  from_status public.fp_invoice_status,
  to_status public.fp_invoice_status,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fp_audit_log_entity
  ON public.fp_audit_log (entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fp_audit_log_actor
  ON public.fp_audit_log (actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fp_audit_log_created_at
  ON public.fp_audit_log (created_at DESC);

-- ---------------------------------------------------------------------------
-- Auditoría genérica
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

-- ---------------------------------------------------------------------------
-- Recalcular saldo y estado de factura a partir de pagos
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- Compras: iniciar revisión (presentada → en_revision)
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

-- ---------------------------------------------------------------------------
-- Compras: decisión de post control
-- ---------------------------------------------------------------------------
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
      -- Registro en historial como aprobada; estado operativo directo a Tesorería
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

-- Pagos: flujo prepare/confirm en migración 20260323140000 (RLS y seguridad).

-- Impedir DELETE directo de pagos (correcciones vía proceso administrativo futuro)
CREATE OR REPLACE FUNCTION public.fp_prevent_payment_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'No se permite eliminar pagos registrados';
END;
$$;

DROP TRIGGER IF EXISTS tr_fp_payments_no_delete ON public.fp_payments;
CREATE TRIGGER tr_fp_payments_no_delete
  BEFORE DELETE ON public.fp_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.fp_prevent_payment_delete();

-- ---------------------------------------------------------------------------
-- Anulación de factura (sin pagos registrados)
-- ---------------------------------------------------------------------------
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

  IF EXISTS (
    SELECT 1
    FROM public.fp_payment_preparations pp
    WHERE pp.invoice_id = p_invoice_id
      AND pp.status = 'pending_upload'
      AND pp.expires_at > NOW()
  ) THEN
    RAISE EXCEPTION 'No se puede anular: hay pagos en preparación pendientes de confirmación';
  END IF;

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

COMMIT;