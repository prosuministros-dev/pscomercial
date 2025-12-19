-- =====================================================
-- MIGRACIÓN: Configuración de Asesores Comerciales
-- HU-0002: Asignación de Leads
-- =====================================================

-- -----------------------------------------------------
-- 1. TABLA: asesores_config
-- -----------------------------------------------------

CREATE TABLE public.asesores_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL UNIQUE REFERENCES public.usuarios(id) ON DELETE CASCADE,
  activo BOOLEAN DEFAULT true,
  max_leads_pendientes INTEGER DEFAULT 5,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  modificado_en TIMESTAMPTZ
);

COMMENT ON TABLE public.asesores_config IS 'Configuración de asesores comerciales para recepción de leads - HU-0002';
COMMENT ON COLUMN public.asesores_config.activo IS 'Si está activo para recibir leads automáticamente';
COMMENT ON COLUMN public.asesores_config.max_leads_pendientes IS 'Máximo de leads pendientes permitidos (default 5)';

-- Índice para asesores activos
CREATE INDEX idx_asesores_activos ON public.asesores_config(activo) WHERE activo = true;

-- Trigger para actualizar timestamp
CREATE TRIGGER trigger_asesores_config_modified
  BEFORE UPDATE ON public.asesores_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_modified_timestamp();

-- -----------------------------------------------------
-- 2. FUNCIÓN: Contar leads pendientes de un asesor
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.contar_leads_pendientes_asesor(p_usuario_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.leads
    WHERE asesor_asignado_id = p_usuario_id
      AND estado IN ('PENDIENTE_ASIGNACION', 'ASIGNADO')
  );
END;
$$;

-- -----------------------------------------------------
-- 3. FUNCIÓN: Obtener asesor disponible para asignación
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.obtener_asesor_disponible()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_usuario_id UUID;
BEGIN
  -- Seleccionar asesor activo con menos leads pendientes
  -- y que no exceda su límite máximo
  SELECT ac.usuario_id INTO v_usuario_id
  FROM public.asesores_config ac
  JOIN public.usuarios u ON ac.usuario_id = u.id
  WHERE ac.activo = true
    AND u.estado = 'ACTIVO'
    AND public.contar_leads_pendientes_asesor(ac.usuario_id) < ac.max_leads_pendientes
  ORDER BY public.contar_leads_pendientes_asesor(ac.usuario_id) ASC, RANDOM()
  LIMIT 1;

  RETURN v_usuario_id;
END;
$$;

-- -----------------------------------------------------
-- 4. FUNCIÓN: Verificar si usuario es asesor activo
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.es_asesor_activo(p_usuario_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.asesores_config ac
    JOIN public.usuarios u ON ac.usuario_id = u.id
    WHERE ac.usuario_id = p_usuario_id
      AND ac.activo = true
      AND u.estado = 'ACTIVO'
  );
END;
$$;

-- -----------------------------------------------------
-- 5. FUNCIÓN: Reasignar leads de asesor desactivado
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.reasignar_leads_asesor_inactivo()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Si el asesor se desactiva, poner sus leads en estado PENDIENTE_ASIGNACION
  IF OLD.activo = true AND NEW.activo = false THEN
    UPDATE public.leads
    SET
      estado = 'PENDIENTE_ASIGNACION',
      asesor_asignado_id = NULL,
      modificado_en = NOW()
    WHERE asesor_asignado_id = NEW.usuario_id
      AND estado = 'ASIGNADO';
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger para reasignar leads cuando asesor se desactiva
CREATE TRIGGER trigger_reasignar_leads_asesor
  AFTER UPDATE OF activo ON public.asesores_config
  FOR EACH ROW
  EXECUTE FUNCTION public.reasignar_leads_asesor_inactivo();

-- -----------------------------------------------------
-- 6. ROW LEVEL SECURITY
-- -----------------------------------------------------

ALTER TABLE public.asesores_config ENABLE ROW LEVEL SECURITY;

-- Lectura para autenticados
CREATE POLICY asesores_config_select ON public.asesores_config
  FOR SELECT TO authenticated USING (true);

-- Escritura solo service_role
CREATE POLICY asesores_config_all ON public.asesores_config
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- -----------------------------------------------------
-- 7. GRANTS
-- -----------------------------------------------------

GRANT SELECT ON public.asesores_config TO authenticated;
GRANT ALL ON public.asesores_config TO service_role;

GRANT EXECUTE ON FUNCTION public.contar_leads_pendientes_asesor(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.obtener_asesor_disponible() TO authenticated;
GRANT EXECUTE ON FUNCTION public.es_asesor_activo(UUID) TO authenticated;
