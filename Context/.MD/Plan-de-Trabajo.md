# Plan de Trabajo - PS Comercial

## Estado Actual

- **Fecha**: 2025-01-XX
- **Fase**: Configuración Inicial
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
| Configuración inicial del proyecto | - | @coordinator | Completado | MakerKit clonado |
| Configuración de agentes Claude | - | @coordinator | Completado | Agentes adaptados |

### Pendientes (Priorizadas)
1. **Revisar estructura de MakerKit** - Entender arquitectura base
2. **Diseñar modelo de datos** - Tablas para HU-0001 a HU-0003
3. **Implementar módulo de Leads** - HU-0001, HU-0002
4. **Implementar módulo de Cotizaciones** - HU-0003
5. **Configurar roles base** - HU-0011

### Completadas (Esta Sesión)
- [x] Clonar MakerKit SaaS Starter Kit Lite
- [x] Configurar credenciales de Supabase
- [x] Inicializar aplicación localmente
- [x] Sincronizar branches (main, dev, uat)
- [x] Extraer HUs de Word a Markdown
- [x] Crear agentes de Claude para PS Comercial

---

## Próximos Pasos

### Inmediatos (Esta Sesión)
1. [ ] Revisar estructura de MakerKit y entender patrones
2. [ ] Planificar modelo de datos para módulo de Leads

### Corto Plazo (Próximas Sesiones)
1. [ ] Crear migraciones para tabla `leads`
2. [ ] Implementar CRUD de Leads
3. [ ] Configurar RLS policies
4. [ ] Implementar UI de lista de Leads

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

---

## Notas de Sesión

### Sesión Actual
- Proyecto inicializado con MakerKit
- Supabase configurado
- Agentes de Claude creados y adaptados para PS Comercial
- Documentación de HUs extraída y disponible

---

## Enlaces Útiles

- **HUs**: `/Context/HU/md/`
- **Agentes**: `/.claude/agents/`
- **Workflows**: `/.claude/workflows/`
- **Supabase Dashboard**: https://supabase.com/dashboard/project/zsauumglbhindsplazpk

---

**Última actualización**: 2025-01-XX
**Actualizado por**: @coordinator
