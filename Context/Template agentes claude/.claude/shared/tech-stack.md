# TECH STACK PODENZA - Referencia Compartida

Este documento es la referencia técnica compartida para todos los agentes del equipo PODENZA.

## 🏗️ ARQUITECTURA GENERAL

**Tipo**: Plataforma SaaS Multi-Tenant
**Objetivo**: Gestión de solicitudes de crédito optimizada para +1000 transacciones por hora
**Deployment**: Vercel (Frontend + Edge) + Supabase (Backend + DB)

---

## 📦 FRONTEND STACK

### Framework Core
```json
{
  "next": "15.1.7",          // App Router, React Server Components, Edge Runtime
  "react": "19.0.0",         // UI Library principal
  "typescript": "5.7.3"      // Tipado estático estricto
}
```

### UI/UX System
```json
{
  "tailwindcss": "4.0.6",              // Utility-first CSS framework
  "@radix-ui/react-*": "latest",       // Primitivos de UI accesibles
  "lucide-react": "latest",            // Iconografía
  "sonner": "latest"                   // Toast notifications
}
```

**Shadcn/UI**: Sistema de componentes basado en Radix UI (no es una librería npm)
- Ubicación: `packages/ui/src/components/`
- Configuración: `components.json`

### State Management
```json
{
  "@tanstack/react-query": "5.64.1",   // Server state management
  "react-hook-form": "7.54.2",         // Form state management
  "zod": "3.24.2",                     // Schema validation
  "react-i18next": "15.4.0"            // Internationalization
}
```

### Build & Tooling
```json
{
  "turbo": "latest",         // Monorepo build system
  "eslint": "latest",        // Linting
  "prettier": "latest"       // Code formatting
}
```

---

## 🗄️ BACKEND STACK

### Supabase (Backend as a Service)
```yaml
Database: PostgreSQL 15+
Authentication: Supabase Auth (JWT)
Storage: Supabase Storage
Realtime: Supabase Realtime (WebSocket)
Edge Functions: Deno runtime
```

### Extensions Habilitadas
```sql
uuid-ossp      -- UUID generation
unaccent       -- Text search sin acentos
pg_trgm        -- Fuzzy text search
btree_gin      -- Índices GIN compuestos
```

### API Layer
```typescript
// Next.js API Routes (App Router)
app/api/
├── route.ts           // GET, POST, PUT, DELETE handlers
└── [dynamic]/
    └── route.ts       // Dynamic routes
```

---

## 🎨 BRANDING SYSTEM

### Colores Principales (OBLIGATORIO)
```css
/* Variables CSS - SIEMPRE usar estas */
:root {
  --podenza-green: #E7FF8C;        /* 60% - Elementos de marca */
  --podenza-green-hover: #d4f070;
  --podenza-orange: #FF931E;       /* 10% - CTAs críticos */
  --podenza-orange-hover: #e68419;
  --podenza-dark: #2C3E2B;         /* 30% - Texto y estructura */

  /* Colores de estado */
  --podenza-success: #10b981;
  --podenza-warning: #f59e0b;
  --podenza-error: #ef4444;
  --podenza-info: #3b82f6;
}
```

### Clases Utility
```css
/* Botones */
.btn-podenza-primary       /* Verde PODENZA - acción principal */
.btn-podenza-secondary     /* Naranja - CTAs críticos */
.btn-podenza-outline       /* Outline con colores PODENZA */

/* Estados activos */
.active-podenza            /* Verde PODENZA para items activos */

/* Backgrounds */
.bg-podenza-green
.bg-podenza-orange
.bg-podenza-dark

/* Text */
.text-podenza-dark
```

### Typography
```css
/* Headings */
h1: text-3xl font-bold text-podenza-dark
h2: text-2xl font-semibold text-podenza-dark
h3: text-xl font-semibold text-podenza-dark

/* Body */
p: text-base text-gray-700
small: text-sm text-gray-600
```

---

## 🗄️ DATABASE ARCHITECTURE

