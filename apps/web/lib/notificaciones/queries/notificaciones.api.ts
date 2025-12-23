import type { SupabaseClient } from '@supabase/supabase-js';

import type { NotificacionFilters } from '../schemas/notificacion.schema';

export function createNotificacionesApi(client: SupabaseClient) {
  return {
    /**
     * Obtener notificaciones del usuario actual
     */
    async getNotificaciones(filters?: NotificacionFilters) {
      let query = client
        .from('notificaciones')
        .select('*')
        .order('creado_en', { ascending: false });

      if (filters?.leida !== undefined) {
        query = query.eq('leida', filters.leida);
      }

      if (filters?.tipo) {
        query = query.eq('tipo', filters.tipo);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 50) - 1
        );
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error al obtener notificaciones: ${error.message}`);
      }

      return data;
    },

    /**
     * Contar notificaciones no leídas
     */
    async getCountNoLeidas() {
      const { count, error } = await client
        .from('notificaciones')
        .select('*', { count: 'exact', head: true })
        .eq('leida', false);

      if (error) {
        throw new Error(
          `Error al contar notificaciones: ${error.message}`
        );
      }

      return count || 0;
    },

    /**
     * Marcar notificación como leída
     */
    async marcarLeida(notificacionId: string) {
      const { data, error } = await client
        .from('notificaciones')
        .update({
          leida: true,
          leida_en: new Date().toISOString(),
        })
        .eq('id', notificacionId)
        .select()
        .single();

      if (error) {
        throw new Error(
          `Error al marcar notificación como leída: ${error.message}`
        );
      }

      return data;
    },

    /**
     * Marcar todas las notificaciones como leídas
     */
    async marcarTodasLeidas() {
      const { data, error } = await client.rpc(
        'marcar_todas_notificaciones_leidas'
      );

      if (error) {
        throw new Error(
          `Error al marcar notificaciones como leídas: ${error.message}`
        );
      }

      return data;
    },
  };
}
