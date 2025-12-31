/**
 * Procesador de Mensajes del Bot - HU-0012
 *
 * Integra el motor del bot con las acciones de la base de datos.
 * Este servicio orquesta el procesamiento completo de mensajes entrantes.
 */

import 'server-only';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type { BotEstado, WhatsAppConversacion } from '../schemas/whatsapp.schema';
import { getConversacionByTelefono, getTemplateByCodigo } from '../queries/whatsapp.api';
import {
  procesarMensaje,
  generarRecordatorio1,
  generarRecordatorio2,
  generarCierreInactividad,
  generarRespuestaDuplicado,
  type BotContext,
  type BotResponse,
  type BotAction,
} from './bot-engine';

// ===========================================
// TIPOS
// ===========================================

export interface MensajeEntrante {
  telefono: string;
  contenido: string;
  tipo: 'TEXTO' | 'IMAGEN' | 'DOCUMENTO' | 'AUDIO' | 'VIDEO';
  adjuntos?: string[];
  metaMessageId?: string;
}

export interface ProcessingResult {
  success: boolean;
  conversacionId: string;
  mensajesEnviados: number;
  error?: string;
}

// ===========================================
// PROCESADOR PRINCIPAL
// ===========================================

/**
 * Procesa un mensaje entrante de WhatsApp
 * Esta es la función principal que se llama desde el webhook
 */
