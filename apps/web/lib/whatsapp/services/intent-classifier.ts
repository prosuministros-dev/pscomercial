/**
 * Clasificador de Intención para WhatsApp Bot - HU-0012
 *
 * Detecta la intención del usuario basándose en palabras clave
 * para clasificar mensajes en categorías: COTIZACION, PEDIDO, SOPORTE, FINANCIERO, DOCUMENTOS
 */

// ===========================================
// TIPOS
// ===========================================

export type IntentType =
  | 'COTIZACION'      // Opción 1: Solicitar cotización
  | 'PEDIDO'          // Opción 2: Seguimiento de pedido
  | 'SOPORTE'         // Opción 3: Soporte técnico
  | 'FINANCIERO'      // Opción 3: Área financiera
  | 'DOCUMENTOS'      // Opción 3: Documentos
  | 'MENU_OPCION_1'   // Respuesta directa "1"
  | 'MENU_OPCION_2'   // Respuesta directa "2"
  | 'MENU_OPCION_3'   // Respuesta directa "3"
  | 'SALUDO'          // Saludo inicial
  | 'DESCONOCIDO';    // No se pudo clasificar

export interface IntentResult {
  intent: IntentType;
  confidence: number; // 0-1
  matchedKeywords: string[];
  suggestedFlow: 'FLUJO_COTIZACION' | 'FLUJO_PEDIDO' | 'FLUJO_OTRO' | null;
}

// ===========================================
// DICCIONARIO DE PALABRAS CLAVE
// ===========================================

const KEYWORDS: Record<IntentType, string[]> = {
  COTIZACION: [
    'cotización', 'cotizacion', 'cotizar',
    'precio', 'precios', 'presupuesto',
    'información', 'informacion', 'info',
    'cuánto', 'cuanto', 'cuesta', 'costar',
    'productos', 'producto', 'catálogo', 'catalogo',
    'comprar', 'adquirir', 'necesito',
    'proforma', 'oferta', 'propuesta',
  ],
  PEDIDO: [
    'pedido', 'orden', 'compra',
    'estado', 'seguimiento', 'rastreo', 'tracking',
    'envío', 'envio', 'entrega', 'despacho',
    'llegó', 'llego', 'llegar', 'llegando',
    'cuándo', 'cuando', 'dónde', 'donde',
    'número de pedido', 'numero de pedido',
    'factura', 'guía', 'guia',
  ],
  SOPORTE: [
    'soporte', 'ayuda', 'asistencia',
    'problema', 'error', 'falla', 'fallo',
    'no funciona', 'dañado', 'dañada', 'daño',
    'roto', 'rota', 'defecto', 'defectuoso',
    'reparar', 'reparación', 'garantía', 'garantia',
    'técnico', 'tecnico', 'servicio técnico',
    'incidente', 'incidencia', 'urgente',
  ],
  FINANCIERO: [
    'factura', 'facturación', 'facturacion',
    'pago', 'pagos', 'abono', 'cuota',
    'cartera', 'deuda', 'saldo',
    'crédito', 'credito', 'financiar',
    'estado de cuenta', 'extracto',
    'recibo', 'comprobante',
    'contabilidad', 'contador',
  ],
  DOCUMENTOS: [
    'documento', 'documentos', 'documentación',
    'certificado', 'certificación', 'constancia',
    'rut', 'cámara de comercio', 'camara de comercio',
    'referencia comercial', 'referencias',
    'contrato', 'acuerdo', 'convenio',
    'carta', 'formato', 'formulario',
  ],
  MENU_OPCION_1: ['1', 'uno', 'opción 1', 'opcion 1', 'primera'],
  MENU_OPCION_2: ['2', 'dos', 'opción 2', 'opcion 2', 'segunda'],
  MENU_OPCION_3: ['3', 'tres', 'opción 3', 'opcion 3', 'tercera', 'otro', 'otra', 'otros'],
  SALUDO: [
    'hola', 'buenos días', 'buenos dias', 'buenas tardes', 'buenas noches',
    'buen día', 'buen dia', 'saludos', 'hey', 'hi',
  ],
  DESCONOCIDO: [],
};

// Mapeo de intención a flujo del bot
const INTENT_TO_FLOW: Record<IntentType, IntentResult['suggestedFlow']> = {
  COTIZACION: 'FLUJO_COTIZACION',
  PEDIDO: 'FLUJO_PEDIDO',
  SOPORTE: 'FLUJO_OTRO',
  FINANCIERO: 'FLUJO_OTRO',
  DOCUMENTOS: 'FLUJO_OTRO',
  MENU_OPCION_1: 'FLUJO_COTIZACION',
  MENU_OPCION_2: 'FLUJO_PEDIDO',
  MENU_OPCION_3: 'FLUJO_OTRO',
  SALUDO: null,
  DESCONOCIDO: null,
};

// ===========================================
// FUNCIONES DE CLASIFICACIÓN
// ===========================================

/**
 * Normaliza texto para comparación
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^\w\s]/g, ' ')        // Remover puntuación
    .replace(/\s+/g, ' ')            // Normalizar espacios
    .trim();
}

/**
 * Verifica si el mensaje es una respuesta directa al menú (1, 2, 3)
 */
