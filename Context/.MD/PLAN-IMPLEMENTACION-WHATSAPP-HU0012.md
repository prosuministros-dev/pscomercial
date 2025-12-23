# PLAN DE IMPLEMENTACION QUIRURGICO - MODULO WHATSAPP (HU-0012)

> **Proyecto**: PS Comercial
> **Fecha**: 2025-12-19
> **Elaborado por**: @business-analyst + @devteam
> **Version**: 1.0

---

## RESUMEN EJECUTIVO

### Estado Actual del Modulo

| Componente | Estado | Completado |
|------------|--------|------------|
| UI Panel de Conversaciones | Implementado (Mock) | 40% |
| Interfaces TypeScript | Definidas | 100% |
| Mock Data | Implementado | 100% |
| Navegacion/Rutas | Configurado | 100% |
| Base de Datos WhatsApp | **NO EXISTE** | 0% |
| API/Webhooks | **NO EXISTE** | 0% |
| Integracion Meta API | **NO EXISTE** | 0% |
| Bot Conversacional | **NO EXISTE** | 0% |
| Embedded Sign-Up | **NO EXISTE** | 0% |
| Crear Lead desde Chat | **NO EXISTE** | 0% |

**Progreso Total Estimado**: ~15%

---

## MATRIZ DE TRAZABILIDAD COMPLETA HU-0012

### Alcance Documentado vs Plan de Implementacion

| # | Requerimiento HU-0012 | Seccion Plan | Fase | Archivo(s) |
|---|----------------------|--------------|------|------------|
| 1 | Recepcion de mensajes entrantes por WhatsApp | Fase 4 - Webhook | 4 | `whatsapp-webhook/index.ts` |
| 2 | Menu inicial interactivo (1-3) | Fase 4 - Bot Engine | 4 | `bot-flows.ts`, `templates.ts` |
| 3 | Clasificacion automatica de intencion | Fase 4.3 | 4 | `bot-engine.ts` |
| 4 | Captura guiada de datos faltantes | Fase 4.2 - Flujos | 4 | `bot-flows.ts` |
| 5 | Manejo de adjuntos (fotos, documentos) | Fase 4 + 6.4 | 4, 6 | `message-handler.ts`, `visor-adjuntos.tsx` |
| 6 | **Embedded Sign-Up sincronizar numero asesor** | **Fase 5.4 + NUEVA 5.5** | **5** | **`embedded-signup.tsx`, `whatsapp_asesor_sync`** |
| 7 | Visualizacion y gestion de conversaciones | Fase 6.1 | 6 | `whatsapp-panel.tsx` |
| 8 | Responder desde plataforma o WhatsApp Business | Fase 5.3 + 6.1 | 5, 6 | `meta-api.ts`, `whatsapp-panel.tsx` |
| 9 | Creacion de Lead desde conversacion | Fase 6.2 | 6 | `crear-lead-desde-chat-modal.tsx` |
| 10 | Adjuntar historial conversacional al Lead | Fase 6.2 | 6 | `whatsapp.actions.ts` |
| 11 | Asignacion automatica o manual de conversaciones | Fase 3.2 + 6 | 3, 6 | `use-whatsapp.ts`, `whatsapp.actions.ts` |
| 12 | Plantillas de comunicacion segun escenario | Fase 4.4 | 4 | `templates.ts`, BD `whatsapp_templates` |
| 13 | Mensaje final con numero de caso | Fase 4.4 | 4 | `templates.ts` (Plantilla I) |

### Workflows Documentados vs Plan

| Workflow HU-0012 | Implementado En |
|------------------|-----------------|
| Workflow general (Usuario escribe → Bot clasifica → Menu → Flujo) | Fase 4.1, 4.2 |
| **Embedded Sign-Up (Asesor vincula numero)** | **Fase 5.4, 5.5 (EXPANDIDA)** |
| WhatsApp → Lead (Crear lead desde chat) | Fase 6.2 |
| Opcion 1 - Cotizacion | Fase 4.4 |
| Opcion 2 - Seguimiento Pedido | Fase 4.4 |
| Opcion 3 - Otros Motivos | Fase 4.4 |

### Casos de Uso / Escenarios vs Plan

| Escenario HU-0012 | Donde se Implementa |
|-------------------|---------------------|
| 1. Usuario quiere soporte inmediato | Fase 4.3 - Clasificacion palabras clave |
| 2. Usuario quiere informacion | Fase 4.3 - Clasificacion palabras clave |
| 3. Usuario escribe sin estructura | Fase 4.4 - Plantilla F |
| 4. Usuario envia solo archivo | Fase 4 - message-handler + Plantilla F |
| 5. Usuario escribe varias veces (duplicados) | Fase 4 - Bot engine + Plantilla H |
| **6. Embedded Sign-Up** | **Fase 5.4, 5.5 - UI Configuracion** |
| 7. Creacion Lead desde conversacion | Fase 6.2 |
| 8. Hyperlink a numero personal | Fase 4.4 - Plantilla K |

### Flujos de Trabajo vs Plan

| Flujo HU-0012 | Donde se Implementa |
|---------------|---------------------|
| A. Usuario nuevo | Fase 4.4 - Plantilla A |
| B. Cliente existente | Fase 4.4 - Plantilla B |
| C. Fotos/audios/textos revueltos | Fase 4 - message-handler |
| D. Usuario no responde | Fase 4.4 - Plantilla G + Cron job |

### Plantillas (A-K) vs Plan

| Plantilla | Descripcion | Fase |
|-----------|-------------|------|
| A | Usuario nuevo (saludo inicial) | 4.4 |
| B | Cliente existente | 4.4 |
| C | Seguimiento de pedido | 4.4 |
| D | Cotizacion/informacion | 4.4 |
| E | Otro motivo | 4.4 |
| F | Mensajes desordenados | 4.4 |
| G | Usuario no responde (recordatorios) | 4.4 |
| H | Duplicados | 4.4 |
| I | Confirmacion final | 4.4 |
| **J** | **Embedded Sign-Up** | **4.4 + 5.5** |
| K | Limitacion Meta (hyperlink) | 4.4 |

---

## ANALISIS GAP: HU-0012 vs IMPLEMENTACION ACTUAL

### Criterios de Aceptacion HU-0012

| # | Criterio | Estado | Gap |
|---|----------|--------|-----|
| CA-1 | Menu inicial con opciones 1, 2, 3 | Pendiente | Falta bot + flujo |
| CA-2 | Clasificacion por palabras clave | Pendiente | Falta NLP/clasificador |
| CA-3 | Embedded sign-up del numero asesor | Pendiente | Falta integracion Meta |
| CA-4 | Conversaciones sincronizadas en plataforma | Pendiente | Falta webhook + BD |
| CA-5 | Boton "Crear Lead" en conversacion | Pendiente | Falta UI + logica |
| CA-6 | Lead conserva mensajes y adjuntos | Pendiente | Falta BD + relaciones |
| CA-7 | Manejo inactividad, duplicados, adjuntos | Pendiente | Falta logica bot |
| CA-8 | Seguimiento pedido → pedir comercial | Pendiente | Falta flujo bot |
| CA-9 | Otro motivo → identificar necesidad | Pendiente | Falta flujo bot |
| CA-10 | Notificacion interna al comercial | Pendiente | Falta sistema notif. |
| CA-11 | Enviar hyperlink cuando aplica | Pendiente | Falta logica |
| CA-12 | Bitacora de todas las acciones | Pendiente | Falta tablas log |

---

## ARQUITECTURA PROPUESTA

### Diagrama de Componentes

```
                         +------------------+
                         |   META CLOUD     |
                         |   WHATSAPP API   |
                         +--------+---------+
                                  |
                          Webhook (POST)
                                  |
                                  v
+-------------------+    +------------------+    +------------------+
|   EDGE FUNCTION   |<-->|    SUPABASE      |<-->|   NEXT.JS APP    |
|   whatsapp-webhook|    |    DATABASE      |    |   Frontend       |
+-------------------+    +------------------+    +------------------+
         |                       |                       |
         v                       v                       v
+-------------------+    +------------------+    +------------------+
|   BOT ENGINE      |    |   TABLAS:        |    |   UI:            |
|   (Clasificacion) |    |   - conversaciones|   |   - WhatsAppPanel|
|   (Flujos)        |    |   - mensajes     |    |   - Crear Lead   |
|   (Templates)     |    |   - templates    |    |   - Notificaciones|
+-------------------+    |   - asesor_sync  |    +------------------+
                         |   - webhook_log  |
                         +------------------+
```

### Flujo de Datos

```
1. Cliente envia mensaje WhatsApp
         |
         v
2. Meta API envia POST a Edge Function (webhook)
         |
         v
3. Edge Function:
   - Valida firma webhook
   - Guarda mensaje en BD
   - Identifica conversacion o crea nueva
   - Ejecuta logica del bot
   - Responde via Meta API
         |
         v
4. Frontend (Realtime):
   - Recibe actualizacion via Supabase Realtime
   - Actualiza lista conversaciones
   - Muestra mensajes nuevos
         |
         v
5. Asesor:
   - Ve conversacion en plataforma
   - Puede responder desde plataforma
   - Puede crear Lead desde conversacion
```

---

## SUPABASE REALTIME - ACTUALIZACION EN TIEMPO REAL

