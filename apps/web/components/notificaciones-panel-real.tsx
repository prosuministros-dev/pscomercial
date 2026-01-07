'use client';

import { useState } from 'react';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bell, Check, CheckCheck, Loader2 } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { ScrollArea } from '@kit/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@kit/ui/sheet';

import {
  useMarcarNotificacionLeida,
  useMarcarTodasLeidas,
  useNotificaciones,
} from '~/lib/notificaciones/hooks/use-notificaciones-real';

interface NotificacionesPanelRealProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificacionesPanelReal({
  open,
  onOpenChange,
}: NotificacionesPanelRealProps) {
  const { data: notificaciones = [], isLoading } = useNotificaciones();
  const marcarLeidaMutation = useMarcarNotificacionLeida();
  const marcarTodasMutation = useMarcarTodasLeidas();

  const handleMarcarLeida = async (id: string) => {
    await marcarLeidaMutation.mutateAsync(id);
  };

  const handleMarcarTodas = async () => {
    await marcarTodasMutation.mutateAsync();
  };

  const noLeidas = notificaciones.filter((n) => !n.leida);

  // Mapear tipo a badge variant
  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'MENCION':
        return { variant: 'secondary' as const, label: 'Mención' };
      case 'COTIZACION_CAMBIO_ESTADO':
        return { variant: 'default' as const, label: 'Cambio Estado' };
      case 'COTIZACION_APROBACION_MARGEN':
        return { variant: 'destructive' as const, label: 'Aprobación' };
      case 'COTIZACION_GANADA':
        return { variant: 'default' as const, label: 'Ganada' };
      case 'COTIZACION_PERDIDA':
        return { variant: 'secondary' as const, label: 'Perdida' };
      default:
        return { variant: 'outline' as const, label: tipo };
    }
  };

  // Mapear prioridad a color
  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'URGENTE':
        return 'text-red-600';
      case 'ALTA':
        return 'text-orange-600';
      case 'MEDIA':
        return 'text-blue-600';
      case 'BAJA':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificaciones
          {noLeidas.length > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {noLeidas.length}
            </Badge>
          )}
        </SheetTitle>
        <SheetDescription>
          Notificaciones y menciones en cotizaciones
        </SheetDescription>

        <div className="mt-4 space-y-4">
          {/* Acciones */}
          {noLeidas.length > 0 && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarcarTodas}
                disabled={marcarTodasMutation.isPending}
              >
                {marcarTodasMutation.isPending ? (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                ) : (
                  <CheckCheck className="mr-2 h-3 w-3" />
                )}
                Marcar todas como leídas
              </Button>
            </div>
          )}

          {/* Lista de notificaciones */}
          <ScrollArea className="h-[calc(100vh-200px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Cargando notificaciones...
                </span>
              </div>
            ) : notificaciones.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-sm text-muted-foreground">
                  No tienes notificaciones
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {notificaciones.map((notif) => {
                  const tipoBadge = getTipoBadge(notif.tipo);
                  const prioridadColor = getPrioridadColor(notif.prioridad);

                  return (
                    <div
                      key={notif.id}
                      className={`rounded-lg border p-3 transition-colors ${
                        !notif.leida
                          ? 'border-primary/50 bg-primary/5'
                          : 'border-border bg-card'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge {...tipoBadge} className="text-[10px]">
                              {tipoBadge.label}
                            </Badge>
                            {!notif.leida && (
                              <span className="h-2 w-2 rounded-full bg-primary" />
                            )}
                          </div>

                          <h4 className="text-sm font-medium">{notif.titulo}</h4>

                          {notif.mensaje && (
                            <p className="text-xs text-muted-foreground">
                              {notif.mensaje}
                            </p>
                          )}

                          {notif.extracto && (
                            <p className="text-xs italic text-muted-foreground">
                              "{notif.extracto}"
                            </p>
                          )}

                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className={prioridadColor}>
                              {notif.prioridad}
                            </span>
                            <span>•</span>
                            <span>
                              {formatDistanceToNow(new Date(notif.creado_en), {
                                addSuffix: true,
                                locale: es,
                              })}
                            </span>
                            {notif.referencia_numero && (
                              <>
                                <span>•</span>
                                <span>
                                  {notif.entidad_tipo?.toUpperCase()}-
                                  {notif.referencia_numero}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {!notif.leida && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleMarcarLeida(notif.id)}
                            disabled={marcarLeidaMutation.isPending}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
