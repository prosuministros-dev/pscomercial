'use client';

import { useState } from 'react';

import {
  Copy,
  DollarSign,
  Download,
  Edit,
  FileText,
  Loader2,
  MessageSquare,
  Package,
  Plus,
  Send,
  ShoppingCart,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@kit/ui/alert-dialog';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card } from '@kit/ui/card';
import { Checkbox } from '@kit/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { ScrollArea } from '@kit/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';

import {
  useCotizacion,
  useCotizacionItems,
  useDeleteCotizacionItem,
  useReorderItems,
  useTrmActual,
} from '~/lib/cotizaciones';

import { CrearProductoModal } from './crear-producto-modal';
import { EditarProductoModal } from './editar-producto-modal';
import { SortableProductList } from './sortable-product-list';

// Tipo para cotización desde la lista (sin items)
// Usamos un tipo más flexible para aceptar cotizaciones de la DB
type CotizacionListItem = {
  id: string;
  numero: number;
  estado: string | null;
  razon_social: string;
  nit: string | null;
  fecha_cotizacion: string;
  forma_pago: string | null;
  total_venta: number | null;
  subtotal_costo: number | null;
  margen_porcentaje: number | null;
  requiere_aprobacion_margen: boolean | null;
  asesor_id: string | null;
  cliente_id: string | null;
  lead_id: string | null;
  asunto: string | null;
  trm_valor: number | null;
  vigencia_dias: number | null;
  condiciones_comerciales: string | null;
  asesor?: { id: string; nombre: string | null; email: string } | null;
  cliente?: { id: string; razon_social: string; nit: string | null } | null;
  lead?: { id: string; numero: number } | null;
  // Campos adicionales que pueden venir de la DB
  [key: string]: unknown;
};

interface DetalleCotizacionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cotizacion: CotizacionListItem;
  onDuplicar?: () => void;
  onGenerarPedido?: () => void;
}

