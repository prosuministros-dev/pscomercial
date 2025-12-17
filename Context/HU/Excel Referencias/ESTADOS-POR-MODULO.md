# ESTADOS POR MÓDULO - PS COMERCIAL

> **Fuente**: Análisis de HUs del proyecto PS Comercial
> **Fecha de generación**: 2025-12-17
> **Actualizado**: 2025-12-17
> **Analizado por**: @business-analyst

---

## RESUMEN EJECUTIVO

Este documento consolida todos los estados identificados en las Historias de Usuario (HUs) del proyecto PS Comercial. Los estados representan el ciclo de vida de cada entidad en el sistema.

| MÓDULO | CANTIDAD DE ESTADOS |
|--------|---------------------|
| LEAD | 5 |
| COTIZACIÓN | 11 |
| PEDIDO | 4 |
| ORDEN DE COMPRA | 5 |
| VALIDACIÓN FINANCIERA | 2 |
| PROFORMA | 4 |
| CONVERSACIÓN WHATSAPP | 3 |
| APROBACIÓN MARGEN | 3 |

---

## FLUJO GENERAL DEL PROCESO COMERCIAL

> **IMPORTANTE**: Según las HUs, las validaciones financieras ocurren **ANTES** de generar el pedido. Sin pago confirmado o validación de cartera, NO se puede pasar de cotización a pedido.

```
┌──────────┐     ┌──────────┐     ┌──────────────┐     ┌─────────────────┐     ┌────────┐     ┌────┐
│   LEAD   │ ──► │COTIZACIÓN│ ──► │  VALIDACIÓN  │ ──► │  CONFIRMACIÓN   │ ──► │ PEDIDO │ ──► │ OC │
│          │     │          │     │  FINANCIERA  │     │     PAGO        │     │        │     │    │
└──────────┘     └──────────┘     │  (HU-0004)   │     │   (HU-0006)     │     └────────┘     └────┘
                                  └──────────────┘     └─────────────────┘
                                         │                     │
                                         │                     │
                                  Si hay bloqueo        Sin pago no
                                  NO genera pedido      genera pedido
```

**Referencias HU**:
- **HU-0004** (línea 4): "dicha selección determinará si una cotización puede avanzar hacia la creación de un pedido"
- **HU-0004** (línea 10): "Si el cliente está bloqueado, la cotización se guarda, pero no podrá generar pedido"
- **HU-0006** (línea 45): "Cuando el cliente y el área financiera confirmen el pago se puede generar el pedido"
- **HU-0006** (línea 52): "El área financiera confirmar con el soporte de pago... para que se puede generar el pedido"

---

## 1. MÓDULO LEAD

> **Fuentes**: HU-0001, HU-0002, HU-0003

### Estados Identificados

| # | ESTADO | NOMBRE EXACTO | DESCRIPCIÓN | HU FUENTE |
|---|--------|---------------|-------------|-----------|
| 1 | Pendiente de Asignación | `PENDIENTE_ASIGNACION` | Lead recién creado, aún no asignado a un asesor comercial | HU-0001 |
| 2 | Pendiente de Información | `PENDIENTE_INFORMACION` | Lead con campos obligatorios faltantes | HU-0001 |
| 3 | Asignado | `ASIGNADO` | Lead asignado a un asesor comercial | HU-0002 |
| 4 | Convertido | `CONVERTIDO` | Lead convertido a cotización (válido) | HU-0003 |
| 5 | Rechazado | `RECHAZADO` | Lead descartado (spam, no aplica, etc.) | HU-0003 |

### Estados Kanban (HU-0001)

HU-0001 define explícitamente: **"Estados definidos: Leads: Creado / Pendiente / Convertido"**

| COLUMNA KANBAN | ESTADOS INCLUIDOS |
|----------------|-------------------|
| Creado | `PENDIENTE_ASIGNACION`, `PENDIENTE_INFORMACION` |
| Pendiente | `ASIGNADO` |
| Convertido | `CONVERTIDO` |
| (Rechazado) | `RECHAZADO` |

### Diagrama de Flujo de Estados - LEAD

