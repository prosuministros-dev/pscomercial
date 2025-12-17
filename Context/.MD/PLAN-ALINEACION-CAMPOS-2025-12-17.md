# PLAN DE ALINEACIÓN DE CAMPOS - PS COMERCIAL

> **Fecha**: 2025-12-17
> **Autor**: @devteam (@arquitecto, @designer-ux-ui, @fullstack-dev)
> **Objetivo**: Alinear los campos de la aplicación con los requisitos del cliente definidos en el Excel de referencia

---

## RESUMEN EJECUTIVO

Se analizaron los 4 módulos principales comparando los campos solicitados por el cliente (Excel PROCESO COMERCIAL) vs la implementación actual. Se encontraron **discrepancias significativas** que requieren ajustes.

| MÓDULO | CAMPOS SOLICITADOS | CAMPOS ACTUALES | COINCIDEN | FALTAN | SOBRAN |
|--------|-------------------|-----------------|-----------|--------|--------|
| LEAD | 8 | 10 | 6 | 2 | 4 |
| CLIENTE | 12 | 0 (No existe) | 0 | 12 | 0 |
| PRODUCTO | 5 | 13 | 4 | 1 | 9 |
| COTIZACIÓN | 38 | 22 | 15 | 23 | 7 |

---

## 1. MÓDULO LEAD

### 1.1 Campos Solicitados por Cliente (Excel)

| # | CAMPO | OBLIGATORIO |
|---|-------|-------------|
| 1 | NUMERO DE LEAD | Sí (Auto desde 100) |
| 2 | FECHA DEL LEAD | Sí |
| 3 | RAZÓN SOCIAL | Sí |
| 4 | NIT | Sí |
| 5 | NOMBRE DEL CONTACTO | Sí |
| 6 | CELULAR DEL CONTACTO | Sí |
| 7 | CORREO ELECTRONICO DEL CONTACTO | Sí |
| 8 | REQUERIMIENTO | Sí |

### 1.2 Campos Actuales en la Aplicación

**Archivo**: `apps/web/app/home/leads/_components/crear-lead-modal.tsx`

| # | CAMPO | ESTADO |
|---|-------|--------|
| 1 | razonSocial | ✅ Existe |
| 2 | nit | ✅ Existe |
| 3 | nombreContacto | ✅ Existe |
| 4 | email | ✅ Existe |
| 5 | telefono | ✅ Existe |
| 6 | origen | ⚠️ NO SOLICITADO |
| 7 | requerimiento | ✅ Existe |
| 8 | asignadoA | ⚠️ NO SOLICITADO (se asigna automáticamente según cliente) |
| 9 | numero | ✅ Auto-generado |
| 10 | fechaLead | ✅ Auto-generado |

### 1.3 Análisis de Diferencias

#### ✅ CAMPOS QUE COINCIDEN (6)
- NUMERO DE LEAD → `numero` (auto-generado)
- FECHA DEL LEAD → `fechaLead` (auto-generado)
- RAZÓN SOCIAL → `razonSocial`
- NIT → `nit`
- NOMBRE DEL CONTACTO → `nombreContacto`
- CORREO ELECTRONICO → `email`
- CELULAR → `telefono`
- REQUERIMIENTO → `requerimiento`

#### ❌ CAMPOS QUE FALTAN (0)
- Ninguno

#### ⚠️ CAMPOS QUE SOBRAN (2) - Evaluar Eliminación
| CAMPO | ANÁLISIS | RECOMENDACIÓN |
|-------|----------|---------------|
| `origen` | El Excel tiene "VÍA DE CONTACTO" en tablas de referencia pero NO en el formulario de Lead | **MANTENER** - Útil para tracking |
| `asignadoA` | El cliente dice "asignar automáticamente a comerciales que gerencia seleccione" | **MANTENER** - Necesario para asignación |

### 1.4 ACCIONES REQUERIDAS - LEAD

| # | ACCIÓN | PRIORIDAD | IMPACTO |
|---|--------|-----------|---------|
| 1 | Validar que numeración inicie en 100 | Alta | Bajo |
| 2 | Renombrar `email` a `correoElectronicoContacto` para consistencia | Baja | UI/Schema |
| 3 | Renombrar `telefono` a `celularContacto` para consistencia | Baja | UI/Schema |
| 4 | El campo `origen` puede quedarse (no afecta requisitos) | N/A | Ninguno |

