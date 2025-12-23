-- =====================================================
-- MIGRACIÓN: Módulo de WhatsApp - HU-0012
-- Bot de WhatsApp para Atención y Registro de Solicitudes
-- =====================================================

-- -----------------------------------------------------
-- 1. TIPOS ENUM
-- -----------------------------------------------------

CREATE TYPE public.whatsapp_conversacion_estado AS ENUM (
  'ACTIVA',
  'PAUSADA',
  'CERRADA',
  'INCOMPLETA'
);

CREATE TYPE public.whatsapp_mensaje_direccion AS ENUM (
  'ENTRANTE',
  'SALIENTE'
);

CREATE TYPE public.whatsapp_mensaje_remitente AS ENUM (
  'BOT',
  'USUARIO',
  'ASESOR'
);

CREATE TYPE public.whatsapp_mensaje_tipo AS ENUM (
  'TEXTO',
  'IMAGEN',
  'DOCUMENTO',
  'TEMPLATE',
  'AUDIO',
  'VIDEO'
);

CREATE TYPE public.whatsapp_template_categoria AS ENUM (
  'BIENVENIDA',
  'COTIZACION',
  'SEGUIMIENTO',
  'CONFIRMACION',
  'RECORDATORIO',
  'SOPORTE'
);

CREATE TYPE public.whatsapp_template_estado AS ENUM (
  'APROBADO',
  'PENDIENTE',
  'RECHAZADO'
);

CREATE TYPE public.whatsapp_sync_estado AS ENUM (
  'ACTIVO',
  'DESVINCULADO',
  'ERROR',
  'PENDIENTE'
);

CREATE TYPE public.whatsapp_bot_estado AS ENUM (
  'INICIO',
  'CAPTURA_NOMBRE',
  'CAPTURA_ID',
  'MENU_PRINCIPAL',
  'FLUJO_COTIZACION',
  'FLUJO_PEDIDO',
  'FLUJO_OTRO',
  'ADJUNTO_SIN_CONTEXTO',
  'RECORDATORIO_1',
  'RECORDATORIO_2',
  'CONFIRMACION',
  'CERRADA'
);

-- -----------------------------------------------------
-- 2. TABLA: whatsapp_conversaciones
-- -----------------------------------------------------

CREATE TABLE public.whatsapp_conversaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificación del contacto
  telefono_cliente VARCHAR(20) NOT NULL,
  nombre_contacto VARCHAR(255),
  identificacion VARCHAR(20),

  -- Estado
  estado public.whatsapp_conversacion_estado NOT NULL DEFAULT 'ACTIVA',
  estado_bot public.whatsapp_bot_estado DEFAULT 'INICIO',

  -- Datos capturados durante la conversación
  datos_capturados JSONB DEFAULT '{}',

  -- Relaciones opcionales
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  caso_id UUID,

  -- Asignación
  asesor_asignado_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  asignado_en TIMESTAMPTZ,

  -- Último mensaje
  ultimo_mensaje TEXT,
  ultimo_mensaje_en TIMESTAMPTZ,
  ultimo_mensaje_usuario_en TIMESTAMPTZ,

  -- Contadores
  mensajes_no_leidos INTEGER DEFAULT 0,

  -- Manejo de inactividad
  recordatorio_1_enviado BOOLEAN DEFAULT FALSE,
  recordatorio_2_enviado BOOLEAN DEFAULT FALSE,

  -- Adjuntos temporales (antes de vincular a caso)
  adjuntos_temporales TEXT[] DEFAULT '{}',

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Auditoría
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modificado_en TIMESTAMPTZ,
  cerrado_en TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT whatsapp_conv_telefono_check CHECK (telefono_cliente ~ '^\+?[0-9\s-]+$')
);

COMMENT ON TABLE public.whatsapp_conversaciones IS 'Conversaciones de WhatsApp - HU-0012';
COMMENT ON COLUMN public.whatsapp_conversaciones.estado_bot IS 'Estado de la máquina de estados del bot';
COMMENT ON COLUMN public.whatsapp_conversaciones.datos_capturados IS 'Datos recolectados durante la conversación (nombre, ID, necesidad, etc.)';

