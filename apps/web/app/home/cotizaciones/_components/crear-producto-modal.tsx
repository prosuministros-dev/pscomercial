'use client';

import { useState, useEffect } from 'react';

import { Calculator, Loader2, Package, Save } from 'lucide-react';
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
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { ScrollArea } from '@kit/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Textarea } from '@kit/ui/textarea';

import { useAddCotizacionItem, useVerticales, type IvaTipo } from '~/lib/cotizaciones';

interface CrearProductoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
  trmActual: number;
  cotizacionId?: string;
}

export function CrearProductoModal({
  open,
  onOpenChange,
  onCreated,
  trmActual,
  cotizacionId,
}: CrearProductoModalProps) {
  const [formData, setFormData] = useState({
    numeroParte: '',
    nombre: '',
    descripcion: '',
    vertical: '',
    marca: '',
    impuesto: 'IVA_19' as IvaTipo,
    costo: 0,
    moneda: 'COP' as 'COP' | 'USD',
    utilidadPct: 30,
    cantidad: 1,
    proveedorSugerido: '',
    tiempoEntrega: 15,
    garantia: 12,
    observaciones: '',
  });

  // Hook para agregar item
  const addItemMutation = useAddCotizacionItem();

  // Hook para cargar verticales
  const { data: verticales = [] } = useVerticales();

  // Cálculos automáticos
  const [calculado, setCalculado] = useState({
    costoConvertido: 0,
    precioVenta: 0,
    iva: 0,
    totalItem: 0,
    margen: 0,
  });

  useEffect(() => {
    calcular();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.costo,
    formData.moneda,
    formData.utilidadPct,
    formData.cantidad,
    formData.impuesto,
  ]);

  const getIvaPorcentaje = (tipo: IvaTipo): number => {
    const map: Record<IvaTipo, number> = {
      IVA_0: 0,
      IVA_5: 5,
      IVA_19: 19,
    };
    return map[tipo];
  };

  const calcular = () => {
    // Convertir costo si es USD
    const costoEnCOP =
      formData.moneda === 'USD'
        ? formData.costo * trmActual
        : formData.costo;

    // Calcular precio de venta con utilidad
    const precioVenta = costoEnCOP * (1 + formData.utilidadPct / 100);

    // Calcular IVA
    const ivaPct = getIvaPorcentaje(formData.impuesto);
    const iva = (precioVenta * ivaPct) / 100;

    // Total del item
    const totalItem = (precioVenta + iva) * formData.cantidad;

    // Margen
    const margen = precioVenta - costoEnCOP;

    setCalculado({
      costoConvertido: costoEnCOP,
      precioVenta,
      iva,
      totalItem,
      margen,
    });
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      numeroParte: '',
      nombre: '',
      descripcion: '',
      vertical: '',
      marca: '',
      impuesto: 'IVA_19',
      costo: 0,
      moneda: 'COP',
      utilidadPct: 30,
      cantidad: 1,
      proveedorSugerido: '',
      tiempoEntrega: 15,
      garantia: 12,
      observaciones: '',
    });
  };

  const handleGuardar = async () => {
    if (!formData.numeroParte || !formData.nombre || !formData.vertical || formData.costo <= 0) {
      toast.error('Complete los campos obligatorios (Número de parte, Nombre, Vertical y Costo)');
      return;
    }

    if (!cotizacionId) {
      toast.error('No se ha seleccionado una cotización');
      return;
    }

    try {
      await addItemMutation.mutateAsync({
        cotizacion_id: cotizacionId,
        vertical_id: formData.vertical || undefined,
        numero_parte: formData.numeroParte,
        nombre_producto: formData.nombre,
        descripcion: formData.descripcion || undefined,
        observaciones: formData.observaciones || undefined,
        proveedor_nombre: formData.proveedorSugerido || undefined,
        tiempo_entrega_dias: formData.tiempoEntrega,
        garantia_meses: formData.garantia,
        costo_unitario: formData.costo,
        moneda_costo: formData.moneda,
        porcentaje_utilidad: formData.utilidadPct,
        iva_tipo: formData.impuesto,
        cantidad: formData.cantidad,
      });

      toast.success('Producto agregado exitosamente');
      onCreated?.();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error al agregar producto:', error);
      toast.error('Error al agregar el producto');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="flex-shrink-0 border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="gradient-accent rounded-lg p-2">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle>Agregar Producto</DialogTitle>
              <DialogDescription className="sr-only">
                Formulario para agregar un nuevo producto a la cotización
              </DialogDescription>
              <Badge variant="outline" className="mt-1 text-xs">
                TRM: ${trmActual.toLocaleString('es-CO')}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Contenido */}
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Formulario - 2 columnas */}
            <div className="space-y-4 lg:col-span-2">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Número de Parte */}
                <div>
                  <Label className="text-xs">
                    Número de Parte / SKU <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.numeroParte}
                    onChange={(e) =>
                      handleChange('numeroParte', e.target.value)
                    }
                    placeholder="LAP-DEL-001"
                    className="mt-1"
                  />
                </div>

                {/* Vertical */}
                <div>
                  <Label className="text-xs">
                    Vertical <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.vertical}
                    onValueChange={(value) => handleChange('vertical', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar vertical" />
                    </SelectTrigger>
                    <SelectContent>
                      {verticales.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Nombre del Producto */}
                <div className="md:col-span-2">
                  <Label className="text-xs">
                    Nombre del Producto <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.nombre}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    placeholder="Dell Latitude 5430, Windows 11 Pro, etc."
                    className="mt-1"
                  />
                </div>

                {/* Descripción */}
                <div className="md:col-span-2">
                  <Label className="text-xs">Descripción</Label>
                  <Textarea
                    value={formData.descripcion}
                    onChange={(e) => handleChange('descripcion', e.target.value)}
                    placeholder="Especificaciones técnicas del producto..."
                    rows={2}
                    className="mt-1"
                  />
                </div>

                {/* Marca */}
                <div>
                  <Label className="text-xs">Marca</Label>
                  <Input
                    value={formData.marca}
                    onChange={(e) => handleChange('marca', e.target.value)}
                    placeholder="Dell, HP, Lenovo, etc."
                    className="mt-1"
                  />
                </div>

                {/* Impuesto */}
                <div>
                  <Label className="text-xs">Impuesto</Label>
                  <Select
                    value={formData.impuesto}
                    onValueChange={(value) =>
                      handleChange('impuesto', value as IvaTipo)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IVA_0">0% - Exento</SelectItem>
                      <SelectItem value="IVA_5">5%</SelectItem>
                      <SelectItem value="IVA_19">19% - IVA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Costo */}
                <div>
                  <Label className="text-xs">
                    Costo Unitario <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={formData.costo}
                    onChange={(e) =>
                      handleChange('costo', parseFloat(e.target.value) || 0)
                    }
                    placeholder="0"
                    className="mt-1"
                  />
                </div>

                {/* Moneda */}
                <div>
                  <Label className="text-xs">Moneda</Label>
                  <Select
                    value={formData.moneda}
                    onValueChange={(value) => handleChange('moneda', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COP">COP - Pesos</SelectItem>
                      <SelectItem value="USD">USD - Dólares</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Conversión TRM */}
                {formData.moneda === 'USD' && formData.costo > 0 && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/20 md:col-span-2">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-blue-600" />
                      <p className="text-xs">
                        <span className="font-medium">${formData.costo} USD</span>
                        {' × '}
                        <span className="font-medium">${trmActual}</span>
                        {' = '}
                        <span className="font-medium text-blue-600">
                          $
                          {(formData.costo * trmActual).toLocaleString('es-CO')}{' '}
                          COP
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* % Utilidad */}
                <div>
                  <Label className="text-xs">% Utilidad</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.utilidadPct}
                    onChange={(e) =>
                      handleChange(
                        'utilidadPct',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="mt-1"
                  />
                </div>

                {/* Cantidad */}
                <div>
                  <Label className="text-xs">Cantidad</Label>
                  <Input
                    type="number"
                    value={formData.cantidad}
                    onChange={(e) =>
                      handleChange('cantidad', parseInt(e.target.value) || 1)
                    }
                    className="mt-1"
                  />
                </div>

                {/* Proveedor Sugerido */}
                <div>
                  <Label className="text-xs">Proveedor Sugerido</Label>
                  <Input
                    value={formData.proveedorSugerido}
                    onChange={(e) =>
                      handleChange('proveedorSugerido', e.target.value)
                    }
                    placeholder="Proveedor preferido"
                    className="mt-1"
                  />
                </div>

                {/* Tiempo de Entrega */}
                <div>
                  <Label className="text-xs">Tiempo de Entrega (días)</Label>
                  <Input
                    type="number"
                    value={formData.tiempoEntrega}
                    onChange={(e) =>
                      handleChange('tiempoEntrega', parseInt(e.target.value) || 15)
                    }
                    placeholder="15"
                    className="mt-1"
                  />
                </div>

                {/* Garantía */}
                <div>
                  <Label className="text-xs">Garantía (meses)</Label>
                  <Input
                    type="number"
                    value={formData.garantia}
                    onChange={(e) =>
                      handleChange('garantia', parseInt(e.target.value) || 12)
                    }
                    placeholder="12"
                    className="mt-1"
                  />
                </div>

                {/* Observaciones */}
                <div className="md:col-span-2">
                  <Label className="text-xs">Observaciones</Label>
                  <Textarea
                    value={formData.observaciones}
                    onChange={(e) =>
                      handleChange('observaciones', e.target.value)
                    }
                    placeholder="Notas adicionales sobre el producto..."
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Resumen de Cálculos - 1 columna */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-medium">Cálculo Automático</h4>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Costo Unitario:
                    </span>
                    <span className="font-medium">
                      $
                      {calculado.costoConvertido.toLocaleString('es-CO', {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Utilidad ({formData.utilidadPct}%):
                    </span>
                    <span className="font-medium text-green-600">
                      +$
                      {calculado.margen.toLocaleString('es-CO', {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>

                  <div className="h-px bg-border" />

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Precio Venta:</span>
                    <span className="font-medium">
                      $
                      {calculado.precioVenta.toLocaleString('es-CO', {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      IVA ({getIvaPorcentaje(formData.impuesto)}%):
                    </span>
                    <span className="font-medium">
                      $
                      {calculado.iva.toLocaleString('es-CO', {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>

                  <div className="h-px bg-border" />

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Cantidad:</span>
                    <span className="font-medium">×{formData.cantidad}</span>
                  </div>

                  <div className="flex items-center justify-between border-t-2 border-primary/20 pt-2">
                    <span className="font-medium">Total Item:</span>
                    <span className="text-lg font-medium text-primary">
                      $
                      {calculado.totalItem.toLocaleString('es-CO', {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Margen:</span>
                    <Badge
                      variant={
                        formData.utilidadPct >= 25 ? 'default' : 'destructive'
                      }
                      className="text-xs"
                    >
                      {formData.utilidadPct}%
                    </Badge>
                  </div>
                </div>

                {formData.utilidadPct < 25 && (
                  <div className="mt-4 rounded border border-orange-200 bg-orange-50 p-2 dark:border-orange-900 dark:bg-orange-950/20">
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      Margen bajo. Requiere aprobación de gerencia.
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex flex-shrink-0 items-center justify-between border-t border-border px-6 py-4">
          <div className="text-xs text-muted-foreground">
            <span className="text-red-500">*</span> Campos obligatorios
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={addItemMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleGuardar}
              className="gradient-brand gap-2"
              disabled={addItemMutation.isPending || !cotizacionId}
            >
              {addItemMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Agregar Producto
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
