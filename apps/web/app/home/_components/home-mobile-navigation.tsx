'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Bell, LogOut, Menu } from 'lucide-react';

import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import { cn, isRouteActive } from '@kit/ui/utils';
import { Button } from '@kit/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@kit/ui/sheet';
import { Trans } from '@kit/ui/trans';

import { navigationConfig } from '~/config/navigation.config';

/**
 * HomeMobileNavigation - Navegación móvil estilo Prosuministros CRM
 *
 * Incluye:
 * - Menú hamburguesa con sheet lateral
 * - Navegación inferior compacta (opcional)
 */
export function HomeMobileNavigation() {
  const signOut = useSignOut();
  const pathname = usePathname();

  // Extraer todas las rutas
  const allRoutes = navigationConfig.routes.reduce<
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

  return (
    <div className="flex items-center space-x-2">
      {/* Botón de Notificaciones */}
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 text-muted-foreground"
      >
        <Bell className="h-5 w-5" />
      </Button>

      {/* Menú Hamburguesa */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="w-[280px] p-0">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle className="gradient-text-brand text-left text-lg font-bold">
              PS Comercial
            </SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col py-2">
            {allRoutes.map((route) => {
              const isActive = isRouteActive(route.path, pathname, route.end ?? false);

              return (
                <Link
                  key={route.path}
                  href={route.path}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-3 transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary border-primary border-l-2 font-medium'
                      : 'text-foreground hover:bg-muted'
                  )}
                >
                  {route.Icon && (
                    <span className={cn(isActive ? 'text-primary' : 'text-muted-foreground')}>
                      {route.Icon}
                    </span>
                  )}
                  <span>
                    <Trans i18nKey={route.label} defaults={route.label} />
                  </span>
                </Link>
              );
            })}

            {/* Separador */}
            <div className="my-2 border-t" />

            {/* Sign Out */}
            <button
              onClick={() => signOut.mutateAsync()}
              className="flex items-center space-x-3 px-4 py-3 text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>
                <Trans i18nKey="common:signOut" defaults="Cerrar sesión" />
              </span>
            </button>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/**
 * MobileBottomNav - Navegación inferior compacta (opcional)
 * Solo muestra los 5 items principales
 */
export function MobileBottomNav() {
  const pathname = usePathname();

  // Solo primeros 5 items para la barra inferior
  const mainRoutes = navigationConfig.routes
    .reduce<
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
      return acc;
    }, [])
    .slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-md md:hidden">
      <div className="flex h-14 items-center justify-around px-2">
        {mainRoutes.map((route) => {
          const isActive = isRouteActive(route.path, pathname, route.end ?? false);

          return (
            <Link
              key={route.path}
              href={route.path}
              className={cn(
                'flex flex-col items-center justify-center space-y-0.5 px-2 py-1 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {route.Icon && (
                <span className={cn(isActive && 'scale-110 transition-transform')}>
                  {route.Icon}
                </span>
              )}
              <span className="text-[10px] font-medium truncate max-w-[60px]">
                {route.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
