'use client';

import { useEffect } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getSupabaseBrowserClient } from '@kit/supabase/browser-client';

interface Notificacion {
  id: string;
  usuario_id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  prioridad: string;
  entidad_tipo: string | null;
  entidad_id: string | null;
  leida: boolean;
  leida_en: string | null;
  metadata: Record<string, any>;
  creado_en: string;
  extracto?: string;
  referencia_numero?: number;
  generado_por?: string;
  observacion_id?: string;
  expira_en?: string;
}

/**
 * Hook para obtener notificaciones del usuario
 */
export function useNotificaciones() {
  const queryClient = useQueryClient();
  const queryKey = ['notificaciones'];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('usuario_id', user.id)
        .order('creado_en', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching notificaciones:', error);
        throw error;
      }

      return (data || []) as Notificacion[];
    },
  });

  // Suscripción a cambios en tiempo real
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      const channel = supabase
        .channel('notificaciones-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notificaciones',
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
 * Hook para marcar notificación como leída
 */
export function useMarcarNotificacionLeida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificacionId: string) => {
      const supabase = getSupabaseBrowserClient();

      const { error } = await supabase
        .from('notificaciones')
        .update({ leida: true, leida_en: new Date().toISOString() })
        .eq('id', notificacionId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
    },
    onError: (error: Error) => {
      console.error('Error marking notification as read:', error);
      toast.error('Error al marcar notificación como leída');
    },
  });
}

/**
 * Hook para marcar todas como leídas
 */
export function useMarcarTodasLeidas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const supabase = getSupabaseBrowserClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { error } = await supabase
        .from('notificaciones')
        .update({ leida: true, leida_en: new Date().toISOString() })
        .eq('usuario_id', user.id)
        .eq('leida', false);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
      toast.success('Todas las notificaciones marcadas como leídas');
    },
    onError: (error: Error) => {
      console.error('Error marking all as read:', error);
      toast.error('Error al marcar todas como leídas');
    },
  });
}

/**
 * Hook para obtener conteo de no leídas
 */
export function useNotificacionesNoLeidas() {
  const { data: notificaciones = [] } = useNotificaciones();
  return notificaciones.filter((n) => !n.leida).length;
}
