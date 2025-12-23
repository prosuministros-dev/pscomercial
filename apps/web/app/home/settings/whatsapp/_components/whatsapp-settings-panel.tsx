'use client';

import { useState } from 'react';

import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  MessageSquare,
  Phone,
  RefreshCw,
  Unlink,
} from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';

// Placeholder para el estado de vinculación (mock data)
const mockSyncData = {
  id: null,
  estado: 'PENDIENTE' as const,
  display_phone_number: null,
  waba_name: null,
  vinculado_en: null,
};

export function WhatsAppSettingsPanel() {
  const [syncData] = useState(mockSyncData);
  const [isLoading, setIsLoading] = useState(false);
  const [showDesvincularDialog, setShowDesvincularDialog] = useState(false);

  const isVinculado = syncData.estado === 'ACTIVO';

  const handleEmbeddedSignup = async () => {
    setIsLoading(true);

    // TODO: Implementar integración real con Meta SDK
    // 1. Cargar el SDK de Meta
    // 2. Iniciar el flujo de Embedded Sign-Up
    // 3. Obtener los tokens y datos de WABA
    // 4. Guardar en la BD con la action completarEmbeddedSignup

    alert('El proceso de Embedded Sign-Up requiere integración con Meta SDK.\n\nPor favor, configura las credenciales de Meta en el archivo .env:\n- META_APP_ID\n- META_APP_SECRET\n- META_CONFIG_ID');

    setIsLoading(false);
  };

  const handleDesvincular = async () => {
    setIsLoading(true);

    // TODO: Llamar a desvincularWhatsApp()

    setShowDesvincularDialog(false);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="gradient-brand rounded-lg p-2">
          <MessageSquare className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Configuración de WhatsApp Business</h1>
          <p className="text-sm text-muted-foreground">
            Vincula tu número de WhatsApp Business para gestionar conversaciones desde la plataforma
          </p>
        </div>
      </div>

      {/* Estado de Vinculación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Estado de Vinculación
          </CardTitle>
          <CardDescription>
            Vincula tu cuenta de WhatsApp Business mediante el proceso de Embedded Sign-Up de Meta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isVinculado ? (
            <>
              {/* Estado Vinculado */}
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-700 dark:text-green-400">
                  WhatsApp Business Vinculado
                </AlertTitle>
                <AlertDescription className="text-green-600 dark:text-green-300">
                  Tu número está conectado y puedes gestionar conversaciones desde la plataforma.
                </AlertDescription>
              </Alert>

              <div className="rounded-lg border p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Número</p>
                    <p className="text-lg font-semibold">
                      {syncData.display_phone_number || 'No disponible'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cuenta WABA</p>
                    <p className="text-lg font-semibold">
                      {syncData.waba_name || 'No disponible'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estado</p>
                    <Badge variant="default" className="mt-1 bg-green-600">
                      Activo
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Vinculado desde</p>
                    <p className="text-sm">
                      {syncData.vinculado_en
                        ? new Date(syncData.vinculado_en).toLocaleDateString('es-CO', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'No disponible'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sincronizar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDesvincularDialog(true)}
                >
                  <Unlink className="mr-2 h-4 w-4" />
                  Desvincular
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Estado No Vinculado */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>WhatsApp Business No Vinculado</AlertTitle>
                <AlertDescription>
                  Para gestionar conversaciones de WhatsApp desde la plataforma, necesitas vincular
                  tu cuenta de WhatsApp Business.
                </AlertDescription>
              </Alert>

              <div className="rounded-lg border border-dashed p-6 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 font-semibold">Embedded Sign-Up</h3>
                <p className="mt-2 max-w-md mx-auto text-sm text-muted-foreground">
                  El proceso de Embedded Sign-Up te permite vincular tu número de WhatsApp Business
                  de forma segura. Una vez vinculado, podrás ver y responder conversaciones
                  directamente desde esta plataforma.
                </p>
                <Button
                  className="mt-4 gradient-brand"
                  onClick={handleEmbeddedSignup}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquare className="mr-2 h-4 w-4" />
                  )}
                  Vincular WhatsApp Business
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Información Adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Requisitos y Consideraciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                1
              </div>
              <div>
                <p className="font-medium">Cuenta de Meta Business</p>
                <p className="text-sm text-muted-foreground">
                  Necesitas una cuenta de Meta Business verificada para usar la API de WhatsApp Business.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                2
              </div>
              <div>
                <p className="font-medium">Número de Teléfono Dedicado</p>
                <p className="text-sm text-muted-foreground">
                  El número que vincules debe ser exclusivo para WhatsApp Business y no puede estar
                  en uso en la aplicación regular de WhatsApp.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                3
              </div>
              <div>
                <p className="font-medium">Limitaciones de Meta API</p>
                <p className="text-sm text-muted-foreground">
                  Meta no permite transferir conversaciones activas entre números diferentes.
                  Las conversaciones se gestionan desde el número vinculado.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button variant="outline" asChild>
              <a
                href="https://developers.facebook.com/docs/whatsapp/embedded-signup"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver documentación de Meta
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Confirmación para Desvincular */}
      <Dialog open={showDesvincularDialog} onOpenChange={setShowDesvincularDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desvincular WhatsApp Business</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas desvincular tu cuenta de WhatsApp Business? Las
              conversaciones existentes se mantendrán en el historial pero no podrás recibir
              nuevos mensajes hasta volver a vincular.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDesvincularDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDesvincular} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Unlink className="mr-2 h-4 w-4" />
              )}
              Desvincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
