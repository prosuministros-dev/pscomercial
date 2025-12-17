# REGLAS GLOBALES: PROCESO DE MIGRACIONES DE SUPABASE

> **🚨 REGLA CRÍTICA**: NINGÚN agente puede modificar Supabase directamente sin seguir este proceso.
> **🚨 BLOQUEANTE**: Violaciones a este proceso bloquean merge/aprobación inmediatamente.

## 📌 PRINCIPIO FUNDAMENTAL

**SIEMPRE MIGRACIONES PRIMERO, NUNCA MODIFICACIONES DIRECTAS**

Cualquier cambio en Supabase (tablas, columnas, RLS policies, funciones, triggers, índices, etc.) DEBE:
1. Crearse PRIMERO como migración en `/workspaces/Podenza/supabase/migrations/`
2. Ejecutarse mediante la migración
3. Validarse que funciona correctamente
4. Homologarse con el repositorio de GitHub

**NUNCA**:
- ❌ Modificar directamente en la UI de Supabase
- ❌ Ejecutar SQL ad-hoc sin crear migración
- ❌ Usar MCP Supabase `execute_sql` para DDL (usar `apply_migration`)
- ❌ Crear múltiples migraciones para corregir errores de una migración

## 🎯 WORKFLOW OBLIGATORIO

### Fase 1: ANTES de Modificar Supabase

```markdown
1. Identificar el cambio necesario (nueva tabla, columna, RLS policy, etc.)

2. Crear migración en `/workspaces/Podenza/supabase/migrations/`:
   - Nomenclatura: `YYYYMMDDHHMMSS_descripcion_del_cambio.sql`
   - Ejemplo: `20250116153000_add_leads_table.sql`
   - Usar `mcp__supabase__apply_migration` para crear el archivo

3. Escribir SQL de la migración:
   - DDL statements (CREATE, ALTER, DROP)
   - RLS policies (ENABLE ROW LEVEL SECURITY, CREATE POLICY)
   - Funciones y triggers
   - Índices
   - SIEMPRE incluir `IF NOT EXISTS` / `IF EXISTS` para idempotencia
   - SIEMPRE incluir comentarios explicativos

4. Validar sintaxis localmente:
   - Revisar SQL antes de ejecutar
   - Asegurar que es idempotente (puede ejecutarse múltiples veces)
```

### Fase 2: Ejecutar la Migración

```markdown
1. Usar MCP Supabase para ejecutar:
   mcp__supabase__apply_migration({
     name: "add_leads_table",
     query: "-- SQL completo de la migración"
   })

2. Validar que la ejecución fue exitosa:
   - Sin errores en el output
   - Cambios aplicados correctamente

3. SI hay errores:
   - NO crear nueva migración
   - Corregir el archivo existente en /supabase/migrations/
   - Re-ejecutar usando `apply_migration` nuevamente
   - Mantener el mismo timestamp/nombre
```

### Fase 3: Validación Post-Migración

```markdown
1. Ejecutar script de validación:
   node /workspaces/Podenza/packages/supabase/extract-complete.mjs

   Esto valida:
   - Schema completo extraído
   - Migraciones aplicadas correctamente
   - Consistencia entre BD y archivos

2. Validar específicamente:
   - Tablas creadas/modificadas existen
   - RLS policies aplicadas correctamente
   - Funciones y triggers funcionan
   - Índices creados

3. Testing funcional:
   - Queries funcionan correctamente
   - RLS policies filtran datos apropiadamente
   - Multi-tenancy preservado (organization_id)
```

### Fase 4: Homologación con Repositorio

```markdown
1. Verificar que archivo de migración está en:
   /workspaces/Podenza/supabase/migrations/[timestamp]_[descripcion].sql

2. Commit a Git:
   - Incluir SOLO archivos de migración
   - Mensaje de commit descriptivo
   - Referenciar HU o task si aplica

3. Validar que:
   - Archivo de migración está versionado
   - Correlación con estado de Supabase es 100%
   - No hay migraciones pendientes
```

## 🔒 RESPONSABILIDADES POR AGENTE

### @db-integration
**ROL**: Responsable principal de migraciones

