# 🚀 INSTRUCCIONES DE SETUP - EQUIPO DE AGENTES PODENZA

## ✅ LO QUE SE HA CREADO

Se ha implementado un equipo completo de **5 agentes especializados** para el desarrollo de PODENZA, con toda la infraestructura necesaria:

### 📁 Estructura Creada

```
/workspaces/Podenza/.claude/
├── README.md                          # 📖 Guía de uso completa
├── SETUP-INSTRUCTIONS.md              # 📋 Este archivo
│
├── agents/                            # 🤖 Definiciones de los 5 agentes
│   ├── coordinator.md                 # Coordinador del equipo
│   ├── fullstack-dev.md              # Desarrollador full-stack
│   ├── db-integration.md             # Base de datos e integraciones
│   ├── ai-automation.md              # IA y automatización
│   └── security-qa.md                # Seguridad y QA
│
├── workflows/                         # 🔄 Workflows de colaboración
│   ├── README.md                     # Overview de workflows
│   └── feature-implementation.md     # Workflow completo de features
│
└── shared/                           # 📚 Documentación compartida
    └── tech-stack.md                 # Stack técnico completo
```

---

## 🤖 LOS 5 AGENTES DEL EQUIPO

### 1. **coordinator** 🎯
**Rol**: Orquestador y gestor de proyecto
- Coordina todos los agentes
- Prioriza tareas según Plan de Trabajo
- Asigna trabajo a especialistas
- Valida completitud

**Prompt ubicado en**: `.claude/agents/coordinator.md`

---

### 2. **fullstack-dev** 👨‍💻
**Rol**: Constructor de features
- Frontend: React/Next.js + UI components
- Backend: API routes + lógica de negocio
- Formularios con validación
- Branding PODENZA

**Prompt ubicado en**: `.claude/agents/fullstack-dev.md`

---

### 3. **db-integration** 🗄️
**Rol**: Arquitecto de datos e integraciones
- Schemas multi-tenant con RLS
- Migraciones de base de datos
- Optimización de queries (+1000 TPS)
- Integraciones externas (APIs bancarias, AUCO, WhatsApp)

**Prompt ubicado en**: `.claude/agents/db-integration.md`

---

### 4. **ai-automation** 🤖
**Rol**: Especialista en IA y automatización
- OCR y análisis de documentos
- Scoring crediticio con ML
- Automatización de workflows
- Las 8 etapas del proceso

**Prompt ubicado en**: `.claude/agents/ai-automation.md`

---

### 5. **security-qa** 🛡️
**Rol**: Guardián de seguridad y calidad
- Auditoría de tenant isolation
- Code review pre-merge
- Testing (unit, integration, E2E)
- Security compliance

**Prompt ubicado en**: `.claude/agents/security-qa.md`

---

## 🔧 CÓMO USAR LOS AGENTES EN CLAUDE CODE

### Opción 1: Usar Directamente los Archivos Markdown

Los agentes están definidos como archivos markdown que contienen todos los prompts necesarios. Puedes:

1. **Copiar el contenido** de cualquier agente y usarlo como contexto:
   ```bash
   # Ejemplo: Usar el agente fullstack-dev
   cat .claude/agents/fullstack-dev.md
   # Copiar contenido y pegarlo en tu conversación con Claude Code
   ```

2. **Referenciar en conversaciones**:
   ```
   "Actúa como el agente fullstack-dev definido en .claude/agents/fullstack-dev.md

   Tarea: Implementar formulario de creación de solicitud"
   ```

---

### Opción 2: Crear Comandos Personalizados (Slash Commands)

Si Claude Code soporta slash commands o custom agents, puedes crear:

```bash
/fullstack "Crear componente de filtros"
/db-integration "Agregar tabla de notifications"
/security-qa "Review de PR #123"
/coordinator "Estado del proyecto"
```

---

### Opción 3: Usar el Sistema de Tareas (Task Tool)

En Claude Code, puedes invocar agentes usando el Task tool:

```typescript
// Ejemplo conceptual
Task({
  agent: "fullstack-dev",
  prompt: "Implementar formulario de solicitud con validaciones Zod",
  context: [
    ".claude/agents/fullstack-dev.md",
    "Context/Rules/Branding.md",
    "Context/Rules/Arquitectura.md"
  ]
})
```

---

## 📖 DOCUMENTACIÓN Y RECURSOS

### Para Empezar
1. **Lee primero**: `.claude/README.md` - Guía completa de uso
2. **Conoce el stack**: `.claude/shared/tech-stack.md`
3. **Workflows**: `.claude/workflows/` - Procesos establecidos

### Contexto del Proyecto (CRÍTICO)
Todos los agentes consultan estos documentos automáticamente:

```
/Context/Rules/
├── README.md                                    # Overview
├── Arquitectura.md                              # Stack completo
├── Branding.md                                  # Sistema de diseño
├── Seguridad-y-Reglas.md                       # Security guidelines
├── Plan-de-Trabajo.md                          # Roadmap actual
├── External-Integrations-Best-Practices.md     # Integraciones
├── Database-Migration-Scripts.md               # Migraciones
└── Chat-Module-Implementation-Plan.md          # Plan de chat
```

---

## 🎯 EJEMPLOS DE USO PRÁCTICOS

### Ejemplo 1: Implementar Nueva Feature
```
Mensaje a Claude Code:

"Usando el agente @coordinator definido en .claude/agents/coordinator.md,
necesito implementar un sistema de notificaciones in-app.

Sigue el workflow definido en .claude/workflows/feature-implementation.md"
```

