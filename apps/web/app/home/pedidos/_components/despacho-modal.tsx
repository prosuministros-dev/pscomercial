'use client';

import { useState } from 'react';

import { Copy as CopyIcon, Lock, Plus, Save, Trash2, Truck, X } from 'lucide-react';
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
import { Separator } from '@kit/ui/separator';

import { departamentos } from '~/lib/mock-data';

interface DespachoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pedidoId: string;
  pedidoNumero: number;
  despachoExistente?: {
    nombreRecibe?: string;
    telefono?: string;
    direccion?: string;
    departamento?: string;
    ciudad?: string;
    horarioEntrega?: string;
    emailGuia?: string;
    emailCopiaFactura?: string;
    tipoDespacho?: string;
    tipoFactura?: string;
    facturaConConfirmacion?: string;
    bloqueado?: boolean;
    guardadoEn?: string;
    guardadoPor?: string;
    destinosComplementarios?: DestinoComplementario[];
  };
}

interface DestinoComplementario {
  id: string;
  nombreRecibe: string;
  telefono: string;
  direccion: string;
  departamento: string;
  ciudad: string;
  bloqueado: boolean;
}

export function DespachoModal({
  open,
  onOpenChange,
  pedidoNumero,
  despachoExistente,
}: DespachoModalProps) {
  const [bloqueado, setBloqueado] = useState(
    despachoExistente?.bloqueado || false
  );

  // Simulación de usuario actual
  const usuarioActual = { rol: 'Comercial', nombre: 'Carlos Pérez' };

  // Permisos: Solo Comercial y Gerencia pueden editar, y solo UNA vez
  const puedeEditar =
    (usuarioActual.rol === 'Comercial' ||
      usuarioActual.rol === 'Gerencia' ||
      usuarioActual.rol === 'Administración') &&
    !bloqueado;

  const [formData, setFormData] = useState({
    nombreRecibe: despachoExistente?.nombreRecibe || '',
    telefono: despachoExistente?.telefono || '',
    direccion: despachoExistente?.direccion || '',
    departamento: despachoExistente?.departamento || '',
    ciudad: despachoExistente?.ciudad || '',
    horarioEntrega: despachoExistente?.horarioEntrega || '',
    emailGuia: despachoExistente?.emailGuia || '',
    emailCopiaFactura: despachoExistente?.emailCopiaFactura || '',
    tipoDespacho: despachoExistente?.tipoDespacho || 'Total',
    tipoFactura: despachoExistente?.tipoFactura || 'Total',
    facturaConConfirmacion:
      despachoExistente?.facturaConConfirmacion || 'Con confirmación',
  });

  // Destinos complementarios
  const [destinosComplementarios, setDestinosComplementarios] = useState<
    DestinoComplementario[]
  >(despachoExistente?.destinosComplementarios || []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCopiarInformacion = () => {
    const info = `
Nombre: ${formData.nombreRecibe}
Teléfono: ${formData.telefono}
Dirección: ${formData.direccion}
Departamento: ${formData.departamento}
Ciudad: ${formData.ciudad}
Horario: ${formData.horarioEntrega}
Email Guía: ${formData.emailGuia}
Email Copia Factura: ${formData.emailCopiaFactura}
    `.trim();

    navigator.clipboard.writeText(info);
    toast.success('Información copiada al portapapeles');
  };

  const handleGuardar = () => {
    // Validar campos obligatorios
    if (
      !formData.nombreRecibe ||
      !formData.telefono ||
      !formData.direccion ||
      !formData.departamento ||
      !formData.ciudad
    ) {
      toast.error('Complete todos los campos obligatorios');
      return;
    }

    toast.success(
      'Información de despacho guardada. Los campos han sido bloqueados.'
    );
    setBloqueado(true);
    onOpenChange(false);
  };

  const handleAgregarDestino = () => {
    setDestinosComplementarios([
      ...destinosComplementarios,
      {
        id: `dest-${Date.now()}`,
        nombreRecibe: '',
        telefono: '',
        direccion: '',
        departamento: '',
        ciudad: '',
        bloqueado: false,
      },
    ]);
  };

  const handleEliminarDestino = (index: number) => {
    setDestinosComplementarios(
      destinosComplementarios.filter((_, i) => i !== index)
    );
  };

  const handleUpdateDestino = (
    index: number,
    field: string,
    value: string
  ) => {
    const newDestinos = [...destinosComplementarios];
    newDestinos[index] = { ...newDestinos[index]!, [field]: value };
    setDestinosComplementarios(newDestinos);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] max-w-4xl w-[95vw] flex-col overflow-hidden p-0 md:max-h-[90vh] md:w-full">
        {/* Header - Responsive */}
        <DialogHeader className="flex-shrink-0 border-b border-border px-3 py-3 md:px-6 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
              <div className="gradient-brand flex-shrink-0 rounded-lg p-1.5 md:p-2">
                <Truck className="h-4 w-4 text-white md:h-5 md:w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="truncate text-sm md:text-base">
                  Información de Despacho
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Formulario para gestionar la información de despacho del
                  pedido
                </DialogDescription>
                <div className="mt-1 flex items-center gap-1.5 md:gap-2">
                  <Badge variant="outline" className="text-[10px] md:text-xs">
                    Pedido #{pedidoNumero}
                  </Badge>
                  {bloqueado && (
                    <Badge
                      variant="secondary"
                      className="gap-1 text-[10px] md:text-xs"
                    >
                      <Lock className="h-2.5 w-2.5 md:h-3 md:w-3" />
                      <span className="hidden sm:inline">Bloqueado</span>
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-1 md:gap-2">
              {puedeEditar && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopiarInformacion}
                  className="h-7 w-7 p-0 md:w-auto md:gap-2 md:px-3"
                >
                  <CopyIcon className="h-3 w-3 md:h-3.5 md:w-3.5" />
                  <span className="hidden md:inline">Copiar</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-7 w-7 p-0 md:h-8 md:w-8"
              >
                <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Contenido - Responsive */}
        <ScrollArea className="flex-1 px-3 py-3 md:px-6 md:py-4">
          <div className="space-y-4 md:space-y-6">
            {/* Permisos Info */}
            {!puedeEditar && !bloqueado && (
              <Card className="border-blue-200 bg-blue-50/50 p-2.5 dark:border-blue-900 dark:bg-blue-950/20 md:p-3">
                <p className="text-[10px] text-blue-600 dark:text-blue-400 md:text-xs">
                  ℹ️ Solo usuarios con rol Comercial o Gerencia pueden editar
                  esta información.
                </p>
              </Card>
            )}

            {bloqueado && despachoExistente?.guardadoEn && (
              <Card className="border-green-200 bg-green-50/50 p-2.5 dark:border-green-900 dark:bg-green-950/20 md:p-3">
                <p className="text-[10px] text-green-600 dark:text-green-400 md:text-xs">
                  ✓ Guardado el{' '}
                  {new Date(despachoExistente.guardadoEn).toLocaleString(
                    'es-CO'
                  )}{' '}
                  por {despachoExistente.guardadoPor}
                </p>
              </Card>
            )}

            {/* Despacho Principal */}
            <Card className="p-3 md:p-4">
              <h4 className="mb-3 text-sm md:mb-4 md:text-base">
                Destino Principal
              </h4>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                <div>
                  <Label className="text-[10px] md:text-xs">
                    Nombre de quien Recibe{' '}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.nombreRecibe}
                    onChange={(e) =>
                      handleChange('nombreRecibe', e.target.value)
                    }
                    disabled={!puedeEditar}
                    className="mt-1 h-8 text-xs md:h-9 md:text-sm"
                  />
                </div>

                <div>
                  <Label className="text-[10px] md:text-xs">
                    Teléfono <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.telefono}
                    onChange={(e) => handleChange('telefono', e.target.value)}
                    disabled={!puedeEditar}
                    placeholder="+57 300 000 0000"
                    className="mt-1 h-8 text-xs md:h-9 md:text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-[10px] md:text-xs">
                    Dirección Completa <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.direccion}
                    onChange={(e) => handleChange('direccion', e.target.value)}
                    disabled={!puedeEditar}
                    placeholder="Calle 72 # 10-34, Edificio..."
                    className="mt-1 h-8 text-xs md:h-9 md:text-sm"
                  />
                </div>

                <div>
                  <Label className="text-[10px] md:text-xs">
                    Departamento <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.departamento}
                    onValueChange={(value) =>
                      handleChange('departamento', value)
                    }
                    disabled={!puedeEditar}
                  >
                    <SelectTrigger className="mt-1 h-8 text-xs md:h-9 md:text-sm">
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {departamentos.map((dep) => (
                        <SelectItem
                          key={dep.codigo}
                          value={dep.nombre}
                          className="text-xs md:text-sm"
                        >
                          {dep.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-[10px] md:text-xs">
                    Ciudad <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.ciudad}
                    onChange={(e) => handleChange('ciudad', e.target.value)}
                    disabled={!puedeEditar}
                    className="mt-1 h-8 text-xs md:h-9 md:text-sm"
                  />
                </div>

                <div>
                  <Label className="text-[10px] md:text-xs">
                    Horario de Entrega
                  </Label>
                  <Input
                    value={formData.horarioEntrega}
                    onChange={(e) =>
                      handleChange('horarioEntrega', e.target.value)
                    }
                    disabled={!puedeEditar}
                    placeholder="8:00 AM - 5:00 PM"
                    className="mt-1 h-8 text-xs md:h-9 md:text-sm"
                  />
                </div>

                <div>
                  <Label className="text-[10px] md:text-xs">
                    Email para Guía
                  </Label>
                  <Input
                    type="email"
                    value={formData.emailGuia}
                    onChange={(e) => handleChange('emailGuia', e.target.value)}
                    disabled={!puedeEditar}
                    className="mt-1 h-8 text-xs md:h-9 md:text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-[10px] md:text-xs">
                    Email Copia Factura
                  </Label>
                  <Input
                    type="email"
                    value={formData.emailCopiaFactura}
                    onChange={(e) =>
                      handleChange('emailCopiaFactura', e.target.value)
                    }
                    disabled={!puedeEditar}
                    className="mt-1 h-8 text-xs md:h-9 md:text-sm"
                  />
                </div>

                <Separator className="md:col-span-2" />

                <div>
                  <Label className="text-[10px] md:text-xs">
                    Tipo de Despacho
                  </Label>
                  <Select
                    value={formData.tipoDespacho}
                    onValueChange={(value) =>
                      handleChange('tipoDespacho', value)
                    }
                    disabled={!puedeEditar}
                  >
                    <SelectTrigger className="mt-1 h-8 text-xs md:h-9 md:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Total" className="text-xs md:text-sm">
                        Total
                      </SelectItem>
                      <SelectItem
                        value="Parcial"
                        className="text-xs md:text-sm"
                      >
                        Parcial
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-[10px] md:text-xs">
                    Tipo de Factura
                  </Label>
                  <Select
                    value={formData.tipoFactura}
                    onValueChange={(value) =>
                      handleChange('tipoFactura', value)
                    }
                    disabled={!puedeEditar}
                  >
                    <SelectTrigger className="mt-1 h-8 text-xs md:h-9 md:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Total" className="text-xs md:text-sm">
                        Total
                      </SelectItem>
                      <SelectItem
                        value="Parcial"
                        className="text-xs md:text-sm"
                      >
                        Parcial
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-[10px] md:text-xs">
                    Confirmación de Entrega
                  </Label>
                  <Select
                    value={formData.facturaConConfirmacion}
                    onValueChange={(value) =>
                      handleChange('facturaConConfirmacion', value)
                    }
                    disabled={!puedeEditar}
                  >
                    <SelectTrigger className="mt-1 h-8 text-xs md:h-9 md:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="Con confirmación"
                        className="text-xs md:text-sm"
                      >
                        Con confirmación
                      </SelectItem>
                      <SelectItem
                        value="Sin confirmación"
                        className="text-xs md:text-sm"
                      >
                        Sin confirmación
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Destinos Complementarios */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm md:text-base">
                  Destinos Complementarios
                </h4>
                {puedeEditar && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAgregarDestino}
                    className="h-7 gap-1.5 text-xs md:h-8 md:gap-2"
                  >
                    <Plus className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    <span className="hidden sm:inline">Agregar Destino</span>
                    <span className="sm:hidden">Agregar</span>
                  </Button>
                )}
              </div>

              {destinosComplementarios.length === 0 ? (
                <Card className="p-6 text-center">
                  <Truck className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Sin destinos complementarios
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {destinosComplementarios.map((destino, index) => (
                    <Card key={destino.id} className="p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          Destino {index + 1}
                        </Badge>
                        {puedeEditar && !destino.bloqueado && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEliminarDestino(index)}
                            className="h-6 w-6 p-0 text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                          <Label className="text-xs">Nombre</Label>
                          <Input
                            value={destino.nombreRecibe}
                            onChange={(e) =>
                              handleUpdateDestino(
                                index,
                                'nombreRecibe',
                                e.target.value
                              )
                            }
                            disabled={!puedeEditar || destino.bloqueado}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Teléfono</Label>
                          <Input
                            value={destino.telefono}
                            onChange={(e) =>
                              handleUpdateDestino(
                                index,
                                'telefono',
                                e.target.value
                              )
                            }
                            disabled={!puedeEditar || destino.bloqueado}
                            className="mt-1"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-xs">Dirección</Label>
                          <Input
                            value={destino.direccion}
                            onChange={(e) =>
                              handleUpdateDestino(
                                index,
                                'direccion',
                                e.target.value
                              )
                            }
                            disabled={!puedeEditar || destino.bloqueado}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Departamento</Label>
                          <Select
                            value={destino.departamento}
                            onValueChange={(value) =>
                              handleUpdateDestino(index, 'departamento', value)
                            }
                            disabled={!puedeEditar || destino.bloqueado}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Seleccione..." />
                            </SelectTrigger>
                            <SelectContent>
                              {departamentos.map((dep) => (
                                <SelectItem key={dep.codigo} value={dep.nombre}>
                                  {dep.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Ciudad</Label>
                          <Input
                            value={destino.ciudad}
                            onChange={(e) =>
                              handleUpdateDestino(
                                index,
                                'ciudad',
                                e.target.value
                              )
                            }
                            disabled={!puedeEditar || destino.bloqueado}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        {puedeEditar && (
          <div className="flex flex-shrink-0 items-center justify-between border-t border-border px-6 py-4">
            <div className="text-xs text-muted-foreground">
              <span className="text-red-500">*</span> Campos obligatorios
              <span className="ml-3 text-orange-600">
                ⚠️ Solo puede guardar UNA vez
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleGuardar}
                className="gradient-brand gap-2"
              >
                <Save className="h-4 w-4" />
                Guardar y Bloquear
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
