# Checklist de Progreso - Módulo Leads

> **Última actualización**: 2025-12-17
> **HUs**: HU-0001 + HU-0002

---

## Fase 1: Base de Datos

- [ ] Crear archivo migración SQL
- [ ] Definir ENUMs (lead_estado, lead_canal, lead_tipo_asignacion)
- [ ] Crear secuencia lead_numero_seq (inicio #100)
- [ ] Crear tabla asesores_comerciales
- [ ] Crear tabla leads
- [ ] Crear tabla lead_observaciones
- [ ] Crear tabla lead_asignaciones_log
- [ ] Crear índices
- [ ] Crear funciones DB
  - [ ] contar_leads_pendientes_asesor()
  - [ ] obtener_asesor_disponible()
  - [ ] asignar_lead_automatico()
  - [ ] lead_supera_24h()
- [ ] Crear triggers
- [ ] Crear políticas RLS
- [ ] Ejecutar migración
- [ ] Regenerar tipos TypeScript

---

## Fase 2: Server Actions

- [ ] Crear estructura carpetas `apps/web/lib/leads/`
- [ ] Crear schemas Zod
  - [ ] CreateLeadSchema
  - [ ] UpdateLeadSchema
  - [ ] AssignLeadSchema
  - [ ] RejectLeadSchema
- [ ] Crear actions
  - [ ] createLead
  - [ ] updateLead
  - [ ] assignLead
  - [ ] reassignLead
  - [ ] convertLead
  - [ ] rejectLead
  - [ ] addObservation
- [ ] Crear queries
  - [ ] getLeads
  - [ ] getLeadById
  - [ ] getLeadStats
  - [ ] checkDuplicateLead

---

## Fase 3: Hooks React Query

- [ ] useLeads()
- [ ] useLead(id)
- [ ] useLeadStats()
- [ ] useCreateLead()
- [ ] useUpdateLead()
- [ ] useAssignLead()
- [ ] useConvertLead()
- [ ] useRejectLead()
- [ ] useAddObservation()

---

## Fase 4: Actualizar UI

### 4.1 leads-view.tsx
- [ ] Reemplazar mock data
- [ ] Actualizar estados
- [ ] Conectar filtros
- [ ] Implementar paginación

### 4.2 leads-kanban.tsx
- [ ] Conectar datos reales
- [ ] Implementar drag & drop real
- [ ] Actualizar columnas

### 4.3 crear-lead-modal.tsx
- [ ] Conectar con useCreateLead()
- [ ] Agregar validaciones
- [ ] Verificación duplicados
- [ ] Mostrar número generado

### 4.4 ver-lead-modal.tsx
- [ ] Conectar con useLead(id)
- [ ] Sección observaciones
- [ ] Funcionalidad menciones
- [ ] Bitácora asignaciones
- [ ] Acciones (Convertir, Rechazar, Reasignar)

### 4.5 Nuevos componentes
- [ ] asignar-lead-modal.tsx
- [ ] rechazar-lead-modal.tsx

---

## Fase 5: Notificaciones

- [ ] Crear tabla notificaciones
- [ ] Trigger: notificar asignación
- [ ] Trigger: alerta 24h
- [ ] Conectar NotificacionesPanel

---

## Fase 6: Permisos

- [ ] Crear/actualizar tabla roles
- [ ] Crear tabla user_roles
- [ ] Actualizar políticas RLS
- [ ] Hook useUserPermissions()
- [ ] Aplicar permisos en UI

---

## Fase 7: Testing

- [ ] Tests unitarios schemas
- [ ] Tests server actions
- [ ] Tests queries
- [ ] Tests E2E crear lead
- [ ] Tests E2E asignación
- [ ] Tests E2E convertir
- [ ] Tests E2E rechazar

---

## Criterios de Aceptación HU-0001

- [ ] Número consecutivo desde #100
- [ ] Fecha automática editable
- [ ] Validación email y teléfono
- [ ] Detección duplicados (NIT, email)
- [ ] Estado inicial PENDIENTE_ASIGNACION
- [ ] Creación manual solo Gerencia
- [ ] Vista Kanban funcional
- [ ] Observaciones con menciones

---

## Criterios de Aceptación HU-0002

- [ ] Asignación automática balanceada
- [ ] Máx 5 leads por asesor
- [ ] Reasignación manual por admin
- [ ] Bitácora de asignaciones
- [ ] Notificación al asesor
- [ ] Estado ASIGNADO tras asignación
- [ ] Asesor inactivo → leads al pool

---

## Notas de Progreso

| Fecha | Tarea | Estado | Notas |
|-------|-------|--------|-------|
| 2025-12-17 | Plan creado | ✅ | Documentación inicial |
| | | | |
| | | | |

---

**Marcar con ✅ cuando complete cada tarea**
