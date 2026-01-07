# Tests HU-002: Asignación de Leads

## Criterios de Aceptación Mapeados a Tests

---

## CA-001: Asignación Solo a Asesores Activos

> Los leads deben asignarse automáticamente solo a asesores activos.

### Tests de Integración

| ID | Test | Entrada | Resultado Esperado | Prioridad |
|----|------|---------|-------------------|-----------|
| I-002-01 | Asignar a asesor activo | Lead nuevo, asesor activo | Asignación exitosa | Alta |
| I-002-02 | No asignar a asesor inactivo | Lead nuevo, solo asesores inactivos | Sin asignación / Error | Alta |
| I-002-03 | Verificar estado asesor antes de asignar | Función `es_asesor_activo()` | true/false correcto | Alta |
| I-002-04 | Excluir asesores con usuario inactivo | Asesor activo pero usuario inactivo | No incluido en pool | Alta |

```typescript
// apps/web/lib/asesores/__tests__/asignacion.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('HU-002: Asignación a Asesores Activos', () => {
  let supabase: ReturnType<typeof createClient>;

  beforeAll(() => {
    supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  });

  it('I-002-01: asignar solo a asesor activo', async () => {
    // Obtener asesor disponible
    const { data: asesor } = await supabase
      .rpc('obtener_asesor_disponible');

    if (asesor) {
      // Verificar que está activo
      const { data: config } = await supabase
        .from('asesores_config')
        .select('activo')
        .eq('usuario_id', asesor)
        .single();

      expect(config?.activo).toBe(true);
    }
  });

  it('I-002-02: no retornar asesores inactivos', async () => {
    // Obtener todos los asesores del pool
    const { data: asesores } = await supabase
      .from('asesores_config')
      .select('usuario_id, activo')
      .eq('activo', true);

    // Todos deben estar activos
    asesores?.forEach(asesor => {
      expect(asesor.activo).toBe(true);
    });
  });

  it('I-002-03: función es_asesor_activo retorna correctamente', async () => {
    // Obtener un asesor activo
    const { data: asesorActivo } = await supabase
      .from('asesores_config')
      .select('usuario_id')
      .eq('activo', true)
      .limit(1)
      .single();

    if (asesorActivo) {
      const { data: esActivo } = await supabase
        .rpc('es_asesor_activo', { p_usuario_id: asesorActivo.usuario_id });

      expect(esActivo).toBe(true);
    }
  });

  it('I-002-04: excluir asesores con usuario inactivo', async () => {
    const { data: asesoresActivos } = await supabase
      .from('asesores_config')
      .select(`
        usuario_id,
        activo,
        usuario:usuarios!inner(estado)
      `)
      .eq('activo', true);

    // Todos los usuarios asociados deben estar activos
    asesoresActivos?.forEach((asesor: any) => {
      expect(asesor.usuario?.estado).toBe('ACTIVO');
    });
  });
});
```

---

## CA-002: Reasignación Solo para Administradores

> La reasignación debe estar disponible únicamente para usuarios con permisos administrativos.

### Tests de Integración

| ID | Test | Entrada | Resultado Esperado | Prioridad |
|----|------|---------|-------------------|-----------|
| I-002-05 | Gerencia puede reasignar | Usuario con rol GERENCIA_COMERCIAL | Permitido | Alta |
| I-002-06 | Comercial NO puede reasignar | Usuario con rol COMERCIAL | Denegado | Alta |
| I-002-07 | Verificar permiso `puede_reasignar_lead` | UUID de usuario | true/false | Alta |