**OBLIGACIONES**:
- Crear TODAS las migraciones de BD
- Validar sintaxis SQL antes de ejecutar
- Ejecutar migraciones usando `apply_migration`
- Corregir errores en archivos de migración (NO crear nuevas)
- Ejecutar `extract-complete.mjs` para validación
- Mantener homologación 100% entre BD y repo
- Documentar cambios en SUPABASE.md

**PROHIBICIONES**:
- ❌ Usar `execute_sql` para DDL
- ❌ Modificar BD sin crear migración primero
- ❌ Crear múltiples migraciones para el mismo cambio

### @fullstack-dev
**ROL**: Solicita cambios de BD cuando es necesario

**OBLIGACIONES**:
- Identificar necesidades de cambios en BD
- Coordinar con @db-integration para crear migraciones
- NO intentar crear migraciones directamente
- Validar que queries funcionan después de migración

**PROHIBICIONES**:
- ❌ Modificar Supabase directamente
- ❌ Crear migraciones sin coordinar con @db-integration

### @arquitecto
**ROL**: Validador final de arquitectura y migraciones

**OBLIGACIONES**:
- Validar que migraciones siguen estándares arquitectónicos
- Ejecutar `extract-complete.mjs` antes de aprobar
- Verificar homologación entre BD y repo
- Validar que migraciones son idempotentes
- Aprobar/rechazar basado en calidad de migraciones

**PROHIBICIONES**:
- ❌ Aprobar sin validar migraciones
- ❌ Permitir modificaciones directas en BD

### @testing-expert
**ROL**: Valida que cambios en BD no rompen funcionalidad

**OBLIGACIONES**:
- Usar MCP Supabase para validar estado de BD
- Ejecutar tests después de migraciones
- Coordinar con @db-integration si detecta errores
- Validar RLS policies funcionan correctamente

**PROHIBICIONES**:
- ❌ Modificar BD para "arreglar" tests

### @security-qa
**ROL**: Valida seguridad de migraciones

**OBLIGACIONES**:
- Validar que nuevas tablas tienen RLS habilitado
- Verificar que policies usan `auth.organization_id()`
- Asegurar que migraciones no crean vulnerabilidades

**PROHIBICIONES**:
- ❌ Aprobar migraciones sin RLS en tablas multi-tenant

### @ai-automation
**ROL**: Puede necesitar cambios en BD para automatizaciones

**OBLIGACIONES**:
- Coordinar con @db-integration para cambios necesarios
- NO modificar BD directamente

**PROHIBICIONES**:
- ❌ Crear tablas/funciones sin migración

## 📋 CHECKLIST OBLIGATORIO

Antes de ejecutar CUALQUIER cambio en Supabase:

- [ ] Migración creada en `/workspaces/Podenza/supabase/migrations/`
- [ ] Nomenclatura correcta: `YYYYMMDDHHMMSS_descripcion.sql`
- [ ] SQL validado y es idempotente
- [ ] Incluye comentarios explicativos
- [ ] RLS policies incluidas si es tabla nueva
- [ ] Ejecutada usando `mcp__supabase__apply_migration`
- [ ] Sin errores en la ejecución
- [ ] `extract-complete.mjs` ejecutado exitosamente
- [ ] Tests ejecutados y pasando
- [ ] Archivo de migración versionado en Git
- [ ] Homologación 100% entre BD y repo
- [ ] Documentación actualizada

## 🚨 MANEJO DE ERRORES

### Si una migración falla:

```markdown
1. NO PÁNICO - Los errores son normales

2. Analizar el error:
   - Leer mensaje de error completo
   - Identificar causa raíz (sintaxis, constraint, etc.)

3. Corregir el archivo de migración:
   - Abrir archivo en /supabase/migrations/
   - Corregir SQL
   - Mantener el mismo nombre de archivo

4. Re-ejecutar usando apply_migration:
   - Usar mismo nombre
   - Validar que ahora funciona

5. Si el error es complejo:
   - Solicitar ayuda a @db-integration
   - Documentar el error y solución
```

### Si hay inconsistencia entre BD y repo:

