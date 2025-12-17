// Mock data para sistema Make to Order - PS Comercial
// Basado en el UI Template de Prosuministros

// ============================================
// INTERFACES TYPESCRIPT
// ============================================

export interface Permiso {
  id: string;
  modulo: 'leads' | 'cotizaciones' | 'pedidos' | 'reportes' | 'configuracion' | 'usuarios' | 'financiero' | 'compras' | 'logistica';
  accion: 'crear' | 'editar' | 'ver' | 'eliminar' | 'aprobar' | 'exportar';
  descripcion: string;
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  estado: 'activo' | 'inactivo';
  permisos: string[];
  creadoPor: string;
  creadoEn: string;
  modificadoPor?: string;
  modificadoEn?: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  avatar: string;
  rol: string;
  roles: string[];
  estado: 'activo' | 'inactivo';
  area: string;
  ultimaActividad?: string;
  creadoPor: string;
  creadoEn: string;
}

export interface BloqueoCartera {
  id: string;
  clienteNit: string;
  clienteRazonSocial: string;
  bloqueado: boolean;
  motivo?: string;
  montoDeuda?: number;
  diasVencimiento?: number;
  bloqueadoPor?: string;
  bloqueadoEn?: string;
  desbloqueadoPor?: string;
  desbloqueadoEn?: string;
}

export interface ConfiguracionMargen {
  id: string;
  categoria: 'software' | 'hardware' | 'partes' | 'servicios';
  margenMinimo: number;
  margenObjetivo: number;
  requiereAprobacion: boolean;
  nivelAprobacion: 'gerencia' | 'financiera' | 'direccion';
}

export interface ConversacionWhatsApp {
  id: string;
  telefono: string;
  nombreContacto?: string;
  leadId?: string;
  estado: 'activa' | 'cerrada' | 'pausada';
  ultimoMensaje: string;
  ultimoMensajeEn: string;
  mensajesNoLeidos: number;
  mensajes: MensajeWhatsApp[];
  creadoEn: string;
}

export interface MensajeWhatsApp {
  id: string;
  conversacionId: string;
  direccion: 'entrante' | 'saliente';
  remitente: 'bot' | 'usuario' | 'asesor';
  contenido: string;
  tipo: 'texto' | 'imagen' | 'documento' | 'template';
  adjuntos?: string[];
  creadoEn: string;
  leido: boolean;
}

export interface TemplateWhatsApp {
  id: string;
  nombre: string;
  categoria: 'bienvenida' | 'cotizacion' | 'seguimiento' | 'confirmacion' | 'recordatorio';
  contenido: string;
  variables: string[];
  activo: boolean;
}

export interface Lead {
  id: string;
  numero: number;
  origen: 'WhatsApp' | 'Web' | 'Manual' | 'Email' | 'Teléfono';
  asignadoA: string;
  asignadoEn?: string;
  asignadoPor?: string;
  razonSocial: string;
  nit: string;
  nombreContacto: string;
  email: string;
  telefono: string;
  requerimiento: string;
  fechaLead: string;
  estado: 'creado' | 'pendiente' | 'en_gestion' | 'convertido' | 'descartado';
  motivoDescarte?: string;
  alerta24h: boolean;
  creadoPor: string;
  creadoEn: string;
  convertidoEn?: string;
  margenEstimado?: number;
  observaciones?: ObservacionLead[];
  conversacionWhatsAppId?: string;
}

export interface ObservacionLead {
  id: string;
  usuarioId: string;
  usuario: string;
  texto: string;
  menciones: string[];
  creadoEn: string;
}

export interface ItemCotizacion {
  id: string;
  sku: string;
  descripcion: string;
  categoria: 'software' | 'hardware' | 'partes';
  cantidad: number;
  costoUnitario: number;
  precioUnitario: number;
  impuesto: number;
  margen: number;
}

export interface Cotizacion {
  id: string;
  numero: number;
  fechaCotizacion: string;
  estadoCotizacion: 'borrador' | 'enviada' | 'aprobada' | 'rechazada' | 'vencida';
  estado: string;
  razonSocial: string;
  nit: string;
  nombreContacto: string;
  email: string;
  telefono: string;
  asunto: string;
  items: ItemCotizacion[];
  observaciones: string;
  subtotal: number;
  impuestos: number;
  total: number;
  totalCosto: number;
  totalVenta: number;
  margenPct: number;
  vigencia: number;
  terminosPago: string;
  creadoPor: string;
  creadoEn: string;
  modificadoEn?: string;
  enviadaEn?: string;
  aprobadaEn?: string;
  vencimiento: string;
  margen: number;
  requiereAprobacion?: boolean;
  aprobadoPor?: string;
  aprobadoEn?: string;
  aprobacionGerenciaRequerida?: boolean;
  aprobacionFinancieraRequerida?: boolean;
  clienteBloqueado?: boolean;
  leadId?: string;
  asignadoA?: string;
  trm?: number;
  costoTransporte?: number;
  incluirTransporte?: boolean;
}

export interface Pedido {
  id: string;
  numero: number;
  cotizacionId?: string;
  fechaPedido: string;
  estado: 'por_facturar' | 'facturado_sin_pago' | 'pendiente_compra' | 'en_bodega' | 'despachado' | 'entregado' | 'pendiente' | 'aprobado' | 'en_proceso' | 'completado' | 'cancelado';
  razonSocial: string;
  nit: string;
  contacto: string;
  email: string;
  telefono: string;
  asunto: string;
  items: ItemCotizacion[];
  observaciones: string;
  subtotal: number;
  impuestos: number;
  total: number;
  moneda: string;
  terminosPago: string;
  creadoPor: string;
  creadoEn: string;
  modificadoEn?: string;
  facturado?: boolean;
  fechaFacturacion?: string;
  numeroFactura?: string;
  pagoConfirmado?: boolean;
  fechaPagoConfirmado?: string;
  compraRealizada?: boolean;
  fechaCompra?: string;
  enBodega?: boolean;
  fechaRecepcion?: string;
  fechaDespacho?: string;
  fechaEntrega?: string;
  cantidadPendienteCompra: number;
  facturacionAnticipadaRequerida: string;
  estadoRemision: string;
  estadoFactura: string;
  direccionEntrega?: DireccionEntrega;
}

export interface DireccionEntrega {
  direccion: string;
  ciudad: string;
  departamento: string;
  indicaciones?: string;
}