```
┌─────────────────────────────┐
│    NUEVO LEAD (Entrada)     │
│  (WhatsApp/Web/Manual)      │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  PENDIENTE_ASIGNACION       │◄─── Estado inicial por defecto
│  (Kanban: "Creado")         │
└─────────────┬───────────────┘
              │
      ┌───────┴───────┐
      │ Datos         │
      │ completos?    │
      └───────┬───────┘
              │
    ┌─────────┼─────────┐
    │ NO      │         │ SÍ
    ▼         │         ▼
┌───────────────────┐   │
│ PENDIENTE_INFO    │   │
│ (falta datos)     │   │
│ (Kanban: "Creado")│   │
└─────────┬─────────┘   │
          │             │
          └──────┬──────┘
                 │
                 ▼
┌─────────────────────────────┐
│      ASIGNADO               │
│   (Kanban: "Pendiente")     │
│   Asignación automática     │
│   balanceada (máx 5/asesor) │
└─────────────┬───────────────┘
              │
    ┌─────────┼─────────┐
    │ Asesor  │         │
    │ valida  │         │
    └─────────┼─────────┘
              │
    ┌─────────┼─────────┐
    │ VÁLIDO  │         │ NO VÁLIDO
    ▼         │         ▼
┌─────────────────┐   ┌─────────────────┐
│   CONVERTIDO    │   │   RECHAZADO     │
│(Kanban:"Convert")│   │(registra motivo)│
│ → Crea Cotización│   │                 │
└─────────────────┘   └─────────────────┘
```

### Transiciones Permitidas - LEAD

| ESTADO ORIGEN | ESTADO DESTINO | ACTOR | CONDICIÓN |
|---------------|----------------|-------|-----------|
| PENDIENTE_ASIGNACION | ASIGNADO | Sistema | Asignación automática balanceada |
| PENDIENTE_ASIGNACION | PENDIENTE_INFORMACION | Sistema | Datos obligatorios faltantes |
| PENDIENTE_INFORMACION | PENDIENTE_ASIGNACION | Usuario | Se completan datos |
| ASIGNADO | CONVERTIDO | Asesor | Lead válido → crea cotización |
| ASIGNADO | RECHAZADO | Asesor | Lead no válido (selecciona motivo) |

### Reglas de Negocio - LEAD

| REGLA | DESCRIPCIÓN | HU FUENTE |
|-------|-------------|-----------|
| RN-LEAD-001 | Numeración inicia en #100 | HU-0001 |
| RN-LEAD-002 | Máximo 5 leads pendientes por asesor | HU-0002 |
| RN-LEAD-003 | Convertir a cotización en máximo 1 día | HU-0001 |
| RN-LEAD-004 | Validar duplicidad por NIT y correo | HU-0001 |

---

## 2. MÓDULO COTIZACIÓN

> **Fuentes**: HU-0003, HU-0004, HU-0005, HU-0006

### Estados Identificados (Definidos en HU-0003)

**HU-0003 establece explícitamente**: "Los estados de la cotización son los siguientes: Cotizaciones: **Creación de oferta / Negociación / Riesgo / Pendiente orden de compra / Perdida**"

| # | ESTADO | NOMBRE EXACTO | DESCRIPCIÓN | HU FUENTE |
|---|--------|---------------|-------------|-----------|
| 1 | Creación de Oferta | `CREACION_OFERTA` | Cotización recién creada, en elaboración | HU-0003 |
| 2 | Pendiente Aprobación Margen | `PENDIENTE_APROBACION_MARGEN` | Margen < mínimo, requiere aprobación gerencia | HU-0005 |
| 3 | Negociación | `NEGOCIACION` | En proceso de negociación con cliente | HU-0003 |
| 4 | Riesgo | `RIESGO` | Probabilidad baja de cierre | HU-0003 |
| 5 | Enviada al Cliente | `ENVIADA_CLIENTE` | Cotización enviada (cliente con crédito) | HU-0006 |
| 6 | Proforma Enviada | `PROFORMA_ENVIADA` | Proforma enviada (cliente sin crédito) | HU-0006 |
| 7 | Pendiente de Ajustes | `PENDIENTE_AJUSTES` | Cliente solicitó modificaciones | HU-0006 |
| 8 | Aceptada por Cliente | `ACEPTADA_CLIENTE` | Cliente aceptó la cotización/proforma | HU-0006 |
| 9 | Rechazada por Cliente | `RECHAZADA_CLIENTE` | Cliente rechazó la cotización | HU-0006 |
| 10 | Pendiente Orden de Compra | `PENDIENTE_OC` | Aceptada, esperando OC del cliente | HU-0003 |
| 11 | Perdida | `PERDIDA` | Cotización no concretada | HU-0003 |