### Multi-Tenant Isolation
```sql
-- TODAS las tablas DEBEN seguir este patrón
CREATE TABLE example_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    -- ... otros campos

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES accounts(id),
    updated_by UUID REFERENCES accounts(id)
);

-- Índice obligatorio
CREATE INDEX idx_example_org ON example_table(organization_id);

-- RLS Policy obligatoria
ALTER TABLE example_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON example_table
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id
            FROM accounts
            WHERE id = auth.uid() AND is_active = true
        )
    );
```

### Tablas Core
```sql
organizations         -- Tenants (clientes de PODENZA)
accounts             -- Usuarios (multi-tenant aware)
solicitudes          -- Solicitudes de crédito (PARTITIONED)
documentos           -- Documentos adjuntos
audit_logs           -- Audit trail (PARTITIONED por fecha)
conversations        -- Chat (si módulo chat está habilitado)
messages             -- Mensajes de chat (PARTITIONED)
```

### Performance Optimization
```sql
-- Particionado para tablas grandes (>1M rows esperado)
PARTITION BY RANGE (created_at)    -- Para logs, mensajes
PARTITION BY HASH (organization_id) -- Para solicitudes

-- Índices parciales para queries frecuentes
CREATE INDEX idx_solicitudes_activas
    ON solicitudes (organization_id, estado, created_at DESC)
    WHERE estado IN ('viabilidad', 'viable', 'pre_aprobado');
```

---

## 🔐 SECURITY STACK

### Authentication (Supabase Auth)
```typescript
// JWT Tokens con refresh automático
// Session management
// Multi-provider support: email/password, OAuth
// MFA ready (TOTP)
```

### Authorization (Row Level Security)
```sql
-- Todas las tablas usan RLS para tenant isolation
-- Policies por operación: SELECT, INSERT, UPDATE, DELETE
-- Verificación automática de organization_id
```

### Validation
```typescript
// Frontend: Zod + React Hook Form
// Backend: Zod en API routes
// Database: Constraints y triggers
```

---

## 🔌 INTEGRATIONS STACK

### Planeadas/En Desarrollo

#### Banking APIs
```typescript
// mTLS para conexiones seguras
// Retry logic con exponential backoff
// Webhook handlers con signature validation

providers: [
  'bancolombia',
  'davivienda',
  'bbva',
  'banco-de-bogota'
]
```

#### Communication
```typescript
// WhatsApp Business API: Mensajería
// Sendgrid/Resend: Emails transaccionales
// SMS: Backup para notificaciones críticas
```

#### AI Services
```typescript
providers: {
  openai: 'gpt-4-vision-preview',        // OCR, análisis visual
  anthropic: 'claude-3-5-sonnet',        // Decisiones, texto
  google: 'gemini-1.5-pro'               // Fallback
}
```

#### Risk Assessment
```typescript
// AUCO: Centrales de riesgo Colombia
// Firma digital de documentos
// Consultas de historial crediticio
```

---

## 🧪 TESTING STACK

### Unit Testing
```json
{
  "jest": "latest",                      // Test runner
  "@testing-library/react": "latest",    // React testing utilities
  "@testing-library/jest-dom": "latest"  // Custom matchers
}
```

### E2E Testing
```json
{
  "@playwright/test": "latest"           // E2E testing framework
}
```

### Load Testing
```yaml
Tool: k6 (Grafana)
Target: 1000+ TPS
Metrics: p95 < 500ms
```

---

## 📁 PROJECT STRUCTURE

