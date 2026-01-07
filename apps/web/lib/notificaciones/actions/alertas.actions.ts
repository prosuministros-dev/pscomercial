'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { enhanceAction } from '@/lib/actions';
import {
  marcarLeidaSchema,
  type MarcarLeidaInput,
  alertaInternaSchema,
  type AlertaInterna,
  alertasStatsSchema,
  type AlertasStats,
} from '../schemas/notificaciones.schema';

/**
 * Server action para marcar una alerta como leída
 * HU-0009: Usuario puede marcar alertas individuales como leídas
 */
export const marcarAlertaLeidaAction = enhanceAction(
  marcarLeidaSchema,
  async (data: MarcarLeidaInput, formData, { user }) => {
    const supabase = await getSupabaseServerClient();

    const { data: alerta, error } = await supabase
      .from('alertas_internas')
      .update({
        leida: true,
        leida_en: new Date().toISOString(),
      })
      .eq('id', data.alerta_id)
      .eq('usuario_id', user.id) // Seguridad: solo el usuario dueño puede marcarla
      .select()
      .single();

    if (error) {
      console.error('Error marcando alerta como leída:', error);
      throw new Error('Error al marcar la alerta como leída');
    }

    // Revalidar panel de notificaciones
    revalidatePath('/');
    revalidatePath('/notificaciones');

    return alertaInternaSchema.parse(alerta);
  }
);

/**
 * Server action para marcar todas las alertas como leídas
 * HU-0009: Opción "Marcar todas como leídas"
 */
export const marcarTodasLeidasAction = enhanceAction(
  async (user) => {
    const supabase = await getSupabaseServerClient();

    const { error } = await supabase
      .from('alertas_internas')
      .update({
        leida: true,
        leida_en: new Date().toISOString(),
      })
      .eq('usuario_id', user.id)
      .eq('leida', false);

    if (error) {
      console.error('Error marcando todas las alertas como leídas:', error);
      throw new Error('Error al marcar todas las alertas como leídas');
    }

    // Revalidar panel de notificaciones
    revalidatePath('/');
    revalidatePath('/notificaciones');

    return { success: true };
  }
);

/**
 * Query para obtener alertas del usuario autenticado
 * @param filtros - Filtros opcionales (tipo, leida, prioridad)
 * @param limit - Límite de resultados
 * @param offset - Offset para paginación
 * @returns Lista de alertas ordenadas por fecha (más reciente primero)
 */
export async function getAlertas(
  filtros?: {
    tipo?: 'estado' | 'mencion' | 'seguimiento';
    leida?: boolean;
    prioridad?: 'baja' | 'media' | 'alta' | 'urgente';
  },
  limit = 50,
  offset = 0
): Promise<AlertaInterna[]> {
  const supabase = await getSupabaseServerClient();

  let query = supabase
    .from('alertas_internas')
    .select(
      `
      *,
      generado_por_usuario:generado_por (
        id,
        name,
        email,
        picture_url
      )
    `
    )
    .order('creado_en', { ascending: false })
    .range(offset, offset + limit - 1);

  // Aplicar filtros opcionales
  if (filtros?.tipo) {
    query = query.eq('tipo', filtros.tipo);
  }
  if (filtros?.leida !== undefined) {
    query = query.eq('leida', filtros.leida);
  }
  if (filtros?.prioridad) {
    query = query.eq('prioridad', filtros.prioridad);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error obteniendo alertas:', error);
    throw new Error('Error al cargar las alertas');
  }

  return data.map((alerta) => alertaInternaSchema.parse(alerta));
}

/**
 * Query para obtener estadísticas de alertas del usuario
 * HU-0009: Badge con contador de no leídas
 * @returns Objeto con estadísticas completas
 */
export async function getAlertasStats(): Promise<AlertasStats> {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  // Obtener todas las alertas del usuario
  const { data: alertas, error } = await supabase
    .from('alertas_internas')
    .select('tipo, prioridad, leida')
    .eq('usuario_id', user.id);

  if (error) {
    console.error('Error obteniendo estadísticas de alertas:', error);
    return {
      total: 0,
      no_leidas: 0,
      por_tipo: { estado: 0, mencion: 0, seguimiento: 0 },
      por_prioridad: { baja: 0, media: 0, alta: 0, urgente: 0 },
    };
  }

  // Calcular estadísticas
  const stats = {
    total: alertas.length,
    no_leidas: alertas.filter((a) => !a.leida).length,
    por_tipo: {
      estado: alertas.filter((a) => a.tipo === 'estado').length,
      mencion: alertas.filter((a) => a.tipo === 'mencion').length,
      seguimiento: alertas.filter((a) => a.tipo === 'seguimiento').length,
    },
    por_prioridad: {
      baja: alertas.filter((a) => a.prioridad === 'baja').length,
      media: alertas.filter((a) => a.prioridad === 'media').length,
      alta: alertas.filter((a) => a.prioridad === 'alta').length,
      urgente: alertas.filter((a) => a.prioridad === 'urgente').length,
    },
  };

  return alertasStatsSchema.parse(stats);
}

/**
 * Query para obtener alertas no leídas del usuario
 * Útil para el badge del panel de notificaciones
 * @returns Lista de alertas no leídas
 */
export async function getAlertasNoLeidas(): Promise<AlertaInterna[]> {
  return getAlertas({ leida: false }, 50, 0);
}

/**
 * Query para obtener alertas relacionadas a un documento específico
 * @param referenciaTipo - Tipo de documento
 * @param referenciaId - ID del documento
 * @returns Lista de alertas relacionadas
 */
export async function getAlertasPorReferencia(
  referenciaTipo: string,
  referenciaId: string
): Promise<AlertaInterna[]> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from('alertas_internas')
    .select(
      `
      *,
      generado_por_usuario:generado_por (
        id,
        name,
        email,
        picture_url
      )
    `
    )
    .eq('referencia_tipo', referenciaTipo)
    .eq('referencia_id', referenciaId)
    .order('creado_en', { ascending: false });

  if (error) {
    console.error('Error obteniendo alertas por referencia:', error);
    return [];
  }

  return data.map((alerta) => alertaInternaSchema.parse(alerta));
}
