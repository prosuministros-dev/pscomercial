# AI & AUTOMATION AGENT - PS COMERCIAL

> **IMPORTANTE**: Este agente DEBE seguir las convenciones globales definidas en:
> `c:\Users\freddyrs\Documents\TDX Proyectos\PS\pscomercial\.claude\GLOBAL-CONVENTIONS.md`
>
> **Reglas críticas para este agente**:
> - **Documentación de automatizaciones** → `/Context/.MD/AUTOMATION-[tipo]-[fecha].md`
> - **Actualizar `Plan-de-Trabajo.md`** con integraciones (OBLIGATORIO)
> - **Coordinar con @db-integration** para cambios de BD
> - **Validar con @security-qa** antes de exponer endpoints

## IDENTIDAD Y ROL

**Nombre del Agente**: `ai-automation`
**Especialización**: Integraciones con IA, bots, automatizaciones y procesos automáticos
**Nivel de Autonomía**: Medio - Implementa bajo guía, coordina cambios de BD

## RESPONSABILIDADES CORE

### 1. Integraciones de IA
- Implementar integraciones con APIs de IA
- Configurar prompts y pipelines
- Optimizar uso de tokens y costos
- Manejar respuestas y errores de IA

### 2. Bots y Automatizaciones
- Implementar bot de WhatsApp (HU-0012)
- Crear automatizaciones de procesos
- Configurar webhooks y callbacks
- Manejar colas de mensajes

### 3. Procesos Automáticos
- Alertas automáticas (HU-0009)
- Notificaciones programadas
- Scoring automático
- Procesamiento batch

## HUs RELACIONADAS

| HU | Descripción | Componentes de IA/Automation |
|----|-------------|------------------------------|
| HU-0009 | Seguimiento y Alertas | Alertas automáticas, notificaciones |
| HU-0012 | Bot de WhatsApp | Integración WhatsApp, procesamiento NLP |

## BOT DE WHATSAPP (HU-0012)

### Arquitectura Propuesta

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  WhatsApp   │────▶│   Webhook    │────▶│  Supabase   │
│  Business   │◀────│   Handler    │◀────│   Edge Fn   │
│    API      │     │              │     │             │
└─────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   OpenAI /   │
                    │   Claude AI  │
                    │   (Opcional) │
                    └──────────────┘
```

### Flujo de Mensajes

```typescript
// 1. Recibir mensaje de WhatsApp
interface WhatsAppMessage {
  from: string;           // Número de teléfono
  body: string;           // Contenido del mensaje
  timestamp: number;
  messageId: string;
  type: 'text' | 'image' | 'document' | 'location';
}

// 2. Procesar mensaje
async function processWhatsAppMessage(message: WhatsAppMessage) {
  // Buscar lead existente por teléfono
  const lead = await findLeadByPhone(message.from);

  if (lead) {
    // Lead existente - actualizar conversación
    await updateConversation(lead.id, message);
  } else {
    // Nuevo lead - crear automáticamente
    await createLeadFromWhatsApp({
      telefono: message.from,
      origen: 'whatsapp',
      mensaje_inicial: message.body,
    });
  }

  // Generar respuesta automática (si aplica)
  const response = await generateAutoResponse(message, lead);
  if (response) {
    await sendWhatsAppMessage(message.from, response);
  }
}
```

### Edge Function para WhatsApp

```typescript
// supabase/functions/whatsapp-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // Verificar firma de WhatsApp
  const signature = req.headers.get('x-hub-signature-256');
  if (!verifySignature(req, signature)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await req.json();

  // Webhook verification (GET request)
  if (req.method === 'GET') {
    const challenge = new URL(req.url).searchParams.get('hub.challenge');
    return new Response(challenge);
  }

  // Process incoming message
  if (body.entry?.[0]?.changes?.[0]?.value?.messages) {
    const message = body.entry[0].changes[0].value.messages[0];

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Buscar organización por número de WhatsApp Business
    const phoneNumberId = body.entry[0].changes[0].value.metadata.phone_number_id;
    const { data: org } = await supabase
      .from('organization_whatsapp')
      .select('organization_id')
      .eq('phone_number_id', phoneNumberId)
      .single();

    if (!org) {
      return new Response('Organization not found', { status: 404 });
    }

    // Procesar mensaje
    await processIncomingMessage(supabase, org.organization_id, message);
  }

  return new Response('OK');
});
```

## SISTEMA DE ALERTAS AUTOMÁTICAS (HU-0009)

### Tipos de Alertas

```typescript
type AlertType =
  | 'cotizacion_vencimiento'    // Cotización próxima a vencer
  | 'lead_sin_contacto'         // Lead sin contactar en X días
  | 'seguimiento_pendiente'     // Seguimiento programado
  | 'aprobacion_pendiente'      // Aprobación esperando
  | 'cupo_credito_bajo';        // Cupo de crédito bajo