### Arquitectura Realtime

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE REALTIME                                │
│                                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────┐   │
│  │   POSTGRES   │───►│   REALTIME   │───►│   WEBSOCKET BROADCAST    │   │
│  │   CHANGES    │    │   SERVER     │    │   A TODOS LOS CLIENTES   │   │
│  └──────────────┘    └──────────────┘    └──────────────────────────┘   │
│         │                                           │                    │
│         │                                           │                    │
│  INSERT/UPDATE                               PUSH EVENT                  │
│  en tablas:                                  con payload                 │
│  - whatsapp_mensajes                                                     │
│  - whatsapp_conversaciones                                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                                 │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  useEffect(() => {                                                │   │
│  │    const channel = supabase                                       │   │
│  │      .channel('whatsapp-realtime')                                │   │
│  │      .on('postgres_changes', {                                    │   │
│  │        event: '*',                                                │   │
│  │        schema: 'public',                                          │   │
│  │        table: 'whatsapp_mensajes'                                 │   │
│  │      }, handleNewMessage)                                         │   │
│  │      .subscribe();                                                │   │
│  │                                                                   │   │
│  │    return () => supabase.removeChannel(channel);                  │   │
│  │  }, []);                                                          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Configuracion Realtime en BD

```sql
-- HABILITAR REALTIME EN TABLAS WHATSAPP
-- Esto permite que Supabase notifique cambios a los clientes conectados

-- 1. Habilitar publicacion para whatsapp_mensajes
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_mensajes;

-- 2. Habilitar publicacion para whatsapp_conversaciones
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_conversaciones;

-- 3. (Opcional) Habilitar para notificaciones
ALTER PUBLICATION supabase_realtime ADD TABLE public.notificaciones;
```

### Hook: useWhatsAppRealtime

**Archivo**: `apps/web/lib/whatsapp/hooks/use-whatsapp-realtime.ts`

```typescript
'use client';

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface MensajePayload {
  id: string;
  conversacion_id: string;
  direccion: 'ENTRANTE' | 'SALIENTE';
  remitente: 'BOT' | 'USUARIO' | 'ASESOR';
  contenido: string;
  tipo: string;
  creado_en: string;
}

interface ConversacionPayload {
  id: string;
  telefono_cliente: string;
  estado: string;
  ultimo_mensaje: string;
  mensajes_no_leidos: number;
}

export function useWhatsAppRealtime(organizationId: string) {
  const queryClient = useQueryClient();

  // Handler para nuevos mensajes
  const handleNewMessage = useCallback(
    (payload: RealtimePostgresChangesPayload<MensajePayload>) => {
      console.log('📩 Nuevo mensaje recibido:', payload);

      if (payload.eventType === 'INSERT') {
        const nuevoMensaje = payload.new;

        // 1. Invalidar query de mensajes de esa conversacion
        queryClient.invalidateQueries({
          queryKey: ['whatsapp', 'mensajes', nuevoMensaje.conversacion_id]
        });

        // 2. Actualizar cache de conversaciones (para ultimo mensaje)
        queryClient.invalidateQueries({
          queryKey: ['whatsapp', 'conversaciones']
        });

        // 3. Si es mensaje entrante, mostrar notificacion toast
        if (nuevoMensaje.direccion === 'ENTRANTE') {
          // Disparar notificacion visual
          window.dispatchEvent(new CustomEvent('whatsapp:nuevo-mensaje', {
            detail: nuevoMensaje
          }));
        }
      }
    },
    [queryClient]
  );

  // Handler para cambios en conversaciones
  const handleConversacionChange = useCallback(
    (payload: RealtimePostgresChangesPayload<ConversacionPayload>) => {
      console.log('💬 Conversacion actualizada:', payload);

      // Invalidar lista de conversaciones
      queryClient.invalidateQueries({
        queryKey: ['whatsapp', 'conversaciones']
      });

      // Si es nueva conversacion, notificar
      if (payload.eventType === 'INSERT') {
        window.dispatchEvent(new CustomEvent('whatsapp:nueva-conversacion', {
          detail: payload.new
        }));
      }
    },
    [queryClient]
  );

  useEffect(() => {
    // Crear canal de Realtime
    const channel: RealtimeChannel = supabase
      .channel(`whatsapp-realtime-${organizationId}`)

      // Suscribirse a cambios en mensajes
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'whatsapp_mensajes',
          filter: `organization_id=eq.${organizationId}`
        },
        handleNewMessage
      )

      // Suscribirse a cambios en conversaciones
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_conversaciones',
          filter: `organization_id=eq.${organizationId}`
        },
        handleConversacionChange
      )

      // Activar suscripcion
      .subscribe((status) => {
        console.log('🔌 Realtime WhatsApp status:', status);
      });

    // Cleanup al desmontar
    return () => {
      console.log('🔌 Desconectando Realtime WhatsApp');
      supabase.removeChannel(channel);
    };
  }, [organizationId, handleNewMessage, handleConversacionChange]);
}
```

### Integracion en WhatsAppPanel

**Modificar**: `apps/web/app/home/whatsapp/_components/whatsapp-panel.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { useWhatsAppRealtime } from '~/lib/whatsapp/hooks/use-whatsapp-realtime';
import { useConversaciones } from '~/lib/whatsapp/hooks/use-whatsapp';

export function WhatsAppPanel() {
  const { data: conversaciones, isLoading } = useConversaciones();

  // ACTIVAR REALTIME - Escucha cambios en BD automaticamente
  useWhatsAppRealtime(organizationId);

  // Listener para notificaciones de nuevos mensajes
  useEffect(() => {
    const handleNuevoMensaje = (event: CustomEvent) => {
      const mensaje = event.detail;
      toast.info(`Nuevo mensaje de ${mensaje.telefono || 'cliente'}`, {
        description: mensaje.contenido.substring(0, 50) + '...',
        action: {
          label: 'Ver',
          onClick: () => setConversacionActiva(mensaje.conversacion_id)
        }
      });
    };

    window.addEventListener('whatsapp:nuevo-mensaje', handleNuevoMensaje as EventListener);
    return () => {
      window.removeEventListener('whatsapp:nuevo-mensaje', handleNuevoMensaje as EventListener);
    };
  }, []);

  // ... resto del componente
}
```

### Optimizacion: Broadcast para Typing Indicator

```typescript
// Para indicador de "escribiendo..." usamos Broadcast (no persiste en BD)

const channel = supabase.channel(`typing-${conversacionId}`);

// Enviar estado "escribiendo"
channel.send({
  type: 'broadcast',
  event: 'typing',
  payload: { userId: currentUser.id, isTyping: true }
});

// Escuchar estado "escribiendo" de otros
channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
  setOtroEscribiendo(payload.isTyping);
});
```

### Entregables Realtime:

- [ ] Publicacion Realtime habilitada en tablas
- [ ] Hook `useWhatsAppRealtime` implementado
- [ ] Integracion en `WhatsAppPanel`
- [ ] Notificaciones toast para mensajes entrantes
- [ ] Indicador de "escribiendo" (opcional)
- [ ] Reconexion automatica en caso de desconexion

---

## FLUJO COMPLETO DEL BOT - DIAGRAMA DE ESTADOS Y MENSAJES

### Maquina de Estados del Bot

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ESTADOS DE CONVERSACION DEL BOT                           │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │   INICIO     │
                              │ (Msg recibido)│
                              └──────┬───────┘
                                     │
                              ┌──────▼───────┐
                              │ Es contacto  │
                              │   nuevo?     │
                              └──────┬───────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │ SI             │                │ NO
                    ▼                │                ▼
          ┌─────────────────┐       │      ┌─────────────────┐
          │ CAPTURA_NOMBRE  │       │      │ MENU_PRINCIPAL  │
          │ (Pedir nombre)  │       │      │ (Mostrar menu)  │
          └────────┬────────┘       │      └────────┬────────┘
                   │                │               │
                   ▼                │               │
          ┌─────────────────┐       │               │
          │ CAPTURA_ID      │       │               │
          │ (Pedir cedula)  │       │               │
          └────────┬────────┘       │               │
                   │                │               │
                   ▼                │               │
          ┌─────────────────┐       │               │
          │ MENU_PRINCIPAL  │◄──────┘               │
          └────────┬────────┘                       │
                   │                                │
                   ◄────────────────────────────────┘
                   │
        ┌──────────┼──────────┬──────────┐
        │          │          │          │
        ▼          ▼          ▼          ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
   │OPCION_1 │ │OPCION_2 │ │OPCION_3 │ │CLASIFICAR│
   │Cotizacion│ │Pedido   │ │Otro     │ │por texto│
   └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘
        │          │          │          │
        ▼          ▼          ▼          │
   ┌─────────┐ ┌─────────┐ ┌─────────┐   │
   │FLUJO_COT│ │FLUJO_PED│ │FLUJO_OTR│   │
   └────┬────┘ └────┬────┘ └────┬────┘   │
        │          │          │          │
        └──────────┴──────────┴──────────┘
                   │
                   ▼
          ┌─────────────────┐
          │ CONFIRMACION    │
          │ (Caso creado)   │
          └────────┬────────┘
                   │
                   ▼
          ┌─────────────────┐
          │ CERRADA         │
          └─────────────────┘
```

### Flujo Detallado con Mensajes y Acciones

#### ESTADO: INICIO (Mensaje Recibido)

```typescript
// Cuando llega un mensaje nuevo
async function handleIncomingMessage(mensaje: MensajeEntrante) {
  // 1. Buscar o crear conversacion
  const conversacion = await getOrCreateConversacion(mensaje.telefono);

  // 2. Guardar mensaje en BD
  await guardarMensaje({
    conversacion_id: conversacion.id,
    direccion: 'ENTRANTE',
    remitente: 'USUARIO',
    contenido: mensaje.texto,
    tipo: mensaje.tipo, // texto, imagen, documento
    adjuntos: mensaje.adjuntos
  });

  // 3. Determinar siguiente accion segun estado de conversacion
  return procesarSegunEstado(conversacion, mensaje);
}
```

---

#### ESTADO: CAPTURA_NOMBRE (Usuario Nuevo)

**Trigger**: Primera vez que el telefono contacta

**Mensaje Bot**:
```
👋 ¡Hola! Bienvenido a PROSUMINISTROS 🧰
Tu aliado en hardware, software, accesorios y servicios de infraestructura IT.

