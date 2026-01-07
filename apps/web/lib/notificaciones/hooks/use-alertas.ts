'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  getAlertas,
  getAlertasNoLeidas,
  getAlertasStats,
  marcarAlertaLeidaAction,
  marcarTodasLeidasAction,
} from '../actions/alertas.actions';
import type { AlertaInterna, AlertasStats } from '../schemas/notificaciones.schema';

/**
 * Hook para obtener alertas del usuario con Realtime
 * HU-0009: Panel de notificaciones con actualización en tiempo real
 */
export function useAlertas(
  filtros?: {
    tipo?: 'estado' | 'mencion' | 'seguimiento';
    leida?: boolean;
    prioridad?: 'baja' | 'media' | 'alta' | 'urgente';
  },
  limit = 50,
  offset = 0
) {
  const queryClient = useQueryClient();
  const queryKey = ['alertas', filtros, limit, offset];

  const query = useQuery({
    queryKey,
    queryFn: () => getAlertas(filtros, limit, offset),
    staleTime: 1000 * 30, // 30 segundos
  });

  // Suscripción a Realtime para nuevas alertas del usuario
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    // Obtener el user_id actual
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      const channel = supabase
        .channel(`alertas-usuario:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*', // INSERT, UPDATE
            schema: 'public',
            table: 'alertas_internas',
            filter: `usuario_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Cambio en alertas recibido:', payload);

            // Invalidar todas las queries de alertas
            queryClient.invalidateQueries({ queryKey: ['alertas'] });
            queryClient.invalidateQueries({ queryKey: ['alertas-stats'] });

            // Mostrar notificación para nuevas alertas
            if (payload.eventType === 'INSERT') {
              const nuevaAlerta = payload.new as AlertaInterna;

              // Solo notificar si no está leída (es nueva)
              if (!nuevaAlerta.leida) {
                toast.info(nuevaAlerta.titulo, {
                  description: nuevaAlerta.extracto || nuevaAlerta.mensaje || undefined,
                  action: {
                    label: 'Ver',
                    onClick: () => {
                      // Navegar a la referencia o abrir panel de notificaciones
                      if (nuevaAlerta.referencia_tipo && nuevaAlerta.referencia_id) {
                        window.location.href = `/${nuevaAlerta.referencia_tipo}s/${nuevaAlerta.referencia_id}`;
                      }
                    },
                  },
                });

                // Reproducir sonido de notificación (opcional)
                if (typeof window !== 'undefined' && 'Audio' in window) {
                  try {
                    const audio = new Audio('/sounds/notification.mp3');
                    audio.volume = 0.3;
                    audio.play().catch(() => {
                      // Ignorar errores de autoplay
                    });
                  } catch {
                    // Audio no disponible
                  }
                }
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    });
  }, [queryClient]);

  return query;
}

/**
 * Hook para obtener solo alertas no leídas
 * HU-0009: Badge con contador de no leídas
 */
export function useAlertasNoLeidas() {
  const queryClient = useQueryClient();
  const queryKey = ['alertas', { leida: false }];

  const query = useQuery({
    queryKey,
    queryFn: getAlertasNoLeidas,
    staleTime: 1000 * 30, // 30 segundos
    refetchInterval: 1000 * 60, // Refrescar cada minuto
  });

  // Suscripción a Realtime
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      const channel = supabase
        .channel(`alertas-no-leidas:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'alertas_internas',
            filter: `usuario_id=eq.${user.id}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey });
            queryClient.invalidateQueries({ queryKey: ['alertas-stats'] });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    });
  }, [queryClient, queryKey]);

  return query;
}

/**
 * Hook para obtener estadísticas de alertas
 * HU-0009: Contadores por tipo y prioridad
 */
export function useAlertasStats() {
  const queryClient = useQueryClient();
  const queryKey = ['alertas-stats'];

  const query = useQuery({
    queryKey,
    queryFn: getAlertasStats,
    staleTime: 1000 * 30, // 30 segundos
  });

  // Suscripción a Realtime
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      const channel = supabase
        .channel(`alertas-stats:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'alertas_internas',
            filter: `usuario_id=eq.${user.id}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    });
  }, [queryClient, queryKey]);

  return query;
}

/**
 * Hook para marcar una alerta como leída
 */
export function useMarcarAlertaLeida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertaId: string) => {
      const result = await marcarAlertaLeidaAction({ alerta_id: alertaId });

      if (!result.success) {
        throw new Error(result.message || 'Error al marcar alerta como leída');
      }

      return result.data;
    },
    onMutate: async (alertaId) => {
      // Optimistic update para mejor UX
      await queryClient.cancelQueries({ queryKey: ['alertas'] });

      const previousAlertas = queryClient.getQueryData<AlertaInterna[]>(['alertas']);

      if (previousAlertas) {
        queryClient.setQueriesData<AlertaInterna[]>({ queryKey: ['alertas'] }, (old) =>
          old?.map((alerta) =>
            alerta.id === alertaId
              ? { ...alerta, leida: true, leida_en: new Date().toISOString() }
              : alerta
          )
        );
      }

      return { previousAlertas };
    },
    onError: (err, alertaId, context) => {
      // Rollback
      if (context?.previousAlertas) {
        queryClient.setQueryData(['alertas'], context.previousAlertas);
      }

      toast.error('Error al marcar como leída');
      console.error('Error marcando alerta:', err);
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['alertas'] });
      queryClient.invalidateQueries({ queryKey: ['alertas-stats'] });
    },
  });
}

/**
 * Hook para marcar todas las alertas como leídas
 */
export function useMarcarTodasLeidas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await marcarTodasLeidasAction();

      if (!result.success) {
        throw new Error(result.message || 'Error al marcar todas como leídas');
      }

      return result.data;
    },
    onSuccess: () => {
      // Invalidar todas las queries de alertas
      queryClient.invalidateQueries({ queryKey: ['alertas'] });
      queryClient.invalidateQueries({ queryKey: ['alertas-stats'] });

      toast.success('Todas las alertas marcadas como leídas');
    },
    onError: (err) => {
      toast.error('Error al marcar todas como leídas');
      console.error('Error:', err);
    },
  });
}
