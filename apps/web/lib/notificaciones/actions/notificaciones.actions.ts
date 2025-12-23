// @ts-nocheck
// TODO: Remover ts-nocheck cuando se ejecute la migración 20241220000008_notificaciones.sql
'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { MarcarLeidaSchema } from '../schemas/notificacion.schema';

/**
 * Marcar una notificación como leída
 */
export const marcarNotificacionLeidaAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { data: notificacion, error } = await client
      .from('notificaciones')
      .update({
        leida: true,
        leida_en: new Date().toISOString(),
      })
      .eq('id', data.notificacion_id)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Error al marcar notificación como leída: ${error.message}`
      );
    }

    revalidatePath('/home');

    return { success: true, notificacion };
  },
  {
    schema: MarcarLeidaSchema,
  }
);

/**
 * Marcar todas las notificaciones como leídas
 */
export const marcarTodasNotificacionesLeidasAction = enhanceAction(
  async () => {
    const client = getSupabaseServerClient();

    const { data, error } = await client.rpc(
      'marcar_todas_notificaciones_leidas'
    );

    if (error) {
      throw new Error(
        `Error al marcar notificaciones como leídas: ${error.message}`
      );
    }

    revalidatePath('/home');

    return { success: true, count: data };
  },
  {}
);