¿Cuál es tu nombre completo?
```

**Accion Automatica**:
```typescript
// Guardar estado de conversacion
await updateConversacion(conversacionId, {
  estado_bot: 'CAPTURA_NOMBRE',
  datos_capturados: {}
});
```

**Siguiente Estado**: CAPTURA_ID (cuando usuario responde con nombre)

---

#### ESTADO: CAPTURA_ID

**Trigger**: Usuario proporciono nombre

**Mensaje Bot**:
```
Perfecto, gracias {nombre}. ¿Podrías indicarme tu número de identificación o documento?
```

**Accion Automatica**:
```typescript
await updateConversacion(conversacionId, {
  estado_bot: 'CAPTURA_ID',
  datos_capturados: { nombre: mensajeUsuario }
});
```

**Siguiente Estado**: MENU_PRINCIPAL (cuando usuario responde con ID)

---

#### ESTADO: MENU_PRINCIPAL

**Trigger**:
- Usuario existente escribe
- Usuario nuevo completo registro

**Mensaje Bot**:
```
Gracias. Para poder atenderte mejor, por favor cuéntame qué deseas hacer hoy:

1️⃣ Solicitar una cotización
2️⃣ Consulta el estado de tu pedido
3️⃣ Otro motivo (soporte técnico, documentación, facturación o área financiera)

Estoy aquí para apoyarte. 🚀
```

**Logica de Decision**:
```typescript
function procesarRespuestaMenu(mensaje: string): EstadoBot {
  const texto = mensaje.toLowerCase().trim();

  // Respuesta directa con numero
  if (texto === '1' || texto.includes('cotizacion') || texto.includes('precio')) {
    return 'FLUJO_COTIZACION';
  }
  if (texto === '2' || texto.includes('pedido') || texto.includes('seguimiento')) {
    return 'FLUJO_PEDIDO';
  }
  if (texto === '3' || texto.includes('soporte') || texto.includes('ayuda')) {
    return 'FLUJO_OTRO';
  }

  // Clasificacion por palabras clave
  return clasificarPorPalabrasClave(texto);
}
```

---

#### ESTADO: FLUJO_COTIZACION (Opcion 1)

**Substados**:
1. `COT_PRODUCTO` - Preguntar producto
2. `COT_TIPO` - Cotizacion formal o info general
3. `COT_ADJUNTOS` - Recibir archivos si hay
4. `COT_CONFIRMAR` - Crear caso

**Mensajes del Flujo**:

```typescript
const FLUJO_COTIZACION = {
  COT_PRODUCTO: {
    mensaje: "Claro, con gusto te ayudo con información. ¿Sobre qué producto deseas recibir detalle?",
    siguiente: 'COT_TIPO'
  },
  COT_TIPO: {
    mensaje: "¿Deseas una cotización formal o solo información general?",
    opciones: ['Cotización formal', 'Información general'],
    siguiente: 'COT_CONFIRMAR'
  },
  COT_CONFIRMAR: {
    accion: async (conversacion) => {
      // 1. Crear caso/solicitud en sistema
      const caso = await crearCasoSistema({
        tipo: 'COTIZACION',
        cliente_telefono: conversacion.telefono_cliente,
        cliente_nombre: conversacion.datos_capturados.nombre,
        producto: conversacion.datos_capturados.producto,
        adjuntos: conversacion.adjuntos_temporales
      });

      // 2. Notificar a asesor asignado
      await notificarAsesor(conversacion.asesor_asignado_id, {
        tipo: 'NUEVA_SOLICITUD_COTIZACION',
        caso_id: caso.id
      });

      return caso.numero;
    },
    mensaje: (numeroCaso) =>
      `Perfecto. He registrado tu solicitud con el número #${numeroCaso}. Un asesor te enviará la información.`
  }
};
```

---

#### ESTADO: FLUJO_PEDIDO (Opcion 2)

**Substados**:
1. `PED_COMERCIAL` - Preguntar nombre del comercial
2. `PED_BUSCAR` - Buscar comercial en BD
3. `PED_NOTIFICAR` - Notificar al comercial
4. `PED_CONFIRMAR` - Confirmar al usuario

**Mensajes del Flujo**:

```typescript
const FLUJO_PEDIDO = {
  PED_COMERCIAL: {
    mensaje: "Para ayudarte mejor, ¿puedes decirme qué comercial te atendió cuando realizaste este pedido?",
    siguiente: 'PED_BUSCAR'
  },
  PED_BUSCAR: {
    accion: async (nombreComercial) => {
      // Buscar comercial en BD por nombre (fuzzy match)
      const comercial = await buscarComercialPorNombre(nombreComercial);

      if (!comercial) {
        return {
          encontrado: false,
          mensaje: "No encontré un comercial con ese nombre. ¿Puedes verificar el nombre o escribirlo de otra forma?"
        };
      }

      return { encontrado: true, comercial };
    },
    siguiente: 'PED_NOTIFICAR'
  },
  PED_NOTIFICAR: {
    accion: async (conversacion, comercial) => {
      // 1. Crear notificacion interna para el comercial
      await crearNotificacion({
        usuario_id: comercial.usuario_id,
        tipo: 'SEGUIMIENTO_PEDIDO_WHATSAPP',
        titulo: `Cliente pregunta por pedido`,
        mensaje: `${conversacion.datos_capturados.nombre} (${conversacion.telefono_cliente}) consulta estado de su pedido.`,
        referencia_tipo: 'conversacion',
        referencia_id: conversacion.id
      });

      // 2. Asignar conversacion al comercial
      await updateConversacion(conversacion.id, {
        asesor_asignado_id: comercial.usuario_id
      });

      return comercial;
    },
    mensaje: (comercial) =>
      `Perfecto 😊. Ya notifiqué a ${comercial.nombre} sobre tu consulta. Pronto se comunicará contigo.`
  }
};
```

---

#### ESTADO: FLUJO_OTRO (Opcion 3)

**Substados**:
1. `OTRO_IDENTIFICAR` - Identificar necesidad especifica
2. `OTRO_CLASIFICAR` - Clasificar area (soporte, documentos, financiera)
3. `OTRO_COMERCIAL` - Preguntar comercial
4. `OTRO_NOTIFICAR` - Notificar area correspondiente

**Mensajes del Flujo**:

```typescript
const FLUJO_OTRO = {
  OTRO_IDENTIFICAR: {
    mensaje: "Para ayudarte mejor, ¿puedes decirme qué proceso necesitas realizar?",
    siguiente: 'OTRO_CLASIFICAR'
  },
  OTRO_CLASIFICAR: {
    accion: async (respuesta) => {
      const texto = respuesta.toLowerCase();

      // Clasificar por palabras clave
      if (texto.includes('soporte') || texto.includes('dañ') || texto.includes('fallo')) {
        return { area: 'SOPORTE', siguiente: 'OTRO_COMERCIAL' };
      }
      if (texto.includes('factura') || texto.includes('pago') || texto.includes('credito')) {
        return { area: 'FINANCIERA', siguiente: 'OTRO_NOTIFICAR' };
      }
      if (texto.includes('documento') || texto.includes('certificado')) {
        return { area: 'DOCUMENTOS', siguiente: 'OTRO_COMERCIAL' };
      }

      return { area: 'GENERAL', siguiente: 'OTRO_COMERCIAL' };
    }
  },
  OTRO_COMERCIAL: {
    mensaje: "¿Puedes decirme qué comercial te ha atendido anteriormente?",
    siguiente: 'OTRO_NOTIFICAR'
  },
  OTRO_NOTIFICAR: {
    accion: async (conversacion, area, comercial) => {
      // Crear caso dirigido al area correcta
      const caso = await crearCasoSistema({
        tipo: area,
        cliente_telefono: conversacion.telefono_cliente,
        cliente_nombre: conversacion.datos_capturados.nombre,
        descripcion: conversacion.datos_capturados.necesidad,
        comercial_asignado: comercial?.usuario_id
      });

      // Notificar
      await notificarArea(area, caso);

      return caso;
    },
    mensaje: (comercial) =>
      `Perfecto 😊. Ya notifiqué a ${comercial?.nombre || 'nuestro equipo'} sobre tu consulta. Pronto se comunicará contigo.`
  }
};
```

---

#### ESTADO: MANEJO_ADJUNTOS

**Trigger**: Usuario envia imagen/documento sin contexto

**Mensaje Bot**:
```
Por favor indícame qué necesitas con esa imagen/documento.
```

**Accion Automatica**:
```typescript
async function handleAdjuntoSinContexto(conversacion, adjunto) {
  // 1. Guardar adjunto temporalmente
  await guardarAdjuntoTemporal(conversacion.id, adjunto);

  // 2. Continuar flujo actual, pidiendo contexto
  await enviarMensaje(conversacion.telefono_cliente,
    "Por favor indícame qué necesitas con esa imagen/documento."
  );

  // 3. El adjunto se vinculara al caso cuando se cree
}
```

---

#### ESTADO: MANEJO_INACTIVIDAD

**Trigger**: Usuario no responde en X minutos

**Configuracion**:
```typescript
const CONFIG_INACTIVIDAD = {
  RECORDATORIO_1: 5 * 60 * 1000,  // 5 minutos
  RECORDATORIO_2: 15 * 60 * 1000, // 15 minutos
  CIERRE_AUTO: 60 * 60 * 1000     // 1 hora
};
```

**Mensajes**:

```typescript
const MENSAJES_INACTIVIDAD = {
  RECORDATORIO_1: "¿Sigues ahí? 😊 Solo necesito tu respuesta anterior para continuar.",
  RECORDATORIO_2: "Si necesitas más tiempo, no te preocupes. Continuaré esperando tu información.",
  CIERRE: "No recibimos respuesta, por lo que la conversación se ha cerrado. Si necesitas ayuda, puedes escribirnos de nuevo cuando quieras."
};
```

**Cron Job / Scheduled Function**:
```typescript
// Edge Function programada cada 5 minutos
async function checkInactiveConversations() {
  const ahora = Date.now();

  // Buscar conversaciones activas sin respuesta
  const conversaciones = await getConversacionesActivas();

  for (const conv of conversaciones) {
    const tiempoInactivo = ahora - new Date(conv.ultimo_mensaje_usuario_en).getTime();

    if (tiempoInactivo > CONFIG_INACTIVIDAD.CIERRE_AUTO) {
      // Cerrar conversacion
      await cerrarConversacion(conv.id, 'INCOMPLETA');
      await enviarMensaje(conv.telefono_cliente, MENSAJES_INACTIVIDAD.CIERRE);
    }
    else if (tiempoInactivo > CONFIG_INACTIVIDAD.RECORDATORIO_2 && !conv.recordatorio_2_enviado) {
      await enviarMensaje(conv.telefono_cliente, MENSAJES_INACTIVIDAD.RECORDATORIO_2);
      await updateConversacion(conv.id, { recordatorio_2_enviado: true });
    }
    else if (tiempoInactivo > CONFIG_INACTIVIDAD.RECORDATORIO_1 && !conv.recordatorio_1_enviado) {
      await enviarMensaje(conv.telefono_cliente, MENSAJES_INACTIVIDAD.RECORDATORIO_1);
      await updateConversacion(conv.id, { recordatorio_1_enviado: true });
    }
  }
}
```

---

#### ESTADO: MANEJO_DUPLICADOS

**Trigger**: Usuario escribe sobre mismo tema dentro de ventana de tiempo

**Logica**:
```typescript
async function checkDuplicado(conversacion, mensaje) {
  // Buscar casos abiertos del mismo telefono en ultimas 24 horas
  const casosRecientes = await getCasosRecientes(conversacion.telefono_cliente, 24);

  if (casosRecientes.length > 0) {
    const casoActivo = casosRecientes[0];

    await enviarMensaje(conversacion.telefono_cliente,
      `Ya tenemos un caso abierto para esta misma solicitud ✔️ (Caso #${casoActivo.numero}). ` +
      `Continuaremos usándolo para mantener toda la información organizada.\n\n` +
      `Si deseas agregar más detalles o enviar evidencias, puedes hacerlo aquí mismo.`
    );

    // Agregar mensaje al caso existente
    await agregarMensajeACaso(casoActivo.id, mensaje);

    return true; // Es duplicado
  }

  return false; // No es duplicado
}
```

---

#### ESTADO: CONFIRMACION_FINAL

**Trigger**: Caso/solicitud creado exitosamente

**Mensaje Bot**:
```
¡Perfecto! Tu solicitud fue registrada con el número #[NUMERO_CASO].
Nuestro equipo la revisará y te responderá lo más pronto posible.
```

**Acciones Automaticas**:
```typescript
async function confirmarYCerrar(conversacion, caso) {
  // 1. Enviar mensaje de confirmacion
  await enviarMensaje(conversacion.telefono_cliente,
    `¡Perfecto! Tu solicitud fue registrada con el número #${caso.numero}. ` +
    `Nuestro equipo la revisará y te responderá lo más pronto posible.`
  );

  // 2. Vincular conversacion al caso
  await updateConversacion(conversacion.id, {
    caso_id: caso.id,
    estado_bot: 'CONFIRMADA'
  });

  // 3. Registrar en bitacora
  await registrarBitacora({
    tipo: 'CASO_CREADO_WHATSAPP',
    conversacion_id: conversacion.id,
    caso_id: caso.id,
    datos: {
      tipo_caso: caso.tipo,
      cliente: conversacion.datos_capturados
    }
  });

  // 4. La conversacion permanece ACTIVA para que asesor pueda continuar
}
```

---

### Tabla de Estados del Bot

| Estado | Trigger | Mensaje Bot | Accion Automatica | Siguiente Estado |
|--------|---------|-------------|-------------------|------------------|
| `INICIO` | Mensaje recibido | - | Buscar/crear conv | CAPTURA_NOMBRE o MENU |
| `CAPTURA_NOMBRE` | Usuario nuevo | "¿Cuál es tu nombre?" | Guardar estado | CAPTURA_ID |
| `CAPTURA_ID` | Nombre recibido | "¿Tu identificación?" | Guardar nombre | MENU_PRINCIPAL |
| `MENU_PRINCIPAL` | ID recibido / Existente | Menu 1-2-3 | Guardar ID | Segun respuesta |
| `FLUJO_COTIZACION` | Opcion 1 | Preguntas cotizacion | - | CONFIRMACION |
| `FLUJO_PEDIDO` | Opcion 2 | Pedir comercial | Notificar comercial | CONFIRMACION |
| `FLUJO_OTRO` | Opcion 3 | Identificar necesidad | Clasificar y notificar | CONFIRMACION |
| `ADJUNTO_SIN_CONTEXTO` | Solo archivo | "¿Qué necesitas con esto?" | Guardar temporal | Estado anterior |
| `RECORDATORIO_1` | 5 min sin respuesta | "¿Sigues ahí?" | - | Esperar |
| `RECORDATORIO_2` | 15 min sin respuesta | "Esperando..." | - | Esperar |
| `CIERRE_AUTO` | 1 hora sin respuesta | "Conversación cerrada" | Cerrar conv | CERRADA |
| `CONFIRMACION` | Caso creado | "Solicitud #XXX" | Vincular conv-caso | ACTIVA |
| `CERRADA` | Final | - | - | - |

---

### Clasificacion por Palabras Clave

```typescript
const CLASIFICACION_KEYWORDS = {
  SOPORTE: {
    keywords: ['dañada', 'fallo', 'no funciona', 'soporte', 'ayuda', 'problema', 'error', 'roto', 'defecto'],
    peso: 10,
    area: 'SOPORTE_TECNICO'
  },
  COTIZACION: {
    keywords: ['precio', 'cotización', 'cotizar', 'cuánto cuesta', 'información', 'catálogo', 'producto', 'comprar'],
    peso: 10,
    area: 'COMERCIAL'
  },
  PEDIDO: {
    keywords: ['pedido', 'seguimiento', 'estado', 'dónde está', 'cuándo llega', 'entrega', 'despacho', 'envío'],
    peso: 10,
    area: 'LOGISTICA'
  },
  FINANCIERA: {
    keywords: ['factura', 'pago', 'crédito', 'cartera', 'cuenta', 'cobro', 'mora'],
    peso: 10,
    area: 'FINANCIERA'
  },
  DOCUMENTOS: {
    keywords: ['documento', 'certificado', 'constancia', 'garantía', 'rma'],
    peso: 10,
    area: 'DOCUMENTOS'
  }
};