-- Índices
CREATE INDEX idx_wa_conv_telefono ON public.whatsapp_conversaciones(telefono_cliente);
CREATE INDEX idx_wa_conv_estado ON public.whatsapp_conversaciones(estado);
CREATE INDEX idx_wa_conv_asesor ON public.whatsapp_conversaciones(asesor_asignado_id);
CREATE INDEX idx_wa_conv_lead ON public.whatsapp_conversaciones(lead_id);
CREATE INDEX idx_wa_conv_ultimo_msg ON public.whatsapp_conversaciones(ultimo_mensaje_en DESC);
CREATE INDEX idx_wa_conv_creado ON public.whatsapp_conversaciones(creado_en DESC);

-- -----------------------------------------------------
-- 3. TABLA: whatsapp_mensajes
-- -----------------------------------------------------

CREATE TABLE public.whatsapp_mensajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversacion_id UUID NOT NULL REFERENCES public.whatsapp_conversaciones(id) ON DELETE CASCADE,

  -- Dirección y remitente
  direccion public.whatsapp_mensaje_direccion NOT NULL,
  remitente public.whatsapp_mensaje_remitente NOT NULL,

  -- Contenido
  tipo public.whatsapp_mensaje_tipo NOT NULL DEFAULT 'TEXTO',
  contenido TEXT NOT NULL,
  adjuntos TEXT[] DEFAULT '{}',

  -- Meta API
  mensaje_meta_id VARCHAR(100),

  -- Estado de lectura
  leido BOOLEAN DEFAULT FALSE,
  leido_en TIMESTAMPTZ,

  -- Auditoría
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.whatsapp_mensajes IS 'Mensajes de conversaciones WhatsApp';
COMMENT ON COLUMN public.whatsapp_mensajes.mensaje_meta_id IS 'ID del mensaje en Meta API para trazabilidad';

-- Índices
CREATE INDEX idx_wa_msg_conversacion ON public.whatsapp_mensajes(conversacion_id);
CREATE INDEX idx_wa_msg_fecha ON public.whatsapp_mensajes(creado_en DESC);
CREATE INDEX idx_wa_msg_meta_id ON public.whatsapp_mensajes(mensaje_meta_id) WHERE mensaje_meta_id IS NOT NULL;

-- -----------------------------------------------------
-- 4. TABLA: whatsapp_templates
-- -----------------------------------------------------

CREATE TABLE public.whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificación
  nombre VARCHAR(100) NOT NULL,
  codigo VARCHAR(50) NOT NULL,
  categoria public.whatsapp_template_categoria NOT NULL,

  -- Contenido
  contenido TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',

  -- Estado en Meta
  estado_meta public.whatsapp_template_estado DEFAULT 'PENDIENTE',

  -- Control
  activo BOOLEAN DEFAULT TRUE,

  -- Auditoría
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modificado_en TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT whatsapp_tpl_codigo_unique UNIQUE (codigo)
);

COMMENT ON TABLE public.whatsapp_templates IS 'Plantillas de mensajes de WhatsApp aprobadas por Meta';

-- Índices
CREATE INDEX idx_wa_tpl_categoria ON public.whatsapp_templates(categoria);
CREATE INDEX idx_wa_tpl_activo ON public.whatsapp_templates(activo);

-- -----------------------------------------------------
-- 5. TABLA: whatsapp_asesor_sync (Embedded Sign-Up)
-- -----------------------------------------------------

CREATE TABLE public.whatsapp_asesor_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Datos de Meta
  waba_id VARCHAR(50),
  phone_number_id VARCHAR(50),
  display_phone_number VARCHAR(20),
  waba_name VARCHAR(255),

  -- Token (DEBE SER ENCRIPTADO en la aplicación)
  token_acceso TEXT,

  -- Estado
  estado public.whatsapp_sync_estado NOT NULL DEFAULT 'PENDIENTE',

  -- Timestamps
  vinculado_en TIMESTAMPTZ,
  desvinculado_en TIMESTAMPTZ,
  ultimo_sync TIMESTAMPTZ,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modificado_en TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT whatsapp_sync_usuario_unique UNIQUE (usuario_id),
  CONSTRAINT whatsapp_sync_phone_unique UNIQUE (phone_number_id)
);

COMMENT ON TABLE public.whatsapp_asesor_sync IS 'Vinculación de WhatsApp Business de asesores via Embedded Sign-Up';
COMMENT ON COLUMN public.whatsapp_asesor_sync.token_acceso IS 'Token de acceso de larga duración (ENCRIPTAR en app)';

