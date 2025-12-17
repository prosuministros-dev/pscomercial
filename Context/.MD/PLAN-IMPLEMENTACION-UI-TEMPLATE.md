# PLAN DE IMPLEMENTACIÓN - UI TEMPLATE PROSUMINISTROS CRM

> **Documento**: Plan de Adaptación de MakerKit al Template UI del Cliente
> **Fecha**: 2025-01-XX
> **Estado**: PENDIENTE APROBACIÓN
> **Autores**: @arquitecto, @designer-ux-ui

---

## RESUMEN EJECUTIVO

Este documento detalla el plan completo para adaptar el template MakerKit SaaS Starter Kit Lite al diseño visual y funcional del template Prosuministros CRM proporcionado por el cliente.

### Cambio Principal
| Aspecto | MakerKit (Actual) | Template Cliente (Objetivo) |
|---------|-------------------|------------------------------|
| **Layout** | Sidebar izquierdo vertical | Navegación horizontal superior |
| **Colores** | Neutral/Grises | Cyan #00C8CF + Navy #161052 |
| **Estilo** | Minimalista | Glass morphism + Gradientes |

---

## FASE 1: SISTEMA DE COLORES Y TOKENS

### 1.1 Paleta de Colores a Implementar

```css
/* COLORES PROSUMINISTROS - A aplicar en shadcn-ui.css */

/* Primario - Cyan corporativo */
--primary: #00C8CF;
--primary-foreground: #FFFFFF;

/* Secundario - Navy oscuro (Accent) */
--accent: #161052;
--accent-foreground: #FFFFFF;

/* Destructivo */
--destructive: #ff3b30;
--destructive-foreground: #FFFFFF;

/* Estados de Lead */
--lead-pendiente: #f59e0b;      /* Amber */
--lead-en-gestion: #3b82f6;     /* Blue */
--lead-convertido: #10b981;     /* Emerald */
--lead-descartado: #6b7280;     /* Gray */

/* Estados de Cotización */
--cotizacion-borrador: #6b7280;
--cotizacion-enviada: #3b82f6;
--cotizacion-aprobada: #10b981;
--cotizacion-rechazada: #ef4444;
--cotizacion-vencida: #f59e0b;

/* Gradiente Brand */
--gradient-brand: linear-gradient(135deg, #00C8CF 0%, #161052 100%);
```

### 1.2 Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `apps/web/styles/shadcn-ui.css` | Reemplazar variables CSS completas |
| `apps/web/styles/theme.css` | Agregar nuevos tokens y animaciones |
| `apps/web/styles/globals.css` | Importar nuevos estilos si es necesario |

### 1.3 Variables CSS Completas (Light Mode)

```css
:root {
  /* Fondos */
  --background: #ffffff;
  --foreground: #161052;

  /* Cards */
  --card: #ffffff;
  --card-foreground: #161052;

  /* Popovers */
  --popover: #ffffff;
  --popover-foreground: #161052;

  /* Primario - Cyan */
  --primary: #00C8CF;
  --primary-foreground: #ffffff;

  /* Secundario */
  --secondary: #f3f4f6;
  --secondary-foreground: #161052;

  /* Muted */
  --muted: #f9fafb;
  --muted-foreground: #6b7280;

  /* Accent - Navy */
  --accent: #161052;
  --accent-foreground: #ffffff;

  /* Destructivo */
  --destructive: #ff3b30;
  --destructive-foreground: #ffffff;

  /* Bordes e inputs */
  --border: #e5e7eb;
  --input: #e5e7eb;
  --ring: #00C8CF;

  /* Radius */
  --radius: 0.75rem; /* 12px - más redondeado */

  /* Charts */
  --chart-1: #00C8CF;
  --chart-2: #161052;
  --chart-3: #10b981;
  --chart-4: #f59e0b;
  --chart-5: #ef4444;
}
```

### 1.4 Variables CSS Completas (Dark Mode)