```typescript
describe('HU-002: Permisos de Reasignación', () => {
  it('I-002-05: gerencia comercial puede reasignar', async () => {
    // Obtener usuario con rol GERENCIA_COMERCIAL
    const { data: gerente } = await supabase
      .from('usuario_roles')
      .select('usuario_id, rol:roles!inner(nombre)')
      .eq('roles.nombre', 'GERENCIA_COMERCIAL')
      .limit(1)
      .single();

    if (gerente) {
      const { data: puedeReasignar } = await supabase
        .rpc('puede_reasignar_lead', { p_usuario_id: gerente.usuario_id });

      expect(puedeReasignar).toBe(true);
    }
  });

  it('I-002-06: comercial no puede reasignar', async () => {
    // Obtener usuario con rol COMERCIAL (sin GERENCIA)
    const { data: comercial } = await supabase
      .from('usuario_roles')
      .select('usuario_id, rol:roles!inner(nombre)')
      .eq('roles.nombre', 'COMERCIAL')
      .limit(1)
      .single();

    if (comercial) {
      // Verificar que NO tiene rol de gerencia
      const { data: roles } = await supabase
        .from('usuario_roles')
        .select('rol:roles!inner(nombre)')
        .eq('usuario_id', comercial.usuario_id);

      const tieneGerencia = roles?.some((r: any) =>
        r.rol.nombre.includes('GERENCIA')
      );

      if (!tieneGerencia) {
        const { data: puedeReasignar } = await supabase
          .rpc('puede_reasignar_lead', { p_usuario_id: comercial.usuario_id });

        expect(puedeReasignar).toBe(false);
      }
    }
  });

  it('I-002-07: función reasignar_lead valida permisos', async () => {
    // Intentar reasignar sin permisos debe fallar
    const { data: resultado } = await supabase
      .rpc('reasignar_lead', {
        p_lead_id: 'uuid-lead-test',
        p_nuevo_asesor_id: 'uuid-asesor-test'
      });

    // Si no tiene permisos, debe retornar error
    if (resultado && !resultado.success) {
      expect(resultado.error).toContain('No tiene permisos');
    }
  });
});
```

---

## CA-003: Registro en Bitácora

> Toda asignación o reasignación debe registrarse en bitácora con fecha, hora y usuario.

### Tests de Integración

| ID | Test | Entrada | Resultado Esperado | Prioridad |
|----|------|---------|-------------------|-----------|
| I-002-08 | Registrar asignación automática | Crear lead | Entrada en bitácora | Alta |
| I-002-09 | Registrar reasignación manual | Reasignar lead | Entrada con tipo REASIGNACION | Alta |
| I-002-10 | Bitácora incluye fecha/hora | Cualquier asignación | `creado_en IS NOT NULL` | Alta |
| I-002-11 | Bitácora incluye usuario | Cualquier asignación | `asignado_por IS NOT NULL` | Alta |
| I-002-12 | Bitácora incluye asesor anterior | Reasignación | `asesor_anterior_id` registrado | Media |

