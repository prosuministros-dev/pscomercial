# Plan de Trabajo - Modulo de Notificaciones (HU-0009)

**Fecha**: 2026-01-02
**HU**: HU-0009 - Seguimiento y Alertas Automaticas de Cotizaciones
**Estado**: Planificacion

---

## Resumen Ejecutivo

Implementar un sistema de alertas internas y seguimiento que permita:
- Campo de observaciones/comentarios en COT, OP, OC
- Menciones @usuario con notificaciones internas
- Alertas automaticas por cambios de estado
- Bitacora de seguimiento con trazabilidad completa
- Notificaciones en tiempo real (campana interna)

---

## Estado Actual del Sistema

### Ya Implementado:
- Tabla `notificaciones` con RLS y Realtime habilitado
- Componente `NotificacionesPanel` con filtros y busqueda
- Server actions basicas: `crearNotificacion`, `marcarNotificacionLeida`
- Schema Zod `notificacionSchema`
- Mock data para testing de UI
- Tabla `cotizacion_historial` para auditoria

### Pendiente de Implementar:
- Sistema de observaciones/comentarios
- Menciones @usuario con autocompletado
- Alertas automaticas por eventos
- Bitacora de seguimiento con filtros
- Integracion con modulos COT, OP, OC

---

## FASE 1: BASE DE DATOS (Supabase)

### DB-1.1: Tabla `observaciones`

```sql
-- Migration: create_observaciones_table
-- Related: HU-0009

CREATE TABLE IF NOT EXISTS public.observaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

    -- Referencia al documento
    referencia_tipo VARCHAR(20) NOT NULL CHECK (referencia_tipo IN ('cotizacion', 'orden_pedido', 'orden_compra', 'lead')),
    referencia_id UUID NOT NULL,

    -- Contenido
    contenido TEXT NOT NULL CHECK (char_length(contenido) <= 2000),
    menciones UUID[] DEFAULT '{}', -- Array de user IDs mencionados

    -- Metadata
    creado_por UUID NOT NULL REFERENCES auth.users(id),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Indices para busqueda
    CONSTRAINT observaciones_contenido_minimo CHECK (char_length(contenido) >= 1)
);

-- Comentarios NO pueden ser editados ni eliminados (solo INSERT)
COMMENT ON TABLE public.observaciones IS 'Observaciones/comentarios internos de documentos. Inmutables despues de creacion.';

-- Indices
CREATE INDEX idx_observaciones_org ON public.observaciones(organization_id);
CREATE INDEX idx_observaciones_ref ON public.observaciones(referencia_tipo, referencia_id);
CREATE INDEX idx_observaciones_usuario ON public.observaciones(creado_por);
CREATE INDEX idx_observaciones_fecha ON public.observaciones(creado_en DESC);
CREATE INDEX idx_observaciones_menciones ON public.observaciones USING GIN(menciones);

-- RLS
ALTER TABLE public.observaciones ENABLE ROW LEVEL SECURITY;

-- Policies (solo INSERT, no UPDATE/DELETE)
CREATE POLICY "users_select_org_observaciones" ON public.observaciones
    FOR SELECT TO authenticated
    USING (organization_id IN (
        SELECT organization_id FROM public.accounts WHERE id = auth.uid()
    ));

CREATE POLICY "users_insert_org_observaciones" ON public.observaciones
    FOR INSERT TO authenticated
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.accounts WHERE id = auth.uid()
        )
        AND creado_por = auth.uid()
    );

-- NO policies para UPDATE/DELETE (comentarios son inmutables)
```

### DB-1.2: Tabla `alertas_internas`

