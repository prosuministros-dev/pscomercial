-- =====================================================
-- MIGRACIÓN: Campos Faltantes según Excel de Negocio
-- Ajustes para coincidir con PROCESO COMERCIAL.xlsx
-- =====================================================

-- -----------------------------------------------------
-- 1. AGREGAR CAMPOS FALTANTES A CLIENTES
-- -----------------------------------------------------

ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS telefono_principal VARCHAR(20),
  ADD COLUMN IF NOT EXISTS correo_facturacion VARCHAR(320),
  ADD COLUMN IF NOT EXISTS comercial_asignado_id UUID REFERENCES public.usuarios(id);

COMMENT ON COLUMN public.clientes.telefono_principal IS 'Teléfono principal del cliente - OBLIGATORIO';
COMMENT ON COLUMN public.clientes.correo_facturacion IS 'Correo para facturación electrónica';
COMMENT ON COLUMN public.clientes.comercial_asignado_id IS 'Comercial asignado al cliente';

-- Índice para búsqueda por comercial
CREATE INDEX IF NOT EXISTS idx_clientes_comercial ON public.clientes(comercial_asignado_id);

-- -----------------------------------------------------
-- 2. AGREGAR FORMAS DE PAGO FALTANTES
-- -----------------------------------------------------

-- Recrear el ENUM con todas las formas de pago del Excel
-- Primero quitar defaults
ALTER TABLE public.clientes ALTER COLUMN forma_pago DROP DEFAULT;
ALTER TABLE public.cotizaciones ALTER COLUMN forma_pago DROP DEFAULT;

ALTER TYPE public.forma_pago RENAME TO forma_pago_old;

CREATE TYPE public.forma_pago AS ENUM (
  'ANTICIPADO',
  'CONTRA_ENTREGA',
  'CREDITO_8',
  'CREDITO_15',
  'CREDITO_30',
  'CREDITO_45',
  'CREDITO_60',
  'CREDITO_90'
);

-- Migrar datos existentes
ALTER TABLE public.clientes
  ALTER COLUMN forma_pago TYPE public.forma_pago
  USING forma_pago::text::public.forma_pago;

ALTER TABLE public.cotizaciones
  ALTER COLUMN forma_pago TYPE public.forma_pago
  USING forma_pago::text::public.forma_pago;

DROP TYPE public.forma_pago_old;

-- Restaurar defaults
ALTER TABLE public.clientes ALTER COLUMN forma_pago SET DEFAULT 'ANTICIPADO';
ALTER TABLE public.cotizaciones ALTER COLUMN forma_pago SET DEFAULT 'ANTICIPADO';

-- -----------------------------------------------------
-- 3. AGREGAR ESTADOS FALTANTES A COTIZACIÓN
-- -----------------------------------------------------

-- Recrear el ENUM con todos los estados del documento
-- Quitar defaults primero
ALTER TABLE public.cotizaciones ALTER COLUMN estado DROP DEFAULT;

ALTER TYPE public.cotizacion_estado RENAME TO cotizacion_estado_old;

CREATE TYPE public.cotizacion_estado AS ENUM (
  'BORRADOR',
  'CREACION_OFERTA',
  'PENDIENTE_APROBACION_MARGEN',
  'NEGOCIACION',
  'RIESGO',
  'ENVIADA_CLIENTE',
  'PROFORMA_ENVIADA',
  'PENDIENTE_AJUSTES',
  'ACEPTADA_CLIENTE',
  'RECHAZADA_CLIENTE',
  'PENDIENTE_OC',
  'GANADA',
  'PERDIDA'
);

-- Migrar datos existentes
ALTER TABLE public.cotizaciones
  ALTER COLUMN estado TYPE public.cotizacion_estado
  USING estado::text::public.cotizacion_estado;

ALTER TABLE public.cotizacion_historial
  ALTER COLUMN estado_anterior TYPE public.cotizacion_estado
  USING estado_anterior::text::public.cotizacion_estado;

ALTER TABLE public.cotizacion_historial
  ALTER COLUMN estado_nuevo TYPE public.cotizacion_estado
  USING estado_nuevo::text::public.cotizacion_estado;

DROP TYPE public.cotizacion_estado_old;

-- Restaurar default
ALTER TABLE public.cotizaciones ALTER COLUMN estado SET DEFAULT 'BORRADOR';

