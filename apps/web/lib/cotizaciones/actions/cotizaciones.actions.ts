'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import {
  AddCotizacionItemSchema,
  CambiarEstadoCotizacionSchema,
  CreateCotizacionFromLeadSchema,
  CreateCotizacionSchema,
  DeleteCotizacionItemSchema,
  DuplicarCotizacionSchema,
  ReorderItemsSchema,
  UpdateCotizacionItemSchema,
  UpdateCotizacionSchema,
  getIvaPorcentaje,
} from '../schemas/cotizacion.schema';

/**
 * Crear cotización desde un lead (flujo principal)
 */
export const createCotizacionFromLeadAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    // Usar la función de la base de datos
    const { data: cotizacionId, error } = await client.rpc(
      'crear_cotizacion_desde_lead',
      { p_lead_id: data.lead_id }
    );

    if (error) {
      throw new Error(`Error al crear cotización: ${error.message}`);
    }

    revalidatePath('/home/cotizaciones');
    revalidatePath('/home/leads');

    return { success: true, cotizacion_id: cotizacionId };
  },
  {
    schema: CreateCotizacionFromLeadSchema,
  }
);

/**
 * Crear cotización manualmente
 */
export const createCotizacionAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    // Obtener TRM actual
    const { data: trmData } = await client
      .from('trm_historico')
      .select('valor')
      .order('fecha', { ascending: false })
      .limit(1)
      .single();

    const trm = trmData?.valor || 4250;

    // Buscar o crear cliente
    let clienteId: string | null = null;
    const { data: clienteExistente } = await client
      .from('clientes')
      .select('id')
      .eq('nit', data.nit)
      .single();

    if (clienteExistente) {
      clienteId = clienteExistente.id;
    } else {
      const { data: nuevoCliente, error: errorCliente } = await client
        .from('clientes')
        .insert({
          nit: data.nit,
          razon_social: data.razon_social,
          nombre_contacto: data.nombre_contacto,
          celular_contacto: data.celular_contacto,
          email_contacto: data.email_contacto,
          creado_por: user.sub,
        })
        .select('id')
        .single();

      if (errorCliente) {
        throw new Error(`Error al crear cliente: ${errorCliente.message}`);
      }
      clienteId = nuevoCliente.id;
    }

    // Crear cotización
    const { data: cotizacion, error } = await client
      .from('cotizaciones')
      .insert({
        cliente_id: clienteId,
        asesor_id: user.sub,
        nit: data.nit,
        razon_social: data.razon_social,
        nombre_contacto: data.nombre_contacto,
        celular_contacto: data.celular_contacto,
        email_contacto: data.email_contacto,
        asunto: data.asunto,
        fecha_cotizacion: data.fecha_cotizacion || new Date().toISOString().split('T')[0],
        forma_pago: data.forma_pago,
        vigencia_dias: data.vigencia_dias,
        condiciones_comerciales: data.condiciones_comerciales,
        incluye_transporte: data.incluye_transporte,
        valor_transporte: data.valor_transporte,
        trm_valor: trm,
        trm_fecha: new Date().toISOString().split('T')[0],
        estado: 'BORRADOR',
        creado_por: user.sub,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear cotización: ${error.message}`);
    }

    // Registrar en historial
    await client.from('cotizacion_historial').insert({
      cotizacion_id: cotizacion.id,
      usuario_id: user.sub,
      accion: 'CREAR',
      estado_nuevo: 'BORRADOR',
      descripcion: 'Cotización creada manualmente',
    });

    revalidatePath('/home/cotizaciones');

    return { success: true, cotizacion };
  },
  {
    schema: CreateCotizacionSchema,
  }
);

/**
 * Actualizar cotización
 */
export const updateCotizacionAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { id, ...updateData } = data;

    const { data: cotizacion, error } = await client
      .from('cotizaciones')
      .update({
        ...updateData,
        modificado_por: user.sub,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar cotización: ${error.message}`);
    }

    revalidatePath('/home/cotizaciones');

    return { success: true, cotizacion };
  },
  {
    schema: UpdateCotizacionSchema,
  }
);

/**
 * Cambiar estado de cotización
 */
export const cambiarEstadoCotizacionAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    // Obtener estado anterior
    const { data: cotizacionAnterior } = await client
      .from('cotizaciones')
      .select('estado')
      .eq('id', data.id)
      .single();

    // Actualizar estado
    const { data: cotizacion, error } = await client
      .from('cotizaciones')
      .update({
        estado: data.estado,
        modificado_por: user.sub,
      })
      .eq('id', data.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al cambiar estado: ${error.message}`);
    }

    // Registrar en historial
    await client.from('cotizacion_historial').insert({
      cotizacion_id: data.id,
      usuario_id: user.sub,
      accion: 'CAMBIAR_ESTADO',
      estado_anterior: cotizacionAnterior?.estado,
      estado_nuevo: data.estado,
      descripcion: data.descripcion,
    });

    revalidatePath('/home/cotizaciones');

    return { success: true, cotizacion };
  },
  {
    schema: CambiarEstadoCotizacionSchema,
  }
);

/**
 * Agregar item a cotización
 */
export const addCotizacionItemAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    // Obtener TRM de la cotización
    const { data: cotizacion } = await client
      .from('cotizaciones')
      .select('trm_valor')
      .eq('id', data.cotizacion_id)
      .single();

    const trm = cotizacion?.trm_valor || 4250;

    // Calcular valores
    const costoUnitarioCop = data.moneda_costo === 'USD'
      ? data.costo_unitario * trm
      : data.costo_unitario;

    const precioUnitario = costoUnitarioCop * (1 + data.porcentaje_utilidad / 100);
    const ivaPorcentaje = getIvaPorcentaje(data.iva_tipo);
    const ivaValor = precioUnitario * data.cantidad * (ivaPorcentaje / 100);

    const subtotalCosto = costoUnitarioCop * data.cantidad;
    const subtotalVenta = precioUnitario * data.cantidad;
    const totalItem = subtotalVenta + ivaValor;
    const utilidadItem = subtotalVenta - subtotalCosto;
    const margenItem = subtotalVenta > 0 ? (utilidadItem / subtotalVenta) * 100 : 0;

    // Obtener el orden máximo actual
    const { data: maxOrden } = await client
      .from('cotizacion_items')
      .select('orden')
      .eq('cotizacion_id', data.cotizacion_id)
      .order('orden', { ascending: false })
      .limit(1)
      .single();

    const nuevoOrden = data.orden ?? ((maxOrden?.orden || 0) + 1);

    // Construir objeto de inserción base
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const insertData: any = {
      cotizacion_id: data.cotizacion_id,
      producto_id: data.producto_id,
      numero_parte: data.numero_parte,
      nombre_producto: data.nombre_producto,
      descripcion: data.descripcion,
      observaciones: data.observaciones,
      proveedor_id: data.proveedor_id,
      proveedor_nombre: data.proveedor_nombre,
      tiempo_entrega_dias: data.tiempo_entrega_dias,
      garantia_meses: data.garantia_meses,
      costo_unitario: data.costo_unitario,
      moneda_costo: data.moneda_costo,
      costo_unitario_cop: costoUnitarioCop,
      porcentaje_utilidad: data.porcentaje_utilidad,
      precio_unitario: precioUnitario,
      iva_tipo: data.iva_tipo,
      iva_porcentaje: ivaPorcentaje,
      iva_valor: ivaValor,
      cantidad: data.cantidad,
      subtotal_costo: subtotalCosto,
      subtotal_venta: subtotalVenta,
      total_iva: ivaValor,
      total_item: totalItem,
      utilidad_item: utilidadItem,
      margen_item: margenItem,
      orden: nuevoOrden,
    };

    // Agregar vertical_id solo si se proporciona (requiere migración 20241220000011)
    if (data.vertical_id) {
      insertData.vertical_id = data.vertical_id;
    }

    const { data: item, error } = await client
      .from('cotizacion_items')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      // Si el error es por columna vertical_id no existente, reintentar sin ella
      if (error.message.includes('vertical_id')) {
        delete insertData.vertical_id;
        const { data: itemRetry, error: errorRetry } = await client
          .from('cotizacion_items')
          .insert(insertData)
          .select()
          .single();

        if (errorRetry) {
          throw new Error(`Error al agregar item: ${errorRetry.message}`);
        }

        revalidatePath('/home/cotizaciones');
        return { success: true, item: itemRetry };
      }
      throw new Error(`Error al agregar item: ${error.message}`);
    }

    revalidatePath('/home/cotizaciones');

    return { success: true, item };
  },
  {
    schema: AddCotizacionItemSchema,
  }
);

/**
 * Actualizar item de cotización
 */
export const updateCotizacionItemAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { id, ...updateData } = data;

    // Si se actualizan valores que afectan el cálculo, recalcular
    if (updateData.costo_unitario || updateData.porcentaje_utilidad ||
        updateData.cantidad || updateData.iva_tipo || updateData.moneda_costo) {

      // Obtener item actual
      const { data: itemActual } = await client
        .from('cotizacion_items')
        .select('*, cotizacion:cotizaciones(trm_valor)')
        .eq('id', id)
        .single();

      if (itemActual) {
        const trm = (itemActual as any).cotizacion?.trm_valor || 4250;
        const costoUnitario = updateData.costo_unitario ?? itemActual.costo_unitario;
        const monedaCosto = updateData.moneda_costo ?? itemActual.moneda_costo;
        const porcentajeUtilidad = updateData.porcentaje_utilidad ?? itemActual.porcentaje_utilidad;
        const cantidad = updateData.cantidad ?? itemActual.cantidad;
        const ivaTipo = updateData.iva_tipo ?? itemActual.iva_tipo ?? 'IVA_19';

        const costoUnitarioCop = monedaCosto === 'USD' ? costoUnitario * trm : costoUnitario;
        const precioUnitario = costoUnitarioCop * (1 + porcentajeUtilidad / 100);
        const ivaPorcentaje = getIvaPorcentaje(ivaTipo as 'IVA_0' | 'IVA_5' | 'IVA_19');
        const ivaValor = precioUnitario * cantidad * (ivaPorcentaje / 100);

        const subtotalCosto = costoUnitarioCop * cantidad;
        const subtotalVenta = precioUnitario * cantidad;
        const totalItem = subtotalVenta + ivaValor;
        const utilidadItem = subtotalVenta - subtotalCosto;
        const margenItem = subtotalVenta > 0 ? (utilidadItem / subtotalVenta) * 100 : 0;

        Object.assign(updateData, {
          costo_unitario_cop: costoUnitarioCop,
          precio_unitario: precioUnitario,
          iva_porcentaje: ivaPorcentaje,
          iva_valor: ivaValor,
          subtotal_costo: subtotalCosto,
          subtotal_venta: subtotalVenta,
          total_iva: ivaValor,
          total_item: totalItem,
          utilidad_item: utilidadItem,
          margen_item: margenItem,
        });
      }
    }

    const { data: item, error } = await client
      .from('cotizacion_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar item: ${error.message}`);
    }

    revalidatePath('/home/cotizaciones');

    return { success: true, item };
  },
  {
    schema: UpdateCotizacionItemSchema,
  }
);

