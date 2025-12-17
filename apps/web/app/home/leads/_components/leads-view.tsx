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
  Megaphone,
  MoreHorizontal,
  Plus,
  Search,
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

import { leads, type Lead } from '~/lib/mock-data';

import { CrearLeadModal } from './crear-lead-modal';
import { LeadsKanban } from './leads-kanban';
import { VerLeadModal } from './ver-lead-modal';

type VistaType = 'tabla' | 'kanban';

export function LeadsView() {
  const [vista, setVista] = useState<VistaType>('tabla');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [modalCrear, setModalCrear] = useState(false);
  const [modalVer, setModalVer] = useState(false);
  const [leadSeleccionado, setLeadSeleccionado] = useState<Lead | null>(null);

  const leadsFiltrados = leads.filter((lead) => {
    const matchEstado =
      filtroEstado === 'todos' || lead.estado === filtroEstado;
    const matchBusqueda =
      busqueda === '' ||
      lead.razonSocial.toLowerCase().includes(busqueda.toLowerCase()) ||
      lead.nombreContacto.toLowerCase().includes(busqueda.toLowerCase()) ||
      lead.numero.toString().includes(busqueda);
    return matchEstado && matchBusqueda;
  });

  const getEstadoBadge = (estado: string) => {
    const badges = {
      pendiente: {
        variant: 'outline' as const,
        icon: Clock,
        label: 'Pendiente',
        color: 'text-yellow-600',
      },
      en_gestion: {
        variant: 'secondary' as const,
        icon: AlertCircle,
        label: 'En Gestión',
        color:
          'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      },
      convertido: {
        variant: 'default' as const,
        icon: CheckCircle2,
        label: 'Convertido',
        color: 'bg-green-600',
      },
      descartado: {
        variant: 'secondary' as const,
        icon: XCircle,
        label: 'Descartado',
        color: '',
      },
    };
    const badge = badges[estado as keyof typeof badges];
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

  const handleVerLead = (lead: Lead) => {
    setLeadSeleccionado(lead);
    setModalVer(true);
  };

  const handleCrearCotizacion = (lead: Lead) => {
    toast.success(`Crear cotización desde Lead #${lead.numero}`);
  };

  const handleCambiarEstado = (lead: Lead, nuevoEstado: string) => {
    toast.success(`Lead #${lead.numero} marcado como ${nuevoEstado}`);
  };

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
            <SelectTrigger className="h-9 w-[140px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendiente">Pendientes</SelectItem>
              <SelectItem value="en_gestion">En Gestión</SelectItem>
              <SelectItem value="convertido">Convertidos</SelectItem>
              <SelectItem value="descartado">Descartados</SelectItem>
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
            count: leads.filter((l) => l.estado === 'pendiente').length,
          },
          {
            label: 'En Gestión',
            count: leads.filter((l) => l.estado === 'en_gestion').length,
          },
          {
            label: 'Convertidos',
            count: leads.filter((l) => l.estado === 'convertido').length,
          },
        ].map((stat) => (
          <Card key={stat.label} className="p-3">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <h4 className="mt-1 text-xl font-bold">{stat.count}</h4>
          </Card>
        ))}
      </div>

      {/* Vista Tabla */}
      {vista === 'tabla' && (
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
                  {leadsFiltrados.map((lead) => (
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
                          <p className="font-medium">{lead.razonSocial}</p>
                          {lead.alerta24h && (
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
                      <td className="px-3 py-2">{lead.nombreContacto}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {new Date(lead.creadoEn).toLocaleString('es-CO', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {lead.asignadoA}
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
                          {lead.estado === 'en_gestion' && (
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
                              <DropdownMenuItem
                                className="text-sm"
                                onClick={() => handleVerLead(lead)}
                              >
                                Ver detalles
                              </DropdownMenuItem>
                              {lead.estado === 'pendiente' && (
                                <DropdownMenuItem
                                  className="text-sm"
                                  onClick={() =>
                                    handleCambiarEstado(lead, 'en_gestion')
                                  }
                                >
                                  Marcar como En Gestión
                                </DropdownMenuItem>
                              )}
                              {lead.estado === 'en_gestion' && (
                                <DropdownMenuItem
                                  className="text-sm"
                                  onClick={() => handleCrearCotizacion(lead)}
                                >
                                  Crear Cotización
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-sm text-red-600">
                                Descartar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {leadsFiltrados.length === 0 && (
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
            {leadsFiltrados.map((lead) => (
              <Card key={lead.id} className="p-3">
                <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs">#{lead.numero}</span>
                    {getEstadoBadge(lead.estado)}
                    {lead.alerta24h && (
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
                <h4 className="mb-1 font-semibold">{lead.razonSocial}</h4>
                <p className="mb-1 text-xs text-muted-foreground">{lead.nit}</p>
                <p className="mb-2 text-xs text-muted-foreground">
                  {lead.nombreContacto}
                </p>
                {lead.estado === 'en_gestion' && (
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
            {leadsFiltrados.length === 0 && (
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
      {vista === 'kanban' && (
        <Card className="h-[calc(100vh-280px)] overflow-hidden p-3 md:h-[calc(100vh-240px)]">
          <LeadsKanban
            onVerDetalle={(lead) => {
              setLeadSeleccionado(lead);
              setModalVer(true);
            }}
            onCrear={() => setModalCrear(true)}
          />
        </Card>
      )}

      {/* Modales */}
      <CrearLeadModal
        open={modalCrear}
        onOpenChange={setModalCrear}
        onCreated={(lead) => {
          console.log('Nuevo lead:', lead);
        }}
      />

      {leadSeleccionado && (
        <VerLeadModal
          open={modalVer}
          onOpenChange={setModalVer}
          lead={leadSeleccionado}
          onCrearCotizacion={handleCrearCotizacion}
        />
      )}
    </div>
  );
}
