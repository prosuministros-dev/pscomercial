'use client';

import { useState } from 'react';

import { motion } from 'motion/react';
import {
  AlertTriangle,
  Eye,
  FileText,
  MoreHorizontal,
  Search,
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
import { ScrollArea } from '@kit/ui/scroll-area';

import { useCotizaciones } from '~/lib/cotizaciones';

// Tipo para cotización desde la DB
type CotizacionDB = NonNullable<ReturnType<typeof useCotizaciones>['data']>[number];

interface CotizacionesKanbanProps {
  cotizaciones: CotizacionDB[];
  onVerDetalle: (cotizacion: CotizacionDB) => void;
  onCrear: () => void;
}

export function CotizacionesKanban({
  cotizaciones,
  onVerDetalle,
  onCrear,
}: CotizacionesKanbanProps) {
  const [busqueda, setBusqueda] = useState('');
  const [arrastrando, setArrastrando] = useState<string | null>(null);

  // Columnas del Kanban según estados del sistema
  const columnas = [
    { id: 'BORRADOR', titulo: 'Borrador', color: 'border-gray-500' },
    { id: 'CREACION_OFERTA', titulo: 'Creación Oferta', color: 'border-blue-500' },
    { id: 'NEGOCIACION', titulo: 'Negociación', color: 'border-purple-500' },
    { id: 'RIESGO', titulo: 'Riesgo', color: 'border-orange-500' },
    { id: 'PENDIENTE_OC', titulo: 'Pendiente OC', color: 'border-green-500' },
    { id: 'GANADA', titulo: 'Ganada', color: 'border-emerald-500' },
  ];

  // Filtrar cotizaciones
  const cotizacionesFiltradas = cotizaciones.filter((cot) => {
    const matchBusqueda =
      busqueda === '' ||
      cot.numero.toString().includes(busqueda) ||
      cot.razon_social.toLowerCase().includes(busqueda.toLowerCase());

    if (busqueda) return matchBusqueda;
    return matchBusqueda && cot.estado !== 'PERDIDA';
  });

  const handleDragStart = (e: React.DragEvent, cotizacionId: string) => {
    setArrastrando(cotizacionId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, nuevoEstado: string) => {
    e.preventDefault();
    if (!arrastrando) return;

    const cotizacion = cotizaciones.find((c) => c.id === arrastrando);
    if (cotizacion && cotizacion.estado !== nuevoEstado) {
      toast.info('Funcionalidad de arrastrar próximamente');
    }
    setArrastrando(null);
  };

  const handleDragEnd = () => {
    setArrastrando(null);
  };

  const getCotizacionesPorEstado = (estadoId: string) => {
    return cotizacionesFiltradas.filter((cot) => cot.estado === estadoId);
  };

  const getInitials = (asesor: any) => {
    if (!asesor?.nombre) return '?';
    return asesor.nombre
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-full w-full flex-col">
      {/* Búsqueda */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar cotización o cliente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="h-9 w-full pl-9 text-sm"
        />
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full gap-2">
          {columnas.map((columna) => {
            const cotizacionesColumna = getCotizacionesPorEstado(columna.id);

            return (
              <div
                key={columna.id}
                className="flex h-full min-w-[220px] max-w-[280px] flex-shrink-0 flex-col"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, columna.id)}
              >
                {/* Header de columna */}
                <div
                  className={`border-l-2 ${columna.color} mb-1.5 rounded-t-md bg-muted/20 px-2.5 py-1.5`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="truncate text-[11px]">{columna.titulo}</h4>
                    <Badge
                      variant="secondary"
                      className="ml-1 h-4 flex-shrink-0 px-1.5 text-[9px]"
                    >
                      {cotizacionesColumna.length}
                    </Badge>
                  </div>
                </div>

                {/* Scroll de tarjetas */}
                <ScrollArea className="flex-1">
                  <div className="space-y-1.5 pr-1.5">
                    {cotizacionesColumna.map((cotizacion) => (
                      <div
                        key={cotizacion.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, cotizacion.id)}
                        onDragEnd={handleDragEnd}
                        className={`cursor-move ${arrastrando === cotizacion.id ? 'rotate-1 scale-95 opacity-40' : ''}`}
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                        <Card
                          className="group relative cursor-pointer border-l-2 bg-card/50 p-2.5 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                          style={{
                            borderLeftColor:
                              (cotizacion.margen_porcentaje || 0) < 10
                                ? 'rgb(234, 88, 12)'
                                : 'rgb(34, 197, 94)',
                          }}
                          onClick={() => onVerDetalle(cotizacion)}
                        >
                          {/* Header ultra-compacto */}
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-[9px] text-muted-foreground/60">
                                #{cotizacion.numero.toString().padStart(5, '0')}
                              </span>
                              {cotizacion.requiere_aprobacion_margen && (
                                <AlertTriangle className="h-2.5 w-2.5 text-orange-500" />
                              )}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                asChild
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-4 w-4 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                                >
                                  <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onVerDetalle(cotizacion);
                                  }}
                                >
                                  <Eye className="mr-2 h-3 w-3" />
                                  Ver detalles
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-xs">
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-xs">
                                  Duplicar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Cliente */}
                          <p className="mb-2 line-clamp-1 text-xs font-medium">
                            {cotizacion.razon_social}
                          </p>

                          {/* Monto y margen en misma línea */}
                          <div className="mb-2 flex items-baseline justify-between">
                            <span className="text-base font-semibold">
                              ${((cotizacion.total_venta || 0) / 1000000).toFixed(1)}M
                            </span>
                            <span
                              className={`text-xs font-semibold ${
                                (cotizacion.margen_porcentaje || 0) < 10
                                  ? 'text-orange-600 dark:text-orange-400'
                                  : 'text-green-600 dark:text-green-400'
                              }`}
                            >
                              {(cotizacion.margen_porcentaje || 0).toFixed(1)}%
                            </span>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-muted-foreground/60">
                              {new Date(
                                cotizacion.fecha_cotizacion
                              ).toLocaleDateString('es-CO', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                            <div className="gradient-accent flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold text-white">
                              {getInitials(cotizacion.asesor)}
                            </div>
                          </div>
                        </Card>
                        </motion.div>
                      </div>
                    ))}

                    {/* Estado vacío */}
                    {cotizacionesColumna.length === 0 && (
                      <div className="py-3 text-center text-[9px] text-muted-foreground">
                        <FileText className="mx-auto mb-0.5 h-3.5 w-3.5 opacity-30" />
                        <p>Sin cotizaciones</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info de búsqueda de perdidas */}
      {busqueda && (
        <div className="mt-2 text-center text-xs text-muted-foreground">
          Las cotizaciones &quot;Perdida&quot; solo son visibles mediante
          búsqueda
        </div>
      )}
    </div>
  );
}
