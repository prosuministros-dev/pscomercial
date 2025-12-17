# WORKFLOW: IMPLEMENTACIÓN DE NUEVA FEATURE

## 🎯 Objetivo
Implementar una nueva funcionalidad completa en PODENZA, desde el diseño hasta el deploy, asegurando calidad y seguridad multi-tenant.

## 📋 Pre-requisitos
- [ ] Feature definida claramente en requirements
- [ ] Prioridad determinada (P0/P1/P2/P3/P4)
- [ ] No hay bloqueos de dependencias
- [ ] Contexto de /Context/Rules/ revisado

## 👥 Agentes Involucrados

- **coordinator**: Orquesta el proceso completo
- **arquitecto**: Valida arquitectura, seguridad, cumplimiento de reglas y HUs (GUARDIAN DE CALIDAD)
- **designer-ux-ui**: Validación de UX/UI + Branding + Templates Figma
- **fullstack-dev**: Implementa UI + lógica de negocio
- **db-integration**: Schema, migraciones, integraciones (si aplica)
- **ai-automation**: Automatizaciones con IA (si aplica)
- **security-qa**: Security review + QA

## 🔄 PASOS DEL WORKFLOW

### 1. ANÁLISIS Y PLANIFICACIÓN
**Responsable**: coordinator
**Duración estimada**: 30min - 2hrs

#### Acciones:
```markdown
1. Analizar request del usuario
2. Consultar Plan-de-Trabajo.md para verificar si está planificado
3. Determinar prioridad (🔴P0/🟡P1/🟢P2/🔵P3/⚪P4)
4. Identificar:
   - ¿Requiere UI? → designer-ux-ui + fullstack-dev
   - ¿Existe template Figma? → /Context/Templates/Figma/[carpeta]
   - ¿Requiere DB changes? → db-integration
   - ¿Requiere integraciones? → db-integration
   - ¿Requiere IA? → ai-automation
5. Estimar complejidad: S/M/L/XL
6. Crear plan de acción con pasos específicos
```

#### Entregable:
```markdown
## Plan de Implementación: [Feature Name]

### Prioridad
[🔴/🟡/🟢/🔵/⚪] P[0-4] - [Justificación]

### Descripción
[Descripción detallada de qué se va a implementar]

### Componentes Afectados
- Frontend: [componentes específicos]
- Backend: [API routes, lógica]
- Database: [tablas, migraciones]
- Integraciones: [APIs externas]

### Plan de Ejecución
1. [@agente] [Tarea específica] - [Duración estimada]
2. [@agente] [Tarea específica] - [Duración estimada]
...

### Documentos de Contexto
- /Context/Rules/[documento1].md
- /Context/Rules/[documento2].md

### HU Correspondiente
- /Context/HU/[HU-ID].md

### Criterios de Aceptación
- [ ] Criterio 1
- [ ] Criterio 2
- [ ] Criterio 3

### Riesgos Identificados
- [Riesgo 1 y mitigación]

---
¿Aprobado para proceder?
```

---

### 1.B VALIDACIÓN ARQUITECTÓNICA DEL PLAN
**Responsable**: arquitecto
**Duración estimada**: 30min - 1hr

**CRÍTICO**: El arquitecto valida el plan ANTES de cualquier implementación.

#### Acciones:
```markdown
1. Leer el plan de implementación completo
2. Identificar qué reglas de /Context/Rules/ aplican
3. Identificar HU correspondiente en /Context/HU/
4. Revisar criterios de aceptación de la HU
5. Validar que el plan cumple con principios arquitectónicos
6. Generar checklist específico para la implementación
7. Aprobar plan O solicitar ajustes con justificación técnica
```

#### Entregable:
```markdown
## 🏛️ Validación Arquitectónica del Plan - [Feature Name]

### Reglas Aplicables
- [x] /Context/Rules/Arquitectura.md
- [x] /Context/Rules/Seguridad-y-Reglas.md
- [x] /Context/Rules/[otros documentos relevantes]

### HU Correspondiente
- **HU ID**: HU-XXXX
- **Archivo**: /Context/HU/[archivo].md
- **Criterios de Aceptación**: [número]

### Validaciones Pre-Implementación
- [ ] Plan incluye organization_id + owner_id en tablas
- [ ] Plan usa memberships como fuente de verdad
- [ ] Plan incluye RLS con FORCE + 4 policies (S/I/U/D)
- [ ] Plan NO usa created_by para autorización
- [ ] Plan incluye referencias a auth.users(id) NO accounts(id)
- [ ] Plan incluye índices: idx_tabla_org_owner, idx_tabla_owner
- [ ] Plan valida Storage con metadata + JOIN (si aplica)
- [ ] Plan incluye audit logging con org_id + owner_id (si es crítico)

### Checklist Específico para Esta Feature
[Checklist personalizado según la feature]

### Investigación Realizada
[Si el arquitecto investigó best practices, documentarlas aquí]

### Decisión
[ ] ✅ APROBADO - Puede proceder con implementación
[ ] ⚠️ APROBADO CON CONDICIONES - Ver comentarios abajo
[ ] 🔴 RECHAZADO - Requiere cambios en el plan

**Comentarios**: [Explicación de la decisión]

---
Validado por: @arquitecto
Fecha: [fecha]
```

