# Plan de Pruebas Consolidado

## Módulo Comercial - HU-001, HU-002, HU-003

**Fecha:** 2024-12-23
**Versión:** 1.0
**Estado:** Pendiente de Ejecución

---

## Resumen Ejecutivo

| HU | Nombre | Tests Totales | Unitarios | Integración | E2E |
|----|--------|:-------------:|:---------:|:-----------:|:---:|
| HU-001 | Registro de Leads | 34 | 13 | 16 | 5 |
| HU-002 | Asignación de Leads | 32 | 0 | 27 | 5 |
| HU-003 | Validación y Cotización | 44 | 8 | 31 | 5 |
| **TOTAL** | | **110** | **21** | **74** | **15** |

---

## Distribución de Tests

```
UNITARIOS       ████████░░░░░░░░░░░░  19% (21 tests)
INTEGRACIÓN     █████████████████░░░  67% (74 tests)
E2E             ███░░░░░░░░░░░░░░░░░  14% (15 tests)
```

---

## Cobertura por Criterio de Aceptación

### HU-001: Registro de Leads

| # | Criterio | Tests | Cubierto |
|---|----------|:-----:|:--------:|
| 1 | Creación automática con info mínima | 7 | Si |
| 2 | Consecutivo único desde #100 | 3 | Si |
| 3 | Validación email y teléfono | 6 | Si |
| 4 | Registro canal, fecha, usuario | 4 | Si |
| 5 | Detección de duplicados | 4 | Si |
| 6 | Estado "Pendiente de Asignación" | 2 | Si |
| 7 | Observaciones con @menciones | 3 | Si |
| 8 | Vista Kanban | 1 | Si |
| 9 | Múltiples contactos por razón social | 0 | No |
| 10 | Notificaciones filtrables | 0 | No |

### HU-002: Asignación de Leads

| # | Criterio | Tests | Cubierto |
|---|----------|:-----:|:--------:|
| 1 | Solo asesores activos | 4 | Si |
| 2 | Reasignación solo admins | 3 | Si |
| 3 | Registro en bitácora | 5 | Si |
| 4 | Notificación al asesor | 4 | Si |
| 5 | Un asesor por lead | 2 | Si |
| 6 | Estado automático (ASIGNADO) | 2 | Si |
| 7 | Límite 5 pendientes por asesor | 4 | Si |
| 8 | Reasignación al dar de baja | 3 | Si |

### HU-003: Validación y Cotización

| # | Criterio | Tests | Cubierto |
|---|----------|:-----:|:--------:|
| 1 | Validación lead válido/rechazado | 3 | Si |
| 2 | Registro rechazo con motivo | 4 | Si |
| 3 | Número consecutivo #30000 | 3 | Si |
| 4 | Cálculo automático TRM | 3 | Si |
| 5 | Cálculo de márgenes | 5 | Si |
| 6 | Aprobación margen mínimo | 4 | Si |
| 7 | Transporte no visible | 3 | Si |
| 8 | Estados de cotización | 6 | Si |
| 9 | Reordenamiento items | 3 | Si |
| 10 | Datos prellenados lead | 5 | Si |
| 11 | Observaciones en cotización | 0 | No |

---

## Priorización de Tests

### Prioridad Alta (Ejecutar Primero)

| ID | HU | Descripción | Tipo |
|----|:--:|-------------|------|
| U-001-01 | 001 | Validar schema con datos completos | Unit |
| I-001-01 | 001 | Primer lead tiene número >= 100 | Integration |
| I-002-01 | 002 | Asignar a asesor activo | Integration |
| I-002-05 | 002 | Gerencia puede reasignar | Integration |
| I-002-13 | 002 | Crear notificación al asignar | Integration |
| I-003-08 | 003 | Número cotización >= 30000 | Integration |
| U-003-02 | 003 | Conversión USD a COP | Unit |
| I-003-11 | 003 | Detectar margen bajo | Integration |

### Prioridad Media

| ID | HU | Descripción | Tipo |
|----|:--:|-------------|------|
| I-001-08 | 001 | Detectar NIT duplicado | Integration |
| I-002-08 | 002 | Registrar asignación en bitácora | Integration |
| I-002-21 | 002 | Contar leads pendientes | Integration |
| I-003-24 | 003 | Campo orden existe en items | Integration |

### Prioridad Baja

| ID | HU | Descripción | Tipo |
|----|:--:|-------------|------|
| U-001-12 | 001 | Celular con menos de 10 dígitos | Unit |
| I-002-12 | 002 | Bitácora incluye asesor anterior | Integration |
| I-003-26 | 003 | Reordenar items existentes | Integration |

---

## Configuración de Ambiente

### Variables de Entorno Requeridas

```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Testing
TEST_USER_EMAIL=test@prosuministros.com
TEST_USER_PASSWORD=testpassword
TEST_GERENTE_EMAIL=gerente@prosuministros.com
TEST_GERENTE_PASSWORD=testpassword
TEST_COMERCIAL_EMAIL=comercial@prosuministros.com
TEST_COMERCIAL_PASSWORD=testpassword
```

