'use client';

/**
 * Hooks React Query para WhatsApp - HU-0012
 * Incluye Supabase Realtime para actualización en vivo
 */

import { useCallback, useEffect } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';

import type {
  ConversacionesFilter,
  EnviarMensajeInput,
  EnviarTemplateInput,
  TemplatesFilter,
  WhatsAppConversacion,
  WhatsAppMensaje,
} from '../schemas/whatsapp.schema';

// Cliente Supabase para el browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ===========================================
// QUERY KEYS
// ===========================================

export const whatsappKeys = {
  all: ['whatsapp'] as const,
  conversaciones: () => [...whatsappKeys.all, 'conversaciones'] as const,
  conversacionesList: (filters?: ConversacionesFilter) =>
    [...whatsappKeys.conversaciones(), { filters }] as const,
  conversacion: (id: string) =>
    [...whatsappKeys.conversaciones(), id] as const,
  mensajes: (conversacionId: string) =>
    [...whatsappKeys.all, 'mensajes', conversacionId] as const,
  templates: () => [...whatsappKeys.all, 'templates'] as const,
  templatesList: (filters?: TemplatesFilter) =>
    [...whatsappKeys.templates(), { filters }] as const,
  asesorSync: (userId: string) =>
    [...whatsappKeys.all, 'sync', userId] as const,
  stats: () => [...whatsappKeys.all, 'stats'] as const,
};

// ===========================================
// CONVERSACIONES HOOKS
// ===========================================

export function useConversaciones(filters?: ConversacionesFilter) {
  return useQuery({
    queryKey: whatsappKeys.conversacionesList(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.estado) params.set('estado', filters.estado);
      if (filters?.asesor_id) params.set('asesor_id', filters.asesor_id);
      if (filters?.search) params.set('search', filters.search);
      if (filters?.tiene_mensajes_no_leidos)
        params.set('no_leidos', 'true');

      const response = await fetch(`/api/whatsapp/conversaciones?${params}`);
      if (!response.ok) throw new Error('Error fetching conversaciones');
      return response.json() as Promise<WhatsAppConversacion[]>;
    },
    staleTime: 30000, // 30 segundos
    refetchInterval: 60000, // Refetch cada minuto como fallback
  });
}

export function useConversacion(id: string | null) {
  return useQuery({
    queryKey: whatsappKeys.conversacion(id || ''),
    queryFn: async () => {
      if (!id) return null;
      const response = await fetch(`/api/whatsapp/conversaciones/${id}`);
      if (!response.ok) throw new Error('Error fetching conversacion');
      return response.json() as Promise<WhatsAppConversacion>;
    },
    enabled: !!id,
    staleTime: 10000,
  });
}

export function useMensajes(conversacionId: string | null) {
  return useQuery({
    queryKey: whatsappKeys.mensajes(conversacionId || ''),
    queryFn: async () => {
      if (!conversacionId) return [];
      const response = await fetch(
        `/api/whatsapp/conversaciones/${conversacionId}/mensajes`,
      );
      if (!response.ok) throw new Error('Error fetching mensajes');
      return response.json() as Promise<WhatsAppMensaje[]>;
    },
    enabled: !!conversacionId,
    staleTime: 5000,
  });
}

// ===========================================
// MUTATIONS
// ===========================================

export function useEnviarMensaje() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: EnviarMensajeInput) => {
      const response = await fetch('/api/whatsapp/mensajes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error('Error enviando mensaje');
      return response.json();
    },
    onSuccess: (_data, variables) => {
      // Invalidar queries relacionados
      queryClient.invalidateQueries({
        queryKey: whatsappKeys.mensajes(variables.conversacion_id),
      });
      queryClient.invalidateQueries({
        queryKey: whatsappKeys.conversaciones(),
      });
    },
    // Optimistic update
    onMutate: async (newMessage) => {
      await queryClient.cancelQueries({
        queryKey: whatsappKeys.mensajes(newMessage.conversacion_id),
      });

      const previousMensajes = queryClient.getQueryData<WhatsAppMensaje[]>(
        whatsappKeys.mensajes(newMessage.conversacion_id),
      );

      const optimisticMessage: WhatsAppMensaje = {
        id: `temp-${Date.now()}`,
        conversacion_id: newMessage.conversacion_id,
        direccion: 'SALIENTE',
        remitente: 'ASESOR',
        tipo: newMessage.tipo || 'TEXTO',
        contenido: newMessage.contenido,
        adjuntos: newMessage.adjuntos || [],
        leido: false,
        creado_en: new Date().toISOString(),
      };

      queryClient.setQueryData<WhatsAppMensaje[]>(
        whatsappKeys.mensajes(newMessage.conversacion_id),
        (old) => [...(old || []), optimisticMessage],
      );

      return { previousMensajes };
    },
    onError: (_err, variables, context) => {
      if (context?.previousMensajes) {
        queryClient.setQueryData(
          whatsappKeys.mensajes(variables.conversacion_id),
          context.previousMensajes,
        );
      }
    },
  });
}

