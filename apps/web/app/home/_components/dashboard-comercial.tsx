'use client';

import { motion } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Card } from '@kit/ui/card';

import {
  cotizaciones,
  pedidos,
  notificaciones,
} from '~/lib/mock-data';

import { useLeads, useLeadStats } from '~/lib/leads';

export function DashboardComercial() {
  // Datos reales de leads
  const { data: leads = [], isLoading: leadsLoading } = useLeads();
  const { data: leadStats } = useLeadStats();

  // Calcular métricas de leads
  const calcularMetricasLeads = () => {
    const ahora = new Date();
    const inicioMesActual = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
    const finMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0);

    // Leads del mes actual
    const leadsMesActual = leads.filter(
      (l) => new Date(l.creado_en) >= inicioMesActual
    );

    // Leads del mes anterior
    const leadsMesAnterior = leads.filter(
      (l) => {
        const fecha = new Date(l.creado_en);
        return fecha >= inicioMesAnterior && fecha <= finMesAnterior;
      }
    );

    // Calcular cambio porcentual
    const cambioLeads = leadsMesAnterior.length > 0
      ? Math.round(((leadsMesActual.length - leadsMesAnterior.length) / leadsMesAnterior.length) * 100)
      : leadsMesActual.length > 0 ? 100 : 0;

    // Calcular tasa de conversión
    const leadsConvertidos = leads.filter((l) => l.estado === 'CONVERTIDO').length;
    const tasaConversion = leads.length > 0
      ? Math.round((leadsConvertidos / leads.length) * 100)
      : 0;

    // Calcular cambio en conversión (simulado por ahora)
    const cambioConversion = tasaConversion > 50 ? 3 : -2;

    return {
      leadsNuevos: leadsMesActual.length,
      cambioLeads,
      tasaConversion,
      cambioConversion,
    };
  };

  const metricas = calcularMetricasLeads();

  // Calcular si supera 24h
  const supera24h = (fechaCreacion: string) => {
    const ahora = new Date();
    const creacion = new Date(fechaCreacion);
    const diff = ahora.getTime() - creacion.getTime();
    return diff > 24 * 60 * 60 * 1000;
  };

  // Leads con alerta (más de 24h sin convertir)
  const leadsConAlerta = leads.filter(
    (l) =>
      supera24h(l.creado_en) &&
      l.estado !== 'CONVERTIDO' &&
      l.estado !== 'RECHAZADO'
  );

  // Mock data para cotizaciones, pedidos y notificaciones
  const cotizacionesMargenBajo = cotizaciones.filter(
    (c) => c.aprobacionGerenciaRequerida
  );
  const pedidosActivos = pedidos.filter(
    (p) =>
      p.estado !== 'entregado' &&
      p.estado !== 'completado' &&
      p.estado !== 'cancelado'
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

  const getLeadEstadoColor = (estado: string) => {
    const colores: Record<string, string> = {
      PENDIENTE_ASIGNACION: 'bg-yellow-500',
      PENDIENTE_INFORMACION: 'bg-orange-500',
      ASIGNADO: 'bg-blue-500',
      CONVERTIDO: 'bg-green-500',
      RECHAZADO: 'bg-gray-500',
    };
    return colores[estado] || 'bg-gray-500';
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
        {/* Leads Nuevos - DATOS REALES */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0 }}
        >
          <Card className="p-4 transition-shadow hover:shadow-md">
            <div className="mb-2 flex items-start justify-between">
              <p className="text-xs text-muted-foreground">Leads Nuevos</p>
              {metricas.cambioLeads !== 0 && (
                <div
                  className={`rounded-full p-1 ${
                    metricas.cambioLeads > 0
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                  }`}
                >
                  {metricas.cambioLeads > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                </div>
              )}
            </div>
            <h3 className="mb-1 text-2xl font-bold">{metricas.leadsNuevos}</h3>
            {metricas.cambioLeads !== 0 && (
              <p
                className={`text-xs ${
                  metricas.cambioLeads > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {metricas.cambioLeads > 0 ? '+' : ''}
                {metricas.cambioLeads}% vs mes
              </p>
            )}
          </Card>
        </motion.div>

        {/* Conversión - DATOS REALES */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <Card className="p-4 transition-shadow hover:shadow-md">
            <div className="mb-2 flex items-start justify-between">
              <p className="text-xs text-muted-foreground">Conversión</p>
              {metricas.cambioConversion !== 0 && (
                <div
                  className={`rounded-full p-1 ${
                    metricas.cambioConversion > 0
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                  }`}
                >
                  {metricas.cambioConversion > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                </div>
              )}
            </div>
            <h3 className="mb-1 text-2xl font-bold">{metricas.tasaConversion}%</h3>
            {metricas.cambioConversion !== 0 && (
              <p
                className={`text-xs ${
                  metricas.cambioConversion > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {metricas.cambioConversion > 0 ? '+' : ''}
                {metricas.cambioConversion}% vs mes
              </p>
            )}
          </Card>
        </motion.div>

        {/* Cotizaciones - Mock data */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="p-4 transition-shadow hover:shadow-md">
            <div className="mb-2 flex items-start justify-between">
              <p className="text-xs text-muted-foreground">Cotizaciones</p>
              <div className="rounded-full bg-green-100 p-1 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                <TrendingUp className="h-3 w-3" />
              </div>
            </div>
            <h3 className="mb-1 text-2xl font-bold">$285M</h3>
            <p className="text-xs text-green-600 dark:text-green-400">
              +10% vs mes
            </p>
          </Card>
        </motion.div>

        {/* Pedidos - Mock data */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Card className="p-4 transition-shadow hover:shadow-md">
            <div className="mb-2 flex items-start justify-between">
              <p className="text-xs text-muted-foreground">Pedidos</p>
              <div className="rounded-full bg-red-100 p-1 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                <TrendingDown className="h-3 w-3" />
              </div>
            </div>
            <h3 className="mb-1 text-2xl font-bold">18</h3>
            <p className="text-xs text-red-600 dark:text-red-400">
              -8% vs mes
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Actividad Reciente - Compacto */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Leads Recientes - DATOS REALES */}
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-semibold">Leads Recientes</h4>
            <Badge variant="outline" className="text-xs">
              {leadStats?.total ?? leads.length}
            </Badge>
          </div>
          {leadsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : leads.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No hay leads aún</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leads.slice(0, 5).map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center gap-2 rounded p-2 transition-colors hover:bg-secondary/50"
                >
                  <div
                    className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${getLeadEstadoColor(lead.estado)}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">
                      <span className="font-mono text-xs">#{lead.numero}</span> ·{' '}
                      {lead.razon_social}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {lead.email_contacto}
                    </p>
                  </div>
                  {supera24h(lead.creado_en) &&
                    lead.estado !== 'CONVERTIDO' &&
                    lead.estado !== 'RECHAZADO' && (
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
          )}
        </Card>

        {/* Pedidos Activos - Mock data */}
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