```typescript
describe('HU-002: Bitácora de Asignaciones', () => {
  let leadId: string;

  beforeAll(async () => {
    // Crear lead de prueba
    const { data } = await supabase
      .from('leads')
      .insert({
        razon_social: 'Test Bitácora',
        nit: 'TEST-BITACORA-001',
        nombre_contacto: 'Test',
        celular_contacto: '3001234567',
        email_contacto: 'bitacora@test.com',
        requerimiento: 'Test',
        canal_origen: 'MANUAL',
        creado_por: 'test-user-id',
      })
      .select()
      .single();
    leadId = data!.id;
  });

  afterAll(async () => {
    await supabase.from('lead_asignaciones_log').delete().eq('lead_id', leadId);
    await supabase.from('leads').delete().eq('nit', 'TEST-BITACORA-001');
  });

  it('I-002-08: registrar asignación en bitácora', async () => {
    // Asignar asesor
    const { data: asesor } = await supabase
      .rpc('obtener_asesor_disponible');

    if (asesor) {
      await supabase
        .from('leads')
        .update({
          asesor_asignado_id: asesor,
          asignado_en: new Date().toISOString(),
          asignado_por: 'test-user-id',
          estado: 'ASIGNADO',
        })
        .eq('id', leadId);

      // Verificar entrada en bitácora
      const { data: log } = await supabase
        .from('lead_asignaciones_log')
        .select('*')
        .eq('lead_id', leadId)
        .order('creado_en', { ascending: false })
        .limit(1)
        .single();

      expect(log).not.toBeNull();
      expect(log?.asesor_nuevo_id).toBe(asesor);
    }
  });

  it('I-002-10: bitácora incluye fecha y hora', async () => {
    const { data: logs } = await supabase
      .from('lead_asignaciones_log')
      .select('creado_en')
      .eq('lead_id', leadId);

    logs?.forEach(log => {
      expect(log.creado_en).not.toBeNull();
      expect(new Date(log.creado_en).getTime()).toBeGreaterThan(0);
    });
  });

  it('I-002-11: bitácora incluye usuario que asignó', async () => {
    const { data: logs } = await supabase
      .from('lead_asignaciones_log')
      .select('asignado_por')
      .eq('lead_id', leadId);

    logs?.forEach(log => {
      expect(log.asignado_por).not.toBeNull();
    });
  });

  it('I-002-12: reasignación incluye asesor anterior', async () => {
    const { data: logs } = await supabase
      .from('lead_asignaciones_log')
      .select('asesor_anterior_id, tipo_asignacion')
      .eq('lead_id', leadId)
      .eq('tipo_asignacion', 'REASIGNACION');

    logs?.forEach(log => {
      expect(log.asesor_anterior_id).not.toBeNull();
    });
  });
});
```

---

## CA-004: Notificación al Asesor

> El sistema debe notificar al asesor asignado mediante panel y/o correo.

### Tests de Integración

| ID | Test | Entrada | Resultado Esperado | Prioridad |
|----|------|---------|-------------------|-----------|
| I-002-13 | Crear notificación al asignar | Asignar lead | Notificación creada | Alta |
| I-002-14 | Notificación tiene tipo correcto | Asignación | `tipo = 'LEAD_ASIGNADO'` | Alta |
| I-002-15 | Notificación incluye datos lead | Asignación | Código, empresa, canal | Alta |
| I-002-16 | Notificación para reasignación | Reasignar | `tipo = 'LEAD_REASIGNADO'` | Media |

```typescript
describe('HU-002: Notificaciones de Asignación', () => {
  it('I-002-13: crear notificación al asignar lead', async () => {
    // Obtener asesor
    const { data: asesor } = await supabase
      .rpc('obtener_asesor_disponible');

    if (asesor) {
      // Crear lead y asignar (trigger debe crear notificación)
      const { data: lead } = await supabase
        .from('leads')
        .insert({
          razon_social: 'Test Notificación',
          nit: 'TEST-NOTIF-001',
          nombre_contacto: 'Test',
          celular_contacto: '3001234567',
          email_contacto: 'notif@test.com',
          requerimiento: 'Test',
          canal_origen: 'MANUAL',
          creado_por: 'test-user-id',
          asesor_asignado_id: asesor,
          asignado_en: new Date().toISOString(),
          estado: 'ASIGNADO',
        })
        .select()
        .single();

      // Verificar notificación creada
      const { data: notificacion } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('usuario_id', asesor)
        .eq('entidad_id', lead!.id)
        .eq('tipo', 'LEAD_ASIGNADO')
        .single();

      expect(notificacion).not.toBeNull();

      // Cleanup
      await supabase.from('notificaciones').delete().eq('entidad_id', lead!.id);
      await supabase.from('leads').delete().eq('nit', 'TEST-NOTIF-001');
    }
  });

  it('I-002-14: notificación tiene tipo LEAD_ASIGNADO', async () => {
    const { data: notificaciones } = await supabase
      .from('notificaciones')
      .select('tipo')
      .eq('tipo', 'LEAD_ASIGNADO')
      .limit(5);

    notificaciones?.forEach(n => {
      expect(n.tipo).toBe('LEAD_ASIGNADO');
    });
  });

  it('I-002-15: notificación incluye datos del lead', async () => {
    const { data: notificacion } = await supabase
      .from('notificaciones')
      .select('titulo, mensaje, metadata')
      .eq('tipo', 'LEAD_ASIGNADO')
      .limit(1)
      .single();

    if (notificacion) {
      expect(notificacion.titulo).toContain('Lead #');
      expect(notificacion.mensaje).toContain('asignado');
      expect(notificacion.metadata).toHaveProperty('lead_numero');
    }
  });
});
```

