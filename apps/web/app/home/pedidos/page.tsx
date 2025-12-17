import { ShoppingCart } from 'lucide-react';

import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';
import { Button } from '@kit/ui/button';

export const metadata = {
  title: 'Pedidos | PS Comercial',
};

export default function PedidosPage() {
  return (
    <>
      <PageHeader
        title={<Trans i18nKey="pedidos:title" defaults="Pedidos" />}
        description={<Trans i18nKey="pedidos:description" defaults="Seguimiento de pedidos y órdenes" />}
      >
        <Button className="gradient-brand">
          <ShoppingCart className="mr-2 h-4 w-4" />
          <Trans i18nKey="pedidos:newPedido" defaults="Nuevo Pedido" />
        </Button>
      </PageHeader>

      <PageBody>
        <div className="glass rounded-xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <ShoppingCart className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">
            <Trans i18nKey="pedidos:emptyTitle" defaults="Módulo de Pedidos" />
          </h2>
          <p className="text-muted-foreground">
            <Trans i18nKey="pedidos:emptyDescription" defaults="Aquí podrás gestionar los pedidos generados desde cotizaciones aprobadas y hacer seguimiento de su estado." />
          </p>
        </div>
      </PageBody>
    </>
  );
}