### Diagrama de Flujo de Estados - COTIZACIÓN

```
┌─────────────────────────────┐
│  Lead CONVERTIDO (entrada)  │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│     CREACION_OFERTA         │◄─── Estado inicial (HU-0003)
│   Numeración desde #30.000  │
└─────────────┬───────────────┘
              │
      ┌───────┴───────┐
      │ Margen >=     │
      │ mínimo?       │  (HU-0005)
      └───────┬───────┘
              │
    ┌─────────┼─────────┐
    │ NO      │         │ SÍ
    ▼         │         │
┌─────────────────────┐ │
│ PENDIENTE_APROBACION│ │
│ _MARGEN             │ │
│ (requiere Gerencia) │ │
└─────────┬───────────┘ │
          │             │
   ┌──────┴──────┐      │
   │ Aprobado?   │      │
   └──────┬──────┘      │
          │             │
   ┌──────┼──────┐      │
   │ SÍ   │      │ NO   │
   │      │      ▼      │
   │      │   PERDIDA   │
   │      │             │
   └──────┼─────────────┘
          │
          ▼
┌─────────────────────────────┐
│       NEGOCIACION           │
└─────────────┬───────────────┘
              │
    ┌─────────┼─────────────────┐
    │         │                 │
    ▼         ▼                 ▼
┌────────┐ ┌──────────────┐  ┌────────┐
│ RIESGO │ │ ENVIAR AL    │  │PERDIDA │
│        │ │ CLIENTE      │  │        │
└───┬────┘ └──────┬───────┘  └────────┘
    │             │
    │     ┌───────┴───────┐
    │     │ Tipo cliente? │ (HU-0006)
    │     └───────┬───────┘
    │             │
    │     ┌───────┼───────┐
    │     │ CON   │       │ SIN
    │     │CRÉDITO│       │CRÉDITO
    │     ▼       │       ▼
    │ ┌────────────┐  ┌─────────────┐
    │ │ENVIADA_    │  │PROFORMA_    │
    │ │CLIENTE     │  │ENVIADA      │
    │ └─────┬──────┘  └──────┬──────┘
    │       │                │
    │       └────────┬───────┘
    │                │
    │        ┌───────┴───────┐
    │        │ Respuesta     │
    │        │ cliente?      │
    │        └───────┬───────┘
    │                │
    │    ┌───────────┼───────────┐
    │    │           │           │
    │    ▼           ▼           ▼
    │ ┌──────────┐ ┌──────────┐ ┌──────────┐
    │ │ACEPTADA_ │ │PENDIENTE_│ │RECHAZADA_│
    │ │CLIENTE   │ │AJUSTES   │ │CLIENTE   │
    │ └────┬─────┘ └──────────┘ └──────────┘
    │      │
    │      │ 8 días sin respuesta → Recordatorio automático (HU-0006)
    │      │
    │      ▼
    │ ┌─────────────────────────────────────────────────────────────┐
    │ │                VALIDACIÓN FINANCIERA                        │
    │ │                (ANTES de generar pedido)                    │
    │ │                                                             │
    │ │  ┌───────────────────────────────────────────────────────┐ │
    │ │  │ 1. Verificar bloqueo cartera (HU-0004)                │ │
    │ │  │    - Área Financiera marca: Sí/No                     │ │
    │ │  │    - Si "Sí" → NO puede generar pedido                │ │
    │ │  │                                                       │ │
    │ │  │ 2. Confirmar pago (HU-0006) - Cliente sin crédito     │ │
    │ │  │    - Financiera verifica soporte de pago              │ │
    │ │  │    - Si NO hay pago → NO puede generar pedido         │ │
    │ │  └───────────────────────────────────────────────────────┘ │
    │ └─────────────────────────────────────────────────────────────┘
    │      │
    │      │ Solo si: Sin bloqueo + Pago confirmado (o crédito aprobado)
    │      │
    │      ▼
    │ ┌─────────────────────┐
    │ │   PENDIENTE_OC      │
    │ │ (Esperando OC del   │
    │ │  cliente)           │
    │ └─────────┬───────────┘
    │           │
    │           │ OC recibida
    │           ▼
    └──────────►┌─────────────────────┐
               │  → GENERA PEDIDO     │
               │  (Módulo Pedido)     │
               └─────────────────────┘
```

