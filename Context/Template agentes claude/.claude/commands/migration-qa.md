# Migration Quality Assurance Agent v3.0

## EJECUCION AUTOMATICA

Cuando este agente se activa, ejecuta TODO el flujo automáticamente:

1. **FASE 0**: Verificar prerrequisitos (Docker, Supabase CLI, psql, Node.js)
2. **FASE 1**: Homologar migraciones DEV Cloud ↔ GitHub Local
3. **FASE 2**: Verificar dump UAT existente (preguntar al usuario si usar o re-descargar)
4. **FASE 3**: Dump esquema UAT (si es necesario)
5. **FASE 4**: Setup ambiente efímero
6. **FASE 5**: Testing completo inicial (identificar TODOS los errores)
7. **FASE 6**: Loop de corrección de migraciones
8. **FASE 7**: Re-testing después de correcciones
9. **FASE 8**: Verificar integridad
10. **FASE 9**: Generar reporte
11. **FASE 10**: Validar aplicación (pnpm build / pnpm dev)
12. **FASE 11**: Cleanup (preguntar al usuario)

## RESTRICCIONES CRITICAS - NO NEGOCIABLE

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║  ⛔ PROHIBIDO MODIFICAR UAT EN SUPABASE CLOUD ⛔                              ║
║                                                                               ║
║  - NO ejecutar mcp__supabase__apply_migration en UAT                          ║
║  - NO ejecutar mcp__supabase__execute_sql con DML/DDL en UAT                  ║
║  - NO usar --db-url con conexion a UAT para operaciones de escritura          ║
║  - SOLO lectura permitida en UAT (list_tables, list_migrations, execute_sql   ║
║    con SELECT, dump de esquema)                                               ║
║                                                                               ║
║  CUALQUIER INTENTO DE MODIFICAR UAT = ABORTAR INMEDIATAMENTE                  ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

## Identificadores de Proyectos Supabase

```yaml
DEV:
  project_id: "gbfgvdqqvxmklfdrhdqq"
  name: "Podenza DEV"
  url: "https://gbfgvdqqvxmklfdrhdqq.supabase.co"
  region: "us-east-1"
  permisos: "Lectura + Escritura"

UAT:
  project_id: "wxghopuefrdszebgrclv"
  name: "Podenza UAT"
  url: "https://wxghopuefrdszebgrclv.supabase.co"
  db_host: "db.wxghopuefrdszebgrclv.supabase.co"
  pooler_host: "aws-0-us-east-1.pooler.supabase.com"
  pooler_port: 6543
  region: "us-east-1"
  permisos: "⛔ SOLO LECTURA"
```

---

## FASE 0: Verificar Prerrequisitos

El agente verifica automáticamente:

```bash
# 1. Docker instalado y corriendo
docker info >/dev/null 2>&1

# 2. Supabase CLI disponible
npx supabase --version

# 3. PostgreSQL client (psql)
psql --version

# 4. Node.js
node --version

# 5. Conexión a internet
curl -s https://supabase.com >/dev/null 2>&1
```

Si falta algún prerrequisito, el agente informa y aborta.

---

## FASE 1: Homologación DEV Cloud ↔ GitHub Local

### Objetivo
Garantizar que TODAS las migraciones de Supabase DEV cloud estén en el repositorio local.

### Proceso

```
╔═══════════════════════════════════════════════════════════════════════╗
║  HOMOLOGACIÓN: Supabase DEV Cloud ↔ GitHub Local                      ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║  1. Obtener migraciones de Supabase DEV cloud:                        ║
║     mcp__supabase__list_migrations(project_id="gbfgvdqqvxmklfdrhdqq") ║
║                                                                       ║
║  2. Obtener migraciones locales:                                      ║
║     ls supabase/migrations/*.sql                                      ║
║                                                                       ║
║  3. Comparar versiones (timestamps):                                  ║
║     - En DEV cloud pero NO en local → DESCARGAR                       ║
║     - En local pero NO en DEV cloud → MANTENER (validar después)      ║
║                                                                       ║
║  4. Descargar migraciones faltantes:                                  ║
║     Para cada migración faltante:                                     ║
║     - Obtener contenido SQL de schema_migrations                      ║
║     - Crear archivo en supabase/migrations/                           ║
║                                                                       ║
║  5. Verificar 100% homologación antes de continuar                    ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
```

### Comandos MCP para homologación

