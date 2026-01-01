import { PageBody } from '@kit/ui/page';

import { WhatsAppPanel } from './_components/whatsapp-panel';

export const metadata = {
  title: 'WhatsApp | Prosuministros',
};

export default function WhatsAppPage() {
  return (
    <PageBody className="p-4">
      <WhatsAppPanel />
    </PageBody>
  );
}
