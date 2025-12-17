# REGLAS DE MIGRACIONES SUPABASE - PS COMERCIAL

> **REGLA CRÍTICA**: NINGÚN agente puede modificar Supabase directamente sin seguir este proceso.
> **BLOQUEANTE**: Violaciones a este proceso bloquean merge/aprobación inmediatamente.

## PRINCIPIO FUNDAMENTAL

**SIEMPRE MIGRACIONES PRIMERO, NUNCA MODIFICACIONES DIRECTAS**

Cualquier cambio en Supabase (tablas, columnas, RLS policies, funciones, triggers, índices) DEBE:
1. Crearse PRIMERO como migración en `/supabase/migrations/`
2. Ejecutarse mediante MCP Supabase `apply_migration`
3. Validarse que funciona correctamente
4. Documentarse en el repositorio

## DATOS DEL PROYECTO

- **Project ID**: `zsauumglbhindsplazpk`
- **URL**: `https://zsauumglbhindsplazpk.supabase.co`

## LO QUE NUNCA DEBES HACER

- **NUNCA** modificar directamente en la UI de Supabase
- **NUNCA** ejecutar SQL ad-hoc sin crear migración
- **NUNCA** usar MCP Supabase `execute_sql` para DDL (usar `apply_migration`)
- **NUNCA** crear múltiples migraciones para corregir errores de una migración

## WORKFLOW OBLIGATORIO

### Paso 1: Diseñar la Migración

```sql
-- Nomenclatura: YYYYMMDDHHMMSS_descripcion_en_snake_case.sql
-- Ejemplo: 20250116153000_create_leads_table.sql

-- Migration: [Descripción del cambio]
-- Date: [YYYY-MM-DD]
-- Author: @db-integration
-- Related: HU-XXXX

-- SQL idempotente aquí
```

### Paso 2: Ejecutar con MCP

```javascript
mcp__supabase__apply_migration({
  project_id: "zsauumglbhindsplazpk",
  name: "create_leads_table",
  query: `
    CREATE TABLE IF NOT EXISTS public.leads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL,
      nombre TEXT NOT NULL,
      -- etc.
    );
  `
})
```

### Paso 3: Validar

```javascript
// Verificar tabla existe
mcp__supabase__list_tables({
  project_id: "zsauumglbhindsplazpk",
  schemas: ["public"]
})

// Verificar RLS
mcp__supabase__execute_sql({
  project_id: "zsauumglbhindsplazpk",
  query: "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'"
})
```

## TEMPLATE DE MIGRACIÓN

```sql
-- Migration: [Descripción clara del cambio]
-- Date: [YYYY-MM-DD]
-- Author: @db-integration
-- Related: HU-XXXX

-- =============================================================================
-- DESCRIPCIÓN
-- =============================================================================
-- [Explicar qué hace esta migración y por qué]

-- =============================================================================
-- TABLA PRINCIPAL
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.[nombre_tabla] (
    -- Identificadores
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

    -- Campos específicos
    -- ...

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- =============================================================================
-- ÍNDICES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_[tabla]_organization_id ON public.[nombre_tabla](organization_id);
-- Otros índices según necesidad

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

ALTER TABLE public.[nombre_tabla] ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.[nombre_tabla] FORCE ROW LEVEL SECURITY;

-- DROP existing policies (idempotente)
DROP POLICY IF EXISTS "users_select_own_org" ON public.[nombre_tabla];
DROP POLICY IF EXISTS "users_insert_own_org" ON public.[nombre_tabla];
DROP POLICY IF EXISTS "users_update_own_org" ON public.[nombre_tabla];
DROP POLICY IF EXISTS "users_delete_own_org" ON public.[nombre_tabla];

-- SELECT
CREATE POLICY "users_select_own_org" ON public.[nombre_tabla]
    FOR SELECT TO authenticated
    USING (organization_id IN (
        SELECT organization_id FROM public.accounts WHERE id = auth.uid()
    ));

-- INSERT
CREATE POLICY "users_insert_own_org" ON public.[nombre_tabla]
    FOR INSERT TO authenticated
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM public.accounts WHERE id = auth.uid()
    ));

-- UPDATE
CREATE POLICY "users_update_own_org" ON public.[nombre_tabla]
    FOR UPDATE TO authenticated
    USING (organization_id IN (
        SELECT organization_id FROM public.accounts WHERE id = auth.uid()
    ));

-- DELETE
CREATE POLICY "users_delete_own_org" ON public.[nombre_tabla]
    FOR DELETE TO authenticated
    USING (organization_id IN (
        SELECT organization_id FROM public.accounts WHERE id = auth.uid()
    ));

-- =============================================================================
-- TRIGGERS (si aplica)
-- =============================================================================

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_[tabla]_updated_at ON public.[nombre_tabla];
CREATE TRIGGER update_[tabla]_updated_at
    BEFORE UPDATE ON public.[nombre_tabla]
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- FIN DE MIGRACIÓN
-- =============================================================================
```

## CHECKLIST PRE-MIGRACIÓN

Antes de ejecutar cualquier migración:

- [ ] SQL es idempotente (`IF NOT EXISTS`, `OR REPLACE`, `DROP IF EXISTS`)
- [ ] Nomenclatura correcta: `YYYYMMDDHHMMSS_descripcion.sql`
- [ ] `organization_id` incluido (si es tabla multi-tenant)
- [ ] Índice en `organization_id`
- [ ] RLS habilitado (`ENABLE` + `FORCE`)
- [ ] Policies CRUD definidas
- [ ] Comentarios explicativos incluidos
- [ ] Validado por @arquitecto (si es tabla nueva)

## MANEJO DE ERRORES

### Si una Migración Falla

1. **Leer el error completo**
2. **NO crear nueva migración** - corregir la existente
3. **Identificar causa raíz**
4. **Corregir y re-ejecutar** con el mismo nombre

### Errores Comunes

| Error | Solución |
|-------|----------|
| `relation already exists` | Usar `IF NOT EXISTS` |
| `policy already exists` | `DROP POLICY IF EXISTS` antes |
| `violates foreign key` | Verificar tabla referenciada existe |
| `permission denied` | Verificar rol de servicio |

## RESPONSABILIDADES POR AGENTE

### @db-integration
- **ÚNICO** responsable de crear y ejecutar migraciones
- Diseña schemas de tablas
- Implementa RLS policies
- Valida integridad de datos

### @fullstack-dev
- Solicita cambios de BD a @db-integration
- **NO** crea migraciones directamente
- **NO** modifica BD

### @arquitecto
- Valida diseño de schemas
- Aprueba migraciones antes de ejecutar
- Verifica patrones arquitectónicos

### @security-qa
- Valida RLS policies
- Verifica multi-tenancy
- Audita seguridad de BD

---

**Versión**: 1.0
**Proyecto**: PS Comercial
**Supabase Project**: `zsauumglbhindsplazpk`
