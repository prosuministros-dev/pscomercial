import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';

import type { CotizacionFilters } from '../schemas/cotizacion.schema';

export class CotizacionesApi {
  constructor(private readonly client: SupabaseClient<Database>) {}

  /**
   * Obtener todas las cotizaciones con filtros
   */
  async getCotizaciones(filters?: CotizacionFilters) {
    let query = this.client
      .from('cotizaciones')
      .select(`
        *,
        asesor:usuarios!cotizaciones_asesor_id_fkey(id, nombre, email),
        cliente:clientes!cotizaciones_cliente_id_fkey(id, razon_social, nit),
        lead:leads!cotizaciones_lead_id_fkey(id, numero)
      `)
      .order('creado_en', { ascending: false });

    if (filters?.estado) {
      query = query.eq('estado', filters.estado);
    }

    if (filters?.asesor_id) {
      query = query.eq('asesor_id', filters.asesor_id);
    }

    if (filters?.cliente_id) {
      query = query.eq('cliente_id', filters.cliente_id);
    }

    if (filters?.busqueda) {
      query = query.or(
        `razon_social.ilike.%${filters.busqueda}%,nit.ilike.%${filters.busqueda}%,asunto.ilike.%${filters.busqueda}%`
      );
    }

    if (filters?.fecha_desde) {
      query = query.gte('fecha_cotizacion', filters.fecha_desde);
    }

    if (filters?.fecha_hasta) {
      query = query.lte('fecha_cotizacion', filters.fecha_hasta);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Obtener una cotización por ID con items
   */
  async getCotizacionById(id: string) {
    const { data, error } = await this.client
      .from('cotizaciones')
      .select(`
        *,
        asesor:usuarios!cotizaciones_asesor_id_fkey(id, nombre, email, avatar_url),
        cliente:clientes!cotizaciones_cliente_id_fkey(*),
        lead:leads!cotizaciones_lead_id_fkey(id, numero, requerimiento),
        items:cotizacion_items(
          *,
          producto:productos!cotizacion_items_producto_id_fkey(id, numero_parte, nombre),
          proveedor:proveedores!cotizacion_items_proveedor_id_fkey(id, nombre)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    // Ordenar items por orden
    if (data?.items) {
      data.items.sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0));
    }

    return data;
  }

  /**
   * Obtener items de una cotización
   */
  async getCotizacionItems(cotizacionId: string) {
    const { data, error } = await this.client
      .from('cotizacion_items')
      .select(`
        *,
        producto:productos!cotizacion_items_producto_id_fkey(id, numero_parte, nombre),
        proveedor:proveedores!cotizacion_items_proveedor_id_fkey(id, nombre)
      `)
      .eq('cotizacion_id', cotizacionId)
      .order('orden', { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Obtener historial de una cotización
   */
  async getCotizacionHistorial(cotizacionId: string) {
    const { data, error } = await this.client
      .from('cotizacion_historial')
      .select(`
        *,
        usuario:auth.users!cotizacion_historial_usuario_id_fkey(email)
      `)
      .eq('cotizacion_id', cotizacionId)
      .order('creado_en', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Obtener estadísticas de cotizaciones
   */
  async getCotizacionStats() {
    const { data, error } = await this.client
      .from('cotizaciones')
      .select('estado, total_venta');

    if (error) {
      throw error;
    }

    const stats = {
      total: data.length,
      borrador: data.filter(c => c.estado === 'BORRADOR').length,
      en_negociacion: data.filter(c => c.estado === 'NEGOCIACION').length,
      pendiente_oc: data.filter(c => c.estado === 'PENDIENTE_OC').length,
      ganadas: data.filter(c => c.estado === 'GANADA').length,
      perdidas: data.filter(c => c.estado === 'PERDIDA').length,
      valor_total: data.reduce((sum, c) => sum + (Number(c.total_venta) || 0), 0),
      valor_ganadas: data
        .filter(c => c.estado === 'GANADA')
        .reduce((sum, c) => sum + (Number(c.total_venta) || 0), 0),
    };

    return stats;
  }

  /**
   * Obtener TRM del día
   */
  async getTrmActual() {
    const { data, error } = await this.client
      .from('trm_historico')
      .select('valor, fecha')
      .order('fecha', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // Retornar valor por defecto si no hay TRM
      return { valor: 4250, fecha: new Date().toISOString().split('T')[0] };
    }

    return data;
  }

  /**
   * Buscar productos
   */
  async buscarProductos(busqueda: string) {
    const { data, error } = await this.client
      .from('productos')
      .select(`
        *,
        vertical:verticales!productos_vertical_id_fkey(id, nombre, margen_minimo, margen_sugerido),
        marca:marcas!productos_marca_id_fkey(id, nombre),
        proveedor:proveedores!productos_proveedor_principal_id_fkey(id, nombre)
      `)
      .eq('activo', true)
      .or(`numero_parte.ilike.%${busqueda}%,nombre.ilike.%${busqueda}%`)
      .limit(20);

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Obtener verticales
   */
  async getVerticales() {
    const { data, error } = await this.client
      .from('verticales')
      .select('*')
      .eq('activo', true)
      .order('nombre');

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Obtener marcas
   */
  async getMarcas() {
    const { data, error } = await this.client
      .from('marcas')
      .select('*')
      .eq('activo', true)
      .order('nombre');

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Obtener proveedores
   */
  async getProveedores() {
    const { data, error } = await this.client
      .from('proveedores')
      .select('*')
      .eq('activo', true)
      .order('nombre');

    if (error) {
      throw error;
    }

    return data;
  }
}

export function createCotizacionesApi(client: SupabaseClient<Database>) {
  return new CotizacionesApi(client);
}
