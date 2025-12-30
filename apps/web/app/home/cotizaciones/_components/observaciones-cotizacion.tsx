'use client';

import { useState, useRef, useEffect } from 'react';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, MessageSquare, Send, User } from 'lucide-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback } from '@kit/ui/avatar';
import { Button } from '@kit/ui/button';
import { Card } from '@kit/ui/card';
import { ScrollArea } from '@kit/ui/scroll-area';
import { Textarea } from '@kit/ui/textarea';

// Tipo para observación
interface Observacion {
  id: string;
  cotizacion_id: string;
  usuario_id: string;
  texto: string;
  menciones: string[] | null;
  creado_en: string;
  usuario_email?: string;
  usuario_nombre?: string;
}

// Tipo para usuario mencionable
interface UsuarioMencionable {
  id: string;
  nombre: string;
  email: string;
}

interface ObservacionesCotizacionProps {
  cotizacionId: string;
  observaciones: Observacion[];
  usuarios: UsuarioMencionable[];
  onAgregarObservacion: (texto: string, menciones: string[]) => Promise<void>;
  isLoading?: boolean;
}

export function ObservacionesCotizacion({
  cotizacionId,
  observaciones,
  usuarios,
  onAgregarObservacion,
  isLoading = false,
}: ObservacionesCotizacionProps) {
  const [texto, setTexto] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionIndex, setMentionIndex] = useState(-1);
  const [selectedMentions, setSelectedMentions] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Filtrar usuarios por query
  const filteredUsuarios = usuarios.filter(
    (u) =>
      u.nombre?.toLowerCase().includes(mentionQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  // Detectar @ en el texto
  const handleTextChange = (value: string) => {
    setTexto(value);

    // Buscar @ al final del texto o después de un espacio
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const textAfterAt = value.slice(lastAtIndex + 1);
      // Si no hay espacio después del @, mostrar dropdown
      if (!textAfterAt.includes(' ')) {
        setMentionQuery(textAfterAt);
        setShowMentions(true);
        setMentionIndex(0);
        return;
      }
    }
    setShowMentions(false);
    setMentionQuery('');
  };

  // Insertar mención
  const insertMention = (usuario: UsuarioMencionable) => {
    const lastAtIndex = texto.lastIndexOf('@');
    const newTexto = texto.slice(0, lastAtIndex) + `@${usuario.nombre || usuario.email} `;
    setTexto(newTexto);
    setSelectedMentions([...selectedMentions, usuario.id]);
    setShowMentions(false);
    setMentionQuery('');
    textareaRef.current?.focus();
  };

  // Manejar teclas especiales en el dropdown
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showMentions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setMentionIndex((prev) => Math.min(prev + 1, filteredUsuarios.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setMentionIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredUsuarios[mentionIndex]) {
      e.preventDefault();
      insertMention(filteredUsuarios[mentionIndex]);
    } else if (e.key === 'Escape') {
      setShowMentions(false);
    }
  };

  // Enviar observación
  const handleSubmit = async () => {
    if (!texto.trim()) return;

    setIsSending(true);
    try {
      await onAgregarObservacion(texto, selectedMentions);
      setTexto('');
      setSelectedMentions([]);
      toast.success('Observación agregada');
    } catch (error) {
      toast.error('Error al agregar observación');
    } finally {
      setIsSending(false);
    }
  };

  // Formatear texto con menciones resaltadas
  const formatTextoConMenciones = (texto: string) => {
    // Resaltar @menciones en el texto
    return texto.replace(/@(\w+)/g, '<span class="text-primary font-medium">@$1</span>');
  };

  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b p-3">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h4 className="text-sm font-medium">Observaciones</h4>
        <span className="text-xs text-muted-foreground">
          ({observaciones.length})
        </span>
      </div>

      {/* Lista de observaciones */}
      <ScrollArea className="flex-1 p-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : observaciones.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No hay observaciones aún
          </div>
        ) : (
          <div className="space-y-3">
            {observaciones.map((obs) => (
              <div key={obs.id} className="flex gap-2">
                <Avatar className="h-7 w-7 flex-shrink-0">
                  <AvatarFallback className="text-xs">
                    {(obs.usuario_nombre || obs.usuario_email || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium">
                      {obs.usuario_nombre || obs.usuario_email?.split('@')[0] || 'Usuario'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(obs.creado_en), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>
                  <p
                    className="mt-0.5 text-sm"
                    dangerouslySetInnerHTML={{
                      __html: formatTextoConMenciones(obs.texto),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input para nueva observación */}
      <div className="relative border-t p-3">
        {/* Dropdown de menciones */}
        {showMentions && filteredUsuarios.length > 0 && (
          <div className="absolute bottom-full left-3 right-3 mb-1 max-h-40 overflow-auto rounded-md border bg-popover p-1 shadow-md">
            {filteredUsuarios.map((usuario, index) => (
              <button
                key={usuario.id}
                className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm ${
                  index === mentionIndex ? 'bg-accent' : 'hover:bg-accent'
                }`}
                onClick={() => insertMention(usuario)}
              >
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium">{usuario.nombre || usuario.email}</span>
                {usuario.nombre && (
                  <span className="text-xs text-muted-foreground">{usuario.email}</span>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={texto}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe una observación... (usa @ para mencionar)"
            className="min-h-[60px] resize-none text-sm"
            disabled={isSending}
          />
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!texto.trim() || isSending}
            className="self-end"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">
          Usa @ para mencionar a un usuario
        </p>
      </div>
    </Card>
  );
}