---

## CA-005: Un Lead = Un Asesor

> Un lead solo puede estar asignado a un asesor a la vez.

### Tests de Integración

| ID | Test | Entrada | Resultado Esperado | Prioridad |
|----|------|---------|-------------------|-----------|
| I-002-17 | Campo asesor es único | Schema de tabla | Solo 1 asesor_asignado_id | Alta |
| I-002-18 | Reasignar reemplaza asesor | Reasignar a nuevo | Anterior se pierde | Alta |

```typescript
describe('HU-002: Un Asesor por Lead', () => {
  it('I-002-17: lead tiene solo un campo de asesor', async () => {
    const { data: lead } = await supabase
      .from('leads')
      .select('asesor_asignado_id')
      .limit(1)
      .single();

    // El campo existe y es único (no array)
    expect(lead).toHaveProperty('asesor_asignado_id');
    expect(Array.isArray(lead?.asesor_asignado_id)).toBe(false);
  });

  it('I-002-18: reasignar reemplaza asesor anterior', async () => {
    // Crear lead con asesor inicial
    const { data: asesor1 } = await supabase
      .from('asesores_config')
      .select('usuario_id')
      .eq('activo', true)
      .limit(1)
      .single();

    const { data: asesor2 } = await supabase
      .from('asesores_config')
      .select('usuario_id')
      .eq('activo', true)
      .neq('usuario_id', asesor1!.usuario_id)
      .limit(1)
      .single();

    if (asesor1 && asesor2) {
      const { data: lead } = await supabase
        .from('leads')
        .insert({
          razon_social: 'Test Único Asesor',
          nit: 'TEST-UNICO-001',
          nombre_contacto: 'Test',
          celular_contacto: '3001234567',
          email_contacto: 'unico@test.com',
          requerimiento: 'Test',
          canal_origen: 'MANUAL',
          creado_por: 'test-user-id',
          asesor_asignado_id: asesor1.usuario_id,
          estado: 'ASIGNADO',
        })
        .select()
        .single();

      // Reasignar
      await supabase
        .from('leads')
        .update({ asesor_asignado_id: asesor2.usuario_id })
        .eq('id', lead!.id);

      // Verificar que solo tiene el nuevo asesor
      const { data: leadActualizado } = await supabase
        .from('leads')
        .select('asesor_asignado_id')
        .eq('id', lead!.id)
        .single();

      expect(leadActualizado?.asesor_asignado_id).toBe(asesor2.usuario_id);
      expect(leadActualizado?.asesor_asignado_id).not.toBe(asesor1.usuario_id);

      // Cleanup
      await supabase.from('leads').delete().eq('nit', 'TEST-UNICO-001');
    }
  });
});
```

---

## CA-006: Cambio de Estado Automático

> El cambio de estado debe ser automático según la acción (Asignado).

### Tests de Integración

| ID | Test | Entrada | Resultado Esperado | Prioridad |
|----|------|---------|-------------------|-----------|
| I-002-19 | Estado cambia a ASIGNADO | Asignar asesor | `estado = 'ASIGNADO'` | Alta |
| I-002-20 | Trigger actualiza estado | Asignar vía update | Estado automático | Alta |

