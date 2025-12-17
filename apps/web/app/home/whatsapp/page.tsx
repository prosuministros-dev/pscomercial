import { MessageCircle } from 'lucide-react';

import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';
import { Button } from '@kit/ui/button';

export const metadata = {
  title: 'WhatsApp | PS Comercial',
};

export default function WhatsAppPage() {
  return (
    <>
      <PageHeader
        title={<Trans i18nKey="whatsapp:title" defaults="WhatsApp" />}
        description={<Trans i18nKey="whatsapp:description" defaults="Integración con WhatsApp Business" />}
      >
        <Button className="gradient-brand">
          <MessageCircle className="mr-2 h-4 w-4" />
          <Trans i18nKey="whatsapp:configure" defaults="Configurar" />
        </Button>
      </PageHeader>

      <PageBody>
        <div className="glass rounded-xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <MessageCircle className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">
            <Trans i18nKey="whatsapp:emptyTitle" defaults="Integración WhatsApp" />
          </h2>
          <p className="text-muted-foreground">
            <Trans i18nKey="whatsapp:emptyDescription" defaults="Aquí podrás configurar el bot de WhatsApp para captura automática de leads y comunicación con clientes." />
          </p>
        </div>
      </PageBody>
    </>
  );
}
