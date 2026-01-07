'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Bell } from 'lucide-react';

import { cn, isRouteActive } from '@kit/ui/utils';
import { Button } from '@kit/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@kit/ui/tooltip';

import { AppLogo } from '~/components/app-logo';
import { NotificacionesPanel } from '~/components/notificaciones-panel';
import { ProfileAccountDropdownContainer } from '~/components/personal-account-dropdown-container';
import { navigationConfig } from '~/config/navigation.config';
import { useNotificacionesCount } from '~/lib/notificaciones';
import { SettingsDropdown } from './settings-dropdown';

/**
 * TopNavigation - Navegación superior estilo Prosuministros CRM
 *
 * Layout:
 * [Logo] [Nav Items centrados] [Notificaciones] [Usuario]
 */
export function TopNavigation() {
  const [notificacionesOpen, setNotificacionesOpen] = useState(false);
  const { data: notificacionesCount = 0 } = useNotificacionesCount();

  // Extraer rutas planas de la configuración
  const routes = navigationConfig.routes.reduce<
    Array<{
      path: string;
      label: string;
      Icon?: React.ReactNode;
      end?: boolean | ((path: string) => boolean);
    }>
  >((acc, item) => {
    if ('children' in item) {
      return [...acc, ...item.children];
    }

    if ('divider' in item) {
      return acc;
    }

    return [...acc, item];
  }, []);

  // Filtrar rutas principales (excluir settings y admin que van en dropdown)
  const mainRoutes = routes.filter(
    (route) =>
      !route.path.includes('/settings') && !route.path.includes('/admin')
  );

  return (
    <div className="flex w-full items-center justify-between">
      {/* Logo - Izquierda */}
      <div className="flex items-center">
        <AppLogo />
      </div>

      {/* Navegación Principal - Centro */}
      <nav className="hidden items-center space-x-1 md:flex">
        {mainRoutes.map((route) => (
          <NavItem
            key={route.path}
            path={route.path}
            label={route.label}
            icon={route.Icon}
            end={route.end}
          />
        ))}
      </nav>

      {/* Acciones - Derecha */}
      <div className="flex items-center space-x-2">
        {/* Botón de Notificaciones */}
        <NotificationsButton
          unreadCount={notificacionesCount}
          onClick={() => setNotificacionesOpen(true)}
        />

        {/* Panel de Notificaciones */}
        <NotificacionesPanel
          open={notificacionesOpen}
          onOpenChange={setNotificacionesOpen}
        />

        {/* Settings Dropdown */}
        <SettingsDropdown />

        {/* User Menu */}
        <ProfileAccountDropdownContainer showProfileName={false} />
      </div>
    </div>
  );
}

/**
 * NavItem - Item de navegación individual
 */
interface NavItemProps {
  path: string;
  label: string;
  icon?: React.ReactNode;
  end?: boolean | ((path: string) => boolean);
  compact?: boolean;
}

function NavItem({ path, label, icon, end, compact }: NavItemProps) {
  const pathname = usePathname();
  const isActive = isRouteActive(path, pathname, end ?? false);

  if (compact) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className={cn(
                'relative h-9 w-9 transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Link href={path}>
                {icon}
                {isActive && (
                  <span className="bg-primary absolute -bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full" />
                )}
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8}>
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className={cn(
        'relative h-9 px-3 transition-all duration-200',
        isActive
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Link href={path} className="flex items-center space-x-2">
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span>{label}</span>
        {isActive && (
          <span className="bg-primary absolute -bottom-1 left-1/2 h-0.5 w-3/4 -translate-x-1/2 rounded-full" />
        )}
      </Link>
    </Button>
  );
}

/**
 * NotificationsButton - Botón de notificaciones con badge
 */
interface NotificationsButtonProps {
  unreadCount: number;
  onClick: () => void;
}

function NotificationsButton({ unreadCount, onClick }: NotificationsButtonProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            className="relative h-9 w-9 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8}>
          Notificaciones
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
