'use client';

import { MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useObservacionesCount } from '../hooks/use-observaciones';
import { cn } from '@/lib/utils';

interface ContadorComentariosProps {
  referenciaTipo: 'cotizacion' | 'orden_pedido' | 'orden_compra' | 'lead';
  referenciaId: string;
  variant?: 'badge' | 'button' | 'icon';
  onClick?: () => void;
  className?: string;
}

/**
 * Componente Contador de Comentarios
 * HU-0009: Badge que muestra el número de observaciones de un documento
 */
export function ContadorComentarios({
  referenciaTipo,
  referenciaId,
  variant = 'badge',
  onClick,
  className,
}: ContadorComentariosProps) {
  const { data: count, isLoading } = useObservacionesCount(referenciaTipo, referenciaId);

  if (isLoading) {
    return <Skeleton className={cn('h-6 w-12', className)} />;
  }

  const displayCount = count ?? 0;

  // Variant: Badge simple
  if (variant === 'badge') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant={displayCount > 0 ? 'secondary' : 'outline'}
              className={cn('gap-1 cursor-default', onClick && 'cursor-pointer', className)}
              onClick={onClick}
            >
              <MessageSquare className="h-3 w-3" />
              {displayCount}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {displayCount === 0
                ? 'Sin comentarios'
                : displayCount === 1
                  ? '1 comentario'
                  : `${displayCount} comentarios`}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Variant: Button
  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn('gap-2', className)}
        onClick={onClick}
      >
        <MessageSquare className="h-4 w-4" />
        <span>
          {displayCount === 0
            ? 'Sin comentarios'
            : displayCount === 1
              ? '1 comentario'
              : `${displayCount} comentarios`}
        </span>
      </Button>
    );
  }

  // Variant: Icon con badge
  if (variant === 'icon') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn('relative', className)}
              onClick={onClick}
            >
              <MessageSquare className="h-5 w-5" />
              {displayCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {displayCount > 99 ? '99+' : displayCount}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {displayCount === 0
                ? 'Sin comentarios'
                : displayCount === 1
                  ? '1 comentario'
                  : `${displayCount} comentarios`}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return null;
}