function clasificarIntencion(texto: string): { tipo: string; confianza: number; area: string } {
  const textoLower = texto.toLowerCase();
  let mejorMatch = { tipo: 'GENERAL', confianza: 0, area: 'COMERCIAL' };

  for (const [tipo, config] of Object.entries(CLASIFICACION_KEYWORDS)) {
    let matchCount = 0;
    for (const keyword of config.keywords) {
      if (textoLower.includes(keyword)) {
        matchCount++;
      }
    }

    const confianza = (matchCount / config.keywords.length) * config.peso;

    if (confianza > mejorMatch.confianza) {
      mejorMatch = { tipo, confianza, area: config.area };
    }
  }

  return mejorMatch;
}
```

---

## FASES DE IMPLEMENTACION

### FASE 1: INFRAESTRUCTURA BASE DE DATOS
**Duracion Estimada**: Sprint 1
**Prioridad**: CRITICA - Bloqueante para todo lo demas

#### 1.1 Migracion SQL: Tablas WhatsApp

**Archivo**: `20241220000010_whatsapp.sql`

```sql
-- TABLAS REQUERIDAS:

-- 1. whatsapp_conversaciones
--    - id, organization_id, telefono_cliente, nombre_contacto
--    - estado (ACTIVA, PAUSADA, CERRADA, INCOMPLETA)
--    - lead_id (FK opcional a leads)
--    - asesor_asignado_id (FK a usuarios)
--    - ultimo_mensaje, ultimo_mensaje_en
--    - mensajes_no_leidos
--    - metadata (JSON para datos adicionales)
--    - timestamps + auditoria

-- 2. whatsapp_mensajes
--    - id, conversacion_id (FK)
--    - direccion (ENTRANTE, SALIENTE)
--    - remitente (BOT, USUARIO, ASESOR)
--    - tipo (TEXTO, IMAGEN, DOCUMENTO, TEMPLATE, AUDIO, VIDEO)
--    - contenido, adjuntos (array URLs)
--    - mensaje_meta_id (ID de Meta para trazabilidad)
--    - leido, leido_en
--    - timestamps

-- 3. whatsapp_templates
--    - id, organization_id
--    - nombre, categoria
--    - contenido, variables
--    - estado_meta (APROBADO, PENDIENTE, RECHAZADO)
--    - activo
--    - timestamps

-- 4. whatsapp_asesor_sync (Embedded Sign-Up)
--    - id, usuario_id (FK), organization_id
--    - waba_id (WhatsApp Business Account ID)
--    - phone_number_id (Meta)
--    - display_phone_number
--    - estado (ACTIVO, DESVINCULADO)
--    - token_acceso (encriptado)
--    - timestamps

