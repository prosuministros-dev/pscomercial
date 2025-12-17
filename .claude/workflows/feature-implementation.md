# WORKFLOW: IMPLEMENTACIÓN DE FEATURES - PS COMERCIAL

> **IMPORTANTE**: Este workflow define el proceso estándar para implementar cualquier feature.
> TODOS los agentes DEBEN seguir este proceso para garantizar calidad y consistencia.

## FASES DEL WORKFLOW

```
┌─────────────────────────────────────────────────────────────────┐
│  FASE 1: ANÁLISIS Y PLANIFICACIÓN                               │
│  Agentes: @coordinator, @business-analyst, @arquitecto          │
│  Entregables: Plan de trabajo, análisis de HU, diseño           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  FASE 2: DISEÑO DE BASE DE DATOS                                │
│  Agentes: @db-integration, @arquitecto                          │
│  Entregables: Migraciones, RLS policies                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  FASE 3: IMPLEMENTACIÓN                                         │
│  Agentes: @fullstack-dev, @designer-ux-ui                       │
│  Entregables: Código frontend y backend                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  FASE 4: VALIDACIÓN Y TESTING                                   │
│  Agentes: @testing-expert, @security-qa, @business-analyst      │
│  Entregables: Tests, auditoría de seguridad, validación UAT     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  FASE 5: CIERRE Y DOCUMENTACIÓN                                 │
│  Agentes: @coordinator, @arquitecto                             │
│  Entregables: Documentación, merge, actualización de plan       │
└─────────────────────────────────────────────────────────────────┘
```

---

## FASE 1: ANÁLISIS Y PLANIFICACIÓN

### Responsable Principal: @coordinator

### Entrada
- HU asignada para implementación
- Contexto de negocio

### Actividades

#### 1.1 Lectura de HU (@coordinator)
```markdown
CHECKLIST:
- [ ] Leer HU completa en /Context/HU/md/
- [ ] Identificar módulo y dependencias
- [ ] Verificar prioridad y timeline
```

#### 1.2 Análisis de Requisitos (@business-analyst)
```markdown
CHECKLIST:
- [ ] Desglosar criterios de aceptación
- [ ] Identificar flujos de usuario
- [ ] Detectar ambigüedades
- [ ] Crear casos de prueba preliminares
- [ ] Documentar reglas de negocio

ENTREGABLE: /Context/.MD/ANALISIS-HU-XXXX-[fecha].md
```

#### 1.3 Diseño de Arquitectura (@arquitecto)
```markdown
CHECKLIST:
- [ ] Definir estructura de carpetas
- [ ] Identificar componentes necesarios
- [ ] Definir patrones a usar
- [ ] Revisar impacto en arquitectura existente
- [ ] Crear ADR si hay decisiones importantes

ENTREGABLE: Sección en Plan-de-Trabajo.md
```

#### 1.4 Planificación (@coordinator)
```markdown
CHECKLIST:
- [ ] Crear tareas en Plan-de-Trabajo.md
- [ ] Asignar tareas a agentes
- [ ] Definir secuencia de ejecución
- [ ] Identificar blockers potenciales
```

### Salida de Fase 1
- Plan de trabajo actualizado
- Análisis de HU documentado
- Arquitectura definida
- Tareas asignadas

### Validación Gate
```markdown
ANTES DE PASAR A FASE 2:
- [ ] @business-analyst aprobó análisis de requisitos
- [ ] @arquitecto aprobó diseño de arquitectura
- [ ] @coordinator confirmó plan de trabajo
```

---

## FASE 2: DISEÑO DE BASE DE DATOS

### Responsable Principal: @db-integration

### Entrada
- Análisis de HU aprobado
- Arquitectura definida

### Actividades

#### 2.1 Diseño de Schema (@db-integration)
```markdown
CHECKLIST:
- [ ] Identificar tablas necesarias
- [ ] Definir campos y tipos
- [ ] Establecer relaciones (FKs)
- [ ] Incluir organization_id (multi-tenant)
- [ ] Diseñar índices
```

#### 2.2 Creación de Migraciones (@db-integration)
```markdown
CHECKLIST:
- [ ] Crear archivo de migración
- [ ] Nomenclatura: YYYYMMDDHHMMSS_descripcion.sql
- [ ] SQL idempotente (IF NOT EXISTS)
- [ ] Comentarios explicativos
- [ ] Validar sintaxis

ENTREGABLE: /supabase/migrations/[timestamp]_[descripcion].sql
```

#### 2.3 Implementación de RLS (@db-integration)
```markdown
CHECKLIST:
- [ ] ENABLE ROW LEVEL SECURITY
- [ ] FORCE ROW LEVEL SECURITY
- [ ] Policy SELECT (organization_id)
- [ ] Policy INSERT (organization_id)
- [ ] Policy UPDATE (organization_id)
- [ ] Policy DELETE (organization_id)
```

#### 2.4 Ejecución de Migración (@db-integration)
```markdown
CHECKLIST:
- [ ] Usar mcp__supabase__apply_migration
- [ ] Verificar ejecución exitosa
- [ ] Validar tablas creadas
- [ ] Verificar RLS habilitado
- [ ] Verificar policies aplicadas
```