**BLOCKER**: Si el arquitecto RECHAZA el plan, NO se puede proceder hasta que se corrija.

---

### 2. DISEÑO DE BASE DE DATOS (Si aplica)
**Responsable**: db-integration
**Duración estimada**: 2-6hrs

**🚨 OBLIGATORIO**: Seguir proceso de migraciones definido en:
`/workspaces/Podenza/.claude/SUPABASE-MIGRATION-RULES.md`

#### Acciones:
```markdown
1. Leer:
   - 🚨 /workspaces/Podenza/.claude/SUPABASE-MIGRATION-RULES.md (OBLIGATORIO)
   - /Context/Rules/Arquitectura.md (schemas existentes)
   - /Context/Rules/Database-Migration-Scripts.md
   - /Context/Rules/Seguridad-y-Reglas.md (RLS policies)
   - /Context/Rules/SUPABASE.md (esquema actual)

2. Ejecutar `extract-complete.mjs` para ver estado actual de BD:
   node /workspaces/Podenza/Context/Database/extract-complete.mjs

3. Diseñar schema multi-tenant:
   - Incluir organization_id en todas las tablas
   - Definir foreign keys apropiadas
   - Planificar índices optimizados

4. Diseñar RLS policies:
   - Policy para SELECT
   - Policy para INSERT
   - Policy para UPDATE
   - Policy para DELETE

5. Crear archivo de migración en /workspaces/Podenza/supabase/migrations/:
   - Nomenclatura: YYYYMMDDHHMMSS_descripcion_en_snake_case.sql
   - CREATE TABLE statements con IF NOT EXISTS
   - CREATE INDEX statements con CONCURRENTLY
   - RLS policies (ENABLE ROW LEVEL SECURITY)
   - Functions y triggers (si necesarios)
   - Rollback script comentado

6. Ejecutar migración usando mcp__supabase__apply_migration
   (NO usar execute_sql para DDL)

7. Si hay errores: corregir archivo de migración, NO crear nueva

8. Validar con extract-complete.mjs que cambios se aplicaron

9. Commit archivo de migración a Git
```

#### Entregable:
- Script de migración: `/workspaces/Podenza/supabase/migrations/YYYYMMDDHHMMSS_[descripcion].sql`
- Archivo versionado en Git
- Homologación 100% entre BD y repo
- Documentación de decisiones técnicas
- Plan de rollback (comentado en migración)

#### Checklist de Calidad:
- [ ] Todas las tablas tienen organization_id + owner_id
- [ ] RLS policies implementadas (FORCE + 4 policies)
- [ ] Índices optimizados creados
- [ ] Script de rollback incluido
- [ ] Performance estimado aceptable
- [ ] 🚨 Migración creada en /supabase/migrations/ ANTES de ejecutar
- [ ] 🚨 Ejecutada con mcp__supabase__apply_migration
- [ ] 🚨 extract-complete.mjs validó cambios
- [ ] 🚨 Archivo de migración versionado en Git

---

### 2.B VALIDACIÓN ARQUITECTÓNICA DE DB DESIGN
**Responsable**: arquitecto
**Duración estimada**: 30min - 1hr

**CRÍTICO**: El arquitecto valida el diseño de DB antes de implementación.

#### Acciones:
```markdown
1. 🚨 Leer /workspaces/Podenza/.claude/SUPABASE-MIGRATION-RULES.md
2. Validar que se siguió proceso de migraciones obligatorio
3. Verificar que archivo existe en /workspaces/Podenza/supabase/migrations/
4. Ejecutar extract-complete.mjs para validar estado actual
5. Leer script de migración completo
6. Validar contra /Context/Rules/Database-Migration-Scripts.md
7. Verificar cumplimiento de arquitectura multi-tenant
8. Identificar issues por severidad (BLOCKER/HIGH/MEDIUM/LOW)
```

