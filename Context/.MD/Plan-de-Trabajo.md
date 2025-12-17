# Plan de Trabajo - PS Comercial

## Estado Actual

- **Fecha**: 2025-01-XX
- **Fase**: Implementación UI Template
- **Branch Activo**: `dev`

## Resumen del Proyecto

PS Comercial es un sistema de gestión comercial que incluye:
- Gestión de Leads
- Cotizaciones y Proformas
- Validación de Crédito
- Aprobaciones
- Seguimiento Comercial
- Reportes y Dashboards
- Integración con WhatsApp

### Stack Tecnológico
- Next.js 15 (MakerKit SaaS Starter Kit Lite)
- Supabase (PostgreSQL + Auth)
- TypeScript + Tailwind CSS + Shadcn/UI

### Supabase
- **Project ID**: `zsauumglbhindsplazpk`
- **URL**: `https://zsauumglbhindsplazpk.supabase.co`

---

## HUs del Proyecto

| HU | Título | Prioridad | Estado | Progreso |
|----|--------|-----------|--------|----------|
| HU-0001 | Registro de Leads | Alta | Pendiente | 0% |
| HU-0002 | Asignación de Leads | Alta | Pendiente | 0% |
| HU-0003 | Validación y Creación de Cotización | Alta | Pendiente | 0% |
| HU-0004 | Validación de Cupo de Crédito | Media | Pendiente | 0% |
| HU-0005 | Aprobación por Margen Mínimo | Media | Pendiente | 0% |
| HU-0006 | Generación de Proforma | Media | Pendiente | 0% |
| HU-0009 | Seguimiento y Alertas | Media | Pendiente | 0% |
| HU-0010 | Reportes y Dashboard | Baja | Pendiente | 0% |
| HU-0011 | Roles y Permisos | Alta | Pendiente | 0% |
| HU-0012 | Bot de WhatsApp | Baja | Pendiente | 0% |

---

## Tareas Activas

### En Progreso
| Tarea | HU | Agente | Estado | Notas |
|-------|----|----|--------|-------|
| Implementación UI Template Fase 1 y 2 | - | @devteam | Completado | Colores, Layout, Nav |

### Pendientes (Priorizadas)
1. **Crear páginas placeholder para módulos** - Dashboard, Leads, Cotizaciones, etc.
2. **Implementar sistema de notificaciones** - NotificationsPanel
3. **Crear componentes Kanban** - KanbanBoard, KanbanColumn, KanbanCard
4. **Diseñar modelo de datos** - Tablas para HU-0001 a HU-0003
5. **Implementar módulo de Leads** - HU-0001, HU-0002

