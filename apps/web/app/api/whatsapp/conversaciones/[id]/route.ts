import { NextRequest, NextResponse } from 'next/server';

import { getConversacionConMensajes } from '~/lib/whatsapp/queries/whatsapp.api';
import { actualizarConversacion } from '~/lib/whatsapp/actions/whatsapp.actions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const conversacion = await getConversacionConMensajes(id);

    if (!conversacion) {
      return NextResponse.json(
        { error: 'Conversación no encontrada' },
        { status: 404 },
      );
    }

    return NextResponse.json(conversacion);
  } catch (error) {
    console.error('Error in GET /api/whatsapp/conversaciones/[id]:', error);
    return NextResponse.json(
      { error: 'Error fetching conversacion' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const result = await actualizarConversacion({ id, ...body });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error in PATCH /api/whatsapp/conversaciones/[id]:', error);
    return NextResponse.json(
      { error: 'Error updating conversacion' },
      { status: 500 },
    );
  }
}
