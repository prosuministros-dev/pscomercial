'use client';

import { motion } from 'motion/react';
import { Eye, MousePointer, TrendingUp, Users } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card } from '@kit/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';

import { revenueChartData, trafficSourceData } from '~/lib/mock-data';

const COLORS = ['#00C8CF', '#161052', '#00E5ED', '#2E2680', '#00A8B8'];

export function AnalyticsView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="gradient-accent rounded-lg p-2">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Analytics</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Insights profundos del rendimiento comercial
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Leads Mes', value: '124', icon: Eye, change: '+12.3%' },
          { label: 'Cotizaciones', value: '45', icon: Users, change: '+8.1%' },
          {
            label: 'Tasa Conversión',
            value: '36%',
            icon: MousePointer,
            change: '+2.4%',
          },
          {
            label: 'Valor Promedio',
            value: '$18.5M',
            icon: TrendingUp,
            change: '+15.7%',
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
                <h2 className="text-2xl font-bold">{stat.value}</h2>
                <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                  {stat.change} vs mes anterior
                </p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="p-6">
          <Tabs defaultValue="revenue" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="revenue">Ingresos & Leads</TabsTrigger>
              <TabsTrigger value="traffic">Fuentes de Tráfico</TabsTrigger>
              <TabsTrigger value="trends">Tendencias</TabsTrigger>
            </TabsList>

            <TabsContent value="revenue">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Ingresos y Crecimiento de Leads</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Comparación mensual de los últimos 7 meses
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={revenueChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(0,0,0,0.05)"
                    />
                    <XAxis dataKey="name" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number, name: string) => [
                        name === 'revenue'
                          ? `$${(value / 1000000).toFixed(1)}M`
                          : value,
                        name === 'revenue' ? 'Ingresos' : 'Leads',
                      ]}
                    />
                    <Legend />
                    <Bar
                      dataKey="revenue"
                      fill="#00C8CF"
                      radius={[8, 8, 0, 0]}
                      name="Ingresos"
                    />
                    <Bar
                      dataKey="users"
                      fill="#161052"
                      radius={[8, 8, 0, 0]}
                      name="Leads"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="traffic">
              <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Distribución de Tráfico</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Desglose por fuente
                    </p>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={trafficSourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {trafficSourceData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Top Fuentes</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Ordenado por volumen
                    </p>
                  </div>
                  <div className="space-y-3">
                    {trafficSourceData.map((source, index) => (
                      <div key={source.name} className="flex items-center gap-4">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{source.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {source.value.toLocaleString()} leads
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {(
                              (source.value /
                                trafficSourceData.reduce(
                                  (a, b) => a + b.value,
                                  0,
                                )) *
                              100
                            ).toFixed(1)}
                            %
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trends">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Tendencias de Crecimiento</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Análisis de trayectoria de 7 meses
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={revenueChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(0,0,0,0.05)"
                    />
                    <XAxis dataKey="name" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number, name: string) => [
                        name === 'revenue'
                          ? `$${(value / 1000000).toFixed(1)}M`
                          : value,
                        name === 'revenue' ? 'Ingresos' : 'Leads',
                      ]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#00C8CF"
                      strokeWidth={3}
                      dot={{ fill: '#00C8CF', r: 4 }}
                      name="Ingresos"
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#161052"
                      strokeWidth={3}
                      dot={{ fill: '#161052', r: 4 }}
                      name="Leads"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="p-4">
            <h4 className="mb-3 font-semibold">Cotizaciones por Estado</h4>
            <div className="space-y-2">
              {[
                { estado: 'Enviadas', valor: 45, color: 'bg-blue-500' },
                { estado: 'Aprobadas', valor: 32, color: 'bg-green-500' },
                { estado: 'Rechazadas', valor: 8, color: 'bg-red-500' },
                { estado: 'Vencidas', valor: 5, color: 'bg-gray-500' },
              ].map((item) => (
                <div key={item.estado} className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${item.color}`} />
                  <span className="flex-1 text-sm">{item.estado}</span>
                  <span className="text-sm font-medium">{item.valor}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="p-4">
            <h4 className="mb-3 font-semibold">Pedidos por Estado</h4>
            <div className="space-y-2">
              {[
                { estado: 'Por Facturar', valor: 12, color: 'bg-yellow-500' },
                { estado: 'En Compras', valor: 8, color: 'bg-orange-500' },
                { estado: 'En Bodega', valor: 5, color: 'bg-blue-500' },
                { estado: 'Despachados', valor: 3, color: 'bg-purple-500' },
              ].map((item) => (
                <div key={item.estado} className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${item.color}`} />
                  <span className="flex-1 text-sm">{item.estado}</span>
                  <span className="text-sm font-medium">{item.valor}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card className="p-4">
            <h4 className="mb-3 font-semibold">Top Asesores</h4>
            <div className="space-y-2">
              {[
                { nombre: 'Ana García', leads: 45, conversion: '42%' },
                { nombre: 'Roberto Silva', leads: 38, conversion: '38%' },
                { nombre: 'Carlos Mendoza', leads: 32, conversion: '35%' },
                { nombre: 'Laura Ramírez', leads: 28, conversion: '40%' },
              ].map((asesor, index) => (
                <div key={asesor.nombre} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                    {index + 1}
                  </div>
                  <span className="flex-1 text-sm">{asesor.nombre}</span>
                  <span className="text-xs text-muted-foreground">
                    {asesor.leads} leads
                  </span>
                  <span className="text-xs font-medium text-green-600">
                    {asesor.conversion}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
