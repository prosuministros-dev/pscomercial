'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  MessageSquare,
  Settings,
  Shield,
  User,
} from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@kit/ui/tooltip';
import { cn } from '@kit/ui/utils';

import pathsConfig from '~/config/paths.config';

/**
 * SettingsDropdown - Dropdown de configuración accesible desde el icono de engranaje
 *
 * Opciones:
 * - Perfil: Configuración de cuenta personal
 * - WhatsApp Business: Vinculación de número WhatsApp
 * - Administración: Panel de admin (si tiene permisos)
 */
export function SettingsDropdown() {
  const pathname = usePathname();

  const isSettingsActive = pathname.startsWith('/home/settings');
  const isAdminActive = pathname.startsWith('/home/admin');
  const isActive = isSettingsActive || isAdminActive;

  const settingsItems = [
    {
      label: 'Mi Perfil',
      description: 'Configuración de cuenta',
      href: pathsConfig.app.profileSettings,
      icon: User,
    },
    {
      label: 'WhatsApp Business',
      description: 'Vincular número de WhatsApp',
      href: pathsConfig.app.whatsappSettings,
      icon: MessageSquare,
    },
  ];

  const adminItems = [
    {
      label: 'Administración',
      description: 'Panel de administrador',
      href: pathsConfig.app.admin,
      icon: Shield,
    },
  ];

  return (
    <DropdownMenu>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'relative h-9 w-9 transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Settings className="h-5 w-5" />
                {isActive && (
                  <span className="bg-primary absolute -bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full" />
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8}>
            Configuración
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Configuración</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {settingsItems.map((item) => {
          const Icon = item.icon;
          const isItemActive = pathname === item.href;

          return (
            <DropdownMenuItem key={item.href} asChild>
              <Link
                href={item.href}
                className={cn(
                  'flex cursor-pointer items-start gap-3 p-2',
                  isItemActive && 'bg-accent'
                )}
              >
                <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </div>
              </Link>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />

        {adminItems.map((item) => {
          const Icon = item.icon;
          const isItemActive = pathname === item.href;

          return (
            <DropdownMenuItem key={item.href} asChild>
              <Link
                href={item.href}
                className={cn(
                  'flex cursor-pointer items-start gap-3 p-2',
                  isItemActive && 'bg-accent'
                )}
              >
                <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </div>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
