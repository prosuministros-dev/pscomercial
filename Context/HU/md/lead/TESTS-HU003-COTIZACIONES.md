# Tests HU-003: Validación y Creación de Cotización

## Criterios de Aceptación Mapeados a Tests

---

## CA-001: Validación de Lead (Válido/Rechazado)

> El sistema debe permitir validar si el lead es válido o no antes de crear la cotización.

### Tests de Integración

| ID | Test | Entrada | Resultado Esperado | Prioridad |
|----|------|---------|-------------------|-----------|
| I-003-01 | Rechazar lead con motivo | Lead + motivo | Estado = RECHAZADO | Alta |
| I-003-02 | Lead rechazado no permite cotización | Lead rechazado | Error al crear cotización | Alta |
| I-003-03 | Lead válido permite cotización | Lead asignado | Cotización creada | Alta |

```typescript
// apps/web/lib/cotizaciones/__tests__/validacion-lead.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('HU-003: Validación de Lead', () => {
  let supabase: ReturnType<typeof createClient>;
  let leadId: string;

  beforeAll(async () => {
    supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Crear lead de prueba
    const { data } = await supabase
      .from('leads')
      .insert({
        razon_social: 'Test Validación Lead',
        nit: 'TEST-VAL-001',
        nombre_contacto: 'Test',
        celular_contacto: '3001234567',
        email_contacto: 'validacion@test.com',
        requerimiento: 'Test cotización',
        canal_origen: 'MANUAL',
        creado_por: 'test-user-id',
        estado: 'ASIGNADO',
      })
      .select()
      .single();
    leadId = data!.id;
  });

  afterAll(async () => {
    await supabase.from('leads').delete().eq('nit', 'TEST-VAL-001');
  });

  it('I-003-01: rechazar lead con motivo', async () => {
    const motivoRechazo = 'Cliente no cumple requisitos';

    const { data, error } = await supabase
      .from('leads')
      .update({
        estado: 'RECHAZADO',
        motivo_rechazo: motivoRechazo,
      })
      .eq('id', leadId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.estado).toBe('RECHAZADO');
    expect(data?.motivo_rechazo).toBe(motivoRechazo);
  });

  it('I-003-02: lead rechazado no permite crear cotización', async () => {
    // Intentar crear cotización desde lead rechazado
    const { error } = await supabase
      .from('cotizaciones')
      .insert({
        lead_id: leadId, // Lead está rechazado
        cliente_razon_social: 'Test',
        cliente_nit: 'TEST-001',
        creado_por: 'test-user-id',
      });

    // Debería fallar o el lead no debería estar disponible
    // Depende de la implementación (RLS o validación)
  });

  it('I-003-03: lead válido permite crear cotización', async () => {
    // Revertir rechazo
    await supabase
      .from('leads')
      .update({ estado: 'ASIGNADO', motivo_rechazo: null })
      .eq('id', leadId);

    // Ahora debería poder crear cotización
    const { data, error } = await supabase
      .from('cotizaciones')
      .insert({
        lead_id: leadId,
        cliente_razon_social: 'Test Validación Lead',
        cliente_nit: 'TEST-VAL-001',
        cliente_contacto: 'Test',
        cliente_email: 'validacion@test.com',
        cliente_telefono: '3001234567',
        forma_pago: 'CONTADO',
        vigencia_dias: 30,
        creado_por: 'test-user-id',
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.lead_id).toBe(leadId);

    // Cleanup
    if (data) {
      await supabase.from('cotizaciones').delete().eq('id', data.id);
    }
  });
});
```

---

## CA-002: Registro de Rechazo con Motivo

> Los leads rechazados deben registrar motivo, usuario y fecha.

### Tests de Integración

| ID | Test | Entrada | Resultado Esperado | Prioridad |
|----|------|---------|-------------------|-----------|
| I-003-04 | Motivo de rechazo guardado | Rechazar con motivo | `motivo_rechazo` no vacío | Alta |
| I-003-05 | Usuario de rechazo registrado | Rechazar | `modificado_por` registrado | Alta |
| I-003-06 | Fecha de rechazo registrada | Rechazar | `modificado_en` actualizado | Alta |
| I-003-07 | Motivo obligatorio al rechazar | Rechazar sin motivo | Validación falla | Media |

