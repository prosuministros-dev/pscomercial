import { use } from 'react';

import { cookies } from 'next/headers';

import {
  Page,
  PageLayoutStyle,
  PageMobileNavigation,
  PageNavigation,
} from '@kit/ui/page';
import { SidebarProvider } from '@kit/ui/shadcn-sidebar';

import { AppLogo } from '~/components/app-logo';
import { navigationConfig } from '~/config/navigation.config';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

// home imports
import { HomeMenuNavigation } from './_components/home-menu-navigation';
import { HomeMobileNavigation } from './_components/home-mobile-navigation';
import { HomeSidebar } from './_components/home-sidebar';

/**
 * HomeLayout - Layout principal de Prosuministros
 *
 * Por defecto usa navegación superior (header) estilo Prosuministros CRM.
 * El sidebar se mantiene como opción pero no es el default.
 */
function HomeLayout({ children }: React.PropsWithChildren) {
  const style = use(getLayoutStyle());

  // Prosuministros: Forzar header como default
  if (style === 'sidebar') {
    return <SidebarLayout>{children}</SidebarLayout>;
  }

  return <HeaderLayout>{children}</HeaderLayout>;
}

export default withI18n(HomeLayout);

/**
 * SidebarLayout - Layout con sidebar lateral (legacy, no default)
 */
function SidebarLayout({ children }: React.PropsWithChildren) {
  const sidebarMinimized = navigationConfig.sidebarCollapsed;
  const [user] = use(Promise.all([requireUserInServerComponent()]));

  return (
    <SidebarProvider defaultOpen={sidebarMinimized}>
      <Page style={'sidebar'}>
        <PageNavigation>
          <HomeSidebar user={user} />
        </PageNavigation>

        <PageMobileNavigation className={'flex items-center justify-between'}>
          <MobileNavigation />
        </PageMobileNavigation>

        {children}
      </Page>
    </SidebarProvider>
  );
}

/**
 * HeaderLayout - Layout con navegación superior (default Prosuministros)
 *
 * Características:
 * - Navegación fija en la parte superior
 * - Glass morphism con backdrop blur
 * - Responsive con menú móvil
 */
function HeaderLayout({ children }: React.PropsWithChildren) {
  return (
    <Page style={'header'} sticky={true}>
      <PageNavigation>
        <HomeMenuNavigation />
      </PageNavigation>

      <PageMobileNavigation className={'flex items-center justify-between'}>
        <MobileNavigation />
      </PageMobileNavigation>

      {children}
    </Page>
  );
}

/**
 * MobileNavigation - Wrapper para navegación móvil
 */
function MobileNavigation() {
  return (
    <>
      <AppLogo />
      <HomeMobileNavigation />
    </>
  );
}

/**
 * getLayoutStyle - Obtiene el estilo de layout desde cookie o config
 *
 * Prosuministros siempre usa 'header' por defecto
 */
async function getLayoutStyle() {
  const cookieStore = await cookies();

  return (
    (cookieStore.get('layout-style')?.value as PageLayoutStyle) ??
    navigationConfig.style
  );
}