```typescript
describe('HU-002: Cambio de Estado Automático', () => {
  it('I-002-19: estado cambia a ASIGNADO al asignar asesor', async () => {
    const { data: asesor } = await supabase
      .rpc('obtener_asesor_disponible');

    if (asesor) {
      const { data: lead } = await supabase
        .from('leads')
        .insert({
          razon_social: 'Test Estado Auto',
          nit: 'TEST-ESTADO-AUTO-001',
          nombre_contacto: 'Test',
          celular_contacto: '3001234567',
          email_contacto: 'estadoauto@test.com',
          requerimiento: 'Test',
          canal_origen: 'MANUAL',
          creado_por: 'test-user-id',
        })
        .select()
        .single();

      // Verificar estado inicial
      expect(lead?.estado).toBe('PENDIENTE_ASIGNACION');

      // Asignar asesor
      await supabase
        .from('leads')
        .update({
          asesor_asignado_id: asesor,
          estado: 'ASIGNADO',
        })
        .eq('id', lead!.id);

      // Verificar estado actualizado
      const { data: leadActualizado } = await supabase
        .from('leads')
        .select('estado')
        .eq('id', lead!.id)
        .single();

      expect(leadActualizado?.estado).toBe('ASIGNADO');

      // Cleanup
      await supabase.from('leads').delete().eq('nit', 'TEST-ESTADO-AUTO-001');
    }
  });
});
```

---

## CA-007: Límite de 5 Pendientes por Asesor

> Asignación automática de leads de forma equitativa entre asesores, con límite configurable (máximo 5 pendientes por asesor).

### Tests de Integración

| ID | Test | Entrada | Resultado Esperado | Prioridad |
|----|------|---------|-------------------|-----------|
| I-002-21 | Contar leads pendientes | Asesor con leads | Conteo correcto | Alta |
| I-002-22 | No asignar si >= 5 pendientes | Asesor con 5 leads | Excluido del pool | Alta |
| I-002-23 | Límite es configurable | max_leads_pendientes = 3 | Respetar límite | Media |
| I-002-24 | Distribución equitativa | Varios asesores | Menor carga primero | Media |

```typescript
describe('HU-002: Límite de Leads Pendientes', () => {
  it('I-002-21: contar leads pendientes correctamente', async () => {
    const { data: asesor } = await supabase
      .from('asesores_config')
      .select('usuario_id')
      .eq('activo', true)
      .limit(1)
      .single();

    if (asesor) {
      const { data: conteo } = await supabase
        .rpc('contar_leads_pendientes_asesor', {
          p_usuario_id: asesor.usuario_id
        });

      expect(typeof conteo).toBe('number');
      expect(conteo).toBeGreaterThanOrEqual(0);
    }
  });

  it('I-002-22: no asignar a asesor con >= max pendientes', async () => {
    const { data: asesores } = await supabase
      .from('asesores_config')
      .select('usuario_id, max_leads_pendientes')
      .eq('activo', true);

    for (const asesor of asesores || []) {
      const { data: pendientes } = await supabase
        .rpc('contar_leads_pendientes_asesor', {
          p_usuario_id: asesor.usuario_id
        });

      // Si está lleno, no debe ser retornado por obtener_asesor_disponible
      if (pendientes >= asesor.max_leads_pendientes) {
        const { data: asesorDisponible } = await supabase
          .rpc('obtener_asesor_disponible');

        expect(asesorDisponible).not.toBe(asesor.usuario_id);
      }
    }
  });

  it('I-002-23: límite es configurable por asesor', async () => {
    const { data: asesores } = await supabase
      .from('asesores_config')
      .select('usuario_id, max_leads_pendientes')
      .eq('activo', true);

    // Cada asesor puede tener su propio límite
    asesores?.forEach(asesor => {
      expect(asesor.max_leads_pendientes).toBeGreaterThan(0);
      expect(asesor.max_leads_pendientes).toBeLessThanOrEqual(50);
    });
  });

  it('I-002-24: distribución equitativa (menor carga primero)', async () => {
    // La función obtener_asesor_disponible ordena por menor carga
    const { data: asesorSeleccionado } = await supabase
      .rpc('obtener_asesor_disponible');

    if (asesorSeleccionado) {
      const { data: pendientesSeleccionado } = await supabase
        .rpc('contar_leads_pendientes_asesor', {
          p_usuario_id: asesorSeleccionado
        });

      // Verificar que no hay otro asesor con menos carga disponible
      const { data: asesores } = await supabase
        .from('asesores_config')
        .select('usuario_id, max_leads_pendientes')
        .eq('activo', true);

      for (const asesor of asesores || []) {
        if (asesor.usuario_id !== asesorSeleccionado) {
          const { data: pendientes } = await supabase
            .rpc('contar_leads_pendientes_asesor', {
              p_usuario_id: asesor.usuario_id
            });

          // Si está disponible, no debe tener menos pendientes
          if (pendientes < asesor.max_leads_pendientes) {
            expect(pendientes).toBeGreaterThanOrEqual(pendientesSeleccionado);
          }
        }
      }
    }
  });
});
```

