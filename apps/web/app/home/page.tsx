import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { DashboardDemo } from '~/home/_components/dashboard-demo';

export const metadata = {
  title: 'Dashboard | Prosuministros',
};

export default function HomePage() {
  return (
    <>
      <PageHeader
        title={<Trans i18nKey="home:dashboard" defaults="Dashboard" />}
        description={<Trans i18nKey="home:dashboardDescription" defaults="Resumen de tu gestión comercial" />}
      />

      <PageBody>
        <DashboardDemo />
      </PageBody>
    </>
  );
}
