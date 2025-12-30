-- ============================================================================
-- Migración: Agregar vertical_id a cotizacion_items
-- Descripción: Permite asociar una vertical a cada item de cotización
--              para validar márgenes mínimos por vertical
-- ============================================================================

-- Agregar columna vertical_id a cotizacion_items
ALTER TABLE cotizacion_items
ADD COLUMN IF NOT EXISTS vertical_id UUID REFERENCES verticales(id);

-- Crear índice para mejorar consultas por vertical
CREATE INDEX IF NOT EXISTS idx_cotizacion_items_vertical
ON cotizacion_items(vertical_id);

-- Comentario de documentación
COMMENT ON COLUMN cotizacion_items.vertical_id IS 'Vertical del producto (HARDWARE, SOFTWARE, SERVICIOS, ACCESORIOS, OTROS)';

-- ============================================================================
-- Función para validar margen mínimo según vertical y forma de pago
-- ============================================================================
CREATE OR REPLACE FUNCTION validar_margen_item_por_vertical()
RETURNS TRIGGER AS $$
DECLARE
  v_margen_minimo NUMERIC;
  v_forma_pago TEXT;
  v_vertical_nombre TEXT;
BEGIN
  -- Obtener forma de pago de la cotización
  SELECT forma_pago INTO v_forma_pago
  FROM cotizaciones
  WHERE id = NEW.cotizacion_id;

  -- Si no hay vertical_id, no validar
  IF NEW.vertical_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Obtener margen mínimo de la vertical
  SELECT margen_minimo, nombre INTO v_margen_minimo, v_vertical_nombre
  FROM verticales
  WHERE id = NEW.vertical_id;

  -- Ajustar margen según forma de pago (créditos largos requieren más margen)
  IF v_forma_pago IN ('CREDITO_45') THEN
    v_margen_minimo := v_margen_minimo + 0.02; -- +2%
  ELSIF v_forma_pago IN ('CREDITO_60', 'CREDITO_90') THEN
    v_margen_minimo := v_margen_minimo + 0.04; -- +4%
  END IF;

  -- Calcular margen del item (porcentaje_utilidad ya viene como porcentaje, ej: 30 = 30%)
  -- El margen mínimo está en decimal (0.07 = 7%)
  IF (NEW.porcentaje_utilidad / 100.0) < v_margen_minimo THEN
    -- No bloquear, solo registrar alerta (la validación estricta la hace el frontend)
    RAISE NOTICE 'Item con margen bajo: % (mínimo para %: %)',
      NEW.porcentaje_utilidad, v_vertical_nombre, (v_margen_minimo * 100);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para validar margen
DROP TRIGGER IF EXISTS trg_validar_margen_item ON cotizacion_items;
CREATE TRIGGER trg_validar_margen_item
  BEFORE INSERT OR UPDATE ON cotizacion_items
  FOR EACH ROW
  EXECUTE FUNCTION validar_margen_item_por_vertical();

-- ============================================================================
-- Insertar verticales por defecto si no existen
-- Nota: margen_minimo en formato decimal (0.07 = 7%)
-- ============================================================================
INSERT INTO verticales (id, nombre, margen_minimo, margen_sugerido, descripcion, activo)
SELECT gen_random_uuid(), 'HARDWARE', 0.07, 0.15, 'Equipos de cómputo, servidores, periféricos', true
WHERE NOT EXISTS (SELECT 1 FROM verticales WHERE nombre = 'HARDWARE');

INSERT INTO verticales (id, nombre, margen_minimo, margen_sugerido, descripcion, activo)
SELECT gen_random_uuid(), 'SOFTWARE', 0.05, 0.12, 'Licencias, suscripciones, desarrollo', true
WHERE NOT EXISTS (SELECT 1 FROM verticales WHERE nombre = 'SOFTWARE');

INSERT INTO verticales (id, nombre, margen_minimo, margen_sugerido, descripcion, activo)
SELECT gen_random_uuid(), 'SERVICIOS', 0.07, 0.20, 'Consultoría, implementación, soporte', true
WHERE NOT EXISTS (SELECT 1 FROM verticales WHERE nombre = 'SERVICIOS');

INSERT INTO verticales (id, nombre, margen_minimo, margen_sugerido, descripcion, activo)
SELECT gen_random_uuid(), 'ACCESORIOS', 0.07, 0.18, 'Cables, adaptadores, consumibles', true
WHERE NOT EXISTS (SELECT 1 FROM verticales WHERE nombre = 'ACCESORIOS');

INSERT INTO verticales (id, nombre, margen_minimo, margen_sugerido, descripcion, activo)
SELECT gen_random_uuid(), 'OTROS', 0.07, 0.15, 'Productos no categorizados', true
WHERE NOT EXISTS (SELECT 1 FROM verticales WHERE nombre = 'OTROS');

-- ============================================================================
-- Vista para obtener items con información de vertical
-- ============================================================================
CREATE OR REPLACE VIEW v_cotizacion_items_detalle AS
SELECT
  ci.*,
  v.nombre AS vertical_nombre,
  v.margen_minimo AS vertical_margen_minimo,
  v.margen_sugerido AS vertical_margen_sugerido,
  CASE
    WHEN ci.porcentaje_utilidad / 100.0 < v.margen_minimo THEN true
    ELSE false
  END AS margen_bajo_vertical
FROM cotizacion_items ci
LEFT JOIN verticales v ON ci.vertical_id = v.id;

-- Permisos
GRANT SELECT ON v_cotizacion_items_detalle TO authenticated;