```markdown
1. Ejecutar extract-complete.mjs para diagnosticar

2. Identificar qué está desincronizado

3. Opciones:
   a) Si falta migración en repo:
      - Crear migración que refleje estado actual de BD

   b) Si BD tiene cambios no documentados:
      - Revertir cambios en BD
      - Crear migración correcta

4. Validar homologación al 100%
```

## 🎯 ESTÁNDARES DE MIGRACIONES

### Nomenclatura

```
YYYYMMDDHHMMSS_descripcion_clara_en_snake_case.sql

Ejemplos:
- 20250116153000_create_leads_table.sql
- 20250116154500_add_organization_id_to_users.sql
- 20250116160000_enable_rls_on_leads.sql
```

### Estructura de Migración

```sql
-- Migration: [Descripción del cambio]
-- Date: [YYYY-MM-DD]
-- Author: [Agente que creó: @db-integration, @fullstack-dev coordinado, etc.]
-- Related: [HU-XXX o Task ID]

-- =============================================================================
-- [SECCIÓN 1: Descripción del cambio]
-- =============================================================================

-- Explicación de qué hace esta migración y por qué

-- =============================================================================
-- [SECCIÓN 2: Cambios DDL]
-- =============================================================================

-- Crear tabla
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_leads_organization_id ON public.leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_telefono ON public.leads(telefono);

-- =============================================================================
-- [SECCIÓN 3: RLS Policies]
-- =============================================================================

-- Habilitar RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policy para SELECT
CREATE POLICY "users_select_own_org_leads" ON public.leads
    FOR SELECT TO authenticated
    USING (organization_id IN (
        SELECT organization_id FROM public.accounts WHERE id = auth.uid()
    ));

-- Policy para INSERT
CREATE POLICY "users_insert_own_org_leads" ON public.leads
    FOR INSERT TO authenticated
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM public.accounts WHERE id = auth.uid()
    ));

-- =============================================================================
-- [SECCIÓN 4: Funciones y Triggers (si aplica)]
-- =============================================================================

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- [FIN DE MIGRACIÓN]
-- =============================================================================
```

### Idempotencia (CRÍTICO)

**SIEMPRE usar**:
- `CREATE TABLE IF NOT EXISTS`
- `CREATE INDEX IF NOT EXISTS`
- `DROP TABLE IF EXISTS` (con cuidado)
- `CREATE OR REPLACE FUNCTION`
- `CREATE POLICY IF NOT EXISTS` (Postgres 15+) o `DROP POLICY IF EXISTS` + `CREATE POLICY`

**Validar idempotencia**:
- Migración puede ejecutarse múltiples veces
- No falla si ya existe el recurso
- No duplica datos

## 🔄 INTEGRACIÓN CON BRANCHING DE SUPABASE

Para usar branching de Supabase y ejecutar PRs automáticamente:

```markdown
1. Desarrollo en rama dev:
   - Crear migraciones en rama dev
   - Aplicar a proyecto dev de Supabase
   - Validar funcionamiento

2. Pull Request:
   - Incluir archivos de migración en PR
   - CI/CD valida migraciones (futuro)
   - Review de migraciones obligatorio

3. Merge a main:
   - Migraciones se aplican automáticamente a producción
   - Branching de Supabase ejecuta migraciones
   - Validar post-deployment

4. Rollback (si es necesario):
   - Crear migración de rollback
   - NO modificar migración original
   - Aplicar rollback mediante nueva migración
```

## 📚 HERRAMIENTAS Y COMANDOS

### MCP Supabase

```javascript
// Crear y ejecutar migración
mcp__supabase__apply_migration({
  name: "add_leads_table",
  query: `
    CREATE TABLE IF NOT EXISTS public.leads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL,
      nombre TEXT NOT NULL
    );
  `
})

// Listar migraciones aplicadas
mcp__supabase__list_migrations()

// Listar tablas
mcp__supabase__list_tables({ schemas: ['public'] })

// Ejecutar query de validación (NO para DDL)
mcp__supabase__execute_sql({ query: "SELECT * FROM leads LIMIT 1" })
```

### Script de Validación