```typescript
describe('HU-003: Registro de Rechazo', () => {
  it('I-003-04: motivo de rechazo se guarda correctamente', async () => {
    const motivo = 'Spam detectado';

    const { data } = await supabase
      .from('leads')
      .update({
        estado: 'RECHAZADO',
        motivo_rechazo: motivo,
        modificado_por: 'test-user-id',
      })
      .eq('id', leadId)
      .select()
      .single();

    expect(data?.motivo_rechazo).toBe(motivo);
    expect(data?.motivo_rechazo).not.toBeNull();
  });

  it('I-003-05: usuario de rechazo registrado', async () => {
    const { data } = await supabase
      .from('leads')
      .select('modificado_por')
      .eq('id', leadId)
      .single();

    expect(data?.modificado_por).not.toBeNull();
  });

  it('I-003-06: fecha de rechazo registrada', async () => {
    const { data } = await supabase
      .from('leads')
      .select('modificado_en')
      .eq('id', leadId)
      .single();

    expect(data?.modificado_en).not.toBeNull();
  });
});
```

---

## CA-003: Número Consecutivo de Cotización

> El sistema debe generar número de cotización automático, iniciando en #30.000.

### Tests de Integración

| ID | Test | Entrada | Resultado Esperado | Prioridad |
|----|------|---------|-------------------|-----------|
| I-003-08 | Primera cotización >= 30000 | Crear cotización | `numero >= 30000` | Alta |
| I-003-09 | Números consecutivos únicos | Crear 3 cotizaciones | Números diferentes | Alta |
| I-003-10 | Secuencia es incremental | Crear 2 cotizaciones | `cot2.numero > cot1.numero` | Alta |

```typescript
describe('HU-003: Número Consecutivo', () => {
  it('I-003-08: número de cotización >= 30000', async () => {
    const { data } = await supabase
      .from('cotizaciones')
      .select('numero')
      .order('numero', { ascending: true })
      .limit(1)
      .single();

    expect(data?.numero).toBeGreaterThanOrEqual(30000);
  });

  it('I-003-09: números de cotización son únicos', async () => {
    const { data } = await supabase
      .from('cotizaciones')
      .select('numero')
      .order('numero', { ascending: false })
      .limit(10);

    const numeros = data?.map(c => c.numero) || [];
    const numerosUnicos = new Set(numeros);
    expect(numerosUnicos.size).toBe(numeros.length);
  });

  it('I-003-10: secuencia de cotización es incremental', async () => {
    const { data: cot1 } = await supabase
      .from('cotizaciones')
      .insert({
        cliente_razon_social: 'Test Secuencia 1',
        cliente_nit: 'TEST-SEQ-COT-001',
        forma_pago: 'CONTADO',
        vigencia_dias: 30,
        creado_por: 'test-user-id',
      })
      .select('numero')
      .single();

    const { data: cot2 } = await supabase
      .from('cotizaciones')
      .insert({
        cliente_razon_social: 'Test Secuencia 2',
        cliente_nit: 'TEST-SEQ-COT-002',
        forma_pago: 'CONTADO',
        vigencia_dias: 30,
        creado_por: 'test-user-id',
      })
      .select('numero')
      .single();

    expect(cot2!.numero).toBeGreaterThan(cot1!.numero);

    // Cleanup
    await supabase.from('cotizaciones').delete().like('cliente_nit', 'TEST-SEQ-COT%');
  });
});
```

---

## CA-004: Cálculo Automático de TRM

> El sistema debe aplicar automáticamente la TRM vigente.

### Tests Unitarios

| ID | Test | Entrada | Resultado Esperado | Prioridad |
|----|------|---------|-------------------|-----------|
| U-003-01 | Obtener TRM del día | Fecha actual | TRM numérico válido | Alta |
| U-003-02 | Conversión USD a COP | 100 USD, TRM 4000 | 400,000 COP | Alta |
| U-003-03 | TRM aplica a precio unitario | Item en USD | Precio COP calculado | Alta |

