# Tareas Pendientes HU-002: Asignación de Leads

## Estado Actual

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Base de Datos | 100% | Tablas, triggers, funciones completadas |
| Backend (Actions/Hooks) | 100% | Server actions y hooks implementados |
| Frontend (UI) | 40% | Falta completar componentes |

---

## Migraciones Creadas

1. `20241220000008_notificaciones.sql` - Sistema de notificaciones
2. `20241220000009_permisos_asignacion.sql` - Permisos de reasignación

---

## Módulos Creados

### Notificaciones (`lib/notificaciones/`)
- [x] `schemas/notificacion.schema.ts`
- [x] `queries/notificaciones.api.ts`
- [x] `actions/notificaciones.actions.ts`
- [x] `hooks/use-notificaciones.ts`
- [x] `index.ts`

### Asesores (`lib/asesores/`)
- [x] `schemas/asesor.schema.ts`
- [x] `queries/asesores.api.ts`
- [x] `actions/asesores.actions.ts`
- [x] `hooks/use-asesores.ts`
- [x] `index.ts`

---

## Tareas Pendientes de UI

### 1. Componente de Notificaciones (Campanita)

**Ubicación sugerida:** `apps/web/components/notificaciones/`

| Componente | Descripción | Prioridad |
|------------|-------------|-----------|
| `notification-bell.tsx` | Icono de campanita con badge de conteo | Alta |
| `notification-dropdown.tsx` | Dropdown con lista de notificaciones | Alta |
| `notification-item.tsx` | Item individual de notificación | Alta |
| `notification-filters.tsx` | Filtros: pendientes/vistas | Media |

**Hooks a usar:**
```typescript
import {
  useNotificaciones,
  useNotificacionesCount,
  useMarcarNotificacionLeida,
  useMarcarTodasLeidas
} from '@/lib/notificaciones';
```

---

### 2. Panel de Gestión de Asesores

**Ubicación sugerida:** `apps/web/app/home/configuracion/asesores/`

| Componente | Descripción | Prioridad |
|------------|-------------|-----------|
| `page.tsx` | Página principal de configuración | Alta |
| `asesores-table.tsx` | Tabla de asesores con acciones | Alta |
| `asesor-form-modal.tsx` | Modal para agregar/editar asesor | Alta |
| `asesor-stats-card.tsx` | Tarjeta con estadísticas del asesor | Media |

**Hooks a usar:**
```typescript
import {
  useAsesores,
  useCreateAsesorConfig,
  useUpdateAsesorConfig,
  useToggleAsesorActivo,
  useEstadisticasAsesores
} from '@/lib/asesores';
```

---

### 3. Vista de Bitácora de Asignaciones

**Ubicación sugerida:** `apps/web/app/home/leads/_components/`

| Componente | Descripción | Prioridad |
|------------|-------------|-----------|
| `lead-asignaciones-tab.tsx` | Tab en detalle de lead con historial | Media |
| `asignacion-timeline.tsx` | Timeline visual de asignaciones | Media |

**Hook existente:**
```typescript
import { useLeadAsignaciones } from '@/lib/leads';
```

---

### 4. Modal de Reasignación de Lead

**Ubicación sugerida:** `apps/web/app/home/leads/_components/`

| Componente | Descripción | Prioridad |
|------------|-------------|-----------|
| `reasignar-lead-modal.tsx` | Modal para reasignar lead a otro asesor | Alta |

**Validación de permisos:**
- Solo usuarios con rol `GERENCIA_GENERAL` o `GERENCIA_COMERCIAL`
- Usar RPC `puede_reasignar_lead(usuario_id)` para validar

---

### 5. Mejoras al Detalle de Lead

**Archivo:** `apps/web/app/home/leads/_components/ver-lead-modal.tsx`

| Mejora | Descripción | Prioridad |
|--------|-------------|-----------|
| Tab de historial | Agregar tab con `useLeadAsignaciones` | Media |
| Botón reasignar | Botón que abre `reasignar-lead-modal` | Alta |
| Badge de asesor | Mostrar asesor asignado con avatar | Baja |

---

## Estructura de Carpetas Sugerida

```
apps/web/
├── components/
│   └── notificaciones/
│       ├── notification-bell.tsx
│       ├── notification-dropdown.tsx
│       ├── notification-item.tsx
│       └── notification-filters.tsx
│
├── app/home/
│   ├── configuracion/
│   │   └── asesores/
│   │       ├── page.tsx
│   │       └── _components/
│   │           ├── asesores-table.tsx
│   │           ├── asesor-form-modal.tsx
│   │           └── asesor-stats-card.tsx
│   │
│   └── leads/
│       └── _components/
│           ├── lead-asignaciones-tab.tsx
│           ├── asignacion-timeline.tsx
│           └── reasignar-lead-modal.tsx
```

---

## Orden de Implementación Recomendado

1. **Campanita de notificaciones** - Visible en toda la app
2. **Modal de reasignación** - Funcionalidad crítica
3. **Panel de asesores** - Configuración administrativa
4. **Historial de asignaciones** - Mejora de UX
5. **Mejoras al detalle de lead** - Polish final

---

## Criterios de Aceptación Pendientes por UI

| # | Criterio | Componente Requerido |
|---|----------|---------------------|
| 3 | Toda asignación debe registrarse en bitácora | `lead-asignaciones-tab.tsx` |
| 4 | Notificar al asesor mediante panel | `notification-bell.tsx` |
| 2 | Reasignación solo para admins | `reasignar-lead-modal.tsx` con validación |

---

## Notas Técnicas

### Realtime para Notificaciones
Para notificaciones en tiempo real, considerar usar Supabase Realtime:

```typescript
// En notification-bell.tsx
const supabase = useSupabase();

useEffect(() => {
  const channel = supabase
    .channel('notificaciones')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notificaciones',
      filter: `usuario_id=eq.${userId}`,
    }, (payload) => {
      // Refrescar conteo
      queryClient.invalidateQueries({ queryKey: notificacionesKeys.count() });
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [userId]);
```

### Validación de Permisos en Frontend
```typescript
// Hook para verificar permisos
const { data: puedeReasignar } = useQuery({
  queryKey: ['permisos', 'reasignar'],
  queryFn: () => supabase.rpc('puede_reasignar_lead', { p_usuario_id: userId }),
});
```
