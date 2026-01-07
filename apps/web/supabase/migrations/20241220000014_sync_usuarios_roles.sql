-- =====================================================
-- MIGRACIÓN: Sincronización de Usuarios y Asignación de Roles
-- Soluciona: Usuarios de auth.users sin registro en public.usuarios
-- =====================================================

-- -----------------------------------------------------
-- 1. FUNCIÓN: Sincronizar usuario de auth a public.usuarios
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.sync_user_to_usuarios()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_nombre TEXT;
BEGIN
  -- Obtener nombre del usuario
  v_nombre := COALESCE(
    NEW.raw_user_meta_data ->> 'name',
    NEW.raw_user_meta_data ->> 'full_name',
    split_part(NEW.email, '@', 1)
  );

  -- Insertar en public.usuarios si no existe
  INSERT INTO public.usuarios (
    id,
    nombre,
    email,
    avatar_url,
    estado,
    creado_en
  ) VALUES (
    NEW.id,
    v_nombre,
    NEW.email,
    NEW.raw_user_meta_data ->> 'avatar_url',
    'ACTIVO',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    email = EXCLUDED.email,
    avatar_url = EXCLUDED.avatar_url,
    modificado_en = NOW();

  RETURN NEW;
END;
$$;

-- -----------------------------------------------------
-- 2. TRIGGER: Sincronizar al crear usuario en auth
-- -----------------------------------------------------

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS trigger_sync_user_to_usuarios ON auth.users;

-- Crear trigger
CREATE TRIGGER trigger_sync_user_to_usuarios
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_to_usuarios();

-- -----------------------------------------------------
-- 3. SINCRONIZAR USUARIOS EXISTENTES
-- Migrar todos los usuarios de auth.users a public.usuarios
-- -----------------------------------------------------

INSERT INTO public.usuarios (id, nombre, email, avatar_url, estado, creado_en)
SELECT
  au.id,
  COALESCE(
    au.raw_user_meta_data ->> 'name',
    au.raw_user_meta_data ->> 'full_name',
    split_part(au.email, '@', 1)
  ) AS nombre,
  au.email,
  au.raw_user_meta_data ->> 'avatar_url' AS avatar_url,
  'ACTIVO'::public.usuario_estado AS estado,
  au.created_at AS creado_en
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.usuarios u WHERE u.id = au.id
);

-- -----------------------------------------------------
-- 4. ASIGNAR ROL GERENCIA_GENERAL A USUARIOS SIN ROL
-- El primer usuario registrado será Gerencia General
-- -----------------------------------------------------

-- Asignar GERENCIA_GENERAL a todos los usuarios que no tienen ningún rol
INSERT INTO public.usuario_roles (usuario_id, rol_id, asignado_en)
SELECT
  u.id AS usuario_id,
  r.id AS rol_id,
  NOW() AS asignado_en
FROM public.usuarios u
CROSS JOIN public.roles r
WHERE r.nombre = 'GERENCIA_GENERAL'
  AND NOT EXISTS (
    SELECT 1 FROM public.usuario_roles ur WHERE ur.usuario_id = u.id
  );

-- -----------------------------------------------------
-- 5. FUNCIÓN: Asignar rol por defecto a nuevos usuarios
-- Por defecto asigna COMERCIAL, gerencia se asigna manualmente
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.assign_default_role_to_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_rol_id UUID;
  v_has_users BOOLEAN;
BEGIN
  -- Verificar si es el primer usuario del sistema
  SELECT EXISTS (
    SELECT 1 FROM public.usuario_roles LIMIT 1
  ) INTO v_has_users;

  -- Si no hay usuarios con rol, asignar GERENCIA_GENERAL (primer usuario)
  -- Si ya hay usuarios, asignar COMERCIAL por defecto
  IF NOT v_has_users THEN
    SELECT id INTO v_rol_id FROM public.roles WHERE nombre = 'GERENCIA_GENERAL' LIMIT 1;
  ELSE
    SELECT id INTO v_rol_id FROM public.roles WHERE nombre = 'COMERCIAL' LIMIT 1;
  END IF;

  -- Solo asignar si encontramos un rol y el usuario no tiene rol aún
  IF v_rol_id IS NOT NULL THEN
    INSERT INTO public.usuario_roles (usuario_id, rol_id, asignado_en)
    VALUES (NEW.id, v_rol_id, NOW())
    ON CONFLICT (usuario_id, rol_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- -----------------------------------------------------
-- 6. TRIGGER: Asignar rol al crear usuario en public.usuarios
-- -----------------------------------------------------

DROP TRIGGER IF EXISTS trigger_assign_default_role ON public.usuarios;

CREATE TRIGGER trigger_assign_default_role
  AFTER INSERT ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_role_to_user();

-- -----------------------------------------------------
-- 7. GRANTS
-- -----------------------------------------------------

GRANT EXECUTE ON FUNCTION public.sync_user_to_usuarios() TO service_role;
GRANT EXECUTE ON FUNCTION public.assign_default_role_to_user() TO service_role;
