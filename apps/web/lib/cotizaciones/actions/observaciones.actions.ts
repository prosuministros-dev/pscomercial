'use server';

import { revalidatePath } from 'next/cache';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

/**
 * Obtener observaciones de una cotización
 */
export async function getObservacionesCotizacion(cotizacionId: string) {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from('v_cotizacion_observaciones')
    .select('*')
    .eq('cotizacion_id', cotizacionId)
    .order('creado_en', { ascending: false });

  if (error) {
    console.error('Error fetching observaciones:', error);
    throw new Error('Error al cargar observaciones');
  }

  return data || [];
}

/**
 * Crear nueva observación
 */
export async function crearObservacion(params: {
  cotizacionId: string;
  texto: string;
  menciones: string[];
}) {
  const supabase = getSupabaseServerClient();

  // Obtener usuario actual
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  const { data, error } = await supabase
    .from('cotizacion_observaciones')
    .insert({
      cotizacion_id: params.cotizacionId,
      usuario_id: user.id,
      texto: params.texto,
      menciones: params.menciones?.length > 0 ? params.menciones : null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating observacion:', error);
    throw new Error('Error al crear observación');
  }

  // Revalidar para actualizar la lista
  revalidatePath(`/home/cotizaciones`);

  return data;
}

/**
 * Obtener usuarios para menciones
 */
export async function getUsuariosParaMenciones() {
  const supabase = getSupabaseServerClient();

  // Obtener organización del usuario actual
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  // Obtener usuarios de la misma organización
  const { data, error} = await supabase
    .from('usuarios')
    .select('id, nombre, email')
    .order('nombre');

  if (error) {
    console.error('Error fetching usuarios:', error);
    return [];
  }

  return data || [];
}

/**
 * Eliminar observación (solo el autor)
 */
export async function eliminarObservacion(observacionId: string) {
  const supabase = getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  const { error } = await supabase
    .from('cotizacion_observaciones')
    .delete()
    .eq('id', observacionId)
    .eq('usuario_id', user.id); // Solo el autor puede eliminar

  if (error) {
    console.error('Error deleting observacion:', error);
    throw new Error('Error al eliminar observación');
  }

  revalidatePath(`/home/cotizaciones`);

  return true;
}
