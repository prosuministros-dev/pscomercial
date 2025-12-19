# Plan de Acción - Módulo de Leads (HU-0001 y HU-0002)

> **Fecha de creación**: 2025-12-17
> **Historias de Usuario**: HU-0001 (Registro de Leads) + HU-0002 (Asignación de Leads)
> **Estado actual**: UI con mock data, sin conexión a base de datos

---

## Resumen Ejecutivo

El módulo de Leads requiere implementación completa del backend (Supabase) y conexión con el frontend existente. Actualmente existe UI funcional con datos mock que debe conectarse a datos reales.

### Estado Actual del Código

| Componente | Estado | Ubicación |
|------------|--------|-----------|
| Página de Leads | UI lista (mock) | `apps/web/app/home/leads/page.tsx` |
| Vista principal | UI lista (mock) | `apps/web/app/home/leads/_components/leads-view.tsx` |
| Vista Kanban | UI lista (mock) | `apps/web/app/home/leads/_components/leads-kanban.tsx` |
| Modal crear lead | UI lista (mock) | `apps/web/app/home/leads/_components/crear-lead-modal.tsx` |
| Modal ver lead | UI lista (mock) | `apps/web/app/home/leads/_components/ver-lead-modal.tsx` |
| Mock data | Datos estáticos | `apps/web/lib/mock-data.ts` |
| Migración DB | Solo cuentas base | `apps/web/supabase/migrations/20241219010757_schema.sql` |

### Diferencias Estados UI vs HU

| UI Actual | HU Definido | Acción |
|-----------|-------------|--------|
| `pendiente` | `PENDIENTE_ASIGNACION` | Renombrar |
| `en_gestion` | `ASIGNADO` | Renombrar |
| `convertido` | `CONVERTIDO` | OK |
| `descartado` | `RECHAZADO` | Renombrar |
| - | `PENDIENTE_INFORMACION` | Agregar |

---

## Fase 1: Base de Datos (Supabase)

### 1.1 Crear migración para tablas de Leads

**Archivo**: `apps/web/supabase/migrations/[timestamp]_leads_schema.sql`

```sql
-- Tablas requeridas:
-- 1. leads (tabla principal)
-- 2. lead_observaciones (comentarios/historial)
-- 3. lead_asignaciones_log (bitácora de asignaciones)
-- 4. asesores_comerciales (configuración de asesores activos)
```

**Campos tabla `leads`** (según HU-0001):

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| id | UUID | Sí | PK autogenerado |
| numero | SERIAL | Sí | Consecutivo desde #100 |
| fecha_creacion | TIMESTAMPTZ | Sí | Automática, editable |
| razon_social | VARCHAR(255) | Sí | Nombre empresa |
| nit | VARCHAR(20) | Sí | Único en BD |
| nombre_contacto | VARCHAR(255) | Sí | Contacto principal |
| celular_contacto | VARCHAR(20) | Sí | Formato 10 dígitos |
| email_contacto | VARCHAR(320) | Sí | Validación regex |
| requerimiento | TEXT | Sí | Motivo/intención |
| canal_origen | ENUM | Sí | WhatsApp/Web/Manual |
| estado | ENUM | Sí | Ver estados abajo |
| motivo_rechazo | TEXT | No | Si estado=RECHAZADO |
| asesor_asignado_id | UUID | No | FK a asesores |
| asignado_en | TIMESTAMPTZ | No | Fecha asignación |
| asignado_por | UUID | No | Quién asignó |
| creado_por | UUID | Sí | Usuario creador |
| creado_en | TIMESTAMPTZ | Sí | Timestamp creación |
| convertido_en | TIMESTAMPTZ | No | Si estado=CONVERTIDO |
| cotizacion_id | UUID | No | FK cotización generada |

**Estados ENUM** (según HU y Excel Referencias):

```sql
CREATE TYPE lead_estado AS ENUM (
  'PENDIENTE_ASIGNACION',
  'PENDIENTE_INFORMACION',
  'ASIGNADO',
  'CONVERTIDO',
  'RECHAZADO'
);

CREATE TYPE lead_canal AS ENUM (
  'WHATSAPP',
  'WEB',
  'MANUAL'
);
```

### 1.2 Crear tabla de observaciones

