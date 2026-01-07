'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string | null;
  estado?: 'activo' | 'inactivo';
  creado_en?: string;
}

export interface Permiso {
  id: string;
  modulo: string;
  accion: string;
  descripcion: string | null;
}

export interface RolConPermisos extends Rol {
  permisos: Permiso[];
}

/**
 * Hook para obtener todos los roles con sus permisos
 */
export function useRoles() {
  const client = useSupabase();

  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await client
        .from('roles')
        .select(`
          id,
          nombre,
          descripcion,
          creado_en,
          permisos:rol_permisos(
            permiso:permisos(id, modulo, accion, descripcion)
          )
        `)
        .order('nombre');

      if (error) throw error;

      // Transformar la estructura para facilitar el uso
      return data.map((rol: any) => ({
        ...rol,
        estado: 'activo' as const,
        permisos: rol.permisos?.map((rp: any) => rp.permiso).filter(Boolean) || [],
      })) as RolConPermisos[];
    },
  });
}

/**
 * Hook para obtener todos los permisos disponibles
 */
export function usePermisos() {
  const client = useSupabase();

  return useQuery({
    queryKey: ['permisos'],
    queryFn: async () => {
      const { data, error } = await client
        .from('permisos')
        .select('id, modulo, accion, descripcion')
        .order('modulo')
        .order('accion');

      if (error) throw error;
      return data as Permiso[];
    },
  });
}

/**
 * Hook para crear un nuevo rol
 */
export function useCrearRol() {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nombre, descripcion, permisoIds }: {
      nombre: string;
      descripcion: string;
      permisoIds: string[]
    }) => {
      // Crear el rol
      const { data: rol, error: rolError } = await client
        .from('roles')
        .insert({ nombre, descripcion })
        .select()
        .single();

      if (rolError) throw rolError;

      // Asignar permisos al rol
      if (permisoIds.length > 0) {
        const { error: permisosError } = await client
          .from('rol_permisos')
          .insert(permisoIds.map(permisoId => ({
            rol_id: rol.id,
            permiso_id: permisoId,
          })));

        if (permisosError) throw permisosError;
      }

      return rol;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

/**
 * Hook para actualizar un rol
 */
export function useActualizarRol() {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, nombre, descripcion, permisoIds }: {
      id: string;
      nombre: string;
      descripcion: string;
      permisoIds: string[]
    }) => {
      // Actualizar el rol
      const { error: rolError } = await client
        .from('roles')
        .update({ nombre, descripcion })
        .eq('id', id);

      if (rolError) throw rolError;

      // Eliminar permisos existentes
      const { error: deleteError } = await client
        .from('rol_permisos')
        .delete()
        .eq('rol_id', id);

      if (deleteError) throw deleteError;

      // Asignar nuevos permisos
      if (permisoIds.length > 0) {
        const { error: permisosError } = await client
          .from('rol_permisos')
          .insert(permisoIds.map(permisoId => ({
            rol_id: id,
            permiso_id: permisoId,
          })));

        if (permisosError) throw permisosError;
      }

      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

/**
 * Hook para eliminar un rol
 */
export function useEliminarRol() {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Primero eliminar los permisos del rol
      await client
        .from('rol_permisos')
        .delete()
        .eq('rol_id', id);

      // Luego eliminar el rol
      const { error } = await client
        .from('roles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}
