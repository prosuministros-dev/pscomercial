import { PageBody } from '@kit/ui/page';

import { PedidosView } from './_components/pedidos-view';

export const metadata = {
  title: 'Pedidos | PS Comercial',
};

export default function PedidosPage() {
  return (
    <PageBody className="p-4">
      <PedidosView />
    </PageBody>
  );
}
