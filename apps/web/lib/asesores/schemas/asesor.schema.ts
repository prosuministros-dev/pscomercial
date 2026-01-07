import { z } from 'zod';

// Schema base de configuración de asesor
export const AsesorConfigSchema = z.object({
  id: z.string().uuid(),
  usuario_id: z.string().uuid(),
  activo: z.boolean(),
  max_leads_pendientes: z.number().int().min(1).max(50),
  creado_en: z.string(),
  modificado_en: z.string().nullable(),
});

// Schema con datos del usuario
export const AsesorConUsuarioSchema = AsesorConfigSchema.extend({
  usuario: z.object({
    id: z.string().uuid(),
    nombre: z.string(),
    email: z.string(),
    avatar_url: z.string().nullable(),
    estado: z.enum(['ACTIVO', 'INACTIVO']),
  }),
});

// Schema para crear/actualizar configuración de asesor
export const CreateAsesorConfigSchema = z.object({
  usuario_id: z.string().uuid(),
  activo: z.boolean().optional().default(true),
  max_leads_pendientes: z.number().int().min(1).max(50).optional().default(5),
});

export const UpdateAsesorConfigSchema = z.object({
  id: z.string().uuid(),
  activo: z.boolean().optional(),
  max_leads_pendientes: z.number().int().min(1).max(50).optional(),
});

// Schema para activar/desactivar asesor
export const ToggleAsesorActivoSchema = z.object({
  id: z.string().uuid(),
  activo: z.boolean(),
});

// Tipos TypeScript
export type AsesorConfig = z.infer<typeof AsesorConfigSchema>;
export type AsesorConUsuario = z.infer<typeof AsesorConUsuarioSchema>;
export type CreateAsesorConfigInput = z.infer<typeof CreateAsesorConfigSchema>;
export type UpdateAsesorConfigInput = z.infer<typeof UpdateAsesorConfigSchema>;
export type ToggleAsesorActivoInput = z.infer<typeof ToggleAsesorActivoSchema>;
