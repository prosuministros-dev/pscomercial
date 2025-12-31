/**
 * Servicio de Bitácora/Auditoría para WhatsApp - HU-0012 (CA-12)
 *
 * Registra todas las acciones del módulo de WhatsApp para trazabilidad completa.
 * Todas las acciones deben quedar registradas en la tabla whatsapp_webhook_log.
 */

import 'server-only';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

// ===========================================
// TIPOS DE EVENTOS
// ===========================================

export type EventoTipo =
  // Mensajes
  | 'message_received'       // Mensaje entrante recibido
  | 'message_sent'           // Mensaje enviado por asesor
  | 'message_bot_sent'       // Mensaje enviado por bot
  | 'template_sent'          // Template enviado
  | 'message_read'           // Mensaje marcado como leído
  | 'message_delivered'      // Mensaje entregado (status de Meta)
  | 'message_failed'         // Mensaje falló al enviarse

  // Conversaciones
  | 'conversation_created'   // Nueva conversación creada
  | 'conversation_updated'   // Conversación actualizada (estado, asesor, etc.)
  | 'conversation_closed'    // Conversación cerrada
  | 'conversation_reopened'  // Conversación reabierta

  // Bot
  | 'bot_state_change'       // Cambio de estado del bot
  | 'bot_intent_classified'  // Intención clasificada
  | 'bot_data_captured'      // Datos capturados del usuario

  // Lead
  | 'lead_created'           // Lead creado desde conversación
  | 'lead_linked'            // Lead vinculado a conversación

  // Notificaciones
  | 'notification_sent'      // Notificación interna enviada
  | 'notification_read'      // Notificación leída

  // Comercial
  | 'comercial_searched'     // Búsqueda de comercial realizada
  | 'comercial_assigned'     // Comercial asignado a conversación
  | 'comercial_notified'     // Comercial notificado

  // Inactividad
  | 'reminder_1_sent'        // Recordatorio 1 enviado
  | 'reminder_2_sent'        // Recordatorio 2 enviado
  | 'inactivity_close'       // Cierre por inactividad

  // Sistema
  | 'webhook_received'       // Webhook de Meta recibido
  | 'webhook_error'          // Error en procesamiento de webhook
  | 'api_call'               // Llamada a API de Meta
  | 'api_error';             // Error en llamada a API

// ===========================================
// INTERFAZ DEL LOG
// ===========================================

export interface AuditLogEntry {
  tipoEvento: EventoTipo;
  conversacionId?: string;
  mensajeId?: string;
  usuarioId?: string;
  payload: Record<string, unknown>;
  error?: string;
}

// ===========================================
// CLASE PRINCIPAL
// ===========================================

class AuditLogger {
  /**
   * Registra un evento en la bitácora
   */
  async log(entry: AuditLogEntry): Promise<{ success: boolean; logId?: string; error?: string }> {
    const client = getSupabaseServerClient();

    try {
      const { data, error } = await client
        .from('whatsapp_webhook_log')
        .insert({
          tipo_evento: entry.tipoEvento,
          payload: {
            ...entry.payload,
            timestamp: new Date().toISOString(),
            usuario_id: entry.usuarioId,
          },
          procesado: true,
          procesado_en: new Date().toISOString(),
          conversacion_id: entry.conversacionId,
          mensaje_id: entry.mensajeId,
          error: entry.error,
        })
        .select('id')
        .single();

      if (error) {
        console.error('[AuditLogger] Error guardando log:', error);
        return { success: false, error: error.message };
      }

      return { success: true, logId: data?.id };

    } catch (err) {
      console.error('[AuditLogger] Error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error desconocido',
      };
    }
  }

  // ===========================================
  // MÉTODOS DE CONVENIENCIA - MENSAJES
  // ===========================================

