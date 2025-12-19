# Migración SQL - Módulo de Leads

> **Referencia**: Plan de Acción - Fase 1
> **Para ejecutar**: Crear archivo en `apps/web/supabase/migrations/`

---

## Migración Completa

```sql
-- =====================================================
-- MIGRACIÓN: Módulo de Leads - PS Comercial
-- HU-0001: Registro de Leads
-- HU-0002: Asignación de Leads
-- =====================================================

-- -----------------------------------------------------
-- 1. TIPOS ENUM
-- -----------------------------------------------------

-- Estados del Lead (según HU y Excel Referencias)
CREATE TYPE public.lead_estado AS ENUM (
  'PENDIENTE_ASIGNACION',  -- Lead recién creado, sin asesor
  'PENDIENTE_INFORMACION', -- Faltan campos obligatorios
  'ASIGNADO',              -- Asignado a un asesor comercial
  'CONVERTIDO',            -- Convertido a cotización
  'RECHAZADO'              -- Descartado (spam, no aplica, etc.)
);

-- Canal de origen del Lead
CREATE TYPE public.lead_canal AS ENUM (
  'WHATSAPP',
  'WEB',
  'MANUAL'
);

-- Tipo de asignación para bitácora
CREATE TYPE public.lead_tipo_asignacion AS ENUM (
  'AUTOMATICA',
  'MANUAL',
  'REASIGNACION'
);

-- -----------------------------------------------------
-- 2. SECUENCIA PARA NÚMERO DE LEAD
-- -----------------------------------------------------

-- Secuencia iniciando en 100 (según HU-0001)
CREATE SEQUENCE public.lead_numero_seq
  START WITH 100
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

-- -----------------------------------------------------
-- 3. TABLA: asesores_comerciales
-- -----------------------------------------------------

CREATE TABLE public.asesores_comerciales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(320) NOT NULL,
  activo BOOLEAN DEFAULT true,
  max_leads_pendientes INTEGER DEFAULT 5,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  modificado_en TIMESTAMPTZ,
  UNIQUE(usuario_id)
);

COMMENT ON TABLE public.asesores_comerciales IS 'Asesores comerciales habilitados para recibir leads';
COMMENT ON COLUMN public.asesores_comerciales.max_leads_pendientes IS 'Máximo de leads pendientes permitidos (default 5 según HU-0002)';

-- Índices
CREATE INDEX idx_asesores_activos ON public.asesores_comerciales(activo) WHERE activo = true;

-- -----------------------------------------------------
-- 4. TABLA: leads
-- -----------------------------------------------------

CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificación
  numero INTEGER NOT NULL DEFAULT nextval('public.lead_numero_seq'),

  -- Datos del cliente/empresa
  razon_social VARCHAR(255) NOT NULL,
  nit VARCHAR(20) NOT NULL,

  -- Datos del contacto
  nombre_contacto VARCHAR(255) NOT NULL,
  celular_contacto VARCHAR(20) NOT NULL,
  email_contacto VARCHAR(320) NOT NULL,

  -- Requerimiento
  requerimiento TEXT NOT NULL,

  -- Origen y estado
  canal_origen public.lead_canal NOT NULL DEFAULT 'MANUAL',
  estado public.lead_estado NOT NULL DEFAULT 'PENDIENTE_ASIGNACION',
  motivo_rechazo TEXT,

  -- Asignación
  asesor_asignado_id UUID REFERENCES public.asesores_comerciales(id),
  asignado_en TIMESTAMPTZ,
  asignado_por UUID REFERENCES auth.users(id),

  -- Conversión
  convertido_en TIMESTAMPTZ,
  cotizacion_id UUID, -- FK a cotizaciones cuando exista

  -- Auditoría
  creado_por UUID NOT NULL REFERENCES auth.users(id),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_lead TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- Editable por usuario
  modificado_por UUID REFERENCES auth.users(id),
  modificado_en TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT leads_numero_unique UNIQUE (numero),
  CONSTRAINT leads_nit_check CHECK (nit ~ '^[0-9.-]+$'),
  CONSTRAINT leads_celular_check CHECK (celular_contacto ~ '^\+?[0-9\s-]+$'),
  CONSTRAINT leads_email_check CHECK (email_contacto ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

COMMENT ON TABLE public.leads IS 'Leads del proceso comercial - HU-0001';
COMMENT ON COLUMN public.leads.numero IS 'Número consecutivo del lead, inicia en 100';
COMMENT ON COLUMN public.leads.fecha_lead IS 'Fecha del lead, automática pero editable';
COMMENT ON COLUMN public.leads.motivo_rechazo IS 'Obligatorio cuando estado = RECHAZADO';

-- Índices para performance
CREATE INDEX idx_leads_estado ON public.leads(estado);
CREATE INDEX idx_leads_asesor ON public.leads(asesor_asignado_id);
CREATE INDEX idx_leads_nit ON public.leads(nit);
CREATE INDEX idx_leads_email ON public.leads(email_contacto);
CREATE INDEX idx_leads_fecha ON public.leads(fecha_lead DESC);
CREATE INDEX idx_leads_creado ON public.leads(creado_en DESC);

-- Índice compuesto para búsqueda de duplicados
CREATE UNIQUE INDEX idx_leads_nit_unique ON public.leads(nit)
  WHERE estado NOT IN ('RECHAZADO');

-- -----------------------------------------------------
-- 5. TABLA: lead_observaciones
-- -----------------------------------------------------

CREATE TABLE public.lead_observaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES auth.users(id),
  texto TEXT NOT NULL,
  menciones UUID[] DEFAULT '{}',
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.lead_observaciones IS 'Observaciones y comentarios en leads con soporte de menciones @usuario';

-- Índices
CREATE INDEX idx_lead_observaciones_lead ON public.lead_observaciones(lead_id);
CREATE INDEX idx_lead_observaciones_fecha ON public.lead_observaciones(creado_en DESC);

-- -----------------------------------------------------
-- 6. TABLA: lead_asignaciones_log
-- -----------------------------------------------------

CREATE TABLE public.lead_asignaciones_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  asesor_anterior_id UUID REFERENCES public.asesores_comerciales(id),
  asesor_nuevo_id UUID REFERENCES public.asesores_comerciales(id),
  tipo_asignacion public.lead_tipo_asignacion NOT NULL,
  asignado_por UUID REFERENCES auth.users(id),
  motivo TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.lead_asignaciones_log IS 'Bitácora de asignaciones y reasignaciones de leads - HU-0002';

-- Índices
CREATE INDEX idx_lead_asignaciones_lead ON public.lead_asignaciones_log(lead_id);
CREATE INDEX idx_lead_asignaciones_fecha ON public.lead_asignaciones_log(creado_en DESC);

-- -----------------------------------------------------
-- 7. FUNCIONES
-- -----------------------------------------------------

-- Función: Contar leads pendientes de un asesor
CREATE OR REPLACE FUNCTION public.contar_leads_pendientes_asesor(p_asesor_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.leads
    WHERE asesor_asignado_id = p_asesor_id
      AND estado IN ('ASIGNADO', 'PENDIENTE_ASIGNACION')
  );
END;
$$;

-- Función: Obtener asesor disponible para asignación automática
CREATE OR REPLACE FUNCTION public.obtener_asesor_disponible()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_asesor_id UUID;
BEGIN
  -- Seleccionar asesor activo con menos leads pendientes y que no exceda el límite
  SELECT ac.id INTO v_asesor_id
  FROM public.asesores_comerciales ac
  WHERE ac.activo = true
    AND public.contar_leads_pendientes_asesor(ac.id) < ac.max_leads_pendientes
  ORDER BY public.contar_leads_pendientes_asesor(ac.id) ASC, RANDOM()
  LIMIT 1;

  RETURN v_asesor_id;
END;
$$;

-- Función: Asignar lead automáticamente
CREATE OR REPLACE FUNCTION public.asignar_lead_automatico()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_asesor_id UUID;
BEGIN
  -- Solo asignar si el lead está en PENDIENTE_ASIGNACION y no tiene asesor
  IF NEW.estado = 'PENDIENTE_ASIGNACION' AND NEW.asesor_asignado_id IS NULL THEN
    v_asesor_id := public.obtener_asesor_disponible();

    IF v_asesor_id IS NOT NULL THEN
      NEW.asesor_asignado_id := v_asesor_id;
      NEW.asignado_en := NOW();
      NEW.estado := 'ASIGNADO';

      -- Registrar en bitácora
      INSERT INTO public.lead_asignaciones_log (
        lead_id, asesor_nuevo_id, tipo_asignacion
      ) VALUES (
        NEW.id, v_asesor_id, 'AUTOMATICA'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Función: Verificar si lead supera 24 horas sin gestión
CREATE OR REPLACE FUNCTION public.lead_supera_24h(p_lead_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_creado_en TIMESTAMPTZ;
  v_estado public.lead_estado;
BEGIN
  SELECT creado_en, estado INTO v_creado_en, v_estado
  FROM public.leads
  WHERE id = p_lead_id;

  -- Solo aplica a leads no convertidos/rechazados
  IF v_estado IN ('PENDIENTE_ASIGNACION', 'PENDIENTE_INFORMACION', 'ASIGNADO') THEN
    RETURN (NOW() - v_creado_en) > INTERVAL '24 hours';
  END IF;

  RETURN FALSE;
END;
$$;

-- Función: Actualizar timestamp de modificación
CREATE OR REPLACE FUNCTION public.update_modified_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.modificado_en := NOW();
  RETURN NEW;
END;
$$;

-- -----------------------------------------------------
-- 8. TRIGGERS
-- -----------------------------------------------------

-- Trigger: Asignación automática al crear lead
CREATE TRIGGER trigger_asignar_lead_automatico
  AFTER INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.asignar_lead_automatico();

-- Trigger: Actualizar timestamp de modificación
CREATE TRIGGER trigger_leads_modified
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_modified_timestamp();

CREATE TRIGGER trigger_asesores_modified
  BEFORE UPDATE ON public.asesores_comerciales
  FOR EACH ROW
  EXECUTE FUNCTION public.update_modified_timestamp();

-- -----------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS)
-- -----------------------------------------------------

-- Habilitar RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_observaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_asignaciones_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asesores_comerciales ENABLE ROW LEVEL SECURITY;

-- Políticas para leads
-- TODO: Ajustar según sistema de roles implementado
CREATE POLICY leads_select ON public.leads
  FOR SELECT
  TO authenticated
  USING (true); -- Temporalmente permite a todos, ajustar con roles

CREATE POLICY leads_insert ON public.leads
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Temporalmente permite a todos

CREATE POLICY leads_update ON public.leads
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para observaciones
CREATE POLICY lead_obs_select ON public.lead_observaciones
  FOR SELECT TO authenticated USING (true);

CREATE POLICY lead_obs_insert ON public.lead_observaciones
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = usuario_id);

-- Políticas para bitácora (solo lectura para usuarios)
CREATE POLICY lead_log_select ON public.lead_asignaciones_log
  FOR SELECT TO authenticated USING (true);

CREATE POLICY lead_log_insert ON public.lead_asignaciones_log
  FOR INSERT TO authenticated WITH CHECK (true);

-- Políticas para asesores
CREATE POLICY asesores_select ON public.asesores_comerciales
  FOR SELECT TO authenticated USING (true);

-- Solo service_role puede modificar asesores
CREATE POLICY asesores_all ON public.asesores_comerciales
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- -----------------------------------------------------
-- 10. GRANTS
-- -----------------------------------------------------

-- Grants para tablas
GRANT SELECT, INSERT, UPDATE ON public.leads TO authenticated;
GRANT SELECT, INSERT ON public.lead_observaciones TO authenticated;
GRANT SELECT, INSERT ON public.lead_asignaciones_log TO authenticated;
GRANT SELECT ON public.asesores_comerciales TO authenticated;

-- Grants para secuencia
GRANT USAGE ON SEQUENCE public.lead_numero_seq TO authenticated;

-- Grants para funciones
GRANT EXECUTE ON FUNCTION public.contar_leads_pendientes_asesor(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.obtener_asesor_disponible() TO authenticated;
GRANT EXECUTE ON FUNCTION public.lead_supera_24h(UUID) TO authenticated;

-- Service role tiene acceso completo
GRANT ALL ON public.leads TO service_role;
GRANT ALL ON public.lead_observaciones TO service_role;
GRANT ALL ON public.lead_asignaciones_log TO service_role;
GRANT ALL ON public.asesores_comerciales TO service_role;
GRANT ALL ON SEQUENCE public.lead_numero_seq TO service_role;

-- -----------------------------------------------------
-- 11. DATOS INICIALES (Opcional - para desarrollo)
-- -----------------------------------------------------

-- Insertar asesores de prueba (descomentar para desarrollo)
/*
INSERT INTO public.asesores_comerciales (usuario_id, nombre, email, activo)
SELECT id, raw_user_meta_data->>'name', email, true
FROM auth.users
WHERE email IN ('comercial1@pscomercial.com', 'comercial2@pscomercial.com')
ON CONFLICT (usuario_id) DO NOTHING;
*/
```

