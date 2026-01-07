import { z } from 'zod';

// =============================================================================
// SCHEMAS PARA OBSERVACIONES
// =============================================================================

/**
 * Schema para crear una observación/comentario
 * Según HU-0009: máximo 2000 caracteres, soporta menciones @usuario
 */
export const crearObservacionSchema = z.object({
  referencia_tipo: z.enum(['cotizacion', 'orden_pedido', 'orden_compra', 'lead'], {
    errorMap: () => ({ message: 'Tipo de documento inválido' }),
  }),
  referencia_id: z.string().uuid('ID de referencia inválido'),
  contenido: z
    .string()
    .min(1, 'El comentario no puede estar vacío')
    .max(2000, 'Máximo 2000 caracteres'),
  menciones: z.array(z.string().uuid()).default([]),
});

export type CrearObservacionInput = z.infer<typeof crearObservacionSchema>;

/**
 * Schema para observación completa (respuesta de DB)
 */
export const observacionSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  referencia_tipo: z.string(),
  referencia_id: z.string().uuid(),
  contenido: z.string(),
  menciones: z.array(z.string().uuid()),
  creado_por: z.string().uuid(),
  creado_en: z.string().datetime(),
  // Datos expandidos (joins)
  usuario: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      email: z.string().email().optional(),
      picture_url: z.string().url().nullable().optional(),
    })
    .optional(),
});

export type Observacion = z.infer<typeof observacionSchema>;

// =============================================================================
// SCHEMAS PARA ALERTAS INTERNAS
// =============================================================================

/**
 * Schema para alerta interna
 * HU-0009: Tres tipos - estado, mención, seguimiento
 */
export const alertaInternaSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  usuario_id: z.string().uuid(),
  tipo: z.enum(['estado', 'mencion', 'seguimiento']),
  prioridad: z.enum(['baja', 'media', 'alta', 'urgente']),
  titulo: z.string(),
  mensaje: z.string().nullable(),
  extracto: z.string().nullable(),
  referencia_tipo: z.string().nullable(),
  referencia_id: z.string().uuid().nullable(),
  referencia_numero: z.number().nullable(),
  generado_por: z.string().uuid().nullable(),
  observacion_id: z.string().uuid().nullable(),
  leida: z.boolean(),
  leida_en: z.string().datetime().nullable(),
  creado_en: z.string().datetime(),
  expira_en: z.string().datetime().nullable(),
  // Datos expandidos
  generado_por_usuario: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      email: z.string().email().optional(),
      picture_url: z.string().url().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export type AlertaInterna = z.infer<typeof alertaInternaSchema>;

/**
 * Schema para marcar alerta como leída
 */
export const marcarLeidaSchema = z.object({
  alerta_id: z.string().uuid('ID de alerta inválido'),
});

export type MarcarLeidaInput = z.infer<typeof marcarLeidaSchema>;

// =============================================================================
// SCHEMAS PARA BÚSQUEDA DE USUARIOS (Menciones)
// =============================================================================

/**
 * Schema para búsqueda de usuarios en menciones @usuario
 */
export const buscarUsuariosSchema = z.object({
  query: z.string().min(1, 'Query mínimo 1 caracter'),
  organization_id: z.string().uuid('Organization ID inválido'),
  limit: z.number().min(1).max(10).default(5),
});

export type BuscarUsuariosInput = z.infer<typeof buscarUsuariosSchema>;

/**
 * Schema para usuario en resultado de búsqueda
 */
export const usuarioMencionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email().optional(),
  picture_url: z.string().url().nullable().optional(),
});

export type UsuarioMencion = z.infer<typeof usuarioMencionSchema>;

// =============================================================================
// SCHEMAS PARA CONTADORES Y ESTADÍSTICAS
// =============================================================================

/**
 * Schema para contador de observaciones
 */
export const observacionesCountSchema = z.object({
  referencia_tipo: z.enum(['cotizacion', 'orden_pedido', 'orden_compra', 'lead']),
  referencia_id: z.string().uuid(),
});

export type ObservacionesCountInput = z.infer<typeof observacionesCountSchema>;

/**
 * Schema para estadísticas de alertas
 */
export const alertasStatsSchema = z.object({
  total: z.number(),
  no_leidas: z.number(),
  por_tipo: z.object({
    estado: z.number(),
    mencion: z.number(),
    seguimiento: z.number(),
  }),
  por_prioridad: z.object({
    baja: z.number(),
    media: z.number(),
    alta: z.number(),
    urgente: z.number(),
  }),
});

export type AlertasStats = z.infer<typeof alertasStatsSchema>;
