-- =====================================================
-- MIGRACIÓN: Sistema de Notificaciones
-- HU-0002: Asignación de Leads (notificación al asesor)
-- =====================================================

-- -----------------------------------------------------
-- 1. TIPOS ENUM
-- -----------------------------------------------------

CREATE TYPE public.notificacion_tipo AS ENUM (
  'LEAD_ASIGNADO',
  'LEAD_REASIGNADO',
  'COTIZACION_CREADA',
  'COTIZACION_APROBACION_REQUERIDA',
  'COTIZACION_APROBADA',
  'COTIZACION_RECHAZADA',
  'MENCION',
  'SISTEMA'
);

CREATE TYPE public.notificacion_prioridad AS ENUM (
  'BAJA',
  'MEDIA',
  'ALTA'
);

-- -----------------------------------------------------
-- 2. TABLA: notificaciones
-- -----------------------------------------------------

CREATE TABLE public.notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Destinatario
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,

  -- Contenido
  tipo public.notificacion_tipo NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  prioridad public.notificacion_prioridad DEFAULT 'MEDIA',

  -- Referencia a entidad relacionada
  entidad_tipo VARCHAR(50), -- 'lead', 'cotizacion', 'pedido', etc.
  entidad_id UUID,

  -- Estado
  leida BOOLEAN DEFAULT false,
  leida_en TIMESTAMPTZ,

  -- Metadatos adicionales
  metadata JSONB DEFAULT '{}',

  -- Auditoría
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.notificaciones IS 'Sistema de notificaciones para usuarios - HU-0002';

-- Índices para consultas frecuentes
CREATE INDEX idx_notificaciones_usuario ON public.notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_usuario_no_leida ON public.notificaciones(usuario_id, leida) WHERE leida = false;
CREATE INDEX idx_notificaciones_fecha ON public.notificaciones(creado_en DESC);
CREATE INDEX idx_notificaciones_tipo ON public.notificaciones(tipo);
CREATE INDEX idx_notificaciones_entidad ON public.notificaciones(entidad_tipo, entidad_id);

