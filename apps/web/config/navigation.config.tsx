import {
  BarChart3,
  DollarSign,
  FileText,
  Home,
  MessageCircle,
  Settings,
  ShoppingCart,
  User,
  Users,
} from 'lucide-react';
import { z } from 'zod';

import { NavigationConfigSchema } from '@kit/ui/navigation-schema';

import pathsConfig from '~/config/paths.config';

const iconClasses = 'w-4 h-4';

const routes = [
  {
    label: 'common:routes.application',
    children: [
      {
        label: 'Dashboard',
        path: pathsConfig.app.home,
        Icon: <Home className={iconClasses} />,
        end: true,
      },
      {
        label: 'Leads',
        path: pathsConfig.app.leads,
        Icon: <Users className={iconClasses} />,
      },
      {
        label: 'Cotizaciones',
        path: pathsConfig.app.cotizaciones,
        Icon: <FileText className={iconClasses} />,
      },
      {
        label: 'Pedidos',
        path: pathsConfig.app.pedidos,
        Icon: <ShoppingCart className={iconClasses} />,
      },
      {
        label: 'Financiero',
        path: pathsConfig.app.financiero,
        Icon: <DollarSign className={iconClasses} />,
      },
      {
        label: 'WhatsApp',
        path: pathsConfig.app.whatsapp,
        Icon: <MessageCircle className={iconClasses} />,
      },
      {
        label: 'Analytics',
        path: pathsConfig.app.analytics,
        Icon: <BarChart3 className={iconClasses} />,
      },
    ],
  },
  {
    label: 'common:routes.settings',
    children: [
      {
        label: 'Admin',
        path: pathsConfig.app.admin,
        Icon: <Settings className={iconClasses} />,
      },
      {
        label: 'common:routes.profile',
        path: pathsConfig.app.profileSettings,
        Icon: <User className={iconClasses} />,
      },
    ],
  },
] satisfies z.infer<typeof NavigationConfigSchema>['routes'];

export const navigationConfig = NavigationConfigSchema.parse({
  routes,
  // Forzar estilo header (navegación superior) como default para Prosuministros
  style: process.env.NEXT_PUBLIC_NAVIGATION_STYLE ?? 'header',
  sidebarCollapsed: process.env.NEXT_PUBLIC_HOME_SIDEBAR_COLLAPSED,
});
