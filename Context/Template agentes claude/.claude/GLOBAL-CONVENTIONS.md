# 🌐 CONVENCIONES GLOBALES - TODOS LOS AGENTES

## 👥 AGENT ALIASES - SHORTCUTS DE EQUIPO

### **@devteam** - Alias para Equipo de Desarrollo Completo

Cuando el usuario utiliza **@devteam**, se refiere al equipo completo de desarrollo técnico:

```markdown
@devteam incluye:
1. @fullstack-dev     → Desarrollo full-stack (frontend + backend)
2. @arquitecto        → Validación arquitectónica y cumplimiento de estándares
3. @db-integration    → Base de datos, migraciones y integraciones externas
4. @designer-ux-ui    → Diseño, UX/UI y validación visual
```

#### Uso de @devteam

Cuando el usuario dice:
- _"@devteam, implementen el módulo X"_
- _"@devteam, revisen esta PR"_
- _"@devteam, corrijan estos errores"_

**Interpretación**:
- La tarea requiere **desarrollo completo** por @fullstack-dev
- **Validación arquitectónica** por @arquitecto
- **Validación/cambios de BD** por @db-integration (si aplica)
- **Validación UX/UI** por @designer-ux-ui

**Workflow**:
1. @fullstack-dev implementa la feature
2. @db-integration valida/crea migraciones si toca BD
3. @arquitecto valida cumplimiento de estándares
4. @designer-ux-ui valida UX/UI y branding
5. Coordinación automática entre todos según necesidad

---

## 🔐 AUTHENTICATION INTEGRATION - PATRÓN CRÍTICO

### **REGLA CRÍTICA**: Supabase Auth ↔ public.users Integration

**IMPORTANTE**: El proyecto PODENZA usa Supabase Authentication como sistema de autenticación principal.

#### Patrón de Autenticación (OBLIGATORIO)

```markdown
✅ CORRECTO - Patrón Implementado:

1. **auth.users** (Supabase Auth - Gestión de credenciales)
   - Usuario se crea/autentica aquí
   - organization_id se guarda en app_metadata (SEGURO, solo backend)
   - app_metadata se incluye automáticamente en JWT
   - NO accesible desde frontend directamente

2. **public.users** (App Data - Información adicional)
   - Sincronizado automáticamente vía trigger
   - Contiene: name, email, avatar_url, etc.
   - Referencia: user_id = auth.users.id
   - organization_id copiado desde app_metadata

3. **Trigger de Sincronización**
   - Trigger: on_auth_user_created
   - Función: public.handle_new_auth_user()
   - Se ejecuta AFTER INSERT en auth.users
   - Crea entrada en public.users automáticamente

4. **Helper Function para RLS**
   - auth.organization_id() extrae tenant_id del JWT
   - RLS policies DEBEN usar auth.organization_id()
   - NO consultar public.users en policies (performance)

❌ INCORRECTO - NO HACER:

- ❌ Usar public.users para autenticación
- ❌ Hardcodear organization_id en código
- ❌ Consultar public.users en RLS policies
- ❌ Modificar auth.users directamente (usar Admin API)
- ❌ Guardar organization_id en user_metadata (inseguro)
```

#### Implementación en Código

**Frontend Hooks** (Todos los módulos):
```typescript
// ✅ CORRECTO
export function useOrganization(): string | null {
  const { data: user } = useUser();

  // Extraer organization_id de app_metadata del usuario autenticado
  return user?.app_metadata?.organization_id ?? null;
}

// ❌ INCORRECTO
export function useOrganization(): string | null {
  return '41cd4f73-26d9-4b31-a635-ccefaddd4872'; // Hardcoded
}
```

**RLS Policies** (Base de Datos):
```sql
-- ✅ CORRECTO: Usar helper function
CREATE POLICY "tenant_isolation" ON table_name
  FOR ALL
  USING (organization_id = auth.organization_id());

-- ❌ INCORRECTO: Consultar public.users
CREATE POLICY "tenant_isolation" ON table_name
  FOR ALL
  USING (
    organization_id = (
      SELECT organization_id FROM public.users WHERE id = auth.uid()
    )
  );
```

**Queries en Frontend**:
```typescript
// ✅ CORRECTO: Filtrar por organization_id
const { data } = await supabase
  .from('leads')
  .select('*')
  .eq('organization_id', organizationId); // RLS aplica automáticamente

// ❌ INCORRECTO: Sin filtro (confiar solo en RLS)
const { data } = await supabase
  .from('leads')
  .select('*'); // Falta filtro explícito
```