export interface InformacionDespacho {
  pedidoId: string;
  nombreRecibe: string;
  telefono: string;
  direccion: string;
  departamento: string;
  ciudad: string;
  horarioEntrega: string;
  emailGuia: string;
  tipoDespacho: string;
  tipoFactura: string;
  facturaConConfirmacion: string;
  bloqueado: boolean;
  transportadora?: string;
  guia?: string;
  fechaEstimadaEntrega?: string;
  observaciones?: string;
}

export interface Observacion {
  id: string;
  pedidoId: string;
  remitente: string;
  destinatarios: string[];
  texto: string;
  creadoEn: string;
  inmutable: boolean;
}

export interface Notificacion {
  id: string;
  tipo: 'cotizacion_enviada' | 'pedido_nuevo' | 'lead_nuevo' | 'aprobacion_requerida' | 'pago_confirmado';
  titulo: string;
  mensaje: string;
  leida: boolean;
  creadoEn: string;
  vinculo?: {
    tipo: 'cotizacion' | 'pedido' | 'lead';
    id: string;
  };
}

export interface MetricaDashboard {
  id: string;
  label: string;
  valor: string;
  cambio: number;
  tendencia: 'up' | 'down' | 'neutral';
}

// ============================================
// DEPARTAMENTOS DE COLOMBIA
// ============================================

export interface Departamento {
  codigo: string;
  nombre: string;
}

export const departamentos: Departamento[] = [
  { codigo: 'AMZ', nombre: 'Amazonas' },
  { codigo: 'ANT', nombre: 'Antioquia' },
  { codigo: 'ARA', nombre: 'Arauca' },
  { codigo: 'ATL', nombre: 'Atlántico' },
  { codigo: 'BOL', nombre: 'Bolívar' },
  { codigo: 'BOY', nombre: 'Boyacá' },
  { codigo: 'CAL', nombre: 'Caldas' },
  { codigo: 'CAQ', nombre: 'Caquetá' },
  { codigo: 'CAS', nombre: 'Casanare' },
  { codigo: 'CAU', nombre: 'Cauca' },
  { codigo: 'CES', nombre: 'Cesar' },
  { codigo: 'CHO', nombre: 'Chocó' },
  { codigo: 'COR', nombre: 'Córdoba' },
  { codigo: 'CUN', nombre: 'Cundinamarca' },
  { codigo: 'GUA', nombre: 'Guainía' },
  { codigo: 'GUV', nombre: 'Guaviare' },
  { codigo: 'HUI', nombre: 'Huila' },
  { codigo: 'LAG', nombre: 'La Guajira' },
  { codigo: 'MAG', nombre: 'Magdalena' },
  { codigo: 'MET', nombre: 'Meta' },
  { codigo: 'NAR', nombre: 'Nariño' },
  { codigo: 'NSA', nombre: 'Norte de Santander' },
  { codigo: 'PUT', nombre: 'Putumayo' },
  { codigo: 'QUI', nombre: 'Quindío' },
  { codigo: 'RIS', nombre: 'Risaralda' },
  { codigo: 'SAP', nombre: 'San Andrés y Providencia' },
  { codigo: 'SAN', nombre: 'Santander' },
  { codigo: 'SUC', nombre: 'Sucre' },
  { codigo: 'TOL', nombre: 'Tolima' },
  { codigo: 'VAC', nombre: 'Valle del Cauca' },
  { codigo: 'VAU', nombre: 'Vaupés' },
  { codigo: 'VID', nombre: 'Vichada' },
];

// ============================================
// CONFIGURACIÓN DE LA APP
// ============================================

export const configApp = {
  nombre: 'PS Comercial',
  tagline: 'Sistema Make to Order',
  descripcion: 'Gestión integral de leads, cotizaciones y pedidos',
  version: '1.0.0',
  emailSoporte: 'soporte@pscomercial.com',
};

// ============================================
// USUARIOS
// ============================================

export const usuarios: Usuario[] = [
  {
    id: '1',
    nombre: 'Carlos Mendoza',
    email: 'carlos@pscomercial.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    rol: 'Administrador',
    roles: ['rol-1'],
    estado: 'activo',
    area: 'Administración',
    creadoPor: 'Sistema',
    creadoEn: '2025-10-24T09:00:00Z',
  },
  {
    id: '2',
    nombre: 'Ana García',
    email: 'ana@pscomercial.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
    rol: 'Comercial',
    roles: ['rol-2'],
    estado: 'activo',
    area: 'Comercial',
    creadoPor: 'Sistema',
    creadoEn: '2025-10-24T09:30:00Z',
  },
  {
    id: '3',
    nombre: 'Roberto Silva',
    email: 'roberto@pscomercial.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto',
    rol: 'Gerencia',
    roles: ['rol-3'],
    estado: 'activo',
    area: 'Gerencia',
    creadoPor: 'Sistema',
    creadoEn: '2025-10-24T09:30:00Z',
  },
  {
    id: '4',
    nombre: 'Laura Ramírez',
    email: 'laura@pscomercial.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
    rol: 'Financiera',
    roles: ['rol-4'],
    estado: 'activo',
    area: 'Financiera',
    creadoPor: 'Sistema',
    creadoEn: '2025-10-24T09:30:00Z',
  },
];

export const usuarioActual = usuarios[0]!;

// ============================================
// TEMPLATES WHATSAPP
// ============================================

export const templatesWhatsApp: TemplateWhatsApp[] = [
  {
    id: 'tpl-1',
    nombre: 'Bienvenida',
    categoria: 'bienvenida',
    contenido: '¡Hola! Bienvenido a PS Comercial. Tu aliado en hardware, software y servicios IT.\n\n1. Solicitar cotización\n2. Consultar pedido\n3. Asesoría comercial\n4. Otro motivo',
    variables: [],
    activo: true,
  },
  {
    id: 'tpl-2',
    nombre: 'Confirmación Lead',
    categoria: 'confirmacion',
    contenido: '¡Excelente, {{nombre_contacto}}! Ya registramos tu solicitud con el código LEAD-{{numero_lead}}. Muy pronto uno de nuestros asesores se pondrá en contacto contigo.',
    variables: ['nombre_contacto', 'numero_lead'],
    activo: true,
  },
  {
    id: 'tpl-3',
    nombre: 'Envío Cotización',
    categoria: 'cotizacion',
    contenido: 'Hola {{nombre_contacto}}, te enviamos la cotización #{{numero_cotizacion}} para {{asunto}}. Puedes revisarla en el siguiente enlace: {{link_cotizacion}}',
    variables: ['nombre_contacto', 'numero_cotizacion', 'asunto', 'link_cotizacion'],
    activo: true,
  },
];

