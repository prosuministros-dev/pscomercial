'use client';

import { useState } from 'react';

import { MoreVertical, Plus, Search, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card } from '@kit/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Input } from '@kit/ui/input';

import { useRejectLead, useLeads } from '~/lib/leads';

// Tipo del lead desde la base de datos (reutiliza el tipo del hook)
type LeadDB = NonNullable<ReturnType<typeof useLeads>['data']>[number];

interface LeadsKanbanProps {
  leads: LeadDB[];
  onVerDetalle: (lead: LeadDB) => void;
  onCrear: () => void;
  onReasignar?: (lead: LeadDB) => void;
  onConvertir?: (lead: LeadDB) => void;
  puedeCrear?: boolean;
}

export function LeadsKanban({ leads, onVerDetalle, onCrear, onReasignar, onConvertir, puedeCrear = true }: LeadsKanbanProps) {
  const [busqueda, setBusqueda] = useState('');
  const [arrastrando, setArrastrando] = useState<string | null>(null);

  const rejectLead = useRejectLead();

  const columnas = [
    { id: 'PENDIENTE_ASIGNACION', titulo: 'Pendiente', color: 'border-yellow-500' },
    { id: 'ASIGNADO', titulo: 'Asignado', color: 'border-blue-500' },
    { id: 'CONVERTIDO', titulo: 'Convertido', color: 'border-green-500' },
    { id: 'RECHAZADO', titulo: 'Rechazado', color: 'border-gray-500' },
  ];

  const leadsFiltrados = leads.filter((lead) => {
    const matchBusqueda =
      busqueda === '' ||
      lead.numero.toString().includes(busqueda) ||
      lead.razon_social.toLowerCase().includes(busqueda.toLowerCase()) ||
      lead.nombre_contacto.toLowerCase().includes(busqueda.toLowerCase());
    return matchBusqueda;
  });

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setArrastrando(leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, nuevoEstado: string) => {
    e.preventDefault();
    if (arrastrando) {
      const lead = leads.find((l) => l.id === arrastrando);
      if (lead) {
        // TODO: Implementar cambio de estado via mutation
        toast.info(`Funcionalidad de arrastrar próximamente`);
      }
      setArrastrando(null);
    }
  };

  const handleDragEnd = () => {
    setArrastrando(null);
  };

  const handleConvertir = (lead: LeadDB) => {
    if (onConvertir) {
      onConvertir(lead);
    }
  };

  const handleRechazar = (lead: LeadDB) => {
    rejectLead.mutate(
      { lead_id: lead.id, motivo_rechazo: 'Rechazado desde kanban' },
      {
        onSuccess: () => {
          toast.success(`Lead #${lead.numero} rechazado`);
        },
        onError: (error) => {
          toast.error(`Error: ${error.message}`);
        },
      }
    );
  };

  // Calcular si supera 24h
  const supera24h = (fechaCreacion: string) => {
    const ahora = new Date();
    const creacion = new Date(fechaCreacion);
    const diff = ahora.getTime() - creacion.getTime();
    return diff > 24 * 60 * 60 * 1000;
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header con búsqueda y crear */}
      <div className="mb-3 flex flex-shrink-0 items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar leads..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
        {puedeCrear && (
          <Button
            size="sm"
            onClick={onCrear}
            className="gradient-brand h-8 gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Crear Lead</span>
          </Button>
        )}
      </div>

      {/* Kanban Board - Responsive */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex h-full gap-2 pb-2">
          {columnas.map((columna) => {
            const leadsColumna = leadsFiltrados.filter(
              (lead) => lead.estado === columna.id,
            );

            return (
              <div
                key={columna.id}
                className="flex min-w-[220px] max-w-[280px] flex-1 flex-col"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, columna.id)}
              >
                {/* Header de columna */}
                <div
                  className={`border-t-2 ${columna.color} mb-2 rounded-t-lg bg-secondary/30 p-1.5 md:p-2`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="truncate text-xs font-medium md:text-sm">
                      {columna.titulo}
                    </h4>
                    <Badge variant="secondary" className="text-[10px] md:text-xs">
                      {leadsColumna.length}
                    </Badge>
                  </div>
                </div>

                {/* Cards de leads */}
                <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
                  {leadsColumna.map((lead) => (
                    <Card
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onDragEnd={handleDragEnd}
                      className={`group relative cursor-move border-l-2 bg-card/50 p-2.5 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${columna.color} ${
                        arrastrando === lead.id
                          ? 'rotate-2 scale-95 opacity-40'
                          : ''
                      }`}
                      onClick={() => onVerDetalle(lead)}
                    >
                      {/* Header ultra-compacto */}
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-mono text-[9px] text-muted-foreground/60">
                          #{lead.numero.toString().padStart(4, '0')}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <MoreVertical className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onVerDetalle(lead);
                              }}
                            >
                              Ver detalles
                            </DropdownMenuItem>
                            {lead.estado === 'ASIGNADO' && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleConvertir(lead);
                                }}
                              >
                                Convertir a cotización
                              </DropdownMenuItem>
                            )}
                            {lead.estado !== 'RECHAZADO' && lead.estado !== 'CONVERTIDO' && onReasignar && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onReasignar(lead);
                                }}
                              >
                                <UserPlus className="mr-2 h-3.5 w-3.5" />
                                Reasignar
                              </DropdownMenuItem>
                            )}
                            {lead.estado !== 'RECHAZADO' && lead.estado !== 'CONVERTIDO' && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRechazar(lead);
                                }}
                              >
                                Rechazar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Razón social compacta */}
                      <h4 className="mb-2 line-clamp-2 text-sm font-medium leading-tight">
                        {lead.razon_social}
                      </h4>

                      {/* Alerta si aplica */}
                      {supera24h(lead.creado_en) && lead.estado !== 'CONVERTIDO' && lead.estado !== 'RECHAZADO' && (
                        <div className="mb-2 flex items-center gap-1 text-[10px] text-yellow-600 dark:text-yellow-500">
                          <div className="h-1.5 w-1.5 rounded-full bg-yellow-600 dark:bg-yellow-500" />
                          <span>Requiere atención</span>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-muted-foreground/60">
                          {new Date(lead.creado_en).toLocaleDateString('es-CO', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                        <div className="gradient-accent flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold text-white">
                          {(lead as any).asesor?.nombre
                            ? (lead as any).asesor.nombre
                                .split(' ')
                                .map((n: string) => n[0])
                                .join('')
                            : '?'}
                        </div>
                      </div>
                    </Card>
                  ))}

                  {leadsColumna.length === 0 && (
                    <div className="p-6 text-center">
                      <p className="text-xs text-muted-foreground">
                        No hay leads en esta columna
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