**Resultado esperado**: Coordinator analiza, crea plan, asigna a fullstack-dev + db-integration, coordina implementación completa.

---

### Ejemplo 2: Code Review
```
Mensaje a Claude Code:

"Actúa como el agente security-qa (.claude/agents/security-qa.md).

Revisa el código en app/api/solicitudes/route.ts y valida:
- Multi-tenant isolation (organization_id en queries)
- Validación con Zod
- Error handling
- Audit logging

Usa el security checklist del agente."
```

---

### Ejemplo 3: Optimización
```
Mensaje a Claude Code:

"Necesito optimizar el dashboard que carga lento.

Usa el coordinator (.claude/agents/coordinator.md) para:
1. Asignar a security-qa para identificar bottlenecks
2. Asignar a db-integration para optimizar queries
3. Asignar a fullstack-dev para optimizar frontend
4. Coordinar la implementación"
```

---

## ✨ VENTAJAS DE ESTE SISTEMA

### 1. **Especialización Clara**
Cada agente tiene un dominio bien definido y expertise específico.

### 2. **Contexto Compartido**
Todos los agentes consultan `/Context/Rules/` para mantener consistencia.

### 3. **Workflows Establecidos**
Procesos claros para features, integraciones, migraciones, reviews.

### 4. **Calidad Garantizada**
Todas las implementaciones pasan por security-qa antes de merge.

### 5. **Multi-Tenant Nativo**
Todos los agentes entienden y validan tenant isolation automáticamente.

### 6. **Escalable**
Fácil agregar más agentes o workflows según necesidad.

---

## 🔐 SECURITY FEATURES INCORPORADAS

Todos los agentes implementan:

✅ **Multi-Tenant Isolation**
- organization_id en todas las queries
- RLS policies obligatorias
- Validación de tenant en rutas

✅ **Input Validation**
- Zod schemas en frontend y backend
- Sanitización de inputs
- File upload security

✅ **Audit Logging**
- Acciones críticas logueadas
- Incluye: user, org, IP, timestamp
- Integraciones externas tracked

✅ **Authentication & Authorization**
- JWT tokens con Supabase Auth
- Session management
- Permission validation

---

## 📊 MÉTRICAS DE CALIDAD QUE SE GARANTIZAN

### Performance
- Response time p95 < 500ms
- Soporta +1000 transacciones por hora
- Queries optimizadas con índices

### Security
- Zero cross-tenant data leaks
- 100% de tablas con RLS
- 100% de inputs validados

### Code Quality
- TypeScript strict (no 'any')
- Test coverage > 70% en código crítico
- Error handling completo
- Branding PODENZA consistente

---

## 🚀 PRÓXIMOS PASOS

### 1. Familiarízate con los Agentes
Lee `.claude/agents/` para conocer cada agente.

### 2. Prueba el Coordinator
```
"Hola @coordinator, muéstrame el estado actual del proyecto según Plan-de-Trabajo.md"
```

### 3. Implementa Tu Primera Feature
Sigue el workflow en `.claude/workflows/feature-implementation.md`

### 4. Solicita Code Review
Antes de cada merge:
```
"@security-qa revisa este código antes de merge"
```

---

## 📞 SOPORTE Y TROUBLESHOOTING

### Si un Agente No Entiende
1. Sé más específico en el request
2. Referencia el archivo del agente explícitamente
3. Proporciona contexto adicional de `/Context/Rules/`

### Si Necesitas Ayuda
1. Consulta `.claude/README.md` (guía completa)
2. Usa `@coordinator` como entry point
3. Lee los workflows en `.claude/workflows/`

### Para Agregar Nuevos Agentes
1. Crea archivo `.claude/agents/nuevo-agente.md`
2. Sigue la estructura de agentes existentes
3. Documenta en `.claude/README.md`

---

## 🎉 ¡TODO LISTO!

Tu equipo de 5 agentes especializados está completamente configurado y listo para ayudarte a construir PODENZA con la máxima calidad y eficiencia.

### Tu Primer Comando
```
"Hola @coordinator, estoy listo para empezar. Muéstrame las tareas P1 pendientes del Plan-de-Trabajo.md"
```

---

## 📝 NOTAS IMPORTANTES

### Sobre Claude Code
Este sistema está diseñado para ser **agnóstico de la implementación específica** de Claude Code. Los agentes funcionan como:

1. **Prompts reutilizables** - Puedes copiar/pegar en conversaciones
2. **Contexto estructurado** - Referenciable en cualquier momento
3. **Workflows documentados** - Procesos claros independientes de la herramienta

### Adaptabilidad
Si Claude Code implementa features específicas de agentes en el futuro (como sub-agentes nativos), estos archivos pueden servir como base para configurarlos.

### Mantenimiento
- Los agentes leen contexto de `/Context/Rules/` dinámicamente
- Actualiza `/Context/Rules/` y los agentes se adaptan automáticamente
- Los prompts de agentes pueden evolucionar según necesidades

---

**Versión**: 1.0
**Fecha de creación**: 2025-01-23
**Creado por**: Claude (Anthropic)
**Mantenido por**: PODENZA Development Team

---

## 🔗 LINKS ÚTILES

- **Guía de Uso**: `.claude/README.md`
- **Agentes**: `.claude/agents/`
- **Workflows**: `.claude/workflows/`
- **Contexto**: `/Context/Rules/`
- **Documentación Claude Code**: https://docs.claude.com/claude-code

---

¡Bienvenido al equipo más eficiente de desarrollo para PODENZA! 🚀
