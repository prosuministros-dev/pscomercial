import { Users } from 'lucide-react';

import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';
import { Button } from '@kit/ui/button';

export const metadata = {
  title: 'Leads | PS Comercial',
};

export default function LeadsPage() {
  return (
    <>
      <PageHeader
        title={<Trans i18nKey="leads:title" defaults="Leads" />}
        description={<Trans i18nKey="leads:description" defaults="Gestión de prospectos comerciales" />}
      >
        <Button className="gradient-brand">
          <Users className="mr-2 h-4 w-4" />
          <Trans i18nKey="leads:newLead" defaults="Nuevo Lead" />
        </Button>
      </PageHeader>

      <PageBody>
        <div className="glass rounded-xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">
            <Trans i18nKey="leads:emptyTitle" defaults="Módulo de Leads" />
          </h2>
          <p className="text-muted-foreground">
            <Trans i18nKey="leads:emptyDescription" defaults="Aquí podrás gestionar todos tus prospectos comerciales, asignarlos a vendedores y hacer seguimiento de su avance." />
          </p>
        </div>
      </PageBody>
    </>
  );
}
