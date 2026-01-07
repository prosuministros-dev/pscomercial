'use client';

import { useState } from 'react';

import {
  Copy,
  DollarSign,
  Download,
  FileText,
  LayoutGrid,
  List,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  ShoppingCart,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card } from '@kit/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';

import {
  useCotizaciones,
  useCotizacionStats,
  useDuplicarCotizacion,
  useTrmActual,
  type CotizacionEstado,
} from '~/lib/cotizaciones';

import { CotizacionesKanban } from './cotizaciones-kanban';
import { CrearCotizacionModal } from './crear-cotizacion-modal';
import { DetalleCotizacionModal } from './detalle-cotizacion-modal';

type VistaType = 'tabla' | 'kanban';

// Tipo para cotización desde la DB
type CotizacionDB = NonNullable<ReturnType<typeof useCotizaciones>['data']>[number];

export function CotizacionesView() {
  const [vistaActual, setVistaActual] = useState<VistaType>('kanban');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [modalCrear, setModalCrear] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [cotizacionSeleccionada, setCotizacionSeleccionada] =
    useState<CotizacionDB | null>(null);

  // Datos reales de Supabase
  const { data: cotizaciones = [], isLoading } = useCotizaciones();
  const { data: stats } = useCotizacionStats();
  const { data: trmData } = useTrmActual();
  const trmActual = trmData?.valor || 4250;

  // Mutation para duplicar
  const duplicarMutation = useDuplicarCotizacion();

  // Filtrar cotizaciones
  const cotizacionesFiltradas = cotizaciones.filter((cotizacion) => {
    const matchEstado =
      filtroEstado === 'todos' || cotizacion.estado === filtroEstado;
    const matchBusqueda =
      busqueda === '' ||
      cotizacion.numero.toString().includes(busqueda) ||
      cotizacion.razon_social.toLowerCase().includes(busqueda.toLowerCase());
    return matchEstado && matchBusqueda;
  });

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { variant: 'outline' | 'secondary' | 'default' | 'destructive'; label: string; className: string }> = {
      BORRADOR: {
        variant: 'outline',
        label: 'Borrador',
        className: 'border-gray-400 text-gray-600 dark:text-gray-400',
      },
      CREACION_OFERTA: {
        variant: 'outline',
        label: 'Creación Oferta',
        className: 'border-blue-500 text-blue-600',
      },
      PENDIENTE_APROBACION_MARGEN: {
        variant: 'outline',
        label: 'Aprob. Margen',
        className: 'border-orange-500 text-orange-600',
      },
      NEGOCIACION: {
        variant: 'outline',
        label: 'Negociación',
        className: 'border-purple-500 text-purple-600',
      },
      RIESGO: {
        variant: 'outline',
        label: 'Riesgo',
        className: 'border-orange-500 text-orange-600',
      },
      ENVIADA_CLIENTE: {
        variant: 'outline',
        label: 'Enviada',
        className: 'border-blue-500 text-blue-600 dark:text-blue-400',
      },
      PROFORMA_ENVIADA: {
        variant: 'outline',
        label: 'Proforma',
        className: 'border-cyan-500 text-cyan-600',
      },
      PENDIENTE_AJUSTES: {
        variant: 'outline',
        label: 'Ajustes',
        className: 'border-yellow-500 text-yellow-600',
      },
      ACEPTADA_CLIENTE: {
        variant: 'default',
        label: 'Aceptada',
        className: 'bg-green-600',
      },
      RECHAZADA_CLIENTE: {
        variant: 'destructive',
        label: 'Rechazada',
        className: '',
      },
      PENDIENTE_OC: {
        variant: 'outline',
        label: 'Pendiente OC',
        className: 'border-green-500 text-green-600',
      },
      GANADA: {
        variant: 'default',
        label: 'Ganada',
        className: 'bg-green-600',
      },
      PERDIDA: {
        variant: 'secondary',
        label: 'Perdida',
        className: 'opacity-60',
      },
    };
    const badge = badges[estado];
    if (!badge)
      return (
        <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
          {estado}
        </Badge>
      );
    return (
      <Badge
        variant={badge.variant}
        className={`h-4 px-1.5 text-[10px] ${badge.className || ''}`}
      >
        {badge.label}
      </Badge>
    );
  };

  const getFormaPagoLabel = (formaPago: string) => {
    const labels: Record<string, string> = {
      ANTICIPADO: 'Anticip.',
      CONTRA_ENTREGA: 'C/Entrega',
      CREDITO_8: 'Créd 8d',
      CREDITO_15: 'Créd 15d',
      CREDITO_30: 'Créd 30d',
      CREDITO_45: 'Créd 45d',
      CREDITO_60: 'Créd 60d',
      CREDITO_90: 'Créd 90d',
    };
    return labels[formaPago] || formaPago;
  };

  const handleVerDetalle = (cotizacion: CotizacionDB) => {
    setCotizacionSeleccionada(cotizacion);
    setModalDetalle(true);
  };

  const handleDuplicar = async (cotizacion: CotizacionDB) => {
    try {
      const result = await duplicarMutation.mutateAsync({ id: cotizacion.id });
      toast.success(
        `Cotización #${result.numeroOriginal} duplicada como #${result.numeroNuevo}`
      );
    } catch (error) {
      console.error('Error al duplicar:', error);
      toast.error('Error al duplicar la cotización');
    }
  };

  const handleGenerarPedido = () => {
    toast.success('Pedido generado exitosamente');
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header con TRM y toggle de vista */}
      <div className="mb-3 flex flex-shrink-0 items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="gradient-accent rounded-lg p-2">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Cotizaciones</h2>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                Propuestas comerciales
              </p>
              <Badge variant="outline" className="h-5 gap-1 px-2 text-[10px]">
                <DollarSign className="h-3 w-3" />
                TRM: ${trmActual.toLocaleString('es-CO')}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle de Vista */}
          <div className="flex items-center overflow-hidden rounded-lg border border-border">
            <Button
              variant={vistaActual === 'tabla' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setVistaActual('tabla')}
              className="h-9 rounded-none border-0"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={vistaActual === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setVistaActual('kanban')}
              className="h-9 rounded-none border-0"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>

          <Button
            size="sm"
            onClick={() => setModalCrear(true)}
            className="gradient-brand h-8 gap-2 px-3 text-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nueva</span>
          </Button>
        </div>
      </div>

      {/* Vistas */}
      <div className="min-h-0 flex-1 overflow-hidden">
        {vistaActual === 'kanban' ? (
          <CotizacionesKanban
            cotizaciones={cotizaciones}
            onVerDetalle={handleVerDetalle}
            onCrear={() => setModalCrear(true)}
          />
        ) : (
          <div className="flex h-full flex-col space-y-3">
            {/* Filtros */}
            <div className="flex flex-shrink-0 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número o cliente..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="h-8 pl-8 text-sm"
                />
              </div>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger className="h-8 w-[160px] text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="BORRADOR">Borrador</SelectItem>
                  <SelectItem value="CREACION_OFERTA">Creación Oferta</SelectItem>
                  <SelectItem value="NEGOCIACION">Negociación</SelectItem>
                  <SelectItem value="RIESGO">Riesgo</SelectItem>
                  <SelectItem value="PENDIENTE_OC">Pendiente OC</SelectItem>
                  <SelectItem value="GANADA">Ganada</SelectItem>
                  <SelectItem value="PERDIDA">Perdida</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stats */}
            <div className="grid flex-shrink-0 grid-cols-2 gap-2 md:grid-cols-4">
              {[
                { label: 'Total', count: stats?.total || 0 },
                { label: 'En Negociación', count: stats?.en_negociacion || 0 },
                { label: 'Pendiente OC', count: stats?.pendiente_oc || 0 },
                { label: 'Ganadas', count: stats?.ganadas || 0 },
              ].map((stat) => (
                <Card key={stat.label} className="p-2">
                  <p className="text-[10px] text-muted-foreground">
                    {stat.label}
                  </p>
                  <h4 className="mt-0.5 text-base font-bold">{stat.count}</h4>
                </Card>
              ))}
            </div>

            {/* Tabla - Desktop */}
            <Card className="hidden min-h-0 flex-1 overflow-hidden md:block">
              <div className="h-full overflow-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-10 bg-muted/50">
                    <tr className="text-[10px]">
                      <th className="px-2 py-1.5 text-left font-medium">
                        Estado
                      </th>
                      <th className="px-2 py-1.5 text-left font-medium">#</th>
                      <th className="px-2 py-1.5 text-left font-medium">
                        Cliente
                      </th>
                      <th className="px-2 py-1.5 text-left font-medium">
                        Fecha
                      </th>
                      <th className="px-2 py-1.5 text-left font-medium">
                        Pago
                      </th>
                      <th className="px-2 py-1.5 text-right font-medium">
                        Venta
                      </th>
                      <th className="px-2 py-1.5 text-right font-medium">
                        Margen
                      </th>
                      <th className="px-2 py-1.5 text-left font-medium">
                        Alertas
                      </th>
                      <th className="px-2 py-1.5 text-right font-medium">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {cotizacionesFiltradas.map((cotizacion) => (
                      <tr
                        key={cotizacion.id}
                        className="text-xs transition-colors hover:bg-muted/30"
                      >
                        <td className="px-2 py-1.5">
                          {getEstadoBadge(cotizacion.estado || 'BORRADOR')}
                        </td>
                        <td className="px-2 py-1.5">
                          <span className="font-mono text-[10px]">
                            #{cotizacion.numero}
                          </span>
                        </td>
                        <td className="max-w-[150px] truncate px-2 py-1.5 text-[10px]">
                          {cotizacion.razon_social}
                        </td>
                        <td className="px-2 py-1.5 text-[10px] text-muted-foreground">
                          {new Date(
                            cotizacion.fecha_cotizacion
                          ).toLocaleDateString('es-CO', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-2 py-1.5">
                          <Badge
                            variant="outline"
                            className="h-4 px-1 text-[9px]"
                          >
                            {getFormaPagoLabel(cotizacion.forma_pago || 'ANTICIPADO')}
                          </Badge>
                        </td>
                        <td className="px-2 py-1.5 text-right text-[10px]">
                          ${((cotizacion.total_venta || 0) / 1000000).toFixed(1)}M
                        </td>
                        <td className="px-2 py-1.5 text-right">
                          <span
                            className={`text-[10px] font-medium ${
                              (cotizacion.margen_porcentaje || 0) < 10
                                ? 'text-orange-600 dark:text-orange-400'
                                : 'text-green-600 dark:text-green-400'
                            }`}
                          >
                            {(cotizacion.margen_porcentaje || 0).toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-2 py-1.5">
                          <div className="flex flex-wrap gap-0.5">
                            {cotizacion.requiere_aprobacion_margen && (
                              <Badge
                                variant="outline"
                                className="h-3.5 border-orange-500 px-1 text-[9px] text-orange-600"
                              >
                                Margen
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-1.5">
                          <div className="flex items-center justify-end gap-0.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-[10px]"
                              onClick={() => handleVerDetalle(cotizacion)}
                            >
                              Ver
                            </Button>
                            {cotizacion.estado === 'PENDIENTE_OC' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 gap-1 px-2 text-[10px]"
                                onClick={() => {
                                  setCotizacionSeleccionada(cotizacion);
                                  handleGenerarPedido();
                                }}
                              >
                                <ShoppingCart className="h-2.5 w-2.5" />
                                Pedido
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {cotizacion.estado === 'BORRADOR' && (
                                  <DropdownMenuItem className="gap-2 text-xs">
                                    <Send className="h-3 w-3" />
                                    Enviar al cliente
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="gap-2 text-xs"
                                  onClick={() => handleDuplicar(cotizacion)}
                                >
                                  <Copy className="h-3 w-3" />
                                  Duplicar
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 text-xs">
                                  <Download className="h-3 w-3" />
                                  Generar Proforma
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {cotizacionesFiltradas.length === 0 && (
                <div className="p-8 text-center">
                  <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No se encontraron cotizaciones
                  </p>
                </div>
              )}
            </Card>

            {/* Lista - Mobile */}
            <div className="flex-1 space-y-2 overflow-y-auto md:hidden">
              {cotizacionesFiltradas.map((cotizacion) => (
                <Card key={cotizacion.id} className="p-2.5">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">
                        #{cotizacion.numero}
                      </span>
                      {getEstadoBadge(cotizacion.estado || 'BORRADOR')}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs"
                      onClick={() => handleVerDetalle(cotizacion)}
                    >
                      Ver
                    </Button>
                  </div>

                  <p className="mb-2 truncate text-xs font-medium">
                    {cotizacion.razon_social}
                  </p>

                  {/* Alertas */}
                  {cotizacion.requiere_aprobacion_margen && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      <Badge
                        variant="outline"
                        className="h-4 border-orange-500 text-[10px] text-orange-600"
                      >
                        Margen bajo
                      </Badge>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Venta</p>
                      <p className="font-medium">
                        ${((cotizacion.total_venta || 0) / 1000000).toFixed(1)}M
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Margen</p>
                      <p
                        className={`font-medium ${
                          (cotizacion.margen_porcentaje || 0) < 10
                            ? 'text-orange-600'
                            : 'text-green-600'
                        }`}
                      >
                        {(cotizacion.margen_porcentaje || 0).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fecha</p>
                      <p>
                        {new Date(cotizacion.fecha_cotizacion).toLocaleDateString(
                          'es-CO',
                          { month: 'short', day: 'numeric' }
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pago</p>
                      <p className="truncate">
                        {getFormaPagoLabel(cotizacion.forma_pago || 'ANTICIPADO')}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
              {cotizacionesFiltradas.length === 0 && (
                <Card className="p-8 text-center">
                  <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No se encontraron cotizaciones
                  </p>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <CrearCotizacionModal
        open={modalCrear}
        onOpenChange={setModalCrear}
        onCreated={() => {
          // La lista se actualiza automáticamente por invalidación de cache
        }}
      />

      {cotizacionSeleccionada && (
        <DetalleCotizacionModal
          open={modalDetalle}
          onOpenChange={setModalDetalle}
          cotizacion={cotizacionSeleccionada}
          onDuplicar={() => handleDuplicar(cotizacionSeleccionada)}
          onGenerarPedido={handleGenerarPedido}
        />
      )}
    </div>
  );
}
