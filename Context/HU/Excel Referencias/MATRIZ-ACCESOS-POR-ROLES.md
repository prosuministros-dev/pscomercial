# MATRIZ DE ACCESOS POR ROLES

> **Fuente**: PROCESO COMERCIAL (1).xlsx - Pestañas: "Creación de cliente", "Creación de producto", "Cotización"

---

## Roles Definidos en el Sistema

| # | ROL |
|---|-----|
| 1 | GERENCIA GENERAL |
| 2 | GERENCIA COMERCIAL |
| 3 | COMERCIALES |
| 4 | COMPRAS |
| 5 | AUXILIAR FINANCIERA |
| 6 | AUXILIAR ADMINISTRATIVA |
| 7 | JEFE DE BODEGA |
| 8 | AUXILIAR DE BODEGA |

---

## Leyenda de Permisos

| PERMISO | DESCRIPCIÓN |
|---------|-------------|
| Crear y modificar | El rol puede crear nuevos registros y modificar existentes |
| Crear | El rol solo puede crear nuevos registros, no modificar |
| Modificar | El rol solo puede modificar registros existentes, no crear |
| Editable | El rol puede editar el campo |
| Automatica - Editable | El campo se llena automáticamente pero puede ser editado |
| NO | El rol no tiene acceso al campo |
| N/A | No aplica - el campo se asigna automáticamente por el sistema |

---

## 1. MÓDULO: CREACIÓN DE CLIENTE

### Campos Principales

| CAMPO | TIPO | GERENCIA GENERAL | GERENCIA COMERCIAL | COMERCIALES | COMPRAS | AUXILIAR FINANCIERA | AUXILIAR ADMINISTRATIVA | JEFE DE BODEGA | AUXILIAR DE BODEGA |
|-------|------|------------------|-------------------|-------------|---------|---------------------|------------------------|----------------|-------------------|
| NIT CON DIGITO DE VERIFICACIÓN | OBLIGATORIA | Crear y modificar | Crear y modificar | Crear y modificar | NO | NO | NO | NO | NO |
| RAZÓN SOCIAL | OBLIGATORIA | Crear y modificar | Crear y modificar | Crear y modificar | NO | NO | NO | NO | NO |
| DIRECCIÓN | OBLIGATORIA | Crear y modificar | Crear y modificar | Crear y modificar | NO | NO | NO | NO | NO |
| CIUDAD | OBLIGATORIA | Crear y modificar | Crear y modificar | Crear y modificar | NO | NO | NO | NO | NO |
| DEPARTAMENTO | OBLIGATORIA | Crear y modificar | Crear y modificar | Crear y modificar | NO | NO | NO | NO | NO |
| TELEFONO PRINCIPAL | OBLIGATORIA | Crear y modificar | Crear y modificar | Crear y modificar | NO | NO | NO | NO | NO |
| CORREO DE FACTURACIÓN | - | NO | NO | NO | NO | Crear y modificar | NO | NO | NO |
| FORMA DE PAGO | - | Crear y modificar | NO | NO | NO | Crear y modificar | NO | NO | NO |
| COMERCIAL ASIGNADO | OBLIGATORIA | Modificar | Modificar | NO | NO | NO | NO | NO | NO |

### Información de Contacto

| CAMPO | TIPO | GERENCIA GENERAL | GERENCIA COMERCIAL | COMERCIALES | COMPRAS | AUXILIAR FINANCIERA | AUXILIAR ADMINISTRATIVA | JEFE DE BODEGA | AUXILIAR DE BODEGA |
|-------|------|------------------|-------------------|-------------|---------|---------------------|------------------------|----------------|-------------------|
| INFORMACIÓN DE CONTACTO: | OBLIGATORIA | Crear y modificar | Crear y modificar | Crear y modificar | NO | NO | NO | NO | NO |
| NOMBRE | OBLIGATORIA | Crear y modificar | Crear y modificar | Crear y modificar | NO | NO | NO | NO | NO |
| TELEFONO | OBLIGATORIA | Crear y modificar | Crear y modificar | Crear y modificar | NO | NO | NO | NO | NO |
| CORREO ELECTRONICO | OBLIGATORIA | Crear y modificar | Crear y modificar | Crear y modificar | NO | NO | NO | NO | NO |

---

## 2. MÓDULO: CREACIÓN DE PRODUCTO