-- -----------------------------------------------------
-- 4. ACTUALIZAR VERTICALES SEGÚN EXCEL
-- -----------------------------------------------------

-- Limpiar verticales existentes y crear las correctas
TRUNCATE public.verticales CASCADE;

INSERT INTO public.verticales (nombre, descripcion, margen_minimo, margen_sugerido) VALUES
  ('ACCESORIOS', 'Accesorios y periféricos', 7.00, 15.00),
  ('HARDWARE', 'Equipos de hardware, servidores, networking', 7.00, 15.00),
  ('SOFTWARE', 'Licencias y software', 5.00, 12.00),
  ('SERVICIOS', 'Servicios profesionales', 7.00, 20.00),
  ('OTROS', 'Otros productos', 7.00, 15.00);

-- -----------------------------------------------------
-- 5. CREAR TABLA DE MÁRGENES POR VERTICAL + FORMA PAGO
-- -----------------------------------------------------

CREATE TABLE public.margenes_minimos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vertical_id UUID NOT NULL REFERENCES public.verticales(id) ON DELETE CASCADE,
  forma_pago public.forma_pago NOT NULL,
  margen_minimo DECIMAL(5, 4) NOT NULL,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  modificado_en TIMESTAMPTZ,
  UNIQUE(vertical_id, forma_pago)
);

COMMENT ON TABLE public.margenes_minimos IS 'Márgenes mínimos por vertical y forma de pago según Excel';

-- Insertar márgenes según el Excel
DO $$
DECLARE
  v_accesorios UUID;
  v_hardware UUID;
  v_software UUID;
  v_servicios UUID;
  v_otros UUID;
BEGIN
  SELECT id INTO v_accesorios FROM public.verticales WHERE nombre = 'ACCESORIOS';
  SELECT id INTO v_hardware FROM public.verticales WHERE nombre = 'HARDWARE';
  SELECT id INTO v_software FROM public.verticales WHERE nombre = 'SOFTWARE';
  SELECT id INTO v_servicios FROM public.verticales WHERE nombre = 'SERVICIOS';
  SELECT id INTO v_otros FROM public.verticales WHERE nombre = 'OTROS';

  -- ANTICIPADO (7% general, 5% software)
  INSERT INTO public.margenes_minimos (vertical_id, forma_pago, margen_minimo) VALUES
    (v_accesorios, 'ANTICIPADO', 0.07),
    (v_hardware, 'ANTICIPADO', 0.07),
    (v_software, 'ANTICIPADO', 0.05),
    (v_servicios, 'ANTICIPADO', 0.07),
    (v_otros, 'ANTICIPADO', 0.07);

  -- CONTRA_ENTREGA (7% general, 5% software)
  INSERT INTO public.margenes_minimos (vertical_id, forma_pago, margen_minimo) VALUES
    (v_accesorios, 'CONTRA_ENTREGA', 0.07),
    (v_hardware, 'CONTRA_ENTREGA', 0.07),
    (v_software, 'CONTRA_ENTREGA', 0.05),
    (v_servicios, 'CONTRA_ENTREGA', 0.07),
    (v_otros, 'CONTRA_ENTREGA', 0.07);

  -- CREDITO_8 (7% general, 5% software)
  INSERT INTO public.margenes_minimos (vertical_id, forma_pago, margen_minimo) VALUES
    (v_accesorios, 'CREDITO_8', 0.07),
    (v_hardware, 'CREDITO_8', 0.07),
    (v_software, 'CREDITO_8', 0.05),
    (v_servicios, 'CREDITO_8', 0.07),
    (v_otros, 'CREDITO_8', 0.07);

  -- CREDITO_15 (7% general, 5% software)
  INSERT INTO public.margenes_minimos (vertical_id, forma_pago, margen_minimo) VALUES
    (v_accesorios, 'CREDITO_15', 0.07),
    (v_hardware, 'CREDITO_15', 0.07),
    (v_software, 'CREDITO_15', 0.05),
    (v_servicios, 'CREDITO_15', 0.07),
    (v_otros, 'CREDITO_15', 0.07);

  -- CREDITO_30 (7% general, 5% software)
  INSERT INTO public.margenes_minimos (vertical_id, forma_pago, margen_minimo) VALUES
    (v_accesorios, 'CREDITO_30', 0.07),
    (v_hardware, 'CREDITO_30', 0.07),
    (v_software, 'CREDITO_30', 0.05),
    (v_servicios, 'CREDITO_30', 0.07),
    (v_otros, 'CREDITO_30', 0.07);

  -- CREDITO_45 (9% general, 7% software)
  INSERT INTO public.margenes_minimos (vertical_id, forma_pago, margen_minimo) VALUES
    (v_accesorios, 'CREDITO_45', 0.09),
    (v_hardware, 'CREDITO_45', 0.09),
    (v_software, 'CREDITO_45', 0.07),
    (v_servicios, 'CREDITO_45', 0.09),
    (v_otros, 'CREDITO_45', 0.09);

  -- CREDITO_60 (11% general, 9% software)
  INSERT INTO public.margenes_minimos (vertical_id, forma_pago, margen_minimo) VALUES
    (v_accesorios, 'CREDITO_60', 0.11),
    (v_hardware, 'CREDITO_60', 0.11),
    (v_software, 'CREDITO_60', 0.09),
    (v_servicios, 'CREDITO_60', 0.11),
    (v_otros, 'CREDITO_60', 0.11);

  -- CREDITO_90 (asumimos igual que 60 días)
  INSERT INTO public.margenes_minimos (vertical_id, forma_pago, margen_minimo) VALUES
    (v_accesorios, 'CREDITO_90', 0.11),
    (v_hardware, 'CREDITO_90', 0.11),
    (v_software, 'CREDITO_90', 0.09),
    (v_servicios, 'CREDITO_90', 0.11),
    (v_otros, 'CREDITO_90', 0.11);