// ============================================
// CONVERSACIONES WHATSAPP
// ============================================

export const conversacionesWhatsApp: ConversacionWhatsApp[] = [
  {
    id: 'conv-1',
    telefono: '+57 310 555 0100',
    nombreContacto: 'Pedro Martínez',
    leadId: '1',
    estado: 'activa',
    ultimoMensaje: 'Perfecto! ¿Cuántas laptops necesitas?',
    ultimoMensajeEn: '2025-12-10T09:26:00Z',
    mensajesNoLeidos: 1,
    mensajes: [
      {
        id: 'msg-1',
        conversacionId: 'conv-1',
        direccion: 'entrante',
        remitente: 'usuario',
        contenido: 'Hola, necesito información',
        tipo: 'texto',
        creadoEn: '2025-12-10T09:20:00Z',
        leido: true,
      },
      {
        id: 'msg-2',
        conversacionId: 'conv-1',
        direccion: 'saliente',
        remitente: 'bot',
        contenido: '¡Hola! Bienvenido a PS Comercial. ¿En qué podemos ayudarte?',
        tipo: 'template',
        creadoEn: '2025-12-10T09:20:05Z',
        leido: true,
      },
      {
        id: 'msg-3',
        conversacionId: 'conv-1',
        direccion: 'entrante',
        remitente: 'usuario',
        contenido: 'Necesito cotización para laptops',
        tipo: 'texto',
        creadoEn: '2025-12-10T09:25:00Z',
        leido: true,
      },
      {
        id: 'msg-4',
        conversacionId: 'conv-1',
        direccion: 'saliente',
        remitente: 'asesor',
        contenido: 'Perfecto! ¿Cuántas laptops necesitas?',
        tipo: 'texto',
        creadoEn: '2025-12-10T09:26:00Z',
        leido: false,
      },
    ],
    creadoEn: '2025-12-10T09:20:00Z',
  },
  {
    id: 'conv-2',
    telefono: '+57 320 444 0200',
    nombreContacto: 'María González',
    estado: 'activa',
    ultimoMensaje: 'Gracias! Estoy revisando la cotización',
    ultimoMensajeEn: '2025-12-10T08:15:00Z',
    mensajesNoLeidos: 0,
    mensajes: [],
    creadoEn: '2025-12-10T07:30:00Z',
  },
  {
    id: 'conv-3',
    telefono: '+57 315 888 0300',
    nombreContacto: 'Carlos Ruiz',
    leadId: '2',
    estado: 'pausada',
    ultimoMensaje: 'Ok, te aviso cuando estén listos',
    ultimoMensajeEn: '2025-12-09T16:45:00Z',
    mensajesNoLeidos: 0,
    mensajes: [],
    creadoEn: '2025-12-09T16:30:00Z',
  },
];

// ============================================
// LEADS
// ============================================

export const leads: Lead[] = [
  {
    id: '1',
    numero: 100,
    origen: 'WhatsApp',
    asignadoA: 'Ana García',
    razonSocial: 'El Sol Restaurante',
    nit: '900.123.456-7',
    nombreContacto: 'Sofía Hernández',
    email: 'sofia@elsol.com',
    telefono: '+57 310 555 0100',
    requerimiento: 'Sistema POS + Módulos de facturación electrónica',
    fechaLead: '2025-10-23T10:30:00Z',
    estado: 'pendiente',
    alerta24h: true,
    creadoPor: 'Ana García',
    creadoEn: '2025-10-23T10:30:00Z',
    margenEstimado: 32,
    observaciones: [],
  },
  {
    id: '2',
    numero: 101,
    origen: 'Web',
    asignadoA: 'Ana García',
    razonSocial: 'TechCorp S.A.S.',
    nit: '900.654.321-8',
    nombreContacto: 'Miguel Ángel Torres',
    email: 'mtorres@techcorp.co',
    telefono: '+57 311 444 0200',
    requerimiento: '10 Laptops HP + Licencias Microsoft Office',
    fechaLead: '2025-10-22T14:15:00Z',
    estado: 'en_gestion',
    alerta24h: false,
    creadoPor: 'Sistema Web',
    creadoEn: '2025-10-22T14:15:00Z',
    margenEstimado: 28,
    observaciones: [],
  },
  {
    id: '3',
    numero: 102,
    origen: 'Email',
    asignadoA: 'Roberto Silva',
    razonSocial: 'Distribuidora Nacional',
    nit: '900.789.012-3',
    nombreContacto: 'Carolina Pérez',
    email: 'carolina@distnacional.com',
    telefono: '+57 312 333 0300',
    requerimiento: 'Servidor y equipos de red para nueva sede',
    fechaLead: '2025-10-21T09:00:00Z',
    estado: 'convertido',
    alerta24h: false,
    creadoPor: 'Roberto Silva',
    creadoEn: '2025-10-21T09:00:00Z',
    convertidoEn: '2025-10-22T16:00:00Z',
    margenEstimado: 35,
    observaciones: [],
  },
  {
    id: '4',
    numero: 103,
    origen: 'Teléfono',
    asignadoA: 'Ana García',
    razonSocial: 'Inversiones XYZ',
    nit: '900.456.789-0',
    nombreContacto: 'Fernando López',
    email: 'fernando@invxyz.com',
    telefono: '+57 313 222 0400',
    requerimiento: 'Actualización de equipos de cómputo',
    fechaLead: '2025-10-20T11:30:00Z',
    estado: 'descartado',
    motivoDescarte: 'Presupuesto insuficiente',
    alerta24h: false,
    creadoPor: 'Ana García',
    creadoEn: '2025-10-20T11:30:00Z',
    margenEstimado: 25,
    observaciones: [],
  },
  {
    id: '5',
    numero: 104,
    origen: 'WhatsApp',
    asignadoA: 'Roberto Silva',
    razonSocial: 'Comercial Los Andes',
    nit: '900.555.666-4',
    nombreContacto: 'Andrea López',
    email: 'alopez@losandes.com',
    telefono: '+57 301 777 0400',
    requerimiento: 'Monitores para sala de conferencias',
    fechaLead: '2025-12-09T08:00:00Z',
    estado: 'pendiente',
    alerta24h: true,
    creadoPor: 'Sistema WhatsApp',
    creadoEn: '2025-12-09T08:00:00Z',
    margenEstimado: 30,
    observaciones: [],
  },
];

// ============================================
// COTIZACIONES
// ============================================

