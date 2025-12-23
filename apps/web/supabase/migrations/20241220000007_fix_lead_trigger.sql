-- =====================================================
-- MIGRACIÓN: Fix trigger de asignación de leads
-- El CASE WHEN necesita cast explícito al ENUM
-- =====================================================

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
      (CASE
        WHEN TG_OP = 'INSERT' THEN 'AUTOMATICA'
        WHEN OLD.asesor_asignado_id IS NULL THEN 'AUTOMATICA'
        ELSE 'REASIGNACION'
      END)::public.lead_tipo_asignacion,
      NEW.asignado_por
    );
  END IF;

  RETURN NEW;
END;
$$;