```css
.dark {
  --background: #0f0f23;
  --foreground: #f9fafb;

  --card: #1a1a3e;
  --card-foreground: #f9fafb;

  --popover: #1a1a3e;
  --popover-foreground: #f9fafb;

  --primary: #00C8CF;
  --primary-foreground: #0f0f23;

  --secondary: #2a2a5e;
  --secondary-foreground: #f9fafb;

  --muted: #1f1f4a;
  --muted-foreground: #9ca3af;

  --accent: #00C8CF;
  --accent-foreground: #0f0f23;

  --destructive: #ff453a;
  --destructive-foreground: #ffffff;

  --border: #2a2a5e;
  --input: #2a2a5e;
  --ring: #00C8CF;
}
```

---

## FASE 2: CAMBIO DE LAYOUT (SIDEBAR → TOP NAV)

### 2.1 Arquitectura Actual vs Objetivo

```
MAKERKIT ACTUAL:
┌─────────┬────────────────────────────────┐
│ SIDEBAR │                                │
│  Logo   │         CONTENT AREA           │
│  Nav    │                                │
│  Items  │                                │
│  User   │                                │
└─────────┴────────────────────────────────┘

OBJETIVO (PROSUMINISTROS):
┌──────────────────────────────────────────┐
│  Logo   [Nav Items centrados]     User   │
├──────────────────────────────────────────┤
│                                          │
│              CONTENT AREA                │
│                                          │
└──────────────────────────────────────────┘
```

### 2.2 Archivos Principales a Modificar

| Archivo | Acción | Prioridad |
|---------|--------|-----------|
| `apps/web/app/home/layout.tsx` | Forzar `style='header'` como default | ALTA |
| `apps/web/config/navigation.config.tsx` | Agregar rutas de módulos PS Comercial | ALTA |
| `packages/ui/src/makerkit/page.tsx` | Modificar `PageWithHeader` para nuevo diseño | ALTA |
| `apps/web/app/home/_components/home-menu-navigation.tsx` | Rediseñar completamente | ALTA |
| `apps/web/app/home/_components/home-mobile-navigation.tsx` | Adaptar para móvil | MEDIA |

### 2.3 Nuevo Componente: TopNavigation

Crear nuevo componente basado en el template del cliente:

**Ubicación**: `apps/web/app/home/_components/top-navigation.tsx`

**Estructura**:
```tsx
// Componente principal de navegación superior
export function TopNavigation() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b bg-background/80 backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center">
          <AppLogo />
        </div>

        {/* Navegación Central - Desktop */}
        <nav className="hidden md:flex items-center space-x-1">
          <NavItem href="/home" icon={Home}>Dashboard</NavItem>
          <NavItem href="/home/leads" icon={Users}>Leads</NavItem>
          <NavItem href="/home/cotizaciones" icon={FileText}>Cotizaciones</NavItem>
          <NavItem href="/home/pedidos" icon={ShoppingCart}>Pedidos</NavItem>
          <NavItem href="/home/financiero" icon={DollarSign}>Financiero</NavItem>
          <NavItem href="/home/whatsapp" icon={MessageCircle}>WhatsApp</NavItem>
          <NavItem href="/home/admin" icon={Settings}>Admin</NavItem>
        </nav>

        {/* Acciones - Derecha */}
        <div className="flex items-center space-x-2">
          <NotificationsButton />
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
```

### 2.4 Rutas de Navegación a Configurar

```tsx
// apps/web/config/navigation.config.tsx
const routes = [
  {
    label: 'Dashboard',
    path: '/home',
    Icon: <Home className="w-4 h-4" />,
    end: true,
  },
  {
    label: 'Leads',
    path: '/home/leads',
    Icon: <Users className="w-4 h-4" />,
  },
  {
    label: 'Cotizaciones',
    path: '/home/cotizaciones',
    Icon: <FileText className="w-4 h-4" />,
  },
  {
    label: 'Pedidos',
    path: '/home/pedidos',
    Icon: <ShoppingCart className="w-4 h-4" />,
  },
  {
    label: 'Financiero',
    path: '/home/financiero',
    Icon: <DollarSign className="w-4 h-4" />,
  },
  {
    label: 'WhatsApp',
    path: '/home/whatsapp',
    Icon: <MessageCircle className="w-4 h-4" />,
  },
  {
    label: 'Admin',
    path: '/home/admin',
    Icon: <Settings className="w-4 h-4" />,
  },
];
```

### 2.5 Responsive Design