export function isMenuResponse(message: string): IntentType | null {
  const trimmed = message.trim();

  // Respuesta exacta "1", "2", "3"
  if (trimmed === '1' || trimmed === '1️⃣') return 'MENU_OPCION_1';
  if (trimmed === '2' || trimmed === '2️⃣') return 'MENU_OPCION_2';
  if (trimmed === '3' || trimmed === '3️⃣') return 'MENU_OPCION_3';

  const normalized = normalizeText(trimmed);

  // Variaciones comunes
  if (normalized === 'uno' || normalized === 'opcion 1' || normalized === 'primera opcion') {
    return 'MENU_OPCION_1';
  }
  if (normalized === 'dos' || normalized === 'opcion 2' || normalized === 'segunda opcion') {
    return 'MENU_OPCION_2';
  }
  if (normalized === 'tres' || normalized === 'opcion 3' || normalized === 'tercera opcion' ||
      normalized === 'otro' || normalized === 'otros' || normalized === 'otra') {
    return 'MENU_OPCION_3';
  }

  return null;
}

/**
 * Clasifica la intención del mensaje basándose en palabras clave
 */
export function classifyIntent(message: string): IntentResult {
  const normalized = normalizeText(message);
  const words = normalized.split(' ');

  // Primero verificar si es respuesta directa al menú
  const menuResponse = isMenuResponse(message);
  if (menuResponse) {
    return {
      intent: menuResponse,
      confidence: 1.0,
      matchedKeywords: [message.trim()],
      suggestedFlow: INTENT_TO_FLOW[menuResponse],
    };
  }

  // Calcular coincidencias por cada tipo de intención
  const scores: Record<IntentType, { count: number; keywords: string[] }> = {
    COTIZACION: { count: 0, keywords: [] },
    PEDIDO: { count: 0, keywords: [] },
    SOPORTE: { count: 0, keywords: [] },
    FINANCIERO: { count: 0, keywords: [] },
    DOCUMENTOS: { count: 0, keywords: [] },
    MENU_OPCION_1: { count: 0, keywords: [] },
    MENU_OPCION_2: { count: 0, keywords: [] },
    MENU_OPCION_3: { count: 0, keywords: [] },
    SALUDO: { count: 0, keywords: [] },
    DESCONOCIDO: { count: 0, keywords: [] },
  };

  // Buscar coincidencias
  for (const [intentType, keywords] of Object.entries(KEYWORDS)) {
    for (const keyword of keywords) {
      const normalizedKeyword = normalizeText(keyword);

      // Buscar coincidencia exacta de palabra o frase
      if (normalized.includes(normalizedKeyword)) {
        scores[intentType as IntentType].count++;
        scores[intentType as IntentType].keywords.push(keyword);
      }
    }
  }

  // Encontrar la intención con mayor puntuación
  let bestIntent: IntentType = 'DESCONOCIDO';
  let bestScore = 0;
  let matchedKeywords: string[] = [];

  // Prioridad: COTIZACION > PEDIDO > SOPORTE > FINANCIERO > DOCUMENTOS > SALUDO
  const priorityOrder: IntentType[] = [
    'COTIZACION', 'PEDIDO', 'SOPORTE', 'FINANCIERO', 'DOCUMENTOS', 'SALUDO'
  ];

  for (const intent of priorityOrder) {
    if (scores[intent].count > bestScore) {
      bestScore = scores[intent].count;
      bestIntent = intent;
      matchedKeywords = scores[intent].keywords;
    }
  }

  // Calcular confianza basada en número de coincidencias
  const confidence = Math.min(bestScore / 3, 1.0); // Max 1.0 con 3+ coincidencias

  return {
    intent: bestIntent,
    confidence,
    matchedKeywords,
    suggestedFlow: INTENT_TO_FLOW[bestIntent],
  };
}

/**
 * Detecta si el mensaje contiene una solicitud de cotización
 */
export function isQuotationRequest(message: string): boolean {
  const result = classifyIntent(message);
  return result.intent === 'COTIZACION' || result.intent === 'MENU_OPCION_1';
}

/**
 * Detecta si el mensaje es sobre seguimiento de pedido
 */
export function isOrderTracking(message: string): boolean {
  const result = classifyIntent(message);
  return result.intent === 'PEDIDO' || result.intent === 'MENU_OPCION_2';
}

/**
 * Detecta si el mensaje requiere soporte/otro
 */
export function isOtherRequest(message: string): boolean {
  const result = classifyIntent(message);
  return (
    result.intent === 'SOPORTE' ||
    result.intent === 'FINANCIERO' ||
    result.intent === 'DOCUMENTOS' ||
    result.intent === 'MENU_OPCION_3'
  );
}

/**
 * Detecta el subtipo dentro de "Otro motivo"
 */
export function classifyOtherSubtype(message: string): 'SOPORTE' | 'FINANCIERO' | 'DOCUMENTOS' | 'GENERAL' {
  const result = classifyIntent(message);

  if (result.intent === 'SOPORTE') return 'SOPORTE';
  if (result.intent === 'FINANCIERO') return 'FINANCIERO';
  if (result.intent === 'DOCUMENTOS') return 'DOCUMENTOS';

  return 'GENERAL';
}

/**
 * Extrae información relevante del mensaje (nombre, número, etc.)
 */
export function extractData(message: string): {
  possibleName: string | null;
  possibleId: string | null;
  possiblePhone: string | null;
} {
  const normalized = message.trim();

  // Detectar posible número de identificación (6-12 dígitos)
  const idMatch = normalized.match(/\b(\d{6,12})\b/);

  // Detectar posible teléfono (7-15 dígitos con posible +)
  const phoneMatch = normalized.match(/\+?\d{7,15}/);

  // El resto podría ser un nombre (si no tiene muchos números)
  const withoutNumbers = normalized.replace(/[\d\+\-]/g, '').trim();
  const possibleName = withoutNumbers.length >= 3 && withoutNumbers.length <= 100
    ? withoutNumbers
    : null;

  return {
    possibleName,
    possibleId: idMatch ? idMatch[1] : null,
    possiblePhone: phoneMatch ? phoneMatch[0] : null,
  };
}
