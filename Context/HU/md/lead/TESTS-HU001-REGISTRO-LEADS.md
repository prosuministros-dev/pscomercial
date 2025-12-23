# Tests HU-001: Registro de Leads

## Criterios de Aceptación Mapeados a Tests

---

## CA-001: Creación Automática de Lead

> El sistema debe crear el lead de forma automática al recibir la información mínima requerida.

### Tests Unitarios

| ID | Test | Entrada | Resultado Esperado | Prioridad |
|----|------|---------|-------------------|-----------|
| U-001-01 | Validar schema con datos completos | Lead con todos los campos | Validación exitosa | Alta |
| U-001-02 | Rechazar lead sin razón social | Lead sin `razon_social` | Error de validación | Alta |
| U-001-03 | Rechazar lead sin NIT | Lead sin `nit` | Error de validación | Alta |
| U-001-04 | Rechazar lead sin nombre contacto | Lead sin `nombre_contacto` | Error de validación | Alta |
| U-001-05 | Rechazar lead sin celular | Lead sin `celular_contacto` | Error de validación | Alta |
| U-001-06 | Rechazar lead sin email | Lead sin `email_contacto` | Error de validación | Alta |
| U-001-07 | Rechazar lead sin requerimiento | Lead sin `requerimiento` | Error de validación | Alta |

```typescript
// apps/web/lib/leads/__tests__/lead.schema.test.ts
import { describe, it, expect } from 'vitest';
import { CreateLeadSchema } from '../schemas/lead.schema';

describe('CreateLeadSchema', () => {
  const validLead = {
    razon_social: 'Empresa Test S.A.S',
    nit: '900123456-1',
    nombre_contacto: 'Juan Pérez',
    celular_contacto: '3001234567',
    email_contacto: 'juan@empresa.com',
    requerimiento: 'Cotización de equipos',
    canal_origen: 'MANUAL',
  };

  it('U-001-01: debe validar lead con datos completos', () => {
    const result = CreateLeadSchema.safeParse(validLead);
    expect(result.success).toBe(true);
  });

  it('U-001-02: debe rechazar lead sin razón social', () => {
    const { razon_social, ...leadSinRazonSocial } = validLead;
    const result = CreateLeadSchema.safeParse(leadSinRazonSocial);
    expect(result.success).toBe(false);
  });

  it('U-001-03: debe rechazar lead sin NIT', () => {
    const { nit, ...leadSinNit } = validLead;
    const result = CreateLeadSchema.safeParse(leadSinNit);
    expect(result.success).toBe(false);
  });

  it('U-001-04: debe rechazar lead sin nombre de contacto', () => {
    const { nombre_contacto, ...leadSinNombre } = validLead;
    const result = CreateLeadSchema.safeParse(leadSinNombre);
    expect(result.success).toBe(false);
  });

  it('U-001-05: debe rechazar lead sin celular', () => {
    const { celular_contacto, ...leadSinCelular } = validLead;
    const result = CreateLeadSchema.safeParse(leadSinCelular);
    expect(result.success).toBe(false);
  });

  it('U-001-06: debe rechazar lead sin email', () => {
    const { email_contacto, ...leadSinEmail } = validLead;
    const result = CreateLeadSchema.safeParse(leadSinEmail);
    expect(result.success).toBe(false);
  });

  it('U-001-07: debe rechazar lead sin requerimiento', () => {
    const { requerimiento, ...leadSinRequerimiento } = validLead;
    const result = CreateLeadSchema.safeParse(leadSinRequerimiento);
    expect(result.success).toBe(false);
  });
});
```

---

## CA-002: Número Consecutivo Autogenerado

> El consecutivo del lead debe ser único y autogenerado, iniciando en 100.

### Tests de Integración

| ID | Test | Entrada | Resultado Esperado | Prioridad |
|----|------|---------|-------------------|-----------|
| I-001-01 | Primer lead tiene número >= 100 | Crear primer lead | `numero >= 100` | Alta |
| I-001-02 | Leads consecutivos son únicos | Crear 3 leads | Números diferentes | Alta |
| I-001-03 | Números son incrementales | Crear 2 leads | `lead2.numero > lead1.numero` | Alta |