-- Índices
CREATE INDEX idx_wa_sync_usuario ON public.whatsapp_asesor_sync(usuario_id);
CREATE INDEX idx_wa_sync_estado ON public.whatsapp_asesor_sync(estado);
CREATE INDEX idx_wa_sync_phone ON public.whatsapp_asesor_sync(phone_number_id);

-- -----------------------------------------------------
-- 6. TABLA: whatsapp_webhook_log (Bitácora)
-- -----------------------------------------------------

CREATE TABLE public.whatsapp_webhook_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Tipo de evento
  tipo_evento VARCHAR(100) NOT NULL,

  -- Payload completo
  payload JSONB NOT NULL,

  -- Procesamiento
  procesado BOOLEAN DEFAULT FALSE,
  procesado_en TIMESTAMPTZ,
  error TEXT,

  -- Referencia
  conversacion_id UUID REFERENCES public.whatsapp_conversaciones(id) ON DELETE SET NULL,
  mensaje_id UUID REFERENCES public.whatsapp_mensajes(id) ON DELETE SET NULL,

  -- Auditoría
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.whatsapp_webhook_log IS 'Bitácora de eventos webhook de WhatsApp - HU-0012 CA-12';

-- Índices
CREATE INDEX idx_wa_log_tipo ON public.whatsapp_webhook_log(tipo_evento);
CREATE INDEX idx_wa_log_procesado ON public.whatsapp_webhook_log(procesado);
CREATE INDEX idx_wa_log_fecha ON public.whatsapp_webhook_log(creado_en DESC);

-- -----------------------------------------------------
-- 7. TABLA: notificaciones (si no existe)
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Destinatario
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Contenido
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT,

  -- Referencia
  referencia_tipo VARCHAR(50),
  referencia_id UUID,

  -- Estado
  leida BOOLEAN DEFAULT FALSE,
  leida_en TIMESTAMPTZ,

  -- Auditoría
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.notificaciones IS 'Notificaciones internas del sistema';

-- Índices
CREATE INDEX IF NOT EXISTS idx_notif_usuario ON public.notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notif_leida ON public.notificaciones(leida);
CREATE INDEX IF NOT EXISTS idx_notif_fecha ON public.notificaciones(creado_en DESC);

-- -----------------------------------------------------
-- 8. TRIGGERS: Actualizar timestamps
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_whatsapp_modified_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.modificado_en := NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_wa_conv_modified
  BEFORE UPDATE ON public.whatsapp_conversaciones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_whatsapp_modified_timestamp();

CREATE TRIGGER trigger_wa_tpl_modified
  BEFORE UPDATE ON public.whatsapp_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_whatsapp_modified_timestamp();

CREATE TRIGGER trigger_wa_sync_modified
  BEFORE UPDATE ON public.whatsapp_asesor_sync
  FOR EACH ROW
  EXECUTE FUNCTION public.update_whatsapp_modified_timestamp();

-- -----------------------------------------------------
-- 9. TRIGGER: Actualizar último mensaje en conversación
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_conversacion_ultimo_mensaje()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.whatsapp_conversaciones
  SET
    ultimo_mensaje = NEW.contenido,
    ultimo_mensaje_en = NEW.creado_en,
    ultimo_mensaje_usuario_en = CASE
      WHEN NEW.direccion = 'ENTRANTE' THEN NEW.creado_en
      ELSE ultimo_mensaje_usuario_en
    END,
    mensajes_no_leidos = CASE
      WHEN NEW.direccion = 'ENTRANTE' THEN mensajes_no_leidos + 1
      ELSE mensajes_no_leidos
    END,
    -- Resetear recordatorios cuando usuario responde
    recordatorio_1_enviado = CASE
      WHEN NEW.direccion = 'ENTRANTE' THEN FALSE
      ELSE recordatorio_1_enviado
    END,
    recordatorio_2_enviado = CASE
      WHEN NEW.direccion = 'ENTRANTE' THEN FALSE
      ELSE recordatorio_2_enviado
    END
  WHERE id = NEW.conversacion_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_wa_msg_update_conv
  AFTER INSERT ON public.whatsapp_mensajes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversacion_ultimo_mensaje();