export const cotizaciones: Cotizacion[] = [
  {
    id: '1',
    numero: 30000,
    fechaCotizacion: '2025-10-23T15:00:00Z',
    estadoCotizacion: 'enviada',
    estado: '60',
    razonSocial: 'El Sol Restaurante',
    nit: '900.123.456-7',
    nombreContacto: 'Sofía Hernández',
    email: 'sofia@elsol.com',
    telefono: '+57 310 555 0100',
    asunto: 'Sistema POS y facturación electrónica',
    items: [
      {
        id: '1',
        sku: 'SW-001',
        descripcion: 'Sistema POS RestauPro - Licencia anual',
        categoria: 'software',
        cantidad: 1,
        costoUnitario: 2500000,
        precioUnitario: 3500000,
        impuesto: 19,
        margen: 40,
      },
      {
        id: '2',
        sku: 'HW-045',
        descripcion: 'Terminal táctil 15" todo en uno',
        categoria: 'hardware',
        cantidad: 2,
        costoUnitario: 1800000,
        precioUnitario: 2400000,
        impuesto: 19,
        margen: 33,
      },
    ],
    observaciones: 'Incluye instalación y capacitación',
    subtotal: 8300000,
    impuestos: 1577000,
    total: 9877000,
    totalCosto: 6100000,
    totalVenta: 8300000,
    margenPct: 36,
    vigencia: 15,
    terminosPago: 'Contado',
    creadoPor: 'Ana García',
    creadoEn: '2025-10-23T15:00:00Z',
    enviadaEn: '2025-10-23T15:30:00Z',
    vencimiento: '2025-11-07T23:59:59Z',
    margen: 36,
    leadId: '1',
    aprobacionGerenciaRequerida: false,
    aprobacionFinancieraRequerida: false,
    clienteBloqueado: false,
  },
  {
    id: '2',
    numero: 30001,
    fechaCotizacion: '2025-10-22T16:30:00Z',
    estadoCotizacion: 'aprobada',
    estado: '80',
    razonSocial: 'TechCorp S.A.S.',
    nit: '900.654.321-8',
    nombreContacto: 'Miguel Ángel Torres',
    email: 'mtorres@techcorp.co',
    telefono: '+57 311 444 0200',
    asunto: 'Laptops corporativas y licencias Office',
    items: [
      {
        id: '1',
        sku: 'HW-101',
        descripcion: 'Laptop HP ProBook 450 G10 - i7 16GB 512GB SSD',
        categoria: 'hardware',
        cantidad: 10,
        costoUnitario: 3200000,
        precioUnitario: 3840000,
        impuesto: 19,
        margen: 20,
      },
      {
        id: '2',
        sku: 'SW-020',
        descripcion: 'Microsoft Office 365 Business - Licencia anual',
        categoria: 'software',
        cantidad: 10,
        costoUnitario: 350000,
        precioUnitario: 420000,
        impuesto: 19,
        margen: 20,
      },
    ],
    observaciones: 'Entrega en Bogotá',
    subtotal: 42600000,
    impuestos: 8094000,
    total: 50694000,
    totalCosto: 35500000,
    totalVenta: 42600000,
    margenPct: 20,
    vigencia: 10,
    terminosPago: '30 días',
    creadoPor: 'Ana García',
    creadoEn: '2025-10-22T16:30:00Z',
    enviadaEn: '2025-10-22T16:35:00Z',
    aprobadaEn: '2025-10-23T09:00:00Z',
    vencimiento: '2025-11-01T23:59:59Z',
    margen: 20,
    requiereAprobacion: true,
    aprobacionGerenciaRequerida: true,
    aprobacionFinancieraRequerida: false,
    clienteBloqueado: false,
    leadId: '2',
  },
  {
    id: '3',
    numero: 30002,
    fechaCotizacion: '2025-12-10T10:00:00Z',
    estadoCotizacion: 'borrador',
    estado: '40',
    razonSocial: 'Distribuidora XYZ',
    nit: '900.777.888-9',
    nombreContacto: 'Carlos Ruiz',
    email: 'cruiz@distribuidoraxyz.com',
    telefono: '+57 315 888 0300',
    asunto: 'Equipos de red empresarial',
    items: [
      {
        id: '1',
        sku: 'HW-220',
        descripcion: 'Switch Cisco 24 puertos',
        categoria: 'hardware',
        cantidad: 5,
        costoUnitario: 800000,
        precioUnitario: 1100000,
        impuesto: 19,
        margen: 37,
      },
    ],
    observaciones: 'Cotización en proceso de ajuste',
    subtotal: 5500000,
    impuestos: 1045000,
    total: 6545000,
    totalCosto: 4000000,
    totalVenta: 5500000,
    margenPct: 37,
    vigencia: 30,
    terminosPago: 'Contado',
    creadoPor: 'Ana García',
    creadoEn: '2025-12-10T10:00:00Z',
    vencimiento: '2026-01-09T23:59:59Z',
    margen: 37,
    aprobacionGerenciaRequerida: false,
    aprobacionFinancieraRequerida: false,
    clienteBloqueado: false,
  },
  {
    id: '4',
    numero: 30003,
    fechaCotizacion: '2025-11-15T09:00:00Z',
    estadoCotizacion: 'rechazada',
    estado: 'perdida',
    razonSocial: 'Textiles del Norte',
    nit: '900.444.555-6',
    nombreContacto: 'Patricia Gómez',
    email: 'pgomez@textilesnorte.com',
    telefono: '+57 302 333 4444',
    asunto: 'Licencias de software contable',
    items: [
      {
        id: '1',
        sku: 'SW-150',
        descripcion: 'Software contable Empresarial - 10 usuarios',
        categoria: 'software',
        cantidad: 1,
        costoUnitario: 4500000,
        precioUnitario: 6000000,
        impuesto: 19,
        margen: 33,
      },
    ],
    observaciones: 'Cliente decidió optar por otra solución',
    subtotal: 6000000,
    impuestos: 1140000,
    total: 7140000,
    totalCosto: 4500000,
    totalVenta: 6000000,
    margenPct: 25,
    vigencia: 15,
    terminosPago: 'Contado',
    creadoPor: 'Ana García',
    creadoEn: '2025-11-15T09:00:00Z',
    enviadaEn: '2025-11-15T10:00:00Z',
    vencimiento: '2025-11-30T23:59:59Z',
    margen: 25,
    aprobacionGerenciaRequerida: true,
    aprobacionFinancieraRequerida: true,
    clienteBloqueado: false,
  },
];

// ============================================
// PEDIDOS
// ============================================

