'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageSquare, Send, Loader2, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useObservaciones, useCrearObservacion } from '../hooks/use-observaciones';
import { MentionInput } from './mention-input';
import type { CrearObservacionInput } from '../schemas/notificaciones.schema';

interface ObservacionesTimelineProps {
  referenciaTipo: 'cotizacion' | 'orden_pedido' | 'orden_compra' | 'lead';
  referenciaId: string;
  titulo?: string;
  maxHeight?: string;
}

/**
 * Componente Timeline de Observaciones/Comentarios
 * HU-0009: Muestra historial de comentarios con menciones @usuario
 */
export function ObservacionesTimeline({
  referenciaTipo,
  referenciaId,
  titulo = 'Comentarios y Observaciones',
  maxHeight = '600px',
}: ObservacionesTimelineProps) {
  const [contenido, setContenido] = useState('');
  const [menciones, setMenciones] = useState<string[]>([]);

  const { data: observaciones, isLoading } = useObservaciones(referenciaTipo, referenciaId);
  const crearObservacion = useCrearObservacion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contenido.trim()) return;

    const input: CrearObservacionInput = {
      referencia_tipo: referenciaTipo,
      referencia_id: referenciaId,
      contenido: contenido.trim(),
      menciones,
    };

    crearObservacion.mutate(input, {
      onSuccess: () => {
        setContenido('');
        setMenciones([]);
      },
    });
  };

  const handleMentionSelect = (userId: string, userName: string) => {
    // Agregar mención al array
    if (!menciones.includes(userId)) {
      setMenciones([...menciones, userId]);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {titulo}
        </CardTitle>
        <CardDescription>
          Historial de comentarios y observaciones. Usa @nombre para mencionar a un usuario.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulario para nuevo comentario */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <MentionInput
            value={contenido}
            onChange={setContenido}
            onMentionSelect={handleMentionSelect}
            placeholder="Escribe un comentario... (usa @ para mencionar usuarios)"
            maxLength={2000}
            disabled={crearObservacion.isPending}
          />

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {contenido.length}/2000 caracteres
              {menciones.length > 0 && ` · ${menciones.length} ${menciones.length === 1 ? 'mención' : 'menciones'}`}
            </p>
            <Button
              type="submit"
              size="sm"
              disabled={!contenido.trim() || crearObservacion.isPending}
            >
              {crearObservacion.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Timeline de comentarios */}
        <ScrollArea style={{ maxHeight }} className="pr-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : observaciones && observaciones.length > 0 ? (
            <div className="space-y-4">
              {observaciones.map((obs) => (
                <div key={obs.id} className="flex gap-3 group">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={obs.usuario?.picture_url || undefined} />
                    <AvatarFallback>
                      {obs.usuario?.name
                        ? obs.usuario.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)
                        : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-sm">{obs.usuario?.name || 'Usuario'}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(obs.creado_en), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                    </div>

                    <div className="rounded-lg bg-muted p-3 text-sm whitespace-pre-wrap break-words">
                      {renderContenidoConMenciones(obs.contenido)}
                    </div>

                    {obs.menciones && obs.menciones.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>
                          {obs.menciones.length} {obs.menciones.length === 1 ? 'mención' : 'menciones'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground">No hay comentarios aún</p>
              <p className="text-xs text-muted-foreground mt-1">
                Sé el primero en agregar un comentario
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

/**
 * Helper para renderizar contenido con menciones resaltadas
 */
function renderContenidoConMenciones(contenido: string) {
  // Buscar patrones @usuario
  const mentionRegex = /@(\w+)/g;
  const parts = contenido.split(mentionRegex);

  return parts.map((part, index) => {
    // Los índices impares son las menciones (grupos capturados)
    if (index % 2 === 1) {
      return (
        <span key={index} className="font-medium text-primary">
          @{part}
        </span>
      );
    }
    return part;
  });
}
