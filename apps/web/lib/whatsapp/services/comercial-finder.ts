/**
 * Buscador de Comerciales - HU-0012 (CA-8, CA-10)
 *
 * Busca comerciales/asesores en el sistema por nombre
 * y crea notificaciones internas cuando se les asigna una conversación.
 */

import 'server-only';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

// ===========================================
// TIPOS
// ===========================================

export interface Comercial {
  id: string;
  nombre_completo: string;
  email: string | null;
  telefono?: string | null;
  cargo?: string | null;
  activo: boolean;
}

export interface BusquedaResult {
  encontrado: boolean;
  comerciales: Comercial[];
  mejorCoincidencia?: Comercial;
  confianza: number; // 0-1
}

// ===========================================
// FUNCIONES DE BÚSQUEDA
// ===========================================

/**
 * Busca un comercial por nombre (búsqueda flexible)
 */
export async function buscarComercialPorNombre(
  nombreBusqueda: string
): Promise<BusquedaResult> {
  const client = getSupabaseServerClient();

  // Normalizar nombre de búsqueda
  const nombreNormalizado = normalizarNombre(nombreBusqueda);

  if (nombreNormalizado.length < 2) {
    return { encontrado: false, comerciales: [], confianza: 0 };
  }

  try {
    // Búsqueda por coincidencia parcial
    const { data: usuarios, error } = await client
      .from('usuarios')
      .select('id, nombre_completo, email, telefono, cargo, activo')
      .eq('activo', true)
      .or(
        `nombre_completo.ilike.%${nombreNormalizado}%,` +
        `email.ilike.%${nombreNormalizado}%`
      )
      .limit(10);

    if (error) {
      console.error('[ComercialFinder] Error en búsqueda:', error);
      return { encontrado: false, comerciales: [], confianza: 0 };
    }

    if (!usuarios || usuarios.length === 0) {
      return { encontrado: false, comerciales: [], confianza: 0 };
    }

    // Ordenar por relevancia
    const comercialesOrdenados = ordenarPorRelevancia(usuarios, nombreNormalizado);

    return {
      encontrado: true,
      comerciales: comercialesOrdenados,
      mejorCoincidencia: comercialesOrdenados[0],
      confianza: calcularConfianza(comercialesOrdenados[0]?.nombre_completo || '', nombreNormalizado),
    };

  } catch (error) {
    console.error('[ComercialFinder] Error:', error);
    return { encontrado: false, comerciales: [], confianza: 0 };
  }
}

/**
 * Busca comercial por ID
 */
export async function obtenerComercialPorId(id: string): Promise<Comercial | null> {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('usuarios')
    .select('id, nombre_completo, email, telefono, cargo, activo')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Comercial;
}

/**
 * Obtiene todos los comerciales activos
 */
export async function obtenerComercialesActivos(): Promise<Comercial[]> {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('usuarios')
    .select('id, nombre_completo, email, telefono, cargo, activo')
    .eq('activo', true)
    .order('nombre_completo', { ascending: true });

  if (error) {
    console.error('[ComercialFinder] Error obteniendo comerciales:', error);
    return [];
  }

  return (data || []) as Comercial[];
}

// ===========================================
// NOTIFICACIONES INTERNAS (CA-10)
// ===========================================

/**
 * Crea una notificación interna para un comercial
 */
