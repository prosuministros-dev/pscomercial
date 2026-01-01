import { PageBody } from '@kit/ui/page';

import { CotizacionesView } from './_components/cotizaciones-view';

export const metadata = {
  title: 'Cotizaciones | Prosuministros',
};

export default function CotizacionesPage() {
  return (
    <PageBody className="p-4">
      <CotizacionesView />
    </PageBody>
  );
}
