'use client';

import { motion } from 'motion/react';
import { AlertTriangle, Moon, Palette, Shield, Sparkles, Sun, Users, Zap } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Badge } from '@kit/ui/badge';
import { Card } from '@kit/ui/card';
import { Label } from '@kit/ui/label';
import { Separator } from '@kit/ui/separator';
import { Switch } from '@kit/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';

import { configApp } from '~/lib/mock-data';
import { useUserPermissions } from '~/lib/permisos';

import { RolesPermisos } from './roles-permisos';
import { UsuariosTable } from './usuarios-table';

export function AdminPanel() {
  const { theme, setTheme } = useTheme();
  const { tienePermiso, esGerencia, isLoading } = useUserPermissions();

  // Permisos
  const puedeGestionarUsuarios = tienePermiso('usuarios', 'CREAR');
  const puedeVerRoles = esGerencia; // Solo gerencia puede ver roles

  // Si no tiene ningún permiso de admin, mostrar mensaje
  if (!isLoading && !puedeGestionarUsuarios && !puedeVerRoles && !esGerencia) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">Acceso denegado</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          No cuenta con permisos para esta sección.
        </p>
      </div>
    );
  }

  // Determinar tab por defecto basado en permisos
  const defaultTab = puedeGestionarUsuarios ? 'usuarios' : puedeVerRoles ? 'roles' : 'apariencia';

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2">
          <div className="gradient-accent rounded-lg p-2">
            <Palette className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Administración</h2>
            <p className="text-xs text-muted-foreground">
              Configuración del sistema
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid h-9 w-full" style={{ gridTemplateColumns: `repeat(${(puedeGestionarUsuarios ? 1 : 0) + (puedeVerRoles ? 1 : 0) + 1}, 1fr)` }}>
          {puedeGestionarUsuarios && (
            <TabsTrigger value="usuarios" className="text-xs">
              <Users className="mr-1.5 h-3 w-3" />
              Usuarios
            </TabsTrigger>
          )}
          {puedeVerRoles && (
            <TabsTrigger value="roles" className="text-xs">
              <Shield className="mr-1.5 h-3 w-3" />
              Roles
            </TabsTrigger>
          )}
          <TabsTrigger value="apariencia" className="text-xs">
            <Palette className="mr-1.5 h-3 w-3" />
            Apariencia
          </TabsTrigger>
        </TabsList>

        {/* USUARIOS */}
        {puedeGestionarUsuarios && (
          <TabsContent value="usuarios" className="mt-4">
            <UsuariosTable />
          </TabsContent>
        )}

        {/* APARIENCIA */}
        <TabsContent value="apariencia" className="mt-4 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Theme Settings */}
            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Apariencia</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Personaliza el aspecto de la aplicación
                  </p>
                </div>

                <Separator />

                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {theme === 'light' ? (
                      <Sun className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Moon className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <Label htmlFor="dark-mode" className="text-sm">
                        Modo Oscuro
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {theme === 'light'
                          ? 'Cambiar a tema oscuro'
                          : 'Actualmente en modo oscuro'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) =>
                      setTheme(checked ? 'dark' : 'light')
                    }
                  />
                </div>

                <Separator />

                {/* Gradients Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="gradients" className="text-sm">
                          Gradientes
                        </Label>
                        <Badge variant="secondary" className="h-4 text-xs">
                          Marca
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Gradientes de marca activados
                      </p>
                    </div>
                  </div>
                  <Switch id="gradients" checked={true} disabled />
                </div>

                {/* Gradient Preview */}
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 pt-2"
                >
                  <p className="text-xs text-muted-foreground">
                    Estilos de Gradiente
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <div className="gradient-brand h-12 rounded-lg" />
                      <p className="text-center text-xs text-muted-foreground">
                        Marca
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="gradient-accent h-12 rounded-lg" />
                      <p className="text-center text-xs text-muted-foreground">
                        Acento
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </Card>

            {/* Brand Colors */}
            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Colores de Marca</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Paleta oficial de colores
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-12 w-12 flex-shrink-0 rounded-lg border border-border"
                      style={{ backgroundColor: '#00C8CF' }}
                    />
                    <div>
                      <p className="font-mono text-sm">#00C8CF</p>
                      <p className="text-xs text-muted-foreground">
                        Cyan Primario
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className="h-12 w-12 flex-shrink-0 rounded-lg border border-border"
                      style={{ backgroundColor: '#161052' }}
                    />
                    <div>
                      <p className="font-mono text-sm">#161052</p>
                      <p className="text-xs text-muted-foreground">Navy Acento</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className="h-12 w-12 flex-shrink-0 rounded-lg border border-border"
                      style={{ backgroundColor: '#00E5ED' }}
                    />
                    <div>
                      <p className="font-mono text-sm">#00E5ED</p>
                      <p className="text-xs text-muted-foreground">Cyan Claro</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* System Info */}
            <Card className="p-4 lg:col-span-2">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Información del Sistema</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Configuración actual de la aplicación
                  </p>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Nombre de la Aplicación
                    </p>
                    <p className="text-sm font-medium">{configApp.nombre}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Versión</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{configApp.version}</p>
                      <Badge variant="outline" className="h-5 gap-1 text-xs">
                        <Zap className="h-3 w-3" />
                        Última
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Email de Soporte
                    </p>
                    <p className="text-sm font-medium">{configApp.emailSoporte}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Eslogan</p>
                  <p className="text-sm">{configApp.tagline}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Descripción</p>
                  <p className="text-sm">{configApp.descripcion}</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ROLES Y PERMISOS */}
        {puedeVerRoles && (
          <TabsContent value="roles" className="mt-4">
            <RolesPermisos />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
