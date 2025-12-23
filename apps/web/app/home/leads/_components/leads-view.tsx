'use client';

import { useState } from 'react';

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  LayoutGrid,
  List,
  Loader2,
  Megaphone,
  MoreHorizontal,
  Plus,
  Search,
  UserPlus,
  XCircle,
} from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';

import {
  useLeads,
  useLeadStats,
  useRejectLead,
  type LeadEstado,
} from '~/lib/leads';

import { CrearLeadModal } from './crear-lead-modal';
import { LeadsKanban } from './leads-kanban';
import { ReasignarLeadModal } from './reasignar-lead-modal';
import { VerLeadModal } from './ver-lead-modal';
import { CrearCotizacionModal } from '../../cotizaciones/_components/crear-cotizacion-modal';

type VistaType = 'tabla' | 'kanban';

// Tipo para el lead de la base de datos
type LeadDB = NonNullable<ReturnType<typeof useLeads>['data']>[number];

export function LeadsView() {
  const [vista, setVista] = useState<VistaType>('tabla');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [modalCrear, setModalCrear] = useState(false);
  const [modalVer, setModalVer] = useState(false);
  const [modalReasignar, setModalReasignar] = useState(false);
  const [modalCotizacion, setModalCotizacion] = useState(false);
  const [leadSeleccionado, setLeadSeleccionado] = useState<LeadDB | null>(null);

  // Queries
  const { data: leads = [], isLoading, error } = useLeads({
    estado: filtroEstado !== 'todos' ? (filtroEstado as LeadEstado) : undefined,
    busqueda: busqueda || undefined,
  });

  const { data: stats } = useLeadStats();

  // Mutations
  const rejectLead = useRejectLead();

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { variant: 'outline' | 'secondary' | 'default' | 'destructive'; icon: typeof Clock; label: string; color: string }> = {
      PENDIENTE_ASIGNACION: {
        variant: 'outline',
        icon: Clock,
        label: 'Pendiente',
        color: 'text-yellow-600',
      },
      PENDIENTE_INFORMACION: {
        variant: 'outline',
        icon: AlertCircle,
        label: 'Info Pendiente',
        color: 'text-orange-600',
      },
      ASIGNADO: {
        variant: 'secondary',
        icon: AlertCircle,
        label: 'Asignado',
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      },
      CONVERTIDO: {
        variant: 'default',
        icon: CheckCircle2,
        label: 'Convertido',
        color: 'bg-green-600',
      },
      RECHAZADO: {
        variant: 'secondary',
        icon: XCircle,
        label: 'Rechazado',
        color: '',
      },
    };
    const badge = badges[estado];
    if (!badge) return null;
    const Icon = badge.icon;
    return (
      <Badge
        variant={badge.variant}
        className={`h-5 gap-1 text-xs ${badge.color}`}
      >
        <Icon className="h-3 w-3" />
        {badge.label}
      </Badge>
    );
  };

  const handleVerLead = (lead: LeadDB) => {
    setLeadSeleccionado(lead);
    setModalVer(true);
  };

  const handleCrearCotizacion = (lead: LeadDB) => {
    setLeadSeleccionado(lead);
    setModalCotizacion(true);
  };

  const handleRechazar = (lead: LeadDB) => {
    // TODO: Abrir modal para pedir motivo de rechazo
    rejectLead.mutate(
      { lead_id: lead.id, motivo_rechazo: 'Rechazado por el usuario' },
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

  const handleReasignar = (lead: LeadDB) => {
    setLeadSeleccionado(lead);
    setModalReasignar(true);
  };

  // Calcular si un lead supera 24h
  const supera24h = (fechaCreacion: string) => {
    const ahora = new Date();
    const creacion = new Date(fechaCreacion);
    const diff = ahora.getTime() - creacion.getTime();
    return diff > 24 * 60 * 60 * 1000;
  };

  if (error) {
    return (
      <Card className="p-8 text-center">
        <XCircle className="mx-auto mb-2 h-8 w-8 text-red-500" />
        <p className="text-sm text-red-500">Error al cargar leads</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header compacto */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="gradient-accent rounded-lg p-2">
            <Megaphone className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Leads</h2>
            <p className="text-xs text-muted-foreground">
              Gestión de oportunidades
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => setModalCrear(true)}
          className="gradient-brand gap-2"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nuevo Lead</span>
        </Button>
      </div>

      {/* Filtros compactos y toggle de vista */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="h-9 pl-8 text-sm"
          />
        </div>
        {vista === 'tabla' && (
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="h-9 w-[160px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="PENDIENTE_ASIGNACION">Pendientes</SelectItem>
              <SelectItem value="ASIGNADO">Asignados</SelectItem>
              <SelectItem value="CONVERTIDO">Convertidos</SelectItem>
              <SelectItem value="RECHAZADO">Rechazados</SelectItem>
            </SelectContent>
          </Select>
        )}
        {/* Toggle de Vista */}
        <div className="flex items-center overflow-hidden rounded-lg border border-border">
          <Button
            variant={vista === 'tabla' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setVista('tabla')}
            className="h-9 rounded-none border-0"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={vista === 'kanban' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setVista('kanban')}
            className="h-9 rounded-none border-0"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: 'Pendientes',
            count: stats?.pendiente_asignacion ?? 0,
          },
          {
            label: 'Asignados',
            count: stats?.asignado ?? 0,
          },
          {
            label: 'Convertidos',
            count: stats?.convertido ?? 0,
          },
        ].map((stat) => (
          <Card key={stat.label} className="p-3">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <h4 className="mt-1 text-xl font-bold">{stat.count}</h4>
          </Card>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card className="p-8 text-center">
          <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Cargando leads...</p>
        </Card>
      )}

      {/* Vista Tabla */}
      {!isLoading && vista === 'tabla' && (
        <>
          {/* Tabla compacta - Desktop */}
          <Card className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="text-xs">
                    <th className="px-3 py-2 text-left font-medium">Estado</th>
                    <th className="px-3 py-2 text-left font-medium">#</th>
                    <th className="px-3 py-2 text-left font-medium">
                      Razón Social
                    </th>
                    <th className="px-3 py-2 text-left font-medium">NIT</th>
                    <th className="px-3 py-2 text-left font-medium">
                      Contacto
                    </th>
                    <th className="px-3 py-2 text-left font-medium">
                      Fecha Creación
                    </th>
                    <th className="px-3 py-2 text-left font-medium">
                      Asignado
                    </th>
                    <th className="px-3 py-2 text-right font-medium">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="text-sm transition-colors hover:bg-muted/30"
                    >
                      <td className="px-3 py-2">
                        {getEstadoBadge(lead.estado)}
                      </td>
                      <td className="px-3 py-2">
                        <span className="font-mono text-xs">#{lead.numero}</span>
                      </td>
                      <td className="px-3 py-2">
                        <div>
                          <p className="font-medium">{lead.razon_social}</p>
                          {supera24h(lead.creado_en) && lead.estado !== 'CONVERTIDO' && lead.estado !== 'RECHAZADO' && (
                            <Badge
                              variant="destructive"
                              className="mt-0.5 h-4 text-[10px]"
                            >
                              Alerta 24h
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {lead.nit}
                      </td>
                      <td className="px-3 py-2">{lead.nombre_contacto}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {new Date(lead.creado_en).toLocaleString('es-CO', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {(lead as any).asesor?.nombre ?? 'Sin asignar'}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1 px-2 text-xs"
                            onClick={() => handleVerLead(lead)}
                          >
                            <Eye className="h-3 w-3" />
                            Ver
                          </Button>
                          {lead.estado === 'ASIGNADO' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 gap-1 px-2 text-xs"
                              onClick={() => handleCrearCotizacion(lead)}
                            >
                              <FileText className="h-3 w-3" />
                              Cotizar
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {lead.estado === 'ASIGNADO' && (
                                <DropdownMenuItem
                                  className="text-sm"
                                  onClick={() => handleCrearCotizacion(lead)}
                                >
                                  Convertir a Cotización
                                </DropdownMenuItem>
                              )}
                              {lead.estado !== 'CONVERTIDO' && lead.estado !== 'RECHAZADO' && (
                                <DropdownMenuItem
                                  className="text-sm"
                                  onClick={() => handleReasignar(lead)}
                                >
                                  <UserPlus className="mr-2 h-3.5 w-3.5" />
                                  Reasignar
                                </DropdownMenuItem>
                              )}
                              {lead.estado !== 'CONVERTIDO' && lead.estado !== 'RECHAZADO' && (
                                <DropdownMenuItem
                                  className="text-sm text-red-600"
                                  onClick={() => handleRechazar(lead)}
                                >
                                  Rechazar
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {leads.length === 0 && (
              <div className="p-8 text-center">
                <Megaphone className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No se encontraron leads
                </p>
              </div>
            )}
          </Card>

          {/* Lista compacta - Mobile */}
          <div className="space-y-2 md:hidden">
            {leads.map((lead) => (
              <Card key={lead.id} className="p-3">
                <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs">#{lead.numero}</span>
                    {getEstadoBadge(lead.estado)}
                    {supera24h(lead.creado_en) && lead.estado !== 'CONVERTIDO' && lead.estado !== 'RECHAZADO' && (
                      <Badge variant="destructive" className="h-4 text-[10px]">
                        24h
                      </Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleVerLead(lead)}
                  >
                    Ver
                  </Button>
                </div>
                <h4 className="mb-1 font-semibold">{lead.razon_social}</h4>
                <p className="mb-1 text-xs text-muted-foreground">{lead.nit}</p>
                <p className="mb-2 text-xs text-muted-foreground">
                  {lead.nombre_contacto}
                </p>
                {lead.estado === 'ASIGNADO' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 w-full gap-1"
                    onClick={() => handleCrearCotizacion(lead)}
                  >
                    <FileText className="h-3 w-3" />
                    Crear Cotización
                  </Button>
                )}
              </Card>
            ))}
            {leads.length === 0 && (
              <Card className="p-8 text-center">
                <Megaphone className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No se encontraron leads
                </p>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Vista Kanban */}
      {!isLoading && vista === 'kanban' && (
        <Card className="h-[calc(100vh-280px)] overflow-hidden p-3 md:h-[calc(100vh-240px)]">
          <LeadsKanban
            leads={leads}
            onVerDetalle={(lead) => {
              setLeadSeleccionado(lead);
              setModalVer(true);
            }}
            onCrear={() => setModalCrear(true)}
            onReasignar={handleReasignar}
            onConvertir={handleCrearCotizacion}
          />
        </Card>
      )}

      {/* Modales */}
      <CrearLeadModal
        open={modalCrear}
        onOpenChange={setModalCrear}
      />

      {leadSeleccionado && (
        <VerLeadModal
          open={modalVer}
          onOpenChange={setModalVer}
          lead={leadSeleccionado}
          onCrearCotizacion={handleCrearCotizacion}
        />
      )}

      {leadSeleccionado && (
        <ReasignarLeadModal
          open={modalReasignar}
          onOpenChange={setModalReasignar}
          lead={leadSeleccionado}
        />
      )}

      {leadSeleccionado && (
        <CrearCotizacionModal
          open={modalCotizacion}
          onOpenChange={setModalCotizacion}
          leadOrigen={leadSeleccionado}
        />
      )}
    </div>
  );
}