-- -----------------------------------------------------
-- 3. FUNCIÓN: Crear notificación
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.crear_notificacion(
  p_usuario_id UUID,
  p_tipo public.notificacion_tipo,
  p_titulo VARCHAR,
  p_mensaje TEXT,
  p_entidad_tipo VARCHAR DEFAULT NULL,
  p_entidad_id UUID DEFAULT NULL,
  p_prioridad public.notificacion_prioridad DEFAULT 'MEDIA',
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_notificacion_id UUID;
BEGIN
  INSERT INTO public.notificaciones (
    usuario_id,
    tipo,
    titulo,
    mensaje,
    entidad_tipo,
    entidad_id,
    prioridad,
    metadata
  ) VALUES (
    p_usuario_id,
    p_tipo,
    p_titulo,
    p_mensaje,
    p_entidad_tipo,
    p_entidad_id,
    p_prioridad,
    p_metadata
  )
  RETURNING id INTO v_notificacion_id;

  RETURN v_notificacion_id;
END;
$$;

-- -----------------------------------------------------
-- 4. FUNCIÓN: Marcar notificación como leída
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.marcar_notificacion_leida(p_notificacion_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.notificaciones
  SET
    leida = true,
    leida_en = NOW()
  WHERE id = p_notificacion_id
    AND usuario_id = auth.uid();

  RETURN FOUND;
END;
$$;

-- -----------------------------------------------------
-- 5. FUNCIÓN: Marcar todas las notificaciones como leídas
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.marcar_todas_notificaciones_leidas()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.notificaciones
  SET
    leida = true,
    leida_en = NOW()
  WHERE usuario_id = auth.uid()
    AND leida = false;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- -----------------------------------------------------
-- 6. FUNCIÓN: Contar notificaciones no leídas
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.contar_notificaciones_no_leidas(p_usuario_id UUID DEFAULT NULL)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.notificaciones
    WHERE usuario_id = COALESCE(p_usuario_id, auth.uid())
      AND leida = false
  );
END;
$$;

-- -----------------------------------------------------
-- 7. TRIGGER: Notificar al asignar lead
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.notificar_asignacion_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_lead_numero INTEGER;
  v_razon_social VARCHAR;
  v_canal VARCHAR;
  v_tipo public.notificacion_tipo;
BEGIN
  -- Solo si se asigna o reasigna un asesor
  IF NEW.asesor_asignado_id IS NOT NULL AND
     (OLD.asesor_asignado_id IS NULL OR OLD.asesor_asignado_id != NEW.asesor_asignado_id) THEN

    -- Obtener datos del lead
    v_lead_numero := NEW.numero;
    v_razon_social := NEW.razon_social;
    v_canal := NEW.canal_origen::VARCHAR;

    -- Determinar si es asignación o reasignación
    IF OLD.asesor_asignado_id IS NULL THEN
      v_tipo := 'LEAD_ASIGNADO';
    ELSE
      v_tipo := 'LEAD_REASIGNADO';
    END IF;

    -- Crear notificación para el nuevo asesor
    PERFORM public.crear_notificacion(
      NEW.asesor_asignado_id,
      v_tipo,
      'Lead #' || v_lead_numero || ' asignado',
      'Se te ha asignado el lead de ' || v_razon_social || ' (Canal: ' || v_canal || ')',
      'lead',
      NEW.id,
      'ALTA',
      jsonb_build_object(
        'lead_numero', v_lead_numero,
        'razon_social', v_razon_social,
        'canal', v_canal
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger en leads para notificar asignación
CREATE TRIGGER trigger_notificar_asignacion_lead
  AFTER UPDATE OF asesor_asignado_id ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.notificar_asignacion_lead();

-- También para inserts con asesor asignado
CREATE OR REPLACE FUNCTION public.notificar_asignacion_lead_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.asesor_asignado_id IS NOT NULL THEN
    PERFORM public.crear_notificacion(
      NEW.asesor_asignado_id,
      'LEAD_ASIGNADO',
      'Lead #' || NEW.numero || ' asignado',
      'Se te ha asignado el lead de ' || NEW.razon_social || ' (Canal: ' || NEW.canal_origen::VARCHAR || ')',
      'lead',
      NEW.id,
      'ALTA',
      jsonb_build_object(
        'lead_numero', NEW.numero,
        'razon_social', NEW.razon_social,
        'canal', NEW.canal_origen::VARCHAR
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notificar_asignacion_lead_insert
  AFTER INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.notificar_asignacion_lead_insert();

-- -----------------------------------------------------
-- 8. TRIGGER: Notificar menciones en observaciones
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.notificar_mencion_observacion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_mencion UUID;
  v_lead_numero INTEGER;
  v_autor_nombre VARCHAR;
BEGIN
  -- Si hay menciones
  IF NEW.menciones IS NOT NULL AND array_length(NEW.menciones, 1) > 0 THEN
    -- Obtener datos del lead
    SELECT numero INTO v_lead_numero FROM public.leads WHERE id = NEW.lead_id;

    -- Obtener nombre del autor
    SELECT nombre INTO v_autor_nombre FROM public.usuarios WHERE id = NEW.usuario_id;

    -- Crear notificación para cada usuario mencionado
    FOREACH v_mencion IN ARRAY NEW.menciones
    LOOP
      -- No notificar al autor
      IF v_mencion != NEW.usuario_id THEN
        PERFORM public.crear_notificacion(
          v_mencion,
          'MENCION',
          'Mención en Lead #' || v_lead_numero,
          v_autor_nombre || ' te mencionó en una observación',
          'lead',
          NEW.lead_id,
          'MEDIA',
          jsonb_build_object(
            'lead_numero', v_lead_numero,
            'observacion_id', NEW.id,
            'autor', v_autor_nombre
          )
        );
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notificar_mencion
  AFTER INSERT ON public.lead_observaciones
  FOR EACH ROW
  EXECUTE FUNCTION public.notificar_mencion_observacion();

-- -----------------------------------------------------
-- 9. ROW LEVEL SECURITY
-- -----------------------------------------------------

ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- Usuario solo puede ver sus propias notificaciones
CREATE POLICY notificaciones_select ON public.notificaciones
  FOR SELECT TO authenticated
  USING (usuario_id = auth.uid());

-- Usuario solo puede actualizar sus propias notificaciones (marcar leída)
CREATE POLICY notificaciones_update ON public.notificaciones
  FOR UPDATE TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

-- Service role puede hacer todo
CREATE POLICY notificaciones_all ON public.notificaciones
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------------
-- 10. GRANTS
-- -----------------------------------------------------

GRANT SELECT, UPDATE ON public.notificaciones TO authenticated;
GRANT ALL ON public.notificaciones TO service_role;

GRANT EXECUTE ON FUNCTION public.crear_notificacion(UUID, public.notificacion_tipo, VARCHAR, TEXT, VARCHAR, UUID, public.notificacion_prioridad, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.marcar_notificacion_leida(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.marcar_todas_notificaciones_leidas() TO authenticated;
GRANT EXECUTE ON FUNCTION public.contar_notificaciones_no_leidas(UUID) TO authenticated;
