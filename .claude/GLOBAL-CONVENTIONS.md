# CONVENCIONES GLOBALES - PS COMERCIAL

> **IMPORTANTE**: Este documento define las convenciones OBLIGATORIAS para TODOS los agentes.
> Cualquier violación a estas convenciones BLOQUEA aprobaciones y merges.

## 📋 DATOS DEL PROYECTO

### Supabase
- **Project ID**: `zsauumglbhindsplazpk`
- **URL**: `https://zsauumglbhindsplazpk.supabase.co`
- **Publishable Key**: `sb_publishable_g4Zfm_uc8TuykpxWdaFCmw_MMY2geKT`

### Repositorio
- **Path Local**: `c:\Users\freddyrs\Documents\TDX Proyectos\PS\pscomercial`
- **Branches**: `main`, `dev`, `uat`
- **Branch de Desarrollo**: `dev`

### Stack Tecnológico
- **Framework**: Next.js 15.5.7 con Turbopack
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **UI**: Shadcn/UI + Tailwind CSS
- **Validación**: Zod
- **State**: React Query (TanStack Query)
- **Monorepo**: Turborepo con pnpm

## 🏗️ ARQUITECTURA MULTI-TENANT

### Principio Fundamental
**TODA** la data está aislada por `organization_id`. Un usuario NUNCA debe ver datos de otra organización.

### Estructura de Tablas
```sql
-- OBLIGATORIO en TODAS las tablas
CREATE TABLE public.nombre_tabla (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    -- ... otros campos
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- OBLIGATORIO: Índice en organization_id
CREATE INDEX idx_nombre_tabla_organization_id ON public.nombre_tabla(organization_id);

-- OBLIGATORIO: RLS habilitado
ALTER TABLE public.nombre_tabla ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nombre_tabla FORCE ROW LEVEL SECURITY;
```

### RLS Policies Estándar
```sql
-- Policy para SELECT
CREATE POLICY "users_select_own_org" ON public.nombre_tabla
    FOR SELECT TO authenticated
    USING (organization_id IN (
        SELECT organization_id FROM public.accounts WHERE id = auth.uid()
    ));

-- Policy para INSERT
CREATE POLICY "users_insert_own_org" ON public.nombre_tabla
    FOR INSERT TO authenticated
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM public.accounts WHERE id = auth.uid()
    ));

-- Policy para UPDATE
CREATE POLICY "users_update_own_org" ON public.nombre_tabla
    FOR UPDATE TO authenticated
    USING (organization_id IN (
        SELECT organization_id FROM public.accounts WHERE id = auth.uid()
    ));

-- Policy para DELETE
CREATE POLICY "users_delete_own_org" ON public.nombre_tabla
    FOR DELETE TO authenticated
    USING (organization_id IN (
        SELECT organization_id FROM public.accounts WHERE id = auth.uid()
    ));
```

## 📁 ESTRUCTURA DE ARCHIVOS

### Ubicación de Código
```
apps/web/
├── app/                     # App Router de Next.js
│   ├── home/               # Rutas autenticadas
│   │   ├── [account]/      # Rutas por organización
│   │   │   ├── leads/      # Módulo de Leads
│   │   │   ├── cotizaciones/ # Módulo de Cotizaciones
│   │   │   └── ...
│   │   └── settings/       # Configuración
│   └── api/                # API Routes
├── lib/                    # Código compartido
│   ├── [modulo]/          # Código por módulo
│   │   ├── components/    # Componentes React
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilidades
│   │   └── schema/        # Schemas Zod
│   └── supabase/          # Cliente Supabase
└── components/            # Componentes globales
```

### Ubicación de Documentación
```
Context/
├── HU/                    # Historias de Usuario
│   └── md/               # HUs en Markdown
├── .MD/                   # Documentación generada
│   ├── Plan-de-Trabajo.md # Plan de trabajo actual
│   └── REPORTE-*.md      # Reportes de validación
├── Testing/              # Reportes de testing
├── Database/             # Documentación de BD
└── .SHARED/              # Archivos compartidos entre agentes
```

## 📝 CONVENCIONES DE CÓDIGO

### TypeScript
```typescript
// OBLIGATORIO: Strict mode
// tsconfig.json ya tiene "strict": true

// Interfaces con prefijo I o sufijo Props/State
interface ILead {
  id: string;
  organization_id: string;
  nombre: string;
}

interface LeadFormProps {
  lead?: ILead;
  onSubmit: (data: ILead) => void;
}

// Types para uniones o tipos simples
type LeadStatus = 'nuevo' | 'contactado' | 'calificado' | 'convertido' | 'desistido';
```

