'use client';

import { useState } from 'react';

import { CheckCircle2, MoreVertical, Package, Search } from 'lucide-react';
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

import { pedidos, type Pedido } from '~/lib/mock-data';

interface PedidosKanbanProps {
  onVerDetalle: (pedido: Pedido) => void;
}

export function PedidosKanban({ onVerDetalle }: PedidosKanbanProps) {
  const [busqueda, setBusqueda] = useState('');
  const [arrastrando, setArrastrando] = useState<string | null>(null);

  // Columnas del Kanban según estados
  const columnas = [
    { id: 'por_facturar', titulo: 'Por Facturar', color: 'border-yellow-500' },
    {
      id: 'facturado_sin_pago',
      titulo: 'Facturado Sin Pago',
      color: 'border-orange-500',
    },
    {
      id: 'pendiente_compra',
      titulo: 'Pendiente Compra',
      color: 'border-purple-500',
    },
    { id: 'en_bodega', titulo: 'En Bodega', color: 'border-blue-500' },
    { id: 'despachado', titulo: 'Despachado', color: 'border-indigo-500' },
    { id: 'entregado', titulo: 'Entregado', color: 'border-green-500' },
  ];

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter((pedido) => {
    const matchBusqueda =
      busqueda === '' ||
      pedido.numero.toString().includes(busqueda) ||
      pedido.razonSocial.toLowerCase().includes(busqueda.toLowerCase());
    return matchBusqueda;
  });

  const handleDragStart = (e: React.DragEvent, pedidoId: string) => {
    setArrastrando(pedidoId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, nuevoEstado: string) => {
    e.preventDefault();
    if (arrastrando) {
      const pedido = pedidos.find((p) => p.id === arrastrando);
      if (pedido) {
        toast.success(
          `Pedido #${pedido.numero} movido a ${nuevoEstado.replace(/_/g, ' ')}`
        );
      }
      setArrastrando(null);
    }
  };

  const handleDragEnd = () => {
    setArrastrando(null);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header con búsqueda */}
      <div className="mb-3 flex flex-shrink-0 items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar pedidos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      {/* Kanban Board - Responsive */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex h-full gap-2 pb-2">
          {columnas.map((columna) => {
            const pedidosColumna = pedidosFiltrados.filter(
              (pedido) => pedido.estado === columna.id
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
                  className={`border-t-2 ${columna.color} mb-2 rounded-t-lg bg-secondary/30 p-2`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="line-clamp-1 text-xs font-medium">
                      {columna.titulo}
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      {pedidosColumna.length}
                    </Badge>
                  </div>
                </div>

                {/* Cards de pedidos */}
                <ScrollArea className="flex-1">
                  <div className="space-y-1.5 pr-1">
                    {pedidosColumna.map((pedido) => (
                      <Card
                        key={pedido.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, pedido.id)}
                        onDragEnd={handleDragEnd}
                        className={`group relative cursor-move border-l-2 bg-card/50 p-2.5 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${columna.color} ${
                          arrastrando === pedido.id
                            ? 'rotate-2 scale-95 opacity-40'
                            : ''
                        }`}
                        onClick={() => onVerDetalle(pedido)}
                      >
                        {/* Header ultra-compacto */}
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-[9px] text-muted-foreground/60">
                              #{pedido.numero.toString().padStart(4, '0')}
                            </span>
                            {pedido.pagoConfirmado && (
                              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            )}
                          </div>
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
                                  onVerDetalle(pedido);
                                }}
                              >
                                Ver detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem>Editar</DropdownMenuItem>
                              <DropdownMenuItem>Descargar PDF</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Monto */}
                        <div className="mb-2">
                          <span className="text-base font-semibold">
                            ${(pedido.subtotal / 1000000).toFixed(1)}M
                          </span>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-muted-foreground/60">
                            {new Date(pedido.fechaPedido).toLocaleDateString(
                              'es-CO',
                              { day: 'numeric', month: 'short' }
                            )}
                          </span>
                          <div className="gradient-accent flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold text-white">
                            {pedido.creadoPor
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                        </div>
                      </Card>
                    ))}

                    {pedidosColumna.length === 0 && (
                      <div className="p-6 text-center">
                        <Package className="mx-auto mb-1 h-6 w-6 text-muted-foreground/40" />
                        <p className="text-xs text-muted-foreground">
                          No hay pedidos
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
