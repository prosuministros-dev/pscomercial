'use client';

import { useState } from 'react';

import {
  Award,
  CheckCircle2,
  Clock,
  FileText,
  LayoutGrid,
  List,
  MessageSquare,
  MoreHorizontal,
  Search,
  Settings,
  ShoppingCart,
  Truck,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card } from '@kit/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { Textarea } from '@kit/ui/textarea';

import { pedidos, type Pedido } from '~/lib/mock-data';

import { DespachoModal } from './despacho-modal';
import { LicenciamientoModal } from './licenciamiento-modal';
import { PedidosKanban } from './pedidos-kanban';

type VistaType = 'tabla' | 'kanban';

export function PedidosView() {
  const [vista, setVista] = useState<VistaType>('tabla');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(
    null
  );
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalDespacho, setModalDespacho] = useState(false);
  const [modalLicenciamiento, setModalLicenciamiento] = useState(false);

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const matchEstado =
      filtroEstado === 'todos' || pedido.estado === filtroEstado;
    const matchBusqueda =
      busqueda === '' ||
      pedido.numero.toString().includes(busqueda) ||
      pedido.razonSocial.toLowerCase().includes(busqueda.toLowerCase());
    return matchEstado && matchBusqueda;
  });

  const getEstadoBadge = (estado: string) => {
    const badges = {
      // Estados nuevos del sistema extendido
      por_facturar: {
        variant: 'outline' as const,
        label: 'Por Facturar',
        className: 'border-yellow-500 text-yellow-700 dark:text-yellow-400',
      },
      facturado_sin_pago: {
        variant: 'outline' as const,
        label: 'Facturado Sin Pago',
        className: 'border-orange-500 text-orange-700 dark:text-orange-400',
      },
      pendiente_compra: {
        variant: 'secondary' as const,
        label: 'Pendiente Compra',
        className:
          'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      },
      en_bodega: {
        variant: 'default' as const,
        label: 'En Bodega',
        className: 'bg-blue-600',
      },
      despachado: {
        variant: 'default' as const,
        label: 'Despachado',
        className: 'bg-indigo-600',
      },
      entregado: {
        variant: 'default' as const,
        label: 'Entregado',
        className: 'bg-green-600',
      },
      // Estados legacy (por compatibilidad)
      pendiente: { variant: 'outline' as const, label: 'Pendiente', className: '' },
      aprobado: {
        variant: 'default' as const,
        label: 'Aprobado',
        className: 'bg-blue-600',
      },
      en_proceso: { variant: 'secondary' as const, label: 'En Proceso', className: '' },
      completado: {
        variant: 'default' as const,
        label: 'Completado',
        className: 'bg-green-600',
      },
      cancelado: { variant: 'destructive' as const, label: 'Cancelado', className: '' },
    };
    const badge = badges[estado as keyof typeof badges];
    if (!badge)
      return (
        <Badge variant="outline" className="h-5 text-xs">
          {estado}
        </Badge>
      );
    return (
      <Badge
        variant={badge.variant}
        className={`h-5 text-xs ${badge.className || ''}`}
      >
        {badge.label}
      </Badge>
    );
  };

  const abrirModal = (pedido: Pedido) => {
    setPedidoSeleccionado(pedido);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setPedidoSeleccionado(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="gradient-brand rounded-lg p-2">
            <ShoppingCart className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Pedidos</h2>
            <p className="text-xs text-muted-foreground">Gestión de pedidos</p>
          </div>
        </div>
      </div>

      {/* Filtros y toggle de vista */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por número o cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="h-9 pl-8 text-sm"
          />
        </div>
        {vista === 'tabla' && (
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="h-9 w-[140px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="por_facturar">Por Facturar</SelectItem>
              <SelectItem value="facturado_sin_pago">
                Facturado Sin Pago
              </SelectItem>
              <SelectItem value="pendiente_compra">Pendiente Compra</SelectItem>
              <SelectItem value="en_bodega">En Bodega</SelectItem>
              <SelectItem value="despachado">Despachado</SelectItem>
              <SelectItem value="entregado">Entregado</SelectItem>
            </SelectContent>
          </Select>
        )}
        {/* Toggle de Vista */}
        <div className="flex items-center overflow-hidden rounded-lg border border-border">
          <Button
            variant={vista === 'tabla' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setVista('tabla')}
            className="h-9 rounded-none border-0"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={vista === 'kanban' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setVista('kanban')}
            className="h-9 rounded-none border-0"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats - Solo en vista tabla */}
      {vista === 'tabla' && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            {
              label: 'Por Facturar',
              count: pedidos.filter((p) => p.estado === 'por_facturar').length,
            },
            {
              label: 'Pendiente Compra',
              count: pedidos.filter((p) => p.estado === 'pendiente_compra')
                .length,
            },
            {
              label: 'En Bodega',
              count: pedidos.filter((p) => p.estado === 'en_bodega').length,
            },
            {
              label: 'Entregados',
              count: pedidos.filter((p) => p.estado === 'entregado').length,
            },
          ].map((stat) => (
            <Card key={stat.label} className="p-3">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <h4 className="mt-1 text-xl font-bold">{stat.count}</h4>
            </Card>
          ))}
        </div>
      )}

      {/* Vista Tabla */}
      {vista === 'tabla' && (
        <>
          {/* Tabla - Desktop */}
          <Card className="hidden overflow-hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="text-xs">
                    <th className="px-3 py-2 text-left font-medium">Estado</th>
                    <th className="px-3 py-2 text-left font-medium">#</th>
                    <th className="px-3 py-2 text-left font-medium">Cliente</th>
                    <th className="px-3 py-2 text-left font-medium">Fecha</th>
                    <th className="px-3 py-2 text-left font-medium">Asunto</th>
                    <th className="px-3 py-2 text-right font-medium">
                      Subtotal
                    </th>
                    <th className="px-3 py-2 text-center font-medium">Mon</th>
                    <th className="px-3 py-2 text-center font-medium">Pago</th>
                    <th className="px-3 py-2 text-center font-medium">Pend</th>
                    <th className="px-3 py-2 text-right font-medium">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pedidosFiltrados.map((pedido) => (
                    <tr
                      key={pedido.id}
                      className="text-sm transition-colors hover:bg-muted/30"
                    >
                      <td className="px-3 py-2">
                        {getEstadoBadge(pedido.estado)}
                      </td>
                      <td className="px-3 py-2">
                        <span className="font-mono text-xs">
                          #{pedido.numero}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div>
                          <p className="max-w-[180px] truncate font-medium">
                            {pedido.razonSocial}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {pedido.nit}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {new Date(pedido.fechaPedido).toLocaleDateString(
                          'es-CO',
                          {
                            month: 'short',
                            day: 'numeric',
                          }
                        )}
                      </td>
                      <td className="max-w-[200px] truncate px-3 py-2 text-xs">
                        {pedido.asunto}
                      </td>
                      <td className="px-3 py-2 text-right text-xs">
                        ${(pedido.subtotal / 1000000).toFixed(1)}M
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Badge variant="outline" className="h-5 text-[10px]">
                          {pedido.moneda}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {pedido.pagoConfirmado ? (
                          <CheckCircle2 className="mx-auto h-4 w-4 text-green-600" />
                        ) : (
                          <Clock className="mx-auto h-4 w-4 text-yellow-600" />
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Badge
                          variant={
                            pedido.cantidadPendienteCompra > 0
                              ? 'secondary'
                              : 'outline'
                          }
                          className="text-xs"
                        >
                          {pedido.cantidadPendienteCompra}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                            onClick={() => abrirModal(pedido)}
                          >
                            Ver
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="text-sm">
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-sm">
                                Descargar
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
            {pedidosFiltrados.length === 0 && (
              <div className="p-8 text-center">
                <ShoppingCart className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No se encontraron pedidos
                </p>
              </div>
            )}
          </Card>

          {/* Lista - Mobile & Tablet */}
          <div className="space-y-2 lg:hidden">
            {pedidosFiltrados.map((pedido) => (
              <Card key={pedido.id} className="p-3">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">#{pedido.numero}</span>
                    {getEstadoBadge(pedido.estado)}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs"
                    onClick={() => abrirModal(pedido)}
                  >
                    Ver
                  </Button>
                </div>
                <h4 className="mb-1 truncate font-semibold">
                  {pedido.razonSocial}
                </h4>
                <p className="mb-2 truncate text-xs text-muted-foreground">
                  {pedido.asunto}
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-medium">
                      ${(pedido.subtotal / 1000000).toFixed(1)}M
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pago</p>
                    <div className="mt-0.5 flex items-center gap-1">
                      {pedido.pagoConfirmado ? (
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                      ) : (
                        <Clock className="h-3 w-3 text-yellow-600" />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pend</p>
                    <p>{pedido.cantidadPendienteCompra}</p>
                  </div>
                </div>
              </Card>
            ))}
            {pedidosFiltrados.length === 0 && (
              <Card className="p-8 text-center">
                <ShoppingCart className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No se encontraron pedidos
                </p>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Vista Kanban */}
      {vista === 'kanban' && (
        <Card className="h-[calc(100vh-280px)] overflow-hidden p-3 md:h-[calc(100vh-240px)]">
          <PedidosKanban onVerDetalle={(pedido) => abrirModal(pedido)} />
        </Card>
      )}

      {/* Modal de Detalles */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="flex max-h-[92vh] max-w-3xl w-[95vw] flex-col overflow-hidden p-0 md:max-h-[90vh] md:w-full">
          {pedidoSeleccionado && (
            <>
              <DialogHeader className="flex-shrink-0 border-b border-border px-3 py-3 md:px-6 md:py-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <DialogTitle className="truncate text-base md:text-lg">
                      Pedido #{pedidoSeleccionado.numero}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                      Detalles del pedido con información de despacho,
                      observaciones y actividades
                    </DialogDescription>
                    <p className="mt-1 truncate text-xs text-muted-foreground md:text-sm">
                      {pedidoSeleccionado.razonSocial}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cerrarModal}
                    className="h-7 w-7 flex-shrink-0 p-0 md:h-8 md:w-8"
                  >
                    <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </Button>
                </div>
              </DialogHeader>

              <Tabs
                defaultValue="general"
                className="flex flex-1 flex-col overflow-hidden"
              >
                <TabsList className="mx-3 mt-2 grid h-8 w-auto flex-shrink-0 grid-cols-4 md:mx-6 md:mt-4 md:h-9">
                  <TabsTrigger
                    value="general"
                    className="px-1 text-[10px] md:px-3 md:text-xs"
                  >
                    <FileText className="h-3 w-3 md:mr-1" />
                    <span className="hidden sm:inline">General</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="despacho"
                    className="px-1 text-[10px] md:px-3 md:text-xs"
                  >
                    <Truck className="h-3 w-3 md:mr-1" />
                    <span className="hidden sm:inline">Despacho</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="observaciones"
                    className="px-1 text-[10px] md:px-3 md:text-xs"
                  >
                    <MessageSquare className="h-3 w-3 md:mr-1" />
                    <span className="hidden sm:inline">Notas</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="intangibles"
                    className="px-1 text-[10px] md:px-3 md:text-xs"
                  >
                    <Settings className="h-3 w-3 md:mr-1" />
                    <span className="hidden sm:inline">Intang.</span>
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto px-3 py-3 md:px-6 md:py-4">
                  <TabsContent
                    value="general"
                    className="mt-0 space-y-3 md:space-y-4"
                  >
                    <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 md:gap-3">
                      <div>
                        <Label className="text-[10px] md:text-xs">NIT</Label>
                        <p className="mt-1 text-xs md:text-sm">
                          {pedidoSeleccionado.nit}
                        </p>
                      </div>
                      <div>
                        <Label className="text-[10px] md:text-xs">
                          Contacto
                        </Label>
                        <p className="mt-1 text-xs md:text-sm">
                          {pedidoSeleccionado.contacto}
                        </p>
                      </div>
                      <div>
                        <Label className="text-[10px] md:text-xs">Email</Label>
                        <p className="mt-1 truncate text-xs md:text-sm">
                          {pedidoSeleccionado.email}
                        </p>
                      </div>
                      <div>
                        <Label className="text-[10px] md:text-xs">
                          Teléfono
                        </Label>
                        <p className="mt-1 text-xs md:text-sm">
                          {pedidoSeleccionado.telefono}
                        </p>
                      </div>
                      <div className="sm:col-span-2">
                        <Label className="text-[10px] md:text-xs">Asunto</Label>
                        <p className="mt-1 text-xs md:text-sm">
                          {pedidoSeleccionado.asunto}
                        </p>
                      </div>
                      <div>
                        <Label className="text-[10px] md:text-xs">
                          Términos Pago
                        </Label>
                        <p className="mt-1 text-xs md:text-sm">
                          {pedidoSeleccionado.terminosPago}
                        </p>
                      </div>
                      <div>
                        <Label className="text-[10px] md:text-xs">
                          Subtotal
                        </Label>
                        <p className="mt-1 text-xs font-medium md:text-sm">
                          ${pedidoSeleccionado.subtotal.toLocaleString('es-CO')}{' '}
                          {pedidoSeleccionado.moneda}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-border pt-2 md:pt-3">
                      <Label className="mb-2 block text-[10px] md:text-xs">
                        Estados
                      </Label>
                      <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                          {pedidoSeleccionado.pagoConfirmado ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600 md:h-4 md:w-4" />
                          ) : (
                            <Clock className="h-3.5 w-3.5 text-yellow-600 md:h-4 md:w-4" />
                          )}
                          <span className="text-[10px] md:text-xs">
                            Pago{' '}
                            {pedidoSeleccionado.pagoConfirmado
                              ? 'Confirmado'
                              : 'Pendiente'}
                          </span>
                        </div>
                        <div className="text-[10px] md:text-xs">
                          Fact. Anticip:{' '}
                          <Badge variant="outline" className="ml-1 text-[10px]">
                            {pedidoSeleccionado.facturacionAnticipadaRequerida}
                          </Badge>
                        </div>
                        <div className="text-[10px] md:text-xs">
                          Remisión:{' '}
                          <Badge variant="outline" className="ml-1 text-[10px]">
                            {pedidoSeleccionado.estadoRemision}
                          </Badge>
                        </div>
                        <div className="text-[10px] md:text-xs">
                          Factura:{' '}
                          <Badge variant="outline" className="ml-1 text-[10px]">
                            {pedidoSeleccionado.estadoFactura}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="despacho" className="mt-0 space-y-4">
                    <div className="py-8 text-center">
                      <Truck className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="mb-3 text-sm text-muted-foreground">
                        Sin información de despacho
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setModalDespacho(true)}
                        className="gap-2"
                      >
                        <Truck className="h-3.5 w-3.5" />
                        Agregar Información
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="observaciones" className="mt-0 space-y-4">
                    <div className="py-8 text-center">
                      <MessageSquare className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Sin observaciones
                      </p>
                    </div>
                    <div className="border-t border-border pt-3">
                      <Label className="text-xs">Nueva Observación</Label>
                      <Textarea
                        className="mt-2 text-sm"
                        placeholder="Escribe aquí..."
                        rows={2}
                      />
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => toast.success('Observación agregada')}
                      >
                        Publicar
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="intangibles" className="mt-0">
                    <div className="py-8 text-center">
                      <Award className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="mb-1 text-sm text-muted-foreground">
                        Licenciamiento y Garantías
                      </p>
                      <p className="mb-3 text-xs text-muted-foreground">
                        ADP · Apple · Garantías · Licencias
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setModalLicenciamiento(true)}
                        className="gap-2"
                      >
                        <Award className="h-3.5 w-3.5" />
                        Gestionar
                      </Button>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Despacho */}
      {pedidoSeleccionado && (
        <DespachoModal
          open={modalDespacho}
          onOpenChange={setModalDespacho}
          pedidoId={pedidoSeleccionado.id}
          pedidoNumero={pedidoSeleccionado.numero}
        />
      )}

      {/* Modal de Licenciamiento */}
      {pedidoSeleccionado && (
        <LicenciamientoModal
          open={modalLicenciamiento}
          onOpenChange={setModalLicenciamiento}
          pedidoId={pedidoSeleccionado.id}
          pedidoNumero={pedidoSeleccionado.numero}
        />
      )}
    </div>
  );
}
