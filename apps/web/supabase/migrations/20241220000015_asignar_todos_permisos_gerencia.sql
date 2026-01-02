-- =====================================================
-- MIGRACIÓN: Asignar TODOS los permisos a GERENCIA_GENERAL
-- Soluciona: Rol de gerencia sin permisos asignados en rol_permisos
-- =====================================================

-- -----------------------------------------------------
-- 1. GERENCIA_GENERAL: Asignar TODOS los permisos
-- -----------------------------------------------------

INSERT INTO public.rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permisos p
WHERE r.nombre = 'GERENCIA_GENERAL'
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

-- -----------------------------------------------------
-- 2. GERENCIA_COMERCIAL: Asignar permisos comerciales
-- -----------------------------------------------------

INSERT INTO public.rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permisos p
WHERE r.nombre = 'GERENCIA_COMERCIAL'
  AND p.modulo IN ('leads', 'cotizaciones', 'pedidos', 'asesores', 'reportes')
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

-- -----------------------------------------------------
-- 3. COMERCIAL: Asignar permisos de ventas
-- -----------------------------------------------------

INSERT INTO public.rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permisos p
WHERE r.nombre = 'COMERCIAL'
  AND (
    (p.modulo = 'leads' AND p.accion IN ('VER', 'CREAR', 'EDITAR'))
    OR (p.modulo = 'cotizaciones' AND p.accion IN ('VER', 'CREAR', 'EDITAR'))
    OR (p.modulo = 'pedidos' AND p.accion = 'VER')
  )
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

-- -----------------------------------------------------
-- 4. AUXILIAR_FINANCIERA: Permisos financieros
-- -----------------------------------------------------

INSERT INTO public.rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permisos p
WHERE r.nombre = 'AUXILIAR_FINANCIERA'
  AND p.modulo = 'financiero'
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

-- -----------------------------------------------------
-- 5. Verificación: Mostrar permisos asignados
-- -----------------------------------------------------

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.rol_permisos;
  RAISE NOTICE 'Total de asignaciones rol-permiso: %', v_count;
END $$;