-- -----------------------------------------------------
-- 10. ROW LEVEL SECURITY
-- -----------------------------------------------------

ALTER TABLE public.whatsapp_conversaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_asesor_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_webhook_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- Políticas para conversaciones - todos los usuarios autenticados pueden ver
CREATE POLICY wa_conv_select ON public.whatsapp_conversaciones
  FOR SELECT TO authenticated USING (true);

CREATE POLICY wa_conv_insert ON public.whatsapp_conversaciones
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY wa_conv_update ON public.whatsapp_conversaciones
  FOR UPDATE TO authenticated USING (true);

-- Políticas para mensajes
CREATE POLICY wa_msg_select ON public.whatsapp_mensajes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY wa_msg_insert ON public.whatsapp_mensajes
  FOR INSERT TO authenticated WITH CHECK (true);

-- Políticas para templates
CREATE POLICY wa_tpl_select ON public.whatsapp_templates
  FOR SELECT TO authenticated USING (true);

CREATE POLICY wa_tpl_all ON public.whatsapp_templates
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Políticas para sync - usuario solo ve su propia vinculación
CREATE POLICY wa_sync_select ON public.whatsapp_asesor_sync
  FOR SELECT TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY wa_sync_insert ON public.whatsapp_asesor_sync
  FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY wa_sync_update ON public.whatsapp_asesor_sync
  FOR UPDATE TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY wa_sync_all ON public.whatsapp_asesor_sync
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Políticas para webhook log
CREATE POLICY wa_log_select ON public.whatsapp_webhook_log
  FOR SELECT TO authenticated USING (true);

CREATE POLICY wa_log_all ON public.whatsapp_webhook_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Políticas para notificaciones
CREATE POLICY notif_select ON public.notificaciones
  FOR SELECT TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY notif_insert ON public.notificaciones
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY notif_update ON public.notificaciones
  FOR UPDATE TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY notif_all ON public.notificaciones
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- -----------------------------------------------------
-- 11. HABILITAR REALTIME
-- -----------------------------------------------------

ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_conversaciones;
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_mensajes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notificaciones;

-- -----------------------------------------------------
-- 12. GRANTS
-- -----------------------------------------------------

GRANT SELECT, INSERT, UPDATE ON public.whatsapp_conversaciones TO authenticated;
GRANT SELECT, INSERT ON public.whatsapp_mensajes TO authenticated;
GRANT SELECT ON public.whatsapp_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.whatsapp_asesor_sync TO authenticated;
GRANT SELECT ON public.whatsapp_webhook_log TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.notificaciones TO authenticated;

GRANT ALL ON public.whatsapp_conversaciones TO service_role;
GRANT ALL ON public.whatsapp_mensajes TO service_role;
GRANT ALL ON public.whatsapp_templates TO service_role;
GRANT ALL ON public.whatsapp_asesor_sync TO service_role;
GRANT ALL ON public.whatsapp_webhook_log TO service_role;
GRANT ALL ON public.notificaciones TO service_role;

-- -----------------------------------------------------
-- 13. INSERTAR TEMPLATES INICIALES (Plantillas A-K de HU-0012)
-- -----------------------------------------------------

INSERT INTO public.whatsapp_templates (nombre, codigo, categoria, contenido, variables, estado_meta, activo) VALUES
('Bienvenida Usuario Nuevo', 'TPL_A_BIENVENIDA', 'BIENVENIDA',
'👋 ¡Hola! Bienvenido a PROSUMINISTROS 🧰
Tu aliado en hardware, software, accesorios y servicios de infraestructura IT.

¿Cuál es tu nombre completo?',
'{}', 'APROBADO', true),

('Solicitud Identificación', 'TPL_A_ID', 'BIENVENIDA',
'Perfecto, gracias {{nombre}}. ¿Podrías indicarme tu número de identificación o documento?',
'{"nombre"}', 'APROBADO', true),

('Menú Principal', 'TPL_A_MENU', 'BIENVENIDA',
'Gracias. Para poder atenderte mejor, por favor cuéntame qué deseas hacer hoy:

1️⃣ Solicitar una cotización
2️⃣ Consulta el estado de tu pedido
3️⃣ Otro motivo (soporte técnico, documentación, facturación o área financiera)

Estoy aquí para apoyarte. 🚀',
'{}', 'APROBADO', true),