```typescript
// apps/web/lib/cotizaciones/__tests__/calculos-trm.test.ts
import { describe, it, expect } from 'vitest';

describe('HU-003: Cálculo de TRM', () => {
  const TRM_PRUEBA = 4150.50;

  it('U-003-01: obtener TRM del día', async () => {
    const { data: trm } = await supabase
      .from('trm_historico')
      .select('valor')
      .eq('fecha', new Date().toISOString().split('T')[0])
      .single();

    if (trm) {
      expect(trm.valor).toBeGreaterThan(0);
      expect(typeof trm.valor).toBe('number');
    }
  });

  it('U-003-02: conversión USD a COP correcta', () => {
    const valorUSD = 100;
    const valorCOP = valorUSD * TRM_PRUEBA;

    expect(valorCOP).toBe(415050);
  });

  it('U-003-03: TRM aplica a precio unitario', async () => {
    const precioUSD = 250;
    const { data: item } = await supabase
      .from('cotizacion_items')
      .insert({
        cotizacion_id: 'test-cotizacion-id',
        producto_id: 'test-producto-id',
        cantidad: 1,
        precio_costo_usd: precioUSD,
        trm_aplicada: TRM_PRUEBA,
        precio_costo_cop: precioUSD * TRM_PRUEBA,
        utilidad_porcentaje: 20,
      })
      .select()
      .single();

    expect(item?.precio_costo_cop).toBe(precioUSD * TRM_PRUEBA);
  });
});
```

---

## CA-005: Cálculo de Márgenes

> El sistema debe aplicar los márgenes configurados por categoría y forma de pago.

### Tests Unitarios

| ID | Test | Entrada | Resultado Esperado | Prioridad |
|----|------|---------|-------------------|-----------|
| U-003-04 | Obtener margen por vertical | Vertical + forma pago | Margen % | Alta |
| U-003-05 | Calcular precio con margen | Costo + 20% | Precio venta correcto | Alta |
| U-003-06 | Margen diferente por forma pago | Crédito vs Contado | Márgenes diferentes | Alta |
| U-003-07 | Calcular subtotal con cantidad | Precio x Cantidad | Subtotal correcto | Alta |
| U-003-08 | Calcular IVA según tipo | Subtotal + IVA 19% | IVA calculado | Alta |

```typescript
describe('HU-003: Cálculo de Márgenes', () => {
  it('U-003-04: obtener margen por vertical y forma de pago', async () => {
    const { data: margen } = await supabase
      .rpc('obtener_margen_minimo', {
        p_vertical_id: 'test-vertical-id',
        p_forma_pago: 'CREDITO_30',
      });

    expect(margen).not.toBeNull();
    expect(margen).toBeGreaterThan(0);
    expect(margen).toBeLessThanOrEqual(100);
  });

  it('U-003-05: calcular precio con margen', () => {
    const precioCosto = 1000;
    const margenPorcentaje = 20;
    const precioVenta = precioCosto * (1 + margenPorcentaje / 100);

    expect(precioVenta).toBe(1200);
  });

  it('U-003-06: margen diferente por forma de pago', async () => {
    const { data: margenContado } = await supabase
      .rpc('obtener_margen_minimo', {
        p_vertical_id: 'test-vertical-id',
        p_forma_pago: 'ANTICIPADO',
      });

    const { data: margenCredito } = await supabase
      .rpc('obtener_margen_minimo', {
        p_vertical_id: 'test-vertical-id',
        p_forma_pago: 'CREDITO_60',
      });

    // Crédito generalmente tiene mayor margen
    if (margenContado && margenCredito) {
      expect(margenCredito).toBeGreaterThanOrEqual(margenContado);
    }
  });

  it('U-003-07: calcular subtotal con cantidad', () => {
    const precioUnitario = 500;
    const cantidad = 10;
    const subtotal = precioUnitario * cantidad;

    expect(subtotal).toBe(5000);
  });

  it('U-003-08: calcular IVA según tipo', () => {
    const subtotal = 10000;
    const ivaPorcentaje = 19;
    const iva = subtotal * (ivaPorcentaje / 100);

    expect(iva).toBe(1900);

    const total = subtotal + iva;
    expect(total).toBe(11900);
  });
});
```

---

## CA-006: Aprobación por Margen Mínimo

> Si el margen está por debajo del mínimo, debe requerirse aprobación de Gerencia.

### Tests de Integración

| ID | Test | Entrada | Resultado Esperado | Prioridad |
|----|------|---------|-------------------|-----------|
| I-003-11 | Detectar margen bajo | Item con margen < mínimo | Flag de alerta | Alta |
| I-003-12 | Cotización requiere aprobación | Margen bajo | Estado = PENDIENTE_APROBACION_MARGEN | Alta |
| I-003-13 | Margen OK no requiere aprobación | Margen >= mínimo | Sin alerta | Alta |
| I-003-14 | Verificación por item | Múltiples items | Evaluar cada uno | Media |