#### Criterios de Aceptación - TODOS LOS FEATURES

Cada feature DEBE cumplir estos criterios:

- [ ] **Auth Integration**: Usa auth.organization_id() en RLS policies
- [ ] **Hooks**: useOrganization() lee app_metadata, NO hardcoded
- [ ] **Queries**: Filtran explícitamente por organization_id
- [ ] **Multi-tenancy**: Datos aislados por organización
- [ ] **Security**: organization_id en app_metadata (no user_metadata)
- [ ] **Sync**: Trigger sincroniza auth.users → public.users
- [ ] **Testing**: Validar isolation entre organizaciones

#### Agentes que DEBEN Validar Auth Integration

```markdown
@business-analyst:
- Incluir criterios de auth en TODAS las HU
- Validar que features respetan multi-tenancy
- Verificar isolation en acceptance tests

@fullstack-dev:
- Implementar hooks con auth.organization_id()
- Queries SIEMPRE filtran por organization_id
- NO hardcodear organization_id

@db-integration:
- RLS policies usan auth.organization_id()
- Trigger de sincronización funcional
- Validar con MCP Supabase

@security-qa:
- Verificar tenant isolation
- Testing de multi-tenancy
- Security scan para leaks entre orgs

@testing-expert:
- Tests de isolation entre organizaciones
- Validar que RLS aplica correctamente
- Testing con múltiples users/orgs

@designer-ux-ui:
- UX no expone datos de otras orgs
- Error messages no revelan info sensible
```

#### Referencias

- Migración SQL: `/workspaces/Podenza/Context/Database/MIGRATION-auth-users-integration-2025-10-25.sql`
- Documentación: `/workspaces/Podenza/Context/.MD/REPORTE-auth-integration-2025-10-25.md`
- Quick Start: `/workspaces/Podenza/INTEGRACION-AUTH-QUICK-START.md`
- Supabase Docs: https://supabase.com/docs/guides/auth/managing-user-data

---

## 📁 ESTRUCTURA DE ARCHIVOS - REGLAS OBLIGATORIAS

### **CRÍTICO**: Ubicación de Archivos Generados

Todos los agentes DEBEN seguir esta estructura al generar archivos:

#### 1️⃣ Testing Files
**Ubicación**: `/workspaces/Podenza/Context/Testing/`

```markdown
✅ CORRECTO:
- /workspaces/Podenza/Context/Testing/test-results-accesos-2025-01-25.json
- /workspaces/Podenza/Context/Testing/security-scan-report-2025-01-25.json
- /workspaces/Podenza/Context/Testing/performance-metrics-leads.json
- /workspaces/Podenza/Context/Testing/e2e-results-playwright.json
- /workspaces/Podenza/Context/Testing/unit-coverage-report.json

❌ INCORRECTO:
- /workspaces/Podenza/test-results.json
- /workspaces/Podenza/apps/web/test-report.json
- Cualquier ubicación fuera de Context/Testing/
```

**Tipos de archivos de testing**:
- Resultados de tests (unit, integration, e2e)
- Reportes de seguridad (Semgrep SAST)
- Métricas de performance
- Coverage reports
- Test matrices y trazabilidad
- Browser logs capturados
- Supabase logs de pruebas
- Screenshots/videos de E2E tests

#### 2️⃣ Database Scripts
**Ubicación**: `/workspaces/Podenza/Context/Database/`

```markdown
✅ CORRECTO:
- /workspaces/Podenza/Context/Database/MIGRATION-add-organization-id.sql
- /workspaces/Podenza/Context/Database/SEED-accesos-users-roles.sql
- /workspaces/Podenza/Context/Database/FIX-audit-trigger-2025-01-25.sql
- /workspaces/Podenza/Context/Database/ROLLBACK-migration-001.sql
- /workspaces/Podenza/Context/Database/INDEXES-optimization-leads.sql

❌ INCORRECTO:
- /workspaces/Podenza/migration.sql
- /workspaces/Podenza/apps/web/seed.sql
- Cualquier ubicación fuera de Context/Database/
```

**Tipos de archivos de base de datos**:
- Migraciones (`.sql`)
- Seeds (`.sql`)
- Fixes y patches (`.sql`)
- Rollback scripts (`.sql`)
- Schema definitions (`.sql`)
- Validation scripts (`.js`, `.ts` para validación)
- Database analysis reports (`.json`)