```sql
CREATE TABLE lead_observaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES auth.users(id),
  texto TEXT NOT NULL,
  menciones UUID[] DEFAULT '{}',
  creado_en TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.3 Crear tabla bitácora de asignaciones

```sql
CREATE TABLE lead_asignaciones_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  asesor_anterior_id UUID,
  asesor_nuevo_id UUID,
  tipo_asignacion VARCHAR(20), -- 'AUTOMATICA' | 'MANUAL' | 'REASIGNACION'
  asignado_por UUID REFERENCES auth.users(id),
  asignado_en TIMESTAMPTZ DEFAULT NOW(),
  motivo TEXT
);
```

### 1.4 Crear tabla de asesores comerciales

```sql
CREATE TABLE asesores_comerciales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) UNIQUE,
  activo BOOLEAN DEFAULT true,
  max_leads_pendientes INTEGER DEFAULT 5,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  modificado_en TIMESTAMPTZ
);
```

### 1.5 Políticas RLS

- Leads visibles según rol del usuario
- Solo Gerencia puede ver todos los leads
- Asesores solo ven sus leads asignados
- Solo usuarios autorizados pueden crear leads manualmente

### 1.6 Funciones de Base de Datos

```sql
-- Función: Obtener siguiente número de lead
CREATE FUNCTION get_next_lead_number() RETURNS INTEGER;

-- Función: Asignación automática balanceada
CREATE FUNCTION asignar_lead_automatico(lead_id UUID) RETURNS UUID;

-- Función: Verificar límite de leads por asesor (máx 5)
CREATE FUNCTION verificar_limite_leads_asesor(asesor_id UUID) RETURNS BOOLEAN;

