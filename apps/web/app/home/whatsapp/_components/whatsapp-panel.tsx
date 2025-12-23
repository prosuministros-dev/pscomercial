'use client';

import { useEffect, useRef, useState } from 'react';

import {
  Check,
  CheckCheck,
  FileText,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Pause,
  Plus,
  Search,
  Send,
  User,
  UserPlus,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';

import {
  useConversaciones,
  useMensajes,
  useEnviarMensaje,
  useMarcarMensajesLeidos,
  useTemplates,
  useEnviarTemplate,
  useWhatsAppRealtime,
  type WhatsAppConversacion,
  type WhatsAppMensaje,
  type ConversacionEstado,
} from '~/lib/whatsapp';

// Mock data para cuando no hay BD conectada
const mockConversaciones: WhatsAppConversacion[] = [
  {
    id: 'conv-1',
    telefono_cliente: '+57 310 555 0100',
    nombre_contacto: 'Pedro Martínez',
    estado: 'ACTIVA',
    estado_bot: 'MENU_PRINCIPAL',
    datos_capturados: {},
    mensajes_no_leidos: 1,
    ultimo_mensaje: 'Perfecto! ¿Cuántas laptops necesitas?',
    ultimo_mensaje_en: '2025-12-10T09:26:00Z',
    recordatorio_1_enviado: false,
    recordatorio_2_enviado: false,
    adjuntos_temporales: [],
    metadata: {},
    creado_en: '2025-12-10T09:20:00Z',
    mensajes: [
      {
        id: 'msg-1',
        conversacion_id: 'conv-1',
        direccion: 'ENTRANTE',
        remitente: 'USUARIO',
        contenido: 'Hola, necesito información',
        tipo: 'TEXTO',
        adjuntos: [],
        leido: true,
        creado_en: '2025-12-10T09:20:00Z',
      },
      {
        id: 'msg-2',
        conversacion_id: 'conv-1',
        direccion: 'SALIENTE',
        remitente: 'BOT',
        contenido:
          '👋 ¡Hola! Bienvenido a PROSUMINISTROS 🧰\nTu aliado en hardware, software, accesorios y servicios de infraestructura IT.\n\nPara poder atenderte mejor, por favor cuéntame qué deseas hacer hoy:\n\n1️⃣ Solicitar una cotización\n2️⃣ Consulta el estado de tu pedido\n3️⃣ Otro motivo',
        tipo: 'TEMPLATE',
        adjuntos: [],
        leido: true,
        creado_en: '2025-12-10T09:20:05Z',
      },
      {
        id: 'msg-3',
        conversacion_id: 'conv-1',
        direccion: 'ENTRANTE',
        remitente: 'USUARIO',
        contenido: 'Necesito cotización para laptops',
        tipo: 'TEXTO',
        adjuntos: [],
        leido: true,
        creado_en: '2025-12-10T09:25:00Z',
      },
      {
        id: 'msg-4',
        conversacion_id: 'conv-1',
        direccion: 'SALIENTE',
        remitente: 'ASESOR',
        contenido: 'Perfecto! ¿Cuántas laptops necesitas?',
        tipo: 'TEXTO',
        adjuntos: [],
        leido: false,
        creado_en: '2025-12-10T09:26:00Z',
      },
    ],
  },
  {
    id: 'conv-2',
    telefono_cliente: '+57 320 444 0200',
    nombre_contacto: 'María González',
    estado: 'ACTIVA',
    estado_bot: 'FLUJO_COTIZACION',
    datos_capturados: { nombre: 'María González' },
    mensajes_no_leidos: 0,
    ultimo_mensaje: 'Gracias! Estoy revisando la cotización',
    ultimo_mensaje_en: '2025-12-10T08:15:00Z',
    recordatorio_1_enviado: false,
    recordatorio_2_enviado: false,
    adjuntos_temporales: [],
    metadata: {},
    creado_en: '2025-12-10T07:30:00Z',
    mensajes: [],
  },
  {
    id: 'conv-3',
    telefono_cliente: '+57 315 888 0300',
    nombre_contacto: 'Carlos Ruiz',
    estado: 'PAUSADA',
    estado_bot: 'FLUJO_PEDIDO',
    datos_capturados: {},
    mensajes_no_leidos: 0,
    ultimo_mensaje: 'Ok, te aviso cuando estén listos',
    ultimo_mensaje_en: '2025-12-09T16:45:00Z',
    recordatorio_1_enviado: true,
    recordatorio_2_enviado: false,
    adjuntos_temporales: [],
    metadata: {},
    creado_en: '2025-12-09T16:30:00Z',
    mensajes: [],
  },
];

const mockTemplates = [
  {
    id: 'tpl-1',
    nombre: 'Bienvenida',
    codigo: 'TPL_A_BIENVENIDA',
    categoria: 'BIENVENIDA' as const,
    contenido:
      '👋 ¡Hola! Bienvenido a PROSUMINISTROS 🧰\nTu aliado en hardware, software, accesorios y servicios de infraestructura IT.\n\n¿Cuál es tu nombre completo?',
    variables: [],
    estado_meta: 'APROBADO' as const,
    activo: true,
    creado_en: '2025-01-01T00:00:00Z',
  },
  {
    id: 'tpl-2',
    nombre: 'Menú Principal',
    codigo: 'TPL_A_MENU',
    categoria: 'BIENVENIDA' as const,
    contenido:
      'Gracias. Para poder atenderte mejor, por favor cuéntame qué deseas hacer hoy:\n\n1️⃣ Solicitar una cotización\n2️⃣ Consulta el estado de tu pedido\n3️⃣ Otro motivo\n\nEstoy aquí para apoyarte. 🚀',
    variables: [],
    estado_meta: 'APROBADO' as const,
    activo: true,
    creado_en: '2025-01-01T00:00:00Z',
  },
  {
    id: 'tpl-3',
    nombre: 'Confirmación Final',
    codigo: 'TPL_I_CONFIRMACION',
    categoria: 'CONFIRMACION' as const,
    contenido:
      '¡Perfecto! Tu solicitud fue registrada con el número #{{numero_caso}}. Nuestro equipo la revisará y te responderá lo más pronto posible.',
    variables: ['numero_caso'],
    estado_meta: 'APROBADO' as const,
    activo: true,
    creado_en: '2025-01-01T00:00:00Z',
  },
];

export function WhatsAppPanel() {
  // State
  const [conversacionActivaId, setConversacionActivaId] = useState<
    string | null
  >(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [mensajeNuevo, setMensajeNuevo] = useState('');
  const [mostrarTemplates, setMostrarTemplates] = useState(false);
  const [mostrarCrearLead, setMostrarCrearLead] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // React Query hooks con fallback a mock data
  const {
    data: conversacionesData,
    isLoading: loadingConversaciones,
    error: errorConversaciones,
  } = useConversaciones(
    filtroEstado !== 'todos'
      ? { estado: filtroEstado as ConversacionEstado }
      : undefined,
  );

  const { data: mensajesData, isLoading: loadingMensajes } =
    useMensajes(conversacionActivaId);

  const { data: templatesData } = useTemplates({ activo: true });

  const enviarMensajeMutation = useEnviarMensaje();
  const marcarLeidosMutation = useMarcarMensajesLeidos();
  const enviarTemplateMutation = useEnviarTemplate();

  // Usar mock data si hay error o no hay datos
  const conversaciones =
    errorConversaciones || !conversacionesData
      ? mockConversaciones
      : conversacionesData;

  const templates = templatesData || mockTemplates;

  // Encontrar conversación activa
  const conversacionActiva = conversaciones.find(
    (c) => c.id === conversacionActivaId,
  );

  // Mensajes de la conversación activa
  const mensajes =
    mensajesData ||
    (conversacionActiva?.mensajes as WhatsAppMensaje[] | undefined) ||
    [];

  // Habilitar Supabase Realtime
  useWhatsAppRealtime();

  // Scroll al último mensaje
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensajes]);

  // Filtrar conversaciones
  const conversacionesFiltradas = conversaciones.filter((conv) => {
    const matchBusqueda =
      busqueda === '' ||
      conv.nombre_contacto?.toLowerCase().includes(busqueda.toLowerCase()) ||
      conv.telefono_cliente.includes(busqueda) ||
      conv.ultimo_mensaje?.toLowerCase().includes(busqueda.toLowerCase());

    return matchBusqueda;
  });

  // Contador de no leídos
  const contadorNoLeidos = conversaciones.reduce(
    (acc, conv) => acc + (conv.mensajes_no_leidos || 0),
    0,
  );

  // Handlers
  const handleSeleccionarConversacion = (conv: WhatsAppConversacion) => {
    setConversacionActivaId(conv.id);
    if (conv.mensajes_no_leidos > 0) {
      marcarLeidosMutation.mutate(conv.id);
    }
  };

  const handleEnviarMensaje = () => {
    if (!mensajeNuevo.trim() || !conversacionActivaId) return;

    enviarMensajeMutation.mutate({
      conversacion_id: conversacionActivaId,
      contenido: mensajeNuevo,
      tipo: 'TEXTO',
    });

    setMensajeNuevo('');
  };

  const handleEnviarTemplate = (templateCodigo: string) => {
    if (!conversacionActivaId) return;

    enviarTemplateMutation.mutate({
      conversacion_id: conversacionActivaId,
      template_codigo: templateCodigo,
      variables: {},
    });

    setMostrarTemplates(false);
  };

  const formatearTiempo = (fecha: string | null | undefined) => {
    if (!fecha) return '';
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
      ACTIVA: {
        variant: 'default' as const,
        label: 'Activa',
        className: 'bg-green-600',
      },
      PAUSADA: {
        variant: 'secondary' as const,
        label: 'Pausada',
        className: 'bg-yellow-600',
      },
      CERRADA: {
        variant: 'outline' as const,
        label: 'Cerrada',
        className: '',
      },
      INCOMPLETA: {
        variant: 'destructive' as const,
        label: 'Incompleta',
        className: '',
      },
    };
    return badges[estado as keyof typeof badges] || badges.ACTIVA;
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
              {loadingConversaciones ? (
                'Cargando...'
              ) : contadorNoLeidos > 0 ? (
                `${contadorNoLeidos} mensajes sin leer`
              ) : (
                'Todas las conversaciones al día'
              )}
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline">
          <Plus className="mr-1 h-4 w-4" />
          Nueva conversación
        </Button>
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
                <SelectItem value="ACTIVA">Activas</SelectItem>
                <SelectItem value="PAUSADA">Pausadas</SelectItem>
                <SelectItem value="CERRADA">Cerradas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista */}
          <ScrollArea className="flex-1">
            {loadingConversaciones ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="divide-y">
                {conversacionesFiltradas.map((conv) => (
                  <div
                    key={conv.id}
                    className={`cursor-pointer p-3 transition-colors hover:bg-muted/50 ${
                      conversacionActivaId === conv.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => handleSeleccionarConversacion(conv)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-green-600 text-white">
                          {conv.nombre_contacto?.charAt(0) || (
                            <User className="h-4 w-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex items-center justify-between">
                          <span className="truncate text-sm font-medium">
                            {conv.nombre_contacto || conv.telefono_cliente}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatearTiempo(conv.ultimo_mensaje_en)}
                          </span>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {conv.ultimo_mensaje || 'Nueva conversación'}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          {conv.mensajes_no_leidos > 0 && (
                            <Badge
                              variant="default"
                              className="h-4 bg-green-600 px-1.5 text-[10px]"
                            >
                              {conv.mensajes_no_leidos}
                            </Badge>
                          )}
                          {conv.estado === 'PAUSADA' && (
                            <Pause className="h-3 w-3 text-yellow-600" />
                          )}
                          {conv.lead_id && (
                            <Badge
                              variant="outline"
                              className="h-4 px-1.5 text-[10px]"
                            >
                              Lead
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                      {conversacionActiva.nombre_contacto?.charAt(0) || (
                        <User className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">
                      {conversacionActiva.nombre_contacto || 'Sin nombre'}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {conversacionActiva.telefono_cliente}
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
                  {!conversacionActiva.lead_id && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setMostrarCrearLead(true)}
                    >
                      <UserPlus className="mr-1 h-4 w-4" />
                      Crear Lead
                    </Button>
                  )}
                </div>
              </div>

              {/* Mensajes */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3" ref={scrollRef}>
                  {loadingMensajes ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    mensajes.map((mensaje) => {
                      const esEntrante = mensaje.direccion === 'ENTRANTE';
                      return (
                        <div
                          key={mensaje.id}
                          className={`flex ${esEntrante ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              esEntrante
                                ? 'bg-muted'
                                : mensaje.remitente === 'BOT'
                                  ? 'bg-blue-100 dark:bg-blue-900/30'
                                  : 'bg-green-600 text-white'
                            }`}
                          >
                            {mensaje.tipo === 'IMAGEN' && (
                              <div className="mb-2 flex items-center gap-2 text-xs opacity-70">
                                <ImageIcon className="h-3 w-3" />
                                Imagen
                              </div>
                            )}
                            {mensaje.tipo === 'DOCUMENTO' && (
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
                                esEntrante
                                  ? 'text-muted-foreground'
                                  : 'opacity-70'
                              }`}
                            >
                              <span>
                                {new Date(mensaje.creado_en).toLocaleTimeString(
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
                    })
                  )}
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
                      {templates
                        .filter((t) => t.activo)
                        .slice(0, 5)
                        .map((template) => (
                          <Button
                            key={template.id}
                            variant="outline"
                            size="sm"
                            className="h-auto justify-start p-2 text-left"
                            onClick={() => handleEnviarTemplate(template.codigo)}
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
                    disabled={
                      !mensajeNuevo.trim() || enviarMensajeMutation.isPending
                    }
                  >
                    {enviarMensajeMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
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

      {/* Dialog Crear Lead */}
      <Dialog open={mostrarCrearLead} onOpenChange={setMostrarCrearLead}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Lead desde Conversación</DialogTitle>
            <DialogDescription>
              Convierte esta conversación de WhatsApp en un Lead para
              seguimiento comercial.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              Esta funcionalidad estará disponible cuando la base de datos esté
              conectada. Los datos del contacto se pre-llenarán automáticamente
              desde la conversación.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMostrarCrearLead(false)}
            >
              Cancelar
            </Button>
            <Button onClick={() => setMostrarCrearLead(false)}>
              Crear Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