| CAMPO | TIPO | GERENCIA GENERAL | GERENCIA COMERCIAL | COMERCIALES | COMPRAS | AUXILIAR FINANCIERA | AUXILIAR ADMINISTRATIVA | JEFE DE BODEGA | AUXILIAR DE BODEGA |
|-------|------|------------------|-------------------|-------------|---------|---------------------|------------------------|----------------|-------------------|
| NUMERO DE PARTE | OBLIGATORIA | Crear y modificar | Crear | Crear | NO | NO | NO | NO | NO |
| NOMBRE DEL PRODUCTO | OBLIGATORIA | Crear y modificar | Crear | Crear | NO | NO | NO | NO | NO |
| VERTICAL | OBLIGATORIA | Crear y modificar | NO | NO | NO | NO | NO | NO | NO |
| MARCA | OBLIGATORIA | Crear y modificar | NO | NO | NO | NO | NO | NO | NO |
| IMPUESTO A APLICAR (SELECCIONAR EN MODO LISTA 0%, 5%, 19%) | OBLIGATORIA | Crear y modificar | NO | NO | NO | NO | NO | NO | NO |

---

## 3. MÓDULO: COTIZACIÓN

### Sección: Datos de Cotización

| CAMPO | TIPO | GERENCIA GENERAL | GERENCIA COMERCIAL | COMERCIALES | COMPRAS | AUXILIAR FINANCIERA | AUXILIAR ADMINISTRATIVA | JEFE DE BODEGA | AUXILIAR DE BODEGA |
|-------|------|------------------|-------------------|-------------|---------|---------------------|------------------------|----------------|-------------------|
| NUMERO DE COTIZACIÓN | OBLIGATORIA | NO | NO | NO | NO | NO | NO | NO | NO |
| FECHA DE LA COTIZACIÓN | OBLIGATORIA | Automatica - Editable | Automatica - Editable | Automatica - Editable | NO | NO | NO | NO | NO |
| NIT | OBLIGATORIA | Crear y modificar | Crear y modificar | Crear y modificar | NO | NO | NO | NO | NO |
| RAZÓN SOCIAL | OBLIGATORIA | Crear y modificar | Crear y modificar | Crear y modificar | NO | NO | NO | NO | NO |
| FORMA DE PAGO | OBLIGATORIA | Crear y modificar | NO | NO | NO | Crear y modificar | NO | NO | NO |
| CUPO DE CRÉDITO DISPONIBLE | OBLIGATORIA | NO | NO | NO | NO | NO | NO | NO | NO |
| NOMBRE DEL CONTACTO | OBLIGATORIA | Crear y modificar | Crear y modificar | Crear y modificar | NO | NO | NO | NO | NO |
| CELULAR DEL CONTACTO | OBLIGATORIA | Crear y modificar | Crear y modificar | Crear y modificar | NO | NO | NO | NO | NO |
| CORREO ELECTRONICO DEL CONTACTO | OBLIGATORIA | Crear y modificar | Crear y modificar | Crear y modificar | NO | NO | NO | NO | NO |
| ASUNTO | OBLIGATORIA | Editable | Editable | Editable | NO | NO | NO | NO | NO |
| NOMBRE DEL COMERCIAL | OBLIGATORIA | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| PORCENTAJE DE INTERES | OBLIGATORIA | Modificar | Modificar | Modificar | NO | NO | NO | NO | NO |
| VIGENCIA DE LA COTIZACIÓN | OBLIGATORIA | Editable | Editable | Editable | NO | NO | NO | NO | NO |
| CASILLAS PARA GUARDAR INFORMACIÓN COMO LINKS | NO OBLIGATORIO | Editable | Editable | Editable | NO | NO | NO | NO | NO |
| CONDICIONES COMERCIALES | NO OBLIGATORIO | Editable | Editable | Editable | NO | NO | NO | NO | NO |
| CUADRO INFORMATIVO | NO OBLIGATORIO | Editable | Editable | Editable | NO | NO | NO | NO | NO |
| DATOS ADJUNTOS | NO OBLIGATORIO | Editable | Editable | Editable | NO | NO | NO | NO | NO |

### Sección: Fecha de Cierre

| CAMPO | TIPO | GERENCIA GENERAL | GERENCIA COMERCIAL | COMERCIALES | COMPRAS | AUXILIAR FINANCIERA | AUXILIAR ADMINISTRATIVA | JEFE DE BODEGA | AUXILIAR DE BODEGA |
|-------|------|------------------|-------------------|-------------|---------|---------------------|------------------------|----------------|-------------------|
| MES DE CIERRE | OBLIGATORIA | Editable | Editable | Editable | NO | NO | NO | NO | NO |
| SEMANA DE CIERRE | OBLIGATORIA | Editable | Editable | Editable | NO | NO | NO | NO | NO |
| MES DE FACTURACIÓN | OBLIGATORIA | Editable | Editable | Editable | NO | NO | NO | NO | NO |

### Sección: Creación de Producto (en Cotización)

