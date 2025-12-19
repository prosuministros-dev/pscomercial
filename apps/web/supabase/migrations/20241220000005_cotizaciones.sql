-- =====================================================
-- MIGRACIÓN: Cotizaciones
-- HU-0003: Validación y Creación de Cotización
-- =====================================================

-- -----------------------------------------------------
-- 1. TIPOS ENUM
-- -----------------------------------------------------

CREATE TYPE public.cotizacion_estado AS ENUM (
  'BORRADOR',
  'CREACION_OFERTA',
  'NEGOCIACION',
  'RIESGO',
  'PENDIENTE_OC',
  'APROBACION_MARGEN',
  'GANADA',
  'PERDIDA'
);

-- -----------------------------------------------------
-- 2. SECUENCIA: Número de cotización (inicia en 30000)
-- -----------------------------------------------------

CREATE SEQUENCE public.cotizacion_numero_seq
  START WITH 30000
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

-- -----------------------------------------------------
-- 3. TABLA: cotizaciones
-- -----------------------------------------------------

CREATE TABLE public.cotizaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero INTEGER NOT NULL DEFAULT nextval('public.cotizacion_numero_seq') UNIQUE,

  -- Relaciones
  lead_id UUID REFERENCES public.leads(id),
  cliente_id UUID REFERENCES public.clientes(id),
  asesor_id UUID REFERENCES public.usuarios(id),

  -- Datos del cliente (snapshot del momento)
  nit VARCHAR(20) NOT NULL,
  razon_social VARCHAR(255) NOT NULL,
  nombre_contacto VARCHAR(255) NOT NULL,
  celular_contacto VARCHAR(20),
  email_contacto VARCHAR(320) NOT NULL,

  -- Información de la cotización
  fecha_cotizacion DATE NOT NULL DEFAULT CURRENT_DATE,
  asunto TEXT NOT NULL,
  forma_pago public.forma_pago DEFAULT 'ANTICIPADO',
  cupo_credito_disponible DECIMAL(15, 2) DEFAULT 0,
  vigencia_dias INTEGER DEFAULT 15,

  -- Estado y seguimiento
  estado public.cotizacion_estado DEFAULT 'BORRADOR',
  porcentaje_interes INTEGER DEFAULT 0 CHECK (porcentaje_interes >= 0 AND porcentaje_interes <= 100),

  -- Fechas de cierre
  mes_cierre VARCHAR(20),
  semana_cierre INTEGER,
  fecha_cierre_estimada DATE,
  mes_facturacion VARCHAR(20),

  -- TRM usada
  trm_valor DECIMAL(10, 2) NOT NULL,
  trm_fecha DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Transporte
  incluye_transporte BOOLEAN DEFAULT false,
  valor_transporte DECIMAL(15, 2) DEFAULT 0,

  -- Totales calculados
  subtotal_costo DECIMAL(15, 2) DEFAULT 0,
  subtotal_venta DECIMAL(15, 2) DEFAULT 0,
  total_iva DECIMAL(15, 2) DEFAULT 0,
  total_venta DECIMAL(15, 2) DEFAULT 0,
  utilidad DECIMAL(15, 2) DEFAULT 0,
  margen_porcentaje DECIMAL(5, 2) DEFAULT 0,

  -- Aprobación de margen
  requiere_aprobacion_margen BOOLEAN DEFAULT false,
  aprobado_por UUID REFERENCES public.usuarios(id),
  aprobado_en TIMESTAMPTZ,

  -- Campos adicionales
  condiciones_comerciales TEXT,
  cuadro_informativo TEXT,
  links_adicionales TEXT,

  -- Auditoría
  creado_por UUID REFERENCES auth.users(id),
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  modificado_por UUID REFERENCES auth.users(id),
  modificado_en TIMESTAMPTZ,
  enviado_en TIMESTAMPTZ,
  cerrado_en TIMESTAMPTZ
);

COMMENT ON TABLE public.cotizaciones IS 'Cotizaciones comerciales - HU-0003';

