# ADR: Row Level Security (RLS) Implementation

**Date:** 2026-01-14
**Status:** Implemented
**Decision Makers:** Development Team

## Context

La aplicación maneja datos sensibles de Shopify (productos, órdenes, sesiones OAuth) y usuarios con diferentes niveles de acceso. Necesitábamos implementar seguridad a nivel de base de datos para:

1. **Defense in Depth**: No depender solo de validaciones a nivel de aplicación
2. **Multi-rol Support**: Admins, staff y usuarios regulares con diferentes permisos
3. **Better Auth Compatibility**: Mantener compatibilidad con el plugin admin de Better Auth
4. **Audit Trail**: Poder rastrear quién accede a qué datos

## Decision

Implementar **PostgreSQL Row Level Security (RLS)** con un sistema custom de paso de contexto de usuario desde SvelteKit a PostgreSQL.

### Arquitectura Elegida

```
Request → hooks.server.ts → event.locals.user
                ↓
        dbWithUser(event, callback)
                ↓
    SET app.current_user_id = 'xxx'
    SET app.current_user_role = 'admin'
                ↓
    PostgreSQL RLS Policies
```

### Roles Implementados

| Rol | Productos | Usuarios | Sesiones | Shopify Config |
|-----|-----------|----------|----------|----------------|
| **admin** | Full CRUD | Full CRUD | View all, Delete all | View |
| **staff** | View only | View own | View own | None |
| **user** | None | View/Update own | View/Delete own | None |
| **system** | Full | Full | Full | Full |

### Componentes Clave

1. **PostgreSQL Functions** (`set_app_user`, `is_admin`, etc.)
2. **RLS Policies** (36 políticas en 9 tablas)
3. **Application Wrappers** (`withUserContext`, `withSystemContext`)
4. **Helper Functions** (`dbWithUser`, `dbWithSystem`)

## Alternatives Considered

### 1. Application-Level Security Only
**Pros:**
- Más simple de implementar
- Más flexible

**Cons:**
- No es defense-in-depth
- Puede ser bypasseado si hay bugs en la app
- No protege contra queries SQL directos

**Verdict:** ❌ Rechazado - Insuficiente seguridad

### 2. Migrate to Supabase Auth
**Pros:**
- Integración nativa con RLS (`auth.uid()`)
- Más simple de configurar

**Cons:**
- Requiere reescribir todo el sistema de autenticación
- Perder funcionalidad del plugin admin de Better Auth
- Tiempo de desarrollo: ~2-3 semanas

**Verdict:** ❌ Rechazado - Demasiado trabajo

### 3. Separate Databases for Auth and Shopify
**Pros:**
- Separación clara de concerns

**Cons:**
- Queries cross-database complejos
- Problemas con transacciones
- Mayor complejidad operacional

**Verdict:** ❌ Rechazado - Innecesariamente complejo

## Implementation Details

### Migration File
`supabase/migrations/0011_rls_implementation.sql` (650+ líneas)

### Files Modified/Created
- **Created:** `src/lib/server/db/helpers.ts`
- **Modified:** `src/lib/server/db/index.ts`
- **Modified:** `src/lib/server/db/shopify.session.ts`
- **Modified:** `src/lib/server/db/bulk-record.ts`
- **Modified:** `src/routes/api/sync/products/+server.ts`

### Key Technical Decisions

#### 1. Session Variables vs JWT in PostgreSQL
**Chosen:** Session variables (`set_config`)
**Reason:** Más simple, no requiere configurar JWT en PostgreSQL

#### 2. Public Signup Policy
**Chosen:** Permitir INSERT público con `role = 'user'`
**Reason:** Better Auth signup necesita insertar sin contexto de usuario autenticado

#### 3. Admin Operations via Policies (not Proxy)
**Chosen:** Políticas RLS permiten a admins hacer operaciones
**Reason:** Más simple que crear un Proxy custom para Better Auth adapter

## Consequences

### Positive
✅ **Seguridad mejorada**: Datos protegidos a nivel de DB
✅ **Better Auth compatible**: Plugin admin funciona sin cambios
✅ **Auditable**: Podemos ver qué usuario hace qué
✅ **Defense in Depth**: Múltiples capas de seguridad
✅ **Type-safe**: TypeScript en toda la capa de aplicación

### Negative
⚠️ **Complejidad**: Desarrolladores deben usar `dbWithUser`/`dbWithSystem`
⚠️ **Testing**: Requiere tests adicionales de políticas RLS
⚠️ **Debugging**: Errores de RLS pueden ser confusos

### Risks and Mitigation

| Risk | Mitigation |
|------|------------|
| Performance degradation | Políticas son simples, monitoreamos con `EXPLAIN ANALYZE` |
| Signup breaks | Policy pública permite signup con `role = 'user'` |
| Admin operations fail | Policies permiten full CRUD para admins |
| Context leakage | Variables de sesión son transaction-scoped |

## Verification

### Automated
- ✅ TypeScript type checking: 0 errors
- ✅ Build completo: Success
- ✅ Migración aplicada: 0011

### Manual (Pending)
- [ ] Admin puede crear productos
- [ ] Staff puede ver productos (no modificar)
- [ ] Signup funciona
- [ ] Admin operations del plugin funcionan

## References

- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Better Auth Admin Plugin](https://www.better-auth.com/docs/plugins/admin)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

## Rollback Plan

Si hay problemas críticos en producción:

```sql
-- Deshabilitar RLS en tabla problemática
ALTER TABLE "product" DISABLE ROW LEVEL SECURITY;

-- O deshabilitar en todas las tablas
ALTER TABLE "user" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "account" DISABLE ROW LEVEL SECURITY;
-- etc...
```

Luego revertir código a commit anterior.

## Future Improvements

1. **Granular Permissions**: Sistema de permisos más detallado (ej. `product:read`, `product:write`)
2. **Audit Logging**: Log automático de todas las operaciones RLS
3. **Performance Monitoring**: Dashboards de queries lentos por RLS
4. **Multi-tenancy**: Si en el futuro soportamos múltiples tiendas Shopify