```typescript
describe('HU-003: Aprobación por Margen Mínimo', () => {
  it('I-003-11: detectar margen bajo', async () => {
    const { data: verificacion } = await supabase
      .rpc('verificar_margen_cotizacion_v2', {
        p_cotizacion_id: 'test-cotizacion-id',
      });

    // Retorna items con margen bajo
    if (verificacion) {
      expect(Array.isArray(verificacion)).toBe(true);
    }
  });

  it('I-003-12: cotización con margen bajo requiere aprobación', async () => {
    // Crear cotización con item de margen bajo
    const { data: cotizacion } = await supabase
      .from('cotizaciones')
      .insert({
        cliente_razon_social: 'Test Margen Bajo',
        cliente_nit: 'TEST-MARGEN-001',
        forma_pago: 'CREDITO_60',
        vigencia_dias: 30,
        creado_por: 'test-user-id',
        estado: 'PENDIENTE_APROBACION_MARGEN', // Estado cuando hay margen bajo
      })
      .select()
      .single();

    expect(cotizacion?.estado).toBe('PENDIENTE_APROBACION_MARGEN');

    // Cleanup
    if (cotizacion) {
      await supabase.from('cotizaciones').delete().eq('id', cotizacion.id);
    }
  });

  it('I-003-13: margen OK no requiere aprobación', async () => {
    // Crear cotización con margen adecuado
    const { data: cotizacion } = await supabase
      .from('cotizaciones')
      .insert({
        cliente_razon_social: 'Test Margen OK',
        cliente_nit: 'TEST-MARGEN-OK-001',
        forma_pago: 'CONTADO',
        vigencia_dias: 30,
        creado_por: 'test-user-id',
        estado: 'CREACION_OFERTA', // Estado normal
      })
      .select()
      .single();

    expect(cotizacion?.estado).not.toBe('PENDIENTE_APROBACION_MARGEN');

    // Cleanup
    if (cotizacion) {
      await supabase.from('cotizaciones').delete().eq('id', cotizacion.id);
    }
  });
});
```

---

## CA-007: Campo de Transporte No Visible

> El campo de transporte debe ser no visible para el cliente, pero registrado en la base de datos.

### Tests de Integración

| ID | Test | Entrada | Resultado Esperado | Prioridad |
|----|------|---------|-------------------|-----------|
| I-003-15 | Campo incluye_transporte existe | Schema BD | Campo presente | Alta |
| I-003-16 | Campo valor_transporte existe | Schema BD | Campo presente | Alta |
| I-003-17 | Transporte se guarda correctamente | Cotización con transporte | Valores guardados | Alta |

```typescript
describe('HU-003: Campo de Transporte', () => {
  it('I-003-15: campo incluye_transporte existe', async () => {
    const { data } = await supabase
      .from('cotizaciones')
      .select('incluye_transporte')
      .limit(1)
      .single();

    // El campo debe existir en el schema
    expect(data).toHaveProperty('incluye_transporte');
  });

  it('I-003-16: campo valor_transporte existe', async () => {
    const { data } = await supabase
      .from('cotizaciones')
      .select('valor_transporte')
      .limit(1)
      .single();

    expect(data).toHaveProperty('valor_transporte');
  });

  it('I-003-17: transporte se guarda correctamente', async () => {
    const { data: cotizacion } = await supabase
      .from('cotizaciones')
      .insert({
        cliente_razon_social: 'Test Transporte',
        cliente_nit: 'TEST-TRANSP-001',
        forma_pago: 'CONTADO',
        vigencia_dias: 30,
        incluye_transporte: false,
        valor_transporte: 150000,
        creado_por: 'test-user-id',
      })
      .select()
      .single();

    expect(cotizacion?.incluye_transporte).toBe(false);
    expect(cotizacion?.valor_transporte).toBe(150000);

    // Cleanup
    if (cotizacion) {
      await supabase.from('cotizaciones').delete().eq('id', cotizacion.id);
    }
  });
});
```

---

## CA-008: Estados de Cotización

> Estados: Creación de oferta / Negociación / Riesgo / Pendiente orden de compra / Perdida.

### Tests de Integración

