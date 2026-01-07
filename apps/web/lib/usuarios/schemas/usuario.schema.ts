import { z } from 'zod';

// Estados de usuario
export const UsuarioEstado = {
  ACTIVO: 'ACTIVO',
  INACTIVO: 'INACTIVO',
} as const;

export type UsuarioEstadoType = (typeof UsuarioEstado)[keyof typeof UsuarioEstado];

// Schema base de usuario
export const UsuarioSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(1),
  email: z.string().email(),
  telefono: z.string().nullable(),
  area: z.string().nullable(),
  avatar_url: z.string().nullable(),
  estado: z.enum(['ACTIVO', 'INACTIVO']).nullable(),
  creado_en: z.string().nullable(),
  modificado_en: z.string().nullable(),
});

// Schema para crear usuario
export const CreateUsuarioSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  telefono: z.string().optional(),
  area: z.string().optional(),
  estado: z.enum(['ACTIVO', 'INACTIVO']).optional().default('ACTIVO'),
});

// Schema para actualizar usuario
export const UpdateUsuarioSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(1).optional(),
  telefono: z.string().nullable().optional(),
  area: z.string().nullable().optional(),
  estado: z.enum(['ACTIVO', 'INACTIVO']).optional(),
});

// Schema para cambiar estado
export const ToggleUsuarioEstadoSchema = z.object({
  id: z.string().uuid(),
  estado: z.enum(['ACTIVO', 'INACTIVO']),
});

// Tipos TypeScript
export type Usuario = z.infer<typeof UsuarioSchema>;
export type CreateUsuarioInput = z.infer<typeof CreateUsuarioSchema>;
export type UpdateUsuarioInput = z.infer<typeof UpdateUsuarioSchema>;
export type ToggleUsuarioEstadoInput = z.infer<typeof ToggleUsuarioEstadoSchema>;
