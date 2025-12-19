'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import {
  AddObservacionSchema,
  AssignLeadSchema,
  ConvertLeadSchema,
  CreateLeadSchema,
  RejectLeadSchema,
  UpdateLeadSchema,
} from '../schemas/lead.schema';

/**
 * Crear un nuevo lead
 */
export const createLeadAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { data: lead, error } = await client
      .from('leads')
      .insert({
        razon_social: data.razon_social,
        nit: data.nit,
        nombre_contacto: data.nombre_contacto,
        celular_contacto: data.celular_contacto,
        email_contacto: data.email_contacto,
        requerimiento: data.requerimiento,
        canal_origen: data.canal_origen,
        fecha_lead: data.fecha_lead || new Date().toISOString(),
        creado_por: user.sub,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear lead: ${error.message}`);
    }

    revalidatePath('/home/leads');

    return { success: true, lead };
  },
  {
    schema: CreateLeadSchema,
  }
);

/**
 * Actualizar un lead existente
 */
export const updateLeadAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { id, ...updateData } = data;

    const { data: lead, error } = await client
      .from('leads')
      .update({
        ...updateData,
        modificado_por: user.sub,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar lead: ${error.message}`);
    }

    revalidatePath('/home/leads');

    return { success: true, lead };
  },
  {
    schema: UpdateLeadSchema,
  }
);

/**
 * Asignar un lead a un asesor (reasignación manual)
 */
export const assignLeadAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { data: lead, error } = await client
      .from('leads')
      .update({
        asesor_asignado_id: data.asesor_id,
        asignado_en: new Date().toISOString(),
        asignado_por: user.sub,
        estado: 'ASIGNADO',
        modificado_por: user.sub,
      })
      .eq('id', data.lead_id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al asignar lead: ${error.message}`);
    }

    revalidatePath('/home/leads');

    return { success: true, lead };
  },
  {
    schema: AssignLeadSchema,
  }
);

/**
 * Rechazar un lead
 */
export const rejectLeadAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { data: lead, error } = await client
      .from('leads')
      .update({
        estado: 'RECHAZADO',
        motivo_rechazo: data.motivo_rechazo,
        modificado_por: user.sub,
      })
      .eq('id', data.lead_id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al rechazar lead: ${error.message}`);
    }

    revalidatePath('/home/leads');

    return { success: true, lead };
  },
  {
    schema: RejectLeadSchema,
  }
);

/**
 * Convertir un lead (marcar como convertido)
 */
export const convertLeadAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { data: lead, error } = await client
      .from('leads')
      .update({
        estado: 'CONVERTIDO',
        convertido_en: new Date().toISOString(),
        modificado_por: user.sub,
      })
      .eq('id', data.lead_id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al convertir lead: ${error.message}`);
    }

    revalidatePath('/home/leads');

    return { success: true, lead };
  },
  {
    schema: ConvertLeadSchema,
  }
);

/**
 * Agregar observación a un lead
 */
export const addObservacionAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { data: observacion, error } = await client
      .from('lead_observaciones')
      .insert({
        lead_id: data.lead_id,
        usuario_id: user.sub,
        texto: data.texto,
        menciones: data.menciones || [],
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al agregar observación: ${error.message}`);
    }

    revalidatePath('/home/leads');

    return { success: true, observacion };
  },
  {
    schema: AddObservacionSchema,
  }
);