```bash
# Ejecutar extracción completa del schema
node /workspaces/Podenza/packages/supabase/extract-complete.mjs

# Esto genera:
# - Schema completo en JSON
# - Validación de consistencia
# - Reporte de migraciones aplicadas
```

### CLI de Supabase (alternativa)

```bash
# Ver migraciones
npx supabase migration list

# Crear migración (crea archivo vacío)
npx supabase migration new nombre_migracion

# Aplicar migración
npx supabase db push
```

## ✅ VALIDACIONES AUTOMÁTICAS (FUTURO CI/CD)

Futuras validaciones automáticas en CI/CD:

- [ ] Validar que migraciones tienen nomenclatura correcta
- [ ] Validar que SQL es válido
- [ ] Validar que nuevas tablas tienen RLS
- [ ] Ejecutar migraciones en ambiente de test
- [ ] Validar que no rompe tests existentes
- [ ] Validar homologación 100%

## 🎓 EJEMPLOS COMPLETOS

### Ejemplo 1: Crear nueva tabla

```sql
-- Migration: Create leads table with RLS
-- Date: 2025-01-16
-- Author: @db-integration
-- Related: HU-001

-- Crear tabla
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    email TEXT,
    cedula TEXT,
    estado TEXT DEFAULT 'activo',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_leads_organization_id ON public.leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_telefono ON public.leads(telefono);
CREATE INDEX IF NOT EXISTS idx_leads_cedula ON public.leads(cedula);

-- RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_org_leads" ON public.leads
    FOR SELECT TO authenticated
    USING (organization_id IN (
        SELECT organization_id FROM public.accounts WHERE id = auth.uid()
    ));

CREATE POLICY "users_insert_own_org_leads" ON public.leads
    FOR INSERT TO authenticated
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM public.accounts WHERE id = auth.uid()
    ));

CREATE POLICY "users_update_own_org_leads" ON public.leads
    FOR UPDATE TO authenticated
    USING (organization_id IN (
        SELECT organization_id FROM public.accounts WHERE id = auth.uid()
    ));

CREATE POLICY "users_delete_own_org_leads" ON public.leads
    FOR DELETE TO authenticated
    USING (organization_id IN (
        SELECT organization_id FROM public.accounts WHERE id = auth.uid()
    ));

-- Trigger updated_at
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
```

### Ejemplo 2: Agregar columna a tabla existente

```sql
-- Migration: Add score_crediticio to solicitudes
-- Date: 2025-01-16
-- Author: @db-integration
-- Related: HU-015 Scoring Automatizado

-- Agregar columna
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'solicitudes'
        AND column_name = 'score_crediticio'
    ) THEN
        ALTER TABLE public.solicitudes
        ADD COLUMN score_crediticio INTEGER;
    END IF;
END $$;

-- Agregar constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'solicitudes'
        AND constraint_name = 'score_crediticio_range'
    ) THEN
        ALTER TABLE public.solicitudes
        ADD CONSTRAINT score_crediticio_range
        CHECK (score_crediticio >= 0 AND score_crediticio <= 1000);
    END IF;
END $$;

-- Comentario
COMMENT ON COLUMN public.solicitudes.score_crediticio IS
'Score crediticio calculado por IA (0-1000 puntos)';
```

### Ejemplo 3: Crear función y trigger

```sql
-- Migration: Add audit logging trigger for leads
-- Date: 2025-01-16
-- Author: @db-integration
-- Related: Security requirement

-- Función de audit logging
CREATE OR REPLACE FUNCTION public.log_lead_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_log (
        organization_id,
        table_name,
        record_id,
        action,
        old_values,
        new_values,
        user_id,
        created_at
    )
    VALUES (
        COALESCE(NEW.organization_id, OLD.organization_id),
        'leads',
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
        auth.uid(),
        NOW()
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS audit_leads_changes ON public.leads;
CREATE TRIGGER audit_leads_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.log_lead_changes();
```

---

**Versión**: 1.0
**Última actualización**: 2025-01-16
**Mantenido por**: PODENZA Development Team

**🚨 RECORDATORIO FINAL**: Este proceso NO es opcional. Es OBLIGATORIO para TODOS los agentes. Las violaciones bloquean merge y requieren corrección inmediata.
