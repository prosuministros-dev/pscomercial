/**
 * Cron Job para Inactividad de WhatsApp - HU-0012 (CA-7)
 *
 * Procesa conversaciones inactivas y envía recordatorios automáticos.
 * Este endpoint debe ser llamado periódicamente (cada 5 minutos recomendado).
 *
 * Configuración en Vercel:
 * - vercel.json: { "crons": [{ "path": "/api/cron/whatsapp-inactivity", "schedule": "*/5 * * * *" }] }
 *
 * Tiempos de inactividad:
 * - 30 min: Recordatorio 1
 * - 60 min: Recordatorio 2
 * - 120 min: Cierre automático
 */

import { NextRequest, NextResponse } from 'next/server';

import { procesarConversacionesInactivas } from '~/lib/whatsapp/services/bot-processor';

// Token de autorización para el cron (seguridad)
const CRON_SECRET = process.env.CRON_SECRET || 'cron_secret_token';

export async function GET(request: NextRequest) {
  // Verificar autorización
  const authHeader = request.headers.get('authorization');
  const cronHeader = request.headers.get('x-vercel-cron');

  // Permitir si viene de Vercel Cron o tiene el token correcto
  const isAuthorized =
    cronHeader === '1' ||
    authHeader === `Bearer ${CRON_SECRET}`;

  if (!isAuthorized && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    console.log('[Cron WhatsApp] Iniciando procesamiento de inactividad...');

    const resultado = await procesarConversacionesInactivas();

    console.log('[Cron WhatsApp] Procesamiento completado:', resultado);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      resultado: {
        recordatorios1Enviados: resultado.recordatorios1,
        recordatorios2Enviados: resultado.recordatorios2,
        conversacionesCerradas: resultado.cierres,
      },
    });

  } catch (error) {
    console.error('[Cron WhatsApp] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

// También soportar POST para ejecución manual
export async function POST(request: NextRequest) {
  return GET(request);
}
