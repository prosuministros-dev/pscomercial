# SUPABASE CREDENTIALS - PODENZA

> **IMPORTANTE**: Este archivo contiene las credenciales centralizadas para acceso a Supabase.
> Todos los agentes del devteam deben referenciar este archivo para conexiones a BD.

---

## Ambientes Disponibles

| Ambiente | Project ID | Permisos | Uso Principal |
|----------|------------|----------|---------------|
| **DEV** | `gbfgvdqqvxmklfdrhdqq` | Lectura + Escritura | Desarrollo, migraciones, testing |
| **UAT** | `wxghopuefrdszebgrclv` | **SOLO LECTURA** | Validación, QA, comparación con DEV |

---

## Tokens MCP (Supabase Access Token)

```bash
# Token DEV - Lectura + Escritura (usar para desarrollo y migraciones)
SUPABASE_ACCESS_TOKEN_DEV=sbp_c53296c0df0128a60671e001ccc4fbd934fda396

# Token UAT - SOLO LECTURA (usar para validación y QA)
SUPABASE_ACCESS_TOKEN_UAT=sbp_d2983fc9d872c6654ab7126189eeccd51e8fe679
```

---

## Conexiones PostgreSQL Directas

### Password (compartido para ambos ambientes)
```bash
DB_PASSWORD=WorkingHard100%
```

### DEV - Desarrollo (Lectura + Escritura)
```bash
# Session Pooler (IPv4 compatible)
Host: aws-1-us-east-1.pooler.supabase.com
Port: 5432
Database: postgres
User: postgres.gbfgvdqqvxmklfdrhdqq
Password: WorkingHard100%

# Connection String
DEV_CONNECTION_STRING="postgresql://postgres.gbfgvdqqvxmklfdrhdqq:WorkingHard100%25@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
```

### UAT - Staging (SOLO LECTURA)
```bash
# Session Pooler (IPv4 compatible)
Host: aws-1-us-east-1.pooler.supabase.com
Port: 5432
Database: postgres
User: postgres.wxghopuefrdszebgrclv
Password: WorkingHard100%

# Connection String
UAT_CONNECTION_STRING="postgresql://postgres.wxghopuefrdszebgrclv:WorkingHard100%25@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
```

---

## Comandos Rápidos (Windows con WSL)

### Conexión Interactiva
```bash
# Conectar a DEV (desarrollo)
wsl PGPASSWORD='WorkingHard100%' psql -h aws-1-us-east-1.pooler.supabase.com -p 5432 -U postgres.gbfgvdqqvxmklfdrhdqq -d postgres

# Conectar a UAT (staging - SOLO LECTURA)
wsl PGPASSWORD='WorkingHard100%' psql -h aws-1-us-east-1.pooler.supabase.com -p 5432 -U postgres.wxghopuefrdszebgrclv -d postgres
```

### Queries Rápidos
```bash
# Verificar conexión DEV
wsl PGPASSWORD='WorkingHard100%' psql -h aws-1-us-east-1.pooler.supabase.com -p 5432 -U postgres.gbfgvdqqvxmklfdrhdqq -d postgres -c "SELECT version();"

# Listar migraciones DEV
wsl PGPASSWORD='WorkingHard100%' psql -h aws-1-us-east-1.pooler.supabase.com -p 5432 -U postgres.gbfgvdqqvxmklfdrhdqq -d postgres -c "SELECT version, name FROM supabase_migrations.schema_migrations ORDER BY version;"

# Listar migraciones UAT
wsl PGPASSWORD='WorkingHard100%' psql -h aws-1-us-east-1.pooler.supabase.com -p 5432 -U postgres.wxghopuefrdszebgrclv -d postgres -c "SELECT version, name FROM supabase_migrations.schema_migrations ORDER BY version;"

# Comparar migraciones DEV vs UAT
wsl PGPASSWORD='WorkingHard100%' psql -h aws-1-us-east-1.pooler.supabase.com -p 5432 -U postgres.gbfgvdqqvxmklfdrhdqq -d postgres -t -c "SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;" > /tmp/dev_migrations.txt && \
wsl PGPASSWORD='WorkingHard100%' psql -h aws-1-us-east-1.pooler.supabase.com -p 5432 -U postgres.wxghopuefrdszebgrclv -d postgres -t -c "SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;" > /tmp/uat_migrations.txt && \
comm -23 /tmp/dev_migrations.txt /tmp/uat_migrations.txt
```

