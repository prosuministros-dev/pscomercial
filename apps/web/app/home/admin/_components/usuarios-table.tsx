'use client';

import { useState } from 'react';

import {
  Edit2,
  Loader2,
  MoreHorizontal,
  Plus,
  ToggleLeft,
  ToggleRight,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback } from '@kit/ui/avatar';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';

import { useToggleUsuarioEstado, useUsuarios } from '~/lib/usuarios';

import { UsuarioFormModal } from './usuario-form-modal';

export function UsuariosTable() {
  const { data: usuarios, isLoading, error } = useUsuarios();
  const toggleEstado = useToggleUsuarioEstado();

  const [crearModalOpen, setCrearModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState<
    NonNullable<typeof usuarios>[number] | null
  >(null);

  const handleToggleEstado = (
    usuarioId: string,
    estadoActual: string | null
  ) => {
    const nuevoEstado = estadoActual === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    toggleEstado.mutate(
      { id: usuarioId, estado: nuevoEstado },
      {
        onSuccess: () => {
          toast.success(
            nuevoEstado === 'ACTIVO'
              ? 'Usuario activado'
              : 'Usuario desactivado'
          );
        },
        onError: (error) => {
          toast.error(`Error: ${error.message}`);
        },
      }
    );
  };

  const handleEditar = (usuario: NonNullable<typeof usuarios>[number]) => {
    setUsuarioEditar(usuario);
    setEditModalOpen(true);
  };

  const getInitials = (nombre: string) => {
    return nombre
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">
          Error al cargar usuarios: {error.message}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="gradient-accent rounded-lg p-2">
              <Users className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Usuarios del Sistema</h3>
              <p className="text-xs text-muted-foreground">
                {usuarios?.length || 0} usuarios registrados
              </p>
            </div>
          </div>
          <Button
            onClick={() => setCrearModalOpen(true)}
            className="gradient-brand gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>

        {/* Tabla */}
        {!usuarios || usuarios.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No hay usuarios</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Crea el primer usuario del sistema
            </p>
            <Button
              onClick={() => setCrearModalOpen(true)}
              className="mt-4 gradient-brand"
            >
              Crear usuario
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(usuario.nombre)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{usuario.nombre}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {usuario.email}
                    </TableCell>
                    <TableCell>{usuario.area || '-'}</TableCell>
                    <TableCell>{usuario.telefono || '-'}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          usuario.estado === 'ACTIVO' ? 'default' : 'outline'
                        }
                        className={
                          usuario.estado === 'ACTIVO'
                            ? 'bg-green-500/10 text-green-600 border-green-500/20'
                            : ''
                        }
                      >
                        {usuario.estado || 'ACTIVO'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(usuario.creado_en)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditar(usuario)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleToggleEstado(usuario.id, usuario.estado)
                            }
                            disabled={toggleEstado.isPending}
                          >
                            {usuario.estado === 'ACTIVO' ? (
                              <>
                                <ToggleLeft className="mr-2 h-4 w-4" />
                                Desactivar
                              </>
                            ) : (
                              <>
                                <ToggleRight className="mr-2 h-4 w-4" />
                                Activar
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Modal Crear */}
      <UsuarioFormModal
        open={crearModalOpen}
        onOpenChange={setCrearModalOpen}
      />

      {/* Modal Editar */}
      {usuarioEditar && (
        <UsuarioFormModal
          open={editModalOpen}
          onOpenChange={(open) => {
            setEditModalOpen(open);
            if (!open) setUsuarioEditar(null);
          }}
          usuario={usuarioEditar}
        />
      )}
    </>
  );
}