### Transiciones Permitidas - COTIZACIÓN

| ESTADO ORIGEN | ESTADO DESTINO | ACTOR | CONDICIÓN |
|---------------|----------------|-------|-----------|
| CREACION_OFERTA | PENDIENTE_APROBACION_MARGEN | Sistema | Margen < mínimo configurado |
| CREACION_OFERTA | NEGOCIACION | Sistema | Margen >= mínimo |
| PENDIENTE_APROBACION_MARGEN | NEGOCIACION | Gerencia | Aprueba margen bajo |
| PENDIENTE_APROBACION_MARGEN | PERDIDA | Gerencia | Rechaza margen |
| NEGOCIACION | RIESGO | Asesor | Baja probabilidad de cierre |
| NEGOCIACION | ENVIADA_CLIENTE | Asesor | Cliente CON crédito |
| NEGOCIACION | PROFORMA_ENVIADA | Asesor | Cliente SIN crédito (vía Financiera) |
| NEGOCIACION | PERDIDA | Asesor | Cliente no interesado |
| RIESGO | NEGOCIACION | Asesor | Retoma negociación |
| RIESGO | PERDIDA | Asesor | Cotización perdida definitivamente |
| ENVIADA_CLIENTE | ACEPTADA_CLIENTE | Cliente/Bot | Acepta cotización |
| ENVIADA_CLIENTE | RECHAZADA_CLIENTE | Cliente/Bot | Rechaza cotización |
| ENVIADA_CLIENTE | PENDIENTE_AJUSTES | Cliente/Bot | Solicita cambios |
| PROFORMA_ENVIADA | ACEPTADA_CLIENTE | Cliente/Bot | Acepta proforma |
| PROFORMA_ENVIADA | RECHAZADA_CLIENTE | Cliente/Bot | Rechaza proforma |
| PROFORMA_ENVIADA | PENDIENTE_AJUSTES | Cliente/Bot | Solicita cambios |
| PENDIENTE_AJUSTES | ENVIADA_CLIENTE | Asesor | Ajusta y reenvía |
| PENDIENTE_AJUSTES | PROFORMA_ENVIADA | Asesor | Ajusta y reenvía proforma |
| ACEPTADA_CLIENTE | PENDIENTE_OC | Sistema | **Solo si validación financiera OK** |
| PENDIENTE_OC | → PEDIDO | Sistema | OC recibida + validación financiera OK |

### Reglas de Negocio - COTIZACIÓN

| REGLA | DESCRIPCIÓN | HU FUENTE |
|-------|-------------|-----------|
| RN-COT-001 | Numeración inicia en #30.000 | HU-0003 |
| RN-COT-002 | Margen = 1 - (Total costo / Total venta) | HU-0005 |
| RN-COT-003 | Recordatorio automático a los 8 días sin respuesta | HU-0006 |
| RN-COT-004 | **Sin validación financiera NO genera pedido** | HU-0004 |
| RN-COT-005 | **Sin pago confirmado (anticipado) NO genera pedido** | HU-0006 |
| RN-COT-006 | Transporte no visible al cliente pero registrado | HU-0003 |

---

## 3. VALIDACIÓN FINANCIERA (PRE-PEDIDO)

> **Fuentes**: HU-0004, HU-0006
> **CRÍTICO**: Esta validación ocurre ANTES de poder generar un pedido

### Campo: Bloqueo de Cartera (HU-0004)

| # | VALOR | NOMBRE EXACTO | DESCRIPCIÓN | EFECTO |
|---|-------|---------------|-------------|--------|
| 1 | Sin Bloqueo | `SIN_BLOQUEO` | Cliente sin bloqueo de cartera | Puede generar pedido |
| 2 | Con Bloqueo | `CON_BLOQUEO` | Cliente con cartera vencida | **NO puede generar pedido** |

### Permisos por Rol - Bloqueo Cartera

| ROL | VER | EDITAR |
|-----|-----|--------|
| Área Financiera | ✅ | ✅ |
| Comercial | ✅ | ❌ |
| Gerencia | ✅ | ✅ |

### Estados de Pago - Proforma (HU-0006)

