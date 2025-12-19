-- =====================================================
-- MIGRACIÓN: Módulo de Leads
-- HU-0001: Registro de Leads
-- HU-0002: Asignación de Leads
-- =====================================================

-- -----------------------------------------------------
-- 1. TIPOS ENUM
-- -----------------------------------------------------

CREATE TYPE public.lead_estado AS ENUM (
  'PENDIENTE_ASIGNACION',
  'PENDIENTE_INFORMACION',
  'ASIGNADO',
  'CONVERTIDO',
  'RECHAZADO'
);

CREATE TYPE public.lead_canal AS ENUM (
  'WHATSAPP',
  'WEB',
  'MANUAL'
);

CREATE TYPE public.lead_tipo_asignacion AS ENUM (
  'AUTOMATICA',
  'MANUAL',
  'REASIGNACION'
);

-- -----------------------------------------------------
-- 2. SECUENCIA: Número de lead (inicia en 100)
-- -----------------------------------------------------

CREATE SEQUENCE public.lead_numero_seq
  START WITH 100
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

-- -----------------------------------------------------
-- 3. TABLA: leads
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
  asesor_asignado_id UUID REFERENCES public.usuarios(id),
  asignado_en TIMESTAMPTZ,
  asignado_por UUID REFERENCES auth.users(id),

  -- Conversión
  convertido_en TIMESTAMPTZ,
  cotizacion_id UUID,

  -- Auditoría
  fecha_lead TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  creado_por UUID NOT NULL REFERENCES auth.users(id),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modificado_por UUID REFERENCES auth.users(id),
  modificado_en TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT leads_numero_unique UNIQUE (numero),
  CONSTRAINT leads_celular_check CHECK (celular_contacto ~ '^\+?[0-9\s-]+$'),
  CONSTRAINT leads_email_check CHECK (email_contacto ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

COMMENT ON TABLE public.leads IS 'Leads del proceso comercial - HU-0001';
COMMENT ON COLUMN public.leads.numero IS 'Número consecutivo del lead, inicia en 100';
COMMENT ON COLUMN public.leads.fecha_lead IS 'Fecha del lead, automática pero editable';
COMMENT ON COLUMN public.leads.motivo_rechazo IS 'Obligatorio cuando estado = RECHAZADO';

-- Índices
CREATE INDEX idx_leads_estado ON public.leads(estado);
CREATE INDEX idx_leads_asesor ON public.leads(asesor_asignado_id);
CREATE INDEX idx_leads_nit ON public.leads(nit);
CREATE INDEX idx_leads_email ON public.leads(email_contacto);
CREATE INDEX idx_leads_fecha ON public.leads(fecha_lead DESC);
CREATE INDEX idx_leads_creado ON public.leads(creado_en DESC);

-- -----------------------------------------------------
-- 4. TABLA: lead_observaciones
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

CREATE INDEX idx_lead_observaciones_lead ON public.lead_observaciones(lead_id);
CREATE INDEX idx_lead_observaciones_fecha ON public.lead_observaciones(creado_en DESC);

-- -----------------------------------------------------
-- 5. TABLA: lead_asignaciones_log (bitácora)
-- -----------------------------------------------------

CREATE TABLE public.lead_asignaciones_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  asesor_anterior_id UUID REFERENCES public.usuarios(id),
  asesor_nuevo_id UUID REFERENCES public.usuarios(id),
  tipo_asignacion public.lead_tipo_asignacion NOT NULL,
  asignado_por UUID REFERENCES auth.users(id),
  motivo TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.lead_asignaciones_log IS 'Bitácora de asignaciones y reasignaciones de leads - HU-0002';

CREATE INDEX idx_lead_asignaciones_lead ON public.lead_asignaciones_log(lead_id);
CREATE INDEX idx_lead_asignaciones_fecha ON public.lead_asignaciones_log(creado_en DESC);

-- -----------------------------------------------------
-- 6. TRIGGER: Actualizar timestamp modificado
-- -----------------------------------------------------

CREATE TRIGGER trigger_leads_modified
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_modified_timestamp();

-- -----------------------------------------------------
-- 7. FUNCIÓN: Asignar lead automáticamente
-- -----------------------------------------------------

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
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger para asignación automática después de INSERT
CREATE TRIGGER trigger_lead_asignacion_auto
  BEFORE INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.asignar_lead_automatico();

-- -----------------------------------------------------
-- 8. FUNCIÓN: Registrar asignación en bitácora
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.registrar_asignacion_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Registrar cuando cambia el asesor asignado
  IF (TG_OP = 'INSERT' AND NEW.asesor_asignado_id IS NOT NULL) OR
     (TG_OP = 'UPDATE' AND OLD.asesor_asignado_id IS DISTINCT FROM NEW.asesor_asignado_id AND NEW.asesor_asignado_id IS NOT NULL) THEN

    INSERT INTO public.lead_asignaciones_log (
      lead_id,
      asesor_anterior_id,
      asesor_nuevo_id,
      tipo_asignacion,
      asignado_por
    ) VALUES (
      NEW.id,
      CASE WHEN TG_OP = 'UPDATE' THEN OLD.asesor_asignado_id ELSE NULL END,
      NEW.asesor_asignado_id,
      CASE
        WHEN TG_OP = 'INSERT' THEN 'AUTOMATICA'
        WHEN OLD.asesor_asignado_id IS NULL THEN 'AUTOMATICA'
        ELSE 'REASIGNACION'
      END,
      NEW.asignado_por
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger para registrar asignaciones
CREATE TRIGGER trigger_lead_log_asignacion
  AFTER INSERT OR UPDATE OF asesor_asignado_id ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.registrar_asignacion_lead();

-- -----------------------------------------------------
-- 9. FUNCIÓN: Verificar alerta 24 horas
-- -----------------------------------------------------

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

  IF v_estado IN ('PENDIENTE_ASIGNACION', 'PENDIENTE_INFORMACION', 'ASIGNADO') THEN
    RETURN (NOW() - v_creado_en) > INTERVAL '24 hours';
  END IF;

  RETURN FALSE;
END;
$$;

-- -----------------------------------------------------
-- 10. ROW LEVEL SECURITY
-- -----------------------------------------------------

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_observaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_asignaciones_log ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura
CREATE POLICY leads_select ON public.leads
  FOR SELECT TO authenticated USING (true);

CREATE POLICY lead_obs_select ON public.lead_observaciones
  FOR SELECT TO authenticated USING (true);

CREATE POLICY lead_log_select ON public.lead_asignaciones_log
  FOR SELECT TO authenticated USING (true);

-- Políticas de escritura para usuarios autenticados
CREATE POLICY leads_insert ON public.leads
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = creado_por);

CREATE POLICY leads_update ON public.leads
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY lead_obs_insert ON public.lead_observaciones
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = usuario_id);

-- Políticas para service_role
CREATE POLICY leads_all ON public.leads
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY lead_obs_all ON public.lead_observaciones
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY lead_log_all ON public.lead_asignaciones_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- -----------------------------------------------------
-- 11. GRANTS
-- -----------------------------------------------------

GRANT SELECT, INSERT, UPDATE ON public.leads TO authenticated;
GRANT SELECT, INSERT ON public.lead_observaciones TO authenticated;
GRANT SELECT ON public.lead_asignaciones_log TO authenticated;
GRANT USAGE ON SEQUENCE public.lead_numero_seq TO authenticated;

GRANT ALL ON public.leads TO service_role;
GRANT ALL ON public.lead_observaciones TO service_role;
GRANT ALL ON public.lead_asignaciones_log TO service_role;
GRANT ALL ON SEQUENCE public.lead_numero_seq TO service_role;

GRANT EXECUTE ON FUNCTION public.lead_supera_24h(UUID) TO authenticated;
