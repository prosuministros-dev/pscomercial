# Guía de Configuración de MCP Supabase

## 📋 Descripción General

Esta guía explica cómo configurar y usar los servidores MCP (Model Context Protocol) de Supabase en Claude Code para los diferentes ambientes del proyecto Podenza.

## 🔑 Credenciales por Ambiente

### DEV (Desarrollo)
- **Project ID**: `gbfgvdqqvxmklfdrhdqq`
- **URL**: `https://gbfgvdqqvxmklfdrhdqq.supabase.co`
- **Access Token**: `sbp_4d9e4261afd2948d0895bdf73721bc4c19526bc2`
- **Service Role Key**: Configurado en `.env`
- **Permisos**: Lectura + Escritura

### UAT (Testing)
- **Project ID**: `wxghopuefrdszebgrclv`
- **URL**: `https://wxghopuefrdszebgrclv.supabase.co`
- **Access Token**: ⚠️ **PENDIENTE** - Debe obtenerse del Supabase Dashboard
- **Service Role Key**: Configurado en `.env.uat`
- **Permisos**: **SOLO LECTURA** (restricción crítica)

### PROD (Producción)
- **Project ID**: `cmcornfziqivoazpdszv`
- **URL**: `https://cmcornfziqivoazpdszv.supabase.co`
- **Access Token**: ⚠️ **PENDIENTE** - Debe obtenerse del Supabase Dashboard
- **Service Role Key**: Proporcionado
- **Permisos**: **SOLO LECTURA** (restricción crítica)

## 🚀 Cómo Cambiar Entre Ambientes

### Opción 1: Cambio Manual (Recomendado)

1. **Para trabajar en DEV** (predeterminado):
   ```bash
   # Ya está configurado en .claude/settings.local.json
   # No se requiere acción
   ```

2. **Para trabajar en UAT**:
   ```bash
   # Respaldar configuración actual
   cp .claude/settings.local.json .claude/settings.local.backup.json

   # Copiar configuración de UAT
   cp .claude/settings.uat.json .claude/settings.local.json

   # Reiniciar Claude Code para aplicar cambios
   ```

3. **Para trabajar en PROD**:
   ```bash
   # Respaldar configuración actual
   cp .claude/settings.local.json .claude/settings.local.backup.json

   # Copiar configuración de PROD
   cp .claude/settings.prod.json .claude/settings.local.json

   # Reiniciar Claude Code para aplicar cambios
   ```

4. **Volver a DEV**:
   ```bash
   # Si tienes backup
   cp .claude/settings.local.backup.json .claude/settings.local.json

   # O restaurar manualmente (ver settings.local.json en Git)
   git checkout .claude/settings.local.json

   # Reiniciar Claude Code
   ```

### Opción 2: Script Automático (Pendiente de Implementar)

Crear un script `switch-env.sh`:
```bash
#!/bin/bash
ENV=$1

if [ -z "$ENV" ]; then
  echo "Uso: ./switch-env.sh [dev|uat|prod]"
  exit 1
fi

case $ENV in
  dev)
    git checkout .claude/settings.local.json
    echo "✅ Cambiado a DEV"
    ;;
  uat)
    cp .claude/settings.uat.json .claude/settings.local.json
    echo "✅ Cambiado a UAT (SOLO LECTURA)"
    ;;
  prod)
    cp .claude/settings.prod.json .claude/settings.local.json
    echo "⚠️  Cambiado a PROD (SOLO LECTURA)"
    ;;
  *)
    echo "❌ Ambiente no válido. Use: dev, uat, o prod"
    exit 1
    ;;
esac

echo "🔄 Por favor, reinicia Claude Code para aplicar los cambios"
```

## 📝 Cómo Obtener Access Tokens Faltantes

### Para UAT y PROD:

1. **Ir al Supabase Dashboard**:
   - UAT: https://supabase.com/dashboard/project/wxghopuefrdszebgrclv
   - PROD: https://supabase.com/dashboard/project/cmcornfziqivoazpdszv

2. **Generar Access Token**:
   - Ir a: Settings → API → Access Tokens
   - Crear nuevo token con nombre descriptivo (ej: "Claude Code MCP")
   - Copiar el token generado

3. **Actualizar archivo de configuración**:
   - UAT: Editar `.claude/settings.uat.json`
   - PROD: Editar `.claude/settings.prod.json`
   - Reemplazar `"PENDIENTE_OBTENER_DE_SUPABASE_DASHBOARD"` con el token real

