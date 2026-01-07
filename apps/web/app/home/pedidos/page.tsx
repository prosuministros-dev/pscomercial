import { PageBody } from '@kit/ui/page';

import { PedidosView } from './_components/pedidos-view';

export const metadata = {
  title: 'Pedidos | Prosuministros',
};

export default function PedidosPage() {
  return (
    <PageBody className="p-4">
      <PedidosView />
    </PageBody>
  );
}