---

## Comandos para Ejecutar

```bash
# 1. Crear archivo de migración
# Copiar el SQL anterior a:
# apps/web/supabase/migrations/[timestamp]_leads_schema.sql

# 2. Resetear base de datos (desarrollo)
pnpm supabase:web:reset

# 3. Regenerar tipos TypeScript
pnpm supabase:web:typegen
```

---

## Verificación Post-Migración

```sql
-- Verificar tablas creadas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('leads', 'lead_observaciones', 'lead_asignaciones_log', 'asesores_comerciales');

-- Verificar secuencia
SELECT last_value FROM public.lead_numero_seq;

-- Verificar ENUMs
SELECT typname FROM pg_type WHERE typname LIKE 'lead_%';

-- Verificar funciones
SELECT proname FROM pg_proc WHERE proname LIKE '%lead%' OR proname LIKE '%asesor%';

-- Verificar políticas RLS
SELECT policyname, tablename FROM pg_policies WHERE tablename LIKE 'lead%';
```

---

## Notas de Implementación

1. **Secuencia #100**: La secuencia `lead_numero_seq` inicia en 100 según HU-0001
2. **Duplicados**: El índice único en NIT solo aplica a leads no rechazados
3. **Asignación automática**: El trigger se ejecuta después de INSERT
4. **Límite 5 leads**: Configurado en `max_leads_pendientes` por asesor
5. **RLS temporal**: Las políticas actuales son permisivas, ajustar con sistema de roles

---

**Documento generado por**: Claude
**Fecha**: 2025-12-17