```
PODENZA/
├── apps/
│   ├── web/                    # Next.js App Principal
│   │   ├── app/               # App Router
│   │   │   ├── (marketing)/  # Páginas públicas
│   │   │   ├── auth/          # Autenticación
│   │   │   ├── home/          # Área protegida
│   │   │   ├── api/           # API Routes
│   │   │   └── globals.css    # Estilos globales
│   │   ├── components/        # Componentes compartidos
│   │   ├── lib/               # Utilidades
│   │   └── config/            # Configuración
│   └── e2e/                   # Tests Playwright
│
├── packages/
│   ├── features/              # Módulos de funcionalidad
│   │   ├── auth/
│   │   ├── solicitudes/
│   │   ├── chat/              # (si habilitado)
│   │   └── ...
│   ├── ui/                    # Sistema de componentes (Shadcn/UI)
│   ├── supabase/             # Cliente Supabase
│   ├── auth/                 # Lógica de autenticación
│   ├── integrations/         # Integraciones externas
│   ├── ai/                   # Servicios de IA
│   └── shared/               # Utilidades compartidas
│
├── tooling/                  # Configuraciones compartidas
│   ├── eslint/
│   ├── typescript/
│   └── tailwind/
│
├── Context/                  # Documentación técnica
│   └── Rules/               # Context engineering
│
└── .claude/                 # Agentes y workflows
    ├── agents/
    ├── workflows/
    └── shared/
```

---

## 🚀 DEPLOYMENT STACK

### Vercel (Frontend & Edge)
```yaml
Framework: Next.js
Node Version: 18+
Build Command: turbo build
Serverless Functions: Auto-scaling
Edge Runtime: Enabled
CDN: Global
```

### Supabase (Backend & Database)
```yaml
Database: PostgreSQL 15+ (managed)
Region: [configurar según usuario]
Backup: Automated daily
PITR: Enabled (Point-in-time recovery)
```

### CI/CD
```yaml
Platform: GitHub Actions
Triggers:
  - Push to main → Deploy to production
  - Push to develop → Deploy to staging
  - Pull Request → Preview deployment

Pipeline:
  1. Lint & Type Check
  2. Unit Tests
  3. Build
  4. E2E Tests (staging only)
  5. Deploy
  6. Smoke Tests
```

---

## 📊 MONITORING STACK

### Error Tracking
```yaml
Tool: Sentry (planeado)
Coverage: Frontend + Backend
Alerts: Critical errors → Slack/Email
```

### Performance Monitoring
```yaml
Metrics:
  - Response time (p50, p95, p99)
  - Database query time
  - API endpoint latency
  - Bundle size
  - Core Web Vitals

Targets:
  - p95 response time: < 500ms
  - Time to Interactive: < 3s
  - First Contentful Paint: < 1.5s
```

### Business Metrics
```yaml
Dashboard:
  - Solicitudes activas por estado
  - Conversión por etapa
  - Tiempo promedio de proceso
  - Aprobaciones vs rechazos
  - Volumen por organización (tenant)
```

---

## 🔧 DEVELOPMENT WORKFLOW

### Local Development
```bash
# Instalar dependencias
pnpm install

# Configurar env vars
cp .env.example .env.local
# Editar .env.local con credenciales

# Iniciar dev server
pnpm dev

# Abrir: http://localhost:3000
```

### Environment Variables Required
```bash
# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_PRODUCT_NAME=PODENZA

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role

# Features
NEXT_PUBLIC_ENABLE_CHAT=false          # true si módulo chat habilitado
NEXT_PUBLIC_ENABLE_MOCK_DATA=false     # true en dev sin DB

# AI (si aplica)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...

# Integraciones (cuando se implementen)
BANCOLOMBIA_API_URL=...
BANCOLOMBIA_API_KEY=...
WHATSAPP_API_URL=...
WHATSAPP_API_KEY=...
```

---

## 📚 REFERENCIAS RÁPIDAS

### Documentación Oficial
- Next.js: https://nextjs.org/docs
- React: https://react.dev
- Supabase: https://supabase.com/docs
- Tailwind: https://tailwindcss.com/docs
- Shadcn/UI: https://ui.shadcn.com
- TanStack Query: https://tanstack.com/query/latest
- Zod: https://zod.dev

### Contexto Interno (SIEMPRE LEER PRIMERO)
- `/Context/Rules/Arquitectura.md` - Arquitectura completa
- `/Context/Rules/Branding.md` - Sistema de diseño
- `/Context/Rules/Seguridad-y-Reglas.md` - Security guidelines
- `/Context/Rules/Plan-de-Trabajo.md` - Roadmap y tareas

---

**Versión**: 1.0
**Última actualización**: 2025-01-23
**Mantenido por**: PODENZA Development Team