### Completadas (Esta Sesión)
- [x] Clonar MakerKit SaaS Starter Kit Lite
- [x] Configurar credenciales de Supabase
- [x] Inicializar aplicación localmente
- [x] Sincronizar branches (main, dev, uat)
- [x] Extraer HUs de Word a Markdown
- [x] Crear agentes de Claude para PS Comercial
- [x] **Analizar template UI Prosuministros CRM**
- [x] **Crear plan de implementación UI**
- [x] **FASE 1: Sistema de colores** (Primary #00C8CF, Navy #161052)
- [x] **FASE 1: Gradientes y glass morphism**
- [x] **FASE 1: Border radius 12px**
- [x] **FASE 2: Cambio layout a navegación superior**
- [x] **FASE 2: Componente TopNavigation**
- [x] **FASE 2: Configurar rutas PS Comercial**
- [x] **FASE 2: Navegación móvil con Sheet**

---

## Próximos Pasos

### Inmediatos (Esta Sesión)
1. [x] Implementar FASE 1 del template UI
2. [x] Implementar FASE 2 del template UI (navegación superior)
3. [ ] Crear páginas placeholder para módulos

### Corto Plazo (Próximas Sesiones)
1. [ ] Implementar NotificationsPanel
2. [ ] Crear componente KanbanBoard genérico
3. [ ] Crear migraciones para tabla `leads`
4. [ ] Implementar CRUD de Leads
5. [ ] Configurar RLS policies

### Mediano Plazo
1. [ ] Completar módulo de Leads (HU-0001, HU-0002)
2. [ ] Iniciar módulo de Cotizaciones (HU-0003)
3. [ ] Configurar sistema de roles (HU-0011)

---

## Blockers

> Ningún blocker activo actualmente.

---

## Decisiones Arquitectónicas

### ADR-001: Uso de MakerKit como Base
**Estado**: Aceptado
**Fecha**: 2025-01-XX

**Contexto**: Necesitamos una base sólida para el proyecto SaaS.

**Decisión**: Usar MakerKit SaaS Starter Kit Lite como base del proyecto.

**Consecuencias**:
- (+) Autenticación y multi-tenancy ya implementados
- (+) Estructura de proyecto establecida
- (+) Componentes UI listos (Shadcn)
- (-) Debemos adaptarnos a sus patrones

### ADR-002: Multi-Tenancy por Organization
**Estado**: Aceptado
**Fecha**: 2025-01-XX

**Contexto**: Múltiples empresas usarán el sistema.

**Decisión**: Todas las tablas tendrán `organization_id` con RLS.

**Consecuencias**:
- (+) Aislamiento de datos garantizado
- (+) Escalable a múltiples clientes
- (-) Todas las queries deben filtrar por org

### ADR-003: Navegación Superior (Header) como Default
**Estado**: Aceptado
**Fecha**: 2025-01-XX

**Contexto**: El template del cliente (Prosuministros CRM) usa navegación horizontal superior, no sidebar.

**Decisión**: Configurar MakerKit para usar `style: 'header'` por defecto en lugar de sidebar.

**Consecuencias**:
- (+) Consistente con el diseño del cliente
- (+) Más espacio horizontal para contenido
- (+) Mejor experiencia en móviles
- (-) Menos espacio vertical para navegación (resuelto con submódulos en dropdown)

### ADR-004: Paleta de Colores Prosuministros
**Estado**: Aceptado
**Fecha**: 2025-01-XX

**Contexto**: El cliente tiene identidad visual definida.

**Decisión**: Usar paleta Primary Cyan (#00C8CF) + Navy (#161052) con gradientes.

**Colores principales**:
- Primary: `#00C8CF` (Cyan corporativo)
- Accent: `#161052` (Navy oscuro)
- Destructive: `#ff3b30`
- Gradient Brand: `linear-gradient(135deg, #00C8CF 0%, #161052 100%)`

**Consecuencias**:
- (+) Identidad visual del cliente respetada
- (+) Dark mode soportado con ajustes
- (+) Colores de estado de negocio definidos (leads, cotizaciones)

---

## Archivos Modificados (Sesión Actual)

### FASE 1: Sistema de Colores
- `apps/web/styles/shadcn-ui.css` - Paleta completa light/dark
- `apps/web/styles/theme.css` - Gradientes, glass morphism, utilidades

### FASE 2: Layout y Navegación
- `apps/web/config/paths.config.ts` - Rutas de módulos PS Comercial
- `apps/web/config/navigation.config.tsx` - Items de navegación
- `apps/web/app/home/layout.tsx` - Layout con header por defecto
- `apps/web/app/home/_components/top-navigation.tsx` - **NUEVO** Navegación superior
- `apps/web/app/home/_components/home-menu-navigation.tsx` - Wrapper para TopNavigation
- `apps/web/app/home/_components/home-mobile-navigation.tsx` - Menú móvil con Sheet
- `packages/ui/src/makerkit/page.tsx` - Glass morphism en header

---

## Notas de Sesión

### Sesión Actual
- Proyecto inicializado con MakerKit
- Supabase configurado
- Agentes de Claude creados y adaptados para PS Comercial
- Documentación de HUs extraída y disponible
- **Template UI analizado en profundidad**
- **Plan de implementación creado**: `/Context/.MD/PLAN-IMPLEMENTACION-UI-TEMPLATE.md`
- **FASE 1 completada**: Sistema de colores, gradientes, glass morphism
- **FASE 2 completada**: Navegación superior, rutas, móvil

---

## Enlaces Útiles

- **HUs**: `/Context/HU/md/`
- **Agentes**: `/.claude/agents/`
- **Workflows**: `/.claude/workflows/`
- **Plan UI**: `/Context/.MD/PLAN-IMPLEMENTACION-UI-TEMPLATE.md`
- **Supabase Dashboard**: https://supabase.com/dashboard/project/zsauumglbhindsplazpk

---

**Última actualización**: 2025-01-XX
**Actualizado por**: @devteam
