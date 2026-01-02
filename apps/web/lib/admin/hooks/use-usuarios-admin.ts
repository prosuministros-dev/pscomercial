'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';

export interface UsuarioAdmin {
  id: string;
  nombre: string;
  email: string;
  avatar_url: string | null;
  estado: string;
  creado_en: string;
  roles: {
    id: string;
    nombre: string;
  }[];
}

/**
 * Hook para obtener todos los usuarios con sus roles
 */
export function useUsuariosAdmin() {
  const client = useSupabase();

  return useQuery({
    queryKey: ['usuarios-admin'],
    queryFn: async () => {
      const { data, error } = await client
        .from('usuarios')
        .select(`
          id,
          nombre,
          email,
          avatar_url,
          estado,
          creado_en,
          roles:usuario_roles(
            rol:roles(id, nombre)
          )
        `)
        .order('nombre');

      if (error) throw error;

      // Transformar la estructura
      return data.map((usuario: any) => ({
        ...usuario,
        roles: usuario.roles?.map((ur: any) => ur.rol).filter(Boolean) || [],
      })) as UsuarioAdmin[];
    },
  });
}

/**
 * Hook para actualizar roles de un usuario
 */
export function useActualizarRolesUsuario() {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ usuarioId, rolIds }: {
      usuarioId: string;
      rolIds: string[]
    }) => {
      // Eliminar roles existentes
      const { error: deleteError } = await client
        .from('usuario_roles')
        .delete()
        .eq('usuario_id', usuarioId);

      if (deleteError) throw deleteError;

      // Asignar nuevos roles
      if (rolIds.length > 0) {
        const { error: insertError } = await client
          .from('usuario_roles')
          .insert(rolIds.map(rolId => ({
            usuario_id: usuarioId,
            rol_id: rolId,
            asignado_en: new Date().toISOString(),
          })));

        if (insertError) throw insertError;
      }

      return { usuarioId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios-admin'] });
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
    },
  });
}

/**
 * Hook para actualizar estado de un usuario
 */
export function useActualizarEstadoUsuario() {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ usuarioId, estado }: {
      usuarioId: string;
      estado: 'ACTIVO' | 'INACTIVO'
    }) => {
      const { error } = await client
        .from('usuarios')
        .update({ estado })
        .eq('id', usuarioId);

      if (error) throw error;
      return { usuarioId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios-admin'] });
    },
  });
}