#### 3️⃣ Markdown Reports y Documentación
**Ubicación**: `/workspaces/Podenza/Context/.MD/`

```markdown
✅ CORRECTO:
- /workspaces/Podenza/Context/.MD/REPORTE-testing-accesos-2025-01-25.md
- /workspaces/Podenza/Context/.MD/ANALISIS-performance-dashboard.md
- /workspaces/Podenza/Context/.MD/RESUMEN-sprint-1-completado.md
- /workspaces/Podenza/Context/.MD/DECISIONES-arquitectura-multi-tenant.md
- /workspaces/Podenza/Context/.MD/VALIDACION-business-analyst-HU-001.md

❌ INCORRECTO:
- /workspaces/Podenza/REPORTE.md
- /workspaces/Podenza/apps/web/ANALISIS.md
- Cualquier ubicación fuera de Context/.MD/
```

**Tipos de archivos Markdown**:
- Reportes de testing
- Análisis técnicos
- Resúmenes ejecutivos
- Decisiones arquitectónicas
- Validaciones de Business Analyst
- Reportes de cumplimiento de HU
- Logs de implementación
- Retrospectivas de sprint

### 📋 Convención de Nombres

```markdown
## Testing Files
[TIPO]-[MODULO]-[FECHA].json
Ejemplos:
- unit-test-accesos-2025-01-25.json
- security-scan-leads-2025-01-25.json
- e2e-results-dashboard-2025-01-25.json

## Database Scripts
[TIPO]-[DESCRIPCION]-[FECHA].sql
Ejemplos:
- MIGRATION-add-organization-id-2025-01-25.sql
- SEED-accesos-users-2025-01-25.sql
- FIX-rls-policies-2025-01-25.sql

## Markdown Reports
[TIPO]-[TEMA]-[FECHA].md
Ejemplos:
- REPORTE-testing-sprint1-2025-01-25.md
- ANALISIS-performance-2025-01-25.md
- RESUMEN-implementacion-accesos-2025-01-25.md
```

---

## 🔄 WORKFLOW DE ACTUALIZACIÓN DE PLAN DE TRABAJO

### **REGLA OBLIGATORIA**: Actualizar Plan-de-Trabajo.md

**CUÁNDO**: Al finalizar CUALQUIER implementación, fix, o milestone

**QUIÉN**: El agente que completó la tarea DEBE actualizar el plan

**CÓMO**:

```markdown
1. Leer `/workspaces/Podenza/Context/Rules/Plan-de-Trabajo.md`

2. Ubicar la tarea completada (ej: AUTH-001, SOL-005, etc.)

3. Actualizar el estado:
   - Cambiar `📋 PLANIFICADO` → `✅ COMPLETADO`
   - O `🔄 EN PROGRESO` → `✅ COMPLETADO`

4. Agregar detalles de implementación:
   - [ ] **TASK-ID**: Descripción
     - **Ubicación**: [archivos implementados]
     - **Estado**: ✅ COMPLETADO
     - **Fecha**: 2025-01-25
     - **Implementado por**: @[agente]
     - **Testeado por**: @testing-expert (si aplica)
     - **Validado por**: @business-analyst (si aplica)

5. Actualizar las métricas de progreso al final del documento

6. Commit del cambio con mensaje descriptivo
```

**EJEMPLO COMPLETO**:

```markdown
### Antes:
- [ ] **SOL-005**: Formularios de creación de solicitud
  - **Prioridad**: P1 🟡
  - **Estado**: 📋 PLANIFICADO
  - **Forms**: Datos básicos, información financiera, documentos

### Después:
- [x] **SOL-005**: Formularios de creación de solicitud
  - **Prioridad**: P1 🟡
  - **Estado**: ✅ COMPLETADO
  - **Fecha**: 2025-01-25
  - **Ubicación**:
    - `apps/web/lib/solicitudes/components/forms/basic-form.tsx`
    - `apps/web/lib/solicitudes/components/forms/financial-form.tsx`
    - `apps/web/lib/solicitudes/components/forms/documents-form.tsx`
  - **Implementado por**: @fullstack-dev
  - **Testeado por**: @testing-expert ✅ (100% tests passing)
  - **Validado por**: @business-analyst ✅ (Cumple HU-SOL criterios 1-5)
  - **Forms**: Datos básicos, información financiera, documentos
  - **Testing**:
    - Unit tests: 15/15 ✅
    - Integration: 8/8 ✅
    - E2E: 5/5 ✅
  - **Notas**: Implementa validaciones Zod, manejo de errores completo
```