export const pedidos: Pedido[] = [
  {
    id: '1',
    numero: 20000,
    cotizacionId: '2',
    fechaPedido: '2025-10-23T09:30:00Z',
    estado: 'por_facturar',
    razonSocial: 'TechCorp S.A.S.',
    nit: '900.654.321-8',
    contacto: 'Miguel Ángel Torres',
    email: 'mtorres@techcorp.co',
    telefono: '+57 311 444 0200',
    asunto: 'Laptops corporativas y licencias Office',
    items: [
      {
        id: '1',
        sku: 'HW-101',
        descripcion: 'Laptop HP ProBook 450 G10 - i7 16GB 512GB SSD',
        categoria: 'hardware',
        cantidad: 10,
        costoUnitario: 3200000,
        precioUnitario: 3840000,
        impuesto: 19,
        margen: 20,
      },
    ],
    observaciones: 'Cliente solicita entrega en horas de la mañana',
    subtotal: 42600000,
    impuestos: 8094000,
    total: 50694000,
    moneda: 'COP',
    terminosPago: '30 días',
    creadoPor: 'Ana García',
    creadoEn: '2025-10-23T09:30:00Z',
    facturado: false,
    pagoConfirmado: false,
    cantidadPendienteCompra: 10,
    facturacionAnticipadaRequerida: 'No',
    estadoRemision: 'Pendiente',
    estadoFactura: 'Pendiente',
    direccionEntrega: {
      direccion: 'Calle 100 # 19-61',
      ciudad: 'Bogotá',
      departamento: 'Cundinamarca',
      indicaciones: 'Coordinar con recepción del edificio',
    },
  },
  {
    id: '2',
    numero: 20001,
    cotizacionId: '1',
    fechaPedido: '2025-12-08T14:00:00Z',
    estado: 'facturado_sin_pago',
    razonSocial: 'El Sol Restaurante',
    nit: '900.123.456-7',
    contacto: 'Sofía Hernández',
    email: 'sofia@elsol.com',
    telefono: '+57 310 555 0100',
    asunto: 'Sistema POS y facturación electrónica',
    items: [],
    observaciones: 'Factura enviada, pendiente de pago',
    subtotal: 8300000,
    impuestos: 1577000,
    total: 9877000,
    moneda: 'COP',
    terminosPago: 'Contado',
    creadoPor: 'Ana García',
    creadoEn: '2025-12-08T14:00:00Z',
    facturado: true,
    fechaFacturacion: '2025-12-08T15:00:00Z',
    numeroFactura: 'FAC-2025-001',
    pagoConfirmado: false,
    cantidadPendienteCompra: 0,
    facturacionAnticipadaRequerida: 'No',
    estadoRemision: 'Emitida',
    estadoFactura: 'Emitida',
    direccionEntrega: {
      direccion: 'Carrera 7 # 45-23',
      ciudad: 'Bogotá',
      departamento: 'Cundinamarca',
    },
  },
  {
    id: '3',
    numero: 20002,
    fechaPedido: '2025-12-05T10:00:00Z',
    estado: 'pendiente_compra',
    razonSocial: 'Comercial Los Andes',
    nit: '900.555.666-4',
    contacto: 'Andrea López',
    email: 'alopez@losandes.com',
    telefono: '+57 301 777 0400',
    asunto: 'Monitores Dell 27 pulgadas',
    items: [],
    observaciones: 'Pendiente orden de compra al proveedor',
    subtotal: 18000000,
    impuestos: 3420000,
    total: 21420000,
    moneda: 'COP',
    terminosPago: 'Contado',
    creadoPor: 'Ana García',
    creadoEn: '2025-12-05T10:00:00Z',
    facturado: true,
    pagoConfirmado: true,
    fechaPagoConfirmado: '2025-12-05T16:00:00Z',
    compraRealizada: false,
    cantidadPendienteCompra: 15,
    facturacionAnticipadaRequerida: 'Sí',
    estadoRemision: 'Pendiente',
    estadoFactura: 'Emitida',
    direccionEntrega: {
      direccion: 'Avenida 68 # 12-34',
      ciudad: 'Medellín',
      departamento: 'Antioquia',
    },
  },
  {
    id: '4',
    numero: 20003,
    fechaPedido: '2025-12-03T09:00:00Z',
    estado: 'en_bodega',
    razonSocial: 'Soluciones IT Colombia',
    nit: '900.222.333-5',
    contacto: 'Roberto Sánchez',
    email: 'rsanchez@solucionesit.com',
    telefono: '+57 318 666 0500',
    asunto: 'Switch Cisco 24 puertos x 8',
    items: [],
    observaciones: 'Productos recibidos en bodega, listos para despacho',
    subtotal: 8800000,
    impuestos: 1672000,
    total: 10472000,
    moneda: 'COP',
    terminosPago: '15 días',
    creadoPor: 'Ana García',
    creadoEn: '2025-12-03T09:00:00Z',
    facturado: true,
    pagoConfirmado: true,
    compraRealizada: true,
    enBodega: true,
    fechaRecepcion: '2025-12-06T10:00:00Z',
    cantidadPendienteCompra: 0,
    facturacionAnticipadaRequerida: 'No',
    estadoRemision: 'Emitida',
    estadoFactura: 'Pagada',
    direccionEntrega: {
      direccion: 'Calle 50 # 25-10',
      ciudad: 'Cali',
      departamento: 'Valle del Cauca',
    },
  },
  {
    id: '5',
    numero: 20004,
    fechaPedido: '2025-12-01T11:00:00Z',
    estado: 'despachado',
    razonSocial: 'Empresas Unidas S.A.',
    nit: '900.888.999-7',
    contacto: 'Fernando Castillo',
    email: 'fcastillo@empresasunidas.com',
    telefono: '+57 305 999 1000',
    asunto: 'UPS APC 1500VA x 12',
    items: [],
    observaciones: 'Despachado vía Servientrega, guía SRV-2024-5678',
    subtotal: 10800000,
    impuestos: 2052000,
    total: 12852000,
    moneda: 'COP',
    terminosPago: 'Contado',
    creadoPor: 'Ana García',
    creadoEn: '2025-12-01T11:00:00Z',
    facturado: true,
    pagoConfirmado: true,
    compraRealizada: true,
    enBodega: true,
    fechaDespacho: '2025-12-07T08:00:00Z',
    cantidadPendienteCompra: 0,
    facturacionAnticipadaRequerida: 'No',
    estadoRemision: 'Emitida',
    estadoFactura: 'Pagada',
    direccionEntrega: {
      direccion: 'Carrera 15 # 80-45',
      ciudad: 'Barranquilla',
      departamento: 'Atlántico',
      indicaciones: 'Entregar en portería principal',
    },
  },
  {
    id: '6',
    numero: 20005,
    fechaPedido: '2025-11-25T10:00:00Z',
    estado: 'entregado',
    razonSocial: 'Grupo Empresarial XYZ',
    nit: '900.444.777-8',
    contacto: 'Luis Herrera',
    email: 'lherrera@grupoxyz.com',
    telefono: '+57 304 333 0700',
    asunto: 'Antivirus Kaspersky Empresarial - 50 licencias',
    items: [],
    observaciones: 'Pedido entregado y firmado conforme',
    subtotal: 3900000,
    impuestos: 741000,
    total: 4641000,
    moneda: 'COP',
    terminosPago: 'Contado',
    creadoPor: 'Ana García',
    creadoEn: '2025-11-25T10:00:00Z',
    facturado: true,
    pagoConfirmado: true,
    compraRealizada: true,
    enBodega: true,
    fechaDespacho: '2025-11-29T10:00:00Z',
    fechaEntrega: '2025-12-01T14:30:00Z',
    cantidadPendienteCompra: 0,
    facturacionAnticipadaRequerida: 'No',
    estadoRemision: 'Emitida',
    estadoFactura: 'Pagada',
    direccionEntrega: {
      direccion: 'Calle 72 # 10-20',
      ciudad: 'Bogotá',
      departamento: 'Cundinamarca',
    },
  },
];

