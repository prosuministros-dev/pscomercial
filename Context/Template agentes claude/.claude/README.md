# 🤖 EQUIPO DE AGENTES PODENZA - Guía de Uso

Bienvenido al sistema de agentes especializados para el desarrollo de PODENZA. Este equipo de 5 agentes trabajará contigo para construir la plataforma con la máxima calidad y eficiencia.

---

## 👥 CONOCE A TU EQUIPO

### 1. **coordinator** 🎯
**El Orquestador**
- Coordina todo el equipo
- Prioriza tareas según el Plan de Trabajo
- Asigna trabajo a agentes especializados
- Valida completitud de implementaciones

**Cuándo usarlo**: Para planificar features grandes, consultar estado del proyecto, o cuando no sepas a quién asignar una tarea.

---

### 2. **fullstack-dev** 👨‍💻
**El Constructor**
- Implementa UI con React/Next.js
- Crea API routes y lógica de negocio
- Integra frontend con backend
- Aplica el branding PODENZA

**Cuándo usarlo**: Para implementar componentes, formularios, páginas nuevas, o features completas de frontend/backend.

---

### 3. **db-integration** 🗄️
**El Arquitecto de Datos**
- Diseña schemas multi-tenant
- Crea migraciones de BD seguras
- Optimiza queries para +1000 TPS
- Implementa integraciones externas (APIs bancarias, AUCO, WhatsApp)

**Cuándo usarlo**: Para crear tablas, migraciones, optimizar performance de BD, o integrar servicios externos.

---

### 4. **ai-automation** 🤖
**El Innovador**
- Análisis de documentos con OCR/IA
- Motor de decisiones crediticias
- Automatiza workflows de negocio
- Implementa las 8 etapas del proceso

**Cuándo usarlo**: Para análisis automático de documentos, scoring crediticio, automatizaciones inteligentes, o predicciones.

---

### 5. **security-qa** 🛡️
**El Guardián**
- Audita seguridad multi-tenant
- Revisa código antes de merge
- Ejecuta tests y valida calidad
- Asegura que todo cumpla estándares

**Cuándo usarlo**: Para code reviews, validación de seguridad, testing, o antes de hacer merge a main.

---

## 🚀 INICIO RÁPIDO

### Comando Básico
```
@coordinator "Quiero implementar [feature]"
```

El coordinator analizará tu request y coordinará con el equipo necesario.

### Ejemplos Prácticos

#### 1. Nueva Feature Completa
```
@coordinator "Necesito implementar un sistema de notificaciones in-app"
```
**Resultado**: Coordinator analiza, asigna a fullstack-dev + db-integration + security-qa, y coordina la implementación completa.

---

#### 2. Solo Frontend
```
@fullstack-dev "Crear un componente de filtros avanzados para la lista de solicitudes"
```
**Resultado**: fullstack-dev implementa el componente siguiendo el branding PODENZA.

---

#### 3. Base de Datos
```
@db-integration "Agregar tabla de notifications con RLS policies y particionado"
```
**Resultado**: db-integration crea la migración completa con índices optimizados y RLS.

---

#### 4. Integración Externa
```
@db-integration "Implementar integración con API de Bancolombia según External-Integrations.md"
```
**Resultado**: db-integration crea el cliente de API con retry logic, webhooks, y audit logging.

---

#### 5. IA y Automatización
```
@ai-automation "Implementar OCR para extraer datos automáticamente de cédulas"
```
**Resultado**: ai-automation implementa análisis de documentos con confidence threshold y fallback humano.

---

#### 6. Code Review
```
@security-qa "Review de PR #45 antes de merge - verificar multi-tenant isolation"
```
**Resultado**: security-qa ejecuta security checklist completo y provee feedback detallado.

---

#### 7. Consulta de Estado
```
@coordinator "¿Cuál es el estado de las tareas P1 pendientes?"
```
**Resultado**: Coordinator consulta Plan-de-Trabajo.md y reporta estado actual.

---

## 📋 WORKFLOWS DISPONIBLES

El equipo sigue workflows establecidos para garantizar calidad:

### 1. **Feature Implementation** (Más común)
Feature completa desde diseño hasta deploy
- **Agentes**: coordinator → fullstack-dev → db-integration → security-qa
- **Duración**: 3-7 días (según complejidad)
- **Output**: Feature en producción con tests y documentación

### 2. **Integration Workflow**
Integrar servicios externos (APIs bancarias, WhatsApp, etc.)
- **Agentes**: coordinator → db-integration → security-qa
- **Duración**: 3-5 días
- **Output**: Integración funcional con audit logging

