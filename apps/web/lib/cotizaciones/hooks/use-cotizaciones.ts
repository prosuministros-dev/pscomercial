'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';

import {
  addCotizacionItemAction,
  cambiarEstadoCotizacionAction,
  createCotizacionAction,
  createCotizacionFromLeadAction,
  deleteCotizacionItemAction,
  duplicarCotizacionAction,
  reorderItemsAction,
  updateCotizacionAction,
  updateCotizacionItemAction,
} from '../actions/cotizaciones.actions';
import { createCotizacionesApi } from '../queries/cotizaciones.api';
import type {
  AddCotizacionItemInput,
  CambiarEstadoCotizacionInput,
  CotizacionFilters,
  CreateCotizacionFromLeadInput,
  CreateCotizacionInput,
  DeleteCotizacionItemInput,
  DuplicarCotizacionInput,
  ReorderItemsInput,
  UpdateCotizacionInput,
  UpdateCotizacionItemInput,
} from '../schemas/cotizacion.schema';

// Query Keys
export const cotizacionesKeys = {
  all: ['cotizaciones'] as const,
  lists: () => [...cotizacionesKeys.all, 'list'] as const,
  list: (filters?: CotizacionFilters) => [...cotizacionesKeys.lists(), filters] as const,
  details: () => [...cotizacionesKeys.all, 'detail'] as const,
  detail: (id: string) => [...cotizacionesKeys.details(), id] as const,
  items: (cotizacionId: string) => [...cotizacionesKeys.all, 'items', cotizacionId] as const,
  historial: (cotizacionId: string) => [...cotizacionesKeys.all, 'historial', cotizacionId] as const,
  stats: () => [...cotizacionesKeys.all, 'stats'] as const,
  trm: () => [...cotizacionesKeys.all, 'trm'] as const,
  productos: () => ['productos'] as const,
  verticales: () => ['verticales'] as const,
  marcas: () => ['marcas'] as const,
  proveedores: () => ['proveedores'] as const,
};

/**
 * Hook para obtener lista de cotizaciones
 */
export function useCotizaciones(filters?: CotizacionFilters) {
  const client = useSupabase();
  const api = createCotizacionesApi(client);

  return useQuery({
    queryKey: cotizacionesKeys.list(filters),
    queryFn: () => api.getCotizaciones(filters),
  });
}

/**
 * Hook para obtener una cotización por ID
 */
export function useCotizacion(id: string) {
  const client = useSupabase();
  const api = createCotizacionesApi(client);

  return useQuery({
    queryKey: cotizacionesKeys.detail(id),
    queryFn: () => api.getCotizacionById(id),
    enabled: !!id,
  });
}

/**
 * Hook para obtener items de una cotización
 */
export function useCotizacionItems(cotizacionId: string) {
  const client = useSupabase();
  const api = createCotizacionesApi(client);

  return useQuery({
    queryKey: cotizacionesKeys.items(cotizacionId),
    queryFn: () => api.getCotizacionItems(cotizacionId),
    enabled: !!cotizacionId,
  });
}

/**
 * Hook para obtener estadísticas
 */
export function useCotizacionStats() {
  const client = useSupabase();
  const api = createCotizacionesApi(client);

  return useQuery({
    queryKey: cotizacionesKeys.stats(),
    queryFn: () => api.getCotizacionStats(),
  });
}

/**
 * Hook para obtener TRM actual
 */
export function useTrmActual() {
  const client = useSupabase();
  const api = createCotizacionesApi(client);

  return useQuery({
    queryKey: cotizacionesKeys.trm(),
    queryFn: () => api.getTrmActual(),
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}

/**
 * Hook para buscar productos
 */
export function useBuscarProductos(busqueda: string) {
  const client = useSupabase();
  const api = createCotizacionesApi(client);

  return useQuery({
    queryKey: [...cotizacionesKeys.productos(), busqueda],
    queryFn: () => api.buscarProductos(busqueda),
    enabled: busqueda.length >= 2,
  });
}

/**
 * Hook para obtener verticales
 */
export function useVerticales() {
  const client = useSupabase();
  const api = createCotizacionesApi(client);

  return useQuery({
    queryKey: cotizacionesKeys.verticales(),
    queryFn: () => api.getVerticales(),
  });
}

/**
 * Hook para obtener marcas
 */
export function useMarcas() {
  const client = useSupabase();
  const api = createCotizacionesApi(client);

  return useQuery({
    queryKey: cotizacionesKeys.marcas(),
    queryFn: () => api.getMarcas(),
  });
}

/**
 * Hook para obtener proveedores
 */
export function useProveedores() {
  const client = useSupabase();
  const api = createCotizacionesApi(client);

  return useQuery({
    queryKey: cotizacionesKeys.proveedores(),
    queryFn: () => api.getProveedores(),
  });
}

/**
 * Hook para crear cotización desde lead
 */
export function useCreateCotizacionFromLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCotizacionFromLeadInput) => createCotizacionFromLeadAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cotizacionesKeys.all });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

/**
 * Hook para crear cotización manualmente
 */
export function useCreateCotizacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCotizacionInput) => createCotizacionAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cotizacionesKeys.all });
    },
  });
}

/**
 * Hook para actualizar cotización
 */
export function useUpdateCotizacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCotizacionInput) => updateCotizacionAction(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: cotizacionesKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: cotizacionesKeys.lists() });
    },
  });
}

/**
 * Hook para cambiar estado de cotización
 */
export function useCambiarEstadoCotizacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CambiarEstadoCotizacionInput) => cambiarEstadoCotizacionAction(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: cotizacionesKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: cotizacionesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: cotizacionesKeys.stats() });
    },
  });
}

/**
 * Hook para agregar item
 */
export function useAddCotizacionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddCotizacionItemInput) => addCotizacionItemAction(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: cotizacionesKeys.detail(variables.cotizacion_id) });
      queryClient.invalidateQueries({ queryKey: cotizacionesKeys.items(variables.cotizacion_id) });
    },
  });
}

/**
 * Hook para actualizar item
 */
export function useUpdateCotizacionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCotizacionItemInput) => updateCotizacionItemAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cotizacionesKeys.all });
    },
  });
}

/**
 * Hook para eliminar item
 */
export function useDeleteCotizacionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeleteCotizacionItemInput) => deleteCotizacionItemAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cotizacionesKeys.all });
    },
  });
}

/**
 * Hook para reordenar items
 */
export function useReorderItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReorderItemsInput) => reorderItemsAction(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: cotizacionesKeys.items(variables.cotizacion_id) });
    },
  });
}

/**
 * Hook para duplicar cotización
 */
export function useDuplicarCotizacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DuplicarCotizacionInput) => duplicarCotizacionAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cotizacionesKeys.all });
    },
  });
}
