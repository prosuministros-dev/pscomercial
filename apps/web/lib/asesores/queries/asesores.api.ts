import type { SupabaseClient } from '@supabase/supabase-js';

export function createAsesoresApi(client: SupabaseClient) {
  return {
    /**
     * Obtener todos los asesores configurados
     */
    async getAsesores() {
      const { data, error } = await client
        .from('asesores_config')
        .select(
          `
          *,
          usuario:usuarios(id, nombre, email, avatar_url, estado)
        `
        )
        .order('creado_en', { ascending: false });

      if (error) {
        throw new Error(`Error al obtener asesores: ${error.message}`);
      }

      return data;
    },

    /**
     * Obtener solo asesores activos
     */
    async getAsesoresActivos() {
      const { data, error } = await client
        .from('asesores_config')
        .select(
          `
          *,
          usuario:usuarios!inner(id, nombre, email, avatar_url, estado)
        `
        )
        .eq('activo', true)
        .eq('usuarios.estado', 'ACTIVO')
        .order('usuario(nombre)', { ascending: true });

      if (error) {
        throw new Error(`Error al obtener asesores activos: ${error.message}`);
      }

      return data;
    },

    /**
     * Obtener configuración de un asesor por ID de usuario
     */
    async getAsesorByUsuarioId(usuarioId: string) {
      const { data, error } = await client
        .from('asesores_config')
        .select(
          `
          *,
          usuario:usuarios(id, nombre, email, avatar_url, estado)
        `
        )
        .eq('usuario_id', usuarioId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No existe configuración
        }
        throw new Error(`Error al obtener asesor: ${error.message}`);
      }

      return data;
    },

    /**
     * Obtener estadísticas de leads por asesor
     */
    async getEstadisticasAsesores() {
      const { data, error } = await client.rpc(
        'obtener_estadisticas_asignaciones'
      );

      if (error) {
        throw new Error(`Error al obtener estadísticas: ${error.message}`);
      }

      return data;
    },

    /**
     * Contar leads pendientes de un asesor
     */
    async getLeadsPendientesAsesor(usuarioId: string) {
      const { data, error } = await client.rpc(
        'contar_leads_pendientes_asesor',
        {
          p_usuario_id: usuarioId,
        }
      );

      if (error) {
        throw new Error(
          `Error al contar leads pendientes: ${error.message}`
        );
      }

      return data as number;
    },
  };
}
