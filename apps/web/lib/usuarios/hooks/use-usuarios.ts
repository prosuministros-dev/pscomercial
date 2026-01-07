'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';

import {
  createUsuarioAction,
  toggleUsuarioEstadoAction,
  updateUsuarioAction,
} from '../actions/usuarios.actions';
import type {
  CreateUsuarioInput,
  ToggleUsuarioEstadoInput,
  UpdateUsuarioInput,
} from '../schemas/usuario.schema';

// Query Keys
export const usuariosKeys = {
  all: ['usuarios'] as const,
  lists: () => [...usuariosKeys.all, 'list'] as const,
  detail: (id: string) => [...usuariosKeys.all, 'detail', id] as const,
};

/**
 * Hook para obtener todos los usuarios
 */
export function useUsuarios() {
  const client = useSupabase();

  return useQuery({
    queryKey: usuariosKeys.lists(),
    queryFn: async () => {
      const { data, error } = await client
        .from('usuarios')
        .select('*')
        .order('nombre');

      if (error) {
        throw new Error(`Error al obtener usuarios: ${error.message}`);
      }

      return data;
    },
  });
}

/**
 * Hook para obtener un usuario por ID
 */
export function useUsuario(id: string) {
  const client = useSupabase();

  return useQuery({
    queryKey: usuariosKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await client
        .from('usuarios')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Error al obtener usuario: ${error.message}`);
      }

      return data;
    },
    enabled: !!id,
  });
}

/**
 * Hook para crear usuario
 */
export function useCreateUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUsuarioInput) => createUsuarioAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.all });
    },
  });
}

/**
 * Hook para actualizar usuario
 */
export function useUpdateUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUsuarioInput) => updateUsuarioAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.all });
    },
  });
}

/**
 * Hook para cambiar estado de usuario
 */
export function useToggleUsuarioEstado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ToggleUsuarioEstadoInput) =>
      toggleUsuarioEstadoAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.all });
    },
  });
}
