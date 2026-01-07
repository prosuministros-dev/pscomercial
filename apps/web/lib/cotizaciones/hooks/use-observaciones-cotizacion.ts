'use client';

import { useEffect } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getSupabaseBrowserClient } from '@kit/supabase/browser-client';

import {
  crearObservacion,
  eliminarObservacion,
  getObservacionesCotizacion,
  getUsuariosParaMenciones,
} from '../actions/observaciones.actions';

/**
 * Hook para observaciones de cotización con Realtime
 */
export function useObservacionesCotizacion(cotizacionId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['observaciones', cotizacionId];

  // Query para obtener observaciones
  const observacionesQuery = useQuery({
    queryKey,
    queryFn: () => getObservacionesCotizacion(cotizacionId),
    enabled: !!cotizacionId,
  });

  // Suscripción a cambios en tiempo real
  useEffect(() => {
    if (!cotizacionId) return;

    const supabase = getSupabaseBrowserClient();

    const channel = supabase
      .channel(`observaciones:${cotizacionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cotizacion_observaciones',
          filter: `cotizacion_id=eq.${cotizacionId}`,
        },
        () => {
          // Invalidar query para refrescar datos
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cotizacionId, queryClient, queryKey]);

  // Mutation para crear observación
  const crearMutation = useMutation({
    mutationFn: (params: { texto: string; menciones: string[] }) =>
      crearObservacion({
        cotizacionId,
        texto: params.texto,
        menciones: params.menciones,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Comentario agregado');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al agregar comentario');
    },
  });

  // Mutation para eliminar observación
  const eliminarMutation = useMutation({
    mutationFn: eliminarObservacion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Comentario eliminado');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar comentario');
    },
  });

  return {
    observaciones: observacionesQuery.data || [],
    isLoading: observacionesQuery.isLoading,
    error: observacionesQuery.error,
    agregarObservacion: crearMutation.mutateAsync,
    eliminarObservacion: eliminarMutation.mutateAsync,
    isAgregando: crearMutation.isPending,
    isEliminando: eliminarMutation.isPending,
  };
}

/**
 * Hook para obtener usuarios mencionables
 */
export function useUsuariosParaMenciones() {
  return useQuery({
    queryKey: ['usuarios', 'menciones'],
    queryFn: getUsuariosParaMenciones,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