| Breakpoint | Comportamiento |
|------------|----------------|
| `< 768px` (mobile) | Menú hamburguesa + navegación inferior compacta |
| `>= 768px` (tablet) | Navegación horizontal con iconos |
| `>= 1024px` (desktop) | Navegación horizontal con iconos + texto |

---

## FASE 3: COMPONENTES UI PERSONALIZADOS

### 3.1 Componentes a Crear

| Componente | Ubicación | Descripción |
|------------|-----------|-------------|
| `TopNavigation` | `app/home/_components/` | Barra de navegación superior |
| `NavItem` | `app/home/_components/` | Item de navegación con active state |
| `NotificationsPanel` | `lib/notifications/components/` | Panel lateral de notificaciones |
| `NotificationBadge` | `lib/notifications/components/` | Badge contador de notificaciones |
| `KanbanBoard` | `lib/shared/components/` | Vista Kanban genérica |
| `KanbanColumn` | `lib/shared/components/` | Columna de Kanban |
| `KanbanCard` | `lib/shared/components/` | Tarjeta de Kanban |
| `StatusBadge` | `lib/shared/components/` | Badge de estado con colores |
| `GradientCard` | `lib/shared/components/` | Card con gradiente brand |
| `StatCard` | `lib/shared/components/` | Card de estadística para dashboard |

### 3.2 Componentes Shadcn a Personalizar

Los siguientes componentes de `packages/ui/src/shadcn/` requieren ajustes de estilo:

| Componente | Cambios |
|------------|---------|
| `button.tsx` | Gradiente en variante primary, hover effects |
| `card.tsx` | Border radius 12px, sombras suaves |
| `badge.tsx` | Nuevos colores de estado |
| `dialog.tsx` | Glass morphism en overlay |
| `sheet.tsx` | Backdrop blur para panel notificaciones |
| `tabs.tsx` | Estilo de tabs del template |
| `table.tsx` | Hover rows, bordes sutiles |
| `input.tsx` | Focus ring con color primary |

### 3.3 Estilos de Botón

```tsx
// Variantes a agregar/modificar en button.tsx
const buttonVariants = cva(
  "...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        gradient: "bg-gradient-to-r from-[#00C8CF] to-[#161052] text-white hover:opacity-90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        // ... otros
      }
    }
  }
);
```

---

## FASE 4: SISTEMA DE NOTIFICACIONES

### 4.1 Componentes Requeridos

```
lib/notifications/
├── components/
│   ├── notifications-button.tsx      # Botón con badge
│   ├── notifications-panel.tsx       # Sheet lateral
│   ├── notification-item.tsx         # Item individual
│   └── notification-filters.tsx      # Filtros de tipo/fecha
├── hooks/
│   └── use-notifications.ts          # Hook para obtener notificaciones
├── lib/
│   └── queries.ts                    # Queries de Supabase
└── schema/
    └── notification.schema.ts        # Tipos y validación
```

### 4.2 Estructura del Panel

```tsx
// Agrupación por fecha como en el template
interface NotificationGroup {
  label: 'Hoy' | 'Ayer' | 'Esta semana' | 'Anteriores';
  notifications: Notification[];
}

// Tipos de notificación
type NotificationType =
  | 'nuevo_lead'
  | 'cotizacion_aprobada'
  | 'cotizacion_rechazada'
  | 'pago_recibido'
  | 'alerta_seguimiento'
  | 'sistema';
```

### 4.3 Iconos por Tipo

| Tipo | Icono | Color |
|------|-------|-------|
| `nuevo_lead` | UserPlus | primary |
| `cotizacion_aprobada` | CheckCircle | green |
| `cotizacion_rechazada` | XCircle | red |
| `pago_recibido` | DollarSign | green |
| `alerta_seguimiento` | AlertCircle | amber |
| `sistema` | Info | blue |

---

## FASE 5: VISTAS KANBAN Y TABLA

### 5.1 Componente Kanban Genérico

```tsx
// lib/shared/components/kanban/
interface KanbanProps<T> {
  items: T[];
  columns: KanbanColumnConfig[];
  onDragEnd: (result: DropResult) => void;
  renderCard: (item: T) => React.ReactNode;
}

interface KanbanColumnConfig {
  id: string;
  title: string;
  color: string;
  maxItems?: number;
}
```

