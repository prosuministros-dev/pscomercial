'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  MessageSquare,
  Send,
  ExternalLink,
  Star,
  Circle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@kit/ui/sheet';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import { ScrollArea } from '@kit/ui/scroll-area';
import { Textarea } from '@kit/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@kit/ui/collapsible';

import {
  notificacionesExtendidas as notificacionesData,
  usuarios,
  usuarioActual,
} from '~/lib/mock-data';
import type { NotificacionExtendida } from '~/lib/mock-data';

interface NotificacionesPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNotificacionClick?: (notificacion: NotificacionExtendida) => void;
}

export function NotificacionesPanel({
  open,
  onOpenChange,
  onNotificacionClick,
}: NotificacionesPanelProps) {
  const [notificaciones, setNotificaciones] =
    useState<NotificacionExtendida[]>(notificacionesData);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroFecha, setFiltroFecha] = useState<string>('todos');
  const [hiloAbierto, setHiloAbierto] = useState<string | null>(null);
  const [mensajeNuevo, setMensajeNuevo] = useState('');
  const [mostrarTodas, setMostrarTodas] = useState(false);

  const LIMITE_INICIAL = 50;

  // Marcar todas como leídas al abrir
  useEffect(() => {
    if (open) {
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    } else {
      setHiloAbierto(null);
      setMensajeNuevo('');
      setBusqueda('');
    }
  }, [open]);

  // Limpiar mensaje al cambiar de hilo
  useEffect(() => {
    setMensajeNuevo('');
  }, [hiloAbierto]);

  // Resetear "mostrar todas" al cambiar filtros
  useEffect(() => {
    setMostrarTodas(false);
  }, [busqueda, filtroTipo, filtroFecha]);

  // Filtrar notificaciones
  const notificacionesFiltradas = notificaciones.filter((n) => {
    if (busqueda) {
      const search = busqueda.toLowerCase();
      const matchMensaje = n.mensaje.toLowerCase().includes(search);
      const matchRemitente = n.remitente.toLowerCase().includes(search);
      const matchNumero = n.vinculo?.numero.toString().includes(search);
      if (!matchMensaje && !matchRemitente && !matchNumero) return false;
    }

    if (filtroTipo !== 'todos' && n.tipo !== filtroTipo) return false;

    if (filtroFecha !== 'todos') {
      const fechaNotif = new Date(n.creadoEn);
      const ahora = new Date();
      const diffDias = Math.floor(
        (ahora.getTime() - fechaNotif.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (filtroFecha === 'hoy' && diffDias > 0) return false;
      if (filtroFecha === 'semana' && diffDias > 7) return false;
      if (filtroFecha === 'mes' && diffDias > 30) return false;
    }

    return true;
  });

  // Agrupar por fecha
  const agruparPorFecha = (notifs: NotificacionExtendida[]) => {
    const grupos: { [key: string]: NotificacionExtendida[] } = {
      hoy: [],
      ayer: [],
      semana: [],
      antiguas: [],
    };

    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);
    const semanaAtras = new Date(hoy);
    semanaAtras.setDate(semanaAtras.getDate() - 7);

    const notifsLimitadas =
      !mostrarTodas && notifs.length > LIMITE_INICIAL
        ? notifs.slice(0, LIMITE_INICIAL)
        : notifs;

    notifsLimitadas.forEach((n) => {
      const fecha = new Date(n.creadoEn);
      const fechaSinHora = new Date(
        fecha.getFullYear(),
        fecha.getMonth(),
        fecha.getDate()
      );

      if (fechaSinHora.getTime() === hoy.getTime()) {
        grupos['hoy']!.push(n);
      } else if (fechaSinHora.getTime() === ayer.getTime()) {
        grupos['ayer']!.push(n);
      } else if (fechaSinHora >= semanaAtras) {
        grupos['semana']!.push(n);
      } else {
        grupos['antiguas']!.push(n);
      }
    });

    return grupos;
  };

  const gruposNotificaciones = agruparPorFecha(notificacionesFiltradas);
  const hayMasNotificaciones =
    notificacionesFiltradas.length > LIMITE_INICIAL && !mostrarTodas;

  // Estadísticas rápidas
  const stats = {
    importantes: notificaciones.filter((n) => n.importante).length,
    noRespondidas: notificaciones.filter(
      (n) => !n.respondida && (n.hilo?.length ?? 0) === 0
    ).length,
    noLeidas: notificaciones.filter((n) => !n.leida).length,
  };

  const handleMarcarImportante = (id: string) => {
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, importante: !n.importante } : n))
    );
    toast.success('Notificación actualizada');
  };

  const handleEnviarMensaje = (notificacionId: string) => {
    if (!mensajeNuevo.trim()) return;

    const nuevoMensaje = {
      id: `msg-${Date.now()}`,
      remitenteId: usuarioActual.id,
      remitente: usuarioActual.nombre,
      texto: mensajeNuevo,
      creadoEn: new Date().toISOString(),
    };

    setNotificaciones((prev) =>
      prev.map((n) => {
        if (n.id === notificacionId) {
          return {
            ...n,
            respondida: true,
            hilo: [...(n.hilo || []), nuevoMensaje],
          };
        }
        return n;
      })
    );

    setMensajeNuevo('');
    toast.success('Mensaje enviado');

    setTimeout(() => {
      toast.info('Los destinatarios han sido notificados');
    }, 500);
  };

  const handleIrAVinculo = (notificacion: NotificacionExtendida) => {
    if (notificacion.vinculo) {
      toast.info(
        `Redirigiendo a ${notificacion.vinculo.tipo} #${notificacion.vinculo.numero}...`
      );
      onNotificacionClick?.(notificacion);
      onOpenChange(false);
    }
  };

  const getColorTipo = (tipo: string) => {
    switch (tipo) {
      case 'automatica':
        return 'text-blue-500';
      case 'manual':
        return 'text-purple-500';
      case 'administrativa':
        return 'text-orange-500';
      case 'transaccional':
        return 'text-green-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getUsuario = (remitenteId: string) => {
    if (remitenteId === 'system') {
      return {
        nombre: 'Sistema',
        avatar: '',
        rol: 'Automatizado',
      };
    }
    return (
      usuarios.find((u) => u.id === remitenteId) || {
        nombre: 'Usuario',
        avatar: '',
        rol: 'Desconocido',
      }
    );
  };

  const formatearTiempo = (fecha: string) => {
    const ahora = new Date();
    const fechaNotif = new Date(fecha);
    const diffMs = ahora.getTime() - fechaNotif.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHoras < 24) return `Hace ${diffHoras}h`;
    if (diffDias < 7) return `Hace ${diffDias}d`;

    return fechaNotif.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:w-[380px] sm:max-w-[380px]"
      >
        <SheetTitle className="sr-only">Notificaciones</SheetTitle>
        <SheetDescription className="sr-only">
          Panel de notificaciones del sistema
        </SheetDescription>

        {/* Header ultra-compacto */}
        <div className="flex-shrink-0 border-b border-border/50 px-4 py-3">
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <h3 className="text-sm">Notificaciones</h3>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {notificacionesFiltradas.length}
            </span>
          </div>

          {/* Stats rápidas */}
          {!busqueda && filtroTipo === 'todos' && filtroFecha === 'todos' && (
            <div className="mb-3 flex gap-2">
              {stats.importantes > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-yellow-600 dark:text-yellow-400">
                  <Star className="h-3 w-3 fill-current" />
                  <span>{stats.importantes}</span>
                </div>
              )}
              {stats.noRespondidas > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-purple-600 dark:text-purple-400">
                  <MessageSquare className="h-3 w-3" />
                  <span>{stats.noRespondidas}</span>
                </div>
              )}
              {stats.noLeidas > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-primary">
                  <Circle className="h-3 w-3 fill-current" />
                  <span>{stats.noLeidas}</span>
                </div>
              )}
            </div>
          )}

          {/* Búsqueda compacta */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar..."
              className="h-8 border-border/50 pl-8 text-xs"
            />
          </div>

          {/* Filtros inline minimalistas */}
          <div className="mt-2 flex gap-1.5">
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="h-6 flex-1 border-0 bg-secondary/50 text-[10px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="automatica">Auto</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="administrativa">Admin</SelectItem>
                <SelectItem value="transaccional">Trans.</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroFecha} onValueChange={setFiltroFecha}>
              <SelectTrigger className="h-6 flex-1 border-0 bg-secondary/50 text-[10px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="hoy">Hoy</SelectItem>
                <SelectItem value="semana">7d</SelectItem>
                <SelectItem value="mes">30d</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista ultra-compacta agrupada */}
        <ScrollArea className="flex-1">
          {notificacionesFiltradas.length === 0 ? (
            <div className="py-16 text-center">
              <Bell className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground">Sin notificaciones</p>
            </div>
          ) : (
            <div>
              {Object.entries(gruposNotificaciones).map(([grupo, notifs]) => {
                if (notifs.length === 0) return null;

                const etiquetas: { [key: string]: string } = {
                  hoy: 'Hoy',
                  ayer: 'Ayer',
                  semana: 'Esta semana',
                  antiguas: 'Anteriores',
                };

                return (
                  <div key={grupo}>
                    <div className="sticky top-0 z-10 border-b border-border/30 bg-background/95 px-4 py-1.5 backdrop-blur-sm">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {etiquetas[grupo]} ({notifs.length})
                      </span>
                    </div>

                    <div className="divide-y divide-border/30">
                      {notifs.map((notificacion) => {
                        const usuario = getUsuario(notificacion.remitenteId);
                        const esHiloAbierto = hiloAbierto === notificacion.id;

                        return (
                          <Collapsible
                            key={notificacion.id}
                            open={esHiloAbierto}
                            onOpenChange={(isOpen) =>
                              setHiloAbierto(isOpen ? notificacion.id : null)
                            }
                          >
                            <div
                              className={`
                                cursor-pointer border-l-2 px-4 py-2.5 transition-all hover:bg-secondary/30
                                ${
                                  !notificacion.leida
                                    ? 'border-l-primary bg-primary/5'
                                    : 'border-l-transparent'
                                }
                                ${esHiloAbierto ? 'bg-secondary/20' : ''}
                              `}
                            >
                              <div className="flex items-start gap-2.5">
                                <Avatar className="mt-0.5 h-7 w-7 flex-shrink-0">
                                  {usuario.avatar ? (
                                    <AvatarImage
                                      src={usuario.avatar}
                                      alt={usuario.nombre}
                                    />
                                  ) : (
                                    <AvatarFallback className="text-[10px]">
                                      {usuario.nombre.charAt(0)}
                                    </AvatarFallback>
                                  )}
                                </Avatar>

                                <div className="min-w-0 flex-1">
                                  <div className="mb-0.5 flex items-center justify-between gap-2">
                                    <div className="flex min-w-0 flex-1 items-center gap-1.5">
                                      <span className="truncate text-[11px]">
                                        {usuario.nombre}
                                      </span>
                                      <Circle
                                        className={`h-1 w-1 fill-current ${getColorTipo(notificacion.tipo)}`}
                                      />
                                      <span className="shrink-0 text-[10px] text-muted-foreground">
                                        {formatearTiempo(notificacion.creadoEn)}
                                      </span>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-1">
                                      {notificacion.importante && (
                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                      )}
                                      {!notificacion.leida && (
                                        <Circle className="h-1.5 w-1.5 fill-primary text-primary" />
                                      )}
                                    </div>
                                  </div>

                                  <p className="mb-1.5 text-xs leading-snug text-foreground/90">
                                    {notificacion.mensaje}
                                  </p>

                                  <div className="flex flex-wrap items-center gap-2">
                                    {notificacion.vinculo && (
                                      <button
                                        onClick={() =>
                                          handleIrAVinculo(notificacion)
                                        }
                                        className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
                                      >
                                        <ExternalLink className="h-2.5 w-2.5" />
                                        {notificacion.vinculo.tipo} #
                                        {notificacion.vinculo.numero}
                                      </button>
                                    )}

                                    {notificacion.hilo &&
                                    notificacion.hilo.length > 0 ? (
                                      <CollapsibleTrigger asChild>
                                        <button className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
                                          {esHiloAbierto ? (
                                            <ChevronDown className="h-3 w-3" />
                                          ) : (
                                            <ChevronRight className="h-3 w-3" />
                                          )}
                                          {notificacion.hilo.length} resp.
                                        </button>
                                      </CollapsibleTrigger>
                                    ) : (
                                      <CollapsibleTrigger asChild>
                                        <button className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
                                          <MessageSquare className="h-2.5 w-2.5" />
                                          Responder
                                        </button>
                                      </CollapsibleTrigger>
                                    )}

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarcarImportante(notificacion.id);
                                      }}
                                      className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-yellow-500"
                                    >
                                      <Star className="h-2.5 w-2.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <CollapsibleContent>
                              <div className="border-t border-border/30 bg-secondary/20 px-4 pb-3 pt-2">
                                {notificacion.hilo &&
                                  notificacion.hilo.length > 0 && (
                                    <div className="mb-2.5 space-y-1.5">
                                      {notificacion.hilo.map((mensaje) => {
                                        const esMio =
                                          mensaje.remitenteId ===
                                          usuarioActual.id;
                                        const usuarioMsg = getUsuario(
                                          mensaje.remitenteId
                                        );

                                        return (
                                          <div
                                            key={mensaje.id}
                                            className={`flex gap-1.5 ${esMio ? 'flex-row-reverse' : ''}`}
                                          >
                                            <Avatar className="h-5 w-5 flex-shrink-0">
                                              {usuarioMsg.avatar ? (
                                                <AvatarImage
                                                  src={usuarioMsg.avatar}
                                                  alt={usuarioMsg.nombre}
                                                />
                                              ) : (
                                                <AvatarFallback className="text-[9px]">
                                                  {usuarioMsg.nombre.charAt(0)}
                                                </AvatarFallback>
                                              )}
                                            </Avatar>
                                            <div
                                              className={`flex-1 ${esMio ? 'text-right' : ''}`}
                                            >
                                              <div
                                                className={`
                                                inline-block max-w-[85%] rounded-md px-2 py-1 text-[11px]
                                                ${
                                                  esMio
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'border border-border/50 bg-background'
                                                }
                                              `}
                                              >
                                                <p className="mb-0.5 text-[9px] opacity-70">
                                                  {usuarioMsg.nombre}
                                                </p>
                                                <p className="leading-snug">
                                                  {mensaje.texto}
                                                </p>
                                              </div>
                                              <p className="mt-0.5 text-[9px] text-muted-foreground">
                                                {formatearTiempo(
                                                  mensaje.creadoEn
                                                )}
                                              </p>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}

                                <div className="flex gap-1.5">
                                  <Textarea
                                    value={mensajeNuevo}
                                    onChange={(e) =>
                                      setMensajeNuevo(e.target.value)
                                    }
                                    placeholder="Responder..."
                                    rows={1}
                                    className="h-8 min-h-[32px] resize-none py-1.5 text-xs"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleEnviarMensaje(notificacion.id);
                                      }
                                    }}
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleEnviarMensaje(notificacion.id)
                                    }
                                    disabled={!mensajeNuevo.trim()}
                                    className="h-8 w-8 shrink-0 p-0"
                                  >
                                    <Send className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer minimalista */}
        <div className="flex-shrink-0 border-t border-border/30 px-4 py-2">
          {hayMasNotificaciones ? (
            <button
              onClick={() => setMostrarTodas(true)}
              className="w-full py-1 text-[10px] text-primary transition-colors hover:text-primary/80"
            >
              Cargar {notificacionesFiltradas.length - LIMITE_INICIAL} más
              notificaciones
            </button>
          ) : (
            <button
              onClick={() =>
                toast.info('Vista completa de historial próximamente')
              }
              className="w-full py-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Ver historial completo
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
