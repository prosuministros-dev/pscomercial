/**
 * Servicios del Módulo WhatsApp - HU-0012
 *
 * IMPORTANTE: Este archivo solo debe importarse en código de servidor.
 * Todos los servicios aquí son server-only.
 */

// Intent Classifier - Clasificación de intención por palabras clave
export {
  classifyIntent,
  classifyOtherSubtype,
  extractData,
  isMenuResponse,
  isOrderTracking,
  isOtherRequest,
  isQuotationRequest,
  type IntentResult,
  type IntentType,
} from './intent-classifier';

// Bot Engine - Motor del bot y máquina de estados
export {
  generarCierreInactividad,
  generarHyperlink,
  generarRecordatorio1,
  generarRecordatorio2,
  generarRespuestaDuplicado,
  generarRespuestaHyperlink,
  procesarMensaje,
  type BotAction,
  type BotContext,
  type BotResponse,
  type ProcessResult,
} from './bot-engine';

// Bot Processor - Procesador que integra bot con BD
export {
  procesarConversacionesInactivas,
  procesarMensajeEntrante,
  verificarDuplicado,
  type MensajeEntrante,
  type ProcessingResult,
} from './bot-processor';

// Meta API Service - Envío de mensajes vía Meta Cloud API
export {
  downloadMedia,
  markAsRead,
  metaApiService,
  sendInteractiveButtons,
  sendTemplate,
  sendTextMessage,
  type MediaUploadResponse,
  type SendMessageRequest,
  type SendMessageResponse,
  type TemplateComponent,
  type TemplateParameter,
} from './meta-api.service';

// Comercial Finder - Búsqueda de comerciales y notificaciones
export {
  buscarComercialPorNombre,
  notificarComercial,
  notificarSeguimientoPedido,
  notificarSolicitudCotizacion,
  notificarSolicitudGeneral,
  obtenerComercialPorId,
  obtenerComercialesActivos,
  type BusquedaResult,
  type Comercial,
} from './comercial-finder';

// Audit Logger - Bitácora de todas las acciones
export {
  auditLogger,
  getEstadisticasEventos,
  getLogsConversacion,
  getLogsPorTipo,
  type AuditLogEntry,
  type EventoTipo,
} from './audit-logger';