-- 5. whatsapp_webhook_log (Bitacora)
--    - id, organization_id
--    - tipo_evento
--    - payload (JSONB)
--    - procesado, error
--    - timestamps
```

#### 1.2 Indices y RLS

```sql
-- Indices para performance
CREATE INDEX idx_wa_conv_telefono ON whatsapp_conversaciones(telefono_cliente);
CREATE INDEX idx_wa_conv_estado ON whatsapp_conversaciones(estado);
CREATE INDEX idx_wa_conv_asesor ON whatsapp_conversaciones(asesor_asignado_id);
CREATE INDEX idx_wa_msg_conv ON whatsapp_mensajes(conversacion_id);
CREATE INDEX idx_wa_msg_fecha ON whatsapp_mensajes(creado_en DESC);

-- RLS siguiendo convencion global con organization_id
-- Ver GLOBAL-CONVENTIONS.md para patron estandar
```

#### Entregables Fase 1:
- [ ] Archivo migracion SQL completo
- [ ] RLS policies configuradas
- [ ] Indices optimizados
- [ ] Types TypeScript generados
- [ ] Documentacion de tablas

---

### FASE 2: TIPOS E INTERFACES BACKEND
**Duracion Estimada**: 2-3 dias
**Prioridad**: ALTA

#### 2.1 Actualizar database.types.ts

Despues de aplicar migracion, regenerar tipos:
```bash
pnpm supabase gen types typescript --project-id zsauumglbhindsplazpk > database.types.ts
```

#### 2.2 Schemas Zod para WhatsApp

**Archivo**: `apps/web/lib/whatsapp/schemas/whatsapp.schema.ts`

```typescript
// Enums
export const ConversacionEstadoEnum = z.enum([
  'ACTIVA', 'PAUSADA', 'CERRADA', 'INCOMPLETA'
]);

export const MensajeDireccionEnum = z.enum(['ENTRANTE', 'SALIENTE']);
export const MensajeRemitenteEnum = z.enum(['BOT', 'USUARIO', 'ASESOR']);
export const MensajeTipoEnum = z.enum([
  'TEXTO', 'IMAGEN', 'DOCUMENTO', 'TEMPLATE', 'AUDIO', 'VIDEO'
]);

// Schemas principales
export const ConversacionSchema = z.object({...});
export const MensajeSchema = z.object({...});
export const TemplateSchema = z.object({...});
export const CreateLeadFromChatSchema = z.object({...});
```

#### Entregables Fase 2:
- [ ] Types actualizados
- [ ] Schemas Zod definidos
- [ ] Interfaces exportadas

---

### FASE 3: API Y SERVICIOS
**Duracion Estimada**: Sprint 1-2
**Prioridad**: ALTA

#### 3.1 Estructura de Archivos

```
apps/web/lib/whatsapp/
├── schemas/
│   └── whatsapp.schema.ts
├── hooks/
│   └── use-whatsapp.ts
├── queries/
│   └── whatsapp.api.ts
├── actions/
│   └── whatsapp.actions.ts
├── services/
│   ├── bot-engine.ts        # Logica del bot
│   ├── meta-api.ts          # Cliente Meta API
│   └── message-handler.ts   # Procesador mensajes
└── index.ts
```

#### 3.2 Hooks React Query

**Archivo**: `use-whatsapp.ts`

```typescript
// Hooks necesarios:
- useConversaciones(filters?)     // Lista con filtros
- useConversacion(id)             // Detalle conversacion
- useMensajes(conversacionId)     // Mensajes paginados
- useTemplates()                  // Templates disponibles
- useAsesoresSincronizados()      // Asesores con embedded sign-up

// Mutations:
- useSendMessage()                // Enviar mensaje
- useSendTemplate()               // Enviar template
- useCreateLeadFromChat()         // Crear lead desde conversacion
- useUpdateConversacionStatus()   // Cambiar estado
- useAssignConversacion()         // Asignar a asesor
```

#### 3.3 Server Actions

**Archivo**: `whatsapp.actions.ts`

```typescript
'use server';

export async function sendMessageAction(data, user) {...}
export async function sendTemplateAction(data, user) {...}
export async function createLeadFromChatAction(conversacionId, user) {...}
export async function assignConversacionAction(conversacionId, asesorId, user) {...}
export async function closeConversacionAction(conversacionId, user) {...}
```

#### Entregables Fase 3:
- [ ] WhatsAppApi class con metodos CRUD
- [ ] Hooks React Query implementados
- [ ] Server Actions creados
- [ ] Integracion con Supabase Realtime

---

### FASE 4: EDGE FUNCTION - WEBHOOK WHATSAPP
**Duracion Estimada**: Sprint 2
**Prioridad**: CRITICA

#### 4.1 Edge Function Principal

**Archivo**: `supabase/functions/whatsapp-webhook/index.ts`

```typescript
// Responsabilidades:
// 1. Verificacion webhook (GET - challenge)
// 2. Recepcion mensajes (POST)
// 3. Validacion firma Meta
// 4. Procesamiento segun tipo mensaje
// 5. Ejecutar logica bot
// 6. Guardar en BD
// 7. Responder via Meta API
```

#### 4.2 Logica del Bot

**Flujo de Decision**:

```
Mensaje Entrante
       |
       v
+------+-------+
| Es nuevo     |
| contacto?    |
+------+-------+
   |       |
  Si       No
   |       |
   v       v
Mostrar   Continuar
Menu      conversacion
Inicial   activa
   |
   v
+----------+
| Opcion   |
| elegida? |
+----+-----+
     |
  +--+--+--+
  |     |  |
  1     2  3
  |     |  |
  v     v  v
Cotiz  Ped  Otro
```

#### 4.3 Clasificacion de Intencion

```typescript
// Palabras clave por categoria (HU-0012):

const KEYWORDS_COTIZACION = [
  'precio', 'cotizacion', 'cotizar', 'cuanto cuesta',
  'informacion', 'catalogo', 'producto'
];

const KEYWORDS_SOPORTE = [
  'danada', 'fallo', 'no funciona', 'soporte',
  'ayuda', 'problema', 'error'
];

const KEYWORDS_PEDIDO = [
  'pedido', 'seguimiento', 'estado', 'donde esta',
  'cuando llega', 'entrega'
];

function clasificarIntencion(texto: string): TipoIntencion {...}
```

#### 4.4 Plantillas del Bot (HU-0012)

Implementar las 11 plantillas definidas en HU-0012:
- A: Usuario nuevo (saludo inicial)
- B: Cliente existente
- C: Seguimiento pedido
- D: Cotizacion/informacion
- E: Otro motivo
- F: Mensajes desordenados
- G: Usuario no responde (recordatorios)
- H: Duplicados
- I: Confirmacion final
- J: Embedded Sign-Up
- K: Limitacion Meta

#### Entregables Fase 4:
- [ ] Edge Function desplegada
- [ ] Verificacion webhook funcionando
- [ ] Recepcion mensajes OK
- [ ] Bot respondiendo menu inicial
- [ ] Clasificacion por palabras clave
- [ ] Flujos de las 3 opciones
- [ ] Manejo de inactividad
- [ ] Bitacora webhook_log

---

### FASE 5: INTEGRACION META WHATSAPP API
**Duracion Estimada**: Sprint 2
**Prioridad**: CRITICA

#### 5.1 Configuracion Meta Business

**Requisitos previos**:
1. Cuenta Meta Business verificada
2. WhatsApp Business Account (WABA)
3. Numero de telefono registrado
4. App creada en Meta Developers
5. Permisos: `whatsapp_business_messaging`, `whatsapp_business_management`

#### 5.2 Variables de Entorno

```env
# .env.local
META_WHATSAPP_TOKEN=
META_PHONE_NUMBER_ID=
META_WABA_ID=
META_VERIFY_TOKEN=
META_APP_SECRET=
```

#### 5.3 Cliente Meta API

**Archivo**: `services/meta-api.ts`

```typescript
class MetaWhatsAppApi {
  // Enviar mensaje de texto
  async sendTextMessage(to: string, text: string): Promise<...>

  // Enviar mensaje template
  async sendTemplateMessage(to: string, template: string, params: object): Promise<...>

  // Enviar mensaje con botones
  async sendInteractiveMessage(to: string, interactive: object): Promise<...>

  // Marcar como leido
  async markAsRead(messageId: string): Promise<...>

  // Subir media
  async uploadMedia(file: Buffer, mimeType: string): Promise<string>

  // Obtener URL media
  async getMediaUrl(mediaId: string): Promise<string>
}
```

#### 5.4 Embedded Sign-Up Flow

```typescript
// Flujo para vincular numero de asesor:

1. Asesor inicia proceso desde plataforma
2. Se muestra dialogo de Meta (Embedded Sign-Up)
3. Asesor autoriza acceso a su WhatsApp Business
4. Meta retorna token y phone_number_id
5. Guardar en tabla whatsapp_asesor_sync
6. Asesor puede ver sus conversaciones sincronizadas
```

#### 5.5 UI CONFIGURACION EMBEDDED SIGN-UP (USUARIO FINAL)

> **CRITICO**: El asesor debe poder configurar y gestionar su vinculacion directamente desde la plataforma

##### Ubicacion en la Aplicacion

**Ruta**: `/home/settings/whatsapp` o `/home/admin/whatsapp-config`

##### Componentes UI Requeridos

**Archivo**: `apps/web/app/home/settings/whatsapp/page.tsx`

```typescript
// Pagina de configuracion WhatsApp del asesor
export default function WhatsAppSettingsPage() {
  return (
    <PageBody>
      <WhatsAppConfigPanel />
    </PageBody>
  );
}
```

**Archivo**: `apps/web/app/home/settings/whatsapp/_components/whatsapp-config-panel.tsx`

```typescript
'use client';