### 3. **Database Migration**
Agregar/modificar tablas en la base de datos
- **Agentes**: coordinator → db-integration → security-qa
- **Duración**: 1-3 días
- **Output**: Migración ejecutada con RLS y optimización

### 4. **Code Review**
Revisión de código antes de merge
- **Agentes**: security-qa
- **Duración**: 0.5-1 día
- **Output**: Aprobación o cambios requeridos

---

## 🎯 COMANDOS AVANZADOS

### Asignar a Múltiples Agentes
```
@fullstack-dev @db-integration "Implementar módulo de chat según Chat-Module-Implementation-Plan.md"
```

### Solicitar Review Pre-Merge
```
@security-qa "Review completo de estos cambios antes de merge a main"
```

### Optimización de Performance
```
@coordinator "Las queries del dashboard están lentas, necesito optimización"
```
**Resultado**: Coordinator coordina con security-qa (identifica bottlenecks) y db-integration (optimiza queries).

### Planificación de Sprint
```
@coordinator "Planifica el siguiente sprint basado en tareas P1 del Plan-de-Trabajo.md"
```

---

## 📚 DOCUMENTACIÓN DE CONTEXTO

Los agentes **siempre** consultan estos documentos antes de trabajar:

### Documentos Principales
```
/Context/Rules/
├── README.md                                    # Overview del proyecto
├── Arquitectura.md                              # Stack y estructura completa
├── Branding.md                                  # Sistema de diseño PODENZA
├── Seguridad-y-Reglas.md                       # Security guidelines
├── Plan-de-Trabajo.md                          # Roadmap y tareas
├── External-Integrations-Best-Practices.md     # Patrones de integración
├── Database-Migration-Scripts.md               # Migraciones existentes
└── Chat-Module-Implementation-Plan.md          # Plan del módulo de chat
```

### Cuándo Actualizar
El coordinator actualiza automáticamente:
- `Plan-de-Trabajo.md` → Al completar tareas (✅)
- `Arquitectura.md` → Cambios estructurales importantes
- `Database-Migration-Scripts.md` → Nuevas migraciones

---

## ✅ CRITERIOS DE CALIDAD

Todas las implementaciones cumplen:

### Security ✅
- Multi-tenant isolation verificado (organization_id en todas las queries)
- RLS policies en todas las tablas
- Validación con Zod en frontend y backend
- Audit logging para acciones críticas

### Code Quality ✅
- TypeScript strict (no 'any')
- Error handling completo
- Loading/error states en UI
- Tests con coverage > 70% en código crítico

### Performance ✅
- Response time p95 < 500ms
- Queries optimizadas con índices
- React Query con cache estratégico
- Bundle size optimizado

### Branding ✅
- Colores PODENZA (variables CSS)
- Componentes de Shadcn/UI
- Responsive design
- Accesibilidad básica

---

## 🎯 PRIORIZACIÓN DE TAREAS

El equipo sigue este sistema de prioridades:

```
🔴 P0 - CRÍTICO    → Hacer AHORA (bloquea todo)
🟡 P1 - ALTO       → Siguiente sprint (2-3 semanas)
🟢 P2 - MEDIO      → Backlog priorizado (1-2 meses)
🔵 P3 - BAJO       → Nice to have (3+ meses)
⚪ P4 - FUTURO     → Roadmap futuro (sin fecha)
```

Consulta `/Context/Rules/Plan-de-Trabajo.md` para ver el estado actual.

---

## 📊 REPORTES Y ESTADO

### Consultar Progreso
```
@coordinator "Dame un reporte de progreso de esta semana"
```

### Ver Tareas Bloqueadas
```
@coordinator "¿Qué tareas están bloqueadas y por qué?"
```

### Métricas de Calidad
```
@security-qa "¿Cuál es el estado de la calidad del código?"
```

---

## 🚧 RESOLUCIÓN DE PROBLEMAS

### Si un Agente No Responde Apropiadamente
1. Verifica que usaste el @ correcto
2. Sé más específico en tu request
3. Usa @coordinator para que coordine

### Si Hay Errores en la Implementación
```
@security-qa "Audita este código y encuentra el problema: [descripción]"
```

### Si No Sabes A Quién Asignar
```
@coordinator "Necesito [tarea] pero no sé qué agente debe hacerlo"
```

---

## 💡 MEJORES PRÁCTICAS

### 1. Sé Específico
```
❌ "Agrega validaciones"
✅ "Agrega validación Zod para que el campo 'cedula' tenga entre 6-20 caracteres"
```

### 2. Proporciona Contexto
```
✅ "Implementar formulario de solicitud según /Context/Rules/Plan-de-Trabajo.md tarea SOL-005"
```

