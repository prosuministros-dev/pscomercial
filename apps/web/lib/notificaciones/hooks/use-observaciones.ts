'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  getObservaciones,
  getObservacionesCount,
  crearObservacionAction,
} from '../actions/observaciones.actions';
import type { Observacion, CrearObservacionInput } from '../schemas/notificaciones.schema';

/**
 * Hook para obtener observaciones de un documento con Realtime
 * HU-0009: Timeline de comentarios actualizado en tiempo real
 */
export function useObservaciones(referenciaTipo: string, referenciaId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['observaciones', referenciaTipo, referenciaId];

  // Query para obtener observaciones
  const query = useQuery({
    queryKey,
    queryFn: () => getObservaciones(referenciaTipo, referenciaId),
    staleTime: 1000 * 60, // 1 minuto
  });

  // Suscripción a Realtime para nuevas observaciones
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const channel = supabase
      .channel(`observaciones:${referenciaTipo}:${referenciaId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'observaciones',
          filter: `referencia_tipo=eq.${referenciaTipo},referencia_id=eq.${referenciaId}`,
        },
        (payload) => {
          console.log('Nueva observación recibida:', payload);

          // Invalidar query para refrescar datos
          queryClient.invalidateQueries({ queryKey });

          // Mostrar notificación si es de otro usuario
          // (el usuario actual ya ve su comentario por optimistic update)
          const nuevaObservacion = payload.new as Observacion;
          const currentUserId = supabase.auth.getUser().then(({ data }) => data.user?.id);
          currentUserId.then((userId) => {
            if (nuevaObservacion.creado_por !== userId) {
              toast.info('Nuevo comentario agregado');
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [referenciaTipo, referenciaId, queryClient, queryKey]);

  return query;
}

/**
 * Hook para obtener el contador de observaciones
 * HU-0009: Badge con número de comentarios
 */
export function useObservacionesCount(referenciaTipo: string, referenciaId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['observaciones-count', referenciaTipo, referenciaId];

  const query = useQuery({
    queryKey,
    queryFn: () => getObservacionesCount(referenciaTipo, referenciaId),
    staleTime: 1000 * 60, // 1 minuto
  });

  // Suscripción a Realtime para actualizar contador
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const channel = supabase
      .channel(`observaciones-count:${referenciaTipo}:${referenciaId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'observaciones',
          filter: `referencia_tipo=eq.${referenciaTipo},referencia_id=eq.${referenciaId}`,
        },
        () => {
          // Invalidar contador cuando hay cambios
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [referenciaTipo, referenciaId, queryClient, queryKey]);

  return query;
}

/**
 * Hook para crear una nueva observación
 * Incluye optimistic update para UX instantánea
 */
export function useCrearObservacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CrearObservacionInput) => {
      const result = await crearObservacionAction(input);

      if (!result.success) {
        throw new Error(result.message || 'Error al crear observación');
      }

      return result.data;
    },
    onMutate: async (newObservacion) => {
      // Cancelar queries en progreso
      const queryKey = ['observaciones', newObservacion.referencia_tipo, newObservacion.referencia_id];
      await queryClient.cancelQueries({ queryKey });

      // Snapshot del estado anterior
      const previousObservaciones = queryClient.getQueryData<Observacion[]>(queryKey);

      // Optimistic update
      if (previousObservaciones) {
        const supabase = getSupabaseBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();

        const optimisticObservacion: Observacion = {
          id: crypto.randomUUID(),
          organization_id: '', // Se llenará por el server
          referencia_tipo: newObservacion.referencia_tipo,
          referencia_id: newObservacion.referencia_id,
          contenido: newObservacion.contenido,
          menciones: newObservacion.menciones,
          creado_por: user?.id || '',
          creado_en: new Date().toISOString(),
          usuario: {
            id: user?.id || '',
            name: user?.user_metadata?.name || 'Usuario',
            email: user?.email,
            picture_url: user?.user_metadata?.picture_url,
          },
        };

        queryClient.setQueryData<Observacion[]>(queryKey, [optimisticObservacion, ...previousObservaciones]);
      }

      return { previousObservaciones };
    },
    onError: (err, newObservacion, context) => {
      // Rollback en caso de error
      const queryKey = ['observaciones', newObservacion.referencia_tipo, newObservacion.referencia_id];
      if (context?.previousObservaciones) {
        queryClient.setQueryData(queryKey, context.previousObservaciones);
      }

      toast.error('Error al crear el comentario');
      console.error('Error creando observación:', err);
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({
        queryKey: ['observaciones', variables.referencia_tipo, variables.referencia_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['observaciones-count', variables.referencia_tipo, variables.referencia_id],
      });

      toast.success('Comentario agregado correctamente');
    },
  });
}
