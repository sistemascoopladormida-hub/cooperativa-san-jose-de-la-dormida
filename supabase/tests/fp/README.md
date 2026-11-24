# Pruebas del módulo fp_* (staging / local)

## Prerrequisitos

1. Proyecto Supabase local **o** proyecto staging dedicado.
2. Migraciones aplicadas en orden:
   - `20260323130000_fp_facturas_proveedores.sql`
   - `20260323140000_fp_rls_storage_security.sql`
3. `psql` con acción como superusuario para `00_bootstrap.sql` y `01_seed.sql`.
4. Las pruebas RLS en `02_rls_assertions.sql` usan `SET LOCAL ROLE authenticated` y JWT simulado.

## Ejecución

```bash
export DATABASE_URL="postgresql://..."  # staging local
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/fp/00_bootstrap.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/fp/01_seed.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/fp/02_rls_assertions.sql
```

## Importante

- **No ejecutar en producción.**
- Los UUID de prueba deben existir en `auth.users` (crear vía Admin API o SQL en local).
- Si no hay entorno aislado, las pruebas quedan **pendientes de ejecución** (no se afirma PASS sin correrlas).
- Las pruebas negativas usan `fp_test_expect_denied` para no marcar PASS ante cualquier excepción.