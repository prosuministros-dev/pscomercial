'use client';

import { useState } from 'react';

import { Megaphone, Save, X } from 'lucide-react';
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

import { usuarios, type Lead } from '~/lib/mock-data';

interface CrearLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (lead: Partial<Lead>) => void;
}

export function CrearLeadModal({
  open,
  onOpenChange,
  onCreated,
}: CrearLeadModalProps) {
  const [formData, setFormData] = useState({
    razonSocial: '',
    nit: '',
    nombreContacto: '',
    email: '',
    telefono: '',
    origen: 'Web',
    requerimiento: '',
    asignadoA: 'Ana García',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.razonSocial.trim()) {
      newErrors.razonSocial = 'La razón social es obligatoria';
    }
    if (!formData.nit.trim()) {
      newErrors.nit = 'El NIT es obligatorio';
    }
    if (!formData.nombreContacto.trim()) {
      newErrors.nombreContacto = 'El nombre del contacto es obligatorio';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
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

    const nuevoLead: Partial<Lead> = {
      id: Date.now().toString(),
      numero: 105, // En producción sería auto-incrementado
      ...formData,
      origen: formData.origen as Lead['origen'],
      fechaLead: new Date().toISOString(),
      estado: 'pendiente',
      alerta24h: false,
      creadoPor: 'Usuario Actual',
      creadoEn: new Date().toISOString(),
    };

    onCreated(nuevoLead);
    toast.success(`Lead #${nuevoLead.numero} creado exitosamente`);
    onOpenChange(false);

    // Reset form
    setFormData({
      razonSocial: '',
      nit: '',
      nombreContacto: '',
      email: '',
      telefono: '',
      origen: 'Web',
      requerimiento: '',
      asignadoA: 'Ana García',
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
                  <Label htmlFor="razonSocial" className="text-xs">
                    Razón Social <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="razonSocial"
                    value={formData.razonSocial}
                    onChange={(e) =>
                      handleChange('razonSocial', e.target.value)
                    }
                    placeholder="Ej: TechCorp S.A.S"
                    className={`mt-1 h-9 text-sm ${errors.razonSocial ? 'border-red-500' : ''}`}
                  />
                  {errors.razonSocial && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.razonSocial}
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
                  <Label htmlFor="origen" className="text-xs">
                    Fuente del Lead
                  </Label>
                  <Select
                    value={formData.origen}
                    onValueChange={(value) => handleChange('origen', value)}
                  >
                    <SelectTrigger className="mt-1 h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Web">Web</SelectItem>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="Teléfono">Teléfono</SelectItem>
                      <SelectItem value="Manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div className="space-y-3">
              <h4 className="text-sm">Contacto Principal</h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label htmlFor="nombreContacto" className="text-xs">
                    Nombre del Contacto <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nombreContacto"
                    value={formData.nombreContacto}
                    onChange={(e) =>
                      handleChange('nombreContacto', e.target.value)
                    }
                    placeholder="Ej: Pedro Martínez"
                    className={`mt-1 h-9 text-sm ${errors.nombreContacto ? 'border-red-500' : ''}`}
                  />
                  {errors.nombreContacto && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.nombreContacto}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="text-xs">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className={`mt-1 h-9 text-sm ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="telefono" className="text-xs">
                    Teléfono <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => handleChange('telefono', e.target.value)}
                    placeholder="+57 310 555 0100"
                    className={`mt-1 h-9 text-sm ${errors.telefono ? 'border-red-500' : ''}`}
                  />
                  {errors.telefono && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.telefono}
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

            {/* Asignación */}
            <div className="space-y-3">
              <h4 className="text-sm">Asignación</h4>

              <div>
                <Label htmlFor="asignadoA" className="text-xs">
                  Asesor Comercial
                </Label>
                <Select
                  value={formData.asignadoA}
                  onValueChange={(value) => handleChange('asignadoA', value)}
                >
                  <SelectTrigger className="mt-1 h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {usuarios
                      .filter(
                        (u) => u.rol === 'Comercial' || u.rol === 'Gerencia',
                      )
                      .map((usuario) => (
                        <SelectItem key={usuario.id} value={usuario.nombre}>
                          {usuario.nombre}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
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
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              className="gradient-brand gap-2"
            >
              <Save className="h-3.5 w-3.5" />
              Crear Lead
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
