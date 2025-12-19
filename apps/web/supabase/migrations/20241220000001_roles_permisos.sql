-- =====================================================
-- MIGRACIÓN: Roles y Permisos
-- HU-0011: Creación y Gestión de Roles y Permisos
-- =====================================================

-- -----------------------------------------------------
-- 1. TIPOS ENUM
-- -----------------------------------------------------

CREATE TYPE public.usuario_estado AS ENUM (
  'ACTIVO',
  'INACTIVO'
);

CREATE TYPE public.permiso_accion AS ENUM (
  'CREAR',
  'EDITAR',
  'VER',
  'ELIMINAR',
  'APROBAR',
  'EXPORTAR'
);

-- -----------------------------------------------------
-- 2. TABLA: roles
-- -----------------------------------------------------

CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  estado public.usuario_estado DEFAULT 'ACTIVO',
  creado_por UUID REFERENCES auth.users(id),
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  modificado_por UUID REFERENCES auth.users(id),
  modificado_en TIMESTAMPTZ
);

COMMENT ON TABLE public.roles IS 'Roles del sistema - HU-0011';

-- Índice para búsqueda por estado
CREATE INDEX idx_roles_estado ON public.roles(estado);

-- -----------------------------------------------------
-- 3. TABLA: permisos
-- -----------------------------------------------------

CREATE TABLE public.permisos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo VARCHAR(100) NOT NULL,
  accion public.permiso_accion NOT NULL,
  descripcion TEXT,
  UNIQUE(modulo, accion)
);

COMMENT ON TABLE public.permisos IS 'Permisos disponibles por módulo y acción';

-- -----------------------------------------------------
-- 4. TABLA: rol_permisos (relación muchos a muchos)
-- -----------------------------------------------------

CREATE TABLE public.rol_permisos (
  rol_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  permiso_id UUID REFERENCES public.permisos(id) ON DELETE CASCADE,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (rol_id, permiso_id)
);

COMMENT ON TABLE public.rol_permisos IS 'Permisos asignados a cada rol';

-- -----------------------------------------------------
-- 5. TABLA: usuarios (extensión de auth.users)
-- -----------------------------------------------------

CREATE TABLE public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(320) NOT NULL,
  telefono VARCHAR(20),
  avatar_url VARCHAR(1000),
  area VARCHAR(100),
  estado public.usuario_estado DEFAULT 'ACTIVO',
  ultima_actividad TIMESTAMPTZ,
  creado_por UUID REFERENCES auth.users(id),
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  modificado_por UUID REFERENCES auth.users(id),
  modificado_en TIMESTAMPTZ
);

COMMENT ON TABLE public.usuarios IS 'Datos extendidos de usuarios del sistema';

-- Índices
CREATE INDEX idx_usuarios_estado ON public.usuarios(estado);
CREATE INDEX idx_usuarios_email ON public.usuarios(email);

-- -----------------------------------------------------
-- 6. TABLA: usuario_roles (relación muchos a muchos)
-- -----------------------------------------------------

CREATE TABLE public.usuario_roles (
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  rol_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  asignado_por UUID REFERENCES auth.users(id),
  asignado_en TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (usuario_id, rol_id)
);

COMMENT ON TABLE public.usuario_roles IS 'Roles asignados a cada usuario';

-- Índice para búsqueda por rol
CREATE INDEX idx_usuario_roles_rol ON public.usuario_roles(rol_id);

-- -----------------------------------------------------
-- 7. TABLA: bitacora_admin (auditoría)
-- -----------------------------------------------------

CREATE TABLE public.bitacora_admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(50) NOT NULL,
  entidad_tipo VARCHAR(50) NOT NULL,
  entidad_id UUID,
  usuario_id UUID REFERENCES auth.users(id),
  accion TEXT NOT NULL,
  valor_anterior JSONB,
  valor_nuevo JSONB,
  descripcion TEXT,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.bitacora_admin IS 'Bitácora de acciones administrativas - HU-0011';

-- Índices para búsqueda
CREATE INDEX idx_bitacora_tipo ON public.bitacora_admin(tipo);
CREATE INDEX idx_bitacora_entidad ON public.bitacora_admin(entidad_tipo, entidad_id);
CREATE INDEX idx_bitacora_fecha ON public.bitacora_admin(creado_en DESC);

-- -----------------------------------------------------
-- 8. FUNCIÓN: Actualizar timestamp modificado
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_modified_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.modificado_en := NOW();
  RETURN NEW;
END;
$$;

-- Triggers para actualizar timestamps
CREATE TRIGGER trigger_roles_modified
  BEFORE UPDATE ON public.roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_modified_timestamp();

CREATE TRIGGER trigger_usuarios_modified
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_modified_timestamp();

-- -----------------------------------------------------
-- 9. FUNCIÓN: Verificar permiso de usuario
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.usuario_tiene_permiso(
  p_usuario_id UUID,
  p_modulo VARCHAR,
  p_accion public.permiso_accion
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.usuario_roles ur
    JOIN public.rol_permisos rp ON ur.rol_id = rp.rol_id
    JOIN public.permisos p ON rp.permiso_id = p.id
    JOIN public.roles r ON ur.rol_id = r.id
    WHERE ur.usuario_id = p_usuario_id
      AND p.modulo = p_modulo
      AND p.accion = p_accion
      AND r.estado = 'ACTIVO'
  );
