import { z } from 'zod';

// Enums que coinciden con la base de datos
export const LeadEstadoEnum = z.enum([
  'PENDIENTE_ASIGNACION',
  'PENDIENTE_INFORMACION',
  'ASIGNADO',
  'CONVERTIDO',
  'RECHAZADO',
]);

export const LeadCanalEnum = z.enum(['WHATSAPP', 'WEB', 'MANUAL']);

export type LeadEstado = z.infer<typeof LeadEstadoEnum>;
export type LeadCanal = z.infer<typeof LeadCanalEnum>;

// Schema para crear un lead
export const CreateLeadSchema = z.object({
  razon_social: z
    .string()
    .min(1, 'La razón social es obligatoria')
    .max(255, 'La razón social no puede exceder 255 caracteres'),
  nit: z
    .string()
    .min(1, 'El NIT es obligatorio')
    .max(20, 'El NIT no puede exceder 20 caracteres'),
  nombre_contacto: z
    .string()
    .min(1, 'El nombre del contacto es obligatorio')
    .max(255, 'El nombre no puede exceder 255 caracteres'),
  celular_contacto: z
    .string()
    .min(1, 'El celular es obligatorio')
    .max(20, 'El celular no puede exceder 20 caracteres')
    .regex(/^\+?[0-9\s-]+$/, 'Formato de celular inválido')
    .refine(
      (val) => {
        // Extraer solo los dígitos (sin +, espacios ni guiones)
        const digits = val.replace(/[\s\-+]/g, '');
        return digits.length === 10;
      },
      { message: 'El celular debe tener exactamente 10 dígitos' }
    ),
  email_contacto: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('El email no es válido')
    .max(320, 'El email no puede exceder 320 caracteres'),
  requerimiento: z
    .string()
    .min(1, 'El requerimiento es obligatorio'),
  canal_origen: LeadCanalEnum.default('MANUAL'),
  fecha_lead: z.string().optional(),
});

export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;

// Schema para actualizar un lead
export const UpdateLeadSchema = z.object({
  id: z.string().uuid(),
  razon_social: z.string().min(1).max(255).optional(),
  nit: z.string().min(1).max(20).optional(),
  nombre_contacto: z.string().min(1).max(255).optional(),
  celular_contacto: z
    .string()
    .max(20)
    .regex(/^\+?[0-9\s-]+$/, 'Formato de celular inválido')
    .refine(
      (val) => {
        if (!val) return true;
        const digits = val.replace(/[\s\-+]/g, '');
        return digits.length === 10;
      },
      { message: 'El celular debe tener exactamente 10 dígitos' }
    )
    .optional(),
  email_contacto: z.string().email().max(320).optional(),
  requerimiento: z.string().optional(),
  fecha_lead: z.string().optional(),
});

export type UpdateLeadInput = z.infer<typeof UpdateLeadSchema>;

// Schema para asignar un lead
export const AssignLeadSchema = z.object({
  lead_id: z.string().uuid(),
  asesor_id: z.string().uuid(),
  motivo: z.string().optional(),
});

export type AssignLeadInput = z.infer<typeof AssignLeadSchema>;

// Schema para rechazar un lead
export const RejectLeadSchema = z.object({
  lead_id: z.string().uuid(),
  motivo_rechazo: z.string().min(1, 'El motivo de rechazo es obligatorio'),
});

export type RejectLeadInput = z.infer<typeof RejectLeadSchema>;

// Schema para convertir un lead
export const ConvertLeadSchema = z.object({
  lead_id: z.string().uuid(),
});

export type ConvertLeadInput = z.infer<typeof ConvertLeadSchema>;

// Schema para agregar observación
export const AddObservacionSchema = z.object({
  lead_id: z.string().uuid(),
  texto: z.string().min(1, 'El texto es obligatorio'),
  menciones: z.array(z.string().uuid()).optional(),
});

export type AddObservacionInput = z.infer<typeof AddObservacionSchema>;

// Schema para filtros de búsqueda
export const LeadFiltersSchema = z.object({
  estado: LeadEstadoEnum.optional(),
  canal_origen: LeadCanalEnum.optional(),
  asesor_id: z.string().uuid().optional(),
  busqueda: z.string().optional(),
  fecha_desde: z.string().optional(),
  fecha_hasta: z.string().optional(),
});

export type LeadFilters = z.infer<typeof LeadFiltersSchema>;
