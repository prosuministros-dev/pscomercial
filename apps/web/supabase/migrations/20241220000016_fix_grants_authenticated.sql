-- =====================================================
-- MIGRACIÓN: Corregir GRANTs para usuarios autenticados
-- Soluciona: "permission denied for schema public"
-- =====================================================

-- -----------------------------------------------------
-- 1. GRANT USAGE en schema public para authenticated
-- -----------------------------------------------------

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- -----------------------------------------------------
-- 2. GRANTs para tablas de permisos (lectura)
-- -----------------------------------------------------

GRANT SELECT ON public.roles TO authenticated;
GRANT SELECT ON public.roles TO anon;

GRANT SELECT ON public.permisos TO authenticated;
GRANT SELECT ON public.permisos TO anon;

GRANT SELECT ON public.rol_permisos TO authenticated;
GRANT SELECT ON public.rol_permisos TO anon;

GRANT SELECT ON public.usuarios TO authenticated;
GRANT SELECT ON public.usuarios TO anon;

GRANT SELECT ON public.usuario_roles TO authenticated;
GRANT SELECT ON public.usuario_roles TO anon;

-- -----------------------------------------------------
-- 3. GRANTs para service_role (escritura completa)
-- -----------------------------------------------------

GRANT ALL ON public.roles TO service_role;
GRANT ALL ON public.permisos TO service_role;
GRANT ALL ON public.rol_permisos TO service_role;
GRANT ALL ON public.usuarios TO service_role;
GRANT ALL ON public.usuario_roles TO service_role;

-- -----------------------------------------------------
-- 4. Verificar que las políticas RLS existen
-- -----------------------------------------------------

-- Políticas de lectura para authenticated
DO $$
BEGIN
  -- roles
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'roles' AND policyname = 'roles_select') THEN
    CREATE POLICY roles_select ON public.roles FOR SELECT TO authenticated USING (true);
  END IF;

  -- permisos
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'permisos' AND policyname = 'permisos_select') THEN
    CREATE POLICY permisos_select ON public.permisos FOR SELECT TO authenticated USING (true);
  END IF;

  -- rol_permisos
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rol_permisos' AND policyname = 'rol_permisos_select') THEN
    CREATE POLICY rol_permisos_select ON public.rol_permisos FOR SELECT TO authenticated USING (true);
  END IF;

  -- usuarios
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'usuarios' AND policyname = 'usuarios_select') THEN
    CREATE POLICY usuarios_select ON public.usuarios FOR SELECT TO authenticated USING (true);
  END IF;

  -- usuario_roles
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'usuario_roles' AND policyname = 'usuario_roles_select') THEN
    CREATE POLICY usuario_roles_select ON public.usuario_roles FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- -----------------------------------------------------
-- 5. Habilitar RLS si no está habilitado
-- -----------------------------------------------------

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rol_permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_roles ENABLE ROW LEVEL SECURITY;
