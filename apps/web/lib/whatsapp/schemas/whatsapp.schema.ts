/**
 * Schemas Zod para el módulo de WhatsApp - HU-0012
 */

import { z } from 'zod';

// ===========================================
// ENUMS
// ===========================================

export const ConversacionEstadoEnum = z.enum([
  'ACTIVA',
  'PAUSADA',
  'CERRADA',
  'INCOMPLETA',
]);
export type ConversacionEstado = z.infer<typeof ConversacionEstadoEnum>;

export const MensajeDireccionEnum = z.enum(['ENTRANTE', 'SALIENTE']);
export type MensajeDireccion = z.infer<typeof MensajeDireccionEnum>;

export const MensajeRemitenteEnum = z.enum(['BOT', 'USUARIO', 'ASESOR']);
export type MensajeRemitente = z.infer<typeof MensajeRemitenteEnum>;

export const MensajeTipoEnum = z.enum([
  'TEXTO',
  'IMAGEN',
  'DOCUMENTO',
  'TEMPLATE',
  'AUDIO',
  'VIDEO',
]);
export type MensajeTipo = z.infer<typeof MensajeTipoEnum>;

export const TemplateCategoriaEnum = z.enum([
  'BIENVENIDA',
  'COTIZACION',
  'SEGUIMIENTO',
  'CONFIRMACION',
  'RECORDATORIO',
  'SOPORTE',
]);
export type TemplateCategoria = z.infer<typeof TemplateCategoriaEnum>;

export const TemplateEstadoMetaEnum = z.enum([
  'APROBADO',
  'PENDIENTE',
  'RECHAZADO',
]);
export type TemplateEstadoMeta = z.infer<typeof TemplateEstadoMetaEnum>;

export const SyncEstadoEnum = z.enum([
  'ACTIVO',
  'DESVINCULADO',
  'ERROR',
  'PENDIENTE',
]);
export type SyncEstado = z.infer<typeof SyncEstadoEnum>;

export const BotEstadoEnum = z.enum([
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
  'CERRADA',
]);
export type BotEstado = z.infer<typeof BotEstadoEnum>;

// ===========================================
// SCHEMAS BASE
// ===========================================

export const whatsappMensajeSchema = z.object({
  id: z.string().uuid(),
  conversacion_id: z.string().uuid(),
  direccion: MensajeDireccionEnum,
  remitente: MensajeRemitenteEnum,
  tipo: MensajeTipoEnum,
  contenido: z.string(),
  adjuntos: z.array(z.string()).default([]),
  mensaje_meta_id: z.string().nullable().optional(),
  leido: z.boolean().default(false),
  leido_en: z.string().datetime().nullable().optional(),
  creado_en: z.string().datetime(),
});
export type WhatsAppMensaje = z.infer<typeof whatsappMensajeSchema>;

export const whatsappConversacionSchema = z.object({
  id: z.string().uuid(),
  telefono_cliente: z.string().min(7).max(20),
  nombre_contacto: z.string().nullable().optional(),
  identificacion: z.string().nullable().optional(),
  estado: ConversacionEstadoEnum,
  estado_bot: BotEstadoEnum.nullable().optional(),
  datos_capturados: z.record(z.unknown()).default({}),
  lead_id: z.string().uuid().nullable().optional(),
  caso_id: z.string().uuid().nullable().optional(),
  asesor_asignado_id: z.string().uuid().nullable().optional(),
  asignado_en: z.string().datetime().nullable().optional(),
  ultimo_mensaje: z.string().nullable().optional(),
  ultimo_mensaje_en: z.string().datetime().nullable().optional(),
  ultimo_mensaje_usuario_en: z.string().datetime().nullable().optional(),
  mensajes_no_leidos: z.number().int().default(0),
  recordatorio_1_enviado: z.boolean().default(false),
  recordatorio_2_enviado: z.boolean().default(false),
  adjuntos_temporales: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).default({}),
  creado_en: z.string().datetime(),
  modificado_en: z.string().datetime().nullable().optional(),
  cerrado_en: z.string().datetime().nullable().optional(),
  // Relaciones
  mensajes: z.array(whatsappMensajeSchema).optional(),
  asesor: z
    .object({
      id: z.string().uuid(),
      nombre_completo: z.string(),
      email: z.string().email().optional(),
    })
    .nullable()
    .optional(),
});
export type WhatsAppConversacion = z.infer<typeof whatsappConversacionSchema>;

export const whatsappTemplateSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(1).max(100),
  codigo: z.string().min(1).max(50),
  categoria: TemplateCategoriaEnum,
  contenido: z.string().min(1),
  variables: z.array(z.string()).default([]),
  estado_meta: TemplateEstadoMetaEnum,
  activo: z.boolean().default(true),
  creado_en: z.string().datetime(),
  modificado_en: z.string().datetime().nullable().optional(),
});
export type WhatsAppTemplate = z.infer<typeof whatsappTemplateSchema>;