export async function notificarComercial(
  comercialId: string,
  tipo: string,
  titulo: string,
  mensaje: string,
  referenciaId?: string,
  referenciaTipo?: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseServerClient();

  try {
    const { error } = await client.from('notificaciones').insert({
      usuario_id: comercialId,
      tipo,
      titulo,
      mensaje,
      referencia_id: referenciaId,
      referencia_tipo: referenciaTipo,
    });

    if (error) {
      console.error('[ComercialFinder] Error creando notificación:', error);
      return { success: false, error: error.message };
    }

    return { success: true };

  } catch (error) {
    console.error('[ComercialFinder] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Notifica a un comercial sobre una consulta de seguimiento de pedido
 */
export async function notificarSeguimientoPedido(
  comercialId: string,
  nombreCliente: string,
  telefonoCliente: string,
  conversacionId: string
): Promise<{ success: boolean; error?: string }> {
  return notificarComercial(
    comercialId,
    'SEGUIMIENTO_PEDIDO',
    'Nueva consulta de seguimiento de pedido',
    `El cliente ${nombreCliente} (${telefonoCliente}) solicita información sobre el estado de su pedido.`,
    conversacionId,
    'CONVERSACION_WHATSAPP'
  );
}

/**
 * Notifica a un comercial sobre una solicitud de cotización
 */
export async function notificarSolicitudCotizacion(
  comercialId: string,
  nombreCliente: string,
  telefonoCliente: string,
  detalle: string,
  conversacionId: string
): Promise<{ success: boolean; error?: string }> {
  return notificarComercial(
    comercialId,
    'SOLICITUD_COTIZACION',
    'Nueva solicitud de cotización desde WhatsApp',
    `El cliente ${nombreCliente} (${telefonoCliente}) solicita cotización: ${detalle.substring(0, 200)}`,
    conversacionId,
    'CONVERSACION_WHATSAPP'
  );
}

/**
 * Notifica a un comercial sobre una solicitud general
 */
export async function notificarSolicitudGeneral(
  comercialId: string,
  nombreCliente: string,
  telefonoCliente: string,
  area: string,
  detalle: string,
  conversacionId: string
): Promise<{ success: boolean; error?: string }> {
  return notificarComercial(
    comercialId,
    `SOLICITUD_${area.toUpperCase()}`,
    `Nueva solicitud de ${area} desde WhatsApp`,
    `El cliente ${nombreCliente} (${telefonoCliente}) necesita: ${detalle.substring(0, 200)}`,
    conversacionId,
    'CONVERSACION_WHATSAPP'
  );
}

// ===========================================
// FUNCIONES AUXILIARES
// ===========================================

/**
 * Normaliza un nombre para búsqueda
 */
function normalizarNombre(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^\w\s]/g, ' ')         // Remover caracteres especiales
    .replace(/\s+/g, ' ')             // Normalizar espacios
    .trim();
}

/**
 * Ordena comerciales por relevancia de coincidencia
 */
function ordenarPorRelevancia(comerciales: Comercial[], busqueda: string): Comercial[] {
  return comerciales.sort((a, b) => {
    const nombreA = normalizarNombre(a.nombre_completo);
    const nombreB = normalizarNombre(b.nombre_completo);

    // Priorizar coincidencia exacta
    if (nombreA === busqueda) return -1;
    if (nombreB === busqueda) return 1;

    // Luego coincidencia al inicio
    if (nombreA.startsWith(busqueda) && !nombreB.startsWith(busqueda)) return -1;
    if (nombreB.startsWith(busqueda) && !nombreA.startsWith(busqueda)) return 1;

    // Finalmente por similitud
    const simA = calcularConfianza(nombreA, busqueda);
    const simB = calcularConfianza(nombreB, busqueda);

    return simB - simA;
  });
}

/**
 * Calcula la confianza de una coincidencia (0-1)
 */
function calcularConfianza(nombre: string, busqueda: string): number {
  const nombreNorm = normalizarNombre(nombre);
  const busquedaNorm = normalizarNombre(busqueda);

  // Coincidencia exacta
  if (nombreNorm === busquedaNorm) return 1.0;

  // Coincidencia al inicio
  if (nombreNorm.startsWith(busquedaNorm)) return 0.9;

  // Contiene la búsqueda
  if (nombreNorm.includes(busquedaNorm)) return 0.7;

  // Calcular similitud de caracteres
  const palabrasNombre = nombreNorm.split(' ');
  const palabrasBusqueda = busquedaNorm.split(' ');

  let coincidencias = 0;
  for (const palabraBusqueda of palabrasBusqueda) {
    for (const palabraNombre of palabrasNombre) {
      if (palabraNombre.includes(palabraBusqueda) || palabraBusqueda.includes(palabraNombre)) {
        coincidencias++;
        break;
      }
    }
  }

  return coincidencias / Math.max(palabrasBusqueda.length, 1) * 0.6;
}