```typescript
// Listar migraciones en DEV cloud
mcp__supabase__list_migrations({ project_id: "gbfgvdqqvxmklfdrhdqq" })

// Obtener contenido SQL de migraciones faltantes
mcp__supabase__execute_sql({
  project_id: "gbfgvdqqvxmklfdrhdqq",
  query: `SELECT version, statements FROM supabase_migrations.schema_migrations
          WHERE version IN ('XXXXXXXXXXXXXX', 'YYYYYYYYYYYYYY')
          ORDER BY version`
})
```

---

## FASE 2: Verificar Dump UAT Existente

Si existe `/tmp/uat_schema.sql`, PREGUNTAR al usuario:

```
╔═══════════════════════════════════════════════════════════════════════╗
║  Se encontró un dump UAT existente:                                   ║
║  - Archivo: /tmp/uat_schema.sql                                       ║
║  - Tamaño: XXX KB                                                     ║
║  - Fecha: YYYY-MM-DD HH:MM                                            ║
║                                                                       ║
║  ¿Qué deseas hacer?                                                   ║
║                                                                       ║
║  [A] Usar dump existente (más rápido)                                 ║
║  [B] Eliminar y descargar nuevo (más actualizado)                     ║
╚═══════════════════════════════════════════════════════════════════════╝
```

---

## FASE 3: Dump Esquema UAT (SOLO LECTURA)

### Prerequisito: Password de UAT
```
El usuario debe proporcionar UAT_DB_PASSWORD:
https://supabase.com/dashboard/project/cmcornfziqivoazpdszv/settings/database
```

### Ejecutar dump
```bash
export UAT_DB_PASSWORD='password-de-uat'
bash scripts/migration-qa-setup.sh dump
```

**Genera:** `/tmp/uat_schema.sql`

---

## FASE 4: Setup Ambiente Efímero

```bash
bash scripts/migration-qa-setup.sh setup
```

Este comando:
1. Crea contenedor Docker `pg-uat-shadow` en puerto 54329
2. Espera a que PostgreSQL esté listo
3. Restaura el esquema de UAT en el contenedor

**Conexión efímera:** `postgres://postgres:postgres@localhost:54329/postgres`

---

## FASE 5: Testing Completo Inicial

### Objetivo
Identificar TODOS los errores de migración (no parar en el primero).

```bash
bash scripts/migration-qa-setup.sh test-all
```

### Resultado: RUTA DE CORRECCIONES

```
╔═══════════════════════════════════════════════════════════════════════╗
║  RUTA DE CORRECCIONES                                                 ║
╠═══════════════════════════════════════════════════════════════════════╣
║  # | Migración                    | Error              | Estado       ║
║────|──────────────────────────────|────────────────────|──────────────║
║  1 | 20251126004525_remove_audit  | relation not exist | ❌           ║
║  2 | 20251126160021_active_sess   | duplicate key      | ❌           ║
║  3 | 20251127150355_reglas_prio   | column not found   | ❌           ║
║  4 | 20251127155130_rangos_color  | type not exist     | ❌           ║
║────|──────────────────────────────|────────────────────|──────────────║
║  Total: 4 errores a corregir                                          ║
╚═══════════════════════════════════════════════════════════════════════╝
```

---

## FASE 6: Loop de Corrección

### REGLAS IMPORTANTES

```
╔═══════════════════════════════════════════════════════════════════════╗
║  ⚠️  NO destruir contenedor Docker entre correcciones                 ║
║  ⚠️  NO re-descargar dump de UAT                                      ║
║  ⚠️  Solo REINICIAR si es absolutamente necesario                     ║
╚═══════════════════════════════════════════════════════════════════════╝
```

### Comandos permitidos durante correcciones

| Comando | Descripción |
|---------|-------------|
| `bash scripts/migration-qa-setup.sh status` | Ver estado del efímero |
| `bash scripts/migration-qa-setup.sh reset` | Reiniciar SIN re-descargar dump |
| `bash scripts/migration-qa-setup.sh test` | Re-probar migraciones |
| `bash scripts/migration-qa-setup.sh apply` | Re-aplicar migraciones |

### Flujo de corrección

```
1. Tomar primera migración de RUTA DE CORRECCIONES
2. Analizar error específico
3. Editar archivo .sql en supabase/migrations/
4. Marcar como corregida en RUTA
5. Mostrar progreso: [1/4 corregidas]
6. Repetir para siguiente migración
7. Cuando todas corregidas → FASE 7 (Re-Testing)
```

### Errores Comunes y Correcciones

**Error: ENUM ya existe**
```sql
DO $$ BEGIN
    CREATE TYPE mi_enum AS ENUM ('valor1', 'valor2');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
```

**Error: Tabla/Columna ya existe**
```sql
CREATE TABLE IF NOT EXISTS mi_tabla (...);
ALTER TABLE mi_tabla ADD COLUMN IF NOT EXISTS nueva_columna TEXT;
```

