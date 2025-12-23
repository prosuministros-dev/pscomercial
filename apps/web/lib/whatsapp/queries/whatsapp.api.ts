/**
 * Queries y funciones de API para WhatsApp - HU-0012
 */

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type {
  ConversacionesFilter,
  TemplatesFilter,
  WhatsAppAsesorSync,
  WhatsAppConversacion,
  WhatsAppMensaje,
  WhatsAppTemplate,
} from '../schemas/whatsapp.schema';

// ===========================================
// CONVERSACIONES
// ===========================================

export async function getConversaciones(
  filters?: ConversacionesFilter,
): Promise<WhatsAppConversacion[]> {
  const client = getSupabaseServerClient();

  let query = client
    .from('whatsapp_conversaciones')
    .select(
      `
      *,
      asesor:usuarios!asesor_asignado_id(id, nombre_completo, email)
    `,
    )
    .order('ultimo_mensaje_en', { ascending: false, nullsFirst: false });

  if (filters?.estado) {
    query = query.eq('estado', filters.estado);
  }

  if (filters?.asesor_id) {
    query = query.eq('asesor_asignado_id', filters.asesor_id);
  }

  if (filters?.tiene_mensajes_no_leidos) {
    query = query.gt('mensajes_no_leidos', 0);
  }

  if (filters?.search) {
    query = query.or(
      `telefono_cliente.ilike.%${filters.search}%,nombre_contacto.ilike.%${filters.search}%`,
    );
  }

  if (filters?.fecha_desde) {
    query = query.gte('creado_en', filters.fecha_desde);
  }

  if (filters?.fecha_hasta) {
    query = query.lte('creado_en', filters.fecha_hasta);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching conversaciones:', error);
    throw new Error(`Error fetching conversaciones: ${error.message}`);
  }

  return (data || []) as WhatsAppConversacion[];
}

export async function getConversacionById(
  id: string,
): Promise<WhatsAppConversacion | null> {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('whatsapp_conversaciones')
    .select(
      `
      *,
      asesor:usuarios!asesor_asignado_id(id, nombre_completo, email)
    `,
    )
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching conversacion:', error);
    throw new Error(`Error fetching conversacion: ${error.message}`);
  }

  return data as WhatsAppConversacion;
}

export async function getConversacionByTelefono(
  telefono: string,
): Promise<WhatsAppConversacion | null> {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('whatsapp_conversaciones')
    .select(
      `
      *,
      asesor:usuarios!asesor_asignado_id(id, nombre_completo, email)
    `,
    )
    .eq('telefono_cliente', telefono)
    .eq('estado', 'ACTIVA')
    .order('creado_en', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching conversacion by telefono:', error);
    throw new Error(`Error fetching conversacion: ${error.message}`);
  }

  return data as WhatsAppConversacion;
}

// ===========================================
// MENSAJES
// ===========================================

export async function getMensajes(
  conversacionId: string,
): Promise<WhatsAppMensaje[]> {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('whatsapp_mensajes')
    .select('*')
    .eq('conversacion_id', conversacionId)
    .order('creado_en', { ascending: true });

  if (error) {
    console.error('Error fetching mensajes:', error);
    throw new Error(`Error fetching mensajes: ${error.message}`);
  }

  return (data || []) as WhatsAppMensaje[];
}

export async function getConversacionConMensajes(
  conversacionId: string,
): Promise<WhatsAppConversacion | null> {
  const client = getSupabaseServerClient();

  // Obtener conversación
  const { data: conversacion, error: convError } = await client
    .from('whatsapp_conversaciones')
    .select(
      `
      *,
      asesor:usuarios!asesor_asignado_id(id, nombre_completo, email)
    `,
    )
    .eq('id', conversacionId)
    .single();

  if (convError) {
    if (convError.code === 'PGRST116') return null;
    throw new Error(`Error fetching conversacion: ${convError.message}`);
  }

  // Obtener mensajes
  const { data: mensajes, error: msgError } = await client
    .from('whatsapp_mensajes')
    .select('*')
    .eq('conversacion_id', conversacionId)
    .order('creado_en', { ascending: true });

  if (msgError) {
    throw new Error(`Error fetching mensajes: ${msgError.message}`);
  }

  return {
    ...conversacion,
    mensajes: mensajes || [],
  } as WhatsAppConversacion;
}

// ===========================================
// TEMPLATES
// ===========================================

export async function getTemplates(
  filters?: TemplatesFilter,
): Promise<WhatsAppTemplate[]> {
  const client = getSupabaseServerClient();

  let query = client
    .from('whatsapp_templates')
    .select('*')
    .order('categoria', { ascending: true })
    .order('nombre', { ascending: true });

  if (filters?.categoria) {
    query = query.eq('categoria', filters.categoria);
  }

  if (filters?.activo !== undefined) {
    query = query.eq('activo', filters.activo);
  }

  if (filters?.search) {
    query = query.or(
      `nombre.ilike.%${filters.search}%,contenido.ilike.%${filters.search}%`,
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching templates:', error);
    throw new Error(`Error fetching templates: ${error.message}`);
  }

  return (data || []) as WhatsAppTemplate[];
}

export async function getTemplateByCodigo(
  codigo: string,
): Promise<WhatsAppTemplate | null> {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('whatsapp_templates')
    .select('*')
    .eq('codigo', codigo)
    .eq('activo', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Error fetching template: ${error.message}`);
  }

  return data as WhatsAppTemplate;
}

// ===========================================
// ASESOR SYNC (Embedded Sign-Up)
// ===========================================

export async function getAsesorSync(
  usuarioId: string,
): Promise<WhatsAppAsesorSync | null> {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('whatsapp_asesor_sync')
    .select('*')
    .eq('usuario_id', usuarioId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Error fetching asesor sync: ${error.message}`);
  }

  return data as WhatsAppAsesorSync;
}

// ===========================================
// ESTADÍSTICAS
// ===========================================

export async function getWhatsAppStats() {
  const client = getSupabaseServerClient();

  // Obtener contadores
  const [
    { count: totalConversaciones },
    { count: conversacionesActivas },
    { count: mensajesNoLeidos },
  ] = await Promise.all([
    client
      .from('whatsapp_conversaciones')
      .select('*', { count: 'exact', head: true }),
    client
      .from('whatsapp_conversaciones')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'ACTIVA'),
    client
      .from('whatsapp_conversaciones')
      .select('mensajes_no_leidos')
      .gt('mensajes_no_leidos', 0),
  ]);

  const totalNoLeidos =
    mensajesNoLeidos?.reduce(
      (acc, conv) => acc + (conv.mensajes_no_leidos || 0),
      0,
    ) || 0;

  return {
    totalConversaciones: totalConversaciones || 0,
    conversacionesActivas: conversacionesActivas || 0,
    mensajesNoLeidos: totalNoLeidos,
  };
}