```sql
-- Migration: create_alertas_internas_table
-- Related: HU-0009

CREATE TYPE alerta_tipo AS ENUM ('estado', 'mencion', 'seguimiento');
CREATE TYPE alerta_prioridad AS ENUM ('baja', 'media', 'alta', 'urgente');

CREATE TABLE IF NOT EXISTS public.alertas_internas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

    -- Destinatario
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Tipo y origen
    tipo alerta_tipo NOT NULL,
    prioridad alerta_prioridad DEFAULT 'media',

    -- Contenido
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT,
    extracto VARCHAR(100), -- Primeras 100 letras del comentario

    -- Referencia al documento
    referencia_tipo VARCHAR(20) CHECK (referencia_tipo IN ('cotizacion', 'orden_pedido', 'orden_compra', 'lead')),
    referencia_id UUID,
    referencia_numero INTEGER, -- Numero del documento (COT-30001, OP-1001, etc.)

    -- Origen de la alerta
    generado_por UUID REFERENCES auth.users(id), -- Usuario que genero la alerta (para menciones)
    observacion_id UUID REFERENCES public.observaciones(id), -- Si viene de un comentario

    -- Estado
    leida BOOLEAN DEFAULT FALSE,
    leida_en TIMESTAMPTZ,

    -- Metadata
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expira_en TIMESTAMPTZ -- Para alertas con vencimiento
);

COMMENT ON TABLE public.alertas_internas IS 'Alertas internas del sistema mostradas en campana de notificaciones';

-- Indices
CREATE INDEX idx_alertas_usuario ON public.alertas_internas(usuario_id);
CREATE INDEX idx_alertas_org ON public.alertas_internas(organization_id);
CREATE INDEX idx_alertas_leida ON public.alertas_internas(usuario_id, leida);
CREATE INDEX idx_alertas_fecha ON public.alertas_internas(creado_en DESC);
CREATE INDEX idx_alertas_tipo ON public.alertas_internas(tipo);
CREATE INDEX idx_alertas_ref ON public.alertas_internas(referencia_tipo, referencia_id);

-- RLS
ALTER TABLE public.alertas_internas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_alertas" ON public.alertas_internas
    FOR SELECT TO authenticated
    USING (usuario_id = auth.uid());

CREATE POLICY "users_update_own_alertas" ON public.alertas_internas
    FOR UPDATE TO authenticated
    USING (usuario_id = auth.uid())
    WITH CHECK (usuario_id = auth.uid());

-- Service role puede insertar alertas para cualquier usuario
CREATE POLICY "service_insert_alertas" ON public.alertas_internas
    FOR INSERT TO service_role
    WITH CHECK (true);

-- Usuarios autenticados pueden insertar alertas para otros (menciones)
CREATE POLICY "users_insert_alertas" ON public.alertas_internas
    FOR INSERT TO authenticated
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.accounts WHERE id = auth.uid()
        )
    );

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.alertas_internas;
```

### DB-1.3: Tabla `bitacora_seguimiento`

```sql
-- Migration: create_bitacora_seguimiento_table
-- Related: HU-0009

CREATE TYPE bitacora_evento AS ENUM (
    'creacion',
    'cambio_estado',
    'observacion',
    'mencion',
    'asignacion',
    'aprobacion',
    'rechazo',
    'envio',
    'cierre'
);

CREATE TABLE IF NOT EXISTS public.bitacora_seguimiento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

    -- Referencia al documento
    referencia_tipo VARCHAR(20) NOT NULL CHECK (referencia_tipo IN ('cotizacion', 'orden_pedido', 'orden_compra', 'lead')),
    referencia_id UUID NOT NULL,

    -- Evento
    evento bitacora_evento NOT NULL,
    descripcion TEXT NOT NULL,

    -- Cambios de estado
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50),

    -- Datos adicionales (JSON)
    datos_adicionales JSONB DEFAULT '{}',

    -- Usuario que genero el evento
    usuario_id UUID REFERENCES auth.users(id),
    usuario_nombre VARCHAR(255), -- Cache del nombre para consultas rapidas
    usuario_rol VARCHAR(50), -- Rol al momento del evento

    -- Metadata
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.bitacora_seguimiento IS 'Bitacora completa de eventos y seguimiento de documentos';

-- Indices
CREATE INDEX idx_bitacora_org ON public.bitacora_seguimiento(organization_id);
CREATE INDEX idx_bitacora_ref ON public.bitacora_seguimiento(referencia_tipo, referencia_id);
CREATE INDEX idx_bitacora_usuario ON public.bitacora_seguimiento(usuario_id);
CREATE INDEX idx_bitacora_fecha ON public.bitacora_seguimiento(creado_en DESC);
CREATE INDEX idx_bitacora_evento ON public.bitacora_seguimiento(evento);

-- RLS
ALTER TABLE public.bitacora_seguimiento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_org_bitacora" ON public.bitacora_seguimiento
    FOR SELECT TO authenticated
    USING (organization_id IN (
        SELECT organization_id FROM public.accounts WHERE id = auth.uid()
    ));

CREATE POLICY "service_insert_bitacora" ON public.bitacora_seguimiento
    FOR INSERT TO service_role
    WITH CHECK (true);

CREATE POLICY "users_insert_org_bitacora" ON public.bitacora_seguimiento
    FOR INSERT TO authenticated
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.accounts WHERE id = auth.uid()
        )
    );
```

### DB-1.4: Trigger para Alertas Automaticas