**Error: FK a tabla inexistente**
- Reordenar migraciones (cambiar timestamp del nombre de archivo)
- O agregar la tabla faltante en migración anterior

**Error: Política RLS duplicada**
```sql
DROP POLICY IF EXISTS "policy_name" ON tabla;
CREATE POLICY "policy_name" ON tabla ...;
```

---

## FASE 7: Re-Testing Después de Correcciones

```bash
bash scripts/migration-qa-setup.sh test
bash scripts/migration-qa-setup.sh apply
```

Si hay errores → Volver a FASE 6

---

## FASE 8: Verificar Integridad

```bash
bash scripts/migration-qa-setup.sh verify
```

Verifica:
- Cantidad de tablas en schema public
- Cantidad de funciones
- Cantidad de triggers
- Migraciones registradas en schema_migrations

---

## FASE 9: Generar Reporte

```bash
bash scripts/migration-qa-setup.sh report
```

Genera `migration-qa-report.md` con:
- Fecha y hora
- IDs de proyecto
- Homologación DEV cloud ↔ GitHub local
- Métricas del esquema
- Checklist de validaciones
- Comando para aplicar en UAT post-merge

---

## FASE 10: Validar Aplicación

```bash
# Verificar build de producción
pnpm build

# Verificar inicio en desarrollo
pnpm dev

# Verificar tipos TypeScript
pnpm typecheck

# Verificar linting
pnpm lint
```

### Clasificación de errores

| Tipo de Error | Ejemplo | Acción |
|---------------|---------|--------|
| **Migración** | `relation "xxx" does not exist` | FASE 6 |
| **Migración** | `column "xxx" does not exist` | FASE 6 |
| **Migración** | `function xxx() does not exist` | FASE 6 |
| **Migración** | `permission denied for table` | FASE 6 |
| **Código** | `Type error: Property 'x' does not exist` | Corregir código |
| **Código** | `Module not found` | Corregir import |
| **Código** | `Build failed` | Corregir errores |

---

## FASE 11: Cleanup (Opcional)

Preguntar al usuario antes de eliminar:

```bash
bash scripts/migration-qa-setup.sh cleanup
```

Elimina:
- Contenedor Docker `pg-uat-shadow`
- Archivo `/tmp/uat_schema.sql`
- Logs temporales

---

## Herramientas MCP Permitidas

### En DEV (Lectura/Escritura):
| Herramienta | Uso |
|-------------|-----|
| `mcp__supabase__list_tables(project_id="gbfgvdqqvxmklfdrhdqq")` | Listar tablas |
| `mcp__supabase__list_migrations(project_id="gbfgvdqqvxmklfdrhdqq")` | Listar migraciones |
| `mcp__supabase__execute_sql(project_id="gbfgvdqqvxmklfdrhdqq", query="...")` | Ejecutar SQL |
| `mcp__supabase__apply_migration(project_id="gbfgvdqqvxmklfdrhdqq", ...)` | Aplicar migraciones |
| `mcp__supabase__get_logs(project_id="gbfgvdqqvxmklfdrhdqq", service="postgres")` | Ver logs |

### En UAT (⛔ SOLO LECTURA):
| Herramienta | Permitido |
|-------------|-----------|
| `mcp__supabase__list_tables(project_id="cmcornfziqivoazpdszv")` | ✅ SI |
| `mcp__supabase__list_migrations(project_id="cmcornfziqivoazpdszv")` | ✅ SI |
| `mcp__supabase__execute_sql(..., query="SELECT ...")` | ✅ SI (solo SELECT) |
| `mcp__supabase__apply_migration(project_id="cmcornfziqivoazpdszv", ...)` | ⛔ NO |
| `mcp__supabase__execute_sql(..., query="INSERT/UPDATE/DELETE/CREATE/ALTER/DROP...")` | ⛔ NO |

---

## Comandos del Script v3.0

| Comando | Descripción |
|---------|-------------|
| `prereq` | Verificar prerrequisitos (Docker, Supabase CLI, psql) |
| `check-dump` | Verificar si existe dump UAT previo |
| `dump` | Exportar esquema de UAT (SOLO LECTURA) |
| `setup` | Crear ambiente efímero + restaurar esquema |
| `reset` | **NUEVO** Reiniciar efímero SIN re-descargar dump |
| `test` | Ejecutar dry-run de migraciones |
| `test-all` | **NUEVO** Testing completo (no para en primer error) |
| `apply` | Aplicar migraciones al efímero |
| `verify` | Verificar integridad del esquema |
| `report` | Generar reporte de QA |
| `cleanup` | Destruir ambiente efímero |
| `status` | Ver estado del contenedor |
| `full` | Ejecutar flujo completo |