### 5.2 Configuración por Módulo

**Leads Kanban:**
```ts
const leadsColumns = [
  { id: 'pendiente', title: 'Pendientes', color: 'amber' },
  { id: 'en_gestion', title: 'En Gestión', color: 'blue' },
  { id: 'convertido', title: 'Convertidos', color: 'green' },
  { id: 'descartado', title: 'Descartados', color: 'gray' },
];
```

**Cotizaciones Kanban:**
```ts
const cotizacionesColumns = [
  { id: 'borrador', title: 'Borradores', color: 'gray' },
  { id: 'enviada', title: 'Enviadas', color: 'blue' },
  { id: 'aprobada', title: 'Aprobadas', color: 'green' },
  { id: 'rechazada', title: 'Rechazadas', color: 'red' },
  { id: 'vencida', title: 'Vencidas', color: 'amber' },
];
```

### 5.3 Toggle Vista Tabla/Kanban

Agregar componente `ViewToggle` en cada módulo que lo requiera:

```tsx
<div className="flex items-center space-x-2">
  <Button
    variant={view === 'table' ? 'default' : 'outline'}
    size="sm"
    onClick={() => setView('table')}
  >
    <List className="w-4 h-4 mr-1" />
    Tabla
  </Button>
  <Button
    variant={view === 'kanban' ? 'default' : 'outline'}
    size="sm"
    onClick={() => setView('kanban')}
  >
    <Columns className="w-4 h-4 mr-1" />
    Kanban
  </Button>
</div>
```

---

## FASE 6: PÁGINAS Y RUTAS

### 6.1 Estructura de Carpetas a Crear

```
apps/web/app/home/
├── page.tsx                          # Dashboard (existente, modificar)
├── layout.tsx                        # Layout (existente, modificar)
├── leads/
│   ├── page.tsx                      # Lista/Kanban de leads
│   ├── [id]/
│   │   └── page.tsx                  # Detalle de lead
│   └── nuevo/
│       └── page.tsx                  # Crear lead
├── cotizaciones/
│   ├── page.tsx
│   ├── [id]/
│   │   └── page.tsx
│   └── nueva/
│       └── page.tsx
├── pedidos/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
├── financiero/
│   └── page.tsx
├── whatsapp/
│   └── page.tsx
├── admin/
│   ├── page.tsx
│   ├── usuarios/
│   │   └── page.tsx
│   └── configuracion/
│       └── page.tsx
└── analytics/
    └── page.tsx
```

### 6.2 Prioridad de Implementación de Páginas

| Prioridad | Página | HU Relacionada |
|-----------|--------|----------------|
| 1 | Dashboard | - |
| 2 | Leads (lista/kanban) | HU-0001 |
| 3 | Lead detalle | HU-0001 |
| 4 | Cotizaciones (lista/kanban) | HU-0003 |
| 5 | Cotización detalle | HU-0003 |
| 6 | Admin usuarios | HU-0011 |
| 7 | Pedidos | HU-0006 |
| 8 | Financiero | - |
| 9 | WhatsApp | HU-0012 |
| 10 | Analytics | HU-0010 |

---

## FASE 7: DARK MODE Y GRADIENTES

### 7.1 Gradientes a Implementar

```css
/* En theme.css o nuevo archivo gradients.css */

/* Gradiente principal de marca */
.gradient-brand {
  background: linear-gradient(135deg, #00C8CF 0%, #161052 100%);
}

/* Gradiente para texto */
.gradient-text-brand {
  background: linear-gradient(135deg, #00C8CF 0%, #161052 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Gradiente suave para cards */
.gradient-card {
  background: linear-gradient(180deg, rgba(0, 200, 207, 0.05) 0%, rgba(22, 16, 82, 0.05) 100%);
}

/* Dark mode gradients */
.dark .gradient-card {
  background: linear-gradient(180deg, rgba(0, 200, 207, 0.1) 0%, rgba(22, 16, 82, 0.2) 100%);
}
```

### 7.2 Glass Morphism

```css
/* Efecto glass para headers y modals */
.glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.dark .glass {
  background: rgba(15, 15, 35, 0.8);
}
```

---

## FASE 8: ASSETS Y BRANDING

### 8.1 Logo