### Dump de Schema UAT
```bash
# Dump completo del schema UAT para testing local
wsl bash -c "PGPASSWORD='WorkingHard100%' pg_dump \
  -h aws-1-us-east-1.pooler.supabase.com \
  -p 5432 \
  -U postgres.wxghopuefrdszebgrclv \
  -d postgres \
  --schema-only \
  --no-owner \
  --no-privileges \
  -n public \
  -n supabase_migrations \
  > /tmp/uat_schema.sql"
```

---

## MCP Supabase Configuration

El archivo `settings.local.json` ya está configurado con el token DEV. Para usar MCP:

```typescript
// DEV (default - Lectura + Escritura)
mcp__supabase__list_tables({ project_id: "gbfgvdqqvxmklfdrhdqq" })
mcp__supabase__execute_sql({ project_id: "gbfgvdqqvxmklfdrhdqq", query: "SELECT ..." })
mcp__supabase__apply_migration({ project_id: "gbfgvdqqvxmklfdrhdqq", name: "...", query: "..." })
mcp__supabase__list_migrations({ project_id: "gbfgvdqqvxmklfdrhdqq" })

// UAT (SOLO LECTURA)
mcp__supabase__list_tables({ project_id: "wxghopuefrdszebgrclv" })
mcp__supabase__execute_sql({ project_id: "wxghopuefrdszebgrclv", query: "SELECT ..." })
mcp__supabase__list_migrations({ project_id: "wxghopuefrdszebgrclv" })
// ❌ PROHIBIDO: apply_migration en UAT
```

---

## Variables de Entorno

### DEV
```env
NEXT_PUBLIC_SUPABASE_URL=https://gbfgvdqqvxmklfdrhdqq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZmd2ZHFxdnhta2xmZHJoZHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MDU0MTMsImV4cCI6MjA3NzE4MTQxM30.LmRlWxVzxp0dNNb8Hv5TqWxdGrh0fQv5vLh_LLmLBSU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZmd2ZHFxdnhta2xmZHJoZHFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTYwNTQxMywiZXhwIjoyMDc3MTgxNDEzfQ.E-FKakWDmliw0MkTVS5oj0WZOUqY8JBJ0uXdhkk_yMk
```

### UAT
```env
NEXT_PUBLIC_SUPABASE_URL=https://wxghopuefrdszebgrclv.supabase.co
# ANON_KEY y SERVICE_ROLE_KEY: obtener desde dashboard de UAT si es necesario
```

---

## Reglas de Uso

### DEV (gbfgvdqqvxmklfdrhdqq)
- Desarrollo activo
- Aplicar migraciones
- Testing destructivo permitido
- Modificar datos de prueba

### UAT (wxghopuefrdszebgrclv)
- **SOLO LECTURA** - NO modificar
- Validar que migraciones funcionan
- Comparar schema con DEV
- QA y testing de integración
- Dump de schema para ambiente efímero

---

## Agentes con Acceso a BD

Los siguientes agentes deben referenciar este archivo:

| Agente | Uso Principal | Ambiente |
|--------|---------------|----------|
| `@db-integration` | Migraciones, queries, RLS | DEV + UAT (lectura) |
| `@arquitecto` | Validación de schemas | DEV + UAT (lectura) |
| `@testing-expert` | Testing E2E, validación | DEV + UAT (lectura) |
| `@security-qa` | Auditoría de RLS | DEV + UAT (lectura) |
| `@fullstack-dev` | Queries de diagnóstico | DEV (lectura) |

---

**Actualizado**: 2025-12-16
**Mantenido por**: PODENZA Development Team