| # | ESTADO | NOMBRE EXACTO | DESCRIPCIÓN | EFECTO |
|---|--------|---------------|-------------|--------|
| 1 | Pendiente de Pago | `PENDIENTE_PAGO` | Proforma enviada, esperando pago | **NO puede generar pedido** |
| 2 | Pago Confirmado | `PAGO_CONFIRMADO` | Pago verificado por Financiera | Puede generar pedido |

### Flujo de Validación Financiera

```
┌─────────────────────────────────────────────────────────────────┐
│              COTIZACIÓN ACEPTADA POR CLIENTE                    │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  VERIFICAR BLOQUEO CARTERA                      │
│                        (HU-0004)                                │
│                                                                 │
│  Área Financiera revisa y marca:                                │
│  - "Cliente con bloqueo de cartera": Sí / No                    │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │ ¿Tiene bloqueo?   │
                    └─────────┬─────────┘
                              │
              ┌───────────────┼───────────────┐
              │ SÍ            │               │ NO
              ▼               │               ▼
┌─────────────────────┐       │    ┌─────────────────────────────┐
│ BLOQUEADO           │       │    │  VERIFICAR FORMA DE PAGO    │
│                     │       │    └─────────────┬───────────────┘
│ "No puede generar   │       │                  │
│  pedido"            │       │        ┌─────────┴─────────┐
│                     │       │        │ Forma de pago?    │
│ (Comercial ve       │       │        └─────────┬─────────┘
│  mensaje de bloqueo)│       │                  │
└─────────────────────┘       │    ┌─────────────┼─────────────┐
              │               │    │ ANTICIPADO  │             │ CRÉDITO
              │               │    ▼             │             ▼
              │               │ ┌────────────────┐  ┌────────────────────┐
              │               │ │ ¿Pago          │  │ "Disponible para   │
              │               │ │ confirmado?    │  │  compra"           │
              │               │ │                │  │                    │
              │               │ │ Financiera     │  │ (Cliente con cupo) │
              │               │ │ verifica pago  │  └─────────┬──────────┘
              │               │ └───────┬────────┘            │
              │               │         │                     │
              │               │   ┌─────┴─────┐               │
              │               │   │ SÍ   │ NO │               │
              │               │   ▼      ▼    │               │
              │               │ ┌────┐ ┌────┐ │               │
              │               │ │ OK │ │WAIT│ │               │
              │               │ └──┬─┘ └────┘ │               │
              │               │    │          │               │
              │               │    └──────────┼───────────────┘
              │               │               │
              │               │               ▼
              │               │    ┌─────────────────────┐
              │               │    │  PUEDE GENERAR      │
              │               │    │  PEDIDO             │
              │               │    └─────────────────────┘
              │               │
              ▼               │
    (Financiera desbloquea)   │
              │               │
              └───────────────┘
```

### Citas Exactas de las HUs

**HU-0004**:
> "Para el MVP del proceso de cotización, la única validación financiera requerida será confirmar si el cliente presenta bloqueo de cartera... **dicha selección determinará si una cotización puede avanzar hacia la creación de un pedido**."

> "Si el cliente está bloqueado, la cotización se guarda, **pero no podrá generar pedido**."

> "Si se marca Sí, el sistema: Permite guardar la cotización. **Bloquea la creación de pedido**."

**HU-0006**:
> "**Cuando el cliente y el área financiera confirmen el pago se puede generar el pedido**."

> "El área financiera confirmar con el soporte de pago, que el cliente ya pago, ingresando a la solicitud, dando en check, **para que se puede generar el pedido y habilitar el paso siguiente de manera manual: generación de orden de compra**."

---

## 4. MÓDULO PEDIDO (ORDEN DE PEDIDO)

> **Fuentes**: HU-0003, HU-0006, HU-0009
> **PREREQUISITO**: Validación financiera aprobada (sin bloqueo + pago confirmado)

### Estados Identificados

| # | ESTADO | NOMBRE EXACTO | DESCRIPCIÓN | HU FUENTE |
|---|--------|---------------|-------------|-----------|
| 1 | Creado | `CREADO` | Pedido generado tras validación financiera OK | HU-0006 |
| 2 | Pago Confirmado | `PAGO_CONFIRMADO` | Aplica solo si forma de pago es anticipada | HU-0003 |
| 3 | Disponible para Compra | `DISPONIBLE_COMPRA` | Cliente con crédito aprobado | HU-0003 |
| 4 | En Proceso | `EN_PROCESO` | OC generadas, pedido en ejecución | HU-0009 |

