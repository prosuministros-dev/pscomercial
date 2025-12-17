# STACK TECNOLÓGICO - PS COMERCIAL

## Resumen del Stack

| Categoría | Tecnología | Versión | Uso |
|-----------|------------|---------|-----|
| Framework | Next.js | 15.5.7 | App Router, SSR, API Routes |
| Runtime | Node.js | 20+ | Backend runtime |
| Language | TypeScript | 5.x | Tipado estático |
| Styling | Tailwind CSS | 3.x | Utility-first CSS |
| UI Library | Shadcn/UI | Latest | Componentes base |
| Database | Supabase | Latest | PostgreSQL + Auth + Storage |
| Validation | Zod | 3.x | Schema validation |
| Forms | React Hook Form | 7.x | Form management |
| State | TanStack Query | 5.x | Server state management |
| Monorepo | Turborepo | Latest | Build system |
| Package Manager | pnpm | 8.x | Dependency management |

## Detalles del Stack

### Frontend

#### Next.js 15
```typescript
// App Router - Server Components por defecto
// app/home/[account]/leads/page.tsx
export default async function LeadsPage({ params }) {
  const leads = await getLeads(params.account);
  return <LeadsList initialData={leads} />;
}

// Client Components cuando se necesita interactividad
'use client';
export function LeadForm() {
  const [state, setState] = useState();
  // ...
}
```

#### Tailwind CSS
```typescript
// Clases utility para estilos
<div className="flex items-center justify-between p-4 bg-card rounded-lg shadow">
  <h2 className="text-xl font-semibold">Título</h2>
  <Button variant="outline" size="sm">Acción</Button>
</div>
```

#### Shadcn/UI (via @kit/ui)
```typescript
// Componentes disponibles
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Card, CardHeader, CardContent } from '@kit/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@kit/ui/table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@kit/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@kit/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@kit/ui/form';
import { Badge } from '@kit/ui/badge';
import { Spinner } from '@kit/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@kit/ui/tooltip';
```

### Backend / Data Layer

#### Supabase
```typescript
// Server Client (Server Components, Server Actions)
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function getLeads(organizationId: string) {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('leads')
    .select('*, asesor:users!asesor_id(id, name)')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Browser Client (Client Components)
import { useSupabase } from '@kit/supabase/hooks/use-supabase';

function MyComponent() {
  const client = useSupabase();
  // ...
}
```

#### Zod Validation
```typescript
import { z } from 'zod';

export const leadSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  telefono: z.string().regex(/^\+?[0-9\s-]{7,15}$/, 'Teléfono inválido'),
  email: z.string().email().optional().or(z.literal('')),
  organization_id: z.string().uuid(),
});

export type Lead = z.infer<typeof leadSchema>;
```

#### React Hook Form
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leadSchema, type Lead } from '../schema/lead.schema';

function LeadForm() {
  const form = useForm<Lead>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      nombre: '',
      telefono: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

#### TanStack Query (React Query)
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query
export function useLeads(organizationId: string) {
  return useQuery({
    queryKey: ['leads', organizationId],
    queryFn: () => fetchLeads(organizationId),
    staleTime: 30000, // 30 segundos
  });
}

// Mutation con invalidación
export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLead,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['leads', variables.organization_id]
      });
    },
  });
}
```

### Estructura del Monorepo

```
pscomercial/
├── apps/
│   └── web/                    # App Next.js principal
│       ├── app/               # App Router
│       ├── lib/               # Código por feature
│       ├── components/        # Componentes globales
│       └── public/            # Assets estáticos
├── packages/
│   ├── ui/                    # Componentes Shadcn/UI
│   ├── supabase/             # Cliente Supabase
│   ├── features/             # Features compartidos
│   └── config/               # Configuraciones
├── supabase/
│   ├── migrations/           # Migraciones SQL
│   └── functions/            # Edge Functions
├── Context/                   # Documentación
│   ├── HU/                   # Historias de Usuario
│   ├── .MD/                  # Docs generados
│   └── Testing/              # Reportes de testing
├── .claude/                   # Configuración de agentes
├── turbo.json                # Config Turborepo
├── pnpm-workspace.yaml       # Workspaces pnpm
└── package.json              # Root package
```

## Configuración de Supabase

### Credenciales
```env
# apps/web/.env.development
NEXT_PUBLIC_SUPABASE_URL=https://zsauumglbhindsplazpk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_g4Zfm_uc8TuykpxWdaFCmw_MMY2geKT
SUPABASE_SERVICE_ROLE_KEY= # Solo backend
```

### MCP Supabase
```javascript
// Project ID para MCP
const SUPABASE_PROJECT_ID = "zsauumglbhindsplazpk";

// Comandos principales
mcp__supabase__list_tables({ project_id: SUPABASE_PROJECT_ID })
mcp__supabase__apply_migration({ project_id: SUPABASE_PROJECT_ID, name: "...", query: "..." })
mcp__supabase__execute_sql({ project_id: SUPABASE_PROJECT_ID, query: "..." })
```

## Comandos de Desarrollo

### Iniciar Desarrollo
```bash
# Instalar dependencias
pnpm install

# Iniciar dev server
pnpm dev

# La app corre en http://localhost:3000
```

### Build y Lint
```bash
# Build de producción
pnpm build

# Verificar tipos TypeScript
pnpm typecheck

# Ejecutar linter
pnpm lint

# Formatear código
pnpm format
```

### Testing
```bash
# Ejecutar todos los tests
pnpm test

# Test específico
pnpm test -- leads.test.ts

# Test con coverage
pnpm test -- --coverage
```

## Patrones de Código

### Patrón de Feature Module
```
lib/[feature]/
├── components/          # UI components
├── hooks/              # Custom hooks
├── lib/                # Business logic
│   ├── queries.ts     # Read operations
│   ├── mutations.ts   # Write operations
│   └── utils.ts       # Utilities
└── schema/             # Zod schemas + types
```

### Patrón de Queries
```typescript
// Siempre incluir organization_id
export async function getItems(organizationId: string, filters?: Filters) {
  const client = getSupabaseServerClient();

  let query = client
    .from('items')
    .select('*')
    .eq('organization_id', organizationId);

  // Aplicar filtros
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw new Error(`Error: ${error.message}`);
  return data;
}
```

### Patrón de Componente
```tsx
'use client';

import { useState } from 'react';

interface MyComponentProps {
  initialData: Item[];
  onUpdate?: () => void;
}

export function MyComponent({ initialData, onUpdate }: MyComponentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Loading state
  if (isLoading) {
    return <Spinner />;
  }

  // Error state
  if (error) {
    return <ErrorMessage message={error} />;
  }

  // Empty state
  if (!initialData.length) {
    return <EmptyState />;
  }

  // Success state
  return (
    <div>
      {/* Content */}
    </div>
  );
}
```

## Iconografía

Usar Lucide React para iconos:
```typescript
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  User,
  Users,
  Building,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
} from 'lucide-react';

// Tamaños estándar
<Icon className="h-4 w-4" />  // Inline, botones pequeños
<Icon className="h-5 w-5" />  // Navegación, acciones
<Icon className="h-6 w-6" />  // Headers, destacados
```

---

**Versión**: 1.0
**Proyecto**: PS Comercial
