import { PageBody } from '@kit/ui/page';

import { AdminPanel } from './_components/admin-panel';

export const metadata = {
  title: 'Administración | Prosuministros',
};

export default function AdminPage() {
  return (
    <PageBody className="p-4">
      <AdminPanel />
    </PageBody>
  );
}