-- Función: Calcular alerta 24h
CREATE FUNCTION check_lead_alerta_24h(lead_id UUID) RETURNS BOOLEAN;
```

### Tareas Fase 1:

- [ ] 1.1.1 Crear archivo de migración SQL
- [ ] 1.1.2 Definir ENUMs (estado, canal)
- [ ] 1.1.3 Crear tabla `leads`
- [ ] 1.1.4 Crear tabla `lead_observaciones`
- [ ] 1.1.5 Crear tabla `lead_asignaciones_log`
- [ ] 1.1.6 Crear tabla `asesores_comerciales`
- [ ] 1.1.7 Crear índices (nit, email, estado, asesor_asignado_id)
- [ ] 1.1.8 Crear constraints (UNIQUE nit, validaciones)
- [ ] 1.1.9 Crear políticas RLS
- [ ] 1.1.10 Crear funciones DB (consecutivo, asignación automática)
- [ ] 1.1.11 Crear triggers (actualizar timestamps, asignación automática)
- [ ] 1.1.12 Ejecutar migración: `pnpm supabase:web:reset`
- [ ] 1.1.13 Regenerar tipos: `pnpm supabase:web:typegen`

---

## Fase 2: API y Server Actions

### 2.1 Crear esquemas de validación (Zod)

**Archivo**: `apps/web/lib/leads/schemas/lead.schema.ts`

```typescript
// Schemas para:
// - CreateLeadSchema
// - UpdateLeadSchema
// - AssignLeadSchema
// - RejectLeadSchema
// - ConvertLeadSchema
```

### 2.2 Crear Server Actions

**Directorio**: `apps/web/lib/leads/actions/`

| Acción | Archivo | Descripción |
|--------|---------|-------------|
| createLead | `create-lead.action.ts` | Crear lead (manual) |
| updateLead | `update-lead.action.ts` | Actualizar datos lead |
| assignLead | `assign-lead.action.ts` | Asignar a asesor |
| reassignLead | `reassign-lead.action.ts` | Reasignar lead |
| convertLead | `convert-lead.action.ts` | Convertir a cotización |
| rejectLead | `reject-lead.action.ts` | Rechazar/descartar lead |
| addObservation | `add-observation.action.ts` | Agregar observación |

### 2.3 Crear Queries

**Directorio**: `apps/web/lib/leads/queries/`

| Query | Archivo | Descripción |
|-------|---------|-------------|
| getLeads | `get-leads.query.ts` | Listar leads con filtros |
| getLeadById | `get-lead-by-id.query.ts` | Obtener lead por ID |
| getLeadStats | `get-lead-stats.query.ts` | Estadísticas para dashboard |
| getLeadsByAsesor | `get-leads-by-asesor.query.ts` | Leads por asesor |
| checkDuplicateLead | `check-duplicate.query.ts` | Verificar duplicados |

### Tareas Fase 2:

- [ ] 2.1.1 Crear estructura de carpetas `apps/web/lib/leads/`
- [ ] 2.1.2 Crear schemas Zod
- [ ] 2.2.1 Crear action: createLead
- [ ] 2.2.2 Crear action: updateLead
- [ ] 2.2.3 Crear action: assignLead
- [ ] 2.2.4 Crear action: reassignLead
- [ ] 2.2.5 Crear action: convertLead
- [ ] 2.2.6 Crear action: rejectLead
- [ ] 2.2.7 Crear action: addObservation
- [ ] 2.3.1 Crear query: getLeads
- [ ] 2.3.2 Crear query: getLeadById
- [ ] 2.3.3 Crear query: getLeadStats
- [ ] 2.3.4 Crear query: getLeadsByAsesor
- [ ] 2.3.5 Crear query: checkDuplicateLead

---

## Fase 3: Hooks y Estado del Cliente

### 3.1 Crear React Query hooks

**Directorio**: `apps/web/lib/leads/hooks/`

```typescript
// useLeads() - Lista de leads con filtros
// useLead(id) - Lead individual
// useLeadStats() - Estadísticas
// useCreateLead() - Mutación crear
// useUpdateLead() - Mutación actualizar
// useAssignLead() - Mutación asignar
// useConvertLead() - Mutación convertir
// useRejectLead() - Mutación rechazar
```

### Tareas Fase 3:

- [ ] 3.1.1 Crear hook: useLeads
- [ ] 3.1.2 Crear hook: useLead
- [ ] 3.1.3 Crear hook: useLeadStats
- [ ] 3.1.4 Crear hook: useCreateLead
- [ ] 3.1.5 Crear hook: useUpdateLead
- [ ] 3.1.6 Crear hook: useAssignLead
- [ ] 3.1.7 Crear hook: useConvertLead
- [ ] 3.1.8 Crear hook: useRejectLead
- [ ] 3.1.9 Crear hook: useAddObservation

---

## Fase 4: Actualizar Componentes UI

### 4.1 Actualizar leads-view.tsx

- [ ] 4.1.1 Reemplazar mock data por useLeads()
- [ ] 4.1.2 Actualizar estados a los nuevos ENUMs
- [ ] 4.1.3 Conectar filtros con query params
- [ ] 4.1.4 Implementar paginación

### 4.2 Actualizar leads-kanban.tsx

- [ ] 4.2.1 Conectar con datos reales
- [ ] 4.2.2 Implementar drag & drop con mutaciones
- [ ] 4.2.3 Actualizar columnas según estados HU

### 4.3 Actualizar crear-lead-modal.tsx

- [ ] 4.3.1 Conectar con useCreateLead()
- [ ] 4.3.2 Agregar validaciones del schema
- [ ] 4.3.3 Agregar verificación de duplicados (NIT, email)
- [ ] 4.3.4 Mostrar número de lead generado

### 4.4 Actualizar ver-lead-modal.tsx

- [ ] 4.4.1 Conectar con useLead(id)
- [ ] 4.4.2 Agregar sección de observaciones
- [ ] 4.4.3 Agregar funcionalidad de menciones (@usuario)
- [ ] 4.4.4 Agregar bitácora de asignaciones
- [ ] 4.4.5 Agregar acciones: Convertir, Rechazar, Reasignar

### 4.5 Crear componente de asignación

**Archivo**: `apps/web/app/home/leads/_components/asignar-lead-modal.tsx`

- [ ] 4.5.1 Crear modal de asignación/reasignación
- [ ] 4.5.2 Mostrar asesores disponibles y su carga
- [ ] 4.5.3 Validar límite de 5 leads pendientes

### 4.6 Crear componente de rechazo

**Archivo**: `apps/web/app/home/leads/_components/rechazar-lead-modal.tsx`

- [ ] 4.6.1 Crear modal de rechazo
- [ ] 4.6.2 Campo obligatorio de motivo de rechazo

---

## Fase 5: Notificaciones y Alertas

### 5.1 Sistema de notificaciones

- [ ] 5.1.1 Crear tabla `notificaciones` en Supabase
- [ ] 5.1.2 Trigger: Notificar al asesor cuando se asigna lead
- [ ] 5.1.3 Trigger: Notificar alerta 24h sin gestión
- [ ] 5.1.4 Conectar con componente NotificacionesPanel existente

### 5.2 Alertas visuales

- [ ] 5.2.1 Indicador de alerta 24h en cards
- [ ] 5.2.2 Badge de leads pendientes en menú
- [ ] 5.2.3 Contador en campanita de notificaciones

---

## Fase 6: Permisos y Roles

### 6.1 Implementar control de acceso

Según Excel Referencias - MATRIZ-ACCESOS-POR-ROLES:

| Acción | Gerencia General | Gerencia Comercial | Comerciales |
|--------|-----------------|-------------------|-------------|
| Ver leads | ✅ Todos | ✅ Todos | Solo asignados |
| Crear lead manual | ✅ | ✅ | ❌ |
| Editar lead | ✅ | ✅ | Solo asignados |
| Asignar lead | ✅ | ✅ | ❌ |
| Reasignar lead | ✅ | ✅ | ❌ |
| Convertir lead | ✅ | ✅ | ✅ (propios) |
| Rechazar lead | ✅ | ✅ | ✅ (propios) |

### Tareas Fase 6:

- [ ] 6.1.1 Crear tabla `roles` si no existe
- [ ] 6.1.2 Crear tabla `user_roles`
- [ ] 6.1.3 Actualizar políticas RLS según matriz
- [ ] 6.1.4 Crear hook useUserPermissions()
- [ ] 6.1.5 Aplicar permisos en UI (ocultar/mostrar botones)

---

## Fase 7: Testing

### 7.1 Tests unitarios

- [ ] 7.1.1 Tests de schemas Zod
- [ ] 7.1.2 Tests de funciones de utilidad

### 7.2 Tests de integración

- [ ] 7.2.1 Tests de server actions
- [ ] 7.2.2 Tests de queries

### 7.3 Tests E2E (Playwright)

- [ ] 7.3.1 Test: Crear lead manual
- [ ] 7.3.2 Test: Asignación automática
- [ ] 7.3.3 Test: Reasignación manual
- [ ] 7.3.4 Test: Convertir lead a cotización
- [ ] 7.3.5 Test: Rechazar lead
- [ ] 7.3.6 Test: Verificar duplicados

---

## Criterios de Aceptación (HU-0001)

- [ ] Sistema genera número consecutivo desde #100
- [ ] Fecha de creación automática pero editable
- [ ] Validación de formato de email y teléfono
- [ ] Detección de duplicados por NIT y correo
- [ ] Estado inicial: PENDIENTE_ASIGNACION
- [ ] Creación manual solo por Gerencia
- [ ] Vista Kanban funcional
- [ ] Campo de observaciones con menciones @usuario

## Criterios de Aceptación (HU-0002)

- [ ] Asignación automática balanceada
- [ ] Máximo 5 leads pendientes por asesor
- [ ] Reasignación manual por administradores
- [ ] Bitácora de asignaciones (fecha, hora, usuario)
- [ ] Notificación al asesor asignado
- [ ] Estado cambia a ASIGNADO tras asignación
- [ ] Si asesor se desactiva, sus leads van al pool general

---

## Orden de Ejecución Recomendado

```
SEMANA 1:
├── Fase 1: Base de Datos (completa)
└── Fase 2: Server Actions (basics)

