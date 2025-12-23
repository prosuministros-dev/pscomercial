import { NextRequest, NextResponse } from 'next/server';

import { getConversaciones } from '~/lib/whatsapp/queries/whatsapp.api';
import { crearConversacion } from '~/lib/whatsapp/actions/whatsapp.actions';
import type { ConversacionesFilter } from '~/lib/whatsapp/schemas/whatsapp.schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: ConversacionesFilter = {};

    const estado = searchParams.get('estado');
    if (estado) {
      filters.estado = estado as ConversacionesFilter['estado'];
    }

    const asesorId = searchParams.get('asesor_id');
    if (asesorId) {
      filters.asesor_id = asesorId;
    }

    const search = searchParams.get('search');
    if (search) {
      filters.search = search;
    }

    const noLeidos = searchParams.get('no_leidos');
    if (noLeidos === 'true') {
      filters.tiene_mensajes_no_leidos = true;
    }

    const conversaciones = await getConversaciones(filters);
    return NextResponse.json(conversaciones);
  } catch (error) {
    console.error('Error in GET /api/whatsapp/conversaciones:', error);
    return NextResponse.json(
      { error: 'Error fetching conversaciones' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await crearConversacion(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, {
      status: result.isExisting ? 200 : 201,
    });
  } catch (error) {
    console.error('Error in POST /api/whatsapp/conversaciones:', error);
    return NextResponse.json(
      { error: 'Error creating conversacion' },
      { status: 500 },
    );
  }
}