// ============================================
// NOTIFICACIONES
// ============================================

export const notificaciones: Notificacion[] = [
  {
    id: '1',
    tipo: 'cotizacion_enviada',
    titulo: 'Cotización enviada',
    mensaje: 'Cotización #30000 enviada a El Sol Restaurante',
    leida: false,
    creadoEn: '2025-10-23T15:30:00Z',
    vinculo: { tipo: 'cotizacion', id: '1' },
  },
  {
    id: '2',
    tipo: 'pedido_nuevo',
    titulo: 'Nuevo pedido',
    mensaje: 'Pedido #20000 creado desde cotización #30001',
    leida: false,
    creadoEn: '2025-10-23T09:30:00Z',
    vinculo: { tipo: 'pedido', id: '1' },
  },
  {
    id: '3',
    tipo: 'lead_nuevo',
    titulo: 'Nuevo lead',
    mensaje: 'Lead #100 creado desde WhatsApp',
    leida: true,
    creadoEn: '2025-10-23T10:30:00Z',
    vinculo: { tipo: 'lead', id: '1' },
  },
  {
    id: '4',
    tipo: 'aprobacion_requerida',
    titulo: 'Aprobación requerida',
    mensaje: 'Cotización #30001 requiere aprobación por margen bajo',
    leida: false,
    creadoEn: '2025-10-22T16:40:00Z',
    vinculo: { tipo: 'cotizacion', id: '2' },
  },
];

// ============================================
// OBSERVACIONES DE PEDIDOS
// ============================================

export const observaciones: Observacion[] = [
  {
    id: '1',
    pedidoId: '1',
    remitente: 'Ana García',
    destinatarios: ['mtorres@techcorp.co', 'logistica@pscomercial.com'],
    texto: 'Cliente solicita entrega preferiblemente en horas de la mañana. Coordinar con recepción del edificio.',
    creadoEn: '2025-10-24T12:00:00Z',
    inmutable: true,
  },
  {
    id: '2',
    pedidoId: '4',
    remitente: 'Roberto Silva',
    destinatarios: ['rsanchez@solucionesit.com'],
    texto: 'Productos ya en bodega. Programar despacho para mañana.',
    creadoEn: '2025-12-06T14:00:00Z',
    inmutable: true,
  },
];

// ============================================
// INFORMACIÓN DE DESPACHO
// ============================================

export const informacionDespacho: InformacionDespacho[] = [
  {
    pedidoId: '1',
    nombreRecibe: 'Miguel Ángel Torres',
    telefono: '+57 311 444 0200',
    direccion: 'Calle 100 # 19-61',
    departamento: 'Cundinamarca',
    ciudad: 'Bogotá',
    horarioEntrega: '8:00 AM - 12:00 PM',
    emailGuia: 'mtorres@techcorp.co',
    tipoDespacho: 'Normal',
    tipoFactura: 'Electrónica',
    facturaConConfirmacion: 'Sí',
    bloqueado: false,
    transportadora: 'Servientrega',
    observaciones: 'Coordinar con recepción del edificio',
  },
  {
    pedidoId: '5',
    nombreRecibe: 'Fernando Castillo',
    telefono: '+57 305 999 1000',
    direccion: 'Carrera 15 # 80-45',
    departamento: 'Atlántico',
    ciudad: 'Barranquilla',
    horarioEntrega: '2:00 PM - 6:00 PM',
    emailGuia: 'fcastillo@empresasunidas.com',
    tipoDespacho: 'Express',
    tipoFactura: 'Electrónica',
    facturaConConfirmacion: 'Sí',
    bloqueado: true,
    transportadora: 'Servientrega',
    guia: 'SRV-2024-5678',
    fechaEstimadaEntrega: '2025-12-09T14:00:00Z',
    observaciones: 'Entregar en portería principal',
  },
];

// ============================================
// MÉTRICAS DASHBOARD
// ============================================

export const metricasDashboard: MetricaDashboard[] = [
  {
    id: 'metric-1',
    label: 'Leads Nuevos',
    valor: '24',
    cambio: 5,
    tendencia: 'up',
  },
  {
    id: 'metric-2',
    label: 'Conversión',
    valor: '75%',
    cambio: 3,
    tendencia: 'up',
  },
  {
    id: 'metric-3',
    label: 'Cotizaciones',
    valor: '$285M',
    cambio: 10,
    tendencia: 'up',
  },
  {
    id: 'metric-4',
    label: 'Margen Prom.',
    valor: '28%',
    cambio: -2,
    tendencia: 'down',
  },
];

// ============================================
// PERMISOS
// ============================================

