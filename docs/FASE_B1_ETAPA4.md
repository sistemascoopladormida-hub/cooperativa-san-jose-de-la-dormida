# Fase B.1 + Etapa 4 — cierre breve

## Fase B.1 (SQL local, sin aplicar en remoto)

| Tema | Cambio |
|------|--------|
| Facturas observadas | Borrador `fp_proveedor_save_observed_invoice_draft`; confirmación con PDF obligatorio en Storage + snapshot + adjunto nueva revisión |
| Idempotencia pagos | Índice único `(prepared_by, idempotency_key)`; validación de factura/importe al reutilizar clave |
| Saldo / concurrencia | `fp_invoice_saldo_disponible` descuenta preparaciones `pending_upload`; exclusión de la prep actual al confirmar |
| Comprobantes | `fp_assert_storage_object_valid` (bucket, MIME, tamaño); path único en `fp_payment_receipts` |
| Pruebas | `00_bootstrap.sql`, `fp_test_expect_denied`, assertions sin falsos PASS |

**Pruebas SQL:** no ejecutadas en esta sesión (sin Supabase local con migraciones aplicadas).

## Etapa 4

- `@supabase/ssr` + `middleware.ts` (solo `/facturas`)
- Rutas auth y dashboards iniciales bajo `app/facturas/`
- `lib/facturas/` separado de `lib/supabase.ts`

**Para probar login:** aplicar migraciones en staging, habilitar Supabase Auth (email), configurar `NEXT_PUBLIC_SUPABASE_*` y opcional `NEXT_PUBLIC_SITE_URL` para enlaces de recuperación.