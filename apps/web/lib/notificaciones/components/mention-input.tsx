'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, User } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useBuscarUsuarios } from '../hooks/use-usuarios';
import { cn } from '@/lib/utils';

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onMentionSelect?: (userId: string, userName: string) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  rows?: number;
}

/**
 * Componente Input con autocompletado de menciones @usuario
 * HU-0009: Dropdown con búsqueda de usuarios al escribir @
 */
export function MentionInput({
  value,
  onChange,
  onMentionSelect,
  placeholder = 'Escribe un comentario...',
  maxLength = 2000,
  disabled = false,
  rows = 4,
}: MentionInputProps) {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Buscar usuarios cuando hay query de mención
  const { data: usuarios, isLoading } = useBuscarUsuarios(mentionQuery, showMentions);

  // Detectar @ y extraer query
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const text = value;
    const cursorPos = textarea.selectionStart;

    // Buscar @ antes del cursor
    let atPos = -1;
    for (let i = cursorPos - 1; i >= 0; i--) {
      if (text[i] === '@') {
        atPos = i;
        break;
      }
      if (text[i] === ' ' || text[i] === '\n') {
        break;
      }
    }

    if (atPos !== -1) {
      // Hay un @ activo
      const query = text.slice(atPos + 1, cursorPos);

      // Solo mostrar si el query no tiene espacios ni saltos de línea
      if (!query.includes(' ') && !query.includes('\n')) {
        setMentionQuery(query);
        setShowMentions(true);
        return;
      }
    }

    // No hay @ activo
    setShowMentions(false);
    setMentionQuery('');
  }, [value, cursorPosition]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    setCursorPosition(e.currentTarget.selectionStart);
  };

  const handleClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    setCursorPosition(e.currentTarget.selectionStart);
  };

  const handleMentionClick = (userId: string, userName: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const text = value;
    const cursorPos = textarea.selectionStart;

    // Encontrar posición del @
    let atPos = -1;
    for (let i = cursorPos - 1; i >= 0; i--) {
      if (text[i] === '@') {
        atPos = i;
        break;
      }
      if (text[i] === ' ' || text[i] === '\n') {
        break;
      }
    }

    if (atPos !== -1) {
      // Reemplazar @query con @nombre
      const before = text.slice(0, atPos);
      const after = text.slice(cursorPos);
      const newText = `${before}@${userName} ${after}`;

      onChange(newText);

      // Notificar la mención
      if (onMentionSelect) {
        onMentionSelect(userId, userName);
      }

      // Cerrar dropdown
      setShowMentions(false);
      setMentionQuery('');

      // Devolver foco al textarea
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = atPos + userName.length + 2; // +2 por @ y espacio
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  return (
    <div className="relative">
      <Popover open={showMentions && usuarios && usuarios.length > 0}>
        <PopoverTrigger asChild>
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onClick={handleClick}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
            rows={rows}
            className="resize-none"
          />
        </PopoverTrigger>
        <PopoverContent
          className="p-0 w-72"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command>
            <CommandList>
              {isLoading ? (
                <CommandEmpty>Buscando usuarios...</CommandEmpty>
              ) : usuarios && usuarios.length > 0 ? (
                <CommandGroup heading="Mencionar usuario">
                  {usuarios.map((usuario) => (
                    <CommandItem
                      key={usuario.id}
                      value={usuario.name}
                      onSelect={() => handleMentionClick(usuario.id, usuario.name)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={usuario.picture_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {usuario.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{usuario.name}</p>
                          {usuario.email && (
                            <p className="text-xs text-muted-foreground truncate">
                              {usuario.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : (
                <CommandEmpty>No se encontraron usuarios</CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Hint text */}
      <p className="text-xs text-muted-foreground mt-1">
        Escribe <span className="font-medium">@</span> para mencionar a un usuario
      </p>
    </div>
  );
}
