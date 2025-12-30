'use client';

import { useState, useEffect } from 'react';

import { Eye, EyeOff, Loader2, Save, UserPlus } from 'lucide-react';
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

import { useCreateUsuario, useUpdateUsuario } from '~/lib/usuarios';

type UsuarioData = {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  area: string | null;
  estado: string | null;
};

interface UsuarioFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario?: UsuarioData | null;
}

export function UsuarioFormModal({
  open,
  onOpenChange,
  usuario,
}: UsuarioFormModalProps) {
  const isEditing = !!usuario;

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    area: '',
    estado: 'ACTIVO',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createUsuario = useCreateUsuario();
  const updateUsuario = useUpdateUsuario();

  // Cargar datos cuando se edita
  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre,
        email: usuario.email,
        password: '',
        telefono: usuario.telefono || '',
        area: usuario.area || '',
        estado: usuario.estado || 'ACTIVO',
      });
    } else {
      setFormData({
        nombre: '',
        email: '',
        password: '',
        telefono: '',
        area: '',
        estado: 'ACTIVO',
      });
    }
    setErrors({});
  }, [usuario, open]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!isEditing && !formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (!isEditing && formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error('Por favor corrige los errores');
      return;
    }

    if (isEditing && usuario) {
      updateUsuario.mutate(
        {
          id: usuario.id,
          nombre: formData.nombre,
          telefono: formData.telefono || null,
          area: formData.area || null,
          estado: formData.estado as 'ACTIVO' | 'INACTIVO',
        },
        {
          onSuccess: () => {
            toast.success('Usuario actualizado');
            onOpenChange(false);
          },
          onError: (error) => {
            toast.error(`Error: ${error.message}`);
          },
        }
      );
    } else {
      createUsuario.mutate(
        {
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password,
          telefono: formData.telefono || undefined,
          area: formData.area || undefined,
          estado: formData.estado as 'ACTIVO' | 'INACTIVO',
        },
        {
          onSuccess: () => {
            toast.success('Usuario creado correctamente');
            onOpenChange(false);
          },
          onError: (error) => {
            toast.error(`Error: ${error.message}`);
          },
        }
      );
    }
  };

  const isPending = createUsuario.isPending || updateUsuario.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="gradient-accent rounded-lg p-2">
              <UserPlus className="h-4 w-4 text-white" />
            </div>
            <div>
              <DialogTitle>
                {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? 'Modifica los datos del usuario'
                  : 'Crea una nueva cuenta de usuario'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              placeholder="Ej: Juan Pérez"
              className={errors.nombre ? 'border-red-500' : ''}
            />
            {errors.nombre && (
              <p className="text-xs text-red-500">{errors.nombre}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="correo@ejemplo.com"
              disabled={isEditing}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
            {isEditing && (
              <p className="text-xs text-muted-foreground">
                El email no se puede cambiar
              </p>
            )}
          </div>

          {/* Password - solo para crear */}
          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="password">
                Contraseña <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
              )}
            </div>
          )}

          {/* Teléfono y Área */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                placeholder="+57 310..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Área</Label>
              <Input
                id="area"
                value={formData.area}
                onChange={(e) => handleChange('area', e.target.value)}
                placeholder="Ej: Comercial"
              />
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select
              value={formData.estado}
              onValueChange={(value) => handleChange('estado', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVO">Activo</SelectItem>
                <SelectItem value="INACTIVO">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="gradient-brand gap-2"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isPending
              ? 'Guardando...'
              : isEditing
                ? 'Guardar cambios'
                : 'Crear usuario'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