export async function procesarMensajeEntrante(
  mensaje: MensajeEntrante
): Promise<ProcessingResult> {
  const client = getSupabaseServerClient();

  try {
    // 1. Buscar o crear conversación
    let conversacion = await getConversacionByTelefono(mensaje.telefono);
    let isNueva = false;

    if (!conversacion) {
      // Crear nueva conversación
      const { data, error } = await client
        .from('whatsapp_conversaciones')
        .insert({
          telefono_cliente: mensaje.telefono,
          estado: 'ACTIVA',
          estado_bot: 'INICIO',
        })
        .select()
        .single();

      if (error) throw new Error(`Error creando conversación: ${error.message}`);

      conversacion = data as WhatsAppConversacion;
      isNueva = true;
    }

    // 2. Guardar mensaje entrante en BD
    const { data: mensajeGuardado, error: msgError } = await client
      .from('whatsapp_mensajes')
      .insert({
        conversacion_id: conversacion.id,
        direccion: 'ENTRANTE',
        remitente: 'USUARIO',
        tipo: mensaje.tipo,
        contenido: mensaje.contenido,
        adjuntos: mensaje.adjuntos || [],
        mensaje_meta_id: mensaje.metaMessageId,
      })
      .select()
      .single();

    if (msgError) throw new Error(`Error guardando mensaje: ${msgError.message}`);

    // 3. Preparar contexto para el bot
    const context: BotContext = {
      conversacion,
      mensajeEntrante: mensaje.contenido,
      tipoMensaje: mensaje.tipo,
      adjuntos: mensaje.adjuntos,
    };

    // 4. Procesar con el motor del bot
    const resultado = procesarMensaje(context);

    if (!resultado.success) {
      throw new Error(resultado.error || 'Error procesando mensaje');
    }

    // 5. Ejecutar respuestas y acciones
    let mensajesEnviados = 0;

    for (const response of resultado.responses) {
      // Enviar mensaje de respuesta
      await enviarRespuestaBot(conversacion.id, response);
      mensajesEnviados++;

      // Actualizar estado de la conversación
      await actualizarEstadoConversacion(
        conversacion.id,
        response.nuevoEstado,
        response.datosCapturados
      );

      // Ejecutar acciones adicionales
      if (response.accionesAdicionales) {
        for (const accion of response.accionesAdicionales) {
          await ejecutarAccion(conversacion.id, accion);
        }
      }
    }

    // 6. Registrar en bitácora (CA-12)
    await registrarEnBitacora(conversacion.id, mensajeGuardado.id, 'message_received', {
      telefono: mensaje.telefono,
      tipo: mensaje.tipo,
      respuestas_enviadas: mensajesEnviados,
    });

    return {
      success: true,
      conversacionId: conversacion.id,
      mensajesEnviados,
    };

  } catch (error) {
    console.error('Error procesando mensaje entrante:', error);
    return {
      success: false,
      conversacionId: '',
      mensajesEnviados: 0,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// ===========================================
// FUNCIONES AUXILIARES
// ===========================================

/**
 * Envía una respuesta del bot a la conversación
 */
async function enviarRespuestaBot(
  conversacionId: string,
  response: BotResponse
): Promise<void> {
  const client = getSupabaseServerClient();

  // Obtener template
  const template = await getTemplateByCodigo(response.templateCode);
  if (!template) {
    console.warn(`Template no encontrado: ${response.templateCode}`);
    return;
  }

  // Reemplazar variables
  let contenido = template.contenido;
  for (const [key, value] of Object.entries(response.variables)) {
    contenido = contenido.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }

  // Guardar mensaje saliente
  await client.from('whatsapp_mensajes').insert({
    conversacion_id: conversacionId,
    direccion: 'SALIENTE',
    remitente: 'BOT',
    tipo: 'TEMPLATE',
    contenido,
  });

  // TODO: Enviar vía Meta API cuando esté integrado
  // await metaApiService.sendMessage(telefono, contenido);
}

/**
 * Actualiza el estado de la conversación
 */
async function actualizarEstadoConversacion(
  conversacionId: string,
  nuevoEstado: BotEstado,
  datosCapturados?: Record<string, unknown>
): Promise<void> {
  const client = getSupabaseServerClient();

  const updateData: Record<string, unknown> = {
    estado_bot: nuevoEstado,
  };

  // Si hay datos capturados, actualizarlos (merge con existentes)
  if (datosCapturados) {
    // Obtener datos actuales
    const { data: conv } = await client
      .from('whatsapp_conversaciones')
      .select('datos_capturados, nombre_contacto, identificacion')
      .eq('id', conversacionId)
      .single();

    const datosExistentes = (conv?.datos_capturados as Record<string, unknown>) || {};
    updateData.datos_capturados = { ...datosExistentes, ...datosCapturados };

    // Actualizar campos directos si vienen en los datos
    if (datosCapturados.nombre && !conv?.nombre_contacto) {
      updateData.nombre_contacto = datosCapturados.nombre;
    }
    if (datosCapturados.identificacion && !conv?.identificacion) {
      updateData.identificacion = datosCapturados.identificacion;
    }
  }

  // Si el estado es CERRADA, marcar fecha de cierre
  if (nuevoEstado === 'CERRADA') {
    updateData.estado = 'CERRADA';
    updateData.cerrado_en = new Date().toISOString();
  }

  await client
    .from('whatsapp_conversaciones')
    .update(updateData)
    .eq('id', conversacionId);
}

/**
 * Ejecuta una acción adicional del bot
 */
async function ejecutarAccion(
  conversacionId: string,
  accion: BotAction
): Promise<void> {
  const client = getSupabaseServerClient();

  switch (accion.tipo) {
    case 'CREAR_NOTIFICACION':
      await crearNotificacionInternal(accion.payload);
      break;

    case 'BUSCAR_COMERCIAL':
      await buscarComercialYNotificar(conversacionId, accion.payload);
      break;

    case 'CREAR_CASO':
      await crearCasoInterno(conversacionId, accion.payload);
      break;

    case 'GUARDAR_ADJUNTO':
      await guardarAdjuntosTemporales(conversacionId, accion.payload.adjuntos as string[]);
      break;

    case 'ENVIAR_HYPERLINK':
      // El hyperlink ya se incluye en el template
      break;

    default:
      console.warn(`Acción desconocida: ${accion.tipo}`);
  }
}

/**
 * Crea una notificación interna (CA-10)
 */
async function crearNotificacionInternal(
  payload: Record<string, unknown>
): Promise<void> {
  const client = getSupabaseServerClient();

  // Buscar el usuario comercial por nombre
  const nombreComercial = payload.comercial as string;
  const { data: usuarios } = await client
    .from('usuarios')
    .select('id')
    .ilike('nombre_completo', `%${nombreComercial}%`)
    .limit(1);

  if (usuarios && usuarios.length > 0) {
    await client.from('notificaciones').insert({
      usuario_id: usuarios[0].id,
      tipo: payload.tipo as string,
      titulo: payload.titulo as string,
      mensaje: payload.mensaje as string,
      referencia_tipo: 'CONVERSACION_WHATSAPP',
    });
  }
}

/**
 * Busca un comercial por nombre y crea notificación (CA-8, CA-10)
 */
async function buscarComercialYNotificar(
  conversacionId: string,
  payload: Record<string, unknown>
): Promise<void> {
  const client = getSupabaseServerClient();
  const nombreComercial = payload.nombre as string;

  // Buscar comercial
  const { data: usuarios } = await client
    .from('usuarios')
    .select('id, nombre_completo')
    .ilike('nombre_completo', `%${nombreComercial}%`)
    .limit(1);

  if (usuarios && usuarios.length > 0) {
    const comercial = usuarios[0];

    // Actualizar conversación con asesor asignado
    await client
      .from('whatsapp_conversaciones')
      .update({
        asesor_asignado_id: comercial.id,
        asignado_en: new Date().toISOString(),
      })
      .eq('id', conversacionId);

    // Actualizar datos capturados con info del comercial
    const { data: conv } = await client
      .from('whatsapp_conversaciones')
      .select('datos_capturados')
      .eq('id', conversacionId)
      .single();

    const datosExistentes = (conv?.datos_capturados as Record<string, unknown>) || {};
    await client
      .from('whatsapp_conversaciones')
      .update({
        datos_capturados: {
          ...datosExistentes,
          comercial_encontrado: true,
          comercial_id: comercial.id,
          comercial_nombre: comercial.nombre_completo,
        },
      })
      .eq('id', conversacionId);
  }
}

/**
 * Crea un caso interno en el sistema
 */
async function crearCasoInterno(
  conversacionId: string,
  payload: Record<string, unknown>
): Promise<void> {
  // Por ahora, solo actualizamos el caso_id en la conversación
  // La creación real del caso depende del módulo de casos del sistema
  const client = getSupabaseServerClient();

  // Generar ID temporal de caso
  const casoId = `CASO-WA-${Date.now()}`;

  await client
    .from('whatsapp_conversaciones')
    .update({
      caso_id: casoId,
    })
    .eq('id', conversacionId);
}

/**
 * Guarda adjuntos temporales en la conversación (CA-7)
 */
async function guardarAdjuntosTemporales(
  conversacionId: string,
  adjuntos: string[]
): Promise<void> {
  const client = getSupabaseServerClient();

  // Obtener adjuntos existentes
  const { data: conv } = await client
    .from('whatsapp_conversaciones')
    .select('adjuntos_temporales')
    .eq('id', conversacionId)
    .single();

  const existentes = (conv?.adjuntos_temporales as string[]) || [];
  const nuevosAdjuntos = [...existentes, ...adjuntos];

  await client
    .from('whatsapp_conversaciones')
    .update({ adjuntos_temporales: nuevosAdjuntos })
    .eq('id', conversacionId);
}

/**
 * Registra evento en la bitácora (CA-12)
 */
async function registrarEnBitacora(
  conversacionId: string,
  mensajeId: string,
  tipoEvento: string,
  payload: Record<string, unknown>
): Promise<void> {
  const client = getSupabaseServerClient();

  await client.from('whatsapp_webhook_log').insert({
    tipo_evento: tipoEvento,
    payload,
    procesado: true,
    procesado_en: new Date().toISOString(),
    conversacion_id: conversacionId,
    mensaje_id: mensajeId,
  });
}

// ===========================================
// FUNCIONES DE INACTIVIDAD (CA-7)
// ===========================================

/**
 * Procesa conversaciones inactivas y envía recordatorios
 * Esta función se llama desde un cron job
 */
export async function procesarConversacionesInactivas(): Promise<{
  recordatorios1: number;
  recordatorios2: number;
  cierres: number;
}> {
  const client = getSupabaseServerClient();
  const ahora = new Date();

  let recordatorios1 = 0;
  let recordatorios2 = 0;
  let cierres = 0;

  // Obtener conversaciones activas
  const { data: conversaciones } = await client
    .from('whatsapp_conversaciones')
    .select('*')
    .eq('estado', 'ACTIVA')
    .not('estado_bot', 'eq', 'CERRADA');

  if (!conversaciones) return { recordatorios1, recordatorios2, cierres };

  for (const conv of conversaciones) {
    const ultimoMensaje = conv.ultimo_mensaje_usuario_en
      ? new Date(conv.ultimo_mensaje_usuario_en)
      : new Date(conv.creado_en);

    const minutosInactivo = (ahora.getTime() - ultimoMensaje.getTime()) / (1000 * 60);

    // Cierre automático: 2 horas sin respuesta
    if (minutosInactivo >= 120 && conv.recordatorio_2_enviado) {
      const response = generarCierreInactividad();
      await enviarRespuestaBot(conv.id, response);
      await actualizarEstadoConversacion(conv.id, 'CERRADA');
      await client
        .from('whatsapp_conversaciones')
        .update({ estado: 'INCOMPLETA' })
        .eq('id', conv.id);
      cierres++;
      continue;
    }

    // Recordatorio 2: 1 hora sin respuesta
    if (minutosInactivo >= 60 && conv.recordatorio_1_enviado && !conv.recordatorio_2_enviado) {
      const response = generarRecordatorio2();
      await enviarRespuestaBot(conv.id, response);
      await client
        .from('whatsapp_conversaciones')
        .update({ recordatorio_2_enviado: true })
        .eq('id', conv.id);
      recordatorios2++;
      continue;
    }

    // Recordatorio 1: 30 minutos sin respuesta
    if (minutosInactivo >= 30 && !conv.recordatorio_1_enviado) {
      const response = generarRecordatorio1();
      await enviarRespuestaBot(conv.id, response);
      await client
        .from('whatsapp_conversaciones')
        .update({ recordatorio_1_enviado: true })
        .eq('id', conv.id);
      recordatorios1++;
    }
  }

  return { recordatorios1, recordatorios2, cierres };
}

// ===========================================
// FUNCIONES DE DUPLICADOS (CA-7)
// ===========================================

/**
 * Verifica si hay una conversación duplicada activa
 */
export async function verificarDuplicado(
  telefono: string
): Promise<{ isDuplicate: boolean; conversacion?: WhatsAppConversacion }> {
  const conversacion = await getConversacionByTelefono(telefono);

  if (conversacion && conversacion.estado === 'ACTIVA') {
    return { isDuplicate: true, conversacion };
  }

  return { isDuplicate: false };
}
