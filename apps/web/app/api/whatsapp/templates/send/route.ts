import { NextRequest, NextResponse } from 'next/server';

import { enviarTemplate } from '~/lib/whatsapp/actions/whatsapp.actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await enviarTemplate(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/whatsapp/templates/send:', error);
    return NextResponse.json(
      { error: 'Error sending template' },
      { status: 500 },
    );
  }
}
