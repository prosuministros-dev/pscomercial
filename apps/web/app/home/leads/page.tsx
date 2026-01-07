import { PageBody } from '@kit/ui/page';

import { LeadsView } from './_components/leads-view';

export const metadata = {
  title: 'Leads | Prosuministros',
};

export default function LeadsPage() {
  return (
    <PageBody className="p-4">
      <LeadsView />
    </PageBody>
  );
}