---

## Checklist Pre-PR

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    CHECKLIST COMPLETO MIGRATION QA v3.0                       ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  PREPARACIÓN                                                                  ║
║  ─────────────────────────────────────────────────────────────────────────    ║
║  [ ] FASE 0: Prerrequisitos verificados                                       ║
║  [ ] FASE 1: Homologación DEV cloud ↔ GitHub local 100%                       ║
║  [ ] FASE 2: Dump UAT verificado/actualizado                                  ║
║                                                                               ║
║  VALIDACIÓN DE MIGRACIONES                                                    ║
║  ─────────────────────────────────────────────────────────────────────────    ║
║  [ ] FASE 3: Esquema UAT exportado correctamente (dump)                       ║
║  [ ] FASE 4: Ambiente efímero creado y funcionando (setup)                    ║
║  [ ] FASE 5: Testing completo ejecutado (test-all)                            ║
║  [ ] FASE 6: Loop de corrección completado (si hubo errores)                  ║
║          [ ] Todas las migraciones corregidas                                 ║
║          [ ] Contenedor NO destruido entre correcciones                       ║
║          [ ] Dump NO re-descargado entre correcciones                         ║
║  [ ] FASE 7: Re-testing exitoso (test + apply)                                ║
║  [ ] FASE 8: Verificación de integridad completada (verify)                   ║
║  [ ] FASE 9: Reporte generado (report)                                        ║
║                                                                               ║
║  VALIDACIÓN DE APLICACIÓN                                                     ║
║  ─────────────────────────────────────────────────────────────────────────    ║
║  [ ] FASE 10: Validación de aplicación completada                             ║
║          [ ] Aplicación compila sin errores (pnpm build)                      ║
║          [ ] Aplicación inicia sin errores (pnpm dev)                         ║
║          [ ] TypeScript sin errores de tipo                                   ║
║          [ ] Conexión a Supabase DEV funcional                                ║
║                                                                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  RESULTADO FINAL:                                                             ║
║  [ ] ✅ 100% Homologado (DEV cloud = GitHub local)                            ║
║  [ ] ✅ 100% Probado (todas las migraciones sin errores)                      ║
║  [ ] ✅ 100% Funcional (aplicación corriendo)                                 ║
║  [ ] ✅ Listo para PR DEV → UAT                                               ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

---

## Ejemplo de Ejecución Completa

```bash
# El agente ejecuta automáticamente cuando el usuario dice "migration qa"

# Si es necesario ejecutar manualmente:

# 1. Configurar password de UAT
export UAT_DB_PASSWORD='mi-password-de-uat'

# 2. Ejecutar flujo completo
bash scripts/migration-qa-setup.sh full

# 3. Si hay errores, corregir y usar reset (no cleanup):
bash scripts/migration-qa-setup.sh reset
bash scripts/migration-qa-setup.sh test
bash scripts/migration-qa-setup.sh apply

# 4. Cuando todo pase:
bash scripts/migration-qa-setup.sh verify
bash scripts/migration-qa-setup.sh report

# 5. Validar aplicación
pnpm build
pnpm dev

# 6. Limpiar (opcional, al final)
bash scripts/migration-qa-setup.sh cleanup
```

---

## Archivos Generados

| Archivo | Descripción |
|---------|-------------|
| `/tmp/uat_schema.sql` | Dump del esquema de UAT |
| `/tmp/migration-dryrun.log` | Log del dry-run |
| `/tmp/migration-apply.log` | Log de la aplicación |
| `/tmp/migration-metrics.txt` | Métricas del esquema |
| `/tmp/migration-errors.log` | Log detallado de errores |
| `/tmp/migration-corrections.md` | Ruta de correcciones |
| `migration-qa-report.md` | Reporte final de QA |

---

## Notas Importantes

1. **NUNCA modificar UAT directamente** - Siempre usar el ambiente efímero
2. **El dump es SOLO LECTURA** - Solo extrae el esquema, no modifica nada
3. **NO destruir contenedor entre correcciones** - Usar `reset` en lugar de `cleanup + setup`
4. **NO re-descargar dump entre correcciones** - El esquema UAT no cambia
5. **Idempotencia** - Todas las migraciones deben ser idempotentes
6. **Orden de dependencias** - Verificar que tablas existan antes de FKs
7. **ENUMs** - Usar DO blocks con EXCEPTION handling
8. **Índices** - Evitar CONCURRENTLY, usar IF NOT EXISTS
9. **RLS** - Verificar políticas no bloqueen operaciones necesarias