### Salida de Fase 2
- Migraciones ejecutadas
- RLS configurado
- Documentación de BD actualizada

### Validación Gate
```markdown
ANTES DE PASAR A FASE 3:
- [ ] Migración ejecutada sin errores
- [ ] RLS verificado
- [ ] @arquitecto aprobó diseño de BD
- [ ] @security-qa validó policies de seguridad
```

---

## FASE 3: IMPLEMENTACIÓN

### Responsable Principal: @fullstack-dev

### Entrada
- Base de datos configurada
- Arquitectura aprobada

### Actividades

#### 3.1 Estructura de Archivos (@fullstack-dev)
```markdown
CHECKLIST:
- [ ] Crear carpeta del módulo: lib/[modulo]/
- [ ] Crear subcarpetas: components/, hooks/, lib/, schema/
- [ ] Crear archivos base según patrón
```

#### 3.2 Schemas y Tipos (@fullstack-dev)
```markdown
CHECKLIST:
- [ ] Crear schemas Zod en schema/[modulo].schema.ts
- [ ] Definir tipos TypeScript
- [ ] Validaciones de campos
- [ ] Export de tipos

ENTREGABLE: lib/[modulo]/schema/[modulo].schema.ts
```

#### 3.3 Queries y Mutations (@fullstack-dev)
```markdown
CHECKLIST:
- [ ] Crear queries en lib/queries.ts
- [ ] Crear mutations en lib/mutations.ts
- [ ] Incluir organization_id en todas las queries
- [ ] Error handling completo
- [ ] Optimizar queries (joins, no N+1)

ENTREGABLES:
- lib/[modulo]/lib/queries.ts
- lib/[modulo]/lib/mutations.ts
```

#### 3.4 Componentes React (@fullstack-dev)
```markdown
CHECKLIST:
- [ ] Componente de lista: [modulo]-list.tsx
- [ ] Componente de formulario: [modulo]-form.tsx
- [ ] Componente de detalle: [modulo]-detail.tsx
- [ ] Estados: loading, error, success, empty
- [ ] Responsive design
- [ ] Usar componentes de @kit/ui

ENTREGABLES:
- lib/[modulo]/components/[modulo]-list.tsx
- lib/[modulo]/components/[modulo]-form.tsx
```

#### 3.5 Custom Hooks (@fullstack-dev)
```markdown
CHECKLIST:
- [ ] Hook principal: use-[modulo].ts
- [ ] Hook de lista: use-[modulo]-list.ts
- [ ] Integración con React Query
- [ ] Manejo de cache

ENTREGABLE: lib/[modulo]/hooks/
```

#### 3.6 Páginas Next.js (@fullstack-dev)
```markdown
CHECKLIST:
- [ ] Crear rutas en app/home/[account]/[modulo]/
- [ ] page.tsx (Server Component)
- [ ] layout.tsx si necesario
- [ ] Integrar componentes

ENTREGABLE: app/home/[account]/[modulo]/page.tsx
```

#### 3.7 Validación de UI (@designer-ux-ui)
```markdown
CHECKLIST:
- [ ] Validar estados de UI
- [ ] Verificar responsive
- [ ] Validar consistencia visual
- [ ] Verificar accesibilidad básica
```

### Salida de Fase 3
- Código implementado
- UI validada
- Integración completa

### Validación Gate
```markdown
ANTES DE PASAR A FASE 4:
- [ ] TypeScript compila sin errores
- [ ] ESLint sin warnings críticos
- [ ] @designer-ux-ui aprobó UI
- [ ] @arquitecto revisó estructura de código
```

---

## FASE 4: VALIDACIÓN Y TESTING

### Responsable Principal: @testing-expert

### Entrada
- Código implementado
- UI validada

### Actividades

#### 4.1 Unit Tests (@testing-expert)
```markdown
CHECKLIST:
- [ ] Tests de schemas Zod
- [ ] Tests de funciones utility
- [ ] Tests de validaciones
- [ ] Coverage > 80% en lógica crítica

ENTREGABLE: lib/[modulo]/**/*.test.ts
```

#### 4.2 Integration Tests (@testing-expert)
```markdown
CHECKLIST:
- [ ] Tests de queries
- [ ] Tests de mutations
- [ ] Tests de flujos completos
- [ ] Tests de multi-tenancy

ENTREGABLE: lib/[modulo]/integration.test.ts
```

#### 4.3 E2E Tests (@testing-expert)
```markdown
CHECKLIST:
- [ ] Tests con MCP Playwright
- [ ] Flujos de usuario completos
- [ ] Validación de criterios de aceptación
- [ ] Captura de evidencias

ENTREGABLES:
- e2e/[modulo].spec.ts
- /Context/Testing/[modulo]/
```

#### 4.4 Security Audit (@security-qa)
```markdown
CHECKLIST:
- [ ] Validar RLS policies
- [ ] Verificar multi-tenancy
- [ ] Revisar código por OWASP Top 10
- [ ] Validar manejo de inputs
- [ ] Verificar no exposición de datos

ENTREGABLE: /Context/.MD/SECURITY-audit-[modulo]-[fecha].md
```