### Validación con Zod
```typescript
// OBLIGATORIO: Usar Zod para validación
import { z } from 'zod';

export const leadSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  telefono: z.string().regex(/^\+?[0-9\s-]+$/, 'Teléfono inválido'),
  email: z.string().email('Email inválido').optional(),
  cedula: z.string().optional(),
  organization_id: z.string().uuid(),
});

export type Lead = z.infer<typeof leadSchema>;
```

### Componentes React
```tsx
// OBLIGATORIO: Componentes funcionales con TypeScript
'use client';

import { useState } from 'react';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';

interface LeadFormProps {
  onSubmit: (data: Lead) => Promise<void>;
  initialData?: Partial<Lead>;
}

export function LeadForm({ onSubmit, initialData }: LeadFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OBLIGATORIO: Manejar loading, error, success states
  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  return (
    // ...
  );
}
```

### Queries con Supabase
```typescript
// OBLIGATORIO: Usar cliente de Supabase del kit
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// En Server Components / Server Actions
export async function getLeads(organizationId: string) {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('leads')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching leads: ${error.message}`);
  }

  return data;
}
```

## 🔒 SEGURIDAD

### Validaciones Obligatorias
1. **Input Sanitization**: Validar TODA entrada del usuario con Zod
2. **SQL Injection**: NUNCA usar string concatenation en queries
3. **XSS**: Usar React para renderizar, no `dangerouslySetInnerHTML`
4. **CSRF**: Usar tokens CSRF en formularios
5. **RLS**: TODAS las tablas deben tener RLS habilitado

### Datos Sensibles
```typescript
// NUNCA loguear datos sensibles
console.log('User:', user.email); // ❌ NO
console.log('User ID:', user.id); // ✅ OK

// NUNCA exponer en frontend
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Solo backend
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Frontend OK
```

## 📊 DOCUMENTACIÓN OBLIGATORIA

### Actualización de Plan de Trabajo
```markdown
# Ubicación: /Context/.MD/Plan-de-Trabajo.md

## Estructura Obligatoria:
1. Estado actual del desarrollo
2. HUs en progreso con % completado
3. Próximos pasos
4. Blockers o issues pendientes
5. Decisiones arquitectónicas tomadas
```

### Reportes de Agentes
```markdown
# Nomenclatura: /Context/.MD/REPORTE-[tipo]-[modulo]-[fecha].md

Tipos:
- REPORTE-arquitectura-leads-2025-01-XX.md
- REPORTE-testing-cotizaciones-2025-01-XX.md
- VALIDACION-UX-leads-2025-01-XX.md
- SECURITY-audit-accesos-2025-01-XX.md
```

## 🔄 WORKFLOW DE DESARROLLO

### Antes de Empezar Feature
1. Leer HU completa en `/Context/HU/md/`
2. Revisar arquitectura existente
3. Consultar `Plan-de-Trabajo.md`
4. Coordinar con agentes relevantes

### Durante Desarrollo
1. Actualizar `Plan-de-Trabajo.md` con progreso
2. Crear migraciones ANTES de modificar BD
3. Validar con checklist de seguridad
4. Testing continuo

### Al Finalizar
1. Ejecutar todos los tests
2. Validar con `@testing-expert`
3. Review de `@arquitecto`
4. Actualizar documentación
5. Commit con mensaje descriptivo

## ✅ CHECKLIST GLOBAL

Antes de aprobar cualquier cambio:

- [ ] Multi-tenancy: `organization_id` en todas las tablas nuevas
- [ ] RLS: Policies habilitadas y correctas
- [ ] Migración: Creada ANTES de modificar BD
- [ ] TypeScript: Sin errores de tipos
- [ ] Validación: Zod schemas definidos
- [ ] Seguridad: Sin vulnerabilidades conocidas
- [ ] Testing: Tests pasando
- [ ] Documentación: `Plan-de-Trabajo.md` actualizado

## 🚨 VIOLACIONES BLOQUEANTES

Las siguientes violaciones BLOQUEAN merge inmediatamente:

1. ❌ Tabla sin `organization_id` (si aplica multi-tenancy)
2. ❌ RLS no habilitado en tabla nueva
3. ❌ Modificación directa de BD sin migración
4. ❌ Credenciales hardcodeadas en código
5. ❌ SQL injection vulnerabilities
6. ❌ Datos de otras organizaciones expuestos
7. ❌ Tests críticos fallando

---

**Versión**: 1.0
**Última actualización**: 2025-01-XX
**Proyecto**: PS Comercial