export const permisos: Permiso[] = [
  // Leads
  { id: 'perm-1', modulo: 'leads', accion: 'ver', descripcion: 'Ver listado de leads' },
  { id: 'perm-2', modulo: 'leads', accion: 'crear', descripcion: 'Crear nuevos leads' },
  { id: 'perm-3', modulo: 'leads', accion: 'editar', descripcion: 'Editar leads existentes' },
  { id: 'perm-4', modulo: 'leads', accion: 'eliminar', descripcion: 'Eliminar leads' },
  // Cotizaciones
  { id: 'perm-5', modulo: 'cotizaciones', accion: 'ver', descripcion: 'Ver listado de cotizaciones' },
  { id: 'perm-6', modulo: 'cotizaciones', accion: 'crear', descripcion: 'Crear cotizaciones' },
  { id: 'perm-7', modulo: 'cotizaciones', accion: 'editar', descripcion: 'Editar cotizaciones' },
  { id: 'perm-8', modulo: 'cotizaciones', accion: 'eliminar', descripcion: 'Eliminar cotizaciones' },
  { id: 'perm-9', modulo: 'cotizaciones', accion: 'aprobar', descripcion: 'Aprobar cotizaciones con margen bajo' },
  // Pedidos
  { id: 'perm-10', modulo: 'pedidos', accion: 'ver', descripcion: 'Ver listado de pedidos' },
  { id: 'perm-11', modulo: 'pedidos', accion: 'crear', descripcion: 'Crear pedidos' },
  { id: 'perm-12', modulo: 'pedidos', accion: 'editar', descripcion: 'Editar pedidos' },
  { id: 'perm-13', modulo: 'pedidos', accion: 'aprobar', descripcion: 'Aprobar pedidos' },
  // Financiero
  { id: 'perm-14', modulo: 'financiero', accion: 'ver', descripcion: 'Ver información financiera' },
  { id: 'perm-15', modulo: 'financiero', accion: 'editar', descripcion: 'Marcar bloqueo de cartera' },
  { id: 'perm-16', modulo: 'financiero', accion: 'aprobar', descripcion: 'Aprobar facturación anticipada' },
  // Reportes
  { id: 'perm-17', modulo: 'reportes', accion: 'ver', descripcion: 'Ver reportes' },
  { id: 'perm-18', modulo: 'reportes', accion: 'exportar', descripcion: 'Exportar reportes' },
  // Usuarios
  { id: 'perm-19', modulo: 'usuarios', accion: 'ver', descripcion: 'Ver usuarios' },
  { id: 'perm-20', modulo: 'usuarios', accion: 'crear', descripcion: 'Crear usuarios' },
  { id: 'perm-21', modulo: 'usuarios', accion: 'editar', descripcion: 'Editar usuarios' },
  // Configuración
  { id: 'perm-22', modulo: 'configuracion', accion: 'ver', descripcion: 'Ver configuración' },
  { id: 'perm-23', modulo: 'configuracion', accion: 'editar', descripcion: 'Modificar configuración' },
];

// ============================================
// ROLES
// ============================================

export const roles: Rol[] = [
  {
    id: 'rol-1',
    nombre: 'Administrador',
    descripcion: 'Acceso completo al sistema',
    estado: 'activo',
    permisos: permisos.map(p => p.id),
    creadoPor: 'Sistema',
    creadoEn: '2025-10-24T09:00:00Z',
  },
  {
    id: 'rol-2',
    nombre: 'Comercial',
    descripcion: 'Asesor comercial con acceso a leads y cotizaciones',
    estado: 'activo',
    permisos: ['perm-1', 'perm-2', 'perm-3', 'perm-5', 'perm-6', 'perm-7', 'perm-10'],
    creadoPor: 'Sistema',
    creadoEn: '2025-10-24T09:00:00Z',
  },
  {
    id: 'rol-3',
    nombre: 'Gerencia',
    descripcion: 'Gerente con permisos de aprobación',
    estado: 'activo',
    permisos: ['perm-1', 'perm-5', 'perm-6', 'perm-7', 'perm-9', 'perm-10', 'perm-11', 'perm-13', 'perm-17', 'perm-18'],
    creadoPor: 'Sistema',
    creadoEn: '2025-10-24T09:00:00Z',
  },
  {
    id: 'rol-4',
    nombre: 'Financiera',
    descripcion: 'Área financiera con control de cartera',
    estado: 'activo',
    permisos: ['perm-5', 'perm-10', 'perm-14', 'perm-15', 'perm-16', 'perm-17'],
    creadoPor: 'Sistema',
    creadoEn: '2025-10-24T09:00:00Z',
  },
  {
    id: 'rol-5',
    nombre: 'Logística',
    descripcion: 'Gestión de despachos y entregas',
    estado: 'activo',
    permisos: ['perm-10', 'perm-12'],
    creadoPor: 'Sistema',
    creadoEn: '2025-10-24T09:00:00Z',
  },
];

// ============================================
// BLOQUEOS DE CARTERA
// ============================================

export interface BitacoraBloqueo {
  id: string;
  bloqueoId: string;
  accion: 'bloquear' | 'desbloquear' | 'modificar';
  usuarioId: string;
  usuario: string;
  motivo: string;
  valorAnterior: boolean;
  valorNuevo: boolean;
  creadoEn: string;
}

export const bloqueosCartera: BloqueoCartera[] = [
  {
    id: 'blq-1',
    clienteNit: '900.555.888-1',
    clienteRazonSocial: 'Comercial ZYX S.A.',
    bloqueado: true,
    motivo: 'Cartera vencida mayor a 90 días',
    montoDeuda: 45000000,
    diasVencimiento: 95,
    bloqueadoPor: 'Laura Ramírez',
    bloqueadoEn: '2025-10-15T10:00:00Z',
  },
  {
    id: 'blq-2',
    clienteNit: '900.123.456-7',
    clienteRazonSocial: 'El Sol Restaurante',
    bloqueado: false,
    motivo: '',
    montoDeuda: 0,
    diasVencimiento: 0,
  },
  {
    id: 'blq-3',
    clienteNit: '900.654.321-8',
    clienteRazonSocial: 'TechCorp S.A.S.',
    bloqueado: false,
    motivo: '',
    montoDeuda: 12000000,
    diasVencimiento: 25,
  },
];

export const bitacoraBloqueos: BitacoraBloqueo[] = [
  {
    id: 'bit-blq-1',
    bloqueoId: 'blq-1',
    accion: 'bloquear',
    usuarioId: '4',
    usuario: 'Laura Ramírez',
    motivo: 'Cartera vencida mayor a 90 días',
    valorAnterior: false,
    valorNuevo: true,
    creadoEn: '2025-10-15T10:00:00Z',
  },
];

// ============================================
// CONFIGURACIÓN DE MÁRGENES
// ============================================