export function useEnviarTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: EnviarTemplateInput) => {
      const response = await fetch('/api/whatsapp/templates/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error('Error enviando template');
      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: whatsappKeys.mensajes(variables.conversacion_id),
      });
      queryClient.invalidateQueries({
        queryKey: whatsappKeys.conversaciones(),
      });
    },
  });
}

export function useMarcarMensajesLeidos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversacionId: string) => {
      const response = await fetch(
        `/api/whatsapp/conversaciones/${conversacionId}/read`,
        { method: 'POST' },
      );
      if (!response.ok) throw new Error('Error marcando mensajes como leídos');
      return response.json();
    },
    onSuccess: (_data, conversacionId) => {
      queryClient.invalidateQueries({
        queryKey: whatsappKeys.conversacion(conversacionId),
      });
      queryClient.invalidateQueries({
        queryKey: whatsappKeys.conversaciones(),
      });
    },
  });
}

// ===========================================
// TEMPLATES HOOKS
// ===========================================

export function useTemplates(filters?: TemplatesFilter) {
  return useQuery({
    queryKey: whatsappKeys.templatesList(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.categoria) params.set('categoria', filters.categoria);
      if (filters?.activo !== undefined)
        params.set('activo', String(filters.activo));
      if (filters?.search) params.set('search', filters.search);

      const response = await fetch(`/api/whatsapp/templates?${params}`);
      if (!response.ok) throw new Error('Error fetching templates');
      return response.json();
    },
    staleTime: 60000, // 1 minuto
  });
}

// ===========================================
// SUPABASE REALTIME HOOK
// ===========================================

export function useWhatsAppRealtime() {
  const queryClient = useQueryClient();

  const handleNewMessage = useCallback(
    (payload: { new: WhatsAppMensaje }) => {
      const newMessage = payload.new;

      // Actualizar mensajes de la conversación
      queryClient.setQueryData<WhatsAppMensaje[]>(
        whatsappKeys.mensajes(newMessage.conversacion_id),
        (old) => {
          if (!old) return [newMessage];
          // Evitar duplicados
          if (old.some((m) => m.id === newMessage.id)) return old;
          return [...old, newMessage];
        },
      );

      // Invalidar lista de conversaciones para actualizar último mensaje
      queryClient.invalidateQueries({
        queryKey: whatsappKeys.conversaciones(),
      });
    },
    [queryClient],
  );

  const handleConversacionUpdate = useCallback(
    (payload: { new: WhatsAppConversacion }) => {
      const updatedConv = payload.new;

      // Actualizar conversación específica
      queryClient.setQueryData<WhatsAppConversacion>(
        whatsappKeys.conversacion(updatedConv.id),
        updatedConv,
      );

      // Invalidar lista
      queryClient.invalidateQueries({
        queryKey: whatsappKeys.conversaciones(),
      });
    },
    [queryClient],
  );

  useEffect(() => {
    const channel = supabase
      .channel('whatsapp-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'whatsapp_mensajes',
        },
        handleNewMessage,
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'whatsapp_conversaciones',
        },
        handleConversacionUpdate,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [handleNewMessage, handleConversacionUpdate]);
}

// ===========================================
// TYPING INDICATOR HOOK
// ===========================================

export function useTypingIndicator(conversacionId: string | null) {
  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!conversacionId) return;

      supabase.channel(`typing-${conversacionId}`).send({
        type: 'broadcast',
        event: 'typing',
        payload: { isTyping },
      });
    },
    [conversacionId],
  );

  useEffect(() => {
    if (!conversacionId) return;

    const channel = supabase
      .channel(`typing-${conversacionId}`)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversacionId]);

  return { sendTyping };
}