export const whatsappAsesorSyncSchema = z.object({
  id: z.string().uuid(),
  usuario_id: z.string().uuid(),
  waba_id: z.string().nullable().optional(),
  phone_number_id: z.string().nullable().optional(),
  display_phone_number: z.string().nullable().optional(),
  waba_name: z.string().nullable().optional(),
  estado: SyncEstadoEnum,
  vinculado_en: z.string().datetime().nullable().optional(),
  desvinculado_en: z.string().datetime().nullable().optional(),
  ultimo_sync: z.string().datetime().nullable().optional(),
  creado_en: z.string().datetime(),
  modificado_en: z.string().datetime().nullable().optional(),
});
export type WhatsAppAsesorSync = z.infer<typeof whatsappAsesorSyncSchema>;

export const notificacionSchema = z.object({
  id: z.string().uuid(),
  usuario_id: z.string().uuid(),
  tipo: z.string(),
  titulo: z.string(),
  mensaje: z.string().nullable().optional(),
  referencia_tipo: z.string().nullable().optional(),
  referencia_id: z.string().uuid().nullable().optional(),
  leida: z.boolean().default(false),
  leida_en: z.string().datetime().nullable().optional(),
  creado_en: z.string().datetime(),
});
export type Notificacion = z.infer<typeof notificacionSchema>;

// ===========================================
// SCHEMAS DE FORMULARIOS / ACCIONES
// ===========================================

export const enviarMensajeSchema = z.object({
  conversacion_id: z.string().uuid(),
  contenido: z.string().min(1, 'El mensaje no puede estar vacío'),
  tipo: MensajeTipoEnum.default('TEXTO'),
  adjuntos: z.array(z.string()).default([]),
});
export type EnviarMensajeInput = z.infer<typeof enviarMensajeSchema>;

export const enviarTemplateSchema = z.object({
  conversacion_id: z.string().uuid(),
  template_codigo: z.string(),
  variables: z.record(z.string()).default({}),
});
export type EnviarTemplateInput = z.infer<typeof enviarTemplateSchema>;

export const crearConversacionSchema = z.object({
  telefono_cliente: z
    .string()
    .min(7, 'Teléfono debe tener al menos 7 dígitos')
    .regex(/^\+?[0-9\s-]+$/, 'Formato de teléfono inválido'),
  nombre_contacto: z.string().optional(),
});
export type CrearConversacionInput = z.infer<typeof crearConversacionSchema>;

export const actualizarConversacionSchema = z.object({
  id: z.string().uuid(),
  estado: ConversacionEstadoEnum.optional(),
  asesor_asignado_id: z.string().uuid().nullable().optional(),
  nombre_contacto: z.string().optional(),
  identificacion: z.string().optional(),
});
export type ActualizarConversacionInput = z.infer<
  typeof actualizarConversacionSchema
>;

export const crearLeadDesdeConversacionSchema = z.object({
  conversacion_id: z.string().uuid(),
  razon_social: z.string().min(1, 'Razón social es requerida'),
  nit: z.string().min(1, 'NIT es requerido'),
  nombre_contacto: z.string().min(1, 'Nombre de contacto es requerido'),
  celular_contacto: z.string().min(7, 'Celular es requerido'),
  email_contacto: z.string().email('Email inválido'),
  requerimiento: z.string().min(1, 'Requerimiento es requerido'),
});
export type CrearLeadDesdeConversacionInput = z.infer<
  typeof crearLeadDesdeConversacionSchema
>;

export const embeddedSignupSchema = z.object({
  waba_id: z.string().min(1, 'WABA ID es requerido'),
  phone_number_id: z.string().min(1, 'Phone Number ID es requerido'),
  display_phone_number: z.string().min(1, 'Número de teléfono es requerido'),
  waba_name: z.string().optional(),
  access_token: z.string().min(1, 'Access token es requerido'),
});
export type EmbeddedSignupInput = z.infer<typeof embeddedSignupSchema>;

// ===========================================
// SCHEMAS DE FILTROS
// ===========================================

export const conversacionesFilterSchema = z.object({
  estado: ConversacionEstadoEnum.optional(),
  asesor_id: z.string().uuid().optional(),
  search: z.string().optional(),
  tiene_mensajes_no_leidos: z.boolean().optional(),
  fecha_desde: z.string().datetime().optional(),
  fecha_hasta: z.string().datetime().optional(),
});
export type ConversacionesFilter = z.infer<typeof conversacionesFilterSchema>;

export const templatesFilterSchema = z.object({
  categoria: TemplateCategoriaEnum.optional(),
  activo: z.boolean().optional(),
  search: z.string().optional(),
});
export type TemplatesFilter = z.infer<typeof templatesFilterSchema>;