#### Entregable:
```markdown
## 🏛️ Validación Arquitectónica - DB Design

### Validación de Proceso de Migraciones
- [ ] 🚨 Archivo de migración existe en /supabase/migrations/
- [ ] 🚨 Nomenclatura correcta: YYYYMMDDHHMMSS_descripcion.sql
- [ ] 🚨 Migración es idempotente (IF NOT EXISTS, etc.)
- [ ] 🚨 Ejecutada con mcp__supabase__apply_migration (NO execute_sql)
- [ ] 🚨 extract-complete.mjs validó cambios aplicados
- [ ] 🚨 Archivo versionado en Git (git status confirma)
- [ ] 🚨 Homologación 100% entre BD y repo

### Validaciones de Schema
- [ ] Tabla tiene organization_id UUID NOT NULL
- [ ] Tabla tiene owner_id UUID NOT NULL REFERENCES auth.users(id)
- [ ] Referencias a auth.users(id) NO a accounts(id)
- [ ] Índices: idx_tabla_org_owner, idx_tabla_owner
- [ ] Foreign keys con ON DELETE CASCADE apropiados

### Validaciones de RLS
- [ ] ENABLE ROW LEVEL SECURITY
- [ ] FORCE ROW LEVEL SECURITY ✅ CRÍTICO
- [ ] Policy SELECT usa memberships + owner_id + access_grants
- [ ] Policy INSERT valida organization_id desde memberships
- [ ] Policy UPDATE usa owner_id + is_org_admin()
- [ ] Policy DELETE usa owner_id + is_org_admin()

### Issues Encontrados
🔴 BLOCKER #X: [descripción]
- Archivo: [path:línea]
- Regla violada: [regla]
- Corrección requerida: [código correcto]

🟡 HIGH #X: [descripción]
🟢 MEDIUM #X: [descripción]

### Decisión
[ ] 🔴 BLOQUEADO - No puede implementarse (violación de proceso de migraciones)
[ ] 🟡 CAMBIOS REQUERIDOS - Ver issues arriba
[ ] ✅ APROBADO - Listo para implementación

---
Revisado por: @arquitecto
```

**BLOCKER**: Si hay issues BLOCKER o si NO se siguió el proceso de migraciones, NO se puede proceder hasta que se corrija.

---

### 3. IMPLEMENTACIÓN DE BACKEND
**Responsable**: fullstack-dev o db-integration
**Duración estimada**: 4-12hrs

#### Acciones:
```markdown
1. Crear API routes o server actions:
   - Definir endpoints necesarios
   - Implementar lógica de negocio

2. Implementar validaciones:
   - Crear Zod schemas
   - Validar inputs en todos los endpoints

3. Implementar multi-tenant logic:
   - Verificar organization_id en todas las operaciones
   - Usar RLS policies de Supabase

4. Error handling:
   - Try-catch en todas las operaciones async
   - Mensajes de error claros
   - Logging apropiado

5. Audit logging (si es acción crítica):
   - Registrar en audit_logs
   - Incluir: user_id, organization_id, action, old/new values

6. Tests unitarios básicos
```

#### Entregable:
```typescript
// Ejemplo de estructura esperada

// app/api/[feature]/route.ts
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const FeatureSchema = z.object({
  organization_id: z.string().uuid(),
  // ... otros campos
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validar input
    const body = await request.json();
    const validated = FeatureSchema.parse(body);

    // 3. Verificar tenant
    const { data: account } = await supabase
      .from('accounts')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (account?.organization_id !== validated.organization_id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 4. Lógica de negocio
    const result = await performBusinessLogic(validated);

    // 5. Audit log (si es crítico)
    await logAudit({
      organization_id: validated.organization_id,
      action: 'feature_action',
      user_id: user.id,
      data: result,
    });

    return Response.json(result, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### Checklist de Calidad:
- [ ] Validación con Zod implementada
- [ ] Multi-tenant isolation verificado
- [ ] Error handling completo
- [ ] Audit logging (si aplica)
- [ ] TypeScript types correctos
- [ ] Tests básicos escritos

---

### 3.B VALIDACIÓN ARQUITECTÓNICA DE BACKEND
**Responsable**: arquitecto
**Duración estimada**: 30min - 1hr

#### Acciones:
```markdown
1. Leer código de backend completo
2. Validar contra /Context/Rules/Seguridad-y-Reglas.md
3. Verificar cumplimiento de multi-tenant isolation
4. Validar que NO se confía en organization_id del frontend
```

#### Entregable:
```markdown
## 🏛️ Validación Arquitectónica - Backend

### Validaciones de Seguridad
- [ ] auth.getUser() valida identidad
- [ ] organization_id se obtiene de memberships (NO del request)
- [ ] Validación Zod implementada
- [ ] Error handling completo
- [ ] NO hay organization_id en request.json

