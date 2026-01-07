'use client';

import { useState } from 'react';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit, GripVertical, Trash2 } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card } from '@kit/ui/card';

interface ProductoItem {
  id: string;
  numero_parte: string;
  nombre_producto: string;
  descripcion?: string | null;
  cantidad: number;
  costo_unitario: number;
  costo_unitario_cop?: number;
  precio_unitario?: number;
  margen_item?: number;
  porcentaje_utilidad?: number;
  moneda_costo?: string | null;
  orden?: number | null;
}

interface SortableProductItemProps {
  producto: ProductoItem;
  onEdit: (producto: ProductoItem) => void;
  onDelete: (producto: ProductoItem) => void;
}

function SortableProductItem({ producto, onEdit, onDelete }: SortableProductItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: producto.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`p-3 ${isDragging ? 'shadow-lg ring-2 ring-primary' : ''}`}>
      <div className="flex items-start gap-2">
        {/* Drag Handle */}
        <button
          className="mt-1 cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {producto.numero_parte}
            </span>
            {producto.moneda_costo && (
              <Badge variant="outline" className="text-[10px]">
                {producto.moneda_costo}
              </Badge>
            )}
          </div>
          <p className="truncate text-sm font-medium">
            {producto.nombre_producto}
          </p>
          {producto.descripcion && (
            <p className="truncate text-xs text-muted-foreground">
              {producto.descripcion}
            </p>
          )}
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
            <div>
              <span className="text-muted-foreground">Cantidad:</span>
              <span className="ml-1 font-medium">{producto.cantidad}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Costo:</span>
              <span className="ml-1 font-medium">
                ${(producto.costo_unitario_cop || producto.costo_unitario || 0).toLocaleString('es-CO')}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Venta:</span>
              <span className="ml-1 font-medium">
                ${(producto.precio_unitario || 0).toLocaleString('es-CO')}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Margen:</span>
              <span
                className={`ml-1 font-medium ${
                  (producto.margen_item || 0) >= 25
                    ? 'text-green-600'
                    : 'text-orange-600'
                }`}
              >
                {(producto.margen_item || producto.porcentaje_utilidad || 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onEdit(producto)}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-red-600"
            onClick={() => onDelete(producto)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      </Card>
    </div>
  );
}

interface SortableProductListProps {
  productos: ProductoItem[];
  onEdit: (producto: ProductoItem) => void;
  onDelete: (producto: ProductoItem) => void;
  onReorder: (items: { id: string; orden: number }[]) => void;
}

export function SortableProductList({
  productos,
  onEdit,
  onDelete,
  onReorder,
}: SortableProductListProps) {
  const [items, setItems] = useState(productos);

  // Update items when productos prop changes
  if (JSON.stringify(items.map(i => i.id)) !== JSON.stringify(productos.map(p => p.id))) {
    setItems(productos);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Notify parent of new order
      const reorderedItems = newItems.map((item, index) => ({
        id: item.id,
        orden: index + 1,
      }));
      onReorder(reorderedItems);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((producto) => (
            <SortableProductItem
              key={producto.id}
              producto={producto}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