---

## 🤝 EJECUCIÓN PARALELA Y COMUNICACIÓN ENTRE AGENTES

### **CAPACIDAD**: Agentes Concurrentes con Comunicación

Los agentes pueden y DEBEN ejecutarse en paralelo cuando:
- Las tareas son independientes
- Se pueden paralelizar sin conflictos
- Mejora la eficiencia del desarrollo

### Protocolo de Comunicación

```markdown
## 1. Ejecución Paralela Coordinada

El @coordinator puede lanzar múltiples agentes simultáneamente:

@fullstack-dev + @designer-ux-ui + @testing-expert

Ejemplo:
- @fullstack-dev: Implementa feature
- @designer-ux-ui: Valida UX en tiempo real
- @testing-expert: Escribe tests en paralelo
```

### Transferencia de Información entre Agentes

```markdown
## 2. Shared Context Files

Ubicación: `/workspaces/Podenza/Context/.SHARED/`

Los agentes pueden crear archivos compartidos para transferir información:

**Ejemplo**:
1. @fullstack-dev completa implementación
   → Guarda en `/Context/.SHARED/implementation-SOL-005.json`
   ```json
   {
     "task": "SOL-005",
     "status": "completed",
     "files": ["basic-form.tsx", "financial-form.tsx"],
     "testable": true,
     "ready_for_review": true,
     "business_criteria": [1, 2, 3, 4, 5]
   }
   ```

2. @testing-expert lee el archivo compartido
   → Ejecuta tests basados en la info
   → Actualiza el archivo con resultados
   ```json
   {
     ...previous content,
     "testing": {
       "status": "completed",
       "results": {
         "unit": "15/15 passing",
         "integration": "8/8 passing",
         "e2e": "5/5 passing"
       }
     }
   }
   ```

3. @business-analyst lee el archivo
   → Valida criterios de aceptación
   → Marca como aprobado
   ```json
   {
     ...previous content,
     "business_validation": {
       "status": "approved",
       "criteria_met": [1, 2, 3, 4, 5],
       "approved_by": "business-analyst",
       "date": "2025-01-25"
     }
   }
   ```
```

### Workflow de Ejecución Paralela

```markdown
## Workflow Típico:

┌─────────────────┐
│  @coordinator   │
│  Analiza task   │
└────────┬────────┘
         │
         ├─────────────────────────────────────┐
         │                                     │
         ▼                                     ▼
┌────────────────┐                    ┌──────────────┐
│ @fullstack-dev │ ──── context ────▶ │ @designer-   │
│ Implementa UI  │                    │  ux-ui       │
└────────┬───────┘                    │ Valida UX    │
         │                            └──────┬───────┘
         │                                   │
         ▼                                   ▼
    Guarda en                           Guarda feedback
    .SHARED/                            en .SHARED/
         │                                   │
         └───────────┬───────────────────────┘
                     │
                     ▼
            ┌────────────────┐
            │ @testing-expert│
            │ Lee .SHARED/   │
            │ Ejecuta tests  │
            └────────┬───────┘
                     │
                     ▼
            ┌────────────────────┐
            │ @business-analyst  │
            │ Lee .SHARED/       │
            │ Valida criterios   │
            └────────┬───────────┘
                     │
                     ▼
            ┌────────────────┐
            │  @coordinator  │
            │  Valida todo   │
            │  Marca ✅      │
            └────────────────┘
```

---

## 🌐 ACCESO A INTERNET Y MCPs - USO AUTOMÁTICO

### **CAPACIDAD**: Consulta Autónoma de Recursos Externos

**REGLA**: Todos los agentes DEBEN usar internet/MCPs automáticamente cuando:
- Necesitan contexto actualizado
- Requieren validar best practices
- Necesitan documentación oficial
- Requieren información técnica específica

### MCPs Disponibles (Uso Automático)