### Dependencias de Testing

```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@playwright/test": "^1.40.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0"
  }
}
```

### Scripts de Ejecución

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest --dir lib --testNamePattern 'U-'",
    "test:integration": "vitest --dir lib --testNamePattern 'I-'",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

---

## Estructura de Archivos de Test

```
apps/
├── web/
│   └── lib/
│       ├── leads/
│       │   └── __tests__/
│       │       ├── lead.schema.test.ts      # U-001-01 a U-001-13
│       │       ├── lead.integration.test.ts # I-001-01 a I-001-16
│       │       └── lead.api.test.ts
│       ├── asesores/
│       │   └── __tests__/
│       │       └── asignacion.integration.test.ts # I-002-01 a I-002-27
│       ├── cotizaciones/
│       │   └── __tests__/
│       │       ├── cotizacion.schema.test.ts
│       │       ├── calculos-trm.test.ts     # U-003-01 a U-003-08
│       │       └── cotizacion.integration.test.ts # I-003-01 a I-003-31
│       └── notificaciones/
│           └── __tests__/
│               └── notificaciones.test.ts
│
└── e2e/
    └── tests/
        ├── leads/
        │   ├── crear-lead.spec.ts           # E2E-001-01 a E2E-001-05
        │   └── leads.po.ts
        ├── asignacion/
        │   ├── asignacion.spec.ts           # E2E-002-01 a E2E-002-05
        │   └── asignacion.po.ts
        └── cotizaciones/
            ├── crear-cotizacion.spec.ts     # E2E-003-01 a E2E-003-05
            └── cotizaciones.po.ts
```

---

## Datos de Prueba

### Fixtures - Leads

```typescript
export const LEAD_VALIDO = {
  razon_social: 'Empresa Test S.A.S',
  nit: '900123456-1',
  nombre_contacto: 'Juan Pérez',
  celular_contacto: '3001234567',
  email_contacto: 'juan@empresa.com',
  requerimiento: 'Cotización de equipos',
  canal_origen: 'MANUAL' as const,
};

export const LEADS_DUPLICADOS = {
  nit_existente: '900123456-1',
  email_existente: 'duplicado@test.com',
};
```

### Fixtures - Cotizaciones

```typescript
export const COTIZACION_VALIDA = {
  cliente_razon_social: 'Cliente Test',
  cliente_nit: '800111222-3',
  cliente_contacto: 'María López',
  cliente_email: 'maria@cliente.com',
  cliente_telefono: '3109876543',
  forma_pago: 'CREDITO_30' as const,
  vigencia_dias: 30,
};

export const ITEM_COTIZACION = {
  descripcion: 'Laptop HP ProBook',
  cantidad: 5,
  precio_costo_usd: 800,
  utilidad_porcentaje: 25,
  iva_tipo: 'IVA_19' as const,
};
```

---

## Criterios de Éxito

### Métricas de Calidad

| Métrica | Objetivo | Mínimo Aceptable |
|---------|:--------:|:----------------:|
| Cobertura de código | 80% | 70% |
| Tests pasando | 100% | 95% |
| Tiempo de ejecución (unit) | < 30s | < 60s |
| Tiempo de ejecución (e2e) | < 5min | < 10min |

### Criterios de Aceptación QA

- [ ] Todos los tests de prioridad Alta pasan
- [ ] Cobertura de criterios de aceptación >= 90%
- [ ] No hay tests flaky (inestables)
- [ ] Documentación de tests actualizada
- [ ] Fixtures de datos completos

---

## Cronograma Sugerido

| Fase | Actividad | Estimación |
|------|-----------|:----------:|
| 1 | Configurar ambiente de testing | 2h |
| 2 | Implementar tests unitarios HU-001 | 3h |
| 3 | Implementar tests integración HU-001 | 4h |
| 4 | Implementar tests HU-002 | 5h |
| 5 | Implementar tests HU-003 | 6h |
| 6 | Implementar tests E2E | 4h |
| 7 | Documentar y ajustar | 2h |
| **Total** | | **26h** |

---

## Archivos de Referencia

| Archivo | Ubicación |
|---------|-----------|
| Tests HU-001 | `Context/HU/md/lead/TESTS-HU001-REGISTRO-LEADS.md` |
| Tests HU-002 | `Context/HU/md/lead/TESTS-HU002-ASIGNACION-LEADS.md` |
| Tests HU-003 | `Context/HU/md/lead/TESTS-HU003-COTIZACIONES.md` |
| Especificación HU-001 | `Context/HU/md/HU-0001 – Registro de Leads.md` |
| Especificación HU-002 | `Context/HU/md/HU-0002 – Asignación de Leads.md` |
| Especificación HU-003 | `Context/HU/md/HU-0003 – Validación y Creación de Cotización.md` |

---

## Notas

1. Los tests de integración requieren conexión a Supabase
2. Los tests E2E requieren la aplicación corriendo en localhost
3. Usar `--run-in-band` para tests que modifican estado compartido
4. Limpiar datos de prueba después de cada suite
