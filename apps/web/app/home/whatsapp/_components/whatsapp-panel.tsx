'use client';

import { useEffect, useRef, useState } from 'react';

import {
  Check,
  CheckCheck,
  Circle,
  Clock,
  FileText,
  Image,
  MessageSquare,
  Paperclip,
  Pause,
  Phone,
  Search,
  Send,
  Star,
  User,
  X,
} from 'lucide-react';

import { Avatar, AvatarFallback } from '@kit/ui/avatar';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card } from '@kit/ui/card';
import { Input } from '@kit/ui/input';
import { ScrollArea } from '@kit/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Textarea } from '@kit/ui/textarea';

import {
  conversacionesWhatsApp,
  templatesWhatsApp,
  usuarioActual,
  type ConversacionWhatsApp,
  type MensajeWhatsApp,
} from '~/lib/mock-data';

export function WhatsAppPanel() {
  const [conversaciones, setConversaciones] =
    useState<ConversacionWhatsApp[]>(conversacionesWhatsApp);
  const [conversacionActiva, setConversacionActiva] =
    useState<ConversacionWhatsApp | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [mensajeNuevo, setMensajeNuevo] = useState('');
  const [mostrarTemplates, setMostrarTemplates] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll al último mensaje cuando cambia la conversación activa
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversacionActiva]);

  const conversacionesFiltradas = conversaciones.filter((conv) => {
    const matchBusqueda =
      busqueda === '' ||
      conv.nombreContacto?.toLowerCase().includes(busqueda.toLowerCase()) ||
      conv.telefono.includes(busqueda) ||
      conv.ultimoMensaje.toLowerCase().includes(busqueda.toLowerCase());

    const matchEstado =
      filtroEstado === 'todos' || conv.estado === filtroEstado;

    return matchBusqueda && matchEstado;
  });

  const contadorNoLeidos = conversaciones.reduce(
    (acc, conv) => acc + conv.mensajesNoLeidos,
    0,
  );

  const handleSeleccionarConversacion = (conv: ConversacionWhatsApp) => {
    // Marcar mensajes como leídos
    setConversaciones((prev) =>
      prev.map((c) =>
        c.id === conv.id
          ? {
              ...c,
              mensajesNoLeidos: 0,
              mensajes: c.mensajes.map((m) => ({ ...m, leido: true })),
            }
          : c,
      ),
    );
    setConversacionActiva({
      ...conv,
      mensajesNoLeidos: 0,
      mensajes: conv.mensajes.map((m) => ({ ...m, leido: true })),
    });
  };

  const handleEnviarMensaje = () => {
    if (!mensajeNuevo.trim() || !conversacionActiva) return;

    const nuevoMensaje: MensajeWhatsApp = {
      id: `msg-${Date.now()}`,
      conversacionId: conversacionActiva.id,
      direccion: 'saliente',
      remitente: 'asesor',
      contenido: mensajeNuevo,
      tipo: 'texto',
      creadoEn: new Date().toISOString(),
      leido: false,
    };

    setConversaciones((prev) =>
      prev.map((c) =>
        c.id === conversacionActiva.id
          ? {
              ...c,
              mensajes: [...c.mensajes, nuevoMensaje],
              ultimoMensaje: mensajeNuevo,
              ultimoMensajeEn: nuevoMensaje.creadoEn,
            }
          : c,
      ),
    );

    setConversacionActiva((prev) =>
      prev
        ? {
            ...prev,
            mensajes: [...prev.mensajes, nuevoMensaje],
            ultimoMensaje: mensajeNuevo,
            ultimoMensajeEn: nuevoMensaje.creadoEn,
          }
        : null,
    );

    setMensajeNuevo('');
  };

  const handleEnviarTemplate = (templateId: string) => {
    const template = templatesWhatsApp.find((t) => t.id === templateId);
    if (!template || !conversacionActiva) return;

    const nuevoMensaje: MensajeWhatsApp = {
      id: `msg-${Date.now()}`,
      conversacionId: conversacionActiva.id,
      direccion: 'saliente',
      remitente: 'asesor',
      contenido: template.contenido,
      tipo: 'template',
      creadoEn: new Date().toISOString(),
      leido: false,
    };

    setConversaciones((prev) =>
      prev.map((c) =>
        c.id === conversacionActiva.id
          ? {
              ...c,
              mensajes: [...c.mensajes, nuevoMensaje],
              ultimoMensaje: `[Template] ${template.nombre}`,
              ultimoMensajeEn: nuevoMensaje.creadoEn,
            }
          : c,
      ),
    );

    setConversacionActiva((prev) =>
      prev
        ? {
            ...prev,
            mensajes: [...prev.mensajes, nuevoMensaje],
          }
        : null,
    );

    setMostrarTemplates(false);
  };

  const formatearTiempo = (fecha: string) => {
    const ahora = new Date();
    const fechaMensaje = new Date(fecha);
    const diffMs = ahora.getTime() - fechaMensaje.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHoras < 24) return `${diffHoras}h`;

    return fechaMensaje.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const getEstadoBadge = (estado: string) => {
    const badges = {
      activa: {
        variant: 'default' as const,
        label: 'Activa',
        className: 'bg-green-600',
      },
      pausada: {
        variant: 'secondary' as const,
        label: 'Pausada',
        className: 'bg-yellow-600',
      },
      cerrada: {
        variant: 'outline' as const,
        label: 'Cerrada',
        className: '',
      },
    };
    return badges[estado as keyof typeof badges] || badges.activa;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="gradient-brand rounded-lg p-2">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">WhatsApp Business</h2>
            <p className="text-xs text-muted-foreground">
              {contadorNoLeidos > 0
                ? `${contadorNoLeidos} mensajes sin leer`
                : 'Todas las conversaciones al día'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid h-[calc(100vh-200px)] gap-4 md:grid-cols-3">
        {/* Lista de Conversaciones */}
        <Card className="flex flex-col overflow-hidden md:col-span-1">
          {/* Filtros */}
          <div className="border-b p-3">
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="h-9 pl-8 text-sm"
              />
            </div>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="activa">Activas</SelectItem>
                <SelectItem value="pausada">Pausadas</SelectItem>
                <SelectItem value="cerrada">Cerradas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista */}
          <ScrollArea className="flex-1">
            <div className="divide-y">
              {conversacionesFiltradas.map((conv) => (
                <div
                  key={conv.id}
                  className={`cursor-pointer p-3 transition-colors hover:bg-muted/50 ${
                    conversacionActiva?.id === conv.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => handleSeleccionarConversacion(conv)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-green-600 text-white">
                        {conv.nombreContacto?.charAt(0) || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex items-center justify-between">
                        <span className="truncate text-sm font-medium">
                          {conv.nombreContacto || conv.telefono}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatearTiempo(conv.ultimoMensajeEn)}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {conv.ultimoMensaje}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        {conv.mensajesNoLeidos > 0 && (
                          <Badge
                            variant="default"
                            className="h-4 bg-green-600 px-1.5 text-[10px]"
                          >
                            {conv.mensajesNoLeidos}
                          </Badge>
                        )}
                        {conv.estado === 'pausada' && (
                          <Pause className="h-3 w-3 text-yellow-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Panel de Chat */}
        <Card className="flex flex-col overflow-hidden md:col-span-2">
          {conversacionActiva ? (
            <>
              {/* Header de Chat */}
              <div className="flex items-center justify-between border-b p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-green-600 text-white">
                      {conversacionActiva.nombreContacto?.charAt(0) || (
                        <User className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">
                      {conversacionActiva.nombreContacto || 'Sin nombre'}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {conversacionActiva.telefono}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={getEstadoBadge(conversacionActiva.estado).variant}
                    className={`text-xs ${getEstadoBadge(conversacionActiva.estado).className}`}
                  >
                    {getEstadoBadge(conversacionActiva.estado).label}
                  </Badge>
                  {conversacionActiva.leadId && (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Star className="h-3 w-3" />
                      Lead
                    </Badge>
                  )}
                </div>
              </div>

              {/* Mensajes */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3" ref={scrollRef}>
                  {conversacionActiva.mensajes.map((mensaje) => {
                    const esEntrante = mensaje.direccion === 'entrante';
                    return (
                      <div
                        key={mensaje.id}
                        className={`flex ${esEntrante ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            esEntrante
                              ? 'bg-muted'
                              : mensaje.remitente === 'bot'
                                ? 'bg-blue-100 dark:bg-blue-900/30'
                                : 'bg-green-600 text-white'
                          }`}
                        >
                          {mensaje.tipo === 'imagen' && (
                            <div className="mb-2 flex items-center gap-2 text-xs opacity-70">
                              <Image className="h-3 w-3" />
                              Imagen
                            </div>
                          )}
                          {mensaje.tipo === 'documento' && (
                            <div className="mb-2 flex items-center gap-2 text-xs opacity-70">
                              <FileText className="h-3 w-3" />
                              Documento
                            </div>
                          )}
                          <p className="whitespace-pre-wrap text-sm">
                            {mensaje.contenido}
                          </p>
                          <div
                            className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                              esEntrante ? 'text-muted-foreground' : 'opacity-70'
                            }`}
                          >
                            <span>
                              {new Date(mensaje.creadoEn).toLocaleTimeString(
                                'es-CO',
                                {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                },
                              )}
                            </span>
                            {!esEntrante &&
                              (mensaje.leido ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : (
                                <Check className="h-3 w-3" />
                              ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Input de Mensaje */}
              <div className="border-t p-3">
                {mostrarTemplates ? (
                  <div className="mb-3 rounded-lg border bg-muted/50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Plantillas Rápidas
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => setMostrarTemplates(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-2">
                      {templatesWhatsApp
                        .filter((t) => t.activo)
                        .map((template) => (
                          <Button
                            key={template.id}
                            variant="outline"
                            size="sm"
                            className="h-auto justify-start p-2 text-left"
                            onClick={() => handleEnviarTemplate(template.id)}
                          >
                            <div>
                              <p className="text-xs font-medium">
                                {template.nombre}
                              </p>
                              <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">
                                {template.contenido.substring(0, 60)}...
                              </p>
                            </div>
                          </Button>
                        ))}
                    </div>
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 w-9 p-0"
                    onClick={() => setMostrarTemplates(!mostrarTemplates)}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Textarea
                    value={mensajeNuevo}
                    onChange={(e) => setMensajeNuevo(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="min-h-[36px] resize-none"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleEnviarMensaje();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    className="gradient-brand h-9 w-9 p-0"
                    onClick={handleEnviarMensaje}
                    disabled={!mensajeNuevo.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 rounded-full bg-green-100 p-4 dark:bg-green-900/20">
                <MessageSquare className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mb-2 font-semibold">WhatsApp Business</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Selecciona una conversación para ver los mensajes y responder a
                tus clientes.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
