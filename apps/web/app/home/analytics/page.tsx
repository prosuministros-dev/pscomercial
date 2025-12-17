import { BarChart3 } from 'lucide-react';

import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

export const metadata = {
  title: 'Analytics | PS Comercial',
};

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader
        title={<Trans i18nKey="analytics:title" defaults="Analytics" />}
        description={<Trans i18nKey="analytics:description" defaults="Reportes y análisis de datos" />}
      />

      <PageBody>
        <div className="glass rounded-xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">
            <Trans i18nKey="analytics:emptyTitle" defaults="Reportes y Analytics" />
          </h2>
          <p className="text-muted-foreground">
            <Trans i18nKey="analytics:emptyDescription" defaults="Aquí podrás ver dashboards, reportes de ventas, métricas de conversión y análisis de rendimiento comercial." />
          </p>
        </div>
      </PageBody>
    </>
  );
}
