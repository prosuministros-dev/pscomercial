-- =====================================================
-- MIGRACIÓN: Clientes y Productos
-- HU-0003: Validación y Creación de Cotización
-- =====================================================

-- -----------------------------------------------------
-- 1. TIPOS ENUM
-- -----------------------------------------------------

CREATE TYPE public.forma_pago AS ENUM (
  'ANTICIPADO',
  'CREDITO_30',
  'CREDITO_60',
  'CREDITO_90'
);

CREATE TYPE public.moneda AS ENUM (
  'COP',
  'USD'
);

CREATE TYPE public.iva_tipo AS ENUM (
  'IVA_0',
  'IVA_5',
  'IVA_19'
);

-- -----------------------------------------------------
-- 2. TABLA: clientes
-- -----------------------------------------------------

CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nit VARCHAR(20) NOT NULL UNIQUE,
  razon_social VARCHAR(255) NOT NULL,
  nombre_contacto VARCHAR(255),
  celular_contacto VARCHAR(20),
  email_contacto VARCHAR(320),
  direccion TEXT,
  ciudad VARCHAR(100),
  departamento VARCHAR(100),
  forma_pago public.forma_pago DEFAULT 'ANTICIPADO',
  cupo_credito DECIMAL(15, 2) DEFAULT 0,
  cupo_disponible DECIMAL(15, 2) DEFAULT 0,
  dias_mora INTEGER DEFAULT 0,
  bloqueado BOOLEAN DEFAULT false,
  motivo_bloqueo TEXT,
  activo BOOLEAN DEFAULT true,
  creado_por UUID REFERENCES auth.users(id),
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  modificado_por UUID REFERENCES auth.users(id),
  modificado_en TIMESTAMPTZ
);

COMMENT ON TABLE public.clientes IS 'Clientes del sistema - HU-0003';

-- Índices
CREATE INDEX idx_clientes_nit ON public.clientes(nit);
CREATE INDEX idx_clientes_razon_social ON public.clientes(razon_social);
CREATE INDEX idx_clientes_activo ON public.clientes(activo) WHERE activo = true;

-- Trigger para actualizar timestamp
CREATE TRIGGER trigger_clientes_modified
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_modified_timestamp();

-- -----------------------------------------------------
-- 3. TABLA: verticales (categorías de producto)
-- -----------------------------------------------------

CREATE TABLE public.verticales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  margen_minimo DECIMAL(5, 2) DEFAULT 15.00,
  margen_sugerido DECIMAL(5, 2) DEFAULT 25.00,
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.verticales IS 'Categorías/verticales de productos con márgenes configurados';

-- Datos iniciales de verticales
INSERT INTO public.verticales (nombre, descripcion, margen_minimo, margen_sugerido) VALUES
  ('Networking', 'Equipos de red y comunicaciones', 12.00, 20.00),
  ('Servidores', 'Servidores y almacenamiento', 10.00, 18.00),
  ('Software', 'Licencias y software', 15.00, 25.00),
  ('Seguridad', 'Equipos y software de seguridad', 18.00, 30.00),
  ('Accesorios', 'Accesorios y periféricos', 20.00, 35.00),
  ('Servicios', 'Servicios profesionales', 25.00, 40.00);

-- -----------------------------------------------------
-- 4. TABLA: marcas
-- -----------------------------------------------------

CREATE TABLE public.marcas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.marcas IS 'Marcas de productos';

-- Datos iniciales de marcas
INSERT INTO public.marcas (nombre) VALUES
  ('Cisco'),
  ('HP'),
  ('Dell'),
  ('Lenovo'),
  ('Microsoft'),
  ('VMware'),
  ('Fortinet'),
  ('Palo Alto'),
  ('Ubiquiti'),
  ('APC'),
  ('Otro');

-- -----------------------------------------------------
-- 5. TABLA: proveedores
-- -----------------------------------------------------

CREATE TABLE public.proveedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  nit VARCHAR(20),
  contacto VARCHAR(255),
  email VARCHAR(320),
  telefono VARCHAR(20),
  tiempo_entrega_dias INTEGER DEFAULT 15,
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  modificado_en TIMESTAMPTZ
);

COMMENT ON TABLE public.proveedores IS 'Proveedores de productos';

-- -----------------------------------------------------
-- 6. TABLA: productos
-- -----------------------------------------------------

CREATE TABLE public.productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_parte VARCHAR(100) NOT NULL UNIQUE,
  nombre VARCHAR(500) NOT NULL,
  descripcion TEXT,
  vertical_id UUID REFERENCES public.verticales(id),
  marca_id UUID REFERENCES public.marcas(id),
  iva_tipo public.iva_tipo DEFAULT 'IVA_19',
  costo_referencia DECIMAL(15, 2),
  moneda_costo public.moneda DEFAULT 'USD',
  proveedor_principal_id UUID REFERENCES public.proveedores(id),
  tiempo_entrega_dias INTEGER DEFAULT 15,
  garantia_meses INTEGER DEFAULT 12,
  activo BOOLEAN DEFAULT true,
  creado_por UUID REFERENCES auth.users(id),
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  modificado_por UUID REFERENCES auth.users(id),
  modificado_en TIMESTAMPTZ
);