  async logMensajeRecibido(
    conversacionId: string,
    mensajeId: string,
    telefono: string,
    tipo: string,
    contenido: string
  ) {
    return this.log({
      tipoEvento: 'message_received',
      conversacionId,
      mensajeId,
      payload: { telefono, tipo, contenido: contenido.substring(0, 500) },
    });
  }

  async logMensajeEnviado(
    conversacionId: string,
    mensajeId: string,
    contenido: string,
    remitente: 'ASESOR' | 'BOT'
  ) {
    return this.log({
      tipoEvento: remitente === 'BOT' ? 'message_bot_sent' : 'message_sent',
      conversacionId,
      mensajeId,
      payload: { contenido: contenido.substring(0, 500), remitente },
    });
  }

  async logTemplateEnviado(
    conversacionId: string,
    mensajeId: string,
    templateCode: string,
    variables: Record<string, string>
  ) {
    return this.log({
      tipoEvento: 'template_sent',
      conversacionId,
      mensajeId,
      payload: { templateCode, variables },
    });
  }

  async logMensajeLeido(conversacionId: string, mensajesLeidos: number) {
    return this.log({
      tipoEvento: 'message_read',
      conversacionId,
      payload: { mensajesLeidos },
    });
  }

  // ===========================================
  // MÉTODOS DE CONVENIENCIA - CONVERSACIONES
  // ===========================================

  async logConversacionCreada(conversacionId: string, telefono: string) {
    return this.log({
      tipoEvento: 'conversation_created',
      conversacionId,
      payload: { telefono },
    });
  }

  async logConversacionActualizada(
    conversacionId: string,
    cambios: Record<string, unknown>
  ) {
    return this.log({
      tipoEvento: 'conversation_updated',
      conversacionId,
      payload: { cambios },
    });
  }

  async logConversacionCerrada(conversacionId: string, motivo: string) {
    return this.log({
      tipoEvento: 'conversation_closed',
      conversacionId,
      payload: { motivo },
    });
  }

  // ===========================================
  // MÉTODOS DE CONVENIENCIA - BOT
  // ===========================================

  async logCambioEstadoBot(
    conversacionId: string,
    estadoAnterior: string,
    estadoNuevo: string
  ) {
    return this.log({
      tipoEvento: 'bot_state_change',
      conversacionId,
      payload: { estadoAnterior, estadoNuevo },
    });
  }

  async logIntencionClasificada(
    conversacionId: string,
    intencion: string,
    confianza: number,
    keywords: string[]
  ) {
    return this.log({
      tipoEvento: 'bot_intent_classified',
      conversacionId,
      payload: { intencion, confianza, keywords },
    });
  }

  async logDatosCapturados(
    conversacionId: string,
    datos: Record<string, unknown>
  ) {
    return this.log({
      tipoEvento: 'bot_data_captured',
      conversacionId,
      payload: { datos },
    });
  }

  // ===========================================
  // MÉTODOS DE CONVENIENCIA - LEAD
  // ===========================================

  async logLeadCreado(
    conversacionId: string,
    leadId: string,
    datosLead: Record<string, unknown>
  ) {
    return this.log({
      tipoEvento: 'lead_created',
      conversacionId,
      payload: { leadId, datosLead },
    });
  }

  async logLeadVinculado(conversacionId: string, leadId: string) {
    return this.log({
      tipoEvento: 'lead_linked',
      conversacionId,
      payload: { leadId },
    });
  }

  // ===========================================
  // MÉTODOS DE CONVENIENCIA - COMERCIAL
  // ===========================================

  async logBusquedaComercial(
    conversacionId: string,
    nombreBuscado: string,
    encontrado: boolean,
    comercialId?: string
  ) {
    return this.log({
      tipoEvento: 'comercial_searched',
      conversacionId,
      payload: { nombreBuscado, encontrado, comercialId },
    });
  }