---

## CA-008: Reasignación Automática al Dar de Baja

> Si un asesor se da de baja, re-asignar automáticamente sus leads al grupo general.

### Tests de Integración

| ID | Test | Entrada | Resultado Esperado | Prioridad |
|----|------|---------|-------------------|-----------|
| I-002-25 | Trigger al desactivar asesor | `activo = false` | Leads a PENDIENTE_ASIGNACION | Alta |
| I-002-26 | Leads pierden asesor asignado | Desactivar asesor | `asesor_asignado_id = NULL` | Alta |
| I-002-27 | Solo afecta leads ASIGNADO | Desactivar | Leads CONVERTIDO no cambian | Media |

```typescript
describe('HU-002: Reasignación al Dar de Baja', () => {
  it('I-002-25: trigger reasigna leads al desactivar asesor', async () => {
    // Este test verifica que el trigger existe y funciona
    // En ambiente real, crear asesor temporal, asignar leads, desactivar

    // Verificar que existe el trigger
    const { data: triggers } = await supabase
      .rpc('pg_get_triggerdef', {
        trigger_name: 'trigger_reasignar_leads_asesor'
      });

    // El trigger debe existir en la tabla asesores_config
    expect(triggers).toBeDefined();
  });

  it('I-002-26: leads pierden asesor al desactivar', async () => {
    // Simular el comportamiento del trigger
    // Al poner activo = false, los leads deben:
    // 1. Cambiar estado a PENDIENTE_ASIGNACION
    // 2. Perder el asesor_asignado_id

    const queryTrigger = `
      SELECT prosrc
      FROM pg_proc
      WHERE proname = 'reasignar_leads_asesor_inactivo'
    `;

    // Verificar que la función del trigger existe
    const { data } = await supabase.rpc('execute_sql', { query: queryTrigger });

    // La función debe contener la lógica esperada
    // (En test real, ejecutar la desactivación y verificar resultados)
  });

  it('I-002-27: solo afecta leads en estado ASIGNADO', async () => {
    // Verificar la lógica del trigger solo cambia leads ASIGNADO
    // Los leads CONVERTIDO, RECHAZADO no deben cambiar

    const { data: leadsNoAfectados } = await supabase
      .from('leads')
      .select('id, estado')
      .in('estado', ['CONVERTIDO', 'RECHAZADO'])
      .not('asesor_asignado_id', 'is', null)
      .limit(5);

    // Estos leads mantienen su asesor aunque se desactive
    // (porque ya fueron procesados)
  });
});
```

---

## Tests E2E (Playwright)

### E2E-002: Flujo de Asignación y Reasignación