### Diagrama de Flujo de Estados - PEDIDO

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRE-REQUISITOS CUMPLIDOS                     │
│                                                                 │
│  ✅ Cotización ACEPTADA_CLIENTE                                 │
│  ✅ Sin bloqueo de cartera (HU-0004)                            │
│  ✅ Pago confirmado O crédito aprobado (HU-0006)                │
│  ✅ OC recibida del cliente                                     │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         CREADO                                  │
│                    (Pedido generado)                            │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │ Forma de pago?    │
                    └─────────┬─────────┘
                              │
              ┌───────────────┼───────────────┐
              │ ANTICIPADO    │               │ CRÉDITO
              ▼               │               ▼
┌─────────────────────┐       │    ┌─────────────────────────────┐
│   PAGO_CONFIRMADO   │       │    │   DISPONIBLE_COMPRA         │
│                     │       │    │                             │
│ (Ya fue verificado  │       │    │ (Cliente tiene cupo de      │
│  antes de crear     │       │    │  crédito aprobado)          │
│  el pedido)         │       │    │                             │
└─────────┬───────────┘       │    └─────────────┬───────────────┘
          │                   │                  │
          └───────────────────┼──────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       EN_PROCESO                                │
│                                                                 │
│  - Se generan Órdenes de Compra (OC) a proveedores              │
│  - Alertas a Compras y Logística (HU-0009)                      │
└─────────────────────────────────────────────────────────────────┘
```

### Transiciones Permitidas - PEDIDO

| ESTADO ORIGEN | ESTADO DESTINO | ACTOR | CONDICIÓN |
|---------------|----------------|-------|-----------|
| (Cotización validada) | CREADO | Sistema | Validación financiera OK + OC cliente |
| CREADO | PAGO_CONFIRMADO | Sistema | Forma pago = Anticipado |
| CREADO | DISPONIBLE_COMPRA | Sistema | Forma pago = Crédito |
| PAGO_CONFIRMADO | EN_PROCESO | Compras | Genera OC a proveedores |
| DISPONIBLE_COMPRA | EN_PROCESO | Compras | Genera OC a proveedores |

### Información en Vista de Pedido (HU-0003)

- Datos del cliente (no editables)
- Estado de pago
- Información de despacho (dirección, tipo, notas)
- Campo de observaciones con notificación "@"
- Subpestaña "Órdenes de Compra" con detalle de OC asociadas

---

## 5. MÓDULO ORDEN DE COMPRA (OC)

> **Fuentes**: HU-0003, HU-0009

### Estados Identificados

| # | ESTADO | NOMBRE EXACTO | DESCRIPCIÓN | HU FUENTE |
|---|--------|---------------|-------------|-----------|
| 1 | Creada | `CREADA` | OC generada desde pedido | HU-0003 |
| 2 | Enviada a Proveedor | `ENVIADA_PROVEEDOR` | OC enviada al proveedor | HU-0009 |
| 3 | Confirmada | `CONFIRMADA` | Proveedor confirma OC | HU-0009 |
| 4 | En Tránsito | `EN_TRANSITO` | Productos en camino | HU-0009 |
| 5 | Recibida | `RECIBIDA` | Productos recibidos en bodega | HU-0009 |

### Diagrama de Flujo de Estados - OC

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     CREADA      │ ──► │ENVIADA_PROVEEDOR│ ──► │   CONFIRMADA    │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │    RECIBIDA     │ ◄── │   EN_TRANSITO   │
                        └─────────────────┘     └─────────────────┘
```

### Transiciones Permitidas - OC

| ESTADO ORIGEN | ESTADO DESTINO | ACTOR | CONDICIÓN |
|---------------|----------------|-------|-----------|
| CREADA | ENVIADA_PROVEEDOR | Compras | Envía OC al proveedor |
| ENVIADA_PROVEEDOR | CONFIRMADA | Compras | Proveedor confirma disponibilidad |
| CONFIRMADA | EN_TRANSITO | Logística | Proveedor despacha |
| EN_TRANSITO | RECIBIDA | Logística | Recibe en bodega |

---

## 6. MÓDULO PROFORMA

> **Fuente**: HU-0006

### Estados Identificados

