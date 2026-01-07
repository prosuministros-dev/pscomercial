# Sistema de Agentes Claude - PS Comercial

## Descripción General

Este directorio contiene la configuración de agentes Claude especializados para el desarrollo del sistema PS Comercial, un software de gestión comercial que incluye:

- Gestión de Leads
- Cotizaciones
- Validación de Crédito
- Aprobaciones
- Proformas
- Seguimiento Comercial
- Reportes y Dashboards
- Roles y Permisos
- Integración con WhatsApp Bot

## Estructura de Carpetas

```
.claude/
├── README.md                    # Este archivo
├── GLOBAL-CONVENTIONS.md        # Convenciones globales obligatorias
├── SUPABASE-MIGRATION-RULES.md  # Reglas de migraciones de BD
├── MCP-SUPABASE-SETUP.md        # Configuración de MCP Supabase
├── settings.local.json          # Configuración local de Claude Code
├── agents/                      # Agentes especializados
│   ├── coordinator.md           # Coordinador general
│   ├── arquitecto.md            # Guardián de arquitectura
│   ├── fullstack-dev.md         # Desarrollador full-stack
│   ├── db-integration.md        # Ingeniero de BD e integraciones
│   ├── business-analyst.md      # Analista de negocio
│   ├── designer-ux-ui.md        # Diseñador UX/UI
│   ├── security-qa.md           # Seguridad y QA
│   ├── testing-expert.md        # Experto en testing
│   └── ai-automation.md         # Automatización con IA
├── workflows/                   # Flujos de trabajo
│   └── feature-implementation.md # Workflow de implementación
├── shared/                      # Configuraciones compartidas
│   └── tech-stack.md            # Stack tecnológico
└── commands/                    # Comandos personalizados
    └── (pendiente)
```

## Datos del Proyecto

### Supabase - Producción
- **Project ID**: `zsauumglbhindsplazpk`
- **URL**: `https://zsauumglbhindsplazpk.supabase.co`
- **Publishable Key**: `sb_publishable_g4Zfm_uc8TuykpxWdaFCmw_MMY2geKT`

### Supabase - Desarrollo
- **Project ID**: `hxqzzncubasczoiyqvka`
- **URL**: `https://hxqzzncubasczoiyqvka.supabase.co`
- **Publishable Key**: `sb_publishable_OEzon6CXPoBUwuI6uGL7hg_hMoGg9Ou`
- **Service Role**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cXp6bmN1YmFzY3pvaXlxdmthIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjAwOTU1NCwiZXhwIjoyMDgxNTg1NTU0fQ.cijZKuD4FgTQqr9xwwABBGFZ_i-wW-NVtpFGyaid7Eo`

### Repositorio Local
- **Path**: `c:\Users\freddyrs\Documents\TDX Proyectos\PS\pscomercial`
- **Framework**: Next.js 15 (MakerKit SaaS Starter Kit Lite)
- **Monorepo**: Turbo con pnpm

## Historias de Usuario (HUs)

El proyecto incluye las siguientes HUs documentadas en `/Context/HU/md/`:

| HU | Descripción |
|----|-------------|
| HU-0001 | Registro de Leads |
| HU-0002 | Asignación de Leads |
| HU-0003 | Validación y Creación de Cotización |
| HU-0004 | Validación de Cupo de Crédito y Bloqueo por Cartera |
| HU-0005 | Aprobación de Cotización por Margen Mínimo |
| HU-0006 | Generación de Proforma y Envío de Cotización |
| HU-0009 | Seguimiento y Alertas Automáticas de Cotizaciones |
| HU-0010 | Reportes y Tablero de Control Comercial |
| HU-0011 | Creación y Gestión de Roles y Permisos |
| HU-0012 | Integración del Bot de WhatsApp |

## Cómo Usar los Agentes

### Invocar un Agente
```markdown
@coordinator "Necesito implementar el módulo de leads según HU-0001"
@fullstack-dev "Crear componente de listado de leads"
@db-integration "Crear tabla de leads con RLS"
```

### Flujo Típico
1. `@coordinator` recibe la solicitud y planifica
2. `@business-analyst` valida requisitos contra HU
3. `@arquitecto` define arquitectura y patrones
4. `@db-integration` crea migraciones de BD
5. `@fullstack-dev` implementa frontend y backend
6. `@designer-ux-ui` valida UX/UI
7. `@security-qa` valida seguridad
8. `@testing-expert` ejecuta tests
9. `@coordinator` valida y coordina merge

## Documentación de Contexto

Los agentes deben consultar y actualizar:

- `/Context/HU/md/` - Historias de Usuario
- `/Context/.MD/` - Documentación generada
- `/Context/Testing/` - Reportes de testing
- `/Context/Database/` - Documentación de BD
- `/Context/.SHARED/` - Archivos compartidos entre agentes

## Convenciones Críticas

1. **Multi-tenancy**: TODAS las tablas deben tener `organization_id`
2. **RLS**: OBLIGATORIO en todas las tablas
3. **Migraciones**: SIEMPRE crear migración antes de modificar BD
4. **TypeScript**: Strict mode habilitado
5. **Validación**: Usar Zod para validación de datos

---

**Versión**: 1.0
**Fecha de creación**: 2025-01-XX
**Proyecto**: PS Comercial
**Equipo**: TDX Proyectos