| CAMPO | TIPO | GERENCIA GENERAL | GERENCIA COMERCIAL | COMERCIALES | COMPRAS | AUXILIAR FINANCIERA | AUXILIAR ADMINISTRATIVA | JEFE DE BODEGA | AUXILIAR DE BODEGA |
|-------|------|------------------|-------------------|-------------|---------|---------------------|------------------------|----------------|-------------------|
| NUMERO DE PARTE | OBLIGATORIA | Crear y modificar | Crear | Crear | NO | NO | NO | NO | NO |
| NOMBRE DEL PRODUCTO | OBLIGATORIA | Crear y modificar | Crear | Crear | NO | NO | NO | NO | NO |
| VERTICAL | OBLIGATORIA | Crear y modificar | NO | NO | NO | NO | NO | NO | NO |
| MARCA | OBLIGATORIA | Crear y modificar | NO | NO | NO | NO | NO | NO | NO |
| IMPUESTO A APLICAR | OBLIGATORIA | Crear y modificar | NO | NO | NO | NO | NO | NO | NO |

### Sección: Seleccionar Producto para Enviar Cotización

| CAMPO | TIPO | GERENCIA GENERAL | GERENCIA COMERCIAL | COMERCIALES | COMPRAS | AUXILIAR FINANCIERA | AUXILIAR ADMINISTRATIVA | JEFE DE BODEGA | AUXILIAR DE BODEGA |
|-------|------|------------------|-------------------|-------------|---------|---------------------|------------------------|----------------|-------------------|
| NO DE PARTE | OBLIGATORIA | Editable | Editable | Editable | NO | NO | NO | NO | NO |
| OBSERVACIONES DEL PRODUCTO | NO OBLIGATORIO | Editable | Editable | Editable | NO | NO | NO | NO | NO |
| COSTO DEL PRODUCTO | OBLIGATORIA | Modificar | Modificar | Modificar | NO | NO | NO | NO | NO |
| MONEDA DEL COSTO | OBLIGATORIA | Modificar | Modificar | Modificar | N/A | N/A | N/A | N/A | N/A |
| COSTO FINAL DESPUES DE LA CONVERSIÓN | OBLIGATORIA | NO | NO | NO | NO | NO | NO | NO | NO |
| % UTILIDAD A APLICAR | OBLIGATORIA | Modificar | Modificar | Modificar | NO | NO | NO | NO | NO |
| PRECIO DE VENTA | OBLIGATORIA | Modificar | Modificar | Modificar | NO | NO | NO | NO | NO |
| IVA A APLICAR | OBLIGATORIA | Modificar | Modificar | Modificar | NO | NO | NO | NO | NO |
| CANTIDAD | OBLIGATORIA | Modificar | Modificar | Modificar | NO | NO | NO | NO | NO |
| PROVEEDOR SUGERIDO | OBLIGATORIA | Modificar | Modificar | Modificar | NO | NO | NO | NO | NO |
| TIEMPO DE ENTREGA | OBLIGATORIA | Editable | Editable | Editable | NO | NO | NO | NO | NO |
| GARANTÍA | OBLIGATORIA | Editable | Editable | Editable | NO | NO | NO | NO | NO |
| ORDEN | NO OBLIGATORIO | Editable | Editable | Editable | NO | NO | NO | NO | NO |

---

## Resumen de Accesos por Rol

### GERENCIA GENERAL
- **Acceso Total**: Puede crear y modificar todos los campos en todos los módulos
- **Excepción**: Campos automáticos como número de cotización, cupo de crédito disponible

### GERENCIA COMERCIAL
- **Creación de Cliente**: Crear y modificar datos básicos, solo modificar comercial asignado
- **Creación de Producto**: Solo crear número de parte y nombre, no puede gestionar vertical, marca o impuesto
- **Cotización**: Puede crear y modificar datos de cliente, editar campos comerciales, no puede modificar forma de pago

### COMERCIALES
- **Creación de Cliente**: Crear y modificar datos básicos del cliente y contacto
- **Creación de Producto**: Solo crear número de parte y nombre
- **Cotización**: Puede editar la mayoría de campos comerciales, modificar precios y productos

### COMPRAS
- **Sin acceso** a ninguno de los módulos documentados

### AUXILIAR FINANCIERA
- **Creación de Cliente**: Solo puede gestionar correo de facturación y forma de pago
- **Creación de Producto**: Sin acceso
- **Cotización**: Solo puede gestionar forma de pago

### AUXILIAR ADMINISTRATIVA
- **Sin acceso** a ninguno de los módulos documentados

### JEFE DE BODEGA
- **Sin acceso** a ninguno de los módulos documentados

### AUXILIAR DE BODEGA
- **Sin acceso** a ninguno de los módulos documentados