### Validaciones de Audit Logging
- [ ] Acciones críticas logueadas
- [ ] Logs incluyen organization_id + owner_id

### Issues Encontrados
🔴 BLOCKER #X: [descripción + código correcto]
🟡 HIGH #X: [descripción]

### Decisión
[ ] 🔴 BLOQUEADO
[ ] 🟡 CAMBIOS REQUERIDOS
[ ] ✅ APROBADO

---
Revisado por: @arquitecto
```

---

### 4. VALIDACIÓN UX/UI PRE-IMPLEMENTACIÓN (Si aplica)
**Responsable**: designer-ux-ui
**Duración estimada**: 1-3hrs

#### Acciones:
```markdown
1. Revisar template Figma asignado:
   - Ubicación: /Context/Templates/Figma/[carpeta]
   - Validar que diseño está completo
   - Identificar componentes necesarios

2. Validar branding PODENZA:
   - Colores: #E7FF8C, #FF931E, #2C3E2B
   - Tipografía según jerarquía
   - Espaciado según escala

3. Definir estados necesarios:
   - Loading state
   - Error state
   - Empty state
   - Success feedback

4. Planificar responsive:
   - Mobile (< 640px)
   - Tablet (640px - 1024px)
   - Desktop (> 1024px)

5. Identificar componentes reutilizables:
   - Del sistema de diseño existente
   - Nuevos componentes necesarios
```

#### Entregable:
```markdown
## UX/UI Pre-Implementation Guide - [Feature Name]

### Template Figma
- Ubicación: /Context/Templates/Figma/[carpeta]/[archivo]
- Estado: ✅ Completo / ⚠️ Parcial / ❌ No existe

### Componentes Necesarios
1. [Componente 1] - Reutilizable de packages/ui
2. [Componente 2] - Nuevo (crear)
3. [Componente 3] - Adaptación de existente

### Estados Requeridos
- [ ] Loading: Spinner + "Cargando..."
- [ ] Error: Mensaje claro + icono XCircle
- [ ] Empty: Ilustración + mensaje + CTA
- [ ] Success: Toast notification

### Responsive Breakpoints
- Mobile: [Comportamiento específico]
- Tablet: [Comportamiento específico]
- Desktop: [Comportamiento específico]

### Branding Checklist
- [ ] Variables CSS: bg-primary, bg-accent, text-foreground
- [ ] NO colores hardcodeados
- [ ] Tipografía: text-3xl (H1), text-2xl (H2), text-base (Body)
- [ ] Espaciado: p-4, m-4, gap-4
- [ ] Border radius: rounded-podenza

### Validaciones Críticas
- [ ] Textos no se cortan en móvil
- [ ] Contraste adecuado (WCAG AA)
- [ ] Estados hover/active definidos
- [ ] Focus states visibles

---
Aprobado para implementación: ✅ / Requiere ajustes: ⚠️
By: @designer-ux-ui
Date: [fecha]
```

#### Checklist de Calidad:
- [ ] Template Figma revisado (si existe)
- [ ] Componentes identificados
- [ ] Estados definidos
- [ ] Responsive planificado
- [ ] Branding PODENZA validado

---

### 5. IMPLEMENTACIÓN DE FRONTEND
**Responsable**: fullstack-dev
**Duración estimada**: 6-16hrs

#### Acciones:
```markdown
1. Leer:
   - /Context/Rules/Branding.md (colores, componentes)
   - /Context/Rules/Arquitectura.md (estructura)

2. Crear componentes:
   - Usar Shadcn/UI components existentes
   - Aplicar branding PODENZA (variables CSS)
   - Implementar responsive design

3. Implementar formularios (si aplica):
   - React Hook Form + Zod validation
   - Estados: loading, error, success
   - Error messages claros

4. Integrar con backend:
   - React Query para data fetching
   - Mutations para operaciones
   - Cache strategy apropiada

5. Estados de UI:
   - Loading spinners
   - Error messages
   - Empty states
   - Success feedback

6. Tests de componentes
```

#### Entregable:
```typescript
// Ejemplo de componente esperado

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const FeatureSchema = z.object({
  // ... schema fields
});

type FeatureFormData = z.infer<typeof FeatureSchema>;