END;
$$;

-- -----------------------------------------------------
-- 10. ROW LEVEL SECURITY
-- -----------------------------------------------------

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rol_permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bitacora_admin ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (lectura para autenticados)
CREATE POLICY roles_select ON public.roles FOR SELECT TO authenticated USING (true);
CREATE POLICY permisos_select ON public.permisos FOR SELECT TO authenticated USING (true);
CREATE POLICY rol_permisos_select ON public.rol_permisos FOR SELECT TO authenticated USING (true);
CREATE POLICY usuarios_select ON public.usuarios FOR SELECT TO authenticated USING (true);
CREATE POLICY usuario_roles_select ON public.usuario_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY bitacora_select ON public.bitacora_admin FOR SELECT TO authenticated USING (true);

-- Políticas de escritura (service_role)
CREATE POLICY roles_all ON public.roles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY permisos_all ON public.permisos FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY rol_permisos_all ON public.rol_permisos FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY usuarios_all ON public.usuarios FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY usuario_roles_all ON public.usuario_roles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY bitacora_all ON public.bitacora_admin FOR ALL TO service_role USING (true) WITH CHECK (true);

-- -----------------------------------------------------
-- 11. GRANTS
-- -----------------------------------------------------

GRANT SELECT ON public.roles TO authenticated;
GRANT SELECT ON public.permisos TO authenticated;
GRANT SELECT ON public.rol_permisos TO authenticated;
GRANT SELECT ON public.usuarios TO authenticated;
GRANT SELECT ON public.usuario_roles TO authenticated;
GRANT SELECT ON public.bitacora_admin TO authenticated;

GRANT ALL ON public.roles TO service_role;
GRANT ALL ON public.permisos TO service_role;
GRANT ALL ON public.rol_permisos TO service_role;
GRANT ALL ON public.usuarios TO service_role;
GRANT ALL ON public.usuario_roles TO service_role;
GRANT ALL ON public.bitacora_admin TO service_role;

GRANT EXECUTE ON FUNCTION public.usuario_tiene_permiso(UUID, VARCHAR, public.permiso_accion) TO authenticated;

-- -----------------------------------------------------
-- 12. DATOS INICIALES: Roles del sistema
-- -----------------------------------------------------

INSERT INTO public.roles (nombre, descripcion, estado) VALUES
  ('GERENCIA_GENERAL', 'Acceso total al sistema', 'ACTIVO'),
  ('GERENCIA_COMERCIAL', 'Gestión del área comercial', 'ACTIVO'),
  ('COMERCIAL', 'Asesor comercial - gestión de leads y cotizaciones', 'ACTIVO'),
  ('COMPRAS', 'Gestión de órdenes de compra', 'ACTIVO'),
  ('AUXILIAR_FINANCIERA', 'Control financiero y cartera', 'ACTIVO'),
  ('AUXILIAR_ADMINISTRATIVA', 'Apoyo administrativo', 'ACTIVO'),
  ('JEFE_BODEGA', 'Gestión de logística y bodega', 'ACTIVO'),
  ('AUXILIAR_BODEGA', 'Apoyo en bodega', 'ACTIVO');

-- -----------------------------------------------------
-- 13. DATOS INICIALES: Permisos por módulo
-- -----------------------------------------------------

INSERT INTO public.permisos (modulo, accion, descripcion) VALUES
  -- Leads
  ('leads', 'VER', 'Ver listado de leads'),
  ('leads', 'CREAR', 'Crear nuevos leads'),
  ('leads', 'EDITAR', 'Editar leads existentes'),
  ('leads', 'ELIMINAR', 'Eliminar leads'),
  -- Cotizaciones
  ('cotizaciones', 'VER', 'Ver listado de cotizaciones'),
  ('cotizaciones', 'CREAR', 'Crear cotizaciones'),
  ('cotizaciones', 'EDITAR', 'Editar cotizaciones'),
  ('cotizaciones', 'ELIMINAR', 'Eliminar cotizaciones'),
  ('cotizaciones', 'APROBAR', 'Aprobar cotizaciones con margen bajo'),
  -- Pedidos
  ('pedidos', 'VER', 'Ver listado de pedidos'),
  ('pedidos', 'CREAR', 'Crear pedidos'),
  ('pedidos', 'EDITAR', 'Editar pedidos'),
  ('pedidos', 'APROBAR', 'Aprobar pedidos'),
  -- Financiero
  ('financiero', 'VER', 'Ver información financiera'),
  ('financiero', 'EDITAR', 'Gestionar bloqueos de cartera'),
  ('financiero', 'APROBAR', 'Aprobar pagos y facturación'),
  -- Reportes
  ('reportes', 'VER', 'Ver reportes'),
  ('reportes', 'EXPORTAR', 'Exportar reportes'),
  -- Usuarios
  ('usuarios', 'VER', 'Ver usuarios'),
  ('usuarios', 'CREAR', 'Crear usuarios'),
  ('usuarios', 'EDITAR', 'Editar usuarios'),
  ('usuarios', 'ELIMINAR', 'Eliminar usuarios'),
  -- Configuración
  ('configuracion', 'VER', 'Ver configuración'),
  ('configuracion', 'EDITAR', 'Modificar configuración');
