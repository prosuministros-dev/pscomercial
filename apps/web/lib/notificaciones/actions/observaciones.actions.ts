'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { enhanceAction } from '@/lib/actions';
import {
  crearObservacionSchema,
  type CrearObservacionInput,
  observacionSchema,
  type Observacion,
  observacionesCountSchema,
  type ObservacionesCountInput,
} from '../schemas/notificaciones.schema';

/**
 * Server action para crear una nueva observación/comentario
 * HU-0009: Soporta menciones @usuario
 */
export const crearObservacionAction = enhanceAction(
  crearObservacionSchema,
  async (data: CrearObservacionInput, formData, { user }) => {
    const supabase = await getSupabaseServerClient();

    // Obtener organization_id del usuario
    const { data: userOrg, error: userError } = await supabase
      .from('usuario_organizaciones')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (userError || !userOrg) {
      throw new Error('Usuario no pertenece a ninguna organización');
    }

    // Insertar observación
    const { data: observacion, error } = await supabase
      .from('observaciones')
      .insert({
        organization_id: userOrg.organization_id,
        referencia_tipo: data.referencia_tipo,
        referencia_id: data.referencia_id,
        contenido: data.contenido,
        menciones: data.menciones,
        creado_por: user.id,
      })
      .select(
        `
        *,
        usuario:creado_por (
          id,
          name,
          email,
          picture_url
        )
      `
      )
      .single();

    if (error) {
      console.error('Error creando observación:', error);
      throw new Error('Error al crear el comentario');
    }

    // Revalidar paths relevantes
    revalidatePath(`/${data.referencia_tipo}s`);
    if (data.referencia_tipo === 'cotizacion') {
      revalidatePath('/cotizaciones');
    }

    return observacionSchema.parse(observacion);
  }
);

/**
 * Query para obtener observaciones de un documento
 * @param referenciaTipo - Tipo de documento (cotizacion, orden_pedido, etc.)
 * @param referenciaId - ID del documento
 * @returns Lista de observaciones ordenadas por fecha (más reciente primero)
 */
export async function getObservaciones(
  referenciaTipo: string,
  referenciaId: string
): Promise<Observacion[]> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from('observaciones')
    .select(
      `
      *,
      usuario:creado_por (
        id,
        name,
        email,
        picture_url
      )
    `
    )
    .eq('referencia_tipo', referenciaTipo)
    .eq('referencia_id', referenciaId)
    .order('creado_en', { ascending: false });

  if (error) {
    console.error('Error obteniendo observaciones:', error);
    throw new Error('Error al cargar los comentarios');
  }

  return data.map((obs) => observacionSchema.parse(obs));
}

/**
 * Query para obtener el contador de observaciones de un documento
 * @param referenciaTipo - Tipo de documento
 * @param referenciaId - ID del documento
 * @returns Número total de observaciones
 */
export async function getObservacionesCount(
  referenciaTipo: string,
  referenciaId: string
): Promise<number> {
  const supabase = await getSupabaseServerClient();

  // Validar input
  observacionesCountSchema.parse({ referencia_tipo: referenciaTipo, referencia_id: referenciaId });

  // Usar función SQL helper para mejor performance
  const { data, error } = await supabase.rpc('get_observaciones_count', {
    p_referencia_tipo: referenciaTipo,
    p_referencia_id: referenciaId,
  });

  if (error) {
    console.error('Error obteniendo contador de observaciones:', error);
    return 0; // Retornar 0 en caso de error para no romper la UI
  }

  return data ?? 0;
}

/**
 * Query para obtener usuarios mencionados en una observación
 * @param observacionId - ID de la observación
 * @returns Lista de usuarios mencionados con sus datos básicos
 */
export async function getUsuariosMencionados(observacionId: string) {
  const supabase = await getSupabaseServerClient();

  const { data: observacion, error: obsError } = await supabase
    .from('observaciones')
    .select('menciones')
    .eq('id', observacionId)
    .single();

  if (obsError || !observacion || !observacion.menciones || observacion.menciones.length === 0) {
    return [];
  }

  const { data: usuarios, error: usersError } = await supabase
    .from('usuarios')
    .select('id, name, email, picture_url')
    .in('id', observacion.menciones);

  if (usersError) {
    console.error('Error obteniendo usuarios mencionados:', error);
    return [];
  }

  return usuarios;
}