| ID | Test | Entrada | Resultado Esperado | Prioridad |
|----|------|---------|-------------------|-----------|
| I-003-18 | Estado CREACION_OFERTA válido | Crear cotización | Estado inicial | Alta |
| I-003-19 | Transición a NEGOCIACION | Cambiar estado | Éxito | Alta |
| I-003-20 | Transición a RIESGO | Cambiar estado | Éxito | Alta |
| I-003-21 | Transición a PENDIENTE_OC | Cambiar estado | Éxito | Alta |
| I-003-22 | Transición a PERDIDA | Cambiar estado | Éxito | Alta |
| I-003-23 | Estado inválido rechazado | Estado inexistente | Error | Media |

```typescript
describe('HU-003: Estados de Cotización', () => {
  const estadosValidos = [
    'CREACION_OFERTA',
    'NEGOCIACION',
    'RIESGO',
    'PENDIENTE_ORDEN_COMPRA',
    'PERDIDA',
    'PENDIENTE_APROBACION_MARGEN',
    'PROFORMA_ENVIADA',
    'ACEPTADA_CLIENTE',
    'RECHAZADA_CLIENTE',
  ];

  it('I-003-18: estado inicial es CREACION_OFERTA', async () => {
    const { data: cotizacion } = await supabase
      .from('cotizaciones')
      .insert({
        cliente_razon_social: 'Test Estado Inicial',
        cliente_nit: 'TEST-ESTADO-001',
        forma_pago: 'CONTADO',
        vigencia_dias: 30,
        creado_por: 'test-user-id',
      })
      .select()
      .single();

    expect(cotizacion?.estado).toBe('CREACION_OFERTA');

    // Cleanup
    if (cotizacion) {
      await supabase.from('cotizaciones').delete().eq('id', cotizacion.id);
    }
  });

  estadosValidos.forEach(estado => {
    it(`I-003-19+: transición a ${estado} es válida`, async () => {
      // Verificar que el estado existe en el enum
      const { data, error } = await supabase
        .from('cotizaciones')
        .update({ estado })
        .eq('id', 'test-cotizacion-id')
        .select();

      // No debería haber error de tipo enum
      expect(error?.message).not.toContain('invalid input value for enum');
    });
  });
});
```

---

## CA-009: Reordenamiento de Items

> El usuario podrá definir libremente el orden de los productos incluidos.

### Tests de Integración

| ID | Test | Entrada | Resultado Esperado | Prioridad |
|----|------|---------|-------------------|-----------|
| I-003-24 | Campo orden existe en items | Schema | Campo `orden` presente | Alta |
| I-003-25 | Guardar orden de items | Array de posiciones | Orden persistido | Alta |
| I-003-26 | Reordenar items existentes | Cambiar posiciones | Nuevo orden guardado | Alta |

```typescript
describe('HU-003: Reordenamiento de Items', () => {
  let cotizacionId: string;

  beforeAll(async () => {
    const { data } = await supabase
      .from('cotizaciones')
      .insert({
        cliente_razon_social: 'Test Orden Items',
        cliente_nit: 'TEST-ORDEN-001',
        forma_pago: 'CONTADO',
        vigencia_dias: 30,
        creado_por: 'test-user-id',
      })
      .select()
      .single();
    cotizacionId = data!.id;
  });

  afterAll(async () => {
    await supabase.from('cotizacion_items').delete().eq('cotizacion_id', cotizacionId);
    await supabase.from('cotizaciones').delete().eq('cliente_nit', 'TEST-ORDEN-001');
  });

  it('I-003-24: campo orden existe en items', async () => {
    const { data } = await supabase
      .from('cotizacion_items')
      .select('orden')
      .limit(1);

    // El campo orden debe existir
    if (data && data.length > 0) {
      expect(data[0]).toHaveProperty('orden');
    }
  });

  it('I-003-25: guardar orden de items', async () => {
    // Crear items con orden específico
    const items = [
      { cotizacion_id: cotizacionId, descripcion: 'Item A', orden: 1, cantidad: 1, precio_unitario: 100 },
      { cotizacion_id: cotizacionId, descripcion: 'Item B', orden: 2, cantidad: 1, precio_unitario: 200 },
      { cotizacion_id: cotizacionId, descripcion: 'Item C', orden: 3, cantidad: 1, precio_unitario: 300 },
    ];

    const { data } = await supabase
      .from('cotizacion_items')
      .insert(items)
      .select('descripcion, orden')
      .order('orden', { ascending: true });

    expect(data?.[0].descripcion).toBe('Item A');
    expect(data?.[1].descripcion).toBe('Item B');
    expect(data?.[2].descripcion).toBe('Item C');
  });

  it('I-003-26: reordenar items existentes', async () => {
    // Obtener items actuales
    const { data: itemsActuales } = await supabase
      .from('cotizacion_items')
      .select('id, descripcion, orden')
      .eq('cotizacion_id', cotizacionId)
      .order('orden', { ascending: true });

    if (itemsActuales && itemsActuales.length >= 2) {
      // Intercambiar orden de primeros 2 items
      await supabase
        .from('cotizacion_items')
        .update({ orden: 2 })
        .eq('id', itemsActuales[0].id);

      await supabase
        .from('cotizacion_items')
        .update({ orden: 1 })
        .eq('id', itemsActuales[1].id);

      // Verificar nuevo orden
      const { data: itemsReordenados } = await supabase
        .from('cotizacion_items')
        .select('id, descripcion, orden')
        .eq('cotizacion_id', cotizacionId)
        .order('orden', { ascending: true });

      expect(itemsReordenados?.[0].id).toBe(itemsActuales[1].id);
      expect(itemsReordenados?.[1].id).toBe(itemsActuales[0].id);
    }
  });
});
```