  async logComercialAsignado(
    conversacionId: string,
    comercialId: string,
    nombreComercial: string
  ) {
    return this.log({
      tipoEvento: 'comercial_assigned',
      conversacionId,
      payload: { comercialId, nombreComercial },
    });
  }

  async logComercialNotificado(
    conversacionId: string,
    comercialId: string,
    tipoNotificacion: string
  ) {
    return this.log({
      tipoEvento: 'comercial_notified',
      conversacionId,
      payload: { comercialId, tipoNotificacion },
    });
  }

  // ===========================================
  // MÉTODOS DE CONVENIENCIA - INACTIVIDAD
  // ===========================================

  async logRecordatorio1(conversacionId: string) {
    return this.log({
      tipoEvento: 'reminder_1_sent',
      conversacionId,
      payload: { minutosInactivo: 30 },
    });
  }

  async logRecordatorio2(conversacionId: string) {
    return this.log({
      tipoEvento: 'reminder_2_sent',
      conversacionId,
      payload: { minutosInactivo: 60 },
    });
  }

  async logCierreInactividad(conversacionId: string) {
    return this.log({
      tipoEvento: 'inactivity_close',
      conversacionId,
      payload: { minutosInactivo: 120 },
    });
  }

  // ===========================================
  // MÉTODOS DE CONVENIENCIA - SISTEMA
  // ===========================================

  async logWebhookRecibido(payload: Record<string, unknown>) {
    return this.log({
      tipoEvento: 'webhook_received',
      payload: {
        size: JSON.stringify(payload).length,
        entries: (payload.entry as Array<unknown>)?.length || 0,
      },
    });
  }

  async logWebhookError(error: string, payload?: Record<string, unknown>) {
    return this.log({
      tipoEvento: 'webhook_error',
      payload: payload || {},
      error,
    });
  }

  async logApiCall(
    endpoint: string,
    metodo: string,
    success: boolean,
    responseTime?: number
  ) {
    return this.log({
      tipoEvento: 'api_call',
      payload: { endpoint, metodo, success, responseTime },
    });
  }

  async logApiError(
    endpoint: string,
    error: string
  ) {
    return this.log({
      tipoEvento: 'api_error',
      payload: { endpoint },
      error,
    });
  }
}

// Exportar instancia singleton
export const auditLogger = new AuditLogger();

// ===========================================
// FUNCIONES DE CONSULTA DE LOGS
// ===========================================

/**
 * Obtiene logs de una conversación
 */
export async function getLogsConversacion(
  conversacionId: string,
  limit: number = 50
) {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('whatsapp_webhook_log')
    .select('*')
    .eq('conversacion_id', conversacionId)
    .order('creado_en', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[AuditLogger] Error obteniendo logs:', error);
    return [];
  }

  return data || [];
}

/**
 * Obtiene logs por tipo de evento
 */
export async function getLogsPorTipo(
  tipoEvento: EventoTipo,
  limit: number = 100
) {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('whatsapp_webhook_log')
    .select('*')
    .eq('tipo_evento', tipoEvento)
    .order('creado_en', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[AuditLogger] Error obteniendo logs:', error);
    return [];
  }

  return data || [];
}

/**
 * Obtiene estadísticas de eventos
 */
export async function getEstadisticasEventos(
  fechaDesde?: Date,
  fechaHasta?: Date
) {
  const client = getSupabaseServerClient();

  let query = client
    .from('whatsapp_webhook_log')
    .select('tipo_evento');

  if (fechaDesde) {
    query = query.gte('creado_en', fechaDesde.toISOString());
  }

  if (fechaHasta) {
    query = query.lte('creado_en', fechaHasta.toISOString());
  }

  const { data, error } = await query;

  if (error || !data) {
    return {};
  }

  // Contar por tipo
  const estadisticas: Record<string, number> = {};
  for (const row of data) {
    const tipo = row.tipo_evento;
    estadisticas[tipo] = (estadisticas[tipo] || 0) + 1;
  }

  return estadisticas;
}
