-- ============================================================================
-- Migración: Observaciones de Cotizaciones con @menciones
-- Descripción: Tabla para almacenar observaciones/comentarios de cotizaciones
--              con soporte para menciones a usuarios (@usuario)
-- ============================================================================

-- Tabla de observaciones
CREATE TABLE IF NOT EXISTS cotizacion_observaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cotizacion_id UUID NOT NULL REFERENCES cotizaciones(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL,
  texto TEXT NOT NULL,
  menciones UUID[] DEFAULT '{}',
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_cotizacion_obs_cotizacion
ON cotizacion_observaciones(cotizacion_id);

CREATE INDEX IF NOT EXISTS idx_cotizacion_obs_usuario
ON cotizacion_observaciones(usuario_id);

CREATE INDEX IF NOT EXISTS idx_cotizacion_obs_creado
ON cotizacion_observaciones(creado_en DESC);

-- Índice GIN para búsqueda en menciones
CREATE INDEX IF NOT EXISTS idx_cotizacion_obs_menciones
ON cotizacion_observaciones USING GIN(menciones);

-- Comentarios
COMMENT ON TABLE cotizacion_observaciones IS 'Observaciones y comentarios en cotizaciones con soporte para @menciones';
COMMENT ON COLUMN cotizacion_observaciones.menciones IS 'Array de UUIDs de usuarios mencionados con @';

-- RLS
ALTER TABLE cotizacion_observaciones ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios autenticados pueden ver observaciones de cotizaciones que pueden ver
CREATE POLICY "Usuarios pueden ver observaciones" ON cotizacion_observaciones
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política: Usuarios autenticados pueden crear observaciones
CREATE POLICY "Usuarios pueden crear observaciones" ON cotizacion_observaciones
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política: Solo el autor puede eliminar su observación
CREATE POLICY "Autores pueden eliminar sus observaciones" ON cotizacion_observaciones
  FOR DELETE USING (usuario_id = auth.uid());

-- ============================================================================
-- Función para notificar usuarios mencionados
-- ============================================================================
CREATE OR REPLACE FUNCTION notificar_mencion_cotizacion()
RETURNS TRIGGER AS $$
DECLARE
  v_usuario_id UUID;
  v_cotizacion_numero INTEGER;
  v_autor_nombre TEXT;
BEGIN
  -- Obtener info de la cotización
  SELECT numero INTO v_cotizacion_numero
  FROM cotizaciones WHERE id = NEW.cotizacion_id;

  -- Obtener nombre del autor
  SELECT email INTO v_autor_nombre
  FROM auth.users WHERE id = NEW.usuario_id;

  -- Crear notificación para cada usuario mencionado
  IF NEW.menciones IS NOT NULL AND array_length(NEW.menciones, 1) > 0 THEN
    FOREACH v_usuario_id IN ARRAY NEW.menciones
    LOOP
      -- Solo notificar si la tabla notificaciones existe
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notificaciones') THEN
        INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, datos)
        VALUES (
          v_usuario_id,
          'MENCION',
          'Te mencionaron en una cotización',
          format('%s te mencionó en la cotización #%s', v_autor_nombre, v_cotizacion_numero),
          jsonb_build_object(
            'cotizacion_id', NEW.cotizacion_id,
            'cotizacion_numero', v_cotizacion_numero,
            'observacion_id', NEW.id,
            'autor_id', NEW.usuario_id
          )
        );
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para notificar menciones
DROP TRIGGER IF EXISTS trg_notificar_mencion_cotizacion ON cotizacion_observaciones;
CREATE TRIGGER trg_notificar_mencion_cotizacion
  AFTER INSERT ON cotizacion_observaciones
  FOR EACH ROW
  EXECUTE FUNCTION notificar_mencion_cotizacion();

-- ============================================================================
-- Vista para observaciones con datos del usuario
-- ============================================================================
CREATE OR REPLACE VIEW v_cotizacion_observaciones AS
SELECT
  co.*,
  u.email AS usuario_email,
  u.raw_user_meta_data->>'nombre' AS usuario_nombre
FROM cotizacion_observaciones co
LEFT JOIN auth.users u ON co.usuario_id = u.id
ORDER BY co.creado_en DESC;

-- Permisos
GRANT SELECT ON v_cotizacion_observaciones TO authenticated;
GRANT ALL ON cotizacion_observaciones TO authenticated;
