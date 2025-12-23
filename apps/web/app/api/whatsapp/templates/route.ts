import { NextRequest, NextResponse } from 'next/server';

import { getTemplates } from '~/lib/whatsapp/queries/whatsapp.api';
import type { TemplatesFilter } from '~/lib/whatsapp/schemas/whatsapp.schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: TemplatesFilter = {};

    const categoria = searchParams.get('categoria');
    if (categoria) {
      filters.categoria = categoria as TemplatesFilter['categoria'];
    }

    const activo = searchParams.get('activo');
    if (activo !== null) {
      filters.activo = activo === 'true';
    }

    const search = searchParams.get('search');
    if (search) {
      filters.search = search;
    }

    const templates = await getTemplates(filters);
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error in GET /api/whatsapp/templates:', error);
    return NextResponse.json(
      { error: 'Error fetching templates' },
      { status: 500 },
    );
  }
}
