/**
 * Webhook de WhatsApp - HU-0012
 *
 * Endpoint para recibir mensajes de Meta Cloud API
 * Maneja verificación de webhook y procesamiento de mensajes entrantes
 */

import { NextRequest, NextResponse } from 'next/server';

import {
  procesarMensajeEntrante,
  type MensajeEntrante,
} from '~/lib/whatsapp/services/bot-processor';

// ===========================================
// CONFIGURACIÓN
// ===========================================

// Token de verificación del webhook (debe coincidir con el configurado en Meta)
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'prosuministros_webhook_verify_2024';

// ===========================================
// GET: Verificación del Webhook
// ===========================================

/**
 * Maneja la verificación del webhook de Meta
 * Meta envía un GET con hub.mode, hub.verify_token y hub.challenge
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Verificar que sea una solicitud de verificación válida
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[WhatsApp Webhook] Verificación exitosa');
    // Devolver el challenge para completar la verificación
    return new NextResponse(challenge, { status: 200 });
  }

  console.warn('[WhatsApp Webhook] Verificación fallida - Token inválido');
  return NextResponse.json({ error: 'Verificación fallida' }, { status: 403 });
}

// ===========================================
// POST: Recepción de Mensajes
// ===========================================

/**
 * Maneja los mensajes entrantes de WhatsApp
 * Meta envía un POST con el payload de los mensajes
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log del webhook (en producción, considerar reducir verbosidad)
    console.log('[WhatsApp Webhook] Payload recibido:', JSON.stringify(body, null, 2));

    // Validar estructura del payload
    if (!body.object || body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
    }

    // Procesar cada entrada
    const entries = body.entry || [];

    for (const entry of entries) {
      const changes = entry.changes || [];

      for (const change of changes) {
        if (change.field !== 'messages') continue;

        const value = change.value;
        const messages = value.messages || [];
        const contacts = value.contacts || [];

        // Procesar cada mensaje
        for (const message of messages) {
          await procesarMensajeWebhook(message, contacts, value.metadata);
        }

        // Procesar estados de mensajes (entregas, lecturas)
        const statuses = value.statuses || [];
        for (const status of statuses) {
          await procesarStatusWebhook(status);
        }
      }
    }

    // Meta espera una respuesta 200 rápida
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('[WhatsApp Webhook] Error procesando webhook:', error);
    // Devolver 200 de todas formas para que Meta no reintente
    return NextResponse.json({ received: true }, { status: 200 });
  }
}

// ===========================================
// PROCESAMIENTO DE MENSAJES
// ===========================================

interface WhatsAppMessage {
  id: string;
  from: string;
  timestamp: string;
  type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'sticker' | 'location' | 'contacts' | 'button' | 'interactive';
  text?: { body: string };
  image?: { id: string; caption?: string; mime_type: string };
  document?: { id: string; caption?: string; filename: string; mime_type: string };
  audio?: { id: string; mime_type: string };
  video?: { id: string; caption?: string; mime_type: string };
  button?: { text: string; payload: string };
  interactive?: { type: string; button_reply?: { id: string; title: string }; list_reply?: { id: string; title: string } };
}

interface WhatsAppContact {
  profile: { name: string };
  wa_id: string;
}

interface WhatsAppMetadata {
  display_phone_number: string;
  phone_number_id: string;
}

/**
 * Procesa un mensaje individual del webhook
 */
async function procesarMensajeWebhook(
  message: WhatsAppMessage,
  contacts: WhatsAppContact[],
  metadata: WhatsAppMetadata
): Promise<void> {
  // Extraer información del mensaje
  const telefono = message.from;
  const contact = contacts.find(c => c.wa_id === telefono);
  const nombreContacto = contact?.profile?.name || '';

  // Determinar tipo y contenido
  let tipo: MensajeEntrante['tipo'] = 'TEXTO';
  let contenido = '';
  let adjuntos: string[] = [];

  switch (message.type) {
    case 'text':
      tipo = 'TEXTO';
      contenido = message.text?.body || '';
      break;

    case 'image':
      tipo = 'IMAGEN';
      contenido = message.image?.caption || '';
      adjuntos = [message.image?.id || ''];
      break;

    case 'document':
      tipo = 'DOCUMENTO';
      contenido = message.document?.caption || message.document?.filename || '';
      adjuntos = [message.document?.id || ''];
      break;

    case 'audio':
      tipo = 'AUDIO';
      contenido = '[Audio recibido]';
      adjuntos = [message.audio?.id || ''];
      break;

    case 'video':
      tipo = 'VIDEO';
      contenido = message.video?.caption || '[Video recibido]';
      adjuntos = [message.video?.id || ''];
      break;

    case 'button':
      tipo = 'TEXTO';
      contenido = message.button?.text || message.button?.payload || '';
      break;

    case 'interactive':
      tipo = 'TEXTO';
      if (message.interactive?.button_reply) {
        contenido = message.interactive.button_reply.title || message.interactive.button_reply.id;
      } else if (message.interactive?.list_reply) {
        contenido = message.interactive.list_reply.title || message.interactive.list_reply.id;
      }
      break;

    default:
      tipo = 'TEXTO';
      contenido = `[${message.type} no soportado]`;
  }

  // Procesar el mensaje
  const mensajeEntrante: MensajeEntrante = {
    telefono: formatearTelefono(telefono),
    contenido,
    tipo,
    adjuntos: adjuntos.length > 0 ? adjuntos : undefined,
    metaMessageId: message.id,
  };

  console.log('[WhatsApp Webhook] Procesando mensaje:', {
    telefono: mensajeEntrante.telefono,
    tipo: mensajeEntrante.tipo,
    contenido: mensajeEntrante.contenido.substring(0, 50),
    nombreContacto,
  });

  // Procesar con el motor del bot
  const resultado = await procesarMensajeEntrante(mensajeEntrante);

  if (!resultado.success) {
    console.error('[WhatsApp Webhook] Error procesando mensaje:', resultado.error);
  } else {
    console.log('[WhatsApp Webhook] Mensaje procesado:', {
      conversacionId: resultado.conversacionId,
      mensajesEnviados: resultado.mensajesEnviados,
    });
  }
}

/**
 * Procesa actualizaciones de estado de mensajes
 */
async function procesarStatusWebhook(status: {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  errors?: Array<{ code: number; title: string }>;
}): Promise<void> {
  console.log('[WhatsApp Webhook] Status de mensaje:', {
    id: status.id,
    status: status.status,
    recipient: status.recipient_id,
    errors: status.errors,
  });

  // TODO: Actualizar estado del mensaje en BD si es necesario
  // Por ahora solo loggeamos el status
}

// ===========================================
// UTILIDADES
// ===========================================

/**
 * Formatea el teléfono al formato estándar
 */
function formatearTelefono(telefono: string): string {
  // Asegurar que tenga el prefijo +
  if (!telefono.startsWith('+')) {
    return `+${telefono}`;
  }
  return telefono;
}