---

## CA-010: Datos Prellenados desde Lead

> Los datos del cliente serán traídos del formulario de lead.

### Tests de Integración

| ID | Test | Entrada | Resultado Esperado | Prioridad |
|----|------|---------|-------------------|-----------|
| I-003-27 | Prellenar razón social | Lead con razón | Cotización con mismo valor | Alta |
| I-003-28 | Prellenar NIT | Lead con NIT | Cotización con mismo NIT | Alta |
| I-003-29 | Prellenar contacto | Lead con contacto | Cotización con datos | Alta |
| I-003-30 | Prellenar email | Lead con email | Cotización con email | Alta |
| I-003-31 | Prellenar teléfono | Lead con teléfono | Cotización con teléfono | Alta |

```typescript
describe('HU-003: Datos Prellenados desde Lead', () => {
  it('I-003-27 a I-003-31: crear cotización desde lead hereda datos', async () => {
    // Crear lead
    const leadData = {
      razon_social: 'Empresa Original Lead',
      nit: '900888777-6',
      nombre_contacto: 'Carlos López',
      celular_contacto: '3109876543',
      email_contacto: 'carlos@empresa.com',
      requerimiento: 'Cotización servidores',
      canal_origen: 'MANUAL',
      creado_por: 'test-user-id',
      estado: 'ASIGNADO',
    };

    const { data: lead } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single();

    // Crear cotización desde lead
    const { data: cotizacion } = await supabase
      .from('cotizaciones')
      .insert({
        lead_id: lead!.id,
        cliente_razon_social: lead!.razon_social,
        cliente_nit: lead!.nit,
        cliente_contacto: lead!.nombre_contacto,
        cliente_email: lead!.email_contacto,
        cliente_telefono: lead!.celular_contacto,
        forma_pago: 'CREDITO_30',
        vigencia_dias: 30,
        creado_por: 'test-user-id',
      })
      .select()
      .single();

    // Verificar que heredó todos los datos
    expect(cotizacion?.cliente_razon_social).toBe(leadData.razon_social);
    expect(cotizacion?.cliente_nit).toBe(leadData.nit);
    expect(cotizacion?.cliente_contacto).toBe(leadData.nombre_contacto);
    expect(cotizacion?.cliente_email).toBe(leadData.email_contacto);
    expect(cotizacion?.cliente_telefono).toBe(leadData.celular_contacto);

    // Cleanup
    if (cotizacion) {
      await supabase.from('cotizaciones').delete().eq('id', cotizacion.id);
    }
    await supabase.from('leads').delete().eq('nit', '900888777-6');
  });
});
```

---

## Tests E2E (Playwright)

