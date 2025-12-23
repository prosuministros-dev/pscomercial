-- =====================================================
-- MIGRACIÓN: Permisos adicionales para Asignación
-- HU-0002: Asignación de Leads
-- =====================================================

-- -----------------------------------------------------
-- 1. AGREGAR PERMISOS DE ASIGNACIÓN
-- -----------------------------------------------------

INSERT INTO public.permisos (modulo, accion, descripcion) VALUES
  ('leads', 'APROBAR', 'Reasignar leads a otros asesores')
ON CONFLICT (modulo, accion) DO NOTHING;

-- -----------------------------------------------------
-- 2. FUNCIÓN: Verificar permiso de reasignación
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.puede_reasignar_lead(p_usuario_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Verificar si tiene permiso de APROBAR en leads (reasignación)
  RETURN public.usuario_tiene_permiso(p_usuario_id, 'leads', 'APROBAR');
END;
$$;

-- -----------------------------------------------------
-- 3. FUNCIÓN: Reasignar lead con validación de permisos
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.reasignar_lead(
  p_lead_id UUID,
  p_nuevo_asesor_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_usuario_actual UUID;
  v_asesor_anterior_id UUID;
  v_lead_numero INTEGER;
BEGIN
  v_usuario_actual := auth.uid();

  -- Verificar permisos
  IF NOT public.puede_reasignar_lead(v_usuario_actual) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No tiene permisos para reasignar leads'
    );
  END IF;

  -- Verificar que el nuevo asesor esté activo
  IF NOT public.es_asesor_activo(p_nuevo_asesor_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'El asesor seleccionado no está activo'
    );
  END IF;

  -- Obtener asesor anterior
  SELECT asesor_asignado_id, numero
  INTO v_asesor_anterior_id, v_lead_numero
  FROM public.leads
  WHERE id = p_lead_id;

  -- Actualizar el lead
  UPDATE public.leads
  SET
    asesor_asignado_id = p_nuevo_asesor_id,
    asignado_en = NOW(),
    asignado_por = v_usuario_actual,
    estado = 'ASIGNADO',
    modificado_en = NOW(),
    modificado_por = v_usuario_actual
  WHERE id = p_lead_id;

  -- Registrar en bitácora (el trigger ya lo hace, pero agregamos log adicional)
  INSERT INTO public.lead_asignaciones_log (
    lead_id,
    asesor_anterior_id,
    asesor_nuevo_id,
    tipo_asignacion,
    asignado_por
  ) VALUES (
    p_lead_id,
    v_asesor_anterior_id,
    p_nuevo_asesor_id,
    'REASIGNACION',
    v_usuario_actual
  );

  RETURN jsonb_build_object(
    'success', true,
    'lead_numero', v_lead_numero,
    'asesor_anterior_id', v_asesor_anterior_id,
    'asesor_nuevo_id', p_nuevo_asesor_id
  );
END;
$$;

-- -----------------------------------------------------
-- 4. FUNCIÓN: Obtener estadísticas de asignaciones
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.obtener_estadisticas_asignaciones(
  p_fecha_inicio TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_fecha_fin TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  asesor_id UUID,
  asesor_nombre VARCHAR,
  total_asignados INTEGER,
  total_reasignados INTEGER,
  leads_pendientes INTEGER,
  leads_convertidos INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id AS asesor_id,
    u.nombre AS asesor_nombre,
    COUNT(DISTINCT CASE WHEN l.asesor_asignado_id = u.id THEN l.id END)::INTEGER AS total_asignados,
    COUNT(DISTINCT CASE WHEN lal.tipo_asignacion = 'REASIGNACION' AND lal.asesor_nuevo_id = u.id THEN lal.lead_id END)::INTEGER AS total_reasignados,
    COUNT(DISTINCT CASE WHEN l.asesor_asignado_id = u.id AND l.estado = 'ASIGNADO' THEN l.id END)::INTEGER AS leads_pendientes,
    COUNT(DISTINCT CASE WHEN l.asesor_asignado_id = u.id AND l.estado = 'CONVERTIDO' THEN l.id END)::INTEGER AS leads_convertidos
  FROM public.usuarios u
  JOIN public.asesores_config ac ON u.id = ac.usuario_id
  LEFT JOIN public.leads l ON l.asesor_asignado_id = u.id
    AND l.creado_en BETWEEN p_fecha_inicio AND p_fecha_fin
  LEFT JOIN public.lead_asignaciones_log lal ON lal.asesor_nuevo_id = u.id
    AND lal.creado_en BETWEEN p_fecha_inicio AND p_fecha_fin
  WHERE ac.activo = true
  GROUP BY u.id, u.nombre
  ORDER BY total_asignados DESC;
END;
$$;

-- -----------------------------------------------------
-- 5. ASIGNAR PERMISOS A ROLES
-- -----------------------------------------------------

-- Gerencia General y Comercial pueden reasignar leads
INSERT INTO public.rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permisos p
WHERE r.nombre IN ('GERENCIA_GENERAL', 'GERENCIA_COMERCIAL')
  AND p.modulo = 'leads'
  AND p.accion = 'APROBAR'
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------
-- 6. GRANTS
-- -----------------------------------------------------

GRANT EXECUTE ON FUNCTION public.puede_reasignar_lead(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reasignar_lead(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.obtener_estadisticas_asignaciones(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