```sql
-- Migration: create_alertas_triggers
-- Related: HU-0009

-- Funcion para crear alerta por cambio de estado
CREATE OR REPLACE FUNCTION crear_alerta_cambio_estado()
RETURNS TRIGGER AS $$
DECLARE
    v_usuarios_destino UUID[];
    v_usuario UUID;
    v_org_id UUID;
    v_titulo TEXT;
    v_documento TEXT;
BEGIN
    -- Solo si cambio el estado
    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
        v_org_id := NEW.organization_id;

        -- Determinar tipo de documento y titulo
        IF TG_TABLE_NAME = 'cotizaciones' THEN
            v_documento := 'COT-' || NEW.numero;
            v_titulo := 'Cotizacion ' || v_documento || ' cambio a ' || NEW.estado;

            -- Determinar destinatarios segun el nuevo estado
            CASE NEW.estado
                WHEN 'APROBACION_MARGEN' THEN
                    -- Alerta a Gerencia y Financiera
                    SELECT ARRAY_AGG(DISTINCT ua.user_id) INTO v_usuarios_destino
                    FROM public.usuario_roles ur
                    JOIN public.roles r ON r.id = ur.rol_id
                    JOIN public.accounts ua ON ua.id = ur.usuario_id
                    WHERE r.nombre IN ('GERENTE_COMERCIAL', 'FINANCIERA')
                    AND ua.organization_id = v_org_id;

                WHEN 'PENDIENTE_OC' THEN
                    -- Alerta a Comercial (asesor asignado)
                    v_usuarios_destino := ARRAY[NEW.asesor_id];

                WHEN 'GANADA' THEN
                    -- Alerta a Compras y Logistica
                    SELECT ARRAY_AGG(DISTINCT ua.user_id) INTO v_usuarios_destino
                    FROM public.usuario_roles ur
                    JOIN public.roles r ON r.id = ur.rol_id
                    JOIN public.accounts ua ON ua.id = ur.usuario_id
                    WHERE r.nombre IN ('COMPRAS', 'LOGISTICA')
                    AND ua.organization_id = v_org_id;

                ELSE
                    -- Alerta solo al asesor asignado
                    v_usuarios_destino := ARRAY[NEW.asesor_id];
            END CASE;
        END IF;

        -- Crear alertas para cada destinatario
        IF v_usuarios_destino IS NOT NULL THEN
            FOREACH v_usuario IN ARRAY v_usuarios_destino LOOP
                IF v_usuario IS NOT NULL THEN
                    INSERT INTO public.alertas_internas (
                        organization_id,
                        usuario_id,
                        tipo,
                        prioridad,
                        titulo,
                        mensaje,
                        referencia_tipo,
                        referencia_id,
                        referencia_numero
                    ) VALUES (
                        v_org_id,
                        v_usuario,
                        'estado',
                        CASE WHEN NEW.estado IN ('APROBACION_MARGEN', 'RIESGO') THEN 'alta' ELSE 'media' END,
                        v_titulo,
                        'Estado anterior: ' || COALESCE(OLD.estado::TEXT, 'ninguno'),
                        TG_TABLE_NAME,
                        NEW.id,
                        NEW.numero
                    );
                END IF;
            END LOOP;
        END IF;

        -- Registrar en bitacora
        INSERT INTO public.bitacora_seguimiento (
            organization_id,
            referencia_tipo,
            referencia_id,
            evento,
            descripcion,
            estado_anterior,
            estado_nuevo,
            usuario_id
        ) VALUES (
            v_org_id,
            TG_TABLE_NAME,
            NEW.id,
            'cambio_estado',
            'Cambio de estado de ' || COALESCE(OLD.estado::TEXT, 'nuevo') || ' a ' || NEW.estado,
            OLD.estado::TEXT,
            NEW.estado::TEXT,
            auth.uid()
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger a cotizaciones
DROP TRIGGER IF EXISTS trigger_alerta_cambio_estado_cotizacion ON public.cotizaciones;
CREATE TRIGGER trigger_alerta_cambio_estado_cotizacion
    AFTER UPDATE ON public.cotizaciones
    FOR EACH ROW
    EXECUTE FUNCTION crear_alerta_cambio_estado();
```

### DB-1.5: Funcion para Procesar Menciones