COMMENT ON TABLE public.productos IS 'Catálogo de productos - HU-0003';

-- Índices
CREATE INDEX idx_productos_numero_parte ON public.productos(numero_parte);
CREATE INDEX idx_productos_nombre ON public.productos USING gin(to_tsvector('spanish', nombre));
CREATE INDEX idx_productos_vertical ON public.productos(vertical_id);
CREATE INDEX idx_productos_marca ON public.productos(marca_id);
CREATE INDEX idx_productos_activo ON public.productos(activo) WHERE activo = true;

-- Trigger para actualizar timestamp
CREATE TRIGGER trigger_productos_modified
  BEFORE UPDATE ON public.productos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_modified_timestamp();

-- -----------------------------------------------------
-- 7. TABLA: trm_historico (Tasa Representativa del Mercado)
-- -----------------------------------------------------

CREATE TABLE public.trm_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE NOT NULL UNIQUE,
  valor DECIMAL(10, 2) NOT NULL,
  fuente VARCHAR(100) DEFAULT 'manual',
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.trm_historico IS 'Histórico de TRM para conversión USD-COP';

-- Índice para búsqueda por fecha
CREATE INDEX idx_trm_fecha ON public.trm_historico(fecha DESC);

-- Insertar TRM de hoy como ejemplo
INSERT INTO public.trm_historico (fecha, valor, fuente) VALUES
  (CURRENT_DATE, 4250.00, 'inicial');

-- -----------------------------------------------------
-- 8. FUNCIÓN: Obtener TRM del día
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.obtener_trm(p_fecha DATE DEFAULT CURRENT_DATE)
RETURNS DECIMAL(10, 2)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_trm DECIMAL(10, 2);
BEGIN
  -- Buscar TRM de la fecha exacta o la más reciente anterior
  SELECT valor INTO v_trm
  FROM public.trm_historico
  WHERE fecha <= p_fecha
  ORDER BY fecha DESC
  LIMIT 1;

  -- Si no hay TRM, retornar un valor por defecto
  IF v_trm IS NULL THEN
    v_trm := 4000.00;
  END IF;

  RETURN v_trm;
END;
$$;

-- -----------------------------------------------------
-- 9. ROW LEVEL SECURITY
-- -----------------------------------------------------

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verticales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marcas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trm_historico ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura para autenticados
CREATE POLICY clientes_select ON public.clientes FOR SELECT TO authenticated USING (true);
CREATE POLICY verticales_select ON public.verticales FOR SELECT TO authenticated USING (true);
CREATE POLICY marcas_select ON public.marcas FOR SELECT TO authenticated USING (true);
CREATE POLICY proveedores_select ON public.proveedores FOR SELECT TO authenticated USING (true);
CREATE POLICY productos_select ON public.productos FOR SELECT TO authenticated USING (true);
CREATE POLICY trm_select ON public.trm_historico FOR SELECT TO authenticated USING (true);

-- Políticas de escritura para service_role
CREATE POLICY clientes_all ON public.clientes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY verticales_all ON public.verticales FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY marcas_all ON public.marcas FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY proveedores_all ON public.proveedores FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY productos_all ON public.productos FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY trm_all ON public.trm_historico FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Políticas de inserción para usuarios autenticados (crear productos/clientes)
CREATE POLICY clientes_insert ON public.clientes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY productos_insert ON public.productos FOR INSERT TO authenticated WITH CHECK (true);

-- -----------------------------------------------------
-- 10. GRANTS
-- -----------------------------------------------------

GRANT SELECT ON public.clientes TO authenticated;
GRANT SELECT ON public.verticales TO authenticated;
GRANT SELECT ON public.marcas TO authenticated;
GRANT SELECT ON public.proveedores TO authenticated;
GRANT SELECT ON public.productos TO authenticated;
GRANT SELECT ON public.trm_historico TO authenticated;

GRANT INSERT ON public.clientes TO authenticated;
GRANT INSERT ON public.productos TO authenticated;

GRANT ALL ON public.clientes TO service_role;
GRANT ALL ON public.verticales TO service_role;
GRANT ALL ON public.marcas TO service_role;
GRANT ALL ON public.proveedores TO service_role;
GRANT ALL ON public.productos TO service_role;
GRANT ALL ON public.trm_historico TO service_role;

GRANT EXECUTE ON FUNCTION public.obtener_trm(DATE) TO authenticated;
