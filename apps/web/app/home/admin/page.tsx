import { Settings } from 'lucide-react';

import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

export const metadata = {
  title: 'Administración | PS Comercial',
};

export default function AdminPage() {
  return (
    <>
      <PageHeader
        title={<Trans i18nKey="admin:title" defaults="Administración" />}
        description={<Trans i18nKey="admin:description" defaults="Configuración del sistema y gestión de usuarios" />}
      />

      <PageBody>
        <div className="glass rounded-xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Settings className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">
            <Trans i18nKey="admin:emptyTitle" defaults="Panel de Administración" />
          </h2>
          <p className="text-muted-foreground">
            <Trans i18nKey="admin:emptyDescription" defaults="Aquí podrás gestionar usuarios, roles, permisos y configuraciones generales del sistema." />
          </p>
        </div>
      </PageBody>
    </>
  );
}
