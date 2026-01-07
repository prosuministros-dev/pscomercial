'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';

import {
  createAsesorConfigAction,
  toggleAsesorActivoAction,
  updateAsesorConfigAction,
} from '../actions/asesores.actions';
import { createAsesoresApi } from '../queries/asesores.api';
import type {
  CreateAsesorConfigInput,
  ToggleAsesorActivoInput,
  UpdateAsesorConfigInput,
} from '../schemas/asesor.schema';

// Query Keys
export const asesoresKeys = {
  all: ['asesores'] as const,
  lists: () => [...asesoresKeys.all, 'list'] as const,
  activos: () => [...asesoresKeys.all, 'activos'] as const,
  disponibles: () => [...asesoresKeys.all, 'disponibles'] as const,
  detail: (usuarioId: string) => [...asesoresKeys.all, 'detail', usuarioId] as const,
  estadisticas: () => [...asesoresKeys.all, 'estadisticas'] as const,
  leadsPendientes: (usuarioId: string) =>
    [...asesoresKeys.all, 'leads-pendientes', usuarioId] as const,
};

/**
 * Hook para obtener todos los asesores
 */
export function useAsesores() {
  const client = useSupabase();
  const api = createAsesoresApi(client);

  return useQuery({
    queryKey: asesoresKeys.lists(),
    queryFn: () => api.getAsesores(),
  });
}

/**
 * Hook para obtener asesores activos (para selects)
 */
export function useAsesoresActivos() {
  const client = useSupabase();
  const api = createAsesoresApi(client);

  return useQuery({
    queryKey: asesoresKeys.activos(),
    queryFn: () => api.getAsesoresActivos(),
  });
}

/**
 * Hook para obtener configuración de un asesor
 */
export function useAsesorConfig(usuarioId: string) {
  const client = useSupabase();
  const api = createAsesoresApi(client);

  return useQuery({
    queryKey: asesoresKeys.detail(usuarioId),
    queryFn: () => api.getAsesorByUsuarioId(usuarioId),
    enabled: !!usuarioId,
  });
}

/**
 * Hook para obtener estadísticas de asesores
 */
export function useEstadisticasAsesores() {
  const client = useSupabase();
  const api = createAsesoresApi(client);

  return useQuery({
    queryKey: asesoresKeys.estadisticas(),
    queryFn: () => api.getEstadisticasAsesores(),
  });
}

/**
 * Hook para contar leads pendientes de un asesor
 */
export function useLeadsPendientesAsesor(usuarioId: string) {
  const client = useSupabase();
  const api = createAsesoresApi(client);

  return useQuery({
    queryKey: asesoresKeys.leadsPendientes(usuarioId),
    queryFn: () => api.getLeadsPendientesAsesor(usuarioId),
    enabled: !!usuarioId,
  });
}

/**
 * Hook para crear configuración de asesor
 */
export function useCreateAsesorConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAsesorConfigInput) =>
      createAsesorConfigAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: asesoresKeys.all });
    },
  });
}

/**
 * Hook para actualizar configuración de asesor
 */
export function useUpdateAsesorConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAsesorConfigInput) =>
      updateAsesorConfigAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: asesoresKeys.all });
    },
  });
}

/**
 * Hook para activar/desactivar asesor
 */
export function useToggleAsesorActivo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ToggleAsesorActivoInput) =>
      toggleAsesorActivoAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: asesoresKeys.all });
    },
  });
}

/**
 * Hook para obtener usuarios disponibles para ser asesores
 * (usuarios activos que aún no tienen configuración de asesor)
 */
export function useUsuariosDisponiblesParaAsesor() {
  const client = useSupabase();

  return useQuery({
    queryKey: asesoresKeys.disponibles(),
    queryFn: async () => {
      // Obtener IDs de usuarios que ya son asesores
      const { data: asesoresExistentes } = await client
        .from('asesores_config')
        .select('usuario_id');

      const idsAsesores = asesoresExistentes?.map((a) => a.usuario_id) || [];

      // Obtener usuarios activos que no son asesores
      let query = client
        .from('usuarios')
        .select('id, nombre, email, avatar_url')
        .eq('estado', 'ACTIVO')
        .order('nombre');

      if (idsAsesores.length > 0) {
        query = query.not('id', 'in', `(${idsAsesores.join(',')})`);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error al obtener usuarios: ${error.message}`);
      }

      return data;
    },
  });
}
