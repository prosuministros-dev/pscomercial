'use client';

import { useQuery } from '@tanstack/react-query';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { useUser } from '@kit/supabase/hooks/use-user';

// Tipos de permisos
export type PermisoAccion = 'CREAR' | 'EDITAR' | 'VER' | 'ELIMINAR' | 'APROBAR' | 'EXPORTAR';

export type PermisoModulo =
  | 'leads'
  | 'cotizaciones'
  | 'pedidos'
  | 'clientes'
  | 'productos'
  | 'usuarios'
  | 'asesores'
  | 'reportes'
  | 'configuracion';

interface Permiso {
  modulo: string;
  accion: PermisoAccion;
}

interface UserPermissionsResult {
  permisos: Permiso[];
  roles: string[];
  isLoading: boolean;
  error: Error | null;
  tienePermiso: (modulo: PermisoModulo, accion: PermisoAccion) => boolean;
  tieneAlgunPermiso: (modulo: PermisoModulo) => boolean;
  esGerencia: boolean;
  esAdmin: boolean;
}

/**
 * Hook para obtener y verificar permisos del usuario actual
 */
export function useUserPermissions(): UserPermissionsResult {
  const client = useSupabase();
  const { data: user } = useUser();
  const userId = user?.id;

  const { data, isLoading, error } = useQuery({
    queryKey: ['user-permissions', userId],
    queryFn: async () => {
      if (!userId) return { permisos: [], roles: [] };

      // Obtener roles del usuario
      const { data: userRoles, error: rolesError } = await client
        .from('usuario_roles')
        .select(`
          rol:roles(
            id,
            nombre,
            permisos:rol_permisos(
              permiso:permisos(modulo, accion)
            )
          )
        `)
        .eq('usuario_id', userId);

      if (rolesError) {
        throw new Error(`Error al obtener permisos: ${rolesError.message}`);
      }

      // Extraer roles y permisos
      const roles: string[] = [];
      const permisosMap = new Map<string, Permiso>();

      userRoles?.forEach((ur: any) => {
        if (ur.rol) {
          roles.push(ur.rol.nombre);
          ur.rol.permisos?.forEach((rp: any) => {
            if (rp.permiso) {
              const key = `${rp.permiso.modulo}:${rp.permiso.accion}`;
              permisosMap.set(key, {
                modulo: rp.permiso.modulo,
                accion: rp.permiso.accion,
              });
            }
          });
        }
      });

      return {
        permisos: Array.from(permisosMap.values()),
        roles,
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const permisos = data?.permisos || [];
  const roles = data?.roles || [];

  // Verificar si tiene un permiso específico
  const tienePermiso = (modulo: PermisoModulo, accion: PermisoAccion): boolean => {
    return permisos.some((p) => p.modulo === modulo && p.accion === accion);
  };

  // Verificar si tiene algún permiso en un módulo
  const tieneAlgunPermiso = (modulo: PermisoModulo): boolean => {
    return permisos.some((p) => p.modulo === modulo);
  };

  // Helpers para roles comunes
  const esGerencia = roles.some((r) =>
    r === 'GERENCIA_GENERAL' || r === 'GERENCIA_COMERCIAL'
  );

  const esAdmin = roles.includes('GERENCIA_GENERAL');

  return {
    permisos,
    roles,
    isLoading,
    error: error as Error | null,
    tienePermiso,
    tieneAlgunPermiso,
    esGerencia,
    esAdmin,
  };
}
