-- =====================================================
-- MIGRACIÓN: Políticas RLS para Gestión de Asesores y Usuarios
-- =====================================================

-- -----------------------------------------------------
-- 1. AGREGAR PERMISOS DE GESTIÓN
-- Usamos CREAR para representar permisos de gestión completa
-- -----------------------------------------------------

-- Permiso para gestionar asesores (CREAR = gestión completa del módulo)
INSERT INTO public.permisos (modulo, accion, descripcion) VALUES
  ('asesores', 'CREAR', 'Crear, editar y desactivar asesores comerciales'),
  ('usuarios', 'CREAR', 'Crear y editar usuarios del sistema')
ON CONFLICT (modulo, accion) DO NOTHING;

-- -----------------------------------------------------
-- 2. ASIGNAR PERMISOS A ROLES DE GERENCIA
-- -----------------------------------------------------

-- Gerencia General y Comercial pueden gestionar asesores
INSERT INTO public.rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permisos p
WHERE r.nombre IN ('GERENCIA_GENERAL', 'GERENCIA_COMERCIAL')
  AND p.modulo = 'asesores'
  AND p.accion = 'CREAR'
ON CONFLICT DO NOTHING;

-- Solo Gerencia General puede gestionar usuarios
INSERT INTO public.rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permisos p
WHERE r.nombre = 'GERENCIA_GENERAL'
  AND p.modulo = 'usuarios'
  AND p.accion = 'CREAR'
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------
-- 3. FUNCIÓN: Verificar permiso de gestión de asesores
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.puede_gestionar_asesores(p_usuario_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN public.usuario_tiene_permiso(p_usuario_id, 'asesores', 'CREAR');
END;
$$;

-- -----------------------------------------------------
-- 4. FUNCIÓN: Verificar permiso de gestión de usuarios
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.puede_gestionar_usuarios(p_usuario_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN public.usuario_tiene_permiso(p_usuario_id, 'usuarios', 'CREAR');
END;
$$;

-- -----------------------------------------------------
-- 5. POLÍTICAS RLS PARA asesores_config
-- -----------------------------------------------------

-- Eliminar política anterior de service_role
DROP POLICY IF EXISTS asesores_config_all ON public.asesores_config;

-- INSERT: usuarios con permiso de gestionar asesores
CREATE POLICY asesores_config_insert ON public.asesores_config
  FOR INSERT TO authenticated
  WITH CHECK (public.puede_gestionar_asesores(auth.uid()));

-- UPDATE: usuarios con permiso de gestionar asesores
CREATE POLICY asesores_config_update ON public.asesores_config
  FOR UPDATE TO authenticated
  USING (public.puede_gestionar_asesores(auth.uid()))
  WITH CHECK (public.puede_gestionar_asesores(auth.uid()));

-- DELETE: usuarios con permiso de gestionar asesores
CREATE POLICY asesores_config_delete ON public.asesores_config
  FOR DELETE TO authenticated
  USING (public.puede_gestionar_asesores(auth.uid()));

-- -----------------------------------------------------
-- 6. POLÍTICAS RLS PARA usuarios (si no existen)
-- -----------------------------------------------------

-- Verificar si ya existen políticas y agregarlas si no
DO $$
BEGIN
  -- INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'usuarios' AND policyname = 'usuarios_insert_gestionar'
  ) THEN
    EXECUTE 'CREATE POLICY usuarios_insert_gestionar ON public.usuarios
      FOR INSERT TO authenticated
      WITH CHECK (public.puede_gestionar_usuarios(auth.uid()))';
  END IF;

  -- UPDATE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'usuarios' AND policyname = 'usuarios_update_gestionar'
  ) THEN
    EXECUTE 'CREATE POLICY usuarios_update_gestionar ON public.usuarios
      FOR UPDATE TO authenticated
      USING (public.puede_gestionar_usuarios(auth.uid()) OR id = auth.uid())
      WITH CHECK (public.puede_gestionar_usuarios(auth.uid()) OR id = auth.uid())';
  END IF;
END $$;

-- -----------------------------------------------------
-- 7. GRANTS
-- -----------------------------------------------------

GRANT EXECUTE ON FUNCTION public.puede_gestionar_asesores(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.puede_gestionar_usuarios(UUID) TO authenticated;

-- Permitir INSERT/UPDATE/DELETE a authenticated (RLS controla el acceso)
GRANT INSERT, UPDATE, DELETE ON public.asesores_config TO authenticated;
GRANT INSERT, UPDATE ON public.usuarios TO authenticated;