---

## 2. MÓDULO CLIENTE (CREACIÓN DE CLIENTE)

### 2.1 Campos Solicitados por Cliente (Excel)

| # | CAMPO | OBLIGATORIO |
|---|-------|-------------|
| 1 | NIT CON DIGITO DE VERIFICACIÓN | Sí |
| 2 | RAZÓN SOCIAL | Sí |
| 3 | DIRECCIÓN | Sí |
| 4 | CIUDAD | Sí |
| 5 | DEPARTAMENTO | Sí |
| 6 | TELEFONO PRINCIPAL | Sí |
| 7 | CORREO DE FACTURACIÓN | No |
| 8 | FORMA DE PAGO | No |
| 9 | COMERCIAL ASIGNADO | Sí |
| **INFORMACIÓN DE CONTACTO** | | |
| 10 | NOMBRE | Sí |
| 11 | TELEFONO | Sí |
| 12 | CORREO ELECTRONICO | Sí |

### 2.2 Estado Actual

**⚠️ NO EXISTE MÓDULO DE CLIENTES EN LA APLICACIÓN**

El módulo de clientes NO está implementado. Los clientes se crean implícitamente dentro de:
- Lead (datos básicos del contacto)
- Cotización (datos del cliente)

### 2.3 ACCIONES REQUERIDAS - CLIENTE

| # | ACCIÓN | PRIORIDAD | IMPACTO |
|---|--------|-----------|---------|
| 1 | **CREAR MÓDULO COMPLETO DE CLIENTES** | **CRÍTICA** | Alto |
| 2 | Crear tabla `clientes` en Supabase | Alta | BD |
| 3 | Crear tabla `contactos_cliente` en Supabase | Alta | BD |
| 4 | Crear modal/página de creación de cliente | Alta | Frontend |
| 5 | Crear modal/página de edición de cliente | Alta | Frontend |
| 6 | Implementar matriz de permisos por rol | Alta | Seguridad |
| 7 | Vincular clientes con leads y cotizaciones | Alta | Relaciones |

### 2.4 Estructura Propuesta - Tabla `clientes`

