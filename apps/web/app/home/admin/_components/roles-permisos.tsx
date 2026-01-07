'use client';

import { useState } from 'react';

import {
  Edit,
  Loader2,
  Lock,
  Plus,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

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
import { Textarea } from '@kit/ui/textarea';

import {
  useRoles,
  usePermisos,
  useCrearRol,
  useActualizarRol,
  useEliminarRol,
  type RolConPermisos,
  type Permiso,
} from '~/lib/admin';

export function RolesPermisos() {
  // Queries
  const { data: roles = [], isLoading: loadingRoles } = useRoles();
  const { data: permisos = [], isLoading: loadingPermisos } = usePermisos();

  // Mutations
  const crearRol = useCrearRol();
  const actualizarRol = useActualizarRol();
  const eliminarRol = useEliminarRol();

  // Estado local
  const [modalRol, setModalRol] = useState(false);
  const [rolSeleccionado, setRolSeleccionado] = useState<RolConPermisos | null>(null);

  const [formRol, setFormRol] = useState({
    nombre: '',
    descripcion: '',
    permisoIds: [] as string[],
  });

  // Agrupar permisos por módulo
  const permisosPorModulo = permisos.reduce(
    (acc, permiso) => {
      if (!acc[permiso.modulo]) {
        acc[permiso.modulo] = [];
      }
      acc[permiso.modulo]!.push(permiso);
      return acc;
    },
    {} as Record<string, Permiso[]>,
  );

  const handleCrearRol = () => {
    setRolSeleccionado(null);
    setFormRol({
      nombre: '',
      descripcion: '',
      permisoIds: [],
    });
    setModalRol(true);
  };

  const handleEditarRol = (rol: RolConPermisos) => {
    setRolSeleccionado(rol);
    setFormRol({
      nombre: rol.nombre,
      descripcion: rol.descripcion || '',
      permisoIds: rol.permisos.map(p => p.id),
    });
    setModalRol(true);
  };

  const handleGuardarRol = async () => {
    if (!formRol.nombre.trim()) {
      toast.error('El nombre del rol es obligatorio');
      return;
    }

    try {
      if (rolSeleccionado) {
        await actualizarRol.mutateAsync({
          id: rolSeleccionado.id,
          nombre: formRol.nombre,
          descripcion: formRol.descripcion,
          permisoIds: formRol.permisoIds,
        });
        toast.success('Rol actualizado exitosamente');
      } else {
        await crearRol.mutateAsync({
          nombre: formRol.nombre,
          descripcion: formRol.descripcion,
          permisoIds: formRol.permisoIds,
        });
        toast.success('Rol creado exitosamente');
      }
      setModalRol(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar el rol');
    }
  };

  const handleEliminarRol = async (rol: RolConPermisos) => {
    if (confirm(`¿Estás seguro de eliminar el rol "${rol.nombre}"?`)) {
      try {
        await eliminarRol.mutateAsync(rol.id);
        toast.success('Rol eliminado exitosamente');
      } catch (error: any) {
        toast.error(error.message || 'Error al eliminar el rol');
      }
    }
  };

  const togglePermiso = (permisoId: string) => {
    setFormRol((prev) => ({
      ...prev,
      permisoIds: prev.permisoIds.includes(permisoId)
        ? prev.permisoIds.filter((p) => p !== permisoId)
        : [...prev.permisoIds, permisoId],
    }));
  };

  const isLoading = loadingRoles || loadingPermisos;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {roles.length} roles configurados
        </p>
        <Button
          size="sm"
          onClick={handleCrearRol}
          className="gradient-brand gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Rol
        </Button>
      </div>

      {/* Grid de Roles */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((rol) => (
          <Card key={rol.id} className="p-4">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h4 className="font-semibold">{rol.nombre}</h4>
                  <Badge variant="default" className="h-5 text-xs">
                    activo
                  </Badge>
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {rol.descripcion || 'Sin descripción'}
                </p>
              </div>
            </div>

            <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>{rol.permisos.length} permisos</span>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 flex-1 text-xs"
                onClick={() => handleEditarRol(rol)}
              >
                <Edit className="mr-1 h-3 w-3" />
                Editar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs text-red-600 hover:text-red-600"
                onClick={() => handleEliminarRol(rol)}
                disabled={eliminarRol.isPending}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal Rol */}
      <Dialog open={modalRol} onOpenChange={setModalRol}>
        <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {rolSeleccionado ? 'Editar Rol' : 'Crear Rol'}
            </DialogTitle>
            <DialogDescription>
              Configura los permisos y accesos del rol
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              <div>
                <Label>Nombre del Rol *</Label>
                <Input
                  value={formRol.nombre}
                  onChange={(e) =>
                    setFormRol({ ...formRol, nombre: e.target.value })
                  }
                  placeholder="Ej: Gerente Comercial"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Descripción</Label>
                <Textarea
                  value={formRol.descripcion}
                  onChange={(e) =>
                    setFormRol({ ...formRol, descripcion: e.target.value })
                  }
                  placeholder="Describe las responsabilidades de este rol"
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div>
                <Label className="mb-3 block">
                  Permisos ({formRol.permisoIds.length} seleccionados)
                </Label>
                <div className="space-y-4">
                  {Object.entries(permisosPorModulo).map(([modulo, permisosList]) => (
                    <Card key={modulo} className="p-3">
                      <h4 className="mb-3 font-semibold capitalize">{modulo}</h4>
                      <div className="grid gap-2 md:grid-cols-2">
                        {permisosList.map((permiso) => (
                          <div
                            key={permiso.id}
                            className="flex items-start gap-2"
                          >
                            <Checkbox
                              checked={formRol.permisoIds.includes(permiso.id)}
                              onCheckedChange={() => togglePermiso(permiso.id)}
                            />
                            <div className="flex-1">
                              <p className="text-sm capitalize">
                                {permiso.accion}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {permiso.descripcion}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="flex gap-2 border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setModalRol(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGuardarRol}
              className="gradient-brand flex-1"
              disabled={crearRol.isPending || actualizarRol.isPending}
            >
              {(crearRol.isPending || actualizarRol.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {rolSeleccionado ? 'Actualizar' : 'Crear'} Rol
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