-- Índices
CREATE INDEX idx_cotizaciones_numero ON public.cotizaciones(numero);
CREATE INDEX idx_cotizaciones_lead ON public.cotizaciones(lead_id);
CREATE INDEX idx_cotizaciones_cliente ON public.cotizaciones(cliente_id);
CREATE INDEX idx_cotizaciones_asesor ON public.cotizaciones(asesor_id);
CREATE INDEX idx_cotizaciones_estado ON public.cotizaciones(estado);
CREATE INDEX idx_cotizaciones_fecha ON public.cotizaciones(fecha_cotizacion DESC);
CREATE INDEX idx_cotizaciones_nit ON public.cotizaciones(nit);

-- Trigger para actualizar timestamp
CREATE TRIGGER trigger_cotizaciones_modified
  BEFORE UPDATE ON public.cotizaciones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_modified_timestamp();

-- -----------------------------------------------------
-- 4. TABLA: cotizacion_items (productos de la cotización)
-- -----------------------------------------------------

CREATE TABLE public.cotizacion_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cotizacion_id UUID NOT NULL REFERENCES public.cotizaciones(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES public.productos(id),

  -- Datos del producto (snapshot)
  numero_parte VARCHAR(100) NOT NULL,
  nombre_producto VARCHAR(500) NOT NULL,
  descripcion TEXT,
  observaciones TEXT,

  -- Proveedor y entrega
  proveedor_id UUID REFERENCES public.proveedores(id),
  proveedor_nombre VARCHAR(255),
  tiempo_entrega_dias INTEGER DEFAULT 15,
  garantia_meses INTEGER DEFAULT 12,

  -- Costos y precios
  costo_unitario DECIMAL(15, 2) NOT NULL,
  moneda_costo public.moneda DEFAULT 'USD',
  costo_unitario_cop DECIMAL(15, 2) NOT NULL,
  porcentaje_utilidad DECIMAL(5, 2) NOT NULL DEFAULT 20.00,
  precio_unitario DECIMAL(15, 2) NOT NULL,

  -- IVA
  iva_tipo public.iva_tipo DEFAULT 'IVA_19',
  iva_porcentaje DECIMAL(5, 2) DEFAULT 19.00,
  iva_valor DECIMAL(15, 2) DEFAULT 0,

  -- Cantidad y totales
  cantidad INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  subtotal_costo DECIMAL(15, 2) NOT NULL,
  subtotal_venta DECIMAL(15, 2) NOT NULL,
  total_iva DECIMAL(15, 2) NOT NULL,
  total_item DECIMAL(15, 2) NOT NULL,

  -- Margen del item
  utilidad_item DECIMAL(15, 2) NOT NULL,
  margen_item DECIMAL(5, 2) NOT NULL,

  -- Ordenamiento
  orden INTEGER DEFAULT 0,

  -- Auditoría
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  modificado_en TIMESTAMPTZ
);

COMMENT ON TABLE public.cotizacion_items IS 'Items/productos de cada cotización - HU-0003';

-- Índices
CREATE INDEX idx_cotizacion_items_cotizacion ON public.cotizacion_items(cotizacion_id);
CREATE INDEX idx_cotizacion_items_producto ON public.cotizacion_items(producto_id);
CREATE INDEX idx_cotizacion_items_orden ON public.cotizacion_items(cotizacion_id, orden);

-- Trigger para actualizar timestamp
CREATE TRIGGER trigger_cotizacion_items_modified
  BEFORE UPDATE ON public.cotizacion_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_modified_timestamp();

-- -----------------------------------------------------
-- 5. TABLA: cotizacion_adjuntos
-- -----------------------------------------------------