```typescript
// apps/web/lib/leads/__tests__/lead.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('Lead - Número Consecutivo', () => {
  let supabase: ReturnType<typeof createClient>;

  beforeAll(() => {
    supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  });

  it('I-001-01: primer lead tiene número >= 100', async () => {
    const { data } = await supabase
      .from('leads')
      .select('numero')
      .order('numero', { ascending: true })
      .limit(1)
      .single();

    expect(data?.numero).toBeGreaterThanOrEqual(100);
  });

  it('I-001-02: leads consecutivos tienen números únicos', async () => {
    const { data } = await supabase
      .from('leads')
      .select('numero')
      .order('numero', { ascending: false })
      .limit(10);

    const numeros = data?.map(l => l.numero) || [];
    const numerosUnicos = new Set(numeros);
    expect(numerosUnicos.size).toBe(numeros.length);
  });

  it('I-001-03: secuencia es incremental', async () => {
    const { data: lead1 } = await supabase
      .from('leads')
      .insert({
        razon_social: 'Test Secuencia 1',
        nit: 'TEST-SEQ-001',
        nombre_contacto: 'Test',
        celular_contacto: '3001234567',
        email_contacto: 'test1@test.com',
        requerimiento: 'Test',
        canal_origen: 'MANUAL',
        creado_por: 'test-user-id',
      })
      .select('numero')
      .single();

    const { data: lead2 } = await supabase
      .from('leads')
      .insert({
        razon_social: 'Test Secuencia 2',
        nit: 'TEST-SEQ-002',
        nombre_contacto: 'Test',
        celular_contacto: '3001234568',
        email_contacto: 'test2@test.com',
        requerimiento: 'Test',
        canal_origen: 'MANUAL',
        creado_por: 'test-user-id',
      })
      .select('numero')
      .single();

    expect(lead2!.numero).toBeGreaterThan(lead1!.numero);

    // Cleanup
    await supabase.from('leads').delete().eq('nit', 'TEST-SEQ-001');
    await supabase.from('leads').delete().eq('nit', 'TEST-SEQ-002');
  });
});
```

---

## CA-003: Validación de Formato

> Validación formato de teléfono (10 dígitos) y email (regex estándar).

### Tests Unitarios

| ID | Test | Entrada | Resultado Esperado | Prioridad |
|----|------|---------|-------------------|-----------|
| U-001-08 | Email válido | `test@empresa.com` | Aceptado | Alta |
| U-001-09 | Email inválido | `test@` | Rechazado | Alta |
| U-001-10 | Email sin dominio | `test@empresa` | Rechazado | Alta |
| U-001-11 | Celular 10 dígitos | `3001234567` | Aceptado | Alta |
| U-001-12 | Celular < 10 dígitos | `300123456` | Rechazado | Media |
| U-001-13 | Celular con letras | `300ABC4567` | Rechazado | Media |

```typescript
describe('Validación de Formato', () => {
  it('U-001-08: acepta email válido', () => {
    const lead = { ...validLead, email_contacto: 'test@empresa.com' };
    const result = CreateLeadSchema.safeParse(lead);
    expect(result.success).toBe(true);
  });

  it('U-001-09: rechaza email inválido', () => {
    const lead = { ...validLead, email_contacto: 'test@' };
    const result = CreateLeadSchema.safeParse(lead);
    expect(result.success).toBe(false);
  });

  it('U-001-10: rechaza email sin dominio completo', () => {
    const lead = { ...validLead, email_contacto: 'test@empresa' };
    const result = CreateLeadSchema.safeParse(lead);
    expect(result.success).toBe(false);
  });

  it('U-001-11: acepta celular de 10 dígitos', () => {
    const lead = { ...validLead, celular_contacto: '3001234567' };
    const result = CreateLeadSchema.safeParse(lead);
    expect(result.success).toBe(true);
  });

  it('U-001-12: rechaza celular con menos de 10 dígitos', () => {
    const lead = { ...validLead, celular_contacto: '300123456' };
    const result = CreateLeadSchema.safeParse(lead);
    expect(result.success).toBe(false);
  });

  it('U-001-13: rechaza celular con letras', () => {
    const lead = { ...validLead, celular_contacto: '300ABC4567' };
    const result = CreateLeadSchema.safeParse(lead);
    expect(result.success).toBe(false);
  });
});
```

