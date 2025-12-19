import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';

import type { LeadFilters } from '../schemas/lead.schema';

type Lead = Database['public']['Tables']['leads']['Row'];
type LeadObservacion = Database['public']['Tables']['lead_observaciones']['Row'];
type LeadAsignacionLog = Database['public']['Tables']['lead_asignaciones_log']['Row'];

export class LeadsApi {
  constructor(private readonly client: SupabaseClient<Database>) {}

  /**
   * Obtener todos los leads con filtros opcionales
   */
  async getLeads(filters?: LeadFilters) {
    let query = this.client
      .from('leads')
      .select(`
        *,
        asesor:usuarios!leads_asesor_asignado_id_fkey(id, nombre, email)
      `)
      .order('creado_en', { ascending: false });

    if (filters?.estado) {
      query = query.eq('estado', filters.estado);
    }

    if (filters?.canal_origen) {
      query = query.eq('canal_origen', filters.canal_origen);
    }

    if (filters?.asesor_id) {
      query = query.eq('asesor_asignado_id', filters.asesor_id);
    }

    if (filters?.busqueda) {
      query = query.or(
        `razon_social.ilike.%${filters.busqueda}%,nombre_contacto.ilike.%${filters.busqueda}%,nit.ilike.%${filters.busqueda}%,email_contacto.ilike.%${filters.busqueda}%`
      );
    }

    if (filters?.fecha_desde) {
      query = query.gte('fecha_lead', filters.fecha_desde);
    }

    if (filters?.fecha_hasta) {
      query = query.lte('fecha_lead', filters.fecha_hasta);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Obtener un lead por ID
   */
  async getLeadById(id: string) {
    const { data, error } = await this.client
      .from('leads')
      .select(`
        *,
        asesor:usuarios!leads_asesor_asignado_id_fkey(id, nombre, email, avatar_url)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Obtener observaciones de un lead
   */
  async getLeadObservaciones(leadId: string) {
    const { data, error } = await this.client
      .from('lead_observaciones')
      .select(`
        *,
        usuario:usuarios!lead_observaciones_usuario_id_fkey(id, nombre, avatar_url)
      `)
      .eq('lead_id', leadId)
      .order('creado_en', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Obtener historial de asignaciones de un lead
   */
  async getLeadAsignaciones(leadId: string) {
    const { data, error } = await this.client
      .from('lead_asignaciones_log')
      .select(`
        *,
        asesor_anterior:usuarios!lead_asignaciones_log_asesor_anterior_id_fkey(id, nombre),
        asesor_nuevo:usuarios!lead_asignaciones_log_asesor_nuevo_id_fkey(id, nombre)
      `)
      .eq('lead_id', leadId)
      .order('creado_en', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Obtener estadísticas de leads
   */
  async getLeadStats() {
    const { data, error } = await this.client
      .from('leads')
      .select('estado');

    if (error) {
      throw error;
    }

    const stats = {
      total: data.length,
      pendiente_asignacion: data.filter(l => l.estado === 'PENDIENTE_ASIGNACION').length,
      asignado: data.filter(l => l.estado === 'ASIGNADO').length,
      convertido: data.filter(l => l.estado === 'CONVERTIDO').length,
      rechazado: data.filter(l => l.estado === 'RECHAZADO').length,
    };

    return stats;
  }

  /**
   * Verificar si existe un lead con el mismo NIT
   */
  async checkDuplicateNit(nit: string, excludeId?: string) {
    let query = this.client
      .from('leads')
      .select('id, numero, razon_social')
      .eq('nit', nit)
      .neq('estado', 'RECHAZADO');

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data.length > 0 ? data[0] : null;
  }

  /**
   * Verificar si existe un lead con el mismo email
   */
  async checkDuplicateEmail(email: string, excludeId?: string) {
    let query = this.client
      .from('leads')
      .select('id, numero, razon_social')
      .eq('email_contacto', email)
      .neq('estado', 'RECHAZADO');

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data.length > 0 ? data[0] : null;
  }

  /**
   * Obtener asesores disponibles para asignación
   */
  async getAsesoresDisponibles() {
    const { data, error } = await this.client
      .from('asesores_config')
      .select(`
        id,
        max_leads_pendientes,
        usuario:usuarios!asesores_config_usuario_id_fkey(id, nombre, email, avatar_url)
      `)
      .eq('activo', true)
      .order('creado_en', { ascending: true });

    if (error) {
      throw error;
    }

    // Contar leads pendientes por asesor
    const asesoresConConteo = await Promise.all(
      (data as any[]).map(async (asesor) => {
        const usuarioId = asesor.usuario?.id;
        if (!usuarioId) return null;

        const { count } = await this.client
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('asesor_asignado_id', usuarioId)
          .in('estado', ['PENDIENTE_ASIGNACION', 'ASIGNADO', 'PENDIENTE_INFORMACION']);

        const maxLeads = asesor.max_leads_pendientes || 5;

        return {
          id: usuarioId,
          nombre: asesor.usuario?.nombre || '',
          email: asesor.usuario?.email || '',
          avatar_url: asesor.usuario?.avatar_url || null,
          max_leads: maxLeads,
          leads_actuales: count || 0,
          disponible: (count || 0) < maxLeads,
        };
      })
    );

    return asesoresConConteo.filter(Boolean) as {
      id: string;
      nombre: string;
      email: string;
      avatar_url: string | null;
      max_leads: number;
      leads_actuales: number;
      disponible: boolean;
    }[];
  }
}

export function createLeadsApi(client: SupabaseClient<Database>) {
  return new LeadsApi(client);
}
