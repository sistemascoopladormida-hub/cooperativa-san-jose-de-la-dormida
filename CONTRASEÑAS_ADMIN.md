# 🔐 Contraseñas Administrativas - Sistema Cooperativa La Dormida

## 📋 Resumen de Contraseñas Hardcodeadas

Este documento lista las contraseñas configuradas en el sistema para acceso administrativo.

---

## 🎯 Panel Administrativo Principal (`/admin`)

### 1. **Conversaciones**
- **Ruta**: `/conversaciones`
- **Contraseña**: variable `NEXT_PUBLIC_ADMIN_CONVERSACIONES_PASSWORD` (servidor: `ADMIN_CONVERSACIONES_PASSWORD`)
- **Archivo**: `app/admin/page.tsx`, `app/api/conversaciones/auth/route.ts`

### 2. **Análisis de conversaciones**
- **Ruta**: `/admin/analisis-conversaciones`
- **Contraseña**: definida en `lib/conversation-analysis-admin-password.ts` (y API asociada)

---

## 📰 Panel de Noticias

Las operaciones de noticias usan `ADMIN_NOTICIAS_PASSWORD` en:

- `app/api/noticias/list/route.ts`
- `app/api/noticias/update/route.ts`
- `app/api/noticias/delete/route.ts`
- `app/api/noticias/create/route.ts`
- `app/api/noticias/get/route.ts`
- `app/noticias/admin/page.tsx` (`NEXT_PUBLIC_ADMIN_NOTICIAS_PASSWORD`)

---

## 📝 Ubicaciones de Archivos

- `app/admin/page.tsx` - Panel principal de administración
- `app/api/conversaciones/auth/route.ts` - Autenticación de conversaciones
- `app/api/admin/conversation-analysis/auth/route.ts` - Análisis de conversaciones

---

**Última actualización**: Marzo 2026