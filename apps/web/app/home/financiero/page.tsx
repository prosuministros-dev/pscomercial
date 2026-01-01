import { PageBody } from '@kit/ui/page';

import { ControlFinanciero } from './_components/control-financiero';

export const metadata = {
  title: 'Financiero | Prosuministros',
};

export default function FinancieroPage() {
  return (
    <PageBody className="p-4">
      <ControlFinanciero />
    </PageBody>
  );
}
