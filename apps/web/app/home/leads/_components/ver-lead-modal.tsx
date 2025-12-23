'use client';

import { FileText, Megaphone } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card } from '@kit/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Label } from '@kit/ui/label';
import { Separator } from '@kit/ui/separator';

import { useLeads } from '~/lib/leads';

// Tipo del lead desde la base de datos (reutiliza el tipo del hook)
type LeadDB = NonNullable<ReturnType<typeof useLeads>['data']>[number];

interface VerLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: LeadDB;
  onCrearCotizacion?: (lead: LeadDB) => void;
}

export function VerLeadModal({
  open,
  onOpenChange,
  lead,
  onCrearCotizacion,
}: VerLeadModalProps) {
  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { variant: 'outline' | 'secondary' | 'default'; label: string; className: string }> = {
      PENDIENTE_ASIGNACION: {
        variant: 'outline',
        label: 'Pendiente',
        className: 'border-yellow-500 text-yellow-600',
      },
      PENDIENTE_INFORMACION: {
        variant: 'outline',
        label: 'Info Pendiente',
        className: 'border-orange-500 text-orange-600',
      },
      ASIGNADO: {
        variant: 'secondary',
        label: 'Asignado',
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      },
      CONVERTIDO: {
        variant: 'default',
        label: 'Convertido',
        className: 'bg-green-600',
      },
      RECHAZADO: {
        variant: 'secondary',
        label: 'Rechazado',
        className: '',
      },
    };
    const badge = badges[estado];
    if (!badge) return null;
    return (
      <Badge
        variant={badge.variant}
        className={`h-5 text-xs ${badge.className || ''}`}
      >
        {badge.label}
      </Badge>
    );
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCanalLabel = (canal: string) => {
    const canales: Record<string, string> = {
      WHATSAPP: 'WhatsApp',
      WEB: 'Web',
      MANUAL: 'Manual',
    };
    return canales[canal] || canal;
  };

  // Calcular si supera 24h
  const supera24h = (fechaCreacion: string, estado: string) => {
    if (estado === 'CONVERTIDO' || estado === 'RECHAZADO') return false;
    const ahora = new Date();
    const creacion = new Date(fechaCreacion);
    const diff = ahora.getTime() - creacion.getTime();
    return diff > 24 * 60 * 60 * 1000;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-[95vw] max-w-2xl flex-col overflow-hidden p-0 md:max-h-[90vh] md:w-full">
        <DialogHeader className="flex-shrink-0 border-b border-border px-3 py-3 md:px-6 md:py-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
            <div className="gradient-accent flex-shrink-0 rounded-lg p-1.5 md:p-2">
              <Megaphone className="h-3.5 w-3.5 text-white md:h-4 md:w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="flex items-center gap-2 text-sm md:text-base">
                <span className="truncate">Lead #{lead.numero}</span>
                {getEstadoBadge(lead.estado)}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Detalles completos del lead incluyendo información de contacto
                y requerimiento
              </DialogDescription>
              <p className="mt-1 truncate text-xs text-muted-foreground md:text-sm">
                {lead.razon_social}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-3 py-3 md:px-6 md:py-4">
          <div className="space-y-3 md:space-y-4">
            {/* Información del Cliente */}
            <Card className="p-3 md:p-4">
              <h4 className="mb-2 text-sm md:mb-3 md:text-base">
                Información del Cliente
              </h4>
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 md:gap-4">
                <div>
                  <Label className="text-[10px] text-muted-foreground md:text-xs">
                    Razón Social
                  </Label>
                  <p className="mt-1 text-xs md:text-sm">{lead.razon_social}</p>
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground md:text-xs">
                    NIT
                  </Label>
                  <p className="mt-1 text-xs md:text-sm">{lead.nit}</p>
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground md:text-xs">
                    Canal de Entrada
                  </Label>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-[10px] md:text-xs">
                      {getCanalLabel(lead.canal_origen)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground md:text-xs">
                    Estado
                  </Label>
                  <div className="mt-1">{getEstadoBadge(lead.estado)}</div>
                </div>
              </div>
            </Card>

            {/* Contacto Principal */}
            <Card className="p-3 md:p-4">
              <h4 className="mb-2 text-sm md:mb-3 md:text-base">
                Contacto Principal
              </h4>
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 md:gap-4">
                <div className="sm:col-span-2">
                  <Label className="text-[10px] text-muted-foreground md:text-xs">
                    Nombre
                  </Label>
                  <p className="mt-1 text-xs md:text-sm">
                    {lead.nombre_contacto}
                  </p>
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground md:text-xs">
                    Email
                  </Label>
                  <p className="mt-1 truncate text-xs md:text-sm">
                    <a
                      href={`mailto:${lead.email_contacto}`}
                      className="text-primary hover:underline"
                    >
                      {lead.email_contacto}
                    </a>
                  </p>
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground md:text-xs">
                    Teléfono
                  </Label>
                  <p className="mt-1 text-xs md:text-sm">
                    <a
                      href={`tel:${lead.celular_contacto}`}
                      className="text-primary hover:underline"
                    >
                      {lead.celular_contacto}
                    </a>
                  </p>
                </div>
              </div>
            </Card>

            {/* Requerimiento */}
            <Card className="p-3 md:p-4">
              <h4 className="mb-2 text-sm md:mb-3 md:text-base">
                Requerimiento del Cliente
              </h4>
              <p className="text-xs leading-relaxed text-muted-foreground md:text-sm">
                {lead.requerimiento}
              </p>
            </Card>

            {/* Información de Gestión */}
            <Card className="p-3 md:p-4">
              <h4 className="mb-2 text-sm md:mb-3 md:text-base">Gestión</h4>
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 md:gap-4">
                <div>
                  <Label className="text-[10px] text-muted-foreground md:text-xs">
                    Asignado a
                  </Label>
                  <p className="mt-1 text-xs md:text-sm">
                    {lead.asesor?.nombre ?? 'Sin asignar'}
                  </p>
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground md:text-xs">
                    Fecha del Lead
                  </Label>
                  <p className="mt-1 text-xs md:text-sm">
                    {formatFecha(lead.fecha_lead)}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-[10px] text-muted-foreground md:text-xs">
                    Fecha de creación en sistema
                  </Label>
                  <p className="mt-1 text-xs md:text-sm">
                    {formatFecha(lead.creado_en)}
                  </p>
                </div>
              </div>

              {supera24h(lead.creado_en, lead.estado) && (
                <>
                  <Separator className="my-3" />
                  <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-2 dark:border-yellow-900 dark:bg-yellow-900/20">
                    <div className="h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-yellow-500" />
                    <p className="text-[10px] text-yellow-700 dark:text-yellow-400 md:text-xs">
                      Este lead tiene más de 24 horas sin convertir
                    </p>
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>

        <div className="flex flex-shrink-0 flex-col-reverse items-stretch justify-between gap-2 border-t border-border px-3 py-3 sm:flex-row sm:items-center md:px-6 md:py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cerrar
          </Button>
          {lead.estado === 'ASIGNADO' && onCrearCotizacion && (
            <Button
              size="sm"
              onClick={() => {
                onCrearCotizacion(lead);
                onOpenChange(false);
              }}
              className="gradient-brand w-full gap-2 sm:w-auto"
            >
              <FileText className="h-3.5 w-3.5" />
              Crear Cotización
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
