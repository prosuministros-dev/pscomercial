import { DollarSign } from 'lucide-react';

import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

export const metadata = {
  title: 'Financiero | PS Comercial',
};

export default function FinancieroPage() {
  return (
    <>
      <PageHeader
        title={<Trans i18nKey="financiero:title" defaults="Financiero" />}
        description={<Trans i18nKey="financiero:description" defaults="Validación de crédito y gestión financiera" />}
      />

      <PageBody>
        <div className="glass rounded-xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">
            <Trans i18nKey="financiero:emptyTitle" defaults="Módulo Financiero" />
          </h2>
          <p className="text-muted-foreground">
            <Trans i18nKey="financiero:emptyDescription" defaults="Aquí podrás validar cupos de crédito, revisar estados de cuenta y gestionar aprobaciones financieras." />
          </p>
        </div>
      </PageBody>
    </>
  );
}