export function FeatureForm({ organizationId }: Props) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FeatureFormData>({
    resolver: zodResolver(FeatureSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: FeatureFormData) =>
      fetch('/api/feature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, organization_id: organizationId }),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to create');
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features', organizationId] });
      toast.success('Feature created successfully');
      reset();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create feature');
    },
  });

  const onSubmit = (data: FeatureFormData) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Form fields */}
      <Button
        type="submit"
        disabled={mutation.isPending}
        className="btn-podenza-primary"
      >
        {mutation.isPending ? 'Creating...' : 'Create Feature'}
      </Button>
    </form>
  );
}
```

#### Checklist de Calidad:
- [ ] Branding PODENZA aplicado (variables CSS)
- [ ] Validación de formularios con Zod
- [ ] Estados de loading/error implementados
- [ ] React Query integrado correctamente
- [ ] Responsive design verificado
- [ ] TypeScript types correctos
- [ ] Tests de componentes escritos

---

### 5.B VALIDACIÓN ARQUITECTÓNICA DE FRONTEND
**Responsable**: arquitecto
**Duración estimada**: 30min - 1hr

#### Acciones:
```markdown
1. Leer código de frontend completo
2. Validar contra /Context/Rules/Frontend-Multi-Tenant-Implementation.md
3. Verificar que OrganizationContext usa memberships
4. Validar que queries NO envían organization_id
```

#### Entregable:
```markdown
## 🏛️ Validación Arquitectónica - Frontend

### Validaciones de Multi-Tenancy
- [ ] OrganizationContext usa memberships
- [ ] Queries NO envían organization_id (RLS valida)
- [ ] Inserts incluyen owner_id
- [ ] TenantAwareSupabaseClient valida desde memberships

### Validaciones de Branding
- [ ] Variables CSS usadas (NO colores hardcodeados)
- [ ] Componentes usan Shadcn/UI
- [ ] Estados implementados (loading/error/empty/success)

### Issues Encontrados
🔴 BLOCKER #X: [descripción + código correcto]
🟡 HIGH #X: [descripción]

### Decisión
[ ] 🔴 BLOQUEADO
[ ] 🟡 CAMBIOS REQUERIDOS
[ ] ✅ APROBADO

---
Revisado por: @arquitecto
```

---

### 6. AUTOMATIZACIÓN CON IA (Si aplica)
**Responsable**: ai-automation
**Duración estimada**: 4-12hrs

#### Acciones:
```markdown
1. Identificar oportunidades de automatización:
   - Análisis de documentos
   - Decisiones automáticas
   - Triggers de workflow

2. Implementar lógica de IA:
   - Seleccionar provider apropiado (OpenAI/Anthropic/Gemini)
   - Optimizar prompts
   - Implementar confidence thresholds
   - Fallback a proceso manual

3. Audit logging:
   - Registrar todas las decisiones de IA
   - Incluir confidence scores
   - Tracking de accuracy

4. Testing:
   - Validar outputs de IA
   - Verificar fallbacks funcionan
```

#### Checklist de Calidad:
- [ ] Confidence threshold implementado (< 0.75 → human review)
- [ ] Fallback a proceso manual funciona
- [ ] Audit logging completo
- [ ] Rate limiting configurado
- [ ] Costs optimizados

---

### 7. VALIDACIÓN UX/UI POST-IMPLEMENTACIÓN (Si aplica)
**Responsable**: designer-ux-ui
**Duración estimada**: 2-4hrs

#### Acciones:
```markdown
1. Ejecutar checklist de validación completo:
   - Colores hardcodeados (🔴 BLOCKER)
   - Branding PODENZA correcto
   - Textos cortados o superpuestos
   - Estados loading/error/empty/success
   - Responsive design

2. Validar vs template Figma:
   - Comparar componentes implementados vs diseño
   - Verificar colores exactos
   - Validar espaciado y tipografía
   - Confirmar interacciones

3. Testing manual:
   - Chrome, Safari, Firefox
   - Mobile (iOS y Android)
   - Diferentes breakpoints
   - Todos los estados

4. Identificar issues por nivel:
   - 🔴 BLOCKER: Críticos (colores hardcodeados, etc.)
   - 🟡 HIGH: Cambios requeridos
   - 🟢 MEDIUM: Recomendaciones
   - 🔵 LOW: Nice to have

5. Generar Design Review Report completo
```

#### Entregable:
```markdown
# Design & UX Review - [Feature Name]

## 1. VALIDACIONES CRÍTICAS 🔴

### Colores Hardcodeados
- [✅/❌] No hay colores hardcodeados

**Issues encontrados**: [lista con archivos y líneas]