4. **Aplicar cambios**:
   - Si estás en ese ambiente, reiniciar Claude Code
   - Si no, el token estará listo para cuando cambies

## 🔒 Restricciones de Seguridad

### ⚠️ CRÍTICO: UAT y PROD son SOLO LECTURA

```json
"permissions": {
  "deny": [
    "mcp__supabase__apply_migration"
  ]
}
```

Operaciones **PERMITIDAS** en UAT/PROD:
- ✅ `list_tables` - Listar tablas
- ✅ `list_migrations` - Listar migraciones
- ✅ `execute_sql` - Solo SELECT (sin DML/DDL)
- ✅ `get_logs` - Ver logs
- ✅ `get_advisors` - Obtener advisories de seguridad
- ✅ `generate_typescript_types` - Generar tipos TypeScript

Operaciones **BLOQUEADAS** en UAT/PROD:
- ❌ `apply_migration` - Aplicar migraciones
- ❌ `create_branch` - Crear branches
- ❌ `merge_branch` - Merge de branches
- ❌ `execute_sql` con INSERT/UPDATE/DELETE/DDL

## 🧪 Validar Configuración

Después de reiniciar Claude Code, validar que el MCP funciona:

```typescript
// Pregunta a Claude Code:
// "Lista los proyectos de Supabase disponibles"

// Debería responder con:
// - DEV: gbfgvdqqvxmklfdrhdqq
// - UAT: wxghopuefrdszebgrclv (si access token está configurado)
// - PROD: cmcornfziqivoazpdszv (si access token está configurado)
```

## 📚 Comandos MCP de Supabase Disponibles

### Gestión de Proyectos
- `mcp__supabase__list_projects` - Listar todos los proyectos
- `mcp__supabase__get_project` - Obtener detalles de un proyecto
- `mcp__supabase__get_project_url` - Obtener URL del proyecto

### Base de Datos
- `mcp__supabase__list_tables` - Listar tablas
- `mcp__supabase__execute_sql` - Ejecutar SQL
- `mcp__supabase__list_migrations` - Listar migraciones
- `mcp__supabase__apply_migration` - Aplicar migración (solo DEV)

### Monitoreo
- `mcp__supabase__get_logs` - Obtener logs por servicio
- `mcp__supabase__get_advisors` - Obtener advisories de seguridad/performance

### Utilidades
- `mcp__supabase__generate_typescript_types` - Generar tipos TypeScript
- `mcp__supabase__get_publishable_keys` - Obtener API keys públicas

## 🐛 Troubleshooting

### Error: "Unauthorized. Please provide a valid access token"

**Causa**: El access token no está configurado o es inválido.

**Solución**:
1. Verificar que `SUPABASE_ACCESS_TOKEN` está en el archivo de configuración
2. Verificar que el token es válido (no expirado)
3. Reiniciar Claude Code después de cambiar la configuración

### Error: "Project not found"

**Causa**: El Project ID es incorrecto o no tienes acceso.

**Solución**:
1. Verificar el Project ID en el Supabase Dashboard
2. Verificar que el access token tiene permisos para ese proyecto

### Los cambios no se aplican

**Causa**: Claude Code no ha recargado la configuración.

**Solución**:
1. Cerrar completamente Claude Code
2. Volver a abrir
3. Validar con `mcp__supabase__list_projects`

## 📖 Referencias

- [Supabase MCP Documentation](https://github.com/modelcontextprotocol/servers/tree/main/src/supabase)
- [Claude Code MCP Servers](https://docs.anthropic.com/claude/docs/mcp)
- [Supabase API Documentation](https://supabase.com/docs/reference/api)

## ✅ Checklist de Configuración Completa

- [x] MCP Supabase agregado a `.claude/settings.local.json` (DEV)
- [x] Archivo `.claude/settings.uat.json` creado
- [x] Archivo `.claude/settings.prod.json` creado
- [ ] Access Token de UAT obtenido y configurado
- [ ] Access Token de PROD obtenido y configurado
- [ ] Validar funcionamiento con `list_projects`
- [ ] Documentar procedimiento de cambio de ambiente en el equipo

## 🔄 Próximos Pasos

1. **Obtener Access Tokens faltantes** para UAT y PROD
2. **Crear script de cambio de ambiente** automatizado
3. **Validar restricciones** de SOLO LECTURA en UAT/PROD
4. **Actualizar CLAUDE.md** con esta información
