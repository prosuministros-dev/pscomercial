'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import {
  CreateAsesorConfigSchema,
  ToggleAsesorActivoSchema,
  UpdateAsesorConfigSchema,
} from '../schemas/asesor.schema';

/**
 * Crear configuración de asesor
 */
export const createAsesorConfigAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { data: config, error } = await client
      .from('asesores_config')
      .insert({
        usuario_id: data.usuario_id,
        activo: data.activo ?? true,
        max_leads_pendientes: data.max_leads_pendientes ?? 5,
      })
      .select()
      .single();

    if (error) {
      throw new Error(
        `Error al crear configuración de asesor: ${error.message}`
      );
    }

    revalidatePath('/home/configuracion/asesores');

    return { success: true, config };
  },
  {
    schema: CreateAsesorConfigSchema,
  }
);

/**
 * Actualizar configuración de asesor
 */
export const updateAsesorConfigAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { id, ...updateData } = data;

    const { data: config, error } = await client
      .from('asesores_config')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Error al actualizar configuración de asesor: ${error.message}`
      );
    }

    revalidatePath('/home/configuracion/asesores');

    return { success: true, config };
  },
  {
    schema: UpdateAsesorConfigSchema,
  }
);

/**
 * Activar/desactivar asesor
 */
export const toggleAsesorActivoAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { data: config, error } = await client
      .from('asesores_config')
      .update({ activo: data.activo })
      .eq('id', data.id)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Error al cambiar estado del asesor: ${error.message}`
      );
    }

    revalidatePath('/home/configuracion/asesores');
    revalidatePath('/home/leads');

    return { success: true, config };
  },
  {
    schema: ToggleAsesorActivoSchema,
  }
);