export function DetalleCotizacionModal({
  open,
  onOpenChange,
  cotizacion,
  onDuplicar,
  onGenerarPedido,
}: DetalleCotizacionModalProps) {
  const [modalProducto, setModalProducto] = useState(false);
  const [modalEditarProducto, setModalEditarProducto] = useState(false);
  const [productoEditar, setProductoEditar] = useState<any>(null);
  const [productoEliminar, setProductoEliminar] = useState<any>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [costoTransporte, setCostoTransporte] = useState(0);
  const [incluirTransporte, setIncluirTransporte] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'duplicar' | 'pedido' | null>(null);

  // Hook para eliminar item
  const deleteItemMutation = useDeleteCotizacionItem();

  // Hook para reordenar items
  const reorderMutation = useReorderItems();

  // Obtener cotización completa con items
  const { data: cotizacionCompleta, isLoading: loadingCotizacion } = useCotizacion(
    open ? cotizacion.id : ''
  );

  // Obtener items separadamente si es necesario
  const { data: items = [], isLoading: loadingItems } = useCotizacionItems(
    open ? cotizacion.id : ''
  );

  // Obtener TRM actual
  const { data: trmData } = useTrmActual();
  const trmActual = cotizacion.trm_valor || trmData?.valor || 4250;

  const isLoading = loadingCotizacion || loadingItems;

  // Usar datos de la cotización completa si está disponible
  const datosFinales = cotizacionCompleta || cotizacion;
  const productos = cotizacionCompleta?.items || items || [];

  // Calcular totales
  const subtotal = productos.reduce((acc: number, item: any) => {
    return acc + (item.precio_venta_unitario || 0) * (item.cantidad || 1);
  }, 0);

  const ivaTotal = productos.reduce((acc: number, item: any) => {
    const precio = (item.precio_venta_unitario || 0) * (item.cantidad || 1);
    return acc + (precio * (item.iva_porcentaje || 19)) / 100;
  }, 0);

  const costoTotal = productos.reduce((acc: number, item: any) => {
    return acc + (item.costo_unitario || 0) * (item.cantidad || 1);
  }, 0);

  const totalFinal = subtotal + ivaTotal + (incluirTransporte ? 0 : costoTransporte);
  const utilidadTotal = subtotal - costoTotal;
  const margenPct = costoTotal > 0 ? (utilidadTotal / costoTotal) * 100 : (datosFinales.margen_porcentaje || 0);

  const handleConfirmAction = () => {
    if (confirmAction === 'duplicar') {
      onDuplicar?.();
      toast.success('Cotización duplicada exitosamente');
    } else if (confirmAction === 'pedido') {
      if (datosFinales.estado !== 'ACEPTADA_CLIENTE' && datosFinales.estado !== 'PENDIENTE_OC') {
        toast.error('Solo se pueden convertir cotizaciones aceptadas o pendientes de OC');
        return;
      }
      onGenerarPedido?.();
      toast.success('Pedido generado exitosamente');
    }
    setConfirmDialogOpen(false);
    setConfirmAction(null);
    onOpenChange(false);
  };

  const getEstadoBadge = (estado: string | null) => {
    const badges: Record<string, { variant: 'outline' | 'secondary' | 'default' | 'destructive'; label: string; className: string }> = {
      BORRADOR: { variant: 'outline', label: 'Borrador', className: 'border-gray-400 text-gray-600' },
      CREACION_OFERTA: { variant: 'outline', label: 'Creación Oferta', className: 'border-blue-500 text-blue-600' },
      PENDIENTE_APROBACION_MARGEN: { variant: 'outline', label: 'Aprob. Margen', className: 'border-orange-500 text-orange-600' },
      NEGOCIACION: { variant: 'outline', label: 'Negociación', className: 'border-purple-500 text-purple-600' },
      RIESGO: { variant: 'outline', label: 'Riesgo', className: 'border-orange-500 text-orange-600' },
      ENVIADA_CLIENTE: { variant: 'outline', label: 'Enviada', className: 'border-blue-500 text-blue-600' },
      PROFORMA_ENVIADA: { variant: 'outline', label: 'Proforma', className: 'border-cyan-500 text-cyan-600' },
      PENDIENTE_AJUSTES: { variant: 'outline', label: 'Ajustes', className: 'border-yellow-500 text-yellow-600' },
      ACEPTADA_CLIENTE: { variant: 'default', label: 'Aceptada', className: 'bg-green-600' },
      RECHAZADA_CLIENTE: { variant: 'destructive', label: 'Rechazada', className: '' },
      PENDIENTE_OC: { variant: 'outline', label: 'Pendiente OC', className: 'border-green-500 text-green-600' },
      GANADA: { variant: 'default', label: 'Ganada', className: 'bg-green-600' },
      PERDIDA: { variant: 'secondary', label: 'Perdida', className: 'opacity-60' },
    };
    const badge = badges[estado || 'BORRADOR'];
    if (!badge) return <Badge variant="outline" className="text-xs">{estado}</Badge>;
    return (
      <Badge variant={badge.variant} className={`text-xs ${badge.className}`}>
        {badge.label}
      </Badge>
    );
  };

  const getFormaPagoLabel = (formaPago: string | null) => {
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
    return labels[formaPago || ''] || formaPago || 'No especificado';
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[90vh] max-w-5xl flex-col overflow-hidden p-0">
          {/* Header fijo con TRM */}
          <DialogHeader className="flex-shrink-0 border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="gradient-brand rounded-lg p-2">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="flex items-center gap-2">
                    Cotización #{datosFinales.numero}
                    {getEstadoBadge(datosFinales.estado)}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Detalles completos de la cotización incluyendo productos,
                    precios y actividades
                  </DialogDescription>
                  <div className="mt-1 flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      TRM: ${trmActual.toLocaleString('es-CO')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(datosFinales.fecha_cotizacion).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Acciones rápidas */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setConfirmAction('duplicar');
                    setConfirmDialogOpen(true);
                  }}
                  className="gap-2"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Duplicar</span>
                </Button>

                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">PDF</span>
                </Button>

                {datosFinales.estado === 'BORRADOR' && (
                  <Button variant="outline" size="sm" className="gap-2">
                    <Send className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">Enviar</span>
                  </Button>
                )}

                {(datosFinales.estado === 'ACEPTADA_CLIENTE' ||
                  datosFinales.estado === 'PENDIENTE_OC') && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setConfirmAction('pedido');
                      setConfirmDialogOpen(true);
                    }}
                    className="gradient-brand gap-2"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">Generar Pedido</span>
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* Tabs */}
          <Tabs
            defaultValue="general"
            className="flex flex-1 flex-col overflow-hidden"
          >
            <TabsList className="mx-6 mt-4 grid w-auto flex-shrink-0 grid-cols-4">
              <TabsTrigger value="general" className="text-xs">
                <FileText className="mr-1 h-3 w-3" />
                General
              </TabsTrigger>
              <TabsTrigger value="productos" className="text-xs">
                <Package className="mr-1 h-3 w-3" />
                Productos ({productos.length})
              </TabsTrigger>
              <TabsTrigger value="liquidacion" className="text-xs">
                <DollarSign className="mr-1 h-3 w-3" />
                Liquidación
              </TabsTrigger>
              <TabsTrigger value="observaciones" className="text-xs">
                <MessageSquare className="mr-1 h-3 w-3" />
                Notas
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 px-6 py-4">
              {/* Tab General */}
              <TabsContent value="general" className="mt-0 space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                      <div>
                        <Label className="text-xs">Asesor</Label>
                        <p className="mt-1">{datosFinales.asesor?.nombre || 'No asignado'}</p>
                      </div>
                      <div>
                        <Label className="text-xs">Términos de Pago</Label>
                        <p className="mt-1">{getFormaPagoLabel(datosFinales.forma_pago)}</p>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs">Cliente</Label>
                        <p className="mt-1 font-medium">{datosFinales.razon_social}</p>
                        {datosFinales.nit && (
                          <p className="text-xs text-muted-foreground">NIT: {datosFinales.nit}</p>
                        )}
                      </div>
                      {datosFinales.asunto && (
                        <div className="md:col-span-2">
                          <Label className="text-xs">Asunto</Label>
                          <p className="mt-1">{datosFinales.asunto}</p>
                        </div>
                      )}
                      {datosFinales.condiciones_comerciales && (
                        <div className="md:col-span-2">
                          <Label className="text-xs">Condiciones Comerciales</Label>
                          <p className="mt-1 text-sm text-muted-foreground">{datosFinales.condiciones_comerciales}</p>
                        </div>
                      )}
                    </div>

                    {/* Alertas */}
                    {datosFinales.requiere_aprobacion_margen && (
                      <Card className="border-orange-200 bg-orange-50/50 p-4 dark:border-orange-900 dark:bg-orange-950/20">
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                          <span className="text-base">⚠️</span>
                          Alertas y Validaciones
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="border-orange-500 text-xs text-orange-600"
                            >
                              Margen Bajo
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Requiere aprobación de gerencia
                            </span>
                          </div>
                        </div>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>

              {/* Tab Productos */}
              <TabsContent value="productos" className="mt-0 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">
                    {productos.length} Producto{productos.length !== 1 ? 's' : ''}
                  </h4>
                  <Button
                    size="sm"
                    onClick={() => setModalProducto(true)}
                    className="gap-2"
                    variant="outline"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Agregar
                  </Button>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : productos.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Package className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No hay productos agregados
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setModalProducto(true)}
                      className="mt-3 gap-2"
                      variant="outline"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Agregar Producto
                    </Button>
                  </Card>
                ) : (
                  <SortableProductList
                    productos={productos}
                    onEdit={(producto) => {
                      setProductoEditar(producto);
                      setModalEditarProducto(true);
                    }}
                    onDelete={(producto) => {
                      setProductoEliminar(producto);
                      setConfirmDeleteOpen(true);
                    }}
                    onReorder={(items) => {
                      reorderMutation.mutate({
                        cotizacion_id: cotizacion.id,
                        items,
                      });
                    }}
                  />
                )}
              </TabsContent>

              {/* Tab Liquidación */}
              <TabsContent value="liquidacion" className="mt-0 space-y-4">
                {/* Transporte */}
                <Card className="p-4">
                  <h4 className="mb-3 text-sm font-medium">Costo de Transporte</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Valor del Transporte</Label>
                      <Input
                        type="number"
                        value={costoTransporte}
                        onChange={(e) =>
                          setCostoTransporte(parseFloat(e.target.value) || 0)
                        }
                        placeholder="0"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="incluir-transporte"
                        checked={incluirTransporte}
                        onCheckedChange={(checked) =>
                          setIncluirTransporte(checked as boolean)
                        }
                      />
                      <Label
                        htmlFor="incluir-transporte"
                        className="cursor-pointer text-xs"
                      >
                        Transporte incluido en ítems (no sumar al total)
                      </Label>
                    </div>
                  </div>
                </Card>

                {/* Resumen */}
                <Card className="p-4">
                  <h4 className="mb-3 text-sm font-medium">Resumen de Liquidación</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal Venta:</span>
                      <span className="font-medium">
                        ${(datosFinales.total_venta || subtotal).toLocaleString('es-CO')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IVA:</span>
                      <span className="font-medium">${ivaTotal.toLocaleString('es-CO')}</span>
                    </div>
                    {!incluirTransporte && costoTransporte > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transporte:</span>
                        <span className="font-medium">
                          ${costoTransporte.toLocaleString('es-CO')}
                        </span>
                      </div>
                    )}
                    <div className="my-2 h-px bg-border" />
                    <div className="flex justify-between text-base">
                      <span className="font-medium">Total Venta:</span>
                      <span className="font-medium text-primary">
                        ${(datosFinales.total_venta || totalFinal).toLocaleString('es-CO')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Costo:</span>
                      <span className="font-medium">
                        ${(datosFinales.subtotal_costo || costoTotal).toLocaleString('es-CO')}
                      </span>
                    </div>
                    <div className="my-2 h-px bg-border" />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Utilidad:</span>
                      <span className="font-medium text-green-600">
                        ${((datosFinales.total_venta || 0) - (datosFinales.subtotal_costo || 0) || utilidadTotal).toLocaleString('es-CO')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Margen General:</span>
                      <Badge
                        variant={(datosFinales.margen_porcentaje || margenPct) >= 25 ? 'default' : 'destructive'}
                        className="text-sm"
                      >
                        {(datosFinales.margen_porcentaje || margenPct).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Tab Observaciones */}
              <TabsContent value="observaciones" className="mt-0 space-y-4">
                <Card className="p-4">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <MessageSquare className="h-4 w-4" />
                    Notas y Observaciones
                  </h4>
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Agrega notas internas sobre esta cotización. Usa @ para mencionar a un usuario.
                    </p>
                    <textarea
                      className="w-full rounded-md border bg-transparent p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      rows={4}
                      placeholder="Escribe una observación... (ej: @juan revisar precios)"
                      defaultValue={datosFinales.condiciones_comerciales || ''}
                    />
                    <div className="flex justify-between">
                      <p className="text-[10px] text-muted-foreground">
                        Las menciones con @ notificarán al usuario mencionado
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.info('Funcionalidad de @menciones próximamente')}
                      >
                        <Send className="mr-1 h-3 w-3" />
                        Guardar Nota
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Historial de observaciones (placeholder) */}
                <Card className="p-4">
                  <h4 className="mb-3 text-sm font-medium">Historial</h4>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p className="text-center py-4">
                      El historial de observaciones estará disponible próximamente.
                    </p>
                  </div>
                </Card>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Modal de Crear Producto */}
      <CrearProductoModal
        open={modalProducto}
        onOpenChange={setModalProducto}
        trmActual={trmActual}
        cotizacionId={cotizacion.id}
        onCreated={() => {
          toast.success('Producto agregado');
        }}
      />

      {/* Modal Editar Producto */}
      <EditarProductoModal
        open={modalEditarProducto}
        onOpenChange={setModalEditarProducto}
        producto={productoEditar}
        trmActual={trmActual}
        onUpdated={() => {
          setProductoEditar(null);
        }}
      />

      {/* Confirm Delete Product Dialog */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Producto</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro que desea eliminar "{productoEliminar?.nombre_producto}"?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                if (productoEliminar) {
                  try {
                    await deleteItemMutation.mutateAsync({ id: productoEliminar.id });
                    toast.success('Producto eliminado');
                    setProductoEliminar(null);
                  } catch (error) {
                    toast.error('Error al eliminar el producto');
                  }
                }
                setConfirmDeleteOpen(false);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === 'duplicar' ? 'Duplicar Cotización' : 'Generar Pedido'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'duplicar'
                ? `¿Está seguro que desea duplicar la cotización #${datosFinales.numero}? Se creará una nueva cotización con un número consecutivo.`
                : `¿Está seguro que desea generar un pedido desde la cotización #${datosFinales.numero}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