```sql
-- Migration: create_procesar_menciones_function
-- Related: HU-0009

CREATE OR REPLACE FUNCTION procesar_menciones_observacion()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario_id UUID;
    v_usuario_nombre TEXT;
    v_extracto TEXT;
    v_ref_numero INTEGER;
BEGIN
    -- Obtener extracto (primeras 100 letras)
    v_extracto := LEFT(NEW.contenido, 100);
    IF LENGTH(NEW.contenido) > 100 THEN
        v_extracto := v_extracto || '...';
    END IF;

    -- Obtener nombre del usuario que hizo el comentario
    SELECT name INTO v_usuario_nombre
    FROM public.accounts
    WHERE id = NEW.creado_por;

    -- Obtener numero del documento
    CASE NEW.referencia_tipo
        WHEN 'cotizacion' THEN
            SELECT numero INTO v_ref_numero FROM public.cotizaciones WHERE id = NEW.referencia_id;
        WHEN 'orden_pedido' THEN
            SELECT numero INTO v_ref_numero FROM public.ordenes_pedido WHERE id = NEW.referencia_id;
        WHEN 'orden_compra' THEN
            SELECT numero INTO v_ref_numero FROM public.ordenes_compra WHERE id = NEW.referencia_id;
        ELSE
            v_ref_numero := NULL;
    END CASE;

    -- Crear alerta para cada usuario mencionado
    IF NEW.menciones IS NOT NULL AND array_length(NEW.menciones, 1) > 0 THEN
        FOREACH v_usuario_id IN ARRAY NEW.menciones LOOP
            INSERT INTO public.alertas_internas (
                organization_id,
                usuario_id,
                tipo,
                prioridad,
                titulo,
                mensaje,
                extracto,
                referencia_tipo,
                referencia_id,
                referencia_numero,
                generado_por,
                observacion_id
            ) VALUES (
                NEW.organization_id,
                v_usuario_id,
                'mencion',
                'media',
                COALESCE(v_usuario_nombre, 'Usuario') || ' te menciono en ' ||
                    UPPER(NEW.referencia_tipo) || '-' || COALESCE(v_ref_numero::TEXT, NEW.referencia_id::TEXT),
                'Te han mencionado en un comentario',
                v_extracto,
                NEW.referencia_tipo,
                NEW.referencia_id,
                v_ref_numero,
                NEW.creado_por,
                NEW.id
            );
        END LOOP;
    END IF;

    -- Registrar en bitacora
    INSERT INTO public.bitacora_seguimiento (
        organization_id,
        referencia_tipo,
        referencia_id,
        evento,
        descripcion,
        usuario_id,
        usuario_nombre,
        datos_adicionales
    ) VALUES (
        NEW.organization_id,
        NEW.referencia_tipo,
        NEW.referencia_id,
        CASE WHEN array_length(NEW.menciones, 1) > 0 THEN 'mencion' ELSE 'observacion' END,
        CASE
            WHEN array_length(NEW.menciones, 1) > 0
            THEN 'Nuevo comentario con ' || array_length(NEW.menciones, 1) || ' mencion(es)'
            ELSE 'Nuevo comentario agregado'
        END,
        NEW.creado_por,
        v_usuario_nombre,
        jsonb_build_object(
            'observacion_id', NEW.id,
            'menciones_count', COALESCE(array_length(NEW.menciones, 1), 0)
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger
DROP TRIGGER IF EXISTS trigger_procesar_menciones ON public.observaciones;
CREATE TRIGGER trigger_procesar_menciones
    AFTER INSERT ON public.observaciones
    FOR EACH ROW
    EXECUTE FUNCTION procesar_menciones_observacion();
```

### DB-1.6: Funcion para Contador de Comentarios

```sql
-- Migration: create_contador_observaciones
-- Related: HU-0009

-- Vista materializada para contar comentarios por documento
CREATE OR REPLACE FUNCTION get_observaciones_count(
    p_referencia_tipo TEXT,
    p_referencia_id UUID
) RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM public.observaciones
        WHERE referencia_tipo = p_referencia_tipo
        AND referencia_id = p_referencia_id
    );
END;
$$ LANGUAGE plpgsql STABLE;
```

---

## FASE 2: BACKEND (Server Actions y APIs)

### BE-2.1: Schema Zod

**Archivo**: `apps/web/lib/notificaciones/schemas/notificaciones.schema.ts`

```typescript
import { z } from 'zod';

// Schema para crear observacion
export const crearObservacionSchema = z.object({
  referencia_tipo: z.enum(['cotizacion', 'orden_pedido', 'orden_compra', 'lead']),
  referencia_id: z.string().uuid(),
  contenido: z.string().min(1, 'El comentario no puede estar vacio').max(2000, 'Maximo 2000 caracteres'),
  menciones: z.array(z.string().uuid()).default([]),
});

export type CrearObservacionInput = z.infer<typeof crearObservacionSchema>;

// Schema para observacion completa
export const observacionSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  referencia_tipo: z.string(),
  referencia_id: z.string().uuid(),
  contenido: z.string(),
  menciones: z.array(z.string().uuid()),
  creado_por: z.string().uuid(),
  creado_en: z.string().datetime(),
  // Campos expandidos
  usuario: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email().optional(),
  }).optional(),
});

export type Observacion = z.infer<typeof observacionSchema>;

// Schema para alerta interna
export const alertaInternaSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  usuario_id: z.string().uuid(),
  tipo: z.enum(['estado', 'mencion', 'seguimiento']),
  prioridad: z.enum(['baja', 'media', 'alta', 'urgente']),
  titulo: z.string(),
  mensaje: z.string().nullable(),
  extracto: z.string().nullable(),
  referencia_tipo: z.string().nullable(),
  referencia_id: z.string().uuid().nullable(),
  referencia_numero: z.number().nullable(),
  generado_por: z.string().uuid().nullable(),
  observacion_id: z.string().uuid().nullable(),
  leida: z.boolean(),
  leida_en: z.string().datetime().nullable(),
  creado_en: z.string().datetime(),
  // Campos expandidos
  generado_por_usuario: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }).nullable().optional(),
});

export type AlertaInterna = z.infer<typeof alertaInternaSchema>;

// Schema para filtros de bitacora
export const filtrosBitacoraSchema = z.object({
  referencia_tipo: z.enum(['cotizacion', 'orden_pedido', 'orden_compra', 'lead']).optional(),
  referencia_id: z.string().uuid().optional(),
  usuario_id: z.string().uuid().optional(),
  evento: z.string().optional(),
  fecha_desde: z.string().datetime().optional(),
  fecha_hasta: z.string().datetime().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

export type FiltrosBitacora = z.infer<typeof filtrosBitacoraSchema>;

// Schema para busqueda de usuarios (menciones)
export const buscarUsuariosSchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(10).default(5),
});

export type BuscarUsuariosInput = z.infer<typeof buscarUsuariosSchema>;
```