SEMANA 2:
├── Fase 3: Hooks React Query
├── Fase 4.1-4.4: Actualizar UI existente
└── Fase 4.5-4.6: Nuevos componentes

SEMANA 3:
├── Fase 5: Notificaciones
├── Fase 6: Permisos
└── Fase 7: Testing
```

---

## Archivos a Crear/Modificar

### Nuevos archivos:

```
apps/web/
├── supabase/migrations/
│   └── [timestamp]_leads_schema.sql
├── lib/leads/
│   ├── schemas/
│   │   └── lead.schema.ts
│   ├── actions/
│   │   ├── create-lead.action.ts
│   │   ├── update-lead.action.ts
│   │   ├── assign-lead.action.ts
│   │   ├── reassign-lead.action.ts
│   │   ├── convert-lead.action.ts
│   │   ├── reject-lead.action.ts
│   │   └── add-observation.action.ts
│   ├── queries/
│   │   ├── get-leads.query.ts
│   │   ├── get-lead-by-id.query.ts
│   │   ├── get-lead-stats.query.ts
│   │   └── check-duplicate.query.ts
│   └── hooks/
│       ├── use-leads.ts
│       ├── use-lead.ts
│       ├── use-lead-mutations.ts
│       └── use-lead-stats.ts
└── app/home/leads/_components/
    ├── asignar-lead-modal.tsx
    └── rechazar-lead-modal.tsx
```

### Archivos a modificar:

```
apps/web/
├── lib/mock-data.ts (eliminar datos de leads después)
├── lib/database.types.ts (regenerar con typegen)
└── app/home/leads/_components/
    ├── leads-view.tsx
    ├── leads-kanban.tsx
    ├── crear-lead-modal.tsx
    └── ver-lead-modal.tsx
```

---

## Dependencias Externas

| Dependencia | Uso | Estado |
|-------------|-----|--------|
| Supabase | Base de datos | Configurado |
| React Query | Estado servidor | Configurado |
| Zod | Validación | Configurado |
| Sonner | Toasts | Configurado |
| Lucide React | Iconos | Configurado |

---

## Notas Importantes

1. **Numeración**: Los leads inician en #100, las cotizaciones en #30.000
2. **Duplicados**: Validar por NIT y email antes de crear
3. **Asignación**: Máximo 5 leads pendientes por asesor
4. **Tiempo**: Lead debe convertirse en máximo 1 día (alerta 24h)
5. **Chatbot**: La integración con WhatsApp está fuera del alcance inicial (HU-0001)
6. **Jerarquía**: Un cliente (razón social) puede tener múltiples contactos

---

**Documento generado por**: Claude
**Fecha**: 2025-12-17
**Versión**: 1.0