```markdown
## 1. MCP Supabase
**Cuándo usar**:
- Validar schemas actuales
- Ejecutar queries de diagnóstico
- Analizar performance de DB
- Verificar RLS policies

**Agentes que lo usan**:
- @db-integration (principal)
- @testing-expert (para integration tests)
- @coordinator (para validación)

## 2. MCP Playwright
**Cuándo usar**:
- E2E testing
- Browser automation
- Screenshot/video capture
- Performance profiling

**Agentes que lo usan**:
- @testing-expert (principal)

## 3. MCP Semgrep
**Cuándo usar**:
- SAST security scanning
- Code quality checks
- Vulnerability detection

**Agentes que lo usan**:
- @security-qa (principal)
- @testing-expert (security tests)

## 4. MCP Context7
**Cuándo usar**:
- Búsqueda de contexto en codebase
- Análisis de dependencias
- Code navigation

**Agentes que lo usan**:
- Todos (cuando necesitan contexto)

## 5. MCP Figma
**Cuándo usar**:
- Validar diseños
- Extraer specs de UI
- Verificar componentes

**Agentes que lo usan**:
- @designer-ux-ui (principal)
- @fullstack-dev (para implementación)
```

### WebSearch - Uso Automático

```markdown
**CUÁNDO USAR WebSearch (automáticamente)**:

✅ SÍ usar:
- Documentación oficial de librerías/frameworks
- Best practices actualizadas
- Solución de errores específicos
- Comparación de tecnologías
- Changelog de versiones

❌ NO usar:
- Información ya disponible en el proyecto
- Contexto que se puede obtener del codebase
- Cuando MCP Supabase tiene la info

**EJEMPLOS**:

1. @fullstack-dev necesita implementar autenticación OAuth
   → WebSearch: "Next.js 15 Supabase OAuth best practices 2025"

2. @testing-expert encuentra error desconocido
   → WebSearch: "[texto del error] Playwright solution 2025"

3. @db-integration necesita optimizar query
   → WebSearch: "PostgreSQL query optimization best practices 2025"

4. @designer-ux-ui valida accesibilidad
   → WebSearch: "WCAG 2.2 contrast ratio requirements 2025"
```

### WebFetch - Documentación Oficial

```markdown
**CUÁNDO USAR WebFetch (automáticamente)**:

Para leer documentación oficial directamente:

✅ Ejemplos:
- WebFetch: "https://nextjs.org/docs/app/building-your-application/routing"
- WebFetch: "https://supabase.com/docs/guides/database/postgres/row-level-security"
- WebFetch: "https://playwright.dev/docs/api/class-page"

**Agentes deben usar WebFetch ANTES de implementar**:
- Para validar API correcta
- Para obtener ejemplos oficiales
- Para verificar breaking changes
```

---

## 📊 MÉTRICAS Y REPORTES - TODOS LOS AGENTES

### Métricas Obligatorias al Completar Tarea

Cada agente DEBE incluir en su reporte:

```markdown
## Template de Reporte de Completitud

**Task ID**: [ID de la tarea]
**Agente**: @[nombre-agente]
**Fecha**: [fecha]
**Duración**: [tiempo estimado]

### Archivos Generados
- Código: [lista de archivos]
- Tests: [archivos en Context/Testing/]
- DB Scripts: [archivos en Context/Database/] (si aplica)
- Reportes: [archivos en Context/.MD/]

### Métricas
- Líneas de código: [número]
- Tests creados: [número]
- Coverage: [%]
- Performance: [métricas relevantes]

### Validaciones
- [ ] Tests passing: [X/Y]
- [ ] Security scan: [resultados]
- [ ] Business validation: [status]
- [ ] UX/UI validation: [status]

### Plan-de-Trabajo.md
- [x] Actualizado con estado ✅

### Siguiente Paso
[Qué agente debe tomar el siguiente paso o si está completo]

---
Guardado en: /workspaces/Podenza/Context/.MD/REPORTE-[task-id]-[fecha].md
```

---

## ✅ CHECKLIST GLOBAL - TODOS LOS AGENTES

Antes de marcar cualquier tarea como ✅:

- [ ] Código implementado y funcional
- [ ] Tests escritos y pasando
- [ ] Archivos guardados en ubicaciones correctas:
  - [ ] Testing → `/Context/Testing/`
  - [ ] DB Scripts → `/Context/Database/`
  - [ ] Reportes → `/Context/.MD/`
- [ ] Plan-de-Trabajo.md actualizado
- [ ] Reporte de completitud generado
- [ ] Comunicado a siguiente agente (si aplica)
- [ ] Archivos compartidos actualizados en `.SHARED/` (si aplica)
- [ ] Contexto externo consultado (internet/MCP) si fue necesario

---

**Versión**: 2.0
**Última actualización**: 2025-01-25
**Aplica a**: TODOS los agentes de PODENZA

**RECORDATORIO CRÍTICO**: Estas convenciones NO son opcionales. Todos los agentes DEBEN seguirlas estrictamente para mantener la organización y calidad del proyecto.