---

## CA-004: Registro de Canal, Fecha, Hora y Usuario

> El sistema debe registrar canal de entrada, fecha, hora y usuario creador.

### Tests de Integración

| ID | Test | Entrada | Resultado Esperado | Prioridad |
|----|------|---------|-------------------|-----------|
| I-001-04 | Canal se registra correctamente | Canal: WHATSAPP | `canal_origen = 'WHATSAPP'` | Alta |
| I-001-05 | Fecha se registra automáticamente | Sin fecha | `fecha_lead IS NOT NULL` | Alta |
| I-001-06 | Usuario creador se registra | User ID válido | `creado_por = user_id` | Alta |
| I-001-07 | Canal default es MANUAL | Sin canal | `canal_origen = 'MANUAL'` | Media |

```typescript
describe('Registro de Metadatos', () => {
  it('I-001-04: canal se registra correctamente', async () => {
    const { data } = await supabase
      .from('leads')
      .insert({
        razon_social: 'Test Canal',
        nit: 'TEST-CANAL-001',
        nombre_contacto: 'Test',
        celular_contacto: '3001234567',
        email_contacto: 'canal@test.com',
        requerimiento: 'Test',
        canal_origen: 'WHATSAPP',
        creado_por: 'test-user-id',
      })
      .select()
      .single();

    expect(data?.canal_origen).toBe('WHATSAPP');

    // Cleanup
    await supabase.from('leads').delete().eq('nit', 'TEST-CANAL-001');
  });

  it('I-001-05: fecha se registra automáticamente', async () => {
    const { data } = await supabase
      .from('leads')
      .insert({
        razon_social: 'Test Fecha',
        nit: 'TEST-FECHA-001',
        nombre_contacto: 'Test',
        celular_contacto: '3001234567',
        email_contacto: 'fecha@test.com',
        requerimiento: 'Test',
        canal_origen: 'MANUAL',
        creado_por: 'test-user-id',
      })
      .select()
      .single();

    expect(data?.fecha_lead).not.toBeNull();
    expect(data?.creado_en).not.toBeNull();

    // Cleanup
    await supabase.from('leads').delete().eq('nit', 'TEST-FECHA-001');
  });

  it('I-001-06: usuario creador se registra', async () => {
    const userId = 'test-user-id';
    const { data } = await supabase
      .from('leads')
      .insert({
        razon_social: 'Test Usuario',
        nit: 'TEST-USER-001',
        nombre_contacto: 'Test',
        celular_contacto: '3001234567',
        email_contacto: 'user@test.com',
        requerimiento: 'Test',
        canal_origen: 'MANUAL',
        creado_por: userId,
      })
      .select()
      .single();

    expect(data?.creado_por).toBe(userId);

    // Cleanup
    await supabase.from('leads').delete().eq('nit', 'TEST-USER-001');
  });
});
```

---

## CA-005: Detección de Duplicados

> Se debe validar duplicidad por NIT y correo electrónico.

### Tests de Integración

| ID | Test | Entrada | Resultado Esperado | Prioridad |
|----|------|---------|-------------------|-----------|
| I-001-08 | Detectar NIT duplicado | NIT existente | Warning/Error | Alta |
| I-001-09 | Detectar email duplicado | Email existente | Warning/Error | Alta |
| I-001-10 | Permitir NIT único | NIT nuevo | Lead creado | Alta |
| I-001-11 | Duplicado en estado rechazado NO cuenta | NIT en lead rechazado | Permitir | Media |