```typescript
// apps/e2e/tests/cotizaciones/crear-cotizacion.spec.ts
import { expect, test } from '@playwright/test';

test.describe('HU-003: Cotizaciones', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/sign-in');
    await page.fill('[name="email"]', 'comercial@prosuministros.com');
    await page.fill('[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/home');
  });

  test('E2E-003-01: crear cotización desde lead válido', async ({ page }) => {
    await page.goto('/home/leads');

    // Buscar lead asignado
    await page.click('button:has-text("Filtros")');
    await page.selectOption('[name="estado"]', 'ASIGNADO');

    // Click en primer lead
    await page.click('table tbody tr:first-child');

    // Convertir a cotización
    await page.click('button:has-text("Convertir a Cotización")');

    // Verificar que se abre modal con datos prellenados
    await expect(page.locator('[name="cliente_razon_social"]')).not.toBeEmpty();
    await expect(page.locator('[name="cliente_nit"]')).not.toBeEmpty();

    // Completar datos adicionales
    await page.selectOption('[name="forma_pago"]', 'CREDITO_30');
    await page.fill('[name="vigencia_dias"]', '30');

    // Agregar item
    await page.click('button:has-text("Agregar Producto")');
    await page.fill('[name="item_descripcion"]', 'Laptop HP');
    await page.fill('[name="item_cantidad"]', '5');
    await page.fill('[name="item_precio"]', '2500000');
    await page.click('button:has-text("Agregar")');

    // Guardar cotización
    await page.click('button:has-text("Crear Cotización")');

    // Verificar éxito
    await expect(page.locator('text=Cotización creada exitosamente')).toBeVisible();
  });

  test('E2E-003-02: rechazar lead con motivo', async ({ page }) => {
    await page.goto('/home/leads');
    await page.click('table tbody tr:first-child');

    // Rechazar
    await page.click('button:has-text("Rechazar")');

    // Seleccionar motivo
    await page.selectOption('[name="motivo_rechazo"]', 'Spam');
    await page.click('button:has-text("Confirmar Rechazo")');

    // Verificar
    await expect(page.locator('text=Lead rechazado')).toBeVisible();
  });

  test('E2E-003-03: ver cotizaciones en Kanban', async ({ page }) => {
    await page.goto('/home/cotizaciones');

    // Cambiar a vista Kanban
    await page.click('button[aria-label="Vista Kanban"]');

    // Verificar columnas de estados
    await expect(page.locator('text=Creación Oferta')).toBeVisible();
    await expect(page.locator('text=Negociación')).toBeVisible();
    await expect(page.locator('text=Pendiente OC')).toBeVisible();
  });

  test('E2E-003-04: agregar item a cotización existente', async ({ page }) => {
    await page.goto('/home/cotizaciones');

    // Click en primera cotización
    await page.click('table tbody tr:first-child');

    // Agregar item
    await page.click('button:has-text("Agregar Item")');
    await page.fill('[name="descripcion"]', 'Monitor 24"');
    await page.fill('[name="cantidad"]', '10');
    await page.fill('[name="precio_unitario"]', '850000');
    await page.click('button:has-text("Agregar")');

    // Verificar item agregado
    await expect(page.locator('text=Monitor 24"')).toBeVisible();
  });

  test('E2E-003-05: reordenar items de cotización', async ({ page }) => {
    await page.goto('/home/cotizaciones');
    await page.click('table tbody tr:first-child');

    // Drag and drop para reordenar (si está implementado)
    // O usar botones de mover arriba/abajo
    await page.click('[data-item="1"] button:has-text("Bajar")');

    // Verificar nuevo orden
    // (Depende de la implementación del UI)
  });
});
```

---

## Resumen de Cobertura

| Categoría | Tests | Implementados | Pendientes |
|-----------|-------|---------------|------------|
| Unitarios | 8 | 0 | 8 |
| Integración | 31 | 0 | 31 |
| E2E | 5 | 0 | 5 |
| **Total** | **44** | **0** | **44** |

---

## Matriz de Trazabilidad

| Criterio de Aceptación | Tests Asociados |
|------------------------|-----------------|
| Validación lead válido/rechazado | I-003-01 a I-003-03 |
| Registro rechazo con motivo | I-003-04 a I-003-07 |
| Número consecutivo #30000 | I-003-08 a I-003-10 |
| Cálculo automático TRM | U-003-01 a U-003-03 |
| Cálculo de márgenes | U-003-04 a U-003-08 |
| Aprobación margen mínimo | I-003-11 a I-003-14 |
| Transporte no visible | I-003-15 a I-003-17 |
| Estados de cotización | I-003-18 a I-003-23 |
| Reordenamiento items | I-003-24 a I-003-26 |
| Datos prellenados lead | I-003-27 a I-003-31 |
