'use client';

import { motion } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Card } from '@kit/ui/card';

import {
  metricasDashboard,
  leads,
  cotizaciones,
  pedidos,
  notificaciones,
} from '~/lib/mock-data';

export function DashboardComercial() {
  const leadsConAlerta = leads.filter((l) => l.alerta24h);
  const cotizacionesMargenBajo = cotizaciones.filter(
    (c) => c.aprobacionGerenciaRequerida,
  );
  const pedidosActivos = pedidos.filter(
    (p) =>
      p.estado !== 'entregado' &&
      p.estado !== 'completado' &&
      p.estado !== 'cancelado',
  );
  const notificacionesPendientes = notificaciones.filter((n) => !n.leida);

  const getEstadoLabel = (estado: string) => {
    const estados: Record<string, string> = {
      por_facturar: 'Por facturar',
      facturado_sin_pago: 'Sin pago',
      pendiente_compra: 'Pend. compra',
      en_bodega: 'En bodega',
      despachado: 'Despachado',
      entregado: 'Entregado',
      pendiente: 'Pendiente',
      aprobado: 'Aprobado',
      en_proceso: 'En proceso',
      completado: 'Completado',
      cancelado: 'Cancelado',
    };
    return estados[estado] || estado;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Hero - Compacto */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-brand relative overflow-hidden rounded-xl p-4 md:p-6 lg:p-8"
      >
        <h2 className="mb-1 text-lg text-white md:text-xl lg:text-2xl">
          Sistema Make to Order
        </h2>
        <p className="text-xs text-white/80 md:text-sm">
          {new Date().toLocaleDateString('es-CO', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </motion.div>

      {/* Alertas - Compacto */}
      {(leadsConAlerta.length > 0 ||
        cotizacionesMargenBajo.length > 0 ||
        notificacionesPendientes.length > 0) && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 md:gap-3">
          {leadsConAlerta.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50/50 p-3 dark:border-yellow-900 dark:bg-yellow-950/20">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 flex-shrink-0 text-yellow-600" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    <span className="font-medium">{leadsConAlerta.length}</span>{' '}
                    Lead{leadsConAlerta.length > 1 ? 's' : ''} +24h
                  </p>
                </div>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
              </div>
            </Card>
          )}

          {cotizacionesMargenBajo.length > 0 && (
            <Card className="border-orange-200 bg-orange-50/50 p-3 dark:border-orange-900 dark:bg-orange-950/20">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 flex-shrink-0 text-orange-600" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    <span className="font-medium">
                      {cotizacionesMargenBajo.length}
                    </span>{' '}
                    Margen bajo
                  </p>
                </div>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
              </div>
            </Card>
          )}

          {notificacionesPendientes.length > 0 && (
            <Card className="border-blue-200 bg-blue-50/50 p-3 dark:border-blue-900 dark:bg-blue-950/20">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 text-blue-600" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    <span className="font-medium">
                      {notificacionesPendientes.length}
                    </span>{' '}
                    Sin leer
                  </p>
                </div>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Métricas - Grid compacto */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metricasDashboard.map((metrica, index) => (
          <motion.div
            key={metrica.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="p-4 transition-shadow hover:shadow-md">
              <div className="mb-2 flex items-start justify-between">
                <p className="text-xs text-muted-foreground">{metrica.label}</p>
                {metrica.cambio !== 0 && (
                  <div
                    className={`rounded-full p-1 ${
                      metrica.tendencia === 'up'
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                    }`}
                  >
                    {metrica.tendencia === 'up' ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                  </div>
                )}
              </div>
              <h3 className="mb-1 text-2xl font-bold">{metrica.valor}</h3>
              {metrica.cambio !== 0 && (
                <p
                  className={`text-xs ${
                    metrica.cambio > 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {metrica.cambio > 0 ? '+' : ''}
                  {metrica.cambio}% vs mes
                </p>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Actividad Reciente - Compacto */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Leads Recientes */}
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-semibold">Leads Recientes</h4>
            <Badge variant="outline" className="text-xs">
              {leads.length}
            </Badge>
          </div>
          <div className="space-y-2">
            {leads.slice(0, 5).map((lead) => (
              <div
                key={lead.id}
                className="flex items-center gap-2 rounded p-2 transition-colors hover:bg-secondary/50"
              >
                <div
                  className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                    lead.estado === 'pendiente'
                      ? 'bg-yellow-500'
                      : lead.estado === 'convertido'
                        ? 'bg-green-500'
                        : lead.estado === 'en_gestion'
                          ? 'bg-blue-500'
                          : 'bg-gray-500'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    <span className="font-mono text-xs">#{lead.numero}</span> ·{' '}
                    {lead.razonSocial}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {lead.email}
                  </p>
                </div>
                {lead.alerta24h && (
                  <Badge
                    variant="destructive"
                    className="h-5 px-1.5 text-[10px]"
                  >
                    24h
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Pedidos Activos */}
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-semibold">Pedidos Activos</h4>
            <Badge variant="outline" className="text-xs">
              {pedidosActivos.length}
            </Badge>
          </div>
          <div className="space-y-2">
            {pedidos.slice(0, 5).map((pedido) => (
              <div
                key={pedido.id}
                className="flex items-center gap-2 rounded p-2 transition-colors hover:bg-secondary/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    <span className="font-mono text-xs">#{pedido.numero}</span>{' '}
                    · {pedido.razonSocial}
                  </p>
                  <div className="mt-1 flex items-center gap-3">
                    <p className="text-xs text-muted-foreground">
                      ${(pedido.total / 1000000).toFixed(1)}M
                    </p>
                    <div className="flex items-center gap-1">
                      {pedido.pagoConfirmado ? (
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                      ) : (
                        <Clock className="h-3 w-3 text-yellow-600" />
                      )}
                    </div>
                  </div>
                </div>
                <Badge
                  variant={
                    pedido.estado === 'entregado' ? 'default' : 'secondary'
                  }
                  className="h-5 px-1.5 text-[10px]"
                >
                  {getEstadoLabel(pedido.estado)}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