### BE-2.2: Server Actions - Observaciones

**Archivo**: `apps/web/lib/notificaciones/actions/observaciones.actions.ts`

```typescript
'use server';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { crearObservacionSchema } from '../schemas/notificaciones.schema';
import { revalidatePath } from 'next/cache';

export const crearObservacionAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    // Obtener organization_id del usuario
    const { data: account } = await client
      .from('accounts')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!account?.organization_id) {
      throw new Error('Usuario sin organizacion asignada');
    }

    // Insertar observacion
    const { data: observacion, error } = await client
      .from('observaciones')
      .insert({
        organization_id: account.organization_id,
        referencia_tipo: data.referencia_tipo,
        referencia_id: data.referencia_id,
        contenido: data.contenido,
        menciones: data.menciones,
        creado_por: user.id,
      })
      .select(`
        *,
        usuario:accounts!creado_por(id, name, email)
      `)
      .single();

    if (error) {
      throw new Error(`Error al crear observacion: ${error.message}`);
    }

    // Revalidar paths segun tipo
    revalidatePath(`/home/${data.referencia_tipo}s`);

    return observacion;
  },
  { schema: crearObservacionSchema }
);

export async function getObservaciones(
  referenciaTipo: string,
  referenciaId: string
) {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('observaciones')
    .select(`
      *,
      usuario:accounts!creado_por(id, name, email)
    `)
    .eq('referencia_tipo', referenciaTipo)
    .eq('referencia_id', referenciaId)
    .order('creado_en', { ascending: true });

  if (error) {
    throw new Error(`Error al obtener observaciones: ${error.message}`);
  }

  return data || [];
}

export async function getObservacionesCount(
  referenciaTipo: string,
  referenciaId: string
): Promise<number> {
  const client = getSupabaseServerClient();

  const { count, error } = await client
    .from('observaciones')
    .select('*', { count: 'exact', head: true })
    .eq('referencia_tipo', referenciaTipo)
    .eq('referencia_id', referenciaId);

  if (error) {
    return 0;
  }

  return count || 0;
}
```

### BE-2.3: Server Actions - Alertas

**Archivo**: `apps/web/lib/notificaciones/actions/alertas.actions.ts`

```typescript
'use server';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { revalidatePath } from 'next/cache';

export async function getAlertasInternas(usuarioId: string, soloNoLeidas = false) {
  const client = getSupabaseServerClient();

  let query = client
    .from('alertas_internas')
    .select(`
      *,
      generado_por_usuario:accounts!generado_por(id, name)
    `)
    .eq('usuario_id', usuarioId)
    .order('creado_en', { ascending: false })
    .limit(50);

  if (soloNoLeidas) {
    query = query.eq('leida', false);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Error al obtener alertas: ${error.message}`);
  }

  return data || [];
}

export async function getAlertasNoLeidasCount(usuarioId: string): Promise<number> {
  const client = getSupabaseServerClient();

  const { count, error } = await client
    .from('alertas_internas')
    .select('*', { count: 'exact', head: true })
    .eq('usuario_id', usuarioId)
    .eq('leida', false);

  if (error) {
    return 0;
  }

  return count || 0;
}

export async function marcarAlertaLeida(alertaId: string) {
  const client = getSupabaseServerClient();

  const { error } = await client
    .from('alertas_internas')
    .update({
      leida: true,
      leida_en: new Date().toISOString(),
    })
    .eq('id', alertaId);

  if (error) {
    throw new Error(`Error al marcar alerta como leida: ${error.message}`);
  }

  revalidatePath('/home');
  return true;
}

