import { NextRequest, NextResponse } from 'next/server';

import { getMensajes } from '~/lib/whatsapp/queries/whatsapp.api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const mensajes = await getMensajes(id);
    return NextResponse.json(mensajes);
  } catch (error) {
    console.error(
      'Error in GET /api/whatsapp/conversaciones/[id]/mensajes:',
      error,
    );
    return NextResponse.json(
      { error: 'Error fetching mensajes' },
      { status: 500 },
    );
  }
}