export function WhatsAppConfigPanel() {
  // Estados:
  // - vinculado: boolean
  // - datosVinculacion: { phone_number, waba_id, display_name }
  // - loading, error

  return (
    <div>
      {/* Seccion 1: Estado de Vinculacion */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Vinculacion WhatsApp Business</CardTitle>
        </CardHeader>
        <CardContent>
          {vinculado ? (
            <VinculacionActiva datos={datosVinculacion} onDesvincular={handleDesvincular} />
          ) : (
            <SinVinculacion onVincular={handleIniciarEmbeddedSignup} />
          )}
        </CardContent>
      </Card>

      {/* Seccion 2: Instrucciones */}
      <Card>
        <CardHeader>
          <CardTitle>Como vincular tu numero</CardTitle>
        </CardHeader>
        <CardContent>
          <ol>
            <li>1. Haz clic en "Vincular WhatsApp Business"</li>
            <li>2. Autoriza el acceso en la ventana de Meta</li>
            <li>3. Selecciona tu numero de WhatsApp Business</li>
            <li>4. Confirma la vinculacion</li>
          </ol>
          <Alert variant="warning">
            <AlertDescription>
              Meta NO permite transferir conversaciones entre numeros.
              Solo podras ver conversaciones de TU numero vinculado.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Seccion 3: Historial de Sincronizacion */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Sincronizacion</CardTitle>
        </CardHeader>
        <CardContent>
          <SyncHistoryTable usuarioId={currentUser.id} />
        </CardContent>
      </Card>
    </div>
  );
}
```

##### Componente: Boton Embedded Sign-Up

**Archivo**: `apps/web/app/home/settings/whatsapp/_components/embedded-signup-button.tsx`

```typescript
'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@kit/ui/button';

interface EmbeddedSignupButtonProps {
  onSuccess: (data: MetaSignupResponse) => void;
  onError: (error: Error) => void;
}

export function EmbeddedSignupButton({ onSuccess, onError }: EmbeddedSignupButtonProps) {
  const fbRef = useRef<any>(null);

  useEffect(() => {
    // Cargar SDK de Facebook
    const loadFacebookSDK = () => {
      window.fbAsyncInit = function() {
        FB.init({
          appId: process.env.NEXT_PUBLIC_META_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        fbRef.current = FB;
      };

      // Cargar script SDK
      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    };

    loadFacebookSDK();
  }, []);

  const handleEmbeddedSignup = () => {
    if (!fbRef.current) {
      onError(new Error('Facebook SDK no cargado'));
      return;
    }

    // Iniciar Embedded Signup
    FB.login((response: any) => {
      if (response.authResponse) {
        // Obtener token de acceso de larga duracion
        const accessToken = response.authResponse.accessToken;

        // Llamar a nuestro backend para completar vinculacion
        fetch('/api/whatsapp/complete-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken })
        })
        .then(res => res.json())
        .then(data => onSuccess(data))
        .catch(err => onError(err));
      } else {
        onError(new Error('Usuario cancelo la autorizacion'));
      }
    }, {
      config_id: process.env.NEXT_PUBLIC_META_CONFIG_ID, // Config de Embedded Signup
      response_type: 'code',
      override_default_response_type: true,
      extras: {
        setup: {
          // Permisos requeridos
          permissions: [
            'whatsapp_business_management',
            'whatsapp_business_messaging'
          ]
        }
      }
    });
  };

  return (
    <Button onClick={handleEmbeddedSignup} className="gradient-brand">
      <MessageSquare className="mr-2 h-4 w-4" />
      Vincular WhatsApp Business
    </Button>
  );
}
```

##### Componente: Estado Vinculado

**Archivo**: `apps/web/app/home/settings/whatsapp/_components/vinculacion-activa.tsx`

```typescript
interface VinculacionActivaProps {
  datos: {
    display_phone_number: string;
    waba_name: string;
    vinculado_en: string;
    estado: 'ACTIVO' | 'ERROR' | 'PENDIENTE';
  };
  onDesvincular: () => void;
}

export function VinculacionActiva({ datos, onDesvincular }: VinculacionActivaProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-green-100 p-2">
          <Check className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <p className="font-medium">WhatsApp Business Vinculado</p>
          <p className="text-sm text-muted-foreground">{datos.display_phone_number}</p>
        </div>
      </div>

      <div className="grid gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Cuenta:</span>
          <span>{datos.waba_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Vinculado:</span>
          <span>{formatDate(datos.vinculado_en)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Estado:</span>
          <Badge variant={datos.estado === 'ACTIVO' ? 'default' : 'destructive'}>
            {datos.estado}
          </Badge>
        </div>
      </div>

      <Separator />

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Verificar Conexion
        </Button>
        <Button variant="destructive" size="sm" onClick={onDesvincular}>
          <Unlink className="mr-2 h-4 w-4" />
          Desvincular
        </Button>
      </div>
    </div>
  );
}
```

##### API Route: Completar Signup

**Archivo**: `apps/web/app/api/whatsapp/complete-signup/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function POST(req: NextRequest) {
  const { accessToken } = await req.json();
  const client = getSupabaseServerClient();

  // 1. Obtener info del usuario actual
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  // 2. Intercambiar token por token de larga duracion
  const longLivedToken = await exchangeForLongLivedToken(accessToken);

  // 3. Obtener info de WABA y phone numbers
  const wabaInfo = await getWABAInfo(longLivedToken);

  // 4. Guardar en BD (encriptando token)
  const { data, error } = await client
    .from('whatsapp_asesor_sync')
    .upsert({
      usuario_id: user.id,
      organization_id: user.user_metadata.organization_id,
      waba_id: wabaInfo.waba_id,
      phone_number_id: wabaInfo.phone_number_id,
      display_phone_number: wabaInfo.display_phone_number,
      waba_name: wabaInfo.name,
      token_acceso: encrypt(longLivedToken), // Encriptar!
      estado: 'ACTIVO',
      vinculado_en: new Date().toISOString()
    }, {
      onConflict: 'usuario_id'
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 5. Registrar en bitacora
  await client.from('whatsapp_webhook_log').insert({
    organization_id: user.user_metadata.organization_id,
    tipo_evento: 'EMBEDDED_SIGNUP_COMPLETADO',
    payload: { usuario_id: user.id, waba_id: wabaInfo.waba_id },
    procesado: true
  });

  return NextResponse.json({ success: true, data });
}
```

##### Server Action: Desvincular

**Archivo**: En `apps/web/lib/whatsapp/actions/whatsapp.actions.ts`

```typescript
export async function desvincularWhatsAppAction(userId: string) {
  const client = getSupabaseServerClient();

  // 1. Marcar como desvinculado (no eliminar para historial)
  const { error } = await client
    .from('whatsapp_asesor_sync')
    .update({
      estado: 'DESVINCULADO',
      desvinculado_en: new Date().toISOString(),
      token_acceso: null // Limpiar token
    })
    .eq('usuario_id', userId);

  if (error) throw error;

  // 2. Registrar en bitacora
  await client.from('whatsapp_webhook_log').insert({
    tipo_evento: 'EMBEDDED_SIGNUP_DESVINCULADO',
    payload: { usuario_id: userId }
  });

  return { success: true };
}
```

##### Esquema BD Actualizado para Embedded Sign-Up

```sql
-- Tabla whatsapp_asesor_sync (EXPANDIDA)
CREATE TABLE public.whatsapp_asesor_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),

  -- Datos de Meta
  waba_id VARCHAR(50) NOT NULL,           -- WhatsApp Business Account ID
  phone_number_id VARCHAR(50) NOT NULL,   -- Phone Number ID de Meta
  display_phone_number VARCHAR(20) NOT NULL, -- Numero visible (+57...)
  waba_name VARCHAR(255),                 -- Nombre de la cuenta WABA

  -- Token (ENCRIPTADO)
  token_acceso TEXT,                      -- Token de larga duracion encriptado

  -- Estado
  estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
    CHECK (estado IN ('ACTIVO', 'DESVINCULADO', 'ERROR', 'PENDIENTE')),

  -- Timestamps
  vinculado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  desvinculado_en TIMESTAMPTZ,
  ultimo_sync TIMESTAMPTZ,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modificado_en TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT whatsapp_asesor_sync_usuario_unique UNIQUE (usuario_id),
  CONSTRAINT whatsapp_asesor_sync_phone_unique UNIQUE (phone_number_id)
);

-- Indices
CREATE INDEX idx_wa_sync_usuario ON whatsapp_asesor_sync(usuario_id);
CREATE INDEX idx_wa_sync_org ON whatsapp_asesor_sync(organization_id);
CREATE INDEX idx_wa_sync_estado ON whatsapp_asesor_sync(estado);
CREATE INDEX idx_wa_sync_phone ON whatsapp_asesor_sync(phone_number_id);

-- RLS
ALTER TABLE whatsapp_asesor_sync ENABLE ROW LEVEL SECURITY;

-- El usuario solo ve su propia vinculacion
CREATE POLICY "users_see_own_sync" ON whatsapp_asesor_sync
  FOR SELECT TO authenticated
  USING (usuario_id = auth.uid());

-- El usuario solo puede modificar su propia vinculacion
CREATE POLICY "users_update_own_sync" ON whatsapp_asesor_sync
  FOR UPDATE TO authenticated
  USING (usuario_id = auth.uid());
```

##### Navegacion: Agregar Ruta Settings

**Modificar**: `apps/web/config/paths.config.ts`

```typescript
settings: {
  // ... existentes
  whatsapp: '/home/settings/whatsapp',
}
```

**Modificar**: `apps/web/config/navigation.config.tsx` (submenu settings)

```typescript
{
  label: 'WhatsApp',
  path: pathsConfig.app.settings.whatsapp,
  Icon: <MessageSquare className={iconClasses} />,
}
```

##### Entregables Adicionales Fase 5.5:

- [ ] Pagina `/home/settings/whatsapp`
- [ ] Componente `WhatsAppConfigPanel`
- [ ] Componente `EmbeddedSignupButton` con SDK Meta
- [ ] Componente `VinculacionActiva` con estado
- [ ] API Route `/api/whatsapp/complete-signup`
- [ ] Server Action `desvincularWhatsAppAction`
- [ ] Tabla BD `whatsapp_asesor_sync` expandida
- [ ] Encriptacion de tokens
- [ ] Navegacion agregada a settings

#### Entregables Fase 5:
- [ ] Cuenta Meta configurada
- [ ] Variables de entorno seteadas
- [ ] Cliente Meta API funcional
- [ ] Envio de mensajes OK
- [ ] Envio de templates OK
- [ ] Embedded Sign-Up implementado
- [ ] Sincronizacion numero asesor

---

### FASE 6: ACTUALIZAR UI FRONTEND
**Duracion Estimada**: Sprint 2-3
**Prioridad**: ALTA

#### 6.1 Refactorizar WhatsAppPanel

**Cambios en**: `whatsapp-panel.tsx`

```typescript
// Reemplazar mock data por datos reales:
- Eliminar import de mock-data
- Usar useConversaciones() hook
- Usar useMensajes(conversacionId)
- Implementar Supabase Realtime para actualizaciones
- Conectar envio mensajes a server action
```

#### 6.2 Nuevo Componente: Crear Lead desde Chat

**Archivo**: `crear-lead-desde-chat-modal.tsx`

```typescript
// Funcionalidad:
- Modal que se abre al hacer click en "Crear Lead"
- Pre-llena campos desde datos de conversacion:
  - nombre_contacto (si disponible)
  - celular_contacto (telefono WhatsApp)
  - canal_origen: 'WHATSAPP'
- Permite al usuario completar campos faltantes
- Al guardar:
  - Crea lead
  - Vincula conversacion_id al lead
  - Copia historial de mensajes como observacion
```

#### 6.3 Panel de Notificaciones Internas

**Archivo**: `notificaciones-whatsapp.tsx`

```typescript
// Segun HU-0012: notificar al comercial indicado
// Mostrar notificaciones cuando:
- Usuario menciona comercial en seguimiento pedido
- Usuario necesita atencion de area especifica
- Conversacion asignada al asesor
```

#### 6.4 Visualizacion de Adjuntos

```typescript
// Soportar visualizacion de:
- Imagenes (preview + lightbox)
- Documentos (icon + descarga)
- Audio (reproductor)
- Video (reproductor)
```

#### Entregables Fase 6:
- [ ] WhatsAppPanel conectado a BD real
- [ ] Realtime funcionando
- [ ] Modal crear lead implementado
- [ ] Vinculacion lead-conversacion
- [ ] Visualizacion adjuntos
- [ ] Sistema notificaciones internas

---

### FASE 7: SISTEMA DE NOTIFICACIONES
**Duracion Estimada**: 3-5 dias
**Prioridad**: MEDIA

#### 7.1 Tabla Notificaciones (si no existe)

```sql
CREATE TABLE public.notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  usuario_id UUID NOT NULL REFERENCES auth.users(id),
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT,
  referencia_tipo VARCHAR(50), -- 'conversacion', 'lead', 'cotizacion'
  referencia_id UUID,
  leida BOOLEAN DEFAULT false,
  leida_en TIMESTAMPTZ,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);
```

#### 7.2 Triggers de Notificacion

```sql
-- Notificar cuando:
-- 1. Conversacion asignada a asesor
-- 2. Usuario menciona comercial en chat
-- 3. Lead creado desde WhatsApp
-- 4. Mensaje nuevo en conversacion asignada
```

#### Entregables Fase 7:
- [ ] Tabla notificaciones creada
- [ ] Triggers configurados
- [ ] UI de notificaciones
- [ ] Badge contador no leidas
- [ ] Centro de notificaciones

---

### FASE 8: TESTING Y QA
**Duracion Estimada**: Sprint 3
**Prioridad**: ALTA

#### 8.1 Tests Unitarios

```typescript
// Archivos de test:
- bot-engine.test.ts      // Clasificacion, flujos
- meta-api.test.ts        // Mock de Meta API
- whatsapp.actions.test.ts // Server actions
```

#### 8.2 Tests de Integracion

```typescript
// Escenarios E2E:
- Usuario nuevo → Menu → Opcion 1 → Crear Lead
- Cliente existente → Seguimiento → Notifica comercial
- Timeout sin respuesta → Recordatorios → Cierre
- Adjuntos + texto → Procesamiento correcto
```

#### 8.3 Casos de Prueba HU-0012

| ID | Escenario | Datos | Resultado Esperado |
|----|-----------|-------|-------------------|
| TC-001 | Menu inicial | Mensaje "Hola" | Bot responde menu 1-2-3 |
| TC-002 | Opcion 1 cotizacion | "1" | Bot inicia flujo cotizacion |
| TC-003 | Palabras clave soporte | "mi equipo esta danado" | Clasifica como soporte |
| TC-004 | Usuario no responde | Sin respuesta 5 min | Recordatorio enviado |
| TC-005 | Crear lead desde chat | Click "Crear Lead" | Modal con datos prellenados |
| TC-006 | Adjunto sin texto | Enviar foto | Bot pide contexto |
| TC-007 | Duplicado | Mismo tema en 10 min | Bot continua caso existente |
| TC-008 | Embedded sign-up | Asesor vincula numero | Sincronizacion OK |

#### Entregables Fase 8:
- [ ] Suite tests unitarios
- [ ] Suite tests E2E
- [ ] Reporte cobertura > 80%
- [ ] Casos de prueba HU-0012 ejecutados
- [ ] Bugs encontrados documentados

---

### FASE 9: DOCUMENTACION Y DEPLOY
**Duracion Estimada**: 3-5 dias
**Prioridad**: MEDIA

#### 9.1 Documentacion Tecnica

- README del modulo WhatsApp
- Guia configuracion Meta API
- Guia embedded sign-up
- Documentacion Edge Functions

#### 9.2 Deploy a Produccion

```bash
# 1. Aplicar migraciones
pnpm supabase db push

# 2. Desplegar Edge Functions
supabase functions deploy whatsapp-webhook

# 3. Configurar webhook en Meta
#    URL: https://zsauumglbhindsplazpk.supabase.co/functions/v1/whatsapp-webhook
#    Verify Token: [META_VERIFY_TOKEN]

# 4. Build y deploy frontend
pnpm build
```

#### Entregables Fase 9:
- [ ] Documentacion completa
- [ ] Migraciones aplicadas en prod
- [ ] Edge Functions desplegadas
- [ ] Webhook configurado en Meta
- [ ] Validacion end-to-end en prod

---

## CRONOGRAMA ESTIMADO

```
Semana 1-2: FASE 1 + FASE 2 (BD + Types)
Semana 2-3: FASE 3 (API + Servicios)
Semana 3-4: FASE 4 (Edge Function + Bot)
Semana 4-5: FASE 5 (Meta API Integration)
Semana 5-6: FASE 6 (UI Frontend)
Semana 6:   FASE 7 (Notificaciones)
Semana 7:   FASE 8 (Testing)
Semana 8:   FASE 9 (Docs + Deploy)
```

**Total Estimado**: 6-8 semanas

---

## DEPENDENCIAS EXTERNAS

| Dependencia | Responsable | Estado | Bloqueante |
|-------------|-------------|--------|------------|
| Cuenta Meta Business verificada | Cliente | Pendiente | Si |
| WhatsApp Business Account | Cliente | Pendiente | Si |
| Numero de telefono | Cliente | Pendiente | Si |
| Credenciales Meta API | Cliente | Pendiente | Si |
| Aprobacion templates en Meta | Cliente | Pendiente | Parcial |

---

## RIESGOS IDENTIFICADOS

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| Demora aprobacion Meta | Alta | Alto | Iniciar tramite ASAP |
| Limitaciones API Meta | Media | Medio | Documentar alternativas |
| Complejidad bot NLP | Media | Medio | Empezar con reglas simples |
| Performance Realtime | Baja | Alto | Optimizar queries, indices |
| Costo Meta API | Baja | Bajo | Monitorear uso |

---

## METRICAS DE EXITO

| Metrica | Objetivo | Medicion |
|---------|----------|----------|
| Tiempo respuesta bot | < 3 seg | Logs |
| % mensajes procesados | > 99% | Webhook log |
| Leads creados desde WA | Tracking | BD |
| Conversiones WA → Lead | > 30% | Analytics |
| Satisfaccion usuario | > 4/5 | Encuesta |

---

## ARCHIVOS A CREAR/MODIFICAR

### Nuevos Archivos

```
apps/web/
├── supabase/
│   └── migrations/
│       └── 20241220000010_whatsapp.sql          # Migracion BD
│
├── lib/whatsapp/
│   ├── schemas/
│   │   └── whatsapp.schema.ts                   # Schemas Zod
│   ├── hooks/
│   │   └── use-whatsapp.ts                      # React Query hooks
│   ├── queries/
│   │   └── whatsapp.api.ts                      # API calls
│   ├── actions/
│   │   └── whatsapp.actions.ts                  # Server actions
│   ├── services/
│   │   ├── bot-engine.ts                        # Logica bot
│   │   ├── meta-api.ts                          # Cliente Meta
│   │   └── message-handler.ts                   # Procesador
│   └── index.ts
│
├── app/home/whatsapp/_components/
│   ├── crear-lead-desde-chat-modal.tsx          # Modal crear lead
│   ├── detalle-conversacion.tsx                 # Panel chat mejorado
│   ├── lista-conversaciones.tsx                 # Lista refactorizada
│   └── visor-adjuntos.tsx                       # Visualizar media
│
├── app/home/settings/whatsapp/                  # NUEVO - Config Embedded Sign-Up
│   ├── page.tsx                                 # Pagina configuracion
│   └── _components/
│       ├── whatsapp-config-panel.tsx            # Panel principal
│       ├── embedded-signup-button.tsx           # Boton con SDK Meta
│       ├── vinculacion-activa.tsx               # Estado vinculado
│       ├── sin-vinculacion.tsx                  # Estado sin vincular
│       └── sync-history-table.tsx               # Historial sync
│
├── app/api/whatsapp/                            # NUEVO - API Routes
│   ├── complete-signup/route.ts                 # Completar embedded signup
│   └── webhook/route.ts                         # Webhook alternativo
│
supabase/
└── functions/
    └── whatsapp-webhook/
        ├── index.ts                              # Entry point
        ├── bot-flows.ts                          # Flujos del bot
        ├── templates.ts                          # Templates mensajes
        └── meta-client.ts                        # Cliente Meta
```

### Archivos a Modificar

```
apps/web/
├── lib/mock-data.ts                             # Eliminar mock WhatsApp
├── app/home/whatsapp/_components/
│   └── whatsapp-panel.tsx                       # Conectar a BD real
├── app/home/leads/_components/
│   └── crear-lead-modal.tsx                     # Soportar WA source
└── config/paths.config.ts                       # Nuevas rutas si aplica
```

---

## CHECKLIST GLOBAL (ANTES DE CADA MERGE)

- [ ] Multi-tenancy: organization_id en todas las tablas
- [ ] RLS: Policies configuradas y probadas
- [ ] Migracion: SQL revisada y aplicada
- [ ] TypeScript: Sin errores de tipos
- [ ] Zod: Schemas validados
- [ ] Tests: Cobertura minima 80%
- [ ] Seguridad: Sin credenciales hardcodeadas
- [ ] Documentacion: Plan-de-Trabajo.md actualizado
- [ ] Performance: Indices optimizados
- [ ] Realtime: Subscripciones funcionando

---

## PROXIMOS PASOS INMEDIATOS

1. **Obtener credenciales Meta** - Coordinar con cliente
2. **Crear migracion SQL** - Tabla conversaciones, mensajes, templates
3. **Generar types** - Actualizar database.types.ts
4. **Implementar schemas Zod** - Validaciones WhatsApp
5. **Crear estructura carpetas** - lib/whatsapp/

---

## VERIFICACION CRITERIOS DE ACEPTACION HU-0012

### Checklist Final de Criterios

| CA# | Criterio de Aceptacion | Fase(s) | Componentes | Verificacion |
|-----|------------------------|---------|-------------|--------------|
| **CA-1** | El menu inicial debe funcionar con opciones 1, 2 y 3 | 4 | `bot-flows.ts`, Plantilla A | Test: Enviar "Hola" → Recibir menu |
| **CA-2** | El bot debe clasificar intencion en base a palabras clave | 4 | `bot-engine.ts` | Test: "mi equipo esta danado" → Soporte |
| **CA-3** | El sistema debe permitir embedded sign-up del numero del asesor | **5.4, 5.5** | `embedded-signup-button.tsx`, `whatsapp_asesor_sync`, API Route | Test: Asesor vincula numero OK |
| **CA-4** | Las conversaciones del numero sincronizado deben verse en plataforma | 5, 6 | `whatsapp-panel.tsx`, Realtime | Test: Mensaje llega → aparece en UI |
| **CA-5** | Debe existir el boton "Crear Lead" en la conversacion | 6 | `crear-lead-desde-chat-modal.tsx` | Test: Click → Modal abre |
| **CA-6** | Toda conversacion convertida en Lead debe conservar mensajes y adjuntos | 6 | `whatsapp.actions.ts`, BD relations | Test: Lead tiene historial y archivos |
| **CA-7** | El bot debe manejar inactividad, duplicados y adjuntos | 4 | `bot-flows.ts`, Plantillas F, G, H | Tests multiples escenarios |
| **CA-8** | Al seleccionar "Seguimiento de pedido" el bot debe pedir el comercial | 4 | `bot-flows.ts`, Plantilla C | Test: Opcion 2 → "que comercial te atendio?" |
| **CA-9** | Al seleccionar "Otro motivo" el bot debe identificar la necesidad | 4 | `bot-flows.ts`, Plantilla E | Test: Opcion 3 → "que proceso necesitas?" |
| **CA-10** | El sistema debe enviar notificacion interna al comercial indicado | 7 | `notificaciones`, triggers | Test: Comercial recibe notif |
| **CA-11** | Se debe poder enviar hyperlink cuando aplica | 4 | Plantilla K, `bot-flows.ts` | Test: Limitacion → hyperlink enviado |
| **CA-12** | Todas las acciones deben quedar en bitacora | 1, 4 | `whatsapp_webhook_log` | Test: Verificar logs en BD |

### Exclusiones Confirmadas (NO en alcance)

Segun HU-0012, los siguientes items **NO** seran implementados:

| Item | Razon |
|------|-------|
| Transferir conversacion entre numeros | Limitacion tecnica Meta API |
| Envio automatico de documentos | Se gestiona como caso manual |
| Integracion sistemas contables | Fase futura |
| Automatizacion diagnosticos tecnicos | Fuera de alcance |

### Tests de Aceptacion por Criterio

#### CA-1: Menu Inicial
```gherkin
Feature: Menu inicial WhatsApp

Scenario: Usuario nuevo escribe mensaje
  Given un usuario escribe "Hola" al WhatsApp
  When el bot procesa el mensaje
  Then el bot responde con saludo de bienvenida
  And muestra opciones 1, 2, 3

Scenario: Usuario selecciona opcion
  Given el usuario ve el menu
  When escribe "1"
  Then el bot inicia flujo de cotizacion
```

#### CA-3: Embedded Sign-Up (CRITICO)
```gherkin
Feature: Embedded Sign-Up configurable por usuario

Scenario: Asesor sin vinculacion accede a configuracion
  Given un asesor sin WhatsApp vinculado
  When accede a /home/settings/whatsapp
  Then ve boton "Vincular WhatsApp Business"
  And ve instrucciones del proceso

Scenario: Asesor completa vinculacion
  Given un asesor hace clic en "Vincular WhatsApp Business"
  When completa el flujo de Meta Embedded Sign-Up
  Then la plataforma guarda su token encriptado
  And muestra estado "ACTIVO"
  And puede ver sus conversaciones

Scenario: Asesor desvincula su numero
  Given un asesor con WhatsApp vinculado
  When hace clic en "Desvincular"
  Then el sistema marca estado como "DESVINCULADO"
  And limpia el token
  And registra en bitacora
```

#### CA-5 + CA-6: Crear Lead desde Chat
```gherkin
Feature: Crear Lead desde conversacion

Scenario: Crear lead con historial
  Given una conversacion activa con datos del cliente
  When el asesor hace clic en "Crear Lead"
  Then se abre modal con campos prellenados
  And el telefono viene del WhatsApp
  And el canal_origen es "WHATSAPP"

Scenario: Lead conserva mensajes
  Given se crea un lead desde conversacion
  When se guarda el lead
  Then el lead tiene referencia a conversacion_id
  And el historial de mensajes es accesible desde el lead
  And los adjuntos estan vinculados
```

---

## RESUMEN FINAL

### Cobertura del Plan vs HU-0012

| Seccion HU-0012 | Cubierto | Detalle |
|-----------------|----------|---------|
| Objetivo | Si | Todas las capacidades incluidas |
| Resumen Ejecutivo (7 items) | Si | Cada item mapeado a fases |
| Alcance (13 items) | Si | Trazabilidad completa |
| Menu Inicial | Si | Fase 4 |
| Workflows (4) | Si | Fases 4, 5, 6 |
| Embedded Sign-Up | **Si (EXPANDIDO)** | Fase 5.4 + **5.5 con UI usuario** |
| Workflow WhatsApp → Lead | Si | Fase 6 |
| Opciones Menu (1, 2, 3) | Si | Fase 4 |
| Casos de Uso (8 escenarios) | Si | Fases 4, 5, 6 |
| Flujos de Trabajo (A-D) | Si | Fase 4 |
| Plantillas (A-K) | Si | Fase 4 |
| Criterios Aceptacion (12) | Si | Todos mapeados |
| Exclusiones | Si | Documentadas |

### Confirmacion

**SI, el plan cubre TODOS los criterios de aceptacion de HU-0012**, incluyendo:

1. **Embedded Sign-Up configurable por el usuario** (Fase 5.5)
   - UI en `/home/settings/whatsapp`
   - Boton para vincular con SDK Meta
   - Visualizacion de estado
   - Opcion de desvincular
   - Historial de sincronizacion
   - Encriptacion de tokens
   - Bitacora de acciones

2. **Todas las funcionalidades del bot** (Fase 4)
   - Menu interactivo 1-2-3
   - Clasificacion por palabras clave
   - 11 plantillas (A-K)
   - Manejo de casos especiales

3. **Integracion completa** (Fases 5, 6)
   - Meta WhatsApp Business API
   - Crear Lead desde chat
   - Conservar historial y adjuntos
   - Notificaciones internas

---

**Documento generado por**: @business-analyst + @devteam
**Fecha**: 2025-12-19
**Version**: 1.1 (Incluye Embedded Sign-Up UI completo)
**Proxima revision**: Al iniciar Fase 1
