'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { FileText, Save, X } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
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
import { Textarea } from '@kit/ui/textarea';

import { useCreateCotizacionFromLead, useTrmActual } from '~/lib/cotizaciones';

// Tipo para el lead desde la base de datos
interface LeadOrigen {
  id: string;
  numero: number;
  razon_social: string;
  nit: string;
  nombre_contacto: string;
  celular_contacto: string;
  email_contacto: string;
  requerimiento: string;
}

interface CrearCotizacionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (cotizacionId: string) => void;
  leadOrigen?: LeadOrigen;
}

export function CrearCotizacionModal({
  open,
  onOpenChange,
  onCreated,
  leadOrigen,
}: CrearCotizacionModalProps) {
  const router = useRouter();
  const [paso, setPaso] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hooks
  const { data: trmData } = useTrmActual();
  const createCotizacion = useCreateCotizacionFromLead();

  const trmActual = trmData?.valor || 4250;

  // Estado del formulario - se pre-llena con datos del lead
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    formaPago: 'ANTICIPADO',
    asunto: '',
    porcentajeInteres: 0,
    vigenciaDias: 15,
    condicionesComerciales: '',
    cuadroInformativo: '',
    mes: new Date().toLocaleString('es-CO', { month: 'long' }),
    semana: Math.ceil(new Date().getDate() / 7),
    fechaCierre: '',
    mesFacturacion: new Date().toLocaleString('es-CO', { month: 'long' }),
    linksAdicionales: '',
  });

  // Pre-llenar asunto cuando cambia el lead
  useEffect(() => {
    if (leadOrigen) {
      setFormData(prev => ({
        ...prev,
        asunto: `Cotización - ${leadOrigen.requerimiento?.substring(0, 100) || ''}`,
      }));
    }
  }, [leadOrigen]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGuardar = async () => {
    if (!leadOrigen) {
      toast.error('No hay lead seleccionado');
      return;
    }

    // Validar campos obligatorios
    if (!formData.asunto) {
      toast.error('El asunto es obligatorio');
      return;
    }

    setIsSubmitting(true);

    createCotizacion.mutate(
      { lead_id: leadOrigen.id },
      {
        onSuccess: (result) => {
          toast.success(`Cotización creada desde Lead #${leadOrigen.numero}`, {
            action: {
              label: 'Ver cotización',
              onClick: () => router.push('/home/cotizaciones'),
            },
          });
          onCreated?.(result.cotizacion_id);
          onOpenChange(false);
          setPaso(1);
          setIsSubmitting(false);
          // Navegar a cotizaciones
          router.push('/home/cotizaciones');
        },
        onError: (error) => {
          toast.error(`Error: ${error.message}`);
          setIsSubmitting(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col overflow-hidden p-0">
        {/* Header fijo */}
        <DialogHeader className="flex-shrink-0 border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="gradient-brand rounded-lg p-2">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle>Nueva Cotización desde Lead</DialogTitle>
                <DialogDescription className="sr-only">
                  Formulario para crear una nueva cotización con información del
                  cliente y productos
                </DialogDescription>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    TRM: ${trmActual.toLocaleString('es-CO')}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Paso {paso} de 2
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Contenido scrolleable */}
        <ScrollArea className="flex-1 px-6 py-4">
          {paso === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Datos del Lead (read-only) */}
                {leadOrigen && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 md:col-span-2">
                    <p className="mb-3 text-xs font-medium text-primary">
                      Datos del Lead #{leadOrigen.numero}
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-xs text-muted-foreground">Razón Social</span>
                        <p className="font-medium">{leadOrigen.razon_social}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">NIT</span>
                        <p className="font-medium">{leadOrigen.nit}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Contacto</span>
                        <p className="font-medium">{leadOrigen.nombre_contacto}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Celular</span>
                        <p className="font-medium">{leadOrigen.celular_contacto}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-xs text-muted-foreground">Email</span>
                        <p className="font-medium">{leadOrigen.email_contacto}</p>
                      </div>
                    </div>
                  </div>
                )}

                <Separator className="md:col-span-2" />

                {/* Forma de Pago */}
                <div>
                  <Label className="text-xs">Forma de Pago</Label>
                  <Select
                    value={formData.formaPago}
                    onValueChange={(value) => handleChange('formaPago', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ANTICIPADO">Anticipado</SelectItem>
                      <SelectItem value="CONTRA_ENTREGA">Contra Entrega</SelectItem>
                      <SelectItem value="CREDITO_8">Crédito 8 días</SelectItem>
                      <SelectItem value="CREDITO_15">Crédito 15 días</SelectItem>
                      <SelectItem value="CREDITO_30">Crédito 30 días</SelectItem>
                      <SelectItem value="CREDITO_45">Crédito 45 días</SelectItem>
                      <SelectItem value="CREDITO_60">Crédito 60 días</SelectItem>
                      <SelectItem value="CREDITO_90">Crédito 90 días</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fecha */}
                <div>
                  <Label className="text-xs">Fecha de Cotización</Label>
                  <Input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => handleChange('fecha', e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Asunto */}
                <div className="md:col-span-2">
                  <Label className="text-xs">
                    Asunto <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.asunto}
                    onChange={(e) => handleChange('asunto', e.target.value)}
                    placeholder="Descripción breve de la cotización"
                    className="mt-1"
                  />
                </div>

                {/* Vigencia */}
                <div>
                  <Label className="text-xs">Vigencia (días)</Label>
                  <Input
                    type="number"
                    value={formData.vigenciaDias}
                    onChange={(e) =>
                      handleChange(
                        'vigenciaDias',
                        parseInt(e.target.value) || 15
                      )
                    }
                    className="mt-1"
                  />
                </div>

                {/* Porcentaje de Interés */}
                <div>
                  <Label className="text-xs">% Interés</Label>
                  <Input
                    type="number"
                    value={formData.porcentajeInteres}
                    onChange={(e) =>
                      handleChange(
                        'porcentajeInteres',
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="mt-1"
                  />
                </div>

                {/* Requerimiento del Lead */}
                {leadOrigen && (
                  <div className="md:col-span-2">
                    <Label className="text-xs">Requerimiento Original</Label>
                    <p className="mt-1 rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
                      {leadOrigen.requerimiento}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {paso === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Condiciones Comerciales */}
                <div className="md:col-span-2">
                  <Label className="text-xs">Condiciones Comerciales</Label>
                  <Textarea
                    value={formData.condicionesComerciales}
                    onChange={(e) =>
                      handleChange('condicionesComerciales', e.target.value)
                    }
                    placeholder="Términos y condiciones específicas..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                {/* Cuadro Informativo */}
                <div className="md:col-span-2">
                  <Label className="text-xs">Cuadro Informativo</Label>
                  <Textarea
                    value={formData.cuadroInformativo}
                    onChange={(e) =>
                      handleChange('cuadroInformativo', e.target.value)
                    }
                    placeholder="Información adicional relevante..."
                    rows={2}
                    className="mt-1"
                  />
                </div>

                <Separator className="md:col-span-2" />

                {/* Información de Seguimiento */}
                <div>
                  <Label className="text-xs">Mes</Label>
                  <Input
                    value={formData.mes}
                    onChange={(e) => handleChange('mes', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs">Semana</Label>
                  <Input
                    type="number"
                    value={formData.semana}
                    onChange={(e) =>
                      handleChange('semana', parseInt(e.target.value) || 1)
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs">Fecha de Cierre Estimada</Label>
                  <Input
                    type="date"
                    value={formData.fechaCierre}
                    onChange={(e) => handleChange('fechaCierre', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs">Mes de Facturación</Label>
                  <Input
                    value={formData.mesFacturacion}
                    onChange={(e) =>
                      handleChange('mesFacturacion', e.target.value)
                    }
                    className="mt-1"
                  />
                </div>

                {/* Porcentaje de Interés */}
                <div>
                  <Label className="text-xs">Porcentaje de Interés (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.porcentajeInteres}
                    onChange={(e) =>
                      handleChange(
                        'porcentajeInteres',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="mt-1"
                  />
                </div>

                {/* Links Adicionales */}
                <div className="md:col-span-2">
                  <Label className="text-xs">Links Adicionales (opcional)</Label>
                  <Input
                    value={formData.linksAdicionales}
                    onChange={(e) =>
                      handleChange('linksAdicionales', e.target.value)
                    }
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Footer fijo */}
        <div className="flex flex-shrink-0 items-center justify-between border-t border-border px-6 py-4">
          <div className="text-xs text-muted-foreground">
            <span className="text-red-500">*</span> Campos obligatorios
          </div>
          <div className="flex items-center gap-2">
            {paso > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaso(paso - 1)}
              >
                Anterior
              </Button>
            )}
            {paso < 2 ? (
              <Button
                size="sm"
                onClick={() => setPaso(paso + 1)}
                className="gradient-brand"
              >
                Siguiente
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleGuardar}
                className="gradient-brand gap-2"
              >
                <Save className="h-4 w-4" />
                Guardar Cotización
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
