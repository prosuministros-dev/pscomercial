import { z } from 'zod';

// Tipos de notificación
export const NotificacionTipoEnum = z.enum([
  'LEAD_ASIGNADO',
  'LEAD_REASIGNADO',
  'COTIZACION_CREADA',
  'COTIZACION_APROBACION_REQUERIDA',
  'COTIZACION_APROBADA',
  'COTIZACION_RECHAZADA',
  'MENCION',
  'SISTEMA',
]);

export const NotificacionPrioridadEnum = z.enum(['BAJA', 'MEDIA', 'ALTA']);

// Schema base de notificación
export const NotificacionSchema = z.object({
  id: z.string().uuid(),
  usuario_id: z.string().uuid(),
  tipo: NotificacionTipoEnum,
  titulo: z.string(),
  mensaje: z.string(),
  prioridad: NotificacionPrioridadEnum,
  entidad_tipo: z.string().nullable(),
  entidad_id: z.string().uuid().nullable(),
  leida: z.boolean(),
  leida_en: z.string().nullable(),
  metadata: z.record(z.unknown()).nullable(),
  creado_en: z.string(),
});

// Schema para marcar como leída
export const MarcarLeidaSchema = z.object({
  notificacion_id: z.string().uuid(),
});

// Schema para filtros
export const NotificacionFiltersSchema = z.object({
  leida: z.boolean().optional(),
  tipo: NotificacionTipoEnum.optional(),
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
});

// Tipos TypeScript
export type NotificacionTipo = z.infer<typeof NotificacionTipoEnum>;
export type NotificacionPrioridad = z.infer<typeof NotificacionPrioridadEnum>;
export type Notificacion = z.infer<typeof NotificacionSchema>;
export type MarcarLeidaInput = z.infer<typeof MarcarLeidaSchema>;
export type NotificacionFilters = z.infer<typeof NotificacionFiltersSchema>;
