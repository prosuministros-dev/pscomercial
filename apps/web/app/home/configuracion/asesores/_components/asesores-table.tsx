'use client';

import { useState } from 'react';

import { Edit2, Loader2, MoreHorizontal, ToggleLeft, ToggleRight, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback } from '@kit/ui/avatar';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

import { useAsesores, useToggleAsesorActivo } from '~/lib/asesores';

import { AsesorFormModal } from './asesor-form-modal';

interface AsesoresTableProps {
  onAgregarClick: () => void;
}

export function AsesoresTable({ onAgregarClick }: AsesoresTableProps) {
  const { data: asesores, isLoading, error } = useAsesores();
  const toggleActivo = useToggleAsesorActivo();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [asesorEditar, setAsesorEditar] = useState<typeof asesores extends (infer T)[] | undefined ? T : never | null>(null);

  const handleToggleActivo = (asesorId: string, activo: boolean) => {
    toggleActivo.mutate(
      { id: asesorId, activo: !activo },
      {
        onSuccess: () => {
          toast.success(activo ? 'Asesor desactivado' : 'Asesor activado');
        },
        onError: (error) => {
          toast.error(`Error: ${error.message}`);
        },
      }
    );
  };

  const handleEditar = (asesor: NonNullable<typeof asesores>[number]) => {
    setAsesorEditar(asesor);
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
        <p className="text-sm text-destructive">Error al cargar asesores: {error.message}</p>
      </div>
    );
  }

  if (!asesores || asesores.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
        <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">No hay asesores configurados</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Agrega usuarios como asesores para que puedan recibir leads
        </p>
        <Button onClick={onAgregarClick} className="mt-4 gradient-brand">
          Agregar primer asesor
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asesor</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-center">Límite Leads</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {asesores.map((asesor) => (
              <TableRow key={asesor.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(asesor.usuario?.nombre || 'NA')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{asesor.usuario?.nombre || 'Sin nombre'}</p>
                      <p className="text-xs text-muted-foreground">
                        {asesor.usuario?.estado === 'ACTIVO' ? 'Usuario activo' : 'Usuario inactivo'}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {asesor.usuario?.email || '-'}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary" className="font-mono">
                    {asesor.max_leads_pendientes}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={asesor.activo ? 'default' : 'outline'}
                    className={asesor.activo ? 'bg-green-500/10 text-green-600 border-green-500/20' : ''}
                  >
                    {asesor.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditar(asesor)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Editar configuración
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggleActivo(asesor.id, asesor.activo)}
                        disabled={toggleActivo.isPending}
                      >
                        {asesor.activo ? (
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

      {/* Modal de edición */}
      {asesorEditar && (
        <AsesorFormModal
          open={editModalOpen}
          onOpenChange={(open) => {
            setEditModalOpen(open);
            if (!open) setAsesorEditar(null);
          }}
          asesor={asesorEditar}
        />
      )}
    </>
  );
}