export const configuracionMargen: ConfiguracionMargen[] = [
  {
    id: 'cfg-1',
    categoria: 'software',
    margenMinimo: 25,
    margenObjetivo: 35,
    requiereAprobacion: true,
    nivelAprobacion: 'gerencia',
  },
  {
    id: 'cfg-2',
    categoria: 'hardware',
    margenMinimo: 20,
    margenObjetivo: 30,
    requiereAprobacion: true,
    nivelAprobacion: 'gerencia',
  },
  {
    id: 'cfg-3',
    categoria: 'partes',
    margenMinimo: 15,
    margenObjetivo: 25,
    requiereAprobacion: true,
    nivelAprobacion: 'financiera',
  },
  {
    id: 'cfg-4',
    categoria: 'servicios',
    margenMinimo: 30,
    margenObjetivo: 40,
    requiereAprobacion: true,
    nivelAprobacion: 'gerencia',
  },
];

// ============================================
// BITÁCORA ADMINISTRATIVA
// ============================================

export interface BitacoraAdministrativa {
  id: string;
  tipo: 'rol_creado' | 'rol_modificado' | 'rol_eliminado' | 'usuario_creado' | 'usuario_modificado' | 'rol_asignado' | 'permiso_modificado';
  entidadTipo: 'rol' | 'usuario' | 'permiso';
  entidadId: string;
  usuarioId: string;
  usuario: string;
  accion: string;
  valorAnterior?: unknown;
  valorNuevo?: unknown;
  descripcion: string;
  creadoEn: string;
}

export const bitacoraAdministrativa: BitacoraAdministrativa[] = [
  {
    id: 'bit-1',
    tipo: 'rol_creado',
    entidadTipo: 'rol',
    entidadId: 'rol-1',
    usuarioId: '1',
    usuario: 'Carlos Mendoza',
    accion: 'Creación de rol',
    descripcion: 'Se creó el rol Administrador con acceso completo',
    creadoEn: '2025-10-24T09:00:00Z',
  },
  {
    id: 'bit-2',
    tipo: 'usuario_creado',
    entidadTipo: 'usuario',
    entidadId: '2',
    usuarioId: '1',
    usuario: 'Carlos Mendoza',
    accion: 'Creación de usuario',
    descripcion: 'Se creó el usuario Ana García',
    creadoEn: '2025-10-24T09:30:00Z',
  },
  {
    id: 'bit-3',
    tipo: 'rol_asignado',
    entidadTipo: 'usuario',
    entidadId: '2',
    usuarioId: '1',
    usuario: 'Carlos Mendoza',
    accion: 'Asignación de rol',
    valorAnterior: [],
    valorNuevo: ['rol-2'],
    descripcion: 'Se asignó el rol Comercial a Ana García',
    creadoEn: '2025-10-24T09:31:00Z',
  },
  {
    id: 'bit-4',
    tipo: 'rol_modificado',
    entidadTipo: 'rol',
    entidadId: 'rol-2',
    usuarioId: '1',
    usuario: 'Carlos Mendoza',
    accion: 'Modificación de rol',
    descripcion: 'Se agregaron permisos de cotizaciones al rol Comercial',
    creadoEn: '2025-12-01T14:00:00Z',
  },
];

// ============================================
// DATOS PARA ANALYTICS
// ============================================

export const revenueChartData = [
  { name: 'Jun', revenue: 45000000, users: 120 },
  { name: 'Jul', revenue: 52000000, users: 145 },
  { name: 'Ago', revenue: 48000000, users: 135 },
  { name: 'Sep', revenue: 61000000, users: 168 },
  { name: 'Oct', revenue: 55000000, users: 152 },
  { name: 'Nov', revenue: 67000000, users: 189 },
  { name: 'Dic', revenue: 78000000, users: 215 },
];

export const trafficSourceData = [
  { name: 'WhatsApp', value: 4500 },
  { name: 'Web', value: 3200 },
  { name: 'Email', value: 2100 },
  { name: 'Teléfono', value: 1800 },
  { name: 'Referidos', value: 1400 },
];

// ============================================
// NOTIFICACIONES EXTENDIDAS (para Panel)
// ============================================

export interface NotificacionExtendida {
  id: string;
  tipo: 'automatica' | 'manual' | 'administrativa' | 'transaccional';
  mensaje: string;
  remitente: string;
  remitenteId: string;
  leida: boolean;
  respondida: boolean;
  importante: boolean;
  vinculo?: {
    tipo: 'cotizacion' | 'pedido' | 'lead';
    id: string;
    numero: number;
  };
  hilo?: {
    id: string;
    remitenteId: string;
    remitente: string;
    texto: string;
    creadoEn: string;
  }[];
  creadoEn: string;
}

export const notificacionesExtendidas: NotificacionExtendida[] = [
  {
    id: 'notif-1',
    tipo: 'automatica',
    mensaje: 'Lead #100 cumplió 24 horas sin gestión',
    remitente: 'Sistema',
    remitenteId: 'system',
    leida: false,
    respondida: false,
    importante: true,
    vinculo: { tipo: 'lead', id: '1', numero: 100 },
    creadoEn: new Date().toISOString(),
  },
  {
    id: 'notif-2',
    tipo: 'manual',
    mensaje: '@Ana por favor revisar cotización #30001, el cliente tiene dudas sobre el precio',
    remitente: 'Roberto Silva',
    remitenteId: '3',
    leida: false,
    respondida: false,
    importante: false,
    vinculo: { tipo: 'cotizacion', id: '2', numero: 30001 },
    hilo: [
      {
        id: 'hilo-1',
        remitenteId: '2',
        remitente: 'Ana García',
        texto: 'Ya lo revisé, envié respuesta al cliente',
        creadoEn: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
    ],
    creadoEn: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-3',
    tipo: 'transaccional',
    mensaje: 'Pedido #20000 cambió a estado "En Bodega"',
    remitente: 'Sistema',
    remitenteId: 'system',
    leida: true,
    respondida: false,
    importante: false,
    vinculo: { tipo: 'pedido', id: '1', numero: 20000 },
    creadoEn: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-4',
    tipo: 'administrativa',
    mensaje: 'Se requiere aprobación para cotización #30003 con margen del 18%',
    remitente: 'Sistema',
    remitenteId: 'system',
    leida: false,
    respondida: false,
    importante: true,
    vinculo: { tipo: 'cotizacion', id: '4', numero: 30003 },
    creadoEn: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-5',
    tipo: 'manual',
    mensaje: 'Cliente TechCorp confirmó reunión para mañana a las 10am',
    remitente: 'Ana García',
    remitenteId: '2',
    leida: true,
    respondida: true,
    importante: false,
    creadoEn: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];
