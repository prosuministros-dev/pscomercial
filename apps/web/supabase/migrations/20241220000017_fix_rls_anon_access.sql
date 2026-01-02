-- =====================================================
-- MIGRACIÓN: Permitir acceso anon a tablas de permisos
-- Soluciona: RLS bloqueando consulta de permisos
-- =====================================================

-- -----------------------------------------------------
-- 1. Eliminar políticas existentes y recrearlas
-- -----------------------------------------------------

-- ROLES
DROP POLICY IF EXISTS roles_select ON public.roles;
CREATE POLICY roles_select ON public.roles
  FOR SELECT
  USING (true);

-- PERMISOS
DROP POLICY IF EXISTS permisos_select ON public.permisos;
CREATE POLICY permisos_select ON public.permisos
  FOR SELECT
  USING (true);

-- ROL_PERMISOS
DROP POLICY IF EXISTS rol_permisos_select ON public.rol_permisos;
CREATE POLICY rol_permisos_select ON public.rol_permisos
  FOR SELECT
  USING (true);

-- USUARIOS (solo lectura pública de datos básicos)
DROP POLICY IF EXISTS usuarios_select ON public.usuarios;
CREATE POLICY usuarios_select ON public.usuarios
  FOR SELECT
  USING (true);

-- USUARIO_ROLES
DROP POLICY IF EXISTS usuario_roles_select ON public.usuario_roles;
CREATE POLICY usuario_roles_select ON public.usuario_roles
  FOR SELECT
  USING (true);

-- -----------------------------------------------------
-- 2. Verificar GRANTs
-- -----------------------------------------------------

GRANT SELECT ON public.roles TO anon, authenticated;
GRANT SELECT ON public.permisos TO anon, authenticated;
GRANT SELECT ON public.rol_permisos TO anon, authenticated;
GRANT SELECT ON public.usuarios TO anon, authenticated;
GRANT SELECT ON public.usuario_roles TO anon, authenticated;