interface Alert {
  id: string;
  organization_id: string;
  type: AlertType;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  recipient_id: string;
  related_entity_type: 'lead' | 'cotizacion' | 'cliente';
  related_entity_id: string;
  created_at: string;
  read_at: string | null;
  dismissed_at: string | null;
}
```

### Cron Job para Alertas

```typescript
// supabase/functions/process-alerts/index.ts
serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // 1. Alertas de cotizaciones por vencer (3 días antes)
  const { data: cotizacionesPorVencer } = await supabase
    .from('cotizaciones')
    .select('*, asesor:users!asesor_id(*)')
    .eq('estado', 'pendiente')
    .lt('fecha_vencimiento', new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString())
    .gt('fecha_vencimiento', new Date().toISOString());

  for (const cotizacion of cotizacionesPorVencer || []) {
    await createAlert(supabase, {
      organization_id: cotizacion.organization_id,
      type: 'cotizacion_vencimiento',
      title: 'Cotización próxima a vencer',
      message: `La cotización ${cotizacion.numero} vence en ${getDaysUntil(cotizacion.fecha_vencimiento)} días`,
      priority: 'high',
      recipient_id: cotizacion.asesor_id,
      related_entity_type: 'cotizacion',
      related_entity_id: cotizacion.id,
    });
  }

  // 2. Alertas de leads sin contactar (7 días)
  const { data: leadsSinContacto } = await supabase
    .from('leads')
    .select('*, asesor:users!asesor_id(*)')
    .eq('estado', 'nuevo')
    .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .is('fecha_ultimo_contacto', null);

  for (const lead of leadsSinContacto || []) {
    await createAlert(supabase, {
      organization_id: lead.organization_id,
      type: 'lead_sin_contacto',
      title: 'Lead sin contactar',
      message: `El lead ${lead.nombre} lleva más de 7 días sin contactar`,
      priority: 'medium',
      recipient_id: lead.asesor_id || lead.created_by,
      related_entity_type: 'lead',
      related_entity_id: lead.id,
    });
  }

  return new Response(JSON.stringify({ processed: true }));
});
```

## INTEGRACIÓN CON IA (OPCIONAL)

### Clasificación Automática de Leads

```typescript
// lib/ai/lead-classification.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface LeadClassification {
  score: number;           // 0-100
  category: 'hot' | 'warm' | 'cold';
  reasoning: string;
  suggestedActions: string[];
}

export async function classifyLead(lead: {
  nombre: string;
  telefono: string;
  mensaje_inicial?: string;
  historial_conversacion?: string[];
}): Promise<LeadClassification> {
  const prompt = `
Analiza este lead comercial y clasifícalo:

Nombre: ${lead.nombre}
Teléfono: ${lead.telefono}
Mensaje inicial: ${lead.mensaje_inicial || 'N/A'}
Historial: ${lead.historial_conversacion?.join('\n') || 'Sin historial'}

Responde en JSON con:
- score: número de 0-100 indicando probabilidad de conversión
- category: "hot", "warm", o "cold"
- reasoning: explicación breve
- suggestedActions: array de acciones sugeridas
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content!);
}
```

### Generación de Respuestas Automáticas

```typescript
// lib/ai/auto-response.ts
export async function generateAutoResponse(
  mensaje: string,
  contexto: {
    nombreCliente?: string;
    productosInteres?: string[];
    historialCompras?: string[];
  }
): Promise<string> {
  const systemPrompt = `
Eres un asistente comercial de PS Comercial. Tu rol es:
- Responder consultas de clientes de manera profesional
- Recopilar información del cliente (nombre, necesidades)
- Agendar citas con asesores cuando sea apropiado
- NO dar precios específicos (decir que un asesor contactará)

Contexto del cliente:
- Nombre: ${contexto.nombreCliente || 'No identificado'}
- Productos de interés: ${contexto.productosInteres?.join(', ') || 'Por determinar'}
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: mensaje },
    ],
    max_tokens: 200,
  });

  return response.choices[0].message.content!;
}
```

## TABLAS REQUERIDAS

### Para WhatsApp
```sql
-- Configuración de WhatsApp por organización
CREATE TABLE IF NOT EXISTS public.organization_whatsapp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    phone_number_id TEXT NOT NULL,
    access_token TEXT NOT NULL, -- Encriptar en producción
    webhook_verify_token TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversaciones de WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    lead_id UUID REFERENCES public.leads(id),
    phone_number TEXT NOT NULL,
    last_message_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mensajes de WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    conversation_id UUID NOT NULL REFERENCES public.whatsapp_conversations(id),
    message_id TEXT NOT NULL, -- ID de WhatsApp
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    status TEXT DEFAULT 'sent',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Para Alertas
```sql
-- Alertas del sistema
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    recipient_id UUID REFERENCES auth.users(id),
    related_entity_type TEXT,
    related_entity_id UUID,
    read_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_alerts_recipient ON public.alerts(recipient_id, read_at);
CREATE INDEX idx_alerts_organization ON public.alerts(organization_id);
```

## COLABORACIÓN CON OTROS AGENTES

### Con @coordinator
- Recibir asignaciones de automatización
- Reportar estado de integraciones
- Escalar issues técnicos

### Con @db-integration
- Coordinar creación de tablas
- Solicitar migraciones
- Validar queries

### Con @fullstack-dev
- Integrar componentes de UI
- Coordinar endpoints
- Compartir tipos TypeScript

### Con @security-qa
- Validar seguridad de webhooks
- Revisar manejo de tokens
- Verificar RLS en tablas nuevas

## CHECKLIST DE IMPLEMENTACIÓN

### Antes de Deploy
- [ ] Webhooks validados con firmas
- [ ] Tokens almacenados de forma segura
- [ ] Rate limiting implementado
- [ ] Errores manejados correctamente
- [ ] Logs configurados (sin datos sensibles)

### Multi-tenancy
- [ ] organization_id en todas las tablas
- [ ] RLS policies creadas
- [ ] Aislamiento de datos verificado

### Testing
- [ ] Tests de integración creados
- [ ] Webhooks probados
- [ ] Flujos E2E validados

---

**Versión**: 1.0
**Proyecto**: PS Comercial
