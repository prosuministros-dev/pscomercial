-- =====================================================
-- MIGRACIÓN: Políticas RLS para CRUD de Admin
-- Permite a gerencia gestionar roles, permisos y usuarios
-- =====================================================

-- -----------------------------------------------------
-- 1. ROLES - Políticas CRUD para gerencia
-- -----------------------------------------------------

-- INSERT
DROP POLICY IF EXISTS roles_insert ON public.roles;
CREATE POLICY roles_insert ON public.roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuario_roles ur
      JOIN public.roles r ON ur.rol_id = r.id
      WHERE ur.usuario_id = auth.uid()
      AND r.nombre IN ('GERENCIA_GENERAL', 'GERENCIA_COMERCIAL')
    )
  );

-- UPDATE
DROP POLICY IF EXISTS roles_update ON public.roles;
CREATE POLICY roles_update ON public.roles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuario_roles ur
      JOIN public.roles r ON ur.rol_id = r.id
      WHERE ur.usuario_id = auth.uid()
      AND r.nombre IN ('GERENCIA_GENERAL', 'GERENCIA_COMERCIAL')
    )
  );

-- DELETE
DROP POLICY IF EXISTS roles_delete ON public.roles;
CREATE POLICY roles_delete ON public.roles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuario_roles ur
      JOIN public.roles r ON ur.rol_id = r.id
      WHERE ur.usuario_id = auth.uid()
      AND r.nombre = 'GERENCIA_GENERAL'
    )
  );

-- -----------------------------------------------------
-- 2. ROL_PERMISOS - Políticas CRUD para gerencia
-- -----------------------------------------------------

-- INSERT
DROP POLICY IF EXISTS rol_permisos_insert ON public.rol_permisos;
CREATE POLICY rol_permisos_insert ON public.rol_permisos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuario_roles ur
      JOIN public.roles r ON ur.rol_id = r.id
      WHERE ur.usuario_id = auth.uid()
      AND r.nombre IN ('GERENCIA_GENERAL', 'GERENCIA_COMERCIAL')
    )
  );

-- UPDATE
DROP POLICY IF EXISTS rol_permisos_update ON public.rol_permisos;
CREATE POLICY rol_permisos_update ON public.rol_permisos
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuario_roles ur
      JOIN public.roles r ON ur.rol_id = r.id
      WHERE ur.usuario_id = auth.uid()
      AND r.nombre IN ('GERENCIA_GENERAL', 'GERENCIA_COMERCIAL')
    )
  );

-- DELETE
DROP POLICY IF EXISTS rol_permisos_delete ON public.rol_permisos;
CREATE POLICY rol_permisos_delete ON public.rol_permisos
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuario_roles ur
      JOIN public.roles r ON ur.rol_id = r.id
      WHERE ur.usuario_id = auth.uid()
      AND r.nombre IN ('GERENCIA_GENERAL', 'GERENCIA_COMERCIAL')
    )
  );

-- -----------------------------------------------------
-- 3. USUARIO_ROLES - Políticas CRUD para gerencia
-- -----------------------------------------------------

-- INSERT
DROP POLICY IF EXISTS usuario_roles_insert ON public.usuario_roles;
CREATE POLICY usuario_roles_insert ON public.usuario_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuario_roles ur
      JOIN public.roles r ON ur.rol_id = r.id
      WHERE ur.usuario_id = auth.uid()
      AND r.nombre IN ('GERENCIA_GENERAL', 'GERENCIA_COMERCIAL')
    )
  );

-- UPDATE
DROP POLICY IF EXISTS usuario_roles_update ON public.usuario_roles;
CREATE POLICY usuario_roles_update ON public.usuario_roles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuario_roles ur
      JOIN public.roles r ON ur.rol_id = r.id
      WHERE ur.usuario_id = auth.uid()
      AND r.nombre IN ('GERENCIA_GENERAL', 'GERENCIA_COMERCIAL')
    )
  );

-- DELETE
DROP POLICY IF EXISTS usuario_roles_delete ON public.usuario_roles;
CREATE POLICY usuario_roles_delete ON public.usuario_roles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuario_roles ur
      JOIN public.roles r ON ur.rol_id = r.id
      WHERE ur.usuario_id = auth.uid()
      AND r.nombre IN ('GERENCIA_GENERAL', 'GERENCIA_COMERCIAL')
    )
  );

-- -----------------------------------------------------
-- 4. USUARIOS - Políticas UPDATE para gerencia
-- -----------------------------------------------------

-- UPDATE (para cambiar estado)
DROP POLICY IF EXISTS usuarios_update ON public.usuarios;
CREATE POLICY usuarios_update ON public.usuarios
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuario_roles ur
      JOIN public.roles r ON ur.rol_id = r.id
      WHERE ur.usuario_id = auth.uid()
      AND r.nombre IN ('GERENCIA_GENERAL', 'GERENCIA_COMERCIAL')
    )
  );

-- -----------------------------------------------------
-- 5. GRANTs adicionales
-- -----------------------------------------------------

GRANT INSERT, UPDATE, DELETE ON public.roles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.rol_permisos TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.usuario_roles TO authenticated;
GRANT UPDATE ON public.usuarios TO authenticated;