| # | ESTADO | NOMBRE EXACTO | DESCRIPCIÓN | HU FUENTE |
|---|--------|---------------|-------------|-----------|
| 1 | Generada | `GENERADA` | PDF de proforma generado | HU-0006 |
| 2 | Enviada | `ENVIADA` | Proforma enviada al cliente | HU-0006 |
| 3 | Pendiente de Pago | `PENDIENTE_PAGO` | Esperando pago del cliente | HU-0006 |
| 4 | Pago Confirmado | `PAGO_CONFIRMADO` | Pago verificado por Financiera | HU-0006 |

### Flujo de Proforma

```
┌───────────┐     ┌───────────┐     ┌───────────────┐     ┌───────────────┐
│ GENERADA  │ ──► │  ENVIADA  │ ──► │PENDIENTE_PAGO │ ──► │PAGO_CONFIRMADO│
└───────────┘     └───────────┘     └───────────────┘     └───────────────┘
                                                                   │
                                                                   ▼
                                                          PUEDE GENERAR PEDIDO
```

---

## 7. ESTADOS DE APROBACIÓN DE MARGEN

> **Fuente**: HU-0005

### Estados de Solicitud de Aprobación

| # | ESTADO | NOMBRE EXACTO | DESCRIPCIÓN | HU FUENTE |
|---|--------|---------------|-------------|-----------|
| 1 | Pendiente | `PENDIENTE` | Solicitud enviada a Gerencia | HU-0005 |
| 2 | Aprobada | `APROBADA` | Gerencia aprobó margen bajo | HU-0005 |
| 3 | Rechazada | `RECHAZADA` | Gerencia rechazó margen | HU-0005 |

### Información de la Solicitud

- Código de la cotización
- Cliente
- Margen calculado
- Margen mínimo requerido
- Nombre del asesor
- Fecha de creación
- Campo "Margen aprobado" (opcional, editable por Gerencia)

### Efectos de la Aprobación

| DECISIÓN | EFECTO EN COTIZACIÓN | REGISTRO |
|----------|---------------------|----------|
| APROBADA | Continúa a NEGOCIACION | Observación: "aprobado bajo menor margen" |
| RECHAZADA | Pasa a PERDIDA | Motivo de rechazo registrado |

---

## 8. MÓDULO CONVERSACIÓN WHATSAPP

> **Fuente**: HU-0012

### Estados Identificados

| # | ESTADO | NOMBRE EXACTO | DESCRIPCIÓN | HU FUENTE |
|---|--------|---------------|-------------|-----------|
| 1 | Activa | `ACTIVA` | Conversación en curso | HU-0012 |
| 2 | Incompleta | `INCOMPLETA` | Usuario no respondió, cerrada por timeout | HU-0012 |
| 3 | Cerrada | `CERRADA` | Conversación finalizada con éxito | HU-0012 |

---

## RESUMEN CONSOLIDADO DE ESTADOS

### Tabla Maestra de Estados