```sql
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  nit VARCHAR(20) NOT NULL, -- Con dígito de verificación
  razon_social VARCHAR(255) NOT NULL,
  direccion VARCHAR(500) NOT NULL,
  ciudad VARCHAR(100) NOT NULL,
  departamento VARCHAR(100) NOT NULL,
  telefono_principal VARCHAR(20) NOT NULL,
  correo_facturacion VARCHAR(255),
  forma_pago VARCHAR(50) DEFAULT 'ANTICIPADO',
  cupo_credito DECIMAL(15,2) DEFAULT 0,
  comercial_asignado_id UUID REFERENCES auth.users(id),
  estado VARCHAR(20) DEFAULT 'activo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ,
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(organization_id, nit)
);

CREATE TABLE contactos_cliente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  correo_electronico VARCHAR(255) NOT NULL,
  es_principal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. MÓDULO PRODUCTO (CREACIÓN DE PRODUCTO)

### 3.1 Campos Solicitados por Cliente (Excel)

| # | CAMPO | OBLIGATORIO |
|---|-------|-------------|
| 1 | NUMERO DE PARTE | Sí |
| 2 | NOMBRE DEL PRODUCTO | Sí |
| 3 | VERTICAL | Sí |
| 4 | MARCA | Sí |
| 5 | IMPUESTO A APLICAR (0%, 5%, 19%) | Sí |

### 3.2 Campos Actuales en la Aplicación

**Archivo**: `apps/web/app/home/cotizaciones/_components/crear-producto-modal.tsx`

| # | CAMPO | ESTADO |
|---|-------|--------|
| 1 | numeroParte | ✅ Existe |
| 2 | nombre | ✅ Existe |
| 3 | vertical | ✅ Existe |
| 4 | marca | ✅ Existe |
| 5 | impuesto | ✅ Existe (0, 5, 19) |
| 6 | costo | ⚠️ NO SOLICITADO EN CREACIÓN |
| 7 | moneda | ⚠️ NO SOLICITADO EN CREACIÓN |
| 8 | utilidadPct | ⚠️ NO SOLICITADO EN CREACIÓN |
| 9 | cantidad | ⚠️ NO SOLICITADO EN CREACIÓN |
| 10 | proveedorSugerido | ⚠️ PERTENECE A ITEM COTIZACIÓN |
| 11 | tiempoEntrega | ⚠️ PERTENECE A ITEM COTIZACIÓN |
| 12 | garantia | ⚠️ PERTENECE A ITEM COTIZACIÓN |
| 13 | observaciones | ⚠️ PERTENECE A ITEM COTIZACIÓN |

### 3.3 Análisis de Diferencias

El modal actual **MEZCLA** dos conceptos:
1. **Creación de Producto** (catálogo) - Solo 5 campos
2. **Agregar Producto a Cotización** (item) - Campos adicionales

#### ✅ CAMPOS QUE COINCIDEN PARA PRODUCTO (5)
- NUMERO DE PARTE → `numeroParte`
- NOMBRE DEL PRODUCTO → `nombre`
- VERTICAL → `vertical`
- MARCA → `marca`
- IMPUESTO → `impuesto`

#### ⚠️ CAMPOS QUE SOBRAN EN CREACIÓN DE PRODUCTO (8)
Estos campos pertenecen a **"SELECCIONAR PRODUCTO PARA ENVIAR COTIZACIÓN"**:
- `costo` → Va en item de cotización
- `moneda` → Va en item de cotización
- `utilidadPct` → Va en item de cotización
- `cantidad` → Va en item de cotización
- `proveedorSugerido` → Va en item de cotización
- `tiempoEntrega` → Va en item de cotización
- `garantia` → Va en item de cotización
- `observaciones` → Va en item de cotización

### 3.4 ACCIONES REQUERIDAS - PRODUCTO

| # | ACCIÓN | PRIORIDAD | IMPACTO |
|---|--------|-----------|---------|
| 1 | **SEPARAR EN DOS MODALES** | **CRÍTICA** | Alto |
| 2 | Crear modal "Crear Producto" (solo 5 campos del catálogo) | Alta | Frontend |
| 3 | Crear modal "Agregar Producto a Cotización" (campos de item) | Alta | Frontend |
| 4 | Crear tabla `productos` (catálogo maestro) | Alta | BD |
| 5 | Modificar tabla `items_cotizacion` para referenciar productos | Alta | BD |

### 3.5 Estructura Propuesta

```sql
-- Catálogo de Productos
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  numero_parte VARCHAR(50) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  vertical VARCHAR(50) NOT NULL, -- ACCESORIOS, HARDWARE, OTROS, SERVICIOS, SOFTWARE
  marca VARCHAR(100) NOT NULL,
  impuesto INTEGER NOT NULL CHECK (impuesto IN (0, 5, 19)),
  estado VARCHAR(20) DEFAULT 'activo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(organization_id, numero_parte)
);
```

---

## 4. MÓDULO COTIZACIÓN

### 4.1 Campos Solicitados por Cliente (Excel)

#### Sección: DATOS DE COTIZACIÓN (17 campos)

| # | CAMPO | OBLIGATORIO |
|---|-------|-------------|
| 1 | NUMERO DE COTIZACIÓN | Sí (Auto desde 30000) |
| 2 | FECHA DE LA COTIZACIÓN | Sí (Auto-editable) |
| 3 | NIT | Sí |
| 4 | RAZÓN SOCIAL | Sí |
| 5 | FORMA DE PAGO | Sí |
| 6 | CUPO DE CRÉDITO DISPONIBLE | Sí (Solo lectura) |
| 7 | NOMBRE DEL CONTACTO | Sí |
| 8 | CELULAR DEL CONTACTO | Sí |
| 9 | CORREO ELECTRONICO DEL CONTACTO | Sí |
| 10 | ASUNTO | Sí |
| 11 | NOMBRE DEL COMERCIAL | Sí (Auto) |
| 12 | PORCENTAJE DE INTERES | Sí |
| 13 | VIGENCIA DE LA COTIZACIÓN | Sí |
| 14 | CASILLAS PARA GUARDAR INFORMACIÓN COMO LINKS | No |
| 15 | CONDICIONES COMERCIALES | No |
| 16 | CUADRO INFORMATIVO | No |
| 17 | DATOS ADJUNTOS | No |

#### Sección: FECHA DE CIERRE (3 campos)

| # | CAMPO | OBLIGATORIO |
|---|-------|-------------|
| 1 | MES DE CIERRE | Sí |
| 2 | SEMANA DE CIERRE | Sí |
| 3 | MES DE FACTURACIÓN | Sí |

#### Sección: SELECCIONAR PRODUCTO PARA COTIZACIÓN (13 campos)

| # | CAMPO | OBLIGATORIO |
|---|-------|-------------|
| 1 | NO DE PARTE | Sí |
| 2 | OBSERVACIONES DEL PRODUCTO | No |
| 3 | COSTO DEL PRODUCTO | Sí |
| 4 | MONEDA DEL COSTO | Sí |
| 5 | COSTO FINAL DESPUES DE LA CONVERSIÓN | Sí (Calculado) |
| 6 | % UTILIDAD A APLICAR | Sí |
| 7 | PRECIO DE VENTA | Sí |
| 8 | IVA A APLICAR | Sí |
| 9 | CANTIDAD | Sí |
| 10 | PROVEEDOR SUGERIDO | Sí |
| 11 | TIEMPO DE ENTREGA | Sí |
| 12 | GARANTÍA | Sí |
| 13 | ORDEN | No |

### 4.2 Campos Actuales en la Aplicación

**Archivo**: `apps/web/app/home/cotizaciones/_components/crear-cotizacion-modal.tsx`

| # | CAMPO ACTUAL | MAPEADO A |
|---|--------------|-----------|
| 1 | numero | NUMERO DE COTIZACIÓN ✅ |
| 2 | fecha | FECHA DE LA COTIZACIÓN ✅ |
| 3 | razonSocial | RAZÓN SOCIAL ✅ |
| 4 | formaPago | FORMA DE PAGO ✅ |
| 5 | contacto | NOMBRE DEL CONTACTO ✅ |
| 6 | celular | CELULAR DEL CONTACTO ✅ |
| 7 | correo | CORREO ELECTRONICO ✅ |
| 8 | asunto | ASUNTO ✅ |
| 9 | asesor | NOMBRE DEL COMERCIAL ✅ |
| 10 | vigenciaDias | VIGENCIA DE LA COTIZACIÓN ✅ |
| 11 | condicionesComerciales | CONDICIONES COMERCIALES ✅ |
| 12 | cuadroInformativo | CUADRO INFORMATIVO ✅ |
| 13 | mes | MES DE CIERRE ✅ |
| 14 | semana | SEMANA DE CIERRE ✅ |
| 15 | mesFacturacion | MES DE FACTURACIÓN ✅ |
| 16 | porcentajeInteres | PORCENTAJE DE INTERES ✅ |
| 17 | linksAdicionales | CASILLAS PARA LINKS ✅ |
| 18 | leadId | ⚠️ Interno (OK) |
| 19 | fechaCierre | ⚠️ NO SOLICITADO |

### 4.3 Análisis de Diferencias - Cotización

#### ❌ CAMPOS QUE FALTAN (6)
| CAMPO | PRIORIDAD |
|-------|-----------|
| NIT | Alta |
| CUPO DE CRÉDITO DISPONIBLE | Alta |
| DATOS ADJUNTOS | Media |
| TRANSPORTE INCLUIDO (casilla) | Alta |
| VALOR TRANSPORTE | Alta |
| Panel de LIQUIDACIÓN (Total venta, costo, utilidad, margen) | Alta |

#### ⚠️ CAMPOS QUE SOBRAN (1)
| CAMPO | ANÁLISIS | RECOMENDACIÓN |
|-------|----------|---------------|
| `fechaCierre` | No está en Excel | Evaluar - Puede ser útil |

### 4.4 ACCIONES REQUERIDAS - COTIZACIÓN

| # | ACCIÓN | PRIORIDAD | IMPACTO |
|---|--------|-----------|---------|
| 1 | Agregar campo NIT al formulario | Alta | Frontend |
| 2 | Agregar campo CUPO DE CRÉDITO DISPONIBLE (solo lectura) | Alta | Frontend/BD |
| 3 | Agregar sección DATOS ADJUNTOS (upload archivos) | Media | Frontend/Storage |
| 4 | Agregar casilla "¿Transporte incluido?" | Alta | Frontend |
| 5 | Agregar campo "Valor Transporte" | Alta | Frontend |
| 6 | Agregar PANEL DE LIQUIDACIÓN con: | Alta | Frontend |
|   | - TOTAL VENTA ANTES DE IVA | | |
|   | - TOTAL COSTO | | |
|   | - UTILIDAD | | |
|   | - MARGEN GENERAL | | |
| 7 | Implementar funcionalidad "DUPLICAR COTIZACIÓN" | Media | Frontend |
| 8 | Validar que numeración inicie en 30000 | Alta | Bajo |

---

## 5. RESUMEN DE IMPACTOS Y DEPENDENCIAS

### 5.1 Impactos en Base de Datos

| TABLA | ACCIÓN | PRIORIDAD |
|-------|--------|-----------|
| `clientes` | CREAR | Alta |
| `contactos_cliente` | CREAR | Alta |
| `productos` | CREAR | Alta |
| `cotizaciones` | MODIFICAR (agregar campos) | Alta |
| `items_cotizacion` | MODIFICAR | Alta |

### 5.2 Impactos en Frontend

| COMPONENTE | ACCIÓN |
|------------|--------|
| `crear-lead-modal.tsx` | Ajustes menores |
| `crear-cliente-modal.tsx` | **CREAR** |
| `editar-cliente-modal.tsx` | **CREAR** |
| `crear-producto-modal.tsx` | **DIVIDIR EN DOS** |
| `agregar-item-cotizacion-modal.tsx` | **CREAR** |
| `crear-cotizacion-modal.tsx` | **MODIFICAR** (agregar campos) |
| `panel-liquidacion.tsx` | **CREAR** |

### 5.3 Sin Duplicidad

El plan garantiza que:
- **Clientes**: Se crea módulo independiente, no duplica datos de Lead
- **Productos**: Se separa catálogo de items de cotización
- **Cotización**: Se vincula a cliente existente, no duplica datos

---

## 6. ORDEN DE EJECUCIÓN RECOMENDADO

### Fase 1: Base de Datos (Pre-requisito)
1. Crear tabla `clientes`
2. Crear tabla `contactos_cliente`
3. Crear tabla `productos`
4. Modificar tabla `cotizaciones`
5. Crear/Modificar tabla `items_cotizacion`
6. Configurar RLS policies

### Fase 2: Módulo Clientes
1. Crear modal de creación de cliente
2. Crear modal de edición de cliente
3. Implementar permisos por rol
4. Integrar con leads (vincular lead a cliente)

### Fase 3: Módulo Productos
1. Separar modal actual en dos
2. Crear modal "Crear Producto" (catálogo)
3. Crear modal "Agregar Item a Cotización"

### Fase 4: Módulo Cotización
1. Agregar campos faltantes al formulario
2. Implementar panel de liquidación
3. Agregar sección de archivos adjuntos
4. Implementar funcionalidad de duplicar

### Fase 5: Módulo Lead
1. Ajustes menores de naming (opcional)
2. Validar numeración desde 100

---

## 7. RIESGOS Y MITIGACIONES

| RIESGO | PROBABILIDAD | IMPACTO | MITIGACIÓN |
|--------|--------------|---------|------------|
| Migración de datos existentes | Media | Alto | Crear scripts de migración |
| Cambios en permisos por rol | Media | Medio | Implementar gradualmente |
| Rendimiento con nuevas tablas | Baja | Medio | Índices optimizados |
| Compatibilidad con mock-data | Alta | Bajo | Actualizar interfaces |

---

**Documento generado por**: @devteam
**Revisado por**: Pendiente
**Aprobado por**: Pendiente