### Branding PODENZA
- [✅/❌] Paleta correcta (#E7FF8C, #FF931E, #2C3E2B)

**Issues encontrados**: [lista]

### Textos y Contenido
- [✅/❌] No hay textos superpuestos
- [✅/❌] No hay textos cortados

**Issues encontrados**: [lista con screenshots]

### Estados de UI
- [✅/❌] Loading implementado
- [✅/❌] Error implementado
- [✅/❌] Empty implementado
- [✅/❌] Success implementado

**Issues encontrados**: [lista]

### Responsive Design
- [✅/❌] Mobile (< 640px)
- [✅/❌] Tablet (640px - 1024px)
- [✅/❌] Desktop (> 1024px)

**Issues encontrados**: [lista]

**🔴 BLOCKER COUNT**: [número]

---

## 2. VALIDACIONES ALTAS 🟡

### Tipografía
- [✅/❌] Jerarquía correcta
- [✅/❌] Tamaños según escala

**Issues**: [lista]

### Espaciado
- [✅/❌] Espaciado consistente
- [✅/❌] Usando escala definida

**Issues**: [lista]

### Componentes Interactivos
- [✅/❌] Estados hover
- [✅/❌] Estados active
- [✅/❌] Estados disabled

**Issues**: [lista]

**🟡 CAMBIOS REQUERIDOS**: [número]

---

## 3. VALIDACIÓN VS FIGMA

### Coincidencia con Diseño
- [✅/❌] Layout coincide
- [✅/❌] Colores exactos
- [✅/❌] Espaciado según spec
- [✅/❌] Tipografía correcta

**Discrepancias**: [lista con screenshots]

---

## 4. DECISIÓN FINAL

[ ] 🔴 BLOCKED - No puede mergearse
[ ] 🟡 CHANGES REQUIRED - Cambios antes de merge
[ ] 🟢 APPROVED WITH SUGGESTIONS - Puede mergearse
[ ] ✅ APPROVED - Listo para merge

---
Reviewed by: @designer-ux-ui
Date: [fecha]
```

#### Checklist de Calidad:
- [ ] Checklist UX/UI completo ejecutado
- [ ] Validación vs Figma realizada
- [ ] Testing manual en ≥ 3 navegadores
- [ ] Issues clasificados por severidad
- [ ] Screenshots de issues capturados
- [ ] Decisión final documentada

---

### 8. SECURITY & CODE REVIEW
**Responsable**: security-qa
**Duración estimada**: 2-6hrs

#### Acciones:
```markdown
1. Ejecutar Security Checklist completo:
   - Multi-tenant isolation
   - Input validation
   - RLS policies
   - Audit logging
   - Authentication & Authorization
   - Integraciones externas (si aplica)

2. Code Quality Review:
   - TypeScript strict
   - Error handling
   - Performance
   - Branding compliance

3. Testing Review:
   - Ejecutar tests existentes
   - Verificar coverage
   - Identificar tests faltantes

4. Generar feedback:
   - 🔴 BLOCKER: issues críticos
   - 🟡 HIGH: cambios requeridos
   - 🟢 MEDIUM: recomendaciones
   - 🔵 LOW: nice to have
```

#### Entregable:
```markdown
## Security & Code Review - [Feature Name]

### Security Review
#### Multi-Tenant Isolation
- [✅/❌] Queries incluyen organization_id
- [✅/❌] RLS policies correctas
- [✅/❌] No hay cross-tenant leaks

#### Input Validation
- [✅/❌] Validación con Zod
- [✅/❌] Validación frontend y backend

#### Audit Logging
- [✅/❌] Acciones críticas logueadas

🔴 BLOCKERS:
- [Lista de issues que bloquean merge]

🟡 CAMBIOS REQUERIDOS:
- [Lista de cambios necesarios]

### Code Quality Review
- [✅/❌] TypeScript strict
- [✅/❌] Error handling completo
- [✅/❌] Performance aceptable
- [✅/❌] Branding aplicado

### Testing Review
- [✅/❌] Tests unitarios pasando
- [✅/❌] Coverage aceptable (>70%)

## Decision
[✅ APPROVED / 🟡 CHANGES REQUESTED / 🔴 BLOCKED]

---
Reviewed by: @security-qa
Date: [fecha]
```

---

### 8.B VALIDACIÓN ARQUITECTÓNICA FINAL
**Responsable**: arquitecto
**Duración estimada**: 1-2hrs

**CRÍTICO**: El arquitecto realiza validación final antes de merge, verificando que TODOS los criterios de aceptación de la HU se cumplan.

#### Acciones:
```markdown
1. Re-leer TODA la implementación (DB + Backend + Frontend)
2. Verificar que TODOS los issues BLOCKER fueron resueltos
3. Validar contra HU que TODOS los criterios de aceptación se cumplen
4. Validar cumplimiento completo de /Context/Rules/
5. Generar reporte final de validación
```

#### Entregable:
```markdown
## 🏛️ Validación Arquitectónica FINAL - [Feature Name]

### Checklist Arquitectura Multi-Tenant
- [ ] Tablas tienen organization_id + owner_id
- [ ] Referencias a auth.users(id) NO accounts(id)
- [ ] Índices: idx_tabla_org_owner, idx_tabla_owner

### Checklist RLS Policies
- [ ] ENABLE ROW LEVEL SECURITY
- [ ] FORCE ROW LEVEL SECURITY ✅ CRÍTICO
- [ ] 4 policies: SELECT, INSERT, UPDATE, DELETE
- [ ] Policies usan memberships + owner_id + access_grants

### Checklist Frontend Multi-Tenant
- [ ] OrganizationContext usa memberships
- [ ] Queries NO envían organization_id
- [ ] Inserts incluyen owner_id

### Checklist Storage (si aplica)
- [ ] Metadata: organization_id, owner_id
- [ ] Policies con JOIN a tabla de documentos

### Checklist Integraciones (si aplica)
- [ ] Logs incluyen organization_id + owner_id
- [ ] Helper getCurrentUserContext() desde memberships

### Cumplimiento de HU
**HU ID**: [HU-XXXX]
**Archivo**: /Context/HU/[archivo].md

#### Criterios de Aceptación
- [ ] Criterio 1: [descripción] - ✅ CUMPLIDO
- [ ] Criterio 2: [descripción] - ✅ CUMPLIDO
- [ ] Criterio 3: [descripción] - ✅ CUMPLIDO

#### Casos de Uso Validados
- [ ] Caso de uso 1 - ✅ IMPLEMENTADO
- [ ] Caso de uso 2 - ✅ IMPLEMENTADO

#### Reglas de Negocio Aplicadas
- [ ] Regla 1 - ✅ APLICADA
- [ ] Regla 2 - ✅ APLICADA

### Issues Pendientes
🔴 BLOCKER: [número] - DEBE SER CERO
🟡 HIGH: [número]
🟢 MEDIUM: [número]

### Decisión FINAL
[ ] 🔴 BLOQUEADO - No puede mergearse (BLOCKER count > 0)
[ ] 🟡 CAMBIOS REQUERIDOS - Ver issues arriba
[ ] ✅ APROBADO PARA MERGE - Cumple TODOS los requisitos

**Justificación**: [Explicación de la decisión]

---
Validado por: @arquitecto
Fecha: [fecha]
```

**BLOCKER CRÍTICO**: Si el arquitecto NO aprueba, NO se puede hacer merge. TODOS los BLOCKERS deben resolverse.

---

### 9. ITERACIÓN (Si hay cambios requeridos)
**Responsable**: [agente original]
**Duración estimada**: Variable

- Implementar cambios solicitados por @arquitecto
- Implementar cambios solicitados por @designer-ux-ui
- Implementar cambios solicitados por @security-qa
- Re-submit para review de @arquitecto
- Repetir hasta aprobación de @arquitecto (validación final)

---

### 10. MERGE & DEPLOY
**Responsable**: coordinator
**Duración estimada**: 30min - 2hrs

#### Acciones:
```markdown
1. Validar que review está aprobado
2. Ejecutar migrations (si aplica):
   - Backup de DB
   - Ejecutar migración
   - Validar post-migración
3. Merge a main branch
4. Deploy automático a staging
5. Ejecutar smoke tests
6. Deploy a producción
7. Monitorear métricas iniciales
```

#### Checklist Pre-Merge:
- [ ] **Validación arquitectónica final aprobada (@arquitecto) - CRÍTICO**
- [ ] UX/UI review aprobado (@designer-ux-ui)
- [ ] Security review aprobado (@security-qa)
- [ ] Todos los tests pasando
- [ ] Migrations testeadas (si aplica)
- [ ] Documentación actualizada
- [ ] Zero BLOCKERS de @arquitecto

---

### 11. VALIDACIÓN FINAL Y DOCUMENTACIÓN
**Responsable**: coordinator
**Duración estimada**: 30min - 1hr

#### Acciones:
```markdown
1. Validar feature en producción:
   - Funcionalidad completa
   - No hay errores en logs
   - Performance aceptable
   - Multi-tenant isolation verificado

2. Actualizar documentación:
   - Plan-de-Trabajo.md → Marcar como ✅
   - Arquitectura.md (si hay cambios estructurales)
   - README (si es feature pública)

3. Notificar completitud al usuario

4. Post-mortem (opcional, para features grandes):
   - ¿Qué salió bien?
   - ¿Qué se puede mejorar?
   - Lecciones aprendidas
```

#### Entregable Final:
```markdown
## ✅ Feature Completada: [Feature Name]

### Implementación
- Pull Request: #[número]
- Deployed to Production: [fecha/hora]
- Deployment URL: [link si aplica]

### Componentes Implementados
- Frontend: [lista de componentes]
- Backend: [lista de API routes]
- Database: [tablas/migraciones]

### Testing
- Unit tests coverage: XX%
- Integration tests: XX pasando
- E2E tests: [si aplica]

### Performance
- Response time p95: XXms
- Bundle size impact: +XX kb

### Documentación Actualizada
- [x] Plan-de-Trabajo.md
- [x] Arquitectura.md
- [x] [otros documentos]

### Post-Deployment Validation
- [x] Feature funciona en producción
- [x] No hay errores en logs
- [x] Métricas de performance normales
- [x] Multi-tenant isolation verificado

---
Completed by: @coordinator
Date: [fecha]
```

---

## ✅ CRITERIOS DE ACEPTACIÓN GLOBAL

- [ ] Feature implementada completamente según requirements
- [ ] Multi-tenant isolation verificado en todos los niveles
- [ ] **Validación arquitectónica aprobada** (@arquitecto) - CRÍTICO
  - [ ] Plan de implementación aprobado
  - [ ] DB design aprobado (si aplica)
  - [ ] Backend code review aprobado
  - [ ] Frontend code review aprobado
  - [ ] Validación final aprobada
  - [ ] Zero BLOCKERS arquitectónicos
  - [ ] 100% criterios de aceptación HU cumplidos
  - [ ] Cumplimiento completo de /Context/Rules/
- [ ] **UX/UI review aprobado** (@designer-ux-ui)
  - [ ] Zero colores hardcodeados
  - [ ] Branding PODENZA correcto (#E7FF8C, #FF931E, #2C3E2B)
  - [ ] Todos los estados implementados (loading, error, empty, success)
  - [ ] Responsive design funcional
  - [ ] Template Figma validado (si existe)
- [ ] **Security review aprobado** (@security-qa) sin blockers
- [ ] Tests pasando con coverage > 70% en código crítico
- [ ] Performance aceptable (< 500ms p95)
- [ ] Documentación actualizada
- [ ] Deployed a producción exitosamente
- [ ] Monitoring configurado
- [ ] Usuario notificado

---

## 📊 MÉTRICAS DE ÉXITO

### Feature Completeness
- Todos los casos de uso funcionan: **100%**
- Edge cases manejados: **≥ 90%**

### Security
- Zero vulnerabilidades críticas: **100%**
- Multi-tenant isolation: **100%**

### Quality
- Test coverage código crítico: **> 70%**
- TypeScript errors: **0**

### Performance
- Response time p95: **< 500ms**
- Bundle size impact: **< 50kb**

### Process
- Tiempo desde inicio hasta producción: **< 2 semanas** (para features M/L)
- Ciclos de review: **≤ 2**

---

## 🏛️ INTEGRACIÓN DEL ARQUITECTO

**IMPORTANTE**: El agente `@arquitecto` tiene autoridad para BLOQUEAR implementaciones que violen:
- Reglas de arquitectura (/Context/Rules/Arquitectura.md)
- Reglas de seguridad (/Context/Rules/Seguridad-y-Reglas.md)
- Estándares de DB (/Context/Rules/Database-Migration-Scripts.md)
- Patrones de frontend (/Context/Rules/Frontend-Multi-Tenant-Implementation.md)
- Criterios de aceptación de HUs (/Context/HU/)

### Checkpoints Obligatorios del Arquitecto

1. **FASE 1.B**: Validación del plan ANTES de implementación
2. **FASE 2.B**: Validación de DB design ANTES de migración
3. **FASE 3.B**: Validación de backend code
4. **FASE 5.B**: Validación de frontend code
5. **FASE 8.B**: Validación FINAL antes de merge (CRÍTICO)

### Autoridad del Arquitecto

- ✅ Puede BLOQUEAR implementaciones con issues BLOCKER
- ✅ Puede SOLICITAR correcciones a cualquier agente
- ✅ Puede INVESTIGAR en internet/MCPs para validar best practices
- ✅ Puede PROPONER cambios en reglas (requiere aprobación del usuario)
- ❌ NO puede aprobar merge si hay BLOCKERS sin resolver
- ❌ NO puede aprobar merge si criterios de HU no se cumplen 100%

### Objetivo del Arquitecto

**Zero vulnerabilidades arquitectónicas en producción**
**100% cumplimiento de criterios de aceptación HU**
**100% cumplimiento de reglas definidas en /Context/Rules/**

---

**Versión**: 2.0
**Última actualización**: 2025-01-25
**Mantenido por**: PODENZA Development Team
**Cambios v2.0**: Integración del agente @arquitecto como guardian de arquitectura y calidad técnica
