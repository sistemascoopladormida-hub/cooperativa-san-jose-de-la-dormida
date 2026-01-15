# 🔐 Contraseñas Administrativas - Sistema Cooperativa La Dormida

## 📋 Resumen de Contraseñas Hardcodeadas

Este documento lista todas las contraseñas hardcodeadas en el sistema para acceso administrativo.

---

## 🎯 Panel Administrativo Principal (`/admin`)

### 1. **Dashboard de Encuestas** (Visitas Técnicas)
- **Ruta**: `/encuestas/dashboard`
- **Contraseña**: `Ingresonoticias2026.`
- **Archivo**: `app/admin/page.tsx` (línea 43)
- **Uso**: Acceso al dashboard de métricas de encuestas de visitas técnicas

### 2. **Dashboard Encuestas Boxes**
- **Ruta**: `/encuestas-boxes/dashboard`
- **Contraseña**: `Boxes2026`
- **Archivo**: `app/admin/page.tsx` (línea 53)
- **Uso**: Acceso al dashboard de métricas de encuestas de atención en boxes

### 3. **Gestión Boxes**
- **Ruta**: `/encuestas-boxes/admin`
- **Contraseña**: `Boxes2026`
- **Archivo**: `app/admin/page.tsx` (línea 63)
- **Uso**: Administración de empleados y generación de códigos QR para boxes

### 4. **Visitas Técnicas**
- **Ruta**: `/visitas-tecnicas`
- **Contraseña**: `Tecnico2025`
- **Archivo**: 
  - `app/admin/page.tsx` (línea 73)
  - `app/api/visitas-tecnicas/auth/route.ts` (línea 4)
- **Uso**: Registro y gestión de visitas técnicas a domicilio

### 5. **Conversaciones**
- **Ruta**: `/conversaciones`
- **Contraseña**: `Coop2025`
- **Archivo**: 
  - `app/admin/page.tsx` (línea 83)
  - `app/api/conversaciones/auth/route.ts` (línea 4)
- **Uso**: Gestión y administración de conversaciones

---

## 📰 Panel de Noticias

### 6. **Noticias - Listar**
- **Ruta**: `/api/noticias/list`
- **Contraseña**: `Ingresonoticias2026.`
- **Archivo**: `app/api/noticias/list/route.ts` (línea 11)
- **Uso**: Listar noticias en el panel administrativo

### 7. **Noticias - Actualizar**
- **Ruta**: `/api/noticias/update`
- **Contraseña**: `Ingresonoticias2026.`
- **Archivo**: `app/api/noticias/update/route.ts` (línea 20)
- **Uso**: Actualizar noticias existentes

### 8. **Noticias - Eliminar**
- **Ruta**: `/api/noticias/delete`
- **Contraseña**: `Ingresonoticias2026.`
- **Archivo**: `app/api/noticias/delete/route.ts` (línea 12)
- **Uso**: Eliminar noticias

---

## 📊 Resumen por Contraseña

| Contraseña | Secciones que la usan | Total |
|------------|----------------------|-------|
| `Ingresonoticias2026.` | Dashboard Encuestas, Noticias (listar, actualizar, eliminar) | 4 |
| `Boxes2026` | Dashboard Encuestas Boxes, Gestión Boxes | 2 |
| `Tecnico2025` | Visitas Técnicas | 1 |
| `Coop2025` | Conversaciones | 1 |

---

## ⚠️ Notas de Seguridad

1. **Todas las contraseñas están hardcodeadas** en el código fuente
2. Las contraseñas se validan directamente en el código sin hash
3. Se recomienda migrar a un sistema de autenticación más seguro (variables de entorno, base de datos, etc.)
4. Las contraseñas de "Visitas Técnicas" y "Conversaciones" también se validan mediante API endpoints que establecen cookies de sesión

---

## 📝 Ubicaciones de Archivos

- `app/admin/page.tsx` - Panel principal de administración
- `app/api/visitas-tecnicas/auth/route.ts` - Autenticación de visitas técnicas
- `app/api/conversaciones/auth/route.ts` - Autenticación de conversaciones
- `app/api/noticias/list/route.ts` - Listar noticias
- `app/api/noticias/update/route.ts` - Actualizar noticias
- `app/api/noticias/delete/route.ts` - Eliminar noticias

---

**Última actualización**: Enero 2026