/**
 * Eliminar item de cotización
 */
export const deleteCotizacionItemAction = enhanceAction(
  async (data, _user) => {
    const client = getSupabaseServerClient();

    const { error } = await client
      .from('cotizacion_items')
      .delete()
      .eq('id', data.id);

    if (error) {
      throw new Error(`Error al eliminar item: ${error.message}`);
    }

    revalidatePath('/home/cotizaciones');

    return { success: true };
  },
  {
    schema: DeleteCotizacionItemSchema,
  }
);

/**
 * Reordenar items de cotización
 */
export const reorderItemsAction = enhanceAction(
  async (data, _user) => {
    const client = getSupabaseServerClient();

    // Actualizar orden de cada item
    for (const item of data.items) {
      await client
        .from('cotizacion_items')
        .update({ orden: item.orden })
        .eq('id', item.id);
    }

    revalidatePath('/home/cotizaciones');

    return { success: true };
  },
  {
    schema: ReorderItemsSchema,
  }
);

/**
 * Duplicar cotización (crea una copia con nuevo número)
 */
export const duplicarCotizacionAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    // Obtener cotización original con sus items
    const { data: original, error: errorOriginal } = await client
      .from('cotizaciones')
      .select('*')
      .eq('id', data.id)
      .single();

    if (errorOriginal || !original) {
      throw new Error('No se encontró la cotización a duplicar');
    }

    // Obtener items de la cotización original
    const { data: itemsOriginales } = await client
      .from('cotizacion_items')
      .select('*')
      .eq('cotizacion_id', data.id)
      .order('orden', { ascending: true });

    // Obtener TRM actual
    const { data: trmData } = await client
      .from('trm_historico')
      .select('valor')
      .order('fecha', { ascending: false })
      .limit(1)
      .single();

    const trm = trmData?.valor || 4250;

    // Crear nueva cotización (sin id, numero se autogenera)
    const {
      id: _id,
      numero: _numero,
      creado_en: _creado_en,
      modificado_en: _modificado_en,
      enviado_en: _enviado_en,
      cerrado_en: _cerrado_en,
      aprobado_en: _aprobado_en,
      ...datosParaCopiar
    } = original;

    const { data: nuevaCotizacion, error: errorNueva } = await client
      .from('cotizaciones')
      .insert({
        ...datosParaCopiar,
        estado: 'BORRADOR',
        fecha_cotizacion: new Date().toISOString().split('T')[0],
        trm_valor: trm,
        trm_fecha: new Date().toISOString().split('T')[0],
        creado_por: user.sub,
        // Mantener el asesor original (ya viene en datosParaCopiar)
      })
      .select()
      .single();

    if (errorNueva || !nuevaCotizacion) {
      throw new Error(`Error al duplicar cotización: ${errorNueva?.message}`);
    }

    // Duplicar items si existen
    if (itemsOriginales && itemsOriginales.length > 0) {
      const itemsParaInsertar = itemsOriginales.map((item) => {
        const {
          id: _itemId,
          cotizacion_id: _cotId,
          creado_en: _itemCreado,
          modificado_en: _itemModificado,
          ...itemData
        } = item;
        return {
          ...itemData,
          cotizacion_id: nuevaCotizacion.id,
        };
      });

      await client.from('cotizacion_items').insert(itemsParaInsertar);
    }

    // Registrar en historial
    await client.from('cotizacion_historial').insert({
      cotizacion_id: nuevaCotizacion.id,
      usuario_id: user.sub,
      accion: 'CREAR',
      estado_nuevo: 'BORRADOR',
      descripcion: `Duplicada desde cotización #${original.numero}`,
    });

    revalidatePath('/home/cotizaciones');

    return {
      success: true,
      cotizacion: nuevaCotizacion,
      numeroOriginal: original.numero,
      numeroNuevo: nuevaCotizacion.numero,
    };
  },
  {
    schema: DuplicarCotizacionSchema,
  }
);
