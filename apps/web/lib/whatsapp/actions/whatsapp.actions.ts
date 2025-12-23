'use server';

/**
 * Server Actions para WhatsApp - HU-0012
 */

import { revalidatePath } from 'next/cache';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import {
  actualizarConversacionSchema,
  crearConversacionSchema,
  crearLeadDesdeConversacionSchema,
  embeddedSignupSchema,
  enviarMensajeSchema,
  enviarTemplateSchema,
  type ActualizarConversacionInput,
  type CrearConversacionInput,
  type CrearLeadDesdeConversacionInput,
  type EmbeddedSignupInput,
  type EnviarMensajeInput,
  type EnviarTemplateInput,
} from '../schemas/whatsapp.schema';
import { getTemplateByCodigo } from '../queries/whatsapp.api';

// ===========================================
// CONVERSACIONES
// ===========================================

export async function crearConversacion(input: CrearConversacionInput) {
  const validated = crearConversacionSchema.parse(input);
  const client = getSupabaseServerClient();

  // Verificar si ya existe una conversación activa con este teléfono
  const { data: existente } = await client
    .from('whatsapp_conversaciones')
    .select('id')
    .eq('telefono_cliente', validated.telefono_cliente)
    .eq('estado', 'ACTIVA')
    .single();

  if (existente) {
    return { success: true, data: existente, isExisting: true };
  }

  const { data, error } = await client
    .from('whatsapp_conversaciones')
    .insert({
      telefono_cliente: validated.telefono_cliente,
      nombre_contacto: validated.nombre_contacto,
      estado: 'ACTIVA',
      estado_bot: 'INICIO',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating conversacion:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/home/whatsapp');
  return { success: true, data, isExisting: false };
}

export async function actualizarConversacion(
  input: ActualizarConversacionInput,
) {
  const validated = actualizarConversacionSchema.parse(input);
  const client = getSupabaseServerClient();

  const updateData: Record<string, unknown> = {};

  if (validated.estado) {
    updateData.estado = validated.estado;
    if (validated.estado === 'CERRADA') {
      updateData.cerrado_en = new Date().toISOString();
    }
  }

  if (validated.asesor_asignado_id !== undefined) {
    updateData.asesor_asignado_id = validated.asesor_asignado_id;
    if (validated.asesor_asignado_id) {
      updateData.asignado_en = new Date().toISOString();
    }
  }

  if (validated.nombre_contacto) {
    updateData.nombre_contacto = validated.nombre_contacto;
  }

  if (validated.identificacion) {
    updateData.identificacion = validated.identificacion;
  }

  const { data, error } = await client
    .from('whatsapp_conversaciones')
    .update(updateData)
    .eq('id', validated.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating conversacion:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/home/whatsapp');
  return { success: true, data };
}

export async function marcarMensajesLeidos(conversacionId: string) {
  const client = getSupabaseServerClient();

  // Marcar mensajes como leídos
  await client
    .from('whatsapp_mensajes')
    .update({ leido: true, leido_en: new Date().toISOString() })
    .eq('conversacion_id', conversacionId)
    .eq('direccion', 'ENTRANTE')
    .eq('leido', false);

  // Resetear contador
  await client
    .from('whatsapp_conversaciones')
    .update({ mensajes_no_leidos: 0 })
    .eq('id', conversacionId);

  revalidatePath('/home/whatsapp');
  return { success: true };
}

// ===========================================
// MENSAJES
// ===========================================

export async function enviarMensaje(input: EnviarMensajeInput) {
  const validated = enviarMensajeSchema.parse(input);
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('whatsapp_mensajes')
    .insert({
      conversacion_id: validated.conversacion_id,
      direccion: 'SALIENTE',
      remitente: 'ASESOR',
      tipo: validated.tipo,
      contenido: validated.contenido,
      adjuntos: validated.adjuntos,
    })
    .select()
    .single();

  if (error) {
    console.error('Error sending mensaje:', error);
    return { success: false, error: error.message };
  }

  // TODO: Integración con Meta API para enviar mensaje real
  // await sendWhatsAppMessage(conversacion.telefono_cliente, validated.contenido);

  revalidatePath('/home/whatsapp');
  return { success: true, data };
}

export async function enviarTemplate(input: EnviarTemplateInput) {
  const validated = enviarTemplateSchema.parse(input);
  const client = getSupabaseServerClient();

  // Obtener template
  const template = await getTemplateByCodigo(validated.template_codigo);
  if (!template) {
    return { success: false, error: 'Template no encontrado' };
  }

  // Reemplazar variables
  let contenido = template.contenido;
  for (const [key, value] of Object.entries(validated.variables)) {
    contenido = contenido.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }

  const { data, error } = await client
    .from('whatsapp_mensajes')
    .insert({
      conversacion_id: validated.conversacion_id,
      direccion: 'SALIENTE',
      remitente: 'BOT',
      tipo: 'TEMPLATE',
      contenido,
    })
    .select()
    .single();

  if (error) {
    console.error('Error sending template:', error);
    return { success: false, error: error.message };
  }

  // TODO: Integración con Meta API para enviar template real
  // await sendWhatsAppTemplate(conversacion.telefono_cliente, template.codigo, validated.variables);

  revalidatePath('/home/whatsapp');
  return { success: true, data };
}

// ===========================================
// CREAR LEAD DESDE CONVERSACIÓN
// ===========================================

export async function crearLeadDesdeConversacion(
  input: CrearLeadDesdeConversacionInput,
) {
  const validated = crearLeadDesdeConversacionSchema.parse(input);
  const client = getSupabaseServerClient();

  // Obtener usuario actual
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  // Crear lead
  const { data: lead, error: leadError } = await client
    .from('leads')
    .insert({
      razon_social: validated.razon_social,
      nit: validated.nit,
      nombre_contacto: validated.nombre_contacto,
      celular_contacto: validated.celular_contacto,
      email_contacto: validated.email_contacto,
      requerimiento: validated.requerimiento,
      canal_origen: 'WHATSAPP',
      estado: 'PENDIENTE_ASIGNACION',
      creado_por: user.id,
    })
    .select()
    .single();

  if (leadError) {
    console.error('Error creating lead:', leadError);
    return { success: false, error: leadError.message };
  }

  // Vincular lead a conversación
  await client
    .from('whatsapp_conversaciones')
    .update({ lead_id: lead.id })
    .eq('id', validated.conversacion_id);

  // Enviar mensaje de confirmación
  await enviarTemplate({
    conversacion_id: validated.conversacion_id,
    template_codigo: 'TPL_I_CONFIRMACION',
    variables: { numero_caso: String(lead.numero) },
  });

  revalidatePath('/home/whatsapp');
  revalidatePath('/home/leads');
  return { success: true, data: lead };
}

// ===========================================
// EMBEDDED SIGN-UP
// ===========================================

export async function completarEmbeddedSignup(input: EmbeddedSignupInput) {
  const validated = embeddedSignupSchema.parse(input);
  const client = getSupabaseServerClient();

  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  // Verificar si ya existe vinculación
  const { data: existing } = await client
    .from('whatsapp_asesor_sync')
    .select('id')
    .eq('usuario_id', user.id)
    .single();

  const syncData = {
    usuario_id: user.id,
    waba_id: validated.waba_id,
    phone_number_id: validated.phone_number_id,
    display_phone_number: validated.display_phone_number,
    waba_name: validated.waba_name,
    token_acceso: validated.access_token, // TODO: Encriptar antes de guardar
    estado: 'ACTIVO' as const,
    vinculado_en: new Date().toISOString(),
  };

  let result;
  if (existing) {
    result = await client
      .from('whatsapp_asesor_sync')
      .update(syncData)
      .eq('id', existing.id)
      .select()
      .single();
  } else {
    result = await client
      .from('whatsapp_asesor_sync')
      .insert(syncData)
      .select()
      .single();
  }

  if (result.error) {
    console.error('Error en embedded signup:', result.error);
    return { success: false, error: result.error.message };
  }

  revalidatePath('/home/settings/whatsapp');
  return { success: true, data: result.data };
}

export async function desvincularWhatsApp() {
  const client = getSupabaseServerClient();

  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const { error } = await client
    .from('whatsapp_asesor_sync')
    .update({
      estado: 'DESVINCULADO',
      token_acceso: null,
      desvinculado_en: new Date().toISOString(),
    })
    .eq('usuario_id', user.id);

  if (error) {
    console.error('Error desvinculando WhatsApp:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/home/settings/whatsapp');
  return { success: true };
}

// ===========================================
// NOTIFICACIONES
// ===========================================

export async function crearNotificacionComercial(
  comercialId: string,
  tipo: string,
  titulo: string,
  mensaje: string,
  referenciaId?: string,
  referenciaTipo?: string,
) {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('notificaciones')
    .insert({
      usuario_id: comercialId,
      tipo,
      titulo,
      mensaje,
      referencia_id: referenciaId,
      referencia_tipo: referenciaTipo,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function marcarNotificacionLeida(notificacionId: string) {
  const client = getSupabaseServerClient();

  const { error } = await client
    .from('notificaciones')
    .update({ leida: true, leida_en: new Date().toISOString() })
    .eq('id', notificacionId);

  if (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
