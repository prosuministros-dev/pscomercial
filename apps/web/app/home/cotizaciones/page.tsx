import { FileText } from 'lucide-react';

import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';
import { Button } from '@kit/ui/button';

export const metadata = {
  title: 'Cotizaciones | PS Comercial',
};

export default function CotizacionesPage() {
  return (
    <>
      <PageHeader
        title={<Trans i18nKey="cotizaciones:title" defaults="Cotizaciones" />}
        description={<Trans i18nKey="cotizaciones:description" defaults="Gestión de cotizaciones y proformas" />}
      >
        <Button className="gradient-brand">
          <FileText className="mr-2 h-4 w-4" />
          <Trans i18nKey="cotizaciones:newCotizacion" defaults="Nueva Cotización" />
        </Button>
      </PageHeader>

      <PageBody>
        <div className="glass rounded-xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">
            <Trans i18nKey="cotizaciones:emptyTitle" defaults="Módulo de Cotizaciones" />
          </h2>
          <p className="text-muted-foreground">
            <Trans i18nKey="cotizaciones:emptyDescription" defaults="Aquí podrás crear cotizaciones, validar márgenes, generar proformas y hacer seguimiento del proceso de venta." />
          </p>
        </div>
      </PageBody>
    </>
  );
}
