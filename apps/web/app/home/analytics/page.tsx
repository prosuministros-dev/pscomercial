import { PageBody } from '@kit/ui/page';

import { AnalyticsView } from './_components/analytics-view';

export const metadata = {
  title: 'Analytics | Prosuministros',
};

export default function AnalyticsPage() {
  return (
    <PageBody className="p-4">
      <AnalyticsView />
    </PageBody>
  );
}