### 3. Usa el Coordinator para Features Grandes
```
✅ @coordinator "Implementar módulo completo de chat con Supabase Realtime"
```

### 4. Solicita Review Siempre Antes de Merge
```
✅ @security-qa "Review de PR #123 antes de merge"
```

---

## 📖 EJEMPLOS DE CASOS REALES

### Caso 1: Implementar Nueva Feature
```
Usuario: @coordinator "Necesito agregar un sistema de roles y permisos para usuarios"

Coordinator: Analiza y crea plan de acción

Plan:
1. @db-integration: Crear tabla de roles y permisos con RLS
2. @fullstack-dev: Implementar UI de gestión de roles
3. @fullstack-dev: Integrar permisos en rutas protegidas
4. @security-qa: Review de seguridad antes de merge

Duración estimada: 5-7 días
Prioridad: 🟡 P1 - ALTO

¿Procedo?

Usuario: Sí, adelante

[Los agentes trabajan en secuencia coordinados por coordinator]

Coordinator: ✅ Feature completada. Deploy a producción exitoso.
```

---

### Caso 2: Bug Crítico
```
Usuario: @coordinator "La lista de solicitudes no filtra por organización - usuarios ven solicitudes de otros"

Coordinator: 🚨 CRÍTICO - Vulnerabilidad de tenant isolation

Asigno a @security-qa para análisis inmediato

Security-qa: Confirmado. Query sin organization_id en:
- app/api/solicitudes/route.ts línea 45

@fullstack-dev: Corrige agregando filtro por organization_id

Fullstack-dev: Corregido y desplegado fix

Security-qa: Validado en producción. Zero cross-tenant leaks.

Coordinator: ✅ Bug crítico resuelto en 2 horas.
```

---

### Caso 3: Optimización
```
Usuario: El dashboard carga muy lento

Coordinator: @security-qa Identifica bottlenecks

Security-qa: Encontrado:
- Query de estadísticas sin índices (2.3s)
- N+1 queries en lista de solicitudes
- Bundle size 450kb (muy grande)

Coordinator:
- @db-integration: Optimiza queries y agrega índices
- @fullstack-dev: Implementa code splitting y optimiza bundle

[Implementación...]

Security-qa: Validado:
- Query time: 2.3s → 180ms ✅
- N+1 eliminado ✅
- Bundle: 450kb → 280kb ✅

Coordinator: ✅ Performance optimizado. Dashboard carga 10x más rápido.
```

---

## 🎓 TIPS PARA MÁXIMA EFICIENCIA

### 1. Usa el Coordinator Como Entry Point
Para features complejas o cuando tengas dudas, empieza con @coordinator.

### 2. Lee el Plan de Trabajo
Consulta `/Context/Rules/Plan-de-Trabajo.md` para ver qué está planificado.

### 3. Proporciona Links a Documentación
Si hay un plan específico, refiérelo:
```
"Según /Context/Rules/Chat-Module-Implementation-Plan.md"
```

### 4. Solicita Validación Frecuente
No esperes a terminar todo para pedir review:
```
@security-qa "Review de esta parte antes de continuar"
```

### 5. Comunica Bloqueos
Si algo te bloquea, avísalo:
```
@coordinator "Necesito [X] antes de poder continuar con [Y]"
```

---

## 📞 SOPORTE

Si tienes problemas o necesitas ayuda:

1. **Consulta esta guía** - La mayoría de preguntas están respondidas aquí
2. **Usa @coordinator** - Él puede ayudarte a navegar
3. **Revisa /Context/Rules/** - Documentación técnica detallada
4. **Revisa /.claude/workflows/** - Workflows paso a paso

---

## 🎉 ¡LISTO PARA EMPEZAR!

Tu equipo de 5 agentes especializados está listo para ayudarte a construir PODENZA con la máxima calidad.

### Tu Primer Comando
```
@coordinator "Hola equipo, muéstrame el estado actual del proyecto"
```

---

**Versión**: 1.0
**Última actualización**: 2025-01-23
**Mantenido por**: PODENZA Development Team

---

## 📂 ESTRUCTURA DEL DIRECTORIO .claude/

```
.claude/
├── README.md (ESTE ARCHIVO)
├── agents/
│   ├── coordinator.md
│   ├── fullstack-dev.md
│   ├── db-integration.md
│   ├── ai-automation.md
│   └── security-qa.md
├── workflows/
│   ├── README.md
│   ├── feature-implementation.md
│   ├── integration-workflow.md
│   ├── database-migration.md
│   └── code-review.md
└── shared/
    ├── tech-stack.md
    ├── branding-guide.md
    └── security-checklist.md
```

¡Bienvenido al equipo! 🚀
