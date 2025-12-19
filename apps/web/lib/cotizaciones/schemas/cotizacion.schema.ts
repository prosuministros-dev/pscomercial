import { z } from 'zod';

// Enums que coinciden con la base de datos
export const CotizacionEstadoEnum = z.enum([
  'BORRADOR',
  'CREACION_OFERTA',
  'NEGOCIACION',
  'RIESGO',
  'PENDIENTE_OC',
  'APROBACION_MARGEN',
  'GANADA',
  'PERDIDA',
]);

export const FormaPagoEnum = z.enum([
  'ANTICIPADO',
  'CREDITO_30',
  'CREDITO_60',
  'CREDITO_90',
]);

export const MonedaEnum = z.enum(['COP', 'USD']);

export const IvaTipoEnum = z.enum(['IVA_0', 'IVA_5', 'IVA_19']);

export type CotizacionEstado = z.infer<typeof CotizacionEstadoEnum>;
export type FormaPago = z.infer<typeof FormaPagoEnum>;
export type Moneda = z.infer<typeof MonedaEnum>;
export type IvaTipo = z.infer<typeof IvaTipoEnum>;

// Schema para crear cotización desde lead
export const CreateCotizacionFromLeadSchema = z.object({
  lead_id: z.string().uuid(),
});

export type CreateCotizacionFromLeadInput = z.infer<typeof CreateCotizacionFromLeadSchema>;

// Schema para crear cotización manual
export const CreateCotizacionSchema = z.object({
  nit: z.string().min(1, 'El NIT es obligatorio'),
  razon_social: z.string().min(1, 'La razón social es obligatoria'),
  nombre_contacto: z.string().min(1, 'El nombre del contacto es obligatorio'),
  celular_contacto: z.string().optional(),
  email_contacto: z.string().email('Email inválido'),
  asunto: z.string().min(1, 'El asunto es obligatorio'),
  fecha_cotizacion: z.string().optional(),
  forma_pago: FormaPagoEnum.default('ANTICIPADO'),
  vigencia_dias: z.number().int().min(1).default(15),
  condiciones_comerciales: z.string().optional(),
  incluye_transporte: z.boolean().default(false),
  valor_transporte: z.number().min(0).default(0),
});

export type CreateCotizacionInput = z.infer<typeof CreateCotizacionSchema>;

// Schema para actualizar cotización
export const UpdateCotizacionSchema = z.object({
  id: z.string().uuid(),
  asunto: z.string().optional(),
  fecha_cotizacion: z.string().optional(),
  forma_pago: FormaPagoEnum.optional(),
  vigencia_dias: z.number().int().min(1).optional(),
  porcentaje_interes: z.number().int().min(0).max(100).optional(),
  mes_cierre: z.string().optional(),
  semana_cierre: z.number().int().optional(),
  fecha_cierre_estimada: z.string().optional(),
  mes_facturacion: z.string().optional(),
  condiciones_comerciales: z.string().optional(),
  cuadro_informativo: z.string().optional(),
  links_adicionales: z.string().optional(),
  incluye_transporte: z.boolean().optional(),
  valor_transporte: z.number().min(0).optional(),
});

export type UpdateCotizacionInput = z.infer<typeof UpdateCotizacionSchema>;

// Schema para cambiar estado de cotización
export const CambiarEstadoCotizacionSchema = z.object({
  id: z.string().uuid(),
  estado: CotizacionEstadoEnum,
  descripcion: z.string().optional(),
});

export type CambiarEstadoCotizacionInput = z.infer<typeof CambiarEstadoCotizacionSchema>;

// Schema para agregar item a cotización
export const AddCotizacionItemSchema = z.object({
  cotizacion_id: z.string().uuid(),
  producto_id: z.string().uuid().optional(),
  numero_parte: z.string().min(1, 'El número de parte es obligatorio'),
  nombre_producto: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional(),
  observaciones: z.string().optional(),
  proveedor_id: z.string().uuid().optional(),
  proveedor_nombre: z.string().optional(),
  tiempo_entrega_dias: z.number().int().min(1).default(15),
  garantia_meses: z.number().int().min(0).default(12),
  costo_unitario: z.number().min(0),
  moneda_costo: MonedaEnum.default('USD'),
  porcentaje_utilidad: z.number().min(0).max(100).default(20),
  iva_tipo: IvaTipoEnum.default('IVA_19'),
  cantidad: z.number().int().min(1).default(1),
  orden: z.number().int().optional(),
});

export type AddCotizacionItemInput = z.infer<typeof AddCotizacionItemSchema>;

// Schema para actualizar item
export const UpdateCotizacionItemSchema = z.object({
  id: z.string().uuid(),
  numero_parte: z.string().optional(),
  nombre_producto: z.string().optional(),
  descripcion: z.string().optional(),
  observaciones: z.string().optional(),
  costo_unitario: z.number().min(0).optional(),
  moneda_costo: MonedaEnum.optional(),
  porcentaje_utilidad: z.number().min(0).max(100).optional(),
  iva_tipo: IvaTipoEnum.optional(),
  cantidad: z.number().int().min(1).optional(),
  tiempo_entrega_dias: z.number().int().min(1).optional(),
  garantia_meses: z.number().int().min(0).optional(),
  orden: z.number().int().optional(),
});

export type UpdateCotizacionItemInput = z.infer<typeof UpdateCotizacionItemSchema>;

// Schema para eliminar item
export const DeleteCotizacionItemSchema = z.object({
  id: z.string().uuid(),
});

export type DeleteCotizacionItemInput = z.infer<typeof DeleteCotizacionItemSchema>;

// Schema para reordenar items
export const ReorderItemsSchema = z.object({
  cotizacion_id: z.string().uuid(),
  items: z.array(z.object({
    id: z.string().uuid(),
    orden: z.number().int(),
  })),
});

export type ReorderItemsInput = z.infer<typeof ReorderItemsSchema>;

// Schema para filtros
export const CotizacionFiltersSchema = z.object({
  estado: CotizacionEstadoEnum.optional(),
  asesor_id: z.string().uuid().optional(),
  cliente_id: z.string().uuid().optional(),
  busqueda: z.string().optional(),
  fecha_desde: z.string().optional(),
  fecha_hasta: z.string().optional(),
});

export type CotizacionFilters = z.infer<typeof CotizacionFiltersSchema>;

// Helpers para IVA
export const IVA_PORCENTAJES: Record<IvaTipo, number> = {
  IVA_0: 0,
  IVA_5: 5,
  IVA_19: 19,
};

export function getIvaPorcentaje(tipo: IvaTipo): number {
  return IVA_PORCENTAJES[tipo];
}
