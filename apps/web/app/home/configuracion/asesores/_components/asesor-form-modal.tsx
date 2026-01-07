'use client';

import { useState, useEffect } from 'react';

import { Loader2, Save, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback } from '@kit/ui/avatar';
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
import { Switch } from '@kit/ui/switch';

import {
  useCreateAsesorConfig,
  useUpdateAsesorConfig,
  useUsuariosDisponiblesParaAsesor,
} from '~/lib/asesores';

// Tipo del asesor desde la API
type AsesorData = {
  id: string;
  usuario_id: string;
  activo: boolean;
  max_leads_pendientes: number;
  usuario?: {
    id: string;
    nombre: string;
    email: string;
  } | null;
};

interface AsesorFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asesor?: AsesorData | null;
}

export function AsesorFormModal({
  open,
  onOpenChange,
  asesor,
}: AsesorFormModalProps) {
  const isEditing = !!asesor;

  const [usuarioId, setUsuarioId] = useState('');
  const [maxLeads, setMaxLeads] = useState(5);
  const [activo, setActivo] = useState(true);

  const { data: usuariosDisponibles, isLoading: loadingUsuarios } =
    useUsuariosDisponiblesParaAsesor();
  const createAsesor = useCreateAsesorConfig();
  const updateAsesor = useUpdateAsesorConfig();

  // Cargar datos cuando se edita
  useEffect(() => {
    if (asesor) {
      setUsuarioId(asesor.usuario_id);
      setMaxLeads(asesor.max_leads_pendientes);
      setActivo(asesor.activo);
    } else {
      setUsuarioId('');
      setMaxLeads(5);
      setActivo(true);
    }
  }, [asesor, open]);

  const handleSubmit = () => {
    if (!isEditing && !usuarioId) {
      toast.error('Selecciona un usuario');
      return;
    }

    if (maxLeads < 1 || maxLeads > 50) {
      toast.error('El límite debe estar entre 1 y 50');
      return;
    }

    if (isEditing && asesor) {
      updateAsesor.mutate(
        {
          id: asesor.id,
          max_leads_pendientes: maxLeads,
          activo,
        },
        {
          onSuccess: () => {
            toast.success('Configuración actualizada');
            onOpenChange(false);
          },
          onError: (error) => {
            toast.error(`Error: ${error.message}`);
          },
        }
      );
    } else {
      createAsesor.mutate(
        {
          usuario_id: usuarioId,
          max_leads_pendientes: maxLeads,
          activo,
        },
        {
          onSuccess: () => {
            toast.success('Asesor agregado correctamente');
            onOpenChange(false);
          },
          onError: (error) => {
            toast.error(`Error: ${error.message}`);
          },
        }
      );
    }
  };

  const getInitials = (nombre: string) => {
    return nombre
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isPending = createAsesor.isPending || updateAsesor.isPending;

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
                {isEditing ? 'Editar Asesor' : 'Agregar Asesor'}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? 'Modifica la configuración del asesor'
                  : 'Configura un usuario como asesor comercial'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Selector de usuario (solo para crear) */}
          {!isEditing && (
            <div className="space-y-2">
              <Label>Usuario</Label>
              {loadingUsuarios ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Select value={usuarioId} onValueChange={setUsuarioId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar usuario..." />
                  </SelectTrigger>
                  <SelectContent>
                    {usuariosDisponibles?.map((usuario) => (
                      <SelectItem key={usuario.id} value={usuario.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[10px]">
                              {getInitials(usuario.nombre)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{usuario.nombre}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {usuariosDisponibles && usuariosDisponibles.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No hay usuarios disponibles para agregar como asesores
                </p>
              )}
            </div>
          )}

          {/* Usuario actual (solo para editar) */}
          {isEditing && asesor?.usuario && (
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <Label className="text-xs text-muted-foreground">Usuario</Label>
              <div className="mt-1 flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {getInitials(asesor.usuario.nombre)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="text-sm font-medium">{asesor.usuario.nombre}</span>
                  <p className="text-xs text-muted-foreground">{asesor.usuario.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Límite de leads */}
          <div className="space-y-2">
            <Label htmlFor="maxLeads">Límite de leads pendientes</Label>
            <Input
              id="maxLeads"
              type="number"
              min={1}
              max={50}
              value={maxLeads}
              onChange={(e) => setMaxLeads(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Cantidad máxima de leads que puede tener asignados simultáneamente (1-50)
            </p>
          </div>

          {/* Estado activo */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="activo">Asesor activo</Label>
              <p className="text-xs text-muted-foreground">
                Solo los asesores activos pueden recibir nuevos leads
              </p>
            </div>
            <Switch
              id="activo"
              checked={activo}
              onCheckedChange={setActivo}
            />
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
            disabled={isPending || (!isEditing && !usuarioId)}
            className="gradient-brand gap-2"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isPending ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Agregar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
