import { PageBody } from '@kit/ui/page';

import { LeadsView } from './_components/leads-view';

export const metadata = {
  title: 'Leads | PS Comercial',
};

export default function LeadsPage() {
  return (
    <PageBody className="p-4">
      <LeadsView />
    </PageBody>
  );
}
