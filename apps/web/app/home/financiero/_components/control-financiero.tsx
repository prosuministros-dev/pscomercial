'use client';

import { useState } from 'react';

import {
  AlertCircle,
  DollarSign,
  FileText,
  Lock,
  Search,
  TrendingUp,
  Unlock,
} from 'lucide-react';
import { toast } from 'sonner';

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
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { ScrollArea } from '@kit/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';
import { Textarea } from '@kit/ui/textarea';

import {
  bitacoraBloqueos,
  bloqueosCartera,
  configuracionMargen,
  usuarioActual,
  type BitacoraBloqueo,
  type BloqueoCartera,
  type ConfiguracionMargen,
} from '~/lib/mock-data';

export function ControlFinanciero() {
  const [bloqueos, setBloqueos] = useState<BloqueoCartera[]>(bloqueosCartera);
  const [bitacora, setBitacora] = useState<BitacoraBloqueo[]>(bitacoraBloqueos);
  const [margenes, setMargenes] = useState<ConfiguracionMargen[]>(configuracionMargen);
  const [busqueda, setBusqueda] = useState('');
  const [modalBloqueo, setModalBloqueo] = useState(false);
  const [modalMargen, setModalMargen] = useState(false);
  const [bloqueoSeleccionado, setBloqueoSeleccionado] = useState<BloqueoCartera | null>(null);
  const [margenSeleccionado, setMargenSeleccionado] = useState<ConfiguracionMargen | null>(null);

  const [formBloqueo, setFormBloqueo] = useState({
    clienteNit: '',
    clienteRazonSocial: '',
    bloqueado: false,
    motivo: '',
    montoDeuda: 0,
    diasVencimiento: 0,
  });

  const bloqueosFiltrados = bloqueos.filter(
    (b) =>
      b.clienteRazonSocial.toLowerCase().includes(busqueda.toLowerCase()) ||
      b.clienteNit.includes(busqueda),
  );

  const handleBloquear = (bloqueo: BloqueoCartera | null) => {
    if (bloqueo) {
      setBloqueoSeleccionado(bloqueo);
      setFormBloqueo({
        clienteNit: bloqueo.clienteNit,
        clienteRazonSocial: bloqueo.clienteRazonSocial,
        bloqueado: bloqueo.bloqueado,
        motivo: bloqueo.motivo || '',
        montoDeuda: bloqueo.montoDeuda || 0,
        diasVencimiento: bloqueo.diasVencimiento || 0,
      });
    } else {
      setBloqueoSeleccionado(null);
      setFormBloqueo({
        clienteNit: '',
        clienteRazonSocial: '',
        bloqueado: true,
        motivo: '',
        montoDeuda: 0,
        diasVencimiento: 0,
      });
    }
    setModalBloqueo(true);
  };

  const handleGuardarBloqueo = () => {
    if (!formBloqueo.clienteNit.trim() || !formBloqueo.clienteRazonSocial.trim()) {
      toast.error('NIT y Razón Social son obligatorios');
      return;
    }

    if (formBloqueo.bloqueado && !formBloqueo.motivo.trim()) {
      toast.error('El motivo es obligatorio para bloquear un cliente');
      return;
    }

    const ahora = new Date().toISOString();

    if (bloqueoSeleccionado) {
      const bloqueoActualizado: BloqueoCartera = {
        ...bloqueoSeleccionado,
        ...formBloqueo,
        ...(formBloqueo.bloqueado
          ? {
              bloqueadoPor: usuarioActual.nombre,
              bloqueadoEn: ahora,
            }
          : {
              desbloqueadoPor: usuarioActual.nombre,
              desbloqueadoEn: ahora,
            }),
      };

      setBloqueos(
        bloqueos.map((b) =>
          b.id === bloqueoSeleccionado.id ? bloqueoActualizado : b,
        ),
      );

      const nuevaBitacora: BitacoraBloqueo = {
        id: `bit-blq-${Date.now()}`,
        bloqueoId: bloqueoSeleccionado.id,
        accion: formBloqueo.bloqueado ? 'bloquear' : 'desbloquear',
        usuarioId: usuarioActual.id,
        usuario: usuarioActual.nombre,
        motivo: formBloqueo.motivo,
        valorAnterior: bloqueoSeleccionado.bloqueado,
        valorNuevo: formBloqueo.bloqueado,
        creadoEn: ahora,
      };

      setBitacora([nuevaBitacora, ...bitacora]);
      toast.success(
        `Cliente ${formBloqueo.bloqueado ? 'bloqueado' : 'desbloqueado'} exitosamente`,
      );
    } else {
      const nuevoBloqueo: BloqueoCartera = {
        id: `blq-${Date.now()}`,
        ...formBloqueo,
        bloqueadoPor: usuarioActual.nombre,
        bloqueadoEn: ahora,
      };

      setBloqueos([...bloqueos, nuevoBloqueo]);

      const nuevaBitacora: BitacoraBloqueo = {
        id: `bit-blq-${Date.now()}`,
        bloqueoId: nuevoBloqueo.id,
        accion: 'bloquear',
        usuarioId: usuarioActual.id,
        usuario: usuarioActual.nombre,
        motivo: formBloqueo.motivo,
        valorAnterior: false,
        valorNuevo: true,
        creadoEn: ahora,
      };

      setBitacora([nuevaBitacora, ...bitacora]);
      toast.success('Bloqueo de cartera registrado exitosamente');
    }

    setModalBloqueo(false);
  };

  const handleEditarMargen = (margen: ConfiguracionMargen) => {
    setMargenSeleccionado(margen);
    setModalMargen(true);
  };

  const handleGuardarMargen = () => {
    if (!margenSeleccionado) return;

    setMargenes(
      margenes.map((m) =>
        m.id === margenSeleccionado.id ? margenSeleccionado : m,
      ),
    );

    toast.success('Configuración de margen actualizada');
    setModalMargen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="gradient-accent rounded-lg p-2">
            <DollarSign className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Control Financiero</h2>
            <p className="text-xs text-muted-foreground">
              Gestión de bloqueos y márgenes
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/20">
              <Lock className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Clientes Bloqueados</p>
              <h4 className="text-xl font-bold">
                {bloqueos.filter((b) => b.bloqueado).length}
              </h4>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/20">
              <Unlock className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Clientes Activos</p>
              <h4 className="text-xl font-bold">
                {bloqueos.filter((b) => !b.bloqueado).length}
              </h4>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/20">
              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Movimientos Hoy</p>
              <h4 className="text-xl font-bold">
                {
                  bitacora.filter((b) => {
                    const hoy = new Date().toDateString();
                    const fecha = new Date(b.creadoEn).toDateString();
                    return hoy === fecha;
                  }).length
                }
              </h4>
            </div>
          </div>
        </Card>
      </div>

      {/* Bloqueos de Cartera */}
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="font-semibold">Bloqueos de Cartera</h4>
          <Button
            size="sm"
            onClick={() => handleBloquear(null)}
            className="gradient-brand gap-2"
          >
            <Lock className="h-4 w-4" />
            Registrar Bloqueo
          </Button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por NIT o Razón Social..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="text-xs">
                <TableHead>Cliente</TableHead>
                <TableHead>NIT</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Deuda</TableHead>
                <TableHead>Días Vencidos</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bloqueosFiltrados.map((bloqueo) => (
                <TableRow key={bloqueo.id} className="text-sm">
                  <TableCell className="font-medium">
                    {bloqueo.clienteRazonSocial}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {bloqueo.clienteNit}
                  </TableCell>
                  <TableCell>
                    {bloqueo.bloqueado ? (
                      <Badge variant="destructive" className="gap-1 text-xs">
                        <Lock className="h-3 w-3" />
                        Bloqueado
                      </Badge>
                    ) : (
                      <Badge
                        variant="default"
                        className="gap-1 bg-green-600 text-xs"
                      >
                        <Unlock className="h-3 w-3" />
                        Activo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    {bloqueo.montoDeuda
                      ? `$${(bloqueo.montoDeuda / 1000000).toFixed(1)}M`
                      : '-'}
                  </TableCell>
                  <TableCell className="text-xs">
                    {bloqueo.diasVencimiento ? (
                      <span
                        className={
                          bloqueo.diasVencimiento > 60
                            ? 'font-medium text-red-600'
                            : ''
                        }
                      >
                        {bloqueo.diasVencimiento} días
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs">
                    {bloqueo.motivo || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => handleBloquear(bloqueo)}
                      >
                        {bloqueo.bloqueado ? (
                          <>
                            <Unlock className="mr-1 h-3 w-3" />
                            Desbloquear
                          </>
                        ) : (
                          <>
                            <Lock className="mr-1 h-3 w-3" />
                            Bloquear
                          </>
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Configuración de Márgenes */}
      <Card className="p-4">
        <h4 className="mb-4 font-semibold">
          Configuración de Márgenes por Categoría
        </h4>
        <div className="grid gap-3 md:grid-cols-2">
          {margenes.map((margen) => (
            <Card key={margen.id} className="p-4">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h4 className="font-semibold capitalize">{margen.categoria}</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {margen.requiereAprobacion &&
                      `Requiere aprobación de ${margen.nivelAprobacion}`}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => handleEditarMargen(margen)}
                >
                  Editar
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Margen Mínimo</p>
                  <p className="text-lg font-medium text-orange-600">
                    {margen.margenMinimo}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Margen Objetivo</p>
                  <p className="text-lg font-medium text-green-600">
                    {margen.margenObjetivo}%
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Bitácora de Cambios */}
      <Card className="p-4">
        <h4 className="mb-4 font-semibold">Bitácora de Cambios</h4>
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {bitacora.map((evento) => (
              <div key={evento.id} className="border-l-2 border-primary pb-3 pl-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      {evento.accion === 'bloquear' ? (
                        <Lock className="h-4 w-4 text-red-600" />
                      ) : (
                        <Unlock className="h-4 w-4 text-green-600" />
                      )}
                      <span className="text-sm font-medium capitalize">
                        {evento.accion}
                      </span>
                    </div>
                    <p className="mb-1 text-xs text-muted-foreground">
                      {evento.motivo}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Por: {evento.usuario}</span>
                      <span>•</span>
                      <span>
                        {new Date(evento.creadoEn).toLocaleString('es-CO', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Modal Bloqueo/Desbloqueo */}
      <Dialog open={modalBloqueo} onOpenChange={setModalBloqueo}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {bloqueoSeleccionado
                ? formBloqueo.bloqueado
                  ? 'Desbloquear Cliente'
                  : 'Bloquear Cliente'
                : 'Registrar Bloqueo de Cartera'}
            </DialogTitle>
            <DialogDescription>
              {formBloqueo.bloqueado
                ? 'Marca el cliente con bloqueo de cartera para evitar nuevos pedidos'
                : 'Quita el bloqueo para permitir nuevas transacciones'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>NIT *</Label>
              <Input
                value={formBloqueo.clienteNit}
                onChange={(e) =>
                  setFormBloqueo({ ...formBloqueo, clienteNit: e.target.value })
                }
                placeholder="900.123.456-7"
                className="mt-1"
                disabled={!!bloqueoSeleccionado}
              />
            </div>

            <div>
              <Label>Razón Social *</Label>
              <Input
                value={formBloqueo.clienteRazonSocial}
                onChange={(e) =>
                  setFormBloqueo({
                    ...formBloqueo,
                    clienteRazonSocial: e.target.value,
                  })
                }
                placeholder="Nombre del cliente"
                className="mt-1"
                disabled={!!bloqueoSeleccionado}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Monto Deuda (COP)</Label>
                <Input
                  type="number"
                  value={formBloqueo.montoDeuda}
                  onChange={(e) =>
                    setFormBloqueo({
                      ...formBloqueo,
                      montoDeuda: Number(e.target.value),
                    })
                  }
                  placeholder="0"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Días Vencidos</Label>
                <Input
                  type="number"
                  value={formBloqueo.diasVencimiento}
                  onChange={(e) =>
                    setFormBloqueo({
                      ...formBloqueo,
                      diasVencimiento: Number(e.target.value),
                    })
                  }
                  placeholder="0"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Motivo {formBloqueo.bloqueado && '*'}</Label>
              <Textarea
                value={formBloqueo.motivo}
                onChange={(e) =>
                  setFormBloqueo({ ...formBloqueo, motivo: e.target.value })
                }
                placeholder="Describe el motivo del bloqueo/desbloqueo"
                className="mt-1"
                rows={3}
              />
            </div>

            {bloqueoSeleccionado && (
              <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600" />
                  <div className="text-xs">
                    {formBloqueo.bloqueado ? (
                      <p>
                        Al desbloquear este cliente, podrás generar nuevos
                        pedidos a su nombre.
                      </p>
                    ) : (
                      <p className="text-yellow-800 dark:text-yellow-200">
                        Al bloquear este cliente,{' '}
                        <strong>no se podrán generar nuevos pedidos</strong>{' '}
                        hasta que sea desbloqueado.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setModalBloqueo(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGuardarBloqueo}
              className="flex-1"
              variant={formBloqueo.bloqueado ? 'destructive' : 'default'}
            >
              {formBloqueo.bloqueado ? 'Bloquear' : 'Desbloquear'} Cliente
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Margen */}
      {margenSeleccionado && (
        <Dialog open={modalMargen} onOpenChange={setModalMargen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Configurar Márgenes - {margenSeleccionado.categoria}
              </DialogTitle>
              <DialogDescription>
                Define los márgenes mínimos y objetivos para esta categoría
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Margen Mínimo (%)</Label>
                  <Input
                    type="number"
                    value={margenSeleccionado.margenMinimo}
                    onChange={(e) =>
                      setMargenSeleccionado({
                        ...margenSeleccionado,
                        margenMinimo: Number(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Margen Objetivo (%)</Label>
                  <Input
                    type="number"
                    value={margenSeleccionado.margenObjetivo}
                    onChange={(e) =>
                      setMargenSeleccionado({
                        ...margenSeleccionado,
                        margenObjetivo: Number(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Nivel de Aprobación</Label>
                <select
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={margenSeleccionado.nivelAprobacion}
                  onChange={(e) =>
                    setMargenSeleccionado({
                      ...margenSeleccionado,
                      nivelAprobacion: e.target.value as
                        | 'gerencia'
                        | 'financiera'
                        | 'direccion',
                    })
                  }
                >
                  <option value="gerencia">Gerencia</option>
                  <option value="financiera">Financiera</option>
                  <option value="direccion">Dirección</option>
                </select>
              </div>

              <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                <div className="flex items-start gap-2">
                  <TrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    Las cotizaciones con margen inferior al mínimo requerirán
                    aprobación de {margenSeleccionado.nivelAprobacion}.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setModalMargen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button onClick={handleGuardarMargen} className="gradient-brand flex-1">
                Guardar Configuración
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
