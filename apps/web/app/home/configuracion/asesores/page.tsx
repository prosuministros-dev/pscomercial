'use client';

import { useState } from 'react';

import { AlertTriangle, Plus, Settings2, Users } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { PageBody, PageHeader } from '@kit/ui/page';

import { useUserPermissions } from '~/lib/permisos';

import { AsesoresTable } from './_components/asesores-table';
import { AsesorFormModal } from './_components/asesor-form-modal';

export default function AsesoresConfigPage() {
  const [crearModalOpen, setCrearModalOpen] = useState(false);
  const { tienePermiso, isLoading } = useUserPermissions();

  const puedeGestionarAsesores = tienePermiso('asesores', 'CREAR');

  // Mostrar acceso denegado si no tiene permisos
  if (!isLoading && !puedeGestionarAsesores) {
    return (
      <>
        <PageHeader
          title="Configuración de Asesores"
          description="Gestiona los asesores comerciales y su capacidad de atención"
        />
        <PageBody>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">Acceso denegado</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              No cuenta con permisos para esta acción.
            </p>
          </div>
        </PageBody>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Configuración de Asesores"
        description="Gestiona los asesores comerciales y su capacidad de atención"
      />

      <PageBody>
        <div className="space-y-6">
          {/* Header con acciones */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="gradient-accent rounded-lg p-2">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Asesores Comerciales</h2>
                <p className="text-sm text-muted-foreground">
                  Configura quiénes pueden recibir leads y su límite de atención
                </p>
              </div>
            </div>

            <Button
              onClick={() => setCrearModalOpen(true)}
              className="gradient-brand gap-2"
            >
              <Plus className="h-4 w-4" />
              Agregar Asesor
            </Button>
          </div>

          {/* Información */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <Settings2 className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Sistema de Asignación</p>
                <p className="text-xs text-muted-foreground">
                  Los leads se asignan automáticamente al asesor con menor carga de trabajo
                  que no haya superado su límite de leads pendientes. Puedes configurar
                  el límite máximo de cada asesor según su capacidad.
                </p>
              </div>
            </div>
          </div>

          {/* Tabla de asesores */}
          <AsesoresTable onAgregarClick={() => setCrearModalOpen(true)} />
        </div>
      </PageBody>

      {/* Modal para agregar asesor */}
      <AsesorFormModal
        open={crearModalOpen}
        onOpenChange={setCrearModalOpen}
      />
    </>
  );
}
