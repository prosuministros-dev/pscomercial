import { NextRequest, NextResponse } from 'next/server';

import { marcarMensajesLeidos } from '~/lib/whatsapp/actions/whatsapp.actions';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await marcarMensajesLeidos(id);

    if (!result.success) {
      return NextResponse.json({ error: 'Error' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      'Error in POST /api/whatsapp/conversaciones/[id]/read:',
      error,
    );
    return NextResponse.json(
      { error: 'Error marking messages as read' },
      { status: 500 },
    );
  }
}