('Cliente Existente', 'TPL_B_EXISTENTE', 'BIENVENIDA',
'He encontrado tu número en nuestro sistema ✔️. Para continuar solo necesito que me confirmes lo siguiente.

¿Puedes indicarme brevemente qué necesitas para poder clasificar correctamente tu solicitud?',
'{}', 'APROBADO', true),

('Seguimiento Pedido - Comercial', 'TPL_C_COMERCIAL', 'SEGUIMIENTO',
'Para ayudarte mejor, ¿puedes decirme qué comercial te atendió cuando realizaste este pedido?',
'{}', 'APROBADO', true),

('Seguimiento Pedido - Notificado', 'TPL_C_NOTIFICADO', 'SEGUIMIENTO',
'Perfecto 😊. Ya notifiqué a {{comercial}} sobre tu consulta. Pronto se comunicará contigo.',
'{"comercial"}', 'APROBADO', true),

('Cotización - Producto', 'TPL_D_PRODUCTO', 'COTIZACION',
'Claro, con gusto te ayudo con información. ¿Sobre qué producto deseas recibir detalle?',
'{}', 'APROBADO', true),

('Cotización - Tipo', 'TPL_D_TIPO', 'COTIZACION',
'¿Deseas una cotización formal o solo información general?',
'{}', 'APROBADO', true),

('Otro Motivo - Proceso', 'TPL_E_PROCESO', 'SOPORTE',
'Para ayudarte mejor, ¿puedes decirme qué proceso necesitas realizar?',
'{}', 'APROBADO', true),

('Mensajes Desordenados', 'TPL_F_ORDENAR', 'SOPORTE',
'Gracias por tu mensaje. Para poder ayudarte necesito organizar un poco la información. ¿Podrías decirme en una frase qué necesitas?',
'{}', 'APROBADO', true),

('Recordatorio 1', 'TPL_G_RECORDATORIO1', 'RECORDATORIO',
'¿Sigues ahí? 😊 Solo necesito tu respuesta anterior para continuar.',
'{}', 'APROBADO', true),

('Recordatorio 2', 'TPL_G_RECORDATORIO2', 'RECORDATORIO',
'Si necesitas más tiempo, no te preocupes. Continuaré esperando tu información.',
'{}', 'APROBADO', true),

('Cierre Automático', 'TPL_G_CIERRE', 'RECORDATORIO',
'No recibimos respuesta, por lo que la conversación se ha cerrado. Si necesitas ayuda, puedes escribirnos de nuevo cuando quieras.',
'{}', 'APROBADO', true),

('Duplicado Detectado', 'TPL_H_DUPLICADO', 'CONFIRMACION',
'Ya tenemos un caso abierto para esta misma solicitud ✔️ (Caso #{{numero_caso}}). Continuaremos usándolo para mantener toda la información organizada.

Si deseas agregar más detalles o enviar evidencias, puedes hacerlo aquí mismo.',
'{"numero_caso"}', 'APROBADO', true),

('Confirmación Final', 'TPL_I_CONFIRMACION', 'CONFIRMACION',
'¡Perfecto! Tu solicitud fue registrada con el número #{{numero_caso}}. Nuestro equipo la revisará y te responderá lo más pronto posible.',
'{"numero_caso"}', 'APROBADO', true),

('Embedded Sign-Up', 'TPL_J_SIGNUP', 'SOPORTE',
'Por favor confirma tu número de WhatsApp Business para vincularlo a la plataforma. Este proceso se llama embedded sign-up. Una vez vinculado podrás gestionar tus conversaciones directamente desde la plataforma.',
'{}', 'APROBADO', true),

('Limitación Meta', 'TPL_K_LIMITACION', 'SOPORTE',
'⚠️ Meta no permite transferir conversaciones entre números distintos. Podemos enviarte un enlace al número del asesor, pero se perderá la trazabilidad.',
'{}', 'APROBADO', true),

('Adjunto Sin Contexto', 'TPL_ADJUNTO', 'SOPORTE',
'Por favor indícame qué necesitas con esa imagen/documento.',
'{}', 'APROBADO', true);

-- -----------------------------------------------------
-- FIN DE MIGRACIÓN
-- -----------------------------------------------------