```typescript
describe('Detección de Duplicados', () => {
  beforeAll(async () => {
    // Crear lead de referencia
    await supabase.from('leads').insert({
      razon_social: 'Lead Original',
      nit: 'NIT-DUPLICADO-001',
      nombre_contacto: 'Original',
      celular_contacto: '3001234567',
      email_contacto: 'original@duplicado.com',
      requerimiento: 'Test duplicado',
      canal_origen: 'MANUAL',
      creado_por: 'test-user-id',
    });
  });

  afterAll(async () => {
    await supabase.from('leads').delete().like('nit', 'NIT-DUPLICADO%');
  });

  it('I-001-08: detectar NIT duplicado', async () => {
    const { data: duplicado } = await supabase
      .from('leads')
      .select('id, numero, razon_social')
      .eq('nit', 'NIT-DUPLICADO-001')
      .neq('estado', 'RECHAZADO')
      .maybeSingle();

    expect(duplicado).not.toBeNull();
  });

  it('I-001-09: detectar email duplicado', async () => {
    const { data: duplicado } = await supabase
      .from('leads')
      .select('id, numero, razon_social')
      .eq('email_contacto', 'original@duplicado.com')
      .neq('estado', 'RECHAZADO')
      .maybeSingle();

    expect(duplicado).not.toBeNull();
  });

  it('I-001-10: permitir NIT único', async () => {
    const { data: existente } = await supabase
      .from('leads')
      .select('id')
      .eq('nit', 'NIT-UNICO-NUEVO')
      .maybeSingle();

    expect(existente).toBeNull();
  });
});
```

---

## CA-006: Estado Inicial

> El lead quedará en estado "Pendiente de Asignación".

### Tests de Integración

| ID | Test | Entrada | Resultado Esperado | Prioridad |
|----|------|---------|-------------------|-----------|
| I-001-12 | Estado inicial correcto | Crear lead | `estado = 'PENDIENTE_ASIGNACION'` | Alta |
| I-001-13 | Estado no es null | Crear lead | `estado IS NOT NULL` | Alta |

```typescript
describe('Estado Inicial', () => {
  it('I-001-12: estado inicial es PENDIENTE_ASIGNACION', async () => {
    const { data } = await supabase
      .from('leads')
      .insert({
        razon_social: 'Test Estado',
        nit: 'TEST-ESTADO-001',
        nombre_contacto: 'Test',
        celular_contacto: '3001234567',
        email_contacto: 'estado@test.com',
        requerimiento: 'Test',
        canal_origen: 'MANUAL',
        creado_por: 'test-user-id',
      })
      .select()
      .single();

    expect(data?.estado).toBe('PENDIENTE_ASIGNACION');

    // Cleanup
    await supabase.from('leads').delete().eq('nit', 'TEST-ESTADO-001');
  });
});
```

---

## CA-007: Observaciones con Menciones

> Agregar campo de observaciones con chat interno, donde se pueda mencionar usuarios con "@".

### Tests de Integración

| ID | Test | Entrada | Resultado Esperado | Prioridad |
|----|------|---------|-------------------|-----------|
| I-001-14 | Crear observación simple | Texto sin mención | Observación creada | Alta |
| I-001-15 | Crear observación con mención | Texto con @usuario | Menciones guardadas | Alta |
| I-001-16 | Múltiples menciones | @user1 @user2 | Array con 2 UUIDs | Media |

```typescript
describe('Observaciones con Menciones', () => {
  let leadId: string;

  beforeAll(async () => {
    const { data } = await supabase
      .from('leads')
      .insert({
        razon_social: 'Test Observaciones',
        nit: 'TEST-OBS-001',
        nombre_contacto: 'Test',
        celular_contacto: '3001234567',
        email_contacto: 'obs@test.com',
        requerimiento: 'Test',
        canal_origen: 'MANUAL',
        creado_por: 'test-user-id',
      })
      .select()
      .single();
    leadId = data!.id;
  });

  afterAll(async () => {
    await supabase.from('lead_observaciones').delete().eq('lead_id', leadId);
    await supabase.from('leads').delete().eq('nit', 'TEST-OBS-001');
  });

  it('I-001-14: crear observación simple', async () => {
    const { data, error } = await supabase
      .from('lead_observaciones')
      .insert({
        lead_id: leadId,
        usuario_id: 'test-user-id',
        texto: 'Esta es una observación de prueba',
        menciones: [],
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.texto).toBe('Esta es una observación de prueba');
  });

  it('I-001-15: crear observación con mención', async () => {
    const usuarioMencionado = 'uuid-usuario-mencionado';
    const { data, error } = await supabase
      .from('lead_observaciones')
      .insert({
        lead_id: leadId,
        usuario_id: 'test-user-id',
        texto: 'Revisar este lead @usuario',
        menciones: [usuarioMencionado],
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.menciones).toContain(usuarioMencionado);
  });

  it('I-001-16: múltiples menciones', async () => {
    const usuarios = ['uuid-user-1', 'uuid-user-2'];
    const { data, error } = await supabase
      .from('lead_observaciones')
      .insert({
        lead_id: leadId,
        usuario_id: 'test-user-id',
        texto: '@user1 y @user2 revisen esto',
        menciones: usuarios,
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.menciones).toHaveLength(2);
  });
});
```

