'use client';

import { useQuery } from '@tanstack/react-query';
import {
  buscarUsuariosParaMenciones,
  getUsuarioById,
  getUsuariosByIds,
  getUsuariosOrganizacion,
} from '../actions/usuarios.actions';

/**
 * Hook para buscar usuarios para menciones @usuario
 * HU-0009: Autocompletado con dropdown
 */
export function useBuscarUsuarios(query: string, enabled = true) {
  return useQuery({
    queryKey: ['usuarios-buscar', query],
    queryFn: () => buscarUsuariosParaMenciones(query, 5),
    enabled: enabled && query.length > 0, // Solo buscar si hay query
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para obtener un usuario por ID
 */
export function useUsuario(userId: string | undefined) {
  return useQuery({
    queryKey: ['usuario', userId],
    queryFn: () => getUsuarioById(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}

/**
 * Hook para obtener múltiples usuarios por IDs
 * Útil para resolver arrays de menciones
 */
export function useUsuarios(userIds: string[]) {
  return useQuery({
    queryKey: ['usuarios', userIds],
    queryFn: () => getUsuariosByIds(userIds),
    enabled: userIds.length > 0,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}

/**
 * Hook para obtener todos los usuarios de la organización
 */
export function useUsuariosOrganizacion() {
  return useQuery({
    queryKey: ['usuarios-organizacion'],
    queryFn: getUsuariosOrganizacion,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