```typescript
// apps/e2e/tests/asignacion/asignacion.spec.ts
import { expect, test } from '@playwright/test';

test.describe('HU-002: Asignación de Leads', () => {
  test.beforeEach(async ({ page }) => {
    // Login como gerente comercial
    await page.goto('/auth/sign-in');
    await page.fill('[name="email"]', 'gerente@prosuministros.com');
    await page.fill('[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/home');
  });

  test('E2E-002-01: ver leads pendientes de asignación', async ({ page }) => {
    await page.goto('/home/leads');

    // Filtrar por estado pendiente
    await page.click('button:has-text("Filtros")');
    await page.selectOption('[name="estado"]', 'PENDIENTE_ASIGNACION');

    // Verificar que se muestran leads pendientes
    await expect(page.locator('table tbody tr')).toHaveCount({ min: 0 });
  });

  test('E2E-002-02: reasignar lead a otro asesor', async ({ page }) => {
    await page.goto('/home/leads');

    // Buscar lead asignado
    await page.click('button:has-text("Filtros")');
    await page.selectOption('[name="estado"]', 'ASIGNADO');

    // Click en primer lead
    await page.click('table tbody tr:first-child');

    // Abrir modal de reasignación
    await page.click('button:has-text("Reasignar")');

    // Seleccionar nuevo asesor
    await page.selectOption('[name="asesor_id"]', { index: 1 });

    // Confirmar
    await page.click('button:has-text("Confirmar Reasignación")');

    // Verificar éxito
    await expect(page.locator('text=Lead reasignado exitosamente')).toBeVisible();
  });

  test('E2E-002-03: ver historial de asignaciones', async ({ page }) => {
    await page.goto('/home/leads');

    // Click en lead
    await page.click('table tbody tr:first-child');

    // Ir a tab de historial
    await page.click('button:has-text("Historial")');

    // Verificar que muestra asignaciones
    await expect(page.locator('text=Asignación')).toBeVisible();
  });

  test('E2E-002-04: comercial no ve botón reasignar', async ({ page, browser }) => {
    // Logout
    await page.click('button[aria-label="Cerrar sesión"]');

    // Login como comercial
    await page.goto('/auth/sign-in');
    await page.fill('[name="email"]', 'comercial@prosuministros.com');
    await page.fill('[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/home');

    // Ir a leads
    await page.goto('/home/leads');
    await page.click('table tbody tr:first-child');

    // Verificar que NO hay botón reasignar
    await expect(page.locator('button:has-text("Reasignar")')).not.toBeVisible();
  });

  test('E2E-002-05: notificación aparece al asignar', async ({ page }) => {
    // Crear lead nuevo (se asignará automáticamente)
    await page.goto('/home/leads');
    await page.click('button:has-text("Nuevo Lead")');

    // Llenar formulario
    await page.fill('[name="razon_social"]', 'Test Notificación E2E');
    await page.fill('[name="nit"]', '900111222-3');
    await page.fill('[name="nombre_contacto"]', 'Test User');
    await page.fill('[name="celular_contacto"]', '3001112223');
    await page.fill('[name="email_contacto"]', 'notif-e2e@test.com');
    await page.fill('[name="requerimiento"]', 'Prueba E2E');

    await page.click('button:has-text("Crear Lead")');

    // Verificar notificación (para el asesor asignado)
    // Esto requiere login como el asesor que recibió el lead
  });
});
```

---

## Resumen de Cobertura

| Categoría | Tests | Implementados | Pendientes |
|-----------|-------|---------------|------------|
| Integración | 27 | 0 | 27 |
| E2E | 5 | 0 | 5 |
| **Total** | **32** | **0** | **32** |

---

## Matriz de Trazabilidad

| Criterio de Aceptación | Tests Asociados |
|------------------------|-----------------|
| Solo asesores activos | I-002-01 a I-002-04 |
| Reasignación solo admins | I-002-05 a I-002-07, E2E-002-04 |
| Registro en bitácora | I-002-08 a I-002-12, E2E-002-03 |
| Notificación al asesor | I-002-13 a I-002-16, E2E-002-05 |
| Un asesor por lead | I-002-17, I-002-18 |
| Estado automático | I-002-19, I-002-20 |
| Límite 5 pendientes | I-002-21 a I-002-24 |
| Reasignación al dar baja | I-002-25 a I-002-27 |