#### 4.5 UAT Validation (@business-analyst)
```markdown
CHECKLIST:
- [ ] Ejecutar casos de prueba
- [ ] Validar criterios de aceptación
- [ ] Verificar flujos de negocio
- [ ] Documentar evidencias

ENTREGABLE: /Context/.MD/VALIDACION-HU-XXXX-[fecha].md
```

### Salida de Fase 4
- Tests pasando
- Auditoría de seguridad aprobada
- UAT validado

### Validación Gate
```markdown
ANTES DE PASAR A FASE 5:
- [ ] Todos los tests críticos pasan
- [ ] @security-qa aprobó auditoría
- [ ] @business-analyst validó UAT
- [ ] Sin bugs P0 o P1 abiertos
```

---

## FASE 5: CIERRE Y DOCUMENTACIÓN

### Responsable Principal: @coordinator

### Entrada
- Todas las validaciones aprobadas
- Tests pasando

### Actividades

#### 5.1 Revisión Final (@arquitecto)
```markdown
CHECKLIST:
- [ ] Código cumple convenciones
- [ ] Arquitectura respetada
- [ ] Documentación completa
- [ ] Sin deuda técnica significativa
```

#### 5.2 Actualización de Documentación (@coordinator)
```markdown
CHECKLIST:
- [ ] Actualizar Plan-de-Trabajo.md
- [ ] Documentar decisiones tomadas
- [ ] Actualizar README si necesario
- [ ] Documentar APIs/endpoints nuevos
```

#### 5.3 Commit y Merge (@coordinator)
```markdown
CHECKLIST:
- [ ] Commit con mensaje descriptivo
- [ ] Referencia a HU en commit
- [ ] Push a rama dev
- [ ] Crear PR si aplica
```

#### 5.4 Cierre de HU (@coordinator)
```markdown
CHECKLIST:
- [ ] Marcar HU como completada
- [ ] Notificar stakeholders
- [ ] Actualizar tracking de proyecto
```

### Salida de Fase 5
- Feature mergeado
- Documentación actualizada
- HU cerrada

---

## CHECKPOINTS DE VALIDACIÓN

### Checkpoint 1: Post-Análisis
```markdown
CRITERIOS:
- ✅ Análisis de HU completo
- ✅ Arquitectura definida
- ✅ Plan de trabajo actualizado
- ✅ No hay blockers identificados

VALIDADORES: @coordinator, @arquitecto, @business-analyst
```

### Checkpoint 2: Post-Base de Datos
```markdown
CRITERIOS:
- ✅ Migraciones ejecutadas
- ✅ RLS configurado
- ✅ Seguridad validada

VALIDADORES: @db-integration, @arquitecto, @security-qa
```

### Checkpoint 3: Post-Implementación
```markdown
CRITERIOS:
- ✅ Código compila sin errores
- ✅ UI validada
- ✅ Integración funcional

VALIDADORES: @fullstack-dev, @designer-ux-ui, @arquitecto
```

### Checkpoint 4: Post-Testing
```markdown
CRITERIOS:
- ✅ Tests pasan 100%
- ✅ Sin vulnerabilidades
- ✅ UAT aprobado

VALIDADORES: @testing-expert, @security-qa, @business-analyst
```

### Checkpoint 5: Cierre
```markdown
CRITERIOS:
- ✅ Feature completo
- ✅ Documentación actualizada
- ✅ Merge exitoso

VALIDADORES: @coordinator, @arquitecto
```

---

## MANEJO DE BLOCKERS

### Si Surge un Blocker

```markdown
1. IDENTIFICAR
   - Descripción clara del blocker
   - Fase donde ocurre
   - Impacto en timeline

2. ESCALAR
   - Notificar a @coordinator inmediatamente
   - Documentar en Plan-de-Trabajo.md
   - Proponer soluciones alternativas

3. RESOLVER
   - @coordinator asigna resolución
   - Ejecutar solución
   - Validar que blocker está resuelto

4. DOCUMENTAR
   - Registrar causa y solución
   - Actualizar proceso si es recurrente
```

### Tipos de Blockers Comunes

| Tipo | Responsable | Acción |
|------|-------------|--------|
| Ambigüedad en HU | @business-analyst | Clarificar con stakeholder |
| Conflicto arquitectónico | @arquitecto | Revisar y decidir |
| Error de migración | @db-integration | Corregir y re-ejecutar |
| Bug crítico | @fullstack-dev | Fix inmediato |
| Falla de seguridad | @security-qa | Bloquear y remediar |

---

## MÉTRICAS DEL WORKFLOW

### Por Feature
- Tiempo total de implementación
- Número de iteraciones de corrección
- Bugs encontrados en testing
- Bugs encontrados post-merge

### Por Fase
- Tiempo en cada fase
- Blockers por fase
- Rechazos en gates

### Calidad
- Cobertura de tests
- Issues de seguridad
- Deuda técnica introducida

---

**Versión**: 1.0
**Proyecto**: PS Comercial