CREATE TABLE public.cotizacion_adjuntos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cotizacion_id UUID NOT NULL REFERENCES public.cotizaciones(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  tipo VARCHAR(50),
  tamano_bytes BIGINT,
  subido_por UUID REFERENCES auth.users(id),
  subido_en TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.cotizacion_adjuntos IS 'Archivos adjuntos de cotizaciones';

CREATE INDEX idx_cotizacion_adjuntos_cotizacion ON public.cotizacion_adjuntos(cotizacion_id);

-- -----------------------------------------------------
-- 6. TABLA: cotizacion_historial (bitácora de cambios)
-- -----------------------------------------------------

CREATE TABLE public.cotizacion_historial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cotizacion_id UUID NOT NULL REFERENCES public.cotizaciones(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES auth.users(id),
  accion VARCHAR(50) NOT NULL,
  estado_anterior public.cotizacion_estado,
  estado_nuevo public.cotizacion_estado,
  descripcion TEXT,
  datos_adicionales JSONB,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.cotizacion_historial IS 'Historial de cambios en cotizaciones';

CREATE INDEX idx_cotizacion_historial_cotizacion ON public.cotizacion_historial(cotizacion_id);
CREATE INDEX idx_cotizacion_historial_fecha ON public.cotizacion_historial(creado_en DESC);

-- -----------------------------------------------------
-- 7. FUNCIÓN: Calcular totales de cotización
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.calcular_totales_cotizacion(p_cotizacion_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_subtotal_costo DECIMAL(15, 2);
  v_subtotal_venta DECIMAL(15, 2);
  v_total_iva DECIMAL(15, 2);
  v_utilidad DECIMAL(15, 2);
  v_margen DECIMAL(5, 2);
  v_valor_transporte DECIMAL(15, 2);
BEGIN
  -- Obtener valor de transporte
  SELECT COALESCE(valor_transporte, 0) INTO v_valor_transporte
  FROM public.cotizaciones
  WHERE id = p_cotizacion_id;

  -- Calcular totales de items
  SELECT
    COALESCE(SUM(subtotal_costo), 0),
    COALESCE(SUM(subtotal_venta), 0),
    COALESCE(SUM(total_iva), 0)
  INTO v_subtotal_costo, v_subtotal_venta, v_total_iva
  FROM public.cotizacion_items
  WHERE cotizacion_id = p_cotizacion_id;

  -- Agregar transporte al costo
  v_subtotal_costo := v_subtotal_costo + v_valor_transporte;

  -- Calcular utilidad y margen
  v_utilidad := v_subtotal_venta - v_subtotal_costo;
  IF v_subtotal_venta > 0 THEN
    v_margen := (v_utilidad / v_subtotal_venta) * 100;
  ELSE
    v_margen := 0;
  END IF;

  -- Actualizar cotización
  UPDATE public.cotizaciones
  SET
    subtotal_costo = v_subtotal_costo,
    subtotal_venta = v_subtotal_venta,
    total_iva = v_total_iva,
    total_venta = v_subtotal_venta + v_total_iva,
    utilidad = v_utilidad,
    margen_porcentaje = v_margen,
    modificado_en = NOW()
  WHERE id = p_cotizacion_id;
END;
$$;

-- -----------------------------------------------------
-- 8. FUNCIÓN: Verificar margen mínimo
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.verificar_margen_cotizacion(p_cotizacion_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_margen_cotizacion DECIMAL(5, 2);
  v_margen_minimo_global DECIMAL(5, 2) := 10.00; -- Margen mínimo global
  v_requiere_aprobacion BOOLEAN := false;
BEGIN
  -- Obtener margen de la cotización
  SELECT margen_porcentaje INTO v_margen_cotizacion
  FROM public.cotizaciones
  WHERE id = p_cotizacion_id;

  -- Verificar si el margen está por debajo del mínimo
  IF v_margen_cotizacion < v_margen_minimo_global THEN
    v_requiere_aprobacion := true;
  END IF;

  -- Actualizar estado de la cotización
  UPDATE public.cotizaciones
  SET requiere_aprobacion_margen = v_requiere_aprobacion
  WHERE id = p_cotizacion_id;

  RETURN v_requiere_aprobacion;
END;
$$;

-- -----------------------------------------------------
-- 9. TRIGGER: Recalcular totales al modificar items
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.trigger_recalcular_cotizacion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.calcular_totales_cotizacion(OLD.cotizacion_id);
    RETURN OLD;
  ELSE
    PERFORM public.calcular_totales_cotizacion(NEW.cotizacion_id);
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER trigger_item_recalcular
  AFTER INSERT OR UPDATE OR DELETE ON public.cotizacion_items
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_recalcular_cotizacion();

-- -----------------------------------------------------
-- 10. FUNCIÓN: Crear cotización desde lead
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.crear_cotizacion_desde_lead(p_lead_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_lead RECORD;
  v_cliente_id UUID;
  v_cotizacion_id UUID;
  v_trm DECIMAL(10, 2);
BEGIN
  -- Obtener datos del lead
  SELECT * INTO v_lead
  FROM public.leads
  WHERE id = p_lead_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead no encontrado';
  END IF;

  -- Obtener TRM del día
  v_trm := public.obtener_trm(CURRENT_DATE);

  -- Buscar o crear cliente
  SELECT id INTO v_cliente_id
  FROM public.clientes
  WHERE nit = v_lead.nit;

  IF v_cliente_id IS NULL THEN
    INSERT INTO public.clientes (
      nit, razon_social, nombre_contacto,
      celular_contacto, email_contacto, creado_por
    ) VALUES (
      v_lead.nit, v_lead.razon_social, v_lead.nombre_contacto,
      v_lead.celular_contacto, v_lead.email_contacto, v_lead.creado_por
    )
    RETURNING id INTO v_cliente_id;
  END IF;

  -- Crear cotización
  INSERT INTO public.cotizaciones (
    lead_id, cliente_id, asesor_id,
    nit, razon_social, nombre_contacto,
    celular_contacto, email_contacto,
    asunto, trm_valor, trm_fecha,
    estado, creado_por
  ) VALUES (
    p_lead_id, v_cliente_id, v_lead.asesor_asignado_id,
    v_lead.nit, v_lead.razon_social, v_lead.nombre_contacto,
    v_lead.celular_contacto, v_lead.email_contacto,
    'Cotización - ' || v_lead.requerimiento, v_trm, CURRENT_DATE,
    'BORRADOR', v_lead.asesor_asignado_id
  )
  RETURNING id INTO v_cotizacion_id;

  -- Actualizar estado del lead
  UPDATE public.leads
  SET estado = 'CONVERTIDO', convertido_en = NOW()
  WHERE id = p_lead_id;

  -- Registrar en historial
  INSERT INTO public.cotizacion_historial (
    cotizacion_id, usuario_id, accion, estado_nuevo, descripcion
  ) VALUES (
    v_cotizacion_id, v_lead.asesor_asignado_id, 'CREAR', 'BORRADOR',
    'Cotización creada desde lead #' || v_lead.numero
  );

  RETURN v_cotizacion_id;
END;
$$;

-- -----------------------------------------------------
-- 11. ROW LEVEL SECURITY
-- -----------------------------------------------------

ALTER TABLE public.cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotizacion_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotizacion_adjuntos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotizacion_historial ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura
CREATE POLICY cotizaciones_select ON public.cotizaciones FOR SELECT TO authenticated USING (true);
CREATE POLICY cotizacion_items_select ON public.cotizacion_items FOR SELECT TO authenticated USING (true);
CREATE POLICY cotizacion_adjuntos_select ON public.cotizacion_adjuntos FOR SELECT TO authenticated USING (true);
CREATE POLICY cotizacion_historial_select ON public.cotizacion_historial FOR SELECT TO authenticated USING (true);

-- Políticas de escritura
CREATE POLICY cotizaciones_insert ON public.cotizaciones FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY cotizacion_items_insert ON public.cotizacion_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY cotizacion_adjuntos_insert ON public.cotizacion_adjuntos FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY cotizaciones_update ON public.cotizaciones FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY cotizacion_items_update ON public.cotizacion_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY cotizacion_items_delete ON public.cotizacion_items FOR DELETE TO authenticated USING (true);

-- Service role
CREATE POLICY cotizaciones_all ON public.cotizaciones FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY cotizacion_items_all ON public.cotizacion_items FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY cotizacion_adjuntos_all ON public.cotizacion_adjuntos FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY cotizacion_historial_all ON public.cotizacion_historial FOR ALL TO service_role USING (true) WITH CHECK (true);

-- -----------------------------------------------------
-- 12. GRANTS
-- -----------------------------------------------------

GRANT SELECT, INSERT, UPDATE ON public.cotizaciones TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cotizacion_items TO authenticated;
GRANT SELECT, INSERT ON public.cotizacion_adjuntos TO authenticated;
GRANT SELECT ON public.cotizacion_historial TO authenticated;

GRANT ALL ON public.cotizaciones TO service_role;
GRANT ALL ON public.cotizacion_items TO service_role;
GRANT ALL ON public.cotizacion_adjuntos TO service_role;
GRANT ALL ON public.cotizacion_historial TO service_role;

GRANT USAGE, SELECT ON SEQUENCE public.cotizacion_numero_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.cotizacion_numero_seq TO service_role;

GRANT EXECUTE ON FUNCTION public.calcular_totales_cotizacion(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verificar_margen_cotizacion(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.crear_cotizacion_desde_lead(UUID) TO authenticated;
