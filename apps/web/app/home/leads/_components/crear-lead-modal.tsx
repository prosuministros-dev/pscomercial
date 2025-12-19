'use client';

import { useState } from 'react';

import { Loader2, Megaphone, Save, X } from 'lucide-react';
import { toast } from 'sonner';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Textarea } from '@kit/ui/textarea';

import { useCreateLead, type CreateLeadInput } from '~/lib/leads';

interface CrearLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CrearLeadModal({
  open,
  onOpenChange,
}: CrearLeadModalProps) {
  const [formData, setFormData] = useState({
    razon_social: '',
    nit: '',
    nombre_contacto: '',
    email_contacto: '',
    celular_contacto: '',
    canal_origen: 'MANUAL' as const,
    requerimiento: '',
    fecha_lead: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createLead = useCreateLead();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.razon_social.trim()) {
      newErrors.razon_social = 'La razón social es obligatoria';
    }
    if (!formData.nit.trim()) {
      newErrors.nit = 'El NIT es obligatorio';
    }
    if (!formData.nombre_contacto.trim()) {
      newErrors.nombre_contacto = 'El nombre del contacto es obligatorio';
    }
    if (!formData.email_contacto.trim()) {
      newErrors.email_contacto = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_contacto)) {
      newErrors.email_contacto = 'El email no es válido';
    }
    if (!formData.celular_contacto.trim()) {
      newErrors.celular_contacto = 'El teléfono es obligatorio';
    }
    if (!formData.requerimiento.trim()) {
      newErrors.requerimiento = 'El requerimiento es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    const leadData: CreateLeadInput = {
      razon_social: formData.razon_social,
      nit: formData.nit,
      nombre_contacto: formData.nombre_contacto,
      celular_contacto: formData.celular_contacto,
      email_contacto: formData.email_contacto,
      requerimiento: formData.requerimiento,
      canal_origen: formData.canal_origen,
      fecha_lead: formData.fecha_lead,
    };

    createLead.mutate(leadData, {
      onSuccess: (result) => {
        toast.success(`Lead creado exitosamente`);
        onOpenChange(false);
        resetForm();
      },
      onError: (error) => {
        toast.error(`Error al crear lead: ${error.message}`);
      },
    });
  };

  const resetForm = () => {
    setFormData({
      razon_social: '',
      nit: '',
      nombre_contacto: '',
      email_contacto: '',
      celular_contacto: '',
      canal_origen: 'MANUAL',
      requerimiento: '',
      fecha_lead: new Date().toISOString().split('T')[0],
    });
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden p-0">
        <DialogHeader className="flex-shrink-0 border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="gradient-accent rounded-lg p-2">
                <Megaphone className="h-4 w-4 text-white" />
              </div>
              <div>
                <DialogTitle>Nuevo Lead</DialogTitle>
                <DialogDescription className="sr-only">
                  Formulario para crear un nuevo lead con información del
                  cliente y requerimiento
                </DialogDescription>
                <p className="mt-1 text-sm text-muted-foreground">
                  Completa la información del cliente
                </p>
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

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {/* Datos del Cliente */}
            <div className="space-y-3">
              <h4 className="text-sm">Información del Cliente</h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label htmlFor="razon_social" className="text-xs">
                    Razón Social <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="razon_social"
                    value={formData.razon_social}
                    onChange={(e) =>
                      handleChange('razon_social', e.target.value)
                    }
                    placeholder="Ej: TechCorp S.A.S"
                    className={`mt-1 h-9 text-sm ${errors.razon_social ? 'border-red-500' : ''}`}
                  />
                  {errors.razon_social && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.razon_social}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="nit" className="text-xs">
                    NIT <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nit"
                    value={formData.nit}
                    onChange={(e) => handleChange('nit', e.target.value)}
                    placeholder="Ej: 900.123.456-7"
                    className={`mt-1 h-9 text-sm ${errors.nit ? 'border-red-500' : ''}`}
                  />
                  {errors.nit && (
                    <p className="mt-1 text-xs text-red-500">{errors.nit}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="canal_origen" className="text-xs">
                    Canal de Entrada
                  </Label>
                  <Select
                    value={formData.canal_origen}
                    onValueChange={(value) => handleChange('canal_origen', value)}
                  >
                    <SelectTrigger className="mt-1 h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MANUAL">Manual</SelectItem>
                      <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                      <SelectItem value="WEB">Web</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fecha_lead" className="text-xs">
                    Fecha del Lead
                  </Label>
                  <Input
                    id="fecha_lead"
                    type="date"
                    value={formData.fecha_lead}
                    onChange={(e) => handleChange('fecha_lead', e.target.value)}
                    className="mt-1 h-9 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div className="space-y-3">
              <h4 className="text-sm">Contacto Principal</h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label htmlFor="nombre_contacto" className="text-xs">
                    Nombre del Contacto <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nombre_contacto"
                    value={formData.nombre_contacto}
                    onChange={(e) =>
                      handleChange('nombre_contacto', e.target.value)
                    }
                    placeholder="Ej: Pedro Martínez"
                    className={`mt-1 h-9 text-sm ${errors.nombre_contacto ? 'border-red-500' : ''}`}
                  />
                  {errors.nombre_contacto && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.nombre_contacto}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email_contacto" className="text-xs">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email_contacto"
                    type="email"
                    value={formData.email_contacto}
                    onChange={(e) => handleChange('email_contacto', e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className={`mt-1 h-9 text-sm ${errors.email_contacto ? 'border-red-500' : ''}`}
                  />
                  {errors.email_contacto && (
                    <p className="mt-1 text-xs text-red-500">{errors.email_contacto}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="celular_contacto" className="text-xs">
                    Teléfono <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="celular_contacto"
                    value={formData.celular_contacto}
                    onChange={(e) => handleChange('celular_contacto', e.target.value)}
                    placeholder="+57 310 555 0100"
                    className={`mt-1 h-9 text-sm ${errors.celular_contacto ? 'border-red-500' : ''}`}
                  />
                  {errors.celular_contacto && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.celular_contacto}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Requerimiento */}
            <div className="space-y-3">
              <h4 className="text-sm">Requerimiento</h4>

              <div>
                <Label htmlFor="requerimiento" className="text-xs">
                  Describe el requerimiento del cliente{' '}
                  <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="requerimiento"
                  value={formData.requerimiento}
                  onChange={(e) =>
                    handleChange('requerimiento', e.target.value)
                  }
                  placeholder="Ej: Solicitud de cotización para 20 laptops Dell y licencias Microsoft para nueva sede"
                  rows={3}
                  className={`mt-1 resize-none text-sm ${errors.requerimiento ? 'border-red-500' : ''}`}
                />
                {errors.requerimiento && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.requerimiento}
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>

        <div className="flex flex-shrink-0 items-center justify-between border-t border-border px-6 py-4">
          <p className="text-xs text-muted-foreground">
            Los campos marcados con <span className="text-red-500">*</span> son
            obligatorios
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={createLead.isPending}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              className="gradient-brand gap-2"
              disabled={createLead.isPending}
            >
              {createLead.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {createLead.isPending ? 'Creando...' : 'Crear Lead'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