END;
$$;

-- -----------------------------------------------------
-- 6. FUNCIÓN: Obtener margen mínimo
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.obtener_margen_minimo(
  p_vertical_id UUID,
  p_forma_pago public.forma_pago
)
RETURNS DECIMAL(5, 4)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_margen DECIMAL(5, 4);
BEGIN
  SELECT margen_minimo INTO v_margen
  FROM public.margenes_minimos
  WHERE vertical_id = p_vertical_id
    AND forma_pago = p_forma_pago;

  -- Si no se encuentra, retornar 7% por defecto
  IF v_margen IS NULL THEN
    v_margen := 0.07;
  END IF;

  RETURN v_margen;
END;
$$;

-- -----------------------------------------------------
-- 7. FUNCIÓN: Verificar margen de cotización (mejorada)
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.verificar_margen_cotizacion_v2(p_cotizacion_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_cotizacion RECORD;
  v_item RECORD;
  v_margen_minimo DECIMAL(5, 4);
  v_requiere_aprobacion BOOLEAN := false;
BEGIN
  -- Obtener cotización
  SELECT * INTO v_cotizacion
  FROM public.cotizaciones
  WHERE id = p_cotizacion_id;

  -- Verificar cada item
  FOR v_item IN
    SELECT ci.*, p.vertical_id
    FROM public.cotizacion_items ci
    LEFT JOIN public.productos p ON ci.producto_id = p.id
    WHERE ci.cotizacion_id = p_cotizacion_id
  LOOP
    -- Obtener margen mínimo para este item
    v_margen_minimo := public.obtener_margen_minimo(
      v_item.vertical_id,
      v_cotizacion.forma_pago
    );

    -- Convertir margen del item a decimal (viene en porcentaje)
    IF (v_item.margen_item / 100) < v_margen_minimo THEN
      v_requiere_aprobacion := true;
      EXIT; -- Si un item no cumple, toda la cotización requiere aprobación
    END IF;
  END LOOP;

  -- Actualizar cotización
  UPDATE public.cotizaciones
  SET requiere_aprobacion_margen = v_requiere_aprobacion
  WHERE id = p_cotizacion_id;

  RETURN v_requiere_aprobacion;
END;
$$;

-- -----------------------------------------------------
-- 8. ROW LEVEL SECURITY PARA NUEVA TABLA
-- -----------------------------------------------------

ALTER TABLE public.margenes_minimos ENABLE ROW LEVEL SECURITY;

CREATE POLICY margenes_select ON public.margenes_minimos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY margenes_all ON public.margenes_minimos
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- -----------------------------------------------------
-- 9. GRANTS
-- -----------------------------------------------------

GRANT SELECT ON public.margenes_minimos TO authenticated;
GRANT ALL ON public.margenes_minimos TO service_role;
GRANT EXECUTE ON FUNCTION public.obtener_margen_minimo(UUID, public.forma_pago) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verificar_margen_cotizacion_v2(UUID) TO authenticated;
