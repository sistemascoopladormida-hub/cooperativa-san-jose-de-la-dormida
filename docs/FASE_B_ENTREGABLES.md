# Fase B — Entregables (implementación local)

> **Fase B.1:** ver correcciones en migraciones actuales y `docs/FASE_B1_ETAPA4.md`.

## A. Resumen ejecutivo

Se corrigieron las migraciones **Etapa 2 y Etapa 3** del módulo `fp_*` según la auditoría Fase A y las decisiones de negocio (anulación en `pendiente_pago` sin pagos, comprobante obligatorio, flujo prepare → upload → confirm).

Cambios centrales:

- Aislamiento de `update_updated_at` → `fp_update_updated_at_column`.
- Endurecimiento de proveedores y perfiles (triggers + políticas).
- Compras sin UPDATE directo en proveedores; solo RPC auditadas.
- Roles solo vía `fp_developer_set_user_role`.
- Facturas observadas: `fp_invoice_revision_snapshots` + `fp_proveedor_correct_observed_invoice`.
- Pagos: `fp_payment_preparations` + `fp_tesoreria_prepare_payment` / `fp_tesoreria_confirm_payment` (verificación de objeto en Storage).
- Validación CUIT módulo 11.
- Notificaciones email solo al confirmar pago con comprobante.
- Suite de pruebas en `supabase/tests/fp/`.

**No se ejecutó SQL en Supabase remoto.** **No se ejecutaron pruebas PASS** en esta sesión (sin entorno local aislado levantado).

---

## B. Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `supabase/migrations/20260323130000_fp_facturas_proveedores.sql` | `fp_update_updated_at_column`, CUIT, tablas nuevas, anulación, sin `fp_register_payment` |
| `supabase/migrations/20260323140000_fp_rls_storage_security.sql` | Seguridad, RPC pagos/corrección, RLS, Storage |
| `supabase/migrations/20260323140001_fp_security_tests.sql` | Puntero a suite real |
| `supabase/tests/fp/README.md` | Instrucciones |
| `supabase/tests/fp/01_seed.sql` | Plantilla seed |
| `supabase/tests/fp/02_rls_assertions.sql` | Pruebas ejecutables parciales |
| `docs/MODULO_FACTURAS_PROVEEDORES.md` | Actualizado |
| `docs/FASE_B_ENTREGABLES.md` | Este documento |

Archivo temporal `_fp_phase_b_rpc_block.sql` **eliminado** tras integrar en migración 40000.

---

## C. Cambios de esquema

### Tablas nuevas

- `fp_payment_preparations` — pago no confirmado hasta comprobante.
- `fp_invoice_revision_snapshots` — historial de revisiones.

### Columnas / índices

- `fp_payments.preparation_id` (FK única).
- Índices UNIQUE en `storage_path` (receipts, attachments).
- ENUM `fp_payment_preparation_status`.

### Funciones

- `fp_validate_cuit`, `fp_update_updated_at_column`, `fp_invoice_saldo_disponible`, `fp_storage_object_exists`, etc.

---

## D. RPC finales (authenticated)

| RPC | Roles | Notas |
|-----|-------|-------|
| `fp_compras_start_review` | compras, desarrollador | |
| `fp_compras_decide` | compras, desarrollador | |
| `fp_proveedor_correct_observed_invoice` | proveedor, desarrollador | Snapshot + presentación |
| `fp_tesoreria_prepare_payment` | tesoreria, desarrollador | Sin saldo/email |
| `fp_tesoreria_confirm_payment` | tesoreria, desarrollador | Requiere objeto en Storage |
| `fp_annul_invoice` | compras, desarrollador | Incluye `pendiente_pago` si 0 pagos |
| `fp_compras_set_supplier_status` | compras, desarrollador | |
| `fp_proveedor_request_enablement` | proveedor, desarrollador | |
| `fp_developer_set_user_role` | desarrollador | Único cambio de rol auditado |

**Eliminadas:** `fp_register_payment`, `fp_proveedor_resubmit_invoice`.

---

## E. Flujos operativos

### Pagos (obligatorio comprobante)

1. `fp_tesoreria_prepare_payment` → `fp_payment_preparations` en `pending_upload`.
2. Upload a `payments/pending/{preparation_id}/receipts/{archivo}` (bucket privado).
3. `fp_tesoreria_confirm_payment` → verifica Storage, crea `fp_payments` + `fp_payment_receipts`, actualiza saldo, **una** `fp_email_notifications` `pending`.

### Factura observada

1. Compras observa (`fp_compras_decide`).
2. Proveedor corrige con `fp_proveedor_correct_observed_invoice` (snapshot previo).
3. Adjunta nuevos PDF en Storage; estado `presentada`, `revision_number++`.

### Anulación

Compras: `fp_annul_invoice` con motivo; permitido `pendiente_pago` sin pagos; cancela preparaciones `pending_upload`.

---

## F. Seguridad

- Proveedor: sin cambio de `status` ni identidad fiscal si `habilitado` (trigger).
- Compras: sin UPDATE en `fp_suppliers` (trigger).
- Perfiles: sin cambio de `email` en `fp_profiles` (trigger); rol solo RPC desarrollador.
- Email notifications: sin UPDATE para `authenticated` (worker service role en Etapa 9).

---

## G. Pruebas

| Estado | Detalle |
|--------|---------|
| Creadas | `supabase/tests/fp/*` |
| Ejecutadas en esta sesión | **No** |
| Remoto/producción | **No** |

Comando staging: ver `supabase/tests/fp/README.md`.

---

## H. Riesgos pendientes

- Limpieza de preparaciones expiradas y objetos huérfanos (job futuro).
- Worker email con service role.
- Bootstrap primer `desarrollador` manual.
- Pruebas JWT reales con `auth.users` en staging.

---

## I. Staging

```bash
psql "$STAGING_DATABASE_URL" -f supabase/migrations/20260323130000_fp_facturas_proveedores.sql
psql "$STAGING_DATABASE_URL" -f supabase/migrations/20260323140000_fp_rls_storage_security.sql
# configurar set_config UUIDs y ejecutar supabase/tests/fp/02_rls_assertions.sql
```

---

## J. Confirmación de operaciones

| Operación | ¿Hecho? |
|-----------|---------|
| Archivos locales modificados | **Sí** |
| SQL remoto ejecutado | **No** |
| Datos producción modificados | **No** |
| Módulos ajenos (`invoice_requests`, etc.) | **No tocados** |
| Etapa 4 (Auth/UI) | **No iniciada** |