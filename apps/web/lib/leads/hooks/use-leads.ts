'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';

import {
  addObservacionAction,
  assignLeadAction,
  convertLeadAction,
  createLeadAction,
  rejectLeadAction,
  updateLeadAction,
} from '../actions/leads.actions';
import { createLeadsApi } from '../queries/leads.api';
import type {
  AddObservacionInput,
  AssignLeadInput,
  ConvertLeadInput,
  CreateLeadInput,
  LeadFilters,
  RejectLeadInput,
  UpdateLeadInput,
} from '../schemas/lead.schema';

// Query Keys
export const leadsKeys = {
  all: ['leads'] as const,
  lists: () => [...leadsKeys.all, 'list'] as const,
  list: (filters?: LeadFilters) => [...leadsKeys.lists(), filters] as const,
  details: () => [...leadsKeys.all, 'detail'] as const,
  detail: (id: string) => [...leadsKeys.details(), id] as const,
  stats: () => [...leadsKeys.all, 'stats'] as const,
  observaciones: (leadId: string) => [...leadsKeys.all, 'observaciones', leadId] as const,
  asignaciones: (leadId: string) => [...leadsKeys.all, 'asignaciones', leadId] as const,
  asesores: () => [...leadsKeys.all, 'asesores'] as const,
};

/**
 * Hook para obtener lista de leads con filtros
 */
export function useLeads(filters?: LeadFilters) {
  const client = useSupabase();
  const api = createLeadsApi(client);

  return useQuery({
    queryKey: leadsKeys.list(filters),
    queryFn: () => api.getLeads(filters),
  });
}

/**
 * Hook para obtener un lead por ID
 */
export function useLead(id: string) {
  const client = useSupabase();
  const api = createLeadsApi(client);

  return useQuery({
    queryKey: leadsKeys.detail(id),
    queryFn: () => api.getLeadById(id),
    enabled: !!id,
  });
}

/**
 * Hook para obtener estadísticas de leads
 */
export function useLeadStats() {
  const client = useSupabase();
  const api = createLeadsApi(client);

  return useQuery({
    queryKey: leadsKeys.stats(),
    queryFn: () => api.getLeadStats(),
  });
}

/**
 * Hook para obtener observaciones de un lead
 */
export function useLeadObservaciones(leadId: string) {
  const client = useSupabase();
  const api = createLeadsApi(client);

  return useQuery({
    queryKey: leadsKeys.observaciones(leadId),
    queryFn: () => api.getLeadObservaciones(leadId),
    enabled: !!leadId,
  });
}

/**
 * Hook para obtener historial de asignaciones
 */
export function useLeadAsignaciones(leadId: string) {
  const client = useSupabase();
  const api = createLeadsApi(client);

  return useQuery({
    queryKey: leadsKeys.asignaciones(leadId),
    queryFn: () => api.getLeadAsignaciones(leadId),
    enabled: !!leadId,
  });
}

/**
 * Hook para crear un lead
 */
export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeadInput) => createLeadAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadsKeys.all });
    },
  });
}

/**
 * Hook para actualizar un lead
 */
export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateLeadInput) => updateLeadAction(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leadsKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: leadsKeys.lists() });
    },
  });
}

/**
 * Hook para asignar un lead
 */
export function useAssignLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignLeadInput) => assignLeadAction(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leadsKeys.detail(variables.lead_id) });
      queryClient.invalidateQueries({ queryKey: leadsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadsKeys.stats() });
    },
  });
}

/**
 * Hook para rechazar un lead
 */
export function useRejectLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RejectLeadInput) => rejectLeadAction(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leadsKeys.detail(variables.lead_id) });
      queryClient.invalidateQueries({ queryKey: leadsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadsKeys.stats() });
    },
  });
}

/**
 * Hook para convertir un lead
 */
export function useConvertLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConvertLeadInput) => convertLeadAction(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leadsKeys.detail(variables.lead_id) });
      queryClient.invalidateQueries({ queryKey: leadsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadsKeys.stats() });
    },
  });
}

/**
 * Hook para agregar observación
 */
export function useAddObservacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddObservacionInput) => addObservacionAction(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leadsKeys.observaciones(variables.lead_id) });
    },
  });
}

/**
 * Hook para verificar duplicados
 */
export function useCheckDuplicates() {
  const client = useSupabase();
  const api = createLeadsApi(client);

  return {
    checkNit: (nit: string, excludeId?: string) => api.checkDuplicateNit(nit, excludeId),
    checkEmail: (email: string, excludeId?: string) => api.checkDuplicateEmail(email, excludeId),
  };
}

/**
 * Hook para obtener asesores disponibles
 */
export function useAsesoresDisponibles() {
  const client = useSupabase();
  const api = createLeadsApi(client);

  return useQuery({
    queryKey: leadsKeys.asesores(),
    queryFn: () => api.getAsesoresDisponibles(),
  });
}