| Asset | Ubicación | Formato |
|-------|-----------|---------|
| Logo principal | `public/images/logo.svg` | SVG |
| Logo dark mode | `public/images/logo-dark.svg` | SVG |
| Favicon | `public/favicon.ico` | ICO |
| Logo icono | `public/images/logo-icon.svg` | SVG (solo icono) |

### 8.2 Componente AppLogo Actualizado

```tsx
// apps/web/components/app-logo.tsx
export function AppLogo({ className }: { className?: string }) {
  return (
    <Link href="/home" className={cn("flex items-center space-x-2", className)}>
      <div className="relative w-8 h-8">
        <Image
          src="/images/logo-icon.svg"
          alt="PS Comercial"
          fill
          className="object-contain"
        />
      </div>
      <span className="font-bold text-lg gradient-text-brand hidden md:inline">
        PS Comercial
      </span>
    </Link>
  );
}
```

---

## ORDEN DE EJECUCIÓN

### Sprint 1: Fundamentos (Base del Sistema)

```markdown
1. [ ] Actualizar sistema de colores en shadcn-ui.css
2. [ ] Agregar variables de gradientes en theme.css
3. [ ] Modificar layout.tsx para usar header por defecto
4. [ ] Crear componente TopNavigation
5. [ ] Actualizar navigation.config.tsx con rutas PS Comercial
6. [ ] Configurar AppLogo con branding
7. [ ] Implementar dark mode con nuevos colores
```

### Sprint 2: Componentes Core

```markdown
1. [ ] Personalizar Button con variante gradient
2. [ ] Personalizar Card con nuevo radius
3. [ ] Crear StatusBadge genérico
4. [ ] Crear componente KanbanBoard
5. [ ] Crear NotificationsButton
6. [ ] Crear NotificationsPanel
7. [ ] Implementar ViewToggle (tabla/kanban)
```

### Sprint 3: Páginas Principales

```markdown
1. [ ] Rediseñar Dashboard con nueva UI
2. [ ] Crear página Leads con tabla y kanban
3. [ ] Crear página Cotizaciones con kanban
4. [ ] Implementar panel de notificaciones funcional
```

### Sprint 4: Módulos Secundarios

```markdown
1. [ ] Crear página Pedidos
2. [ ] Crear página Admin
3. [ ] Crear página Financiero
4. [ ] Implementar Analytics básico
```

---

## CHECKLIST DE VALIDACIÓN

### Antes de Iniciar
- [ ] Cliente aprueba paleta de colores
- [ ] Cliente provee logos en formato SVG
- [ ] Definir si mantener sidebar como opción o eliminar

### Durante Implementación
- [ ] Cada componente pasa validación de @designer-ux-ui
- [ ] Dark mode funciona correctamente
- [ ] Responsive funciona en móvil
- [ ] Accesibilidad básica (contraste, focus)

### Al Finalizar
- [ ] Todas las páginas usan nueva navegación
- [ ] Sistema de colores consistente
- [ ] Notificaciones funcionales
- [ ] Build sin errores

---

## RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Conflictos con estilos MakerKit | Alta | Medio | Crear layer de override específico |
| Performance con backdrop-filter | Media | Bajo | Reducir uso en móviles |
| Navegación diferente confunde usuarios | Baja | Bajo | Documentar y onboarding |

---

## ARCHIVOS DE REFERENCIA

### Template Cliente (Fuente)
- `Context/UI Template/Generate Mock Data/src/styles/globals.css`
- `Context/UI Template/Generate Mock Data/src/components/layout/navigation.tsx`
- `Context/UI Template/Generate Mock Data/src/components/layout/notificaciones-panel.tsx`
- `Context/UI Template/Generate Mock Data/src/components/leads/`
- `Context/UI Template/Generate Mock Data/src/components/cotizaciones/`

### MakerKit (Destino)
- `apps/web/styles/shadcn-ui.css`
- `apps/web/app/home/layout.tsx`
- `apps/web/app/home/_components/`
- `packages/ui/src/shadcn/`
- `packages/ui/src/makerkit/`

---

**Versión**: 1.0
**Estado**: PENDIENTE APROBACIÓN
**Próximo paso**: Revisión y aprobación del cliente antes de iniciar implementación

