/**
 * Motor del Bot de WhatsApp - HU-0012
 *
 * Implementa la máquina de estados del bot y el procesamiento de mensajes entrantes.
 * Este servicio es el core del bot de WhatsApp que gestiona:
 * - Transiciones de estado
 * - Captura de datos del usuario
 * - Envío de respuestas automáticas
 * - Clasificación de intenciones
 */

import type { BotEstado, WhatsAppConversacion } from '../schemas/whatsapp.schema';
import {
  classifyIntent,
  classifyOtherSubtype,
  extractData,
  isMenuResponse,
  type IntentResult,
} from './intent-classifier';

// ===========================================
// TIPOS
// ===========================================

export interface BotContext {
  conversacion: WhatsAppConversacion;
  mensajeEntrante: string;
  tipoMensaje: 'TEXTO' | 'IMAGEN' | 'DOCUMENTO' | 'AUDIO' | 'VIDEO';
  adjuntos?: string[];
}

export interface BotResponse {
  templateCode: string;
  variables: Record<string, string>;
  nuevoEstado: BotEstado;
  datosCapturados?: Record<string, unknown>;
  accionesAdicionales?: BotAction[];
}

export interface BotAction {
  tipo:
    | 'CREAR_NOTIFICACION'
    | 'BUSCAR_COMERCIAL'
    | 'CREAR_CASO'
    | 'ENVIAR_HYPERLINK'
    | 'GUARDAR_ADJUNTO';
  payload: Record<string, unknown>;
}

export interface ProcessResult {
  success: boolean;
  responses: BotResponse[];
  error?: string;
}

// ===========================================
// CONSTANTES
// ===========================================

const TEMPLATE_CODES = {
  BIENVENIDA: 'TPL_A_BIENVENIDA',
  SOLICITAR_ID: 'TPL_A_ID',
  MENU_PRINCIPAL: 'TPL_A_MENU',
  CLIENTE_EXISTENTE: 'TPL_B_EXISTENTE',
  PEDIR_COMERCIAL: 'TPL_C_COMERCIAL',
  COMERCIAL_NOTIFICADO: 'TPL_C_NOTIFICADO',
  PRODUCTO_DETALLE: 'TPL_D_PRODUCTO',
  TIPO_COTIZACION: 'TPL_D_TIPO',
  PEDIR_PROCESO: 'TPL_E_PROCESO',
  ORDENAR_INFO: 'TPL_F_ORDENAR',
  RECORDATORIO_1: 'TPL_G_RECORDATORIO1',
  RECORDATORIO_2: 'TPL_G_RECORDATORIO2',
  CIERRE_INACTIVIDAD: 'TPL_G_CIERRE',
  DUPLICADO: 'TPL_H_DUPLICADO',
  CONFIRMACION: 'TPL_I_CONFIRMACION',
  EMBEDDED_SIGNUP: 'TPL_J_SIGNUP',
  LIMITACION_META: 'TPL_K_LIMITACION',
  ADJUNTO_SIN_CONTEXTO: 'TPL_ADJUNTO',
} as const;

// ===========================================
// MOTOR DEL BOT
// ===========================================

/**
 * Procesa un mensaje entrante y devuelve las respuestas del bot
 */
