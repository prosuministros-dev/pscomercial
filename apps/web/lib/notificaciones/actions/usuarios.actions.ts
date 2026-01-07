'use server';

import { getSupabaseServerClient } from '@/lib/supabase/server';
import {
  buscarUsuariosSchema,
  type BuscarUsuariosInput,
  usuarioMencionSchema,
  type UsuarioMencion,
} from '../schemas/notificaciones.schema';

/**
 * Query para buscar usuarios por nombre/email para menciones @usuario
 * HU-0009: Autocompletado de menciones con dropdown
 * @param query - Término de búsqueda
 * @param limit - Límite de resultados (default 5, max 10)
 * @returns Lista de usuarios que coinciden con la búsqueda
 */
export async function buscarUsuariosParaMenciones(
  query: string,
  limit = 5
): Promise<UsuarioMencion[]> {
  const supabase = await getSupabaseServerClient();

  // Obtener organization_id del usuario autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  const { data: userOrg, error: userError } = await supabase
    .from('usuario_organizaciones')
    .select('organization_id')
    .eq('user_id', user.id)
    .single();

  if (userError || !userOrg) {
    throw new Error('Usuario no pertenece a ninguna organización');
  }

  // Validar input
  const validatedInput: BuscarUsuariosInput = buscarUsuariosSchema.parse({
    query,
    organization_id: userOrg.organization_id,
    limit: Math.min(limit, 10),
  });

  // Buscar usuarios en la misma organización
  // Buscar por nombre o email que contenga el query (case-insensitive)
  const { data: usuariosOrg, error: orgError } = await supabase
    .from('usuario_organizaciones')
    .select('user_id')
    .eq('organization_id', validatedInput.organization_id);

  if (orgError || !usuariosOrg) {
    console.error('Error obteniendo usuarios de la organización:', orgError);
    return [];
  }

  const userIds = usuariosOrg.map((uo) => uo.user_id);

  if (userIds.length === 0) {
    return [];
  }

  // Buscar usuarios que coincidan con el query
  const { data: usuarios, error: usersError } = await supabase
    .from('usuarios')
    .select('id, name, email, picture_url')
    .in('id', userIds)
    .or(`name.ilike.%${validatedInput.query}%,email.ilike.%${validatedInput.query}%`)
    .limit(validatedInput.limit);

  if (usersError) {
    console.error('Error buscando usuarios:', usersError);
    return [];
  }

  return usuarios.map((u) => usuarioMencionSchema.parse(u));
}

/**
 * Query para obtener información de un usuario por ID
 * Útil para mostrar detalles de usuarios mencionados
 * @param userId - ID del usuario
 * @returns Datos del usuario
 */
export async function getUsuarioById(userId: string): Promise<UsuarioMencion | null> {
  const supabase = await getSupabaseServerClient();

  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('id, name, email, picture_url')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error obteniendo usuario:', error);
    return null;
  }

  return usuarioMencionSchema.parse(usuario);
}

/**
 * Query para obtener múltiples usuarios por sus IDs
 * Útil para resolver arrays de menciones
 * @param userIds - Array de IDs de usuarios
 * @returns Lista de usuarios
 */
export async function getUsuariosByIds(userIds: string[]): Promise<UsuarioMencion[]> {
  if (userIds.length === 0) {
    return [];
  }

  const supabase = await getSupabaseServerClient();

  const { data: usuarios, error } = await supabase
    .from('usuarios')
    .select('id, name, email, picture_url')
    .in('id', userIds);

  if (error) {
    console.error('Error obteniendo usuarios:', error);
    return [];
  }

  return usuarios.map((u) => usuarioMencionSchema.parse(u));
}

/**
 * Query para obtener todos los usuarios de la organización del usuario autenticado
 * Útil para mostrar lista completa en configuración de seguimiento
 * @returns Lista de usuarios de la organización
 */
export async function getUsuariosOrganizacion(): Promise<UsuarioMencion[]> {
  const supabase = await getSupabaseServerClient();

  // Obtener organization_id del usuario autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  const { data: userOrg, error: userError } = await supabase
    .from('usuario_organizaciones')
    .select('organization_id')
    .eq('user_id', user.id)
    .single();

  if (userError || !userOrg) {
    throw new Error('Usuario no pertenece a ninguna organización');
  }

  // Obtener usuarios de la organización
  const { data: usuariosOrg, error: orgError } = await supabase
    .from('usuario_organizaciones')
    .select('user_id')
    .eq('organization_id', userOrg.organization_id);

  if (orgError || !usuariosOrg) {
    console.error('Error obteniendo usuarios de la organización:', orgError);
    return [];
  }

  const userIds = usuariosOrg.map((uo) => uo.user_id);

  if (userIds.length === 0) {
    return [];
  }

  const { data: usuarios, error: usersError } = await supabase
    .from('usuarios')
    .select('id, name, email, picture_url')
    .in('id', userIds)
    .order('name', { ascending: true });

  if (usersError) {
    console.error('Error obteniendo usuarios:', usersError);
    return [];
  }

  return usuarios.map((u) => usuarioMencionSchema.parse(u));
}