| MÓDULO | CÓDIGO ESTADO | NOMBRE DISPLAY | TIPO |
|--------|---------------|----------------|------|
| **LEAD** | `PENDIENTE_ASIGNACION` | Pendiente de Asignación | Inicial |
| **LEAD** | `PENDIENTE_INFORMACION` | Pendiente de Información | Intermedio |
| **LEAD** | `ASIGNADO` | Asignado | Intermedio |
| **LEAD** | `CONVERTIDO` | Convertido | Final exitoso |
| **LEAD** | `RECHAZADO` | Rechazado | Final fallido |
| **COTIZACIÓN** | `CREACION_OFERTA` | Creación de Oferta | Inicial |
| **COTIZACIÓN** | `PENDIENTE_APROBACION_MARGEN` | Pendiente Aprobación Margen | Intermedio |
| **COTIZACIÓN** | `NEGOCIACION` | En Negociación | Intermedio |
| **COTIZACIÓN** | `RIESGO` | En Riesgo | Intermedio |
| **COTIZACIÓN** | `ENVIADA_CLIENTE` | Enviada al Cliente | Intermedio |
| **COTIZACIÓN** | `PROFORMA_ENVIADA` | Proforma Enviada | Intermedio |
| **COTIZACIÓN** | `PENDIENTE_AJUSTES` | Pendiente de Ajustes | Intermedio |
| **COTIZACIÓN** | `ACEPTADA_CLIENTE` | Aceptada por Cliente | Intermedio |
| **COTIZACIÓN** | `RECHAZADA_CLIENTE` | Rechazada por Cliente | Final fallido |
| **COTIZACIÓN** | `PENDIENTE_OC` | Pendiente Orden de Compra | Intermedio |
| **COTIZACIÓN** | `PERDIDA` | Perdida | Final fallido |
| **VALIDACIÓN FIN.** | `SIN_BLOQUEO` | Sin Bloqueo | Estado OK |
| **VALIDACIÓN FIN.** | `CON_BLOQUEO` | Con Bloqueo | Estado Bloqueado |
| **PEDIDO** | `CREADO` | Creado | Inicial |
| **PEDIDO** | `PAGO_CONFIRMADO` | Pago Confirmado | Intermedio |
| **PEDIDO** | `DISPONIBLE_COMPRA` | Disponible para Compra | Intermedio |
| **PEDIDO** | `EN_PROCESO` | En Proceso | Intermedio |
| **ORDEN COMPRA** | `CREADA` | Creada | Inicial |
| **ORDEN COMPRA** | `ENVIADA_PROVEEDOR` | Enviada a Proveedor | Intermedio |
| **ORDEN COMPRA** | `CONFIRMADA` | Confirmada | Intermedio |
| **ORDEN COMPRA** | `EN_TRANSITO` | En Tránsito | Intermedio |
| **ORDEN COMPRA** | `RECIBIDA` | Recibida | Final |
| **PROFORMA** | `GENERADA` | Generada | Inicial |
| **PROFORMA** | `ENVIADA` | Enviada | Intermedio |
| **PROFORMA** | `PENDIENTE_PAGO` | Pendiente de Pago | Intermedio |
| **PROFORMA** | `PAGO_CONFIRMADO` | Pago Confirmado | Final |
| **APROBACIÓN** | `PENDIENTE` | Pendiente | Inicial |
| **APROBACIÓN** | `APROBADA` | Aprobada | Final exitoso |
| **APROBACIÓN** | `RECHAZADA` | Rechazada | Final fallido |

---

## ALERTAS Y NOTIFICACIONES POR MÓDULO

> **Fuente**: HU-0009

### Alertas Automáticas por Evento

| EVENTO | ORIGEN | DESTINO | DESCRIPCIÓN |
|--------|--------|---------|-------------|
| Solicitud aprobación financiera | Comercial | Financiera | Cotización requiere validación |
| Validación proforma | Financiera | Comercial | Proforma validada/pago confirmado |
| Generación Orden de Pedido | Sistema | Compras, Logística | Nuevo pedido generado |
| Confirmación OC | Compras | Logística, Finanzas | OC confirmada por proveedor |
| Entrega marcada | Logística | Finanzas | Productos entregados |
| Mención @usuario | Cualquiera | Usuario mencionado | Comentario con mención |

### Tiempos de Alerta

| MÓDULO | CONDICIÓN | TIEMPO | ACCIÓN |
|--------|-----------|--------|--------|
| Lead | Sin convertir | > 1 día | Alerta de demora |
| Cotización | Sin respuesta cliente | > 8 días | Recordatorio automático |
| Cotización | Estado crítico | > 8 días | Resaltar en rojo (tablero) |

---

## OBSERVACIONES IMPORTANTES

### 1. Flujo Correcto Cotización → Pedido

**El pedido NO se puede generar si**:
- ❌ Cliente tiene bloqueo de cartera (HU-0004)
- ❌ Pago no confirmado para clientes anticipados (HU-0006)

**El pedido SÍ se puede generar si**:
- ✅ Sin bloqueo de cartera + Pago confirmado (anticipado)
- ✅ Sin bloqueo de cartera + Crédito aprobado

### 2. Proforma vs Cotización

| TIPO CLIENTE | DOCUMENTO | FLUJO |
|--------------|-----------|-------|
| Sin crédito | Proforma | Proforma → Pago → Pedido |
| Con crédito | Cotización | Cotización → Aceptación → Pedido |

### 3. Campo "Porcentaje de Interés" (Excel)

El Excel menciona opciones que funcionan como indicador de probabilidad:
- Creación de la oferta
- En negociación
- Riesgo
- Pendiente por orden de compra

Estos coinciden con los estados de cotización definidos en HU-0003.

---

**Documento generado por**: @business-analyst
**Fecha**: 2025-12-17
**Versión**: 2.0 (Corregido flujo financiero)