export function procesarMensaje(context: BotContext): ProcessResult {
  const { conversacion, mensajeEntrante, tipoMensaje, adjuntos } = context;
  const estadoActual = conversacion.estado_bot || 'INICIO';

  try {
    // Si es un adjunto sin texto, manejar caso especial
    if (tipoMensaje !== 'TEXTO' && (!mensajeEntrante || mensajeEntrante.trim() === '')) {
      return handleAdjuntoSinContexto(context);
    }

    // Procesar según el estado actual del bot
    switch (estadoActual) {
      case 'INICIO':
        return handleEstadoInicio(context);

      case 'CAPTURA_NOMBRE':
        return handleCapturaNombre(context);

      case 'CAPTURA_ID':
        return handleCapturaId(context);

      case 'MENU_PRINCIPAL':
        return handleMenuPrincipal(context);

      case 'FLUJO_COTIZACION':
        return handleFlujoCotizacion(context);

      case 'FLUJO_PEDIDO':
        return handleFlujoPedido(context);

      case 'FLUJO_OTRO':
        return handleFlujoOtro(context);

      case 'ADJUNTO_SIN_CONTEXTO':
        return handleContextoAdjunto(context);

      case 'RECORDATORIO_1':
      case 'RECORDATORIO_2':
        // Usuario respondió después de recordatorio, continuar donde estaba
        return handleRespuestaPostRecordatorio(context);

      case 'CONFIRMACION':
        return handleConfirmacion(context);

      case 'CERRADA':
        // Conversación cerrada, reiniciar flujo
        return handleConversacionCerrada(context);

      default:
        return handleEstadoInicio(context);
    }
  } catch (error) {
    console.error('Error procesando mensaje:', error);
    return {
      success: false,
      responses: [],
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// ===========================================
// HANDLERS POR ESTADO
// ===========================================

/**
 * Estado INICIO: Usuario escribe por primera vez o conversación nueva
 */
function handleEstadoInicio(context: BotContext): ProcessResult {
  const { conversacion, mensajeEntrante } = context;
  const datosCapturados = conversacion.datos_capturados || {};

  // Si ya tenemos el nombre del usuario (cliente existente)
  if (conversacion.nombre_contacto || datosCapturados.nombre) {
    return {
      success: true,
      responses: [
        {
          templateCode: TEMPLATE_CODES.CLIENTE_EXISTENTE,
          variables: {},
          nuevoEstado: 'MENU_PRINCIPAL',
        },
        {
          templateCode: TEMPLATE_CODES.MENU_PRINCIPAL,
          variables: {},
          nuevoEstado: 'MENU_PRINCIPAL',
        },
      ],
    };
  }

  // Verificar si el mensaje ya contiene información útil
  const extracted = extractData(mensajeEntrante);

  // Si parece ser un nombre, capturarlo y pedir ID
  if (extracted.possibleName && extracted.possibleName.split(' ').length >= 2) {
    return {
      success: true,
      responses: [
        {
          templateCode: TEMPLATE_CODES.SOLICITAR_ID,
          variables: { nombre: extracted.possibleName },
          nuevoEstado: 'CAPTURA_ID',
          datosCapturados: { nombre: extracted.possibleName },
        },
      ],
    };
  }

  // Enviar bienvenida y pedir nombre
  return {
    success: true,
    responses: [
      {
        templateCode: TEMPLATE_CODES.BIENVENIDA,
        variables: {},
        nuevoEstado: 'CAPTURA_NOMBRE',
      },
    ],
  };
}

/**
 * Estado CAPTURA_NOMBRE: Esperando que el usuario proporcione su nombre
 */
function handleCapturaNombre(context: BotContext): ProcessResult {
  const { mensajeEntrante } = context;
  const extracted = extractData(mensajeEntrante);

  // Validar que sea un nombre válido
  const nombre = extracted.possibleName || mensajeEntrante.trim();

  if (nombre.length < 2 || nombre.length > 100) {
    return {
      success: true,
      responses: [
        {
          templateCode: TEMPLATE_CODES.ORDENAR_INFO,
          variables: {},
          nuevoEstado: 'CAPTURA_NOMBRE', // Mantener estado
        },
      ],
    };
  }

  // Nombre capturado, pedir identificación
  return {
    success: true,
    responses: [
      {
        templateCode: TEMPLATE_CODES.SOLICITAR_ID,
        variables: { nombre },
        nuevoEstado: 'CAPTURA_ID',
        datosCapturados: { nombre },
      },
    ],
  };
}

/**
 * Estado CAPTURA_ID: Esperando número de identificación
 */
function handleCapturaId(context: BotContext): ProcessResult {
  const { mensajeEntrante, conversacion } = context;
  const extracted = extractData(mensajeEntrante);
  const datosCapturados = conversacion.datos_capturados || {};

  // Validar identificación
  const identificacion = extracted.possibleId || mensajeEntrante.replace(/\D/g, '');

  if (identificacion.length < 6 || identificacion.length > 12) {
    return {
      success: true,
      responses: [
        {
          templateCode: TEMPLATE_CODES.ORDENAR_INFO,
          variables: {},
          nuevoEstado: 'CAPTURA_ID', // Mantener estado
        },
      ],
    };
  }

  // ID capturado, mostrar menú principal
  return {
    success: true,
    responses: [
      {
        templateCode: TEMPLATE_CODES.MENU_PRINCIPAL,
        variables: {},
        nuevoEstado: 'MENU_PRINCIPAL',
        datosCapturados: {
          ...datosCapturados,
          identificacion,
        },
      },
    ],
  };
}

/**
 * Estado MENU_PRINCIPAL: Usuario debe elegir opción 1, 2 o 3
 */
function handleMenuPrincipal(context: BotContext): ProcessResult {
  const { mensajeEntrante, conversacion } = context;
  const datosCapturados = conversacion.datos_capturados || {};

  // Verificar si es respuesta directa al menú
  const menuResponse = isMenuResponse(mensajeEntrante);

  if (menuResponse === 'MENU_OPCION_1') {
    // Opción 1: Cotización
    return {
      success: true,
      responses: [
        {
          templateCode: TEMPLATE_CODES.PRODUCTO_DETALLE,
          variables: {},
          nuevoEstado: 'FLUJO_COTIZACION',
          datosCapturados: {
            ...datosCapturados,
            opcion_seleccionada: 'COTIZACION',
          },
        },
      ],
    };
  }

  if (menuResponse === 'MENU_OPCION_2') {
    // Opción 2: Seguimiento de pedido - PEDIR COMERCIAL (CA-8)
    return {
      success: true,
      responses: [
        {
          templateCode: TEMPLATE_CODES.PEDIR_COMERCIAL,
          variables: {},
          nuevoEstado: 'FLUJO_PEDIDO',
          datosCapturados: {
            ...datosCapturados,
            opcion_seleccionada: 'PEDIDO',
          },
        },
      ],
    };
  }

  if (menuResponse === 'MENU_OPCION_3') {
    // Opción 3: Otro motivo - IDENTIFICAR NECESIDAD (CA-9)
    return {
      success: true,
      responses: [
        {
          templateCode: TEMPLATE_CODES.PEDIR_PROCESO,
          variables: {},
          nuevoEstado: 'FLUJO_OTRO',
          datosCapturados: {
            ...datosCapturados,
            opcion_seleccionada: 'OTRO',
          },
        },
      ],
    };
  }

  // No es una opción válida, intentar clasificar por intención
  const intent = classifyIntent(mensajeEntrante);

  if (intent.suggestedFlow) {
    return handleIntentClassification(context, intent);
  }

  // No se pudo clasificar, repetir menú
  return {
    success: true,
    responses: [
      {
        templateCode: TEMPLATE_CODES.MENU_PRINCIPAL,
        variables: {},
        nuevoEstado: 'MENU_PRINCIPAL',
      },
    ],
  };
}

/**
 * Maneja clasificación de intención cuando no es respuesta directa al menú
 */
function handleIntentClassification(context: BotContext, intent: IntentResult): ProcessResult {
  const { conversacion } = context;
  const datosCapturados = conversacion.datos_capturados || {};

  switch (intent.suggestedFlow) {
    case 'FLUJO_COTIZACION':
      return {
        success: true,
        responses: [
          {
            templateCode: TEMPLATE_CODES.PRODUCTO_DETALLE,
            variables: {},
            nuevoEstado: 'FLUJO_COTIZACION',
            datosCapturados: {
              ...datosCapturados,
              opcion_seleccionada: 'COTIZACION',
              intencion_detectada: intent.intent,
              keywords_detectados: intent.matchedKeywords,
            },
          },
        ],
      };

    case 'FLUJO_PEDIDO':
      return {
        success: true,
        responses: [
          {
            templateCode: TEMPLATE_CODES.PEDIR_COMERCIAL,
            variables: {},
            nuevoEstado: 'FLUJO_PEDIDO',
            datosCapturados: {
              ...datosCapturados,
              opcion_seleccionada: 'PEDIDO',
              intencion_detectada: intent.intent,
              keywords_detectados: intent.matchedKeywords,
            },
          },
        ],
      };

    case 'FLUJO_OTRO':
      return {
        success: true,
        responses: [
          {
            templateCode: TEMPLATE_CODES.PEDIR_PROCESO,
            variables: {},
            nuevoEstado: 'FLUJO_OTRO',
            datosCapturados: {
              ...datosCapturados,
              opcion_seleccionada: 'OTRO',
              intencion_detectada: intent.intent,
              keywords_detectados: intent.matchedKeywords,
            },
          },
        ],
      };

    default:
      return {
        success: true,
        responses: [
          {
            templateCode: TEMPLATE_CODES.MENU_PRINCIPAL,
            variables: {},
            nuevoEstado: 'MENU_PRINCIPAL',
          },
        ],
      };
  }
}

/**
 * Estado FLUJO_COTIZACION: Capturando detalles para cotización
 */
function handleFlujoCotizacion(context: BotContext): ProcessResult {
  const { mensajeEntrante, conversacion } = context;
  const datosCapturados = conversacion.datos_capturados || {};

  // Si aún no tenemos el detalle del producto
  if (!datosCapturados.detalle_producto) {
    return {
      success: true,
      responses: [
        {
          templateCode: TEMPLATE_CODES.TIPO_COTIZACION,
          variables: {},
          nuevoEstado: 'FLUJO_COTIZACION',
          datosCapturados: {
            ...datosCapturados,
            detalle_producto: mensajeEntrante,
          },
        },
      ],
    };
  }

  // Ya tenemos producto, preguntar tipo de cotización
  if (!datosCapturados.tipo_cotizacion) {
    const esFormal = mensajeEntrante.toLowerCase().includes('formal') ||
                     mensajeEntrante.toLowerCase().includes('cotización') ||
                     mensajeEntrante.includes('1');

    return {
      success: true,
      responses: [
        {
          templateCode: TEMPLATE_CODES.CONFIRMACION,
          variables: { numero_caso: 'PENDIENTE' }, // Se actualizará al crear el caso
          nuevoEstado: 'CONFIRMACION',
          datosCapturados: {
            ...datosCapturados,
            tipo_cotizacion: esFormal ? 'FORMAL' : 'INFORMAL',
          },
          accionesAdicionales: [
            {
              tipo: 'CREAR_CASO',
              payload: {
                tipo: 'COTIZACION',
                datos: datosCapturados,
              },
            },
          ],
        },
      ],
    };
  }

  // Flujo completado
  return {
    success: true,
    responses: [
      {
        templateCode: TEMPLATE_CODES.CONFIRMACION,
        variables: { numero_caso: String(conversacion.caso_id || 'NUEVO') },
        nuevoEstado: 'CONFIRMACION',
      },
    ],
  };
}

/**
 * Estado FLUJO_PEDIDO: Seguimiento de pedido - PIDE COMERCIAL (CA-8)
 */
function handleFlujoPedido(context: BotContext): ProcessResult {
  const { mensajeEntrante, conversacion } = context;
  const datosCapturados = conversacion.datos_capturados || {};

  // Si aún no tenemos el nombre del comercial
  if (!datosCapturados.nombre_comercial) {
    const nombreComercial = mensajeEntrante.trim();

    return {
      success: true,
      responses: [
        {
          templateCode: TEMPLATE_CODES.COMERCIAL_NOTIFICADO,
          variables: { comercial: nombreComercial },
          nuevoEstado: 'CONFIRMACION',
          datosCapturados: {
            ...datosCapturados,
            nombre_comercial: nombreComercial,
          },
          accionesAdicionales: [
            {
              tipo: 'BUSCAR_COMERCIAL',
              payload: { nombre: nombreComercial },
            },
            {
              tipo: 'CREAR_NOTIFICACION',
              payload: {
                tipo: 'SEGUIMIENTO_PEDIDO',
                titulo: 'Consulta de seguimiento de pedido',
                mensaje: `El cliente ${conversacion.nombre_contacto || 'desconocido'} solicita información sobre su pedido.`,
                comercial: nombreComercial,
              },
            },
          ],
        },
      ],
    };
  }

  // Comercial ya capturado
  return {
    success: true,
    responses: [
      {
        templateCode: TEMPLATE_CODES.CONFIRMACION,
        variables: { numero_caso: String(conversacion.caso_id || 'NUEVO') },
        nuevoEstado: 'CONFIRMACION',
      },
    ],
  };
}

/**
 * Estado FLUJO_OTRO: Soporte, documentos, financiero - IDENTIFICA NECESIDAD (CA-9)
 */
function handleFlujoOtro(context: BotContext): ProcessResult {
  const { mensajeEntrante, conversacion } = context;
  const datosCapturados = conversacion.datos_capturados || {};

  // Clasificar el subtipo de "otro"
  const subtipo = classifyOtherSubtype(mensajeEntrante);

  // Si aún no tenemos el detalle del proceso
  if (!datosCapturados.detalle_proceso) {
    return {
      success: true,
      responses: [
        {
          templateCode: TEMPLATE_CODES.PEDIR_COMERCIAL,
          variables: {},
          nuevoEstado: 'FLUJO_OTRO',
          datosCapturados: {
            ...datosCapturados,
            detalle_proceso: mensajeEntrante,
            subtipo_otro: subtipo,
            area_destino: getAreaDestino(subtipo),
          },
        },
      ],
    };
  }

  // Si no tenemos comercial
  if (!datosCapturados.nombre_comercial) {
    const nombreComercial = mensajeEntrante.trim();

    return {
      success: true,
      responses: [
        {
          templateCode: TEMPLATE_CODES.COMERCIAL_NOTIFICADO,
          variables: { comercial: nombreComercial },
          nuevoEstado: 'CONFIRMACION',
          datosCapturados: {
            ...datosCapturados,
            nombre_comercial: nombreComercial,
          },
          accionesAdicionales: [
            {
              tipo: 'BUSCAR_COMERCIAL',
              payload: { nombre: nombreComercial },
            },
            {
              tipo: 'CREAR_NOTIFICACION',
              payload: {
                tipo: datosCapturados.subtipo_otro || 'OTRO',
                titulo: `Solicitud de ${getAreaDestino(datosCapturados.subtipo_otro as string)}`,
                mensaje: `El cliente ${conversacion.nombre_contacto || 'desconocido'} necesita: ${datosCapturados.detalle_proceso}`,
                comercial: nombreComercial,
              },
            },
          ],
        },
      ],
    };
  }

  return {
    success: true,
    responses: [
      {
        templateCode: TEMPLATE_CODES.CONFIRMACION,
        variables: { numero_caso: String(conversacion.caso_id || 'NUEVO') },
        nuevoEstado: 'CONFIRMACION',
      },
    ],
  };
}

/**
 * Obtiene el área de destino según el subtipo
 */
function getAreaDestino(subtipo: string): string {
  switch (subtipo) {
    case 'SOPORTE':
      return 'Soporte Técnico';
    case 'FINANCIERO':
      return 'Área Financiera';
    case 'DOCUMENTOS':
      return 'Documentación';
    default:
      return 'Atención al Cliente';
  }
}

/**
 * Maneja adjuntos enviados sin contexto (CA-7)
 */
function handleAdjuntoSinContexto(context: BotContext): ProcessResult {
  const { conversacion, adjuntos } = context;
  const datosCapturados = conversacion.datos_capturados || {};
  const adjuntosTemporales = conversacion.adjuntos_temporales || [];

  return {
    success: true,
    responses: [
      {
        templateCode: TEMPLATE_CODES.ADJUNTO_SIN_CONTEXTO,
        variables: {},
        nuevoEstado: 'ADJUNTO_SIN_CONTEXTO',
        datosCapturados: datosCapturados,
        accionesAdicionales: [
          {
            tipo: 'GUARDAR_ADJUNTO',
            payload: {
              adjuntos: [...adjuntosTemporales, ...(adjuntos || [])],
            },
          },
        ],
      },
    ],
  };
}

/**
 * Maneja respuesta cuando se pidió contexto de adjunto
 */
function handleContextoAdjunto(context: BotContext): ProcessResult {
  const { mensajeEntrante, conversacion } = context;
  const datosCapturados = conversacion.datos_capturados || {};

  // Clasificar la intención del contexto proporcionado
  const intent = classifyIntent(mensajeEntrante);

  if (intent.suggestedFlow) {
    return handleIntentClassification(
      {
        ...context,
        conversacion: {
          ...conversacion,
          datos_capturados: {
            ...datosCapturados,
            contexto_adjunto: mensajeEntrante,
          },
        },
      },
      intent
    );
  }

  // Si no se puede clasificar, ir al menú
  return {
    success: true,
    responses: [
      {
        templateCode: TEMPLATE_CODES.MENU_PRINCIPAL,
        variables: {},
        nuevoEstado: 'MENU_PRINCIPAL',
        datosCapturados: {
          ...datosCapturados,
          contexto_adjunto: mensajeEntrante,
        },
      },
    ],
  };
}

/**
 * Maneja respuesta después de recordatorio
 */
function handleRespuestaPostRecordatorio(context: BotContext): ProcessResult {
  // El usuario respondió después de un recordatorio, continuar con el menú
  return {
    success: true,
    responses: [
      {
        templateCode: TEMPLATE_CODES.MENU_PRINCIPAL,
        variables: {},
        nuevoEstado: 'MENU_PRINCIPAL',
      },
    ],
  };
}

/**
 * Maneja estado de confirmación
 */
function handleConfirmacion(context: BotContext): ProcessResult {
  const { mensajeEntrante, conversacion } = context;

  // Si el usuario escribe algo nuevo, preguntar si necesita algo más
  const intent = classifyIntent(mensajeEntrante);

  if (intent.intent !== 'DESCONOCIDO' && intent.intent !== 'SALUDO') {
    // Nueva solicitud, redirigir al flujo apropiado
    return handleIntentClassification(context, intent);
  }

  // Conversación terminada
  return {
    success: true,
    responses: [
      {
        templateCode: TEMPLATE_CODES.MENU_PRINCIPAL,
        variables: {},
        nuevoEstado: 'MENU_PRINCIPAL',
      },
    ],
  };
}

/**
 * Maneja conversación cerrada que se reabre
 */
function handleConversacionCerrada(context: BotContext): ProcessResult {
  // Usuario escribe a conversación cerrada, reabrir
  return handleEstadoInicio({
    ...context,
    conversacion: {
      ...context.conversacion,
      estado_bot: 'INICIO',
    },
  });
}

// ===========================================
// FUNCIONES DE RECORDATORIO (CA-7)
// ===========================================

/**
 * Genera respuesta de recordatorio 1
 */
export function generarRecordatorio1(): BotResponse {
  return {
    templateCode: TEMPLATE_CODES.RECORDATORIO_1,
    variables: {},
    nuevoEstado: 'RECORDATORIO_1',
  };
}

/**
 * Genera respuesta de recordatorio 2
 */
export function generarRecordatorio2(): BotResponse {
  return {
    templateCode: TEMPLATE_CODES.RECORDATORIO_2,
    variables: {},
    nuevoEstado: 'RECORDATORIO_2',
  };
}

/**
 * Genera respuesta de cierre por inactividad
 */
export function generarCierreInactividad(): BotResponse {
  return {
    templateCode: TEMPLATE_CODES.CIERRE_INACTIVIDAD,
    variables: {},
    nuevoEstado: 'CERRADA',
  };
}

// ===========================================
// FUNCIONES DE DUPLICADOS (CA-7)
// ===========================================

/**
 * Genera respuesta para conversación duplicada
 */
export function generarRespuestaDuplicado(numeroCaso: string): BotResponse {
  return {
    templateCode: TEMPLATE_CODES.DUPLICADO,
    variables: { numero_caso: numeroCaso },
    nuevoEstado: 'MENU_PRINCIPAL',
  };
}

// ===========================================
// FUNCIONES DE HYPERLINK (CA-11)
// ===========================================

/**
 * Genera hyperlink para número de WhatsApp
 */
export function generarHyperlink(telefono: string): string {
  // Limpiar teléfono
  const telefonoLimpio = telefono.replace(/\D/g, '');
  return `https://wa.me/${telefonoLimpio}`;
}

/**
 * Genera respuesta con advertencia de hyperlink
 */
export function generarRespuestaHyperlink(telefono: string): BotResponse {
  return {
    templateCode: TEMPLATE_CODES.LIMITACION_META,
    variables: { hyperlink: generarHyperlink(telefono) },
    nuevoEstado: 'CONFIRMACION',
  };
}