export async function marcarTodasAlertasLeidas(usuarioId: string) {
  const client = getSupabaseServerClient();

  const { error } = await client
    .from('alertas_internas')
    .update({
      leida: true,
      leida_en: new Date().toISOString(),
    })
    .eq('usuario_id', usuarioId)
    .eq('leida', false);

  if (error) {
    throw new Error(`Error al marcar alertas como leidas: ${error.message}`);
  }

  revalidatePath('/home');
  return true;
}
```

### BE-2.4: API Busqueda de Usuarios

**Archivo**: `apps/web/lib/notificaciones/actions/usuarios.actions.ts`

```typescript
'use server';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function buscarUsuariosMencion(
  query: string,
  organizationId: string,
  limit = 5
) {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('accounts')
    .select('id, name, email')
    .eq('organization_id', organizationId)
    .ilike('name', `%${query}%`)
    .limit(limit);

  if (error) {
    throw new Error(`Error al buscar usuarios: ${error.message}`);
  }

  return data || [];
}
```

### BE-2.5: Server Actions - Bitacora

**Archivo**: `apps/web/lib/notificaciones/actions/bitacora.actions.ts`

```typescript
'use server';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import type { FiltrosBitacora } from '../schemas/notificaciones.schema';

export async function getBitacoraSeguimiento(filtros: FiltrosBitacora) {
  const client = getSupabaseServerClient();

  let query = client
    .from('bitacora_seguimiento')
    .select('*')
    .order('creado_en', { ascending: false })
    .range(filtros.offset, filtros.offset + filtros.limit - 1);

  if (filtros.referencia_tipo) {
    query = query.eq('referencia_tipo', filtros.referencia_tipo);
  }

  if (filtros.referencia_id) {
    query = query.eq('referencia_id', filtros.referencia_id);
  }

  if (filtros.usuario_id) {
    query = query.eq('usuario_id', filtros.usuario_id);
  }

  if (filtros.evento) {
    query = query.eq('evento', filtros.evento);
  }

  if (filtros.fecha_desde) {
    query = query.gte('creado_en', filtros.fecha_desde);
  }

  if (filtros.fecha_hasta) {
    query = query.lte('creado_en', filtros.fecha_hasta);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Error al obtener bitacora: ${error.message}`);
  }

  return data || [];
}
```

---

## FASE 3: FRONTEND (Componentes UI)

### FE-3.1: Componente ObservacionesTimeline

**Archivo**: `apps/web/lib/notificaciones/components/observaciones-timeline.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useObservaciones, useCrearObservacion } from '../hooks/use-observaciones';
import { MentionInput } from './mention-input';
import { Avatar, AvatarFallback } from '@kit/ui/avatar';
import { Button } from '@kit/ui/button';
import { ScrollArea } from '@kit/ui/scroll-area';
import { Spinner } from '@kit/ui/spinner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageSquare, Send } from 'lucide-react';

interface ObservacionesTimelineProps {
  referenciaTipo: 'cotizacion' | 'orden_pedido' | 'orden_compra' | 'lead';
  referenciaId: string;
  organizationId: string;
}

export function ObservacionesTimeline({
  referenciaTipo,
  referenciaId,
  organizationId,
}: ObservacionesTimelineProps) {
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [menciones, setMenciones] = useState<string[]>([]);

  const { data: observaciones, isLoading, refetch } = useObservaciones(
    referenciaTipo,
    referenciaId
  );

  const { mutate: crearObservacion, isPending } = useCrearObservacion();

  const handleSubmit = () => {
    if (!nuevoComentario.trim()) return;

    crearObservacion(
      {
        referencia_tipo: referenciaTipo,
        referencia_id: referenciaId,
        contenido: nuevoComentario,
        menciones,
      },
      {
        onSuccess: () => {
          setNuevoComentario('');
          setMenciones([]);
          refetch();
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">
          Observaciones ({observaciones?.length || 0})
        </h3>
      </div>

      <ScrollArea className="flex-1 pr-4 max-h-[400px]">
        {observaciones && observaciones.length > 0 ? (
          <div className="space-y-4">
            {observaciones.map((obs) => (
              <div key={obs.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {obs.usuario?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {obs.usuario?.name || 'Usuario'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(obs.creado_en), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>
                  <p className="text-sm mt-1 whitespace-pre-wrap">
                    {obs.contenido}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No hay observaciones. Se el primero en comentar.
          </div>
        )}
      </ScrollArea>

      <div className="mt-4 pt-4 border-t">
        <MentionInput
          value={nuevoComentario}
          onChange={setNuevoComentario}
          onMentionsChange={setMenciones}
          organizationId={organizationId}
          placeholder="Escribe un comentario... Usa @ para mencionar usuarios"
          maxLength={2000}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-muted-foreground">
            {nuevoComentario.length}/2000
          </span>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!nuevoComentario.trim() || isPending}
          >
            {isPending ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <>
                <Send className="h-4 w-4 mr-1" />
                Enviar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### FE-3.2: Componente MentionInput

**Archivo**: `apps/web/lib/notificaciones/components/mention-input.tsx`

```typescript
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Textarea } from '@kit/ui/textarea';
import { useBuscarUsuarios } from '../hooks/use-buscar-usuarios';
import { cn } from '@kit/ui/utils';

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onMentionsChange: (userIds: string[]) => void;
  organizationId: string;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

interface Usuario {
  id: string;
  name: string;
  email?: string;
}

export function MentionInput({
  value,
  onChange,
  onMentionsChange,
  organizationId,
  placeholder,
  maxLength = 2000,
  className,
}: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentionedUsers, setMentionedUsers] = useState<Map<string, Usuario>>(new Map());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: usuarios, isLoading } = useBuscarUsuarios(
    searchQuery,
    organizationId,
    showSuggestions && searchQuery.length > 0
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursor = e.target.selectionStart;

    onChange(newValue);
    setCursorPosition(cursor);

    // Detectar si estamos escribiendo una mencion
    const textBeforeCursor = newValue.slice(0, cursor);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setSearchQuery(mentionMatch[1]);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSearchQuery('');
    }
  }, [onChange]);

  const insertMention = useCallback((usuario: Usuario) => {
    const textBeforeCursor = value.slice(0, cursorPosition);
    const textAfterCursor = value.slice(cursorPosition);

    // Encontrar donde empieza la mencion
    const mentionStart = textBeforeCursor.lastIndexOf('@');
    const beforeMention = value.slice(0, mentionStart);

    // Insertar el nombre del usuario
    const newValue = `${beforeMention}@${usuario.name} ${textAfterCursor}`;
    onChange(newValue);

    // Agregar a la lista de mencionados
    const newMentioned = new Map(mentionedUsers);
    newMentioned.set(usuario.id, usuario);
    setMentionedUsers(newMentioned);
    onMentionsChange(Array.from(newMentioned.keys()));

    setShowSuggestions(false);
    setSearchQuery('');

    // Focus en textarea
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  }, [value, cursorPosition, mentionedUsers, onChange, onMentionsChange]);

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={cn('min-h-[80px] resize-none', className)}
      />

      {showSuggestions && (
        <div className="absolute z-50 w-64 mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-auto">
          {isLoading ? (
            <div className="p-2 text-sm text-muted-foreground">
              Buscando usuarios...
            </div>
          ) : usuarios && usuarios.length > 0 ? (
            usuarios.map((usuario) => (
              <button
                key={usuario.id}
                className="w-full px-3 py-2 text-left hover:bg-accent flex items-center gap-2"
                onClick={() => insertMention(usuario)}
              >
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                  {usuario.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium">{usuario.name}</div>
                  {usuario.email && (
                    <div className="text-xs text-muted-foreground">
                      {usuario.email}
                    </div>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="p-2 text-sm text-muted-foreground">
              No se encontraron usuarios
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### FE-3.3: Hook useNotificaciones con Realtime

**Archivo**: `apps/web/lib/notificaciones/hooks/use-notificaciones.ts`

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getSupabaseBrowserClient } from '@kit/supabase/browser-client';
import {
  getAlertasInternas,
  getAlertasNoLeidasCount,
  marcarAlertaLeida,
  marcarTodasAlertasLeidas,
} from '../actions/alertas.actions';

export function useAlertasInternas(usuarioId: string, soloNoLeidas = false) {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  const query = useQuery({
    queryKey: ['alertas-internas', usuarioId, soloNoLeidas],
    queryFn: () => getAlertasInternas(usuarioId, soloNoLeidas),
    staleTime: 30000,
  });

  // Suscripcion Realtime
  useEffect(() => {
    const channel = supabase
      .channel('alertas-internas')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alertas_internas',
          filter: `usuario_id=eq.${usuarioId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ['alertas-internas', usuarioId],
          });
          queryClient.invalidateQueries({
            queryKey: ['alertas-count', usuarioId],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [usuarioId, supabase, queryClient]);

  return query;
}

export function useAlertasCount(usuarioId: string) {
  return useQuery({
    queryKey: ['alertas-count', usuarioId],
    queryFn: () => getAlertasNoLeidasCount(usuarioId),
    staleTime: 30000,
    refetchInterval: 60000, // Refrescar cada minuto
  });
}

export function useMarcarAlertaLeida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: marcarAlertaLeida,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertas-internas'] });
      queryClient.invalidateQueries({ queryKey: ['alertas-count'] });
    },
  });
}

export function useMarcarTodasLeidas(usuarioId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => marcarTodasAlertasLeidas(usuarioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertas-internas'] });
      queryClient.invalidateQueries({ queryKey: ['alertas-count'] });
    },
  });
}
```

### FE-3.4: Componente ContadorComentarios

**Archivo**: `apps/web/lib/notificaciones/components/contador-comentarios.tsx`

```typescript
'use client';

import { useObservacionesCount } from '../hooks/use-observaciones';
import { MessageSquare } from 'lucide-react';
import { cn } from '@kit/ui/utils';

interface ContadorComentariosProps {
  referenciaTipo: 'cotizacion' | 'orden_pedido' | 'orden_compra' | 'lead';
  referenciaId: string;
  className?: string;
}

export function ContadorComentarios({
  referenciaTipo,
  referenciaId,
  className,
}: ContadorComentariosProps) {
  const { data: count } = useObservacionesCount(referenciaTipo, referenciaId);

  if (!count || count === 0) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-1 text-muted-foreground', className)}>
      <MessageSquare className="h-4 w-4" />
      <span className="text-xs font-medium">{count}</span>
    </div>
  );
}
```

---

## FASE 4: INTEGRACIONES

### INT-4.1: Integracion en Modal de Cotizacion

**Modificar**: `apps/web/app/home/cotizaciones/_components/detalle-cotizacion-modal.tsx`

```typescript
// Agregar tab de Observaciones
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { ObservacionesTimeline } from '@/lib/notificaciones/components/observaciones-timeline';

// En el contenido del modal:
<Tabs defaultValue="detalle">
  <TabsList>
    <TabsTrigger value="detalle">Detalle</TabsTrigger>
    <TabsTrigger value="productos">Productos</TabsTrigger>
    <TabsTrigger value="observaciones">
      Observaciones
      <ContadorComentarios
        referenciaTipo="cotizacion"
        referenciaId={cotizacion.id}
      />
    </TabsTrigger>
    <TabsTrigger value="historial">Historial</TabsTrigger>
  </TabsList>

  <TabsContent value="observaciones">
    <ObservacionesTimeline
      referenciaTipo="cotizacion"
      referenciaId={cotizacion.id}
      organizationId={organizationId}
    />
  </TabsContent>
</Tabs>
```

### INT-4.2: Matriz de Notificaciones por Evento

| Evento | Estado Nuevo | Notificar a | Prioridad |
|--------|--------------|-------------|-----------|
| Cotizacion creada | BORRADOR | Asesor | Media |
| Solicitud aprobacion | APROBACION_MARGEN | Gerencia, Financiera | Alta |
| Aprobacion otorgada | NEGOCIACION | Asesor | Media |
| Cotizacion enviada | CREACION_OFERTA | Gerente | Baja |
| Pendiente OC | PENDIENTE_OC | Asesor | Media |
| Cotizacion ganada | GANADA | Compras, Logistica | Alta |
| Cotizacion perdida | PERDIDA | Gerente | Media |
| Mencion @usuario | - | Usuario mencionado | Media |
| Comentario nuevo | - | Participantes del hilo | Baja |

---

## FASE 5: TESTING Y VALIDACION

### Criterios de Aceptacion HU-0009

- [ ] Cada documento (COT, OP, OC) tiene campo de observaciones con historial visible
- [ ] Las menciones @usuario generan notificaciones en campana (sin email)
- [ ] Sistema registra en bitacora todos los comentarios, fechas y usuarios
- [ ] No se permite eliminar ni editar comentarios
- [ ] Los roles pueden visualizar comentarios segun su nivel de acceso
- [ ] Las notificaciones son inmediatas y muestran enlace directo al documento

### Casos de Prueba

| ID | Escenario | Resultado Esperado |
|----|-----------|-------------------|
| TC-001 | Usuario agrega comentario | Comentario visible en timeline |
| TC-002 | Usuario menciona a otro con @ | Usuario mencionado ve notificacion |
| TC-003 | Click en notificacion | Navega al documento correcto |
| TC-004 | Cambio de estado cotizacion | Usuarios correspondientes reciben alerta |
| TC-005 | Intentar editar comentario | Sistema no permite edicion |
| TC-006 | Filtrar bitacora por fecha | Solo muestra eventos del rango |

---

## Resumen de Archivos a Crear/Modificar

### Nuevos Archivos:

```
apps/web/
├── lib/notificaciones/
│   ├── schemas/
│   │   └── notificaciones.schema.ts
│   ├── actions/
│   │   ├── observaciones.actions.ts
│   │   ├── alertas.actions.ts
│   │   ├── bitacora.actions.ts
│   │   └── usuarios.actions.ts
│   ├── hooks/
│   │   ├── use-notificaciones.ts
│   │   ├── use-observaciones.ts
│   │   └── use-buscar-usuarios.ts
│   ├── components/
│   │   ├── observaciones-timeline.tsx
│   │   ├── mention-input.tsx
│   │   ├── alertas-panel.tsx
│   │   ├── bitacora-modal.tsx
│   │   └── contador-comentarios.tsx
│   └── index.ts
└── supabase/migrations/
    └── 20260102XXXXXX_notificaciones_observaciones.sql
```

### Archivos a Modificar:

```
apps/web/
├── app/home/cotizaciones/_components/
│   └── detalle-cotizacion-modal.tsx (agregar tab observaciones)
├── components/
│   └── notificaciones-panel.tsx (integrar alertas internas)
└── components/navigation/
    └── header.tsx (agregar badge con contador)
```

---

**Documento generado por**: @business-analyst + @db-integration + @fullstack-dev
**Fecha**: 2026-01-02
**Version**: 1.0
