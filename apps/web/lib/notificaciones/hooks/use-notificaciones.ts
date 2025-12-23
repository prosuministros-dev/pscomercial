// @ts-nocheck
// TODO: Remover ts-nocheck cuando se ejecute la migración 20241220000008_notificaciones.sql
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';

import {
  marcarNotificacionLeidaAction,
  marcarTodasNotificacionesLeidasAction,
} from '../actions/notificaciones.actions';
import { createNotificacionesApi } from '../queries/notificaciones.api';
import type { NotificacionFilters } from '../schemas/notificacion.schema';

// Query Keys
export const notificacionesKeys = {
  all: ['notificaciones'] as const,
  lists: () => [...notificacionesKeys.all, 'list'] as const,
  list: (filters?: NotificacionFilters) =>
    [...notificacionesKeys.lists(), filters] as const,
  count: () => [...notificacionesKeys.all, 'count'] as const,
};

/**
 * Hook para obtener notificaciones
 */
export function useNotificaciones(filters?: NotificacionFilters) {
  const client = useSupabase();
  const api = createNotificacionesApi(client);

  return useQuery({
    queryKey: notificacionesKeys.list(filters),
    queryFn: () => api.getNotificaciones(filters),
  });
}

/**
 * Hook para obtener solo notificaciones no leídas
 */
export function useNotificacionesNoLeidas() {
  return useNotificaciones({ leida: false });
}

/**
 * Hook para obtener el conteo de notificaciones no leídas
 */
export function useNotificacionesCount() {
  const client = useSupabase();
  const api = createNotificacionesApi(client);

  return useQuery({
    queryKey: notificacionesKeys.count(),
    queryFn: () => api.getCountNoLeidas(),
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });
}

/**
 * Hook para marcar una notificación como leída
 */
export function useMarcarNotificacionLeida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: marcarNotificacionLeidaAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificacionesKeys.all });
    },
  });
}

/**
 * Hook para marcar todas las notificaciones como leídas
 */
export function useMarcarTodasLeidas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: marcarTodasNotificacionesLeidasAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificacionesKeys.all });
    },
  });
}
