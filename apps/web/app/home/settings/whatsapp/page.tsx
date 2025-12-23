import { PageBody } from '@kit/ui/page';

import { WhatsAppSettingsPanel } from './_components/whatsapp-settings-panel';

export const metadata = {
  title: 'Configuración WhatsApp | PS Comercial',
};

export default function WhatsAppSettingsPage() {
  return (
    <PageBody className="p-4">
      <WhatsAppSettingsPanel />
    </PageBody>
  );
}
