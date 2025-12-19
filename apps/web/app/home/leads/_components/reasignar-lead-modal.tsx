'use client';

import { useState } from 'react';

import { Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback } from '@kit/ui/avatar';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Label } from '@kit/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Textarea } from '@kit/ui/textarea';

import { useAsesoresDisponibles, useAssignLead, useLeads } from '~/lib/leads';

// Tipo del lead desde la base de datos (reutiliza el tipo del hook)
type LeadDB = NonNullable<ReturnType<typeof useLeads>['data']>[number];

interface ReasignarLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: LeadDB;
}

export function ReasignarLeadModal({
  open,
  onOpenChange,
  lead,
}: ReasignarLeadModalProps) {
  const [asesorId, setAsesorId] = useState<string>('');
  const [motivo, setMotivo] = useState('');

  const { data: asesores, isLoading: loadingAsesores } = useAsesoresDisponibles();
  const assignLead = useAssignLead();

  const handleSubmit = () => {
    if (!asesorId) {
      toast.error('Selecciona un asesor');
      return;
    }

    assignLead.mutate(
      {
        lead_id: lead.id,
        asesor_id: asesorId,
        motivo: motivo || undefined,
      },
      {
        onSuccess: () => {
          toast.success(`Lead #${lead.numero} reasignado correctamente`);
          onOpenChange(false);
          setAsesorId('');
          setMotivo('');
        },
        onError: (error) => {
          toast.error(`Error: ${error.message}`);
        },
      }
    );
  };

  const getInitials = (nombre: string) => {
    return nombre
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="gradient-accent rounded-lg p-2">
              <UserPlus className="h-4 w-4 text-white" />
            </div>
            <div>
              <DialogTitle>Reasignar Lead</DialogTitle>
              <DialogDescription>
                Lead #{lead.numero} - {lead.razon_social}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Asesor actual */}
          {lead.asesor && (
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <Label className="text-xs text-muted-foreground">
                Asesor actual
              </Label>
              <div className="mt-1 flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {getInitials(lead.asesor.nombre)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{lead.asesor.nombre}</span>
              </div>
            </div>
          )}

          {/* Selector de nuevo asesor */}
          <div className="space-y-2">
            <Label>Nuevo asesor *</Label>
            {loadingAsesores ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Select value={asesorId} onValueChange={setAsesorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar asesor..." />
                </SelectTrigger>
                <SelectContent>
                  {asesores?.map((asesor) => (
                    <SelectItem
                      key={asesor.id}
                      value={asesor.id!}
                      disabled={!asesor.disponible || asesor.id === lead.asesor?.id}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[10px]">
                            {getInitials(asesor.nombre || '')}
                          </AvatarFallback>
                        </Avatar>
                        <span>{asesor.nombre}</span>
                        <Badge
                          variant={asesor.disponible ? 'secondary' : 'outline'}
                          className="ml-auto text-[10px]"
                        >
                          {asesor.leads_actuales}/{asesor.max_leads}
                        </Badge>
                        {asesor.id === lead.asesor?.id && (
                          <Badge variant="outline" className="text-[10px]">
                            Actual
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {asesores && asesores.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No hay asesores disponibles configurados
              </p>
            )}
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <Label>Motivo de la reasignación</Label>
            <Textarea
              placeholder="Opcional: indica el motivo de la reasignación..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!asesorId || assignLead.isPending}
            className="gradient-brand gap-2"
          >
            {assignLead.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Reasignar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