---

## Tests E2E (Playwright)

### E2E-001: Flujo Completo de Creación de Lead

```typescript
// apps/e2e/tests/leads/crear-lead.spec.ts
import { expect, test } from '@playwright/test';

test.describe('HU-001: Registro de Leads', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/auth/sign-in');
    await page.fill('[name="email"]', 'test@prosuministros.com');
    await page.fill('[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/home');
  });

  test('E2E-001-01: crear lead desde UI con todos los campos', async ({ page }) => {
    await page.goto('/home/leads');

    // Abrir modal de creación
    await page.click('button:has-text("Nuevo Lead")');

    // Llenar formulario
    await page.fill('[name="razon_social"]', 'Empresa E2E Test');
    await page.fill('[name="nit"]', '900999888-1');
    await page.fill('[name="nombre_contacto"]', 'Usuario Prueba');
    await page.fill('[name="celular_contacto"]', '3009998887');
    await page.fill('[name="email_contacto"]', 'e2e@test.com');
    await page.fill('[name="requerimiento"]', 'Prueba automatizada');

    // Guardar
    await page.click('button:has-text("Crear Lead")');

    // Verificar creación
    await expect(page.locator('text=Lead creado exitosamente')).toBeVisible();
  });

  test('E2E-001-02: validación de campos obligatorios', async ({ page }) => {
    await page.goto('/home/leads');
    await page.click('button:has-text("Nuevo Lead")');

    // Intentar guardar sin datos
    await page.click('button:has-text("Crear Lead")');

    // Verificar errores de validación
    await expect(page.locator('text=Razón social es requerida')).toBeVisible();
    await expect(page.locator('text=NIT es requerido')).toBeVisible();
  });

  test('E2E-001-03: vista Kanban muestra estados correctos', async ({ page }) => {
    await page.goto('/home/leads');

    // Cambiar a vista Kanban
    await page.click('button[aria-label="Vista Kanban"]');

    // Verificar columnas
    await expect(page.locator('text=Pendiente Asignación')).toBeVisible();
    await expect(page.locator('text=Asignado')).toBeVisible();
    await expect(page.locator('text=Convertido')).toBeVisible();
    await expect(page.locator('text=Rechazado')).toBeVisible();
  });

  test('E2E-001-04: búsqueda de leads', async ({ page }) => {
    await page.goto('/home/leads');

    // Buscar por razón social
    await page.fill('input[placeholder*="Buscar"]', 'Empresa E2E');
    await page.waitForTimeout(500); // Debounce

    // Verificar resultados filtrados
    await expect(page.locator('text=Empresa E2E Test')).toBeVisible();
  });

  test('E2E-001-05: ver detalle de lead', async ({ page }) => {
    await page.goto('/home/leads');

    // Click en primer lead
    await page.click('table tbody tr:first-child');

    // Verificar modal de detalle
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Datos del Lead')).toBeVisible();
  });
});
```

---

## Resumen de Cobertura

| Categoría | Tests | Implementados | Pendientes |
|-----------|-------|---------------|------------|
| Unitarios | 13 | 0 | 13 |
| Integración | 16 | 0 | 16 |
| E2E | 5 | 0 | 5 |
| **Total** | **34** | **0** | **34** |

---

## Matriz de Trazabilidad

| Criterio de Aceptación | Tests Asociados |
|------------------------|-----------------|
| Creación automática con info mínima | U-001-01 a U-001-07 |
| Consecutivo único desde #100 | I-001-01 a I-001-03 |
| Validación email y teléfono | U-001-08 a U-001-13 |
| Registro de canal, fecha, usuario | I-001-04 a I-001-07 |
| Detección de duplicados | I-001-08 a I-001-11 |
| Estado "Pendiente de Asignación" | I-001-12, I-001-13 |
| Observaciones con menciones | I-001-14 a I-001-16 |
| Vista Kanban | E2E-001-03 |
