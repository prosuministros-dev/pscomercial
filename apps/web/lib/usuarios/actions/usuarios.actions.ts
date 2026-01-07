'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import {
  CreateUsuarioSchema,
  ToggleUsuarioEstadoSchema,
  UpdateUsuarioSchema,
} from '../schemas/usuario.schema';

/**
 * Crear un nuevo usuario
 * Crea el usuario en auth.users y en public.usuarios
 */
export const createUsuarioAction = enhanceAction(
  async (data) => {
    const adminClient = getSupabaseServerAdminClient();

    // 1. Crear usuario en auth.users
    const { data: authUser, error: authError } =
      await adminClient.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true, // Confirmar email automáticamente
        user_metadata: {
          name: data.nombre,
        },
      });

    if (authError) {
      throw new Error(`Error al crear usuario: ${authError.message}`);
    }

    if (!authUser.user) {
      throw new Error('No se pudo crear el usuario');
    }

    // 2. Crear registro en public.usuarios
    const { data: usuario, error: usuarioError } = await adminClient
      .from('usuarios')
      .insert({
        id: authUser.user.id,
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono || null,
        area: data.area || null,
        estado: data.estado || 'ACTIVO',
      })
      .select()
      .single();

    if (usuarioError) {
      // Si falla, intentar eliminar el auth user
      await adminClient.auth.admin.deleteUser(authUser.user.id);
      throw new Error(`Error al crear perfil: ${usuarioError.message}`);
    }

    revalidatePath('/home/admin');

    return { success: true, usuario };
  },
  {
    schema: CreateUsuarioSchema,
  }
);

/**
 * Actualizar usuario existente
 */
export const updateUsuarioAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { id, ...updateData } = data;

    const { data: usuario, error } = await client
      .from('usuarios')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }

    revalidatePath('/home/admin');

    return { success: true, usuario };
  },
  {
    schema: UpdateUsuarioSchema,
  }
);

/**
 * Cambiar estado de usuario (activar/desactivar)
 */
export const toggleUsuarioEstadoAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { data: usuario, error } = await client
      .from('usuarios')
      .update({ estado: data.estado })
      .eq('id', data.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al cambiar estado: ${error.message}`);
    }

    revalidatePath('/home/admin');
    revalidatePath('/home/configuracion/asesores');

    return { success: true, usuario };
  },
  {
    schema: ToggleUsuarioEstadoSchema,
  }
);
