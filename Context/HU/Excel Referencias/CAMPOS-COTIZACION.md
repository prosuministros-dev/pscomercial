# CAMPOS - MÓDULO COTIZACIÓN

> **Fuente**: PROCESO COMERCIAL (1).xlsx - Pestaña "Cotización"

## Sección: COTIZACIONES

| # | CAMPO | TIPO DE CASILLA | DESCRIPCIÓN |
|---|-------|-----------------|-------------|
| 1 | NUMERO DE COTIZACIÓN | OBLIGATORIA | EL SISTEMA LO GENERA DE MANERA AUTOMATICA, DEBEMOS INICIAR CON LA COTIZACIÓN NO. 30000 Y CADA QUE UN COMERCIAL CREE UNA COTIZACIÓN, LE ASIGNA LA QUE LE SIGUE SEGÚN CORRESPONDA. |
| 2 | FECHA DE LA COTIZACIÓN | OBLIGATORIA | EL SISTEMA DEBERÁ PONER DE MANERA AUTOMATICA LA FECHA DE HOY PERO TAMBIEN PERMITIRA MODIFICARLA SEGÚN LO REQUIERA |
| 3 | NIT | OBLIGATORIA | NIT del cliente |
| 4 | RAZÓN SOCIAL | OBLIGATORIA | Razón social del cliente |
| 5 | FORMA DE PAGO | OBLIGATORIA | LO DILIGENCIA UNICAMENTE FINANCIERA AL MOMENTO DE MODIFICAR AL CLIENTE, TODOS LOS CLIENTES QUEDAN CREADOS DE MANERA AUTOMATICA COMO ANTICIPADO, FINANCIERA DEBERÁ INGRESAR AL CLIENTE Y CAMBIAR LA FORMA DE PAGO Y EL CUPO |
| 6 | CUPO DE CRÉDITO DISPONIBLE | OBLIGATORIA | Cupo de crédito disponible del cliente |
| 7 | NOMBRE DEL CONTACTO | OBLIGATORIA | Nombre del contacto del cliente |
| 8 | CELULAR DEL CONTACTO | OBLIGATORIA | Celular del contacto |
| 9 | CORREO ELECTRONICO DEL CONTACTO | OBLIGATORIA | Email del contacto |
| 10 | ASUNTO | OBLIGATORIA | Asunto de la cotización |
| 11 | NOMBRE DEL COMERCIAL | OBLIGATORIA | Nombre del comercial asignado |
| 12 | PORCENTAJE DE INTERES | OBLIGATORIA | Creación de la oferta, En negociación, Riesgo, Pendiente por orden de compra |
| 13 | VIGENCIA DE LA COTIZACIÓN | OBLIGATORIA | Tiempo de vigencia de la cotización |
| 14 | CASILLAS PARA GUARDAR INFORMACIÓN COMO LINKS | NO OBLIGATORIO | Enlaces adicionales |
| 15 | CONDICIONES COMERCIALES | NO OBLIGATORIO | INFORMACIÓN PARA PONER DE MANERA MANUAL LOS PLUS A LA COTIZACIÓN |
| 16 | CUADRO INFORMATIVO | NO OBLIGATORIO | PARA QUE EL COMERCIAL O LA IA PONGA CUAL HA SIDO EL AVANCE CON LA COTIZACIÓN RESPECTO A LA RETROALIMENTACIÓN CON EL CLIENTE. |
| 17 | DATOS ADJUNTOS | NO OBLIGATORIO | ARCHIVOS QUE SE REQUIERAN GUARDAR EN LA COTIZACIONES TALES COMO COTIZACIONES |

## Sección: FECHA DE CIERRE

| # | CAMPO | TIPO DE CASILLA |
|---|-------|-----------------|
| 1 | MES DE CIERRE | OBLIGATORIA |
| 2 | SEMANA DE CIERRE | OBLIGATORIA |
| 3 | MES DE FACTURACIÓN | OBLIGATORIA |

## Sección: CREACIÓN DE PRODUCTO (dentro de Cotización)

| # | CAMPO | TIPO DE CASILLA |
|---|-------|-----------------|
| 1 | NUMERO DE PARTE | OBLIGATORIA |
| 2 | NOMBRE DEL PRODUCTO | OBLIGATORIA |
| 3 | VERTICAL | OBLIGATORIA |
| 4 | MARCA | OBLIGATORIA |
| 5 | IMPUESTO A APLICAR (SELECCIONAR EN MODO LISTA 0%, 5%, 19%) | OBLIGATORIA |

## Sección: SELECCIONAR PRODUCTO PARA ENVIAR COTIZACIÓN

| # | CAMPO | TIPO DE CASILLA | DESCRIPCIÓN |
|---|-------|-----------------|-------------|
| 1 | NO DE PARTE | OBLIGATORIA | Número de parte del producto |
| 2 | OBSERVACIONES DEL PRODUCTO | NO OBLIGATORIO | CASILLA PARA AGREGAR INFORMACIÓN RESPECTO A LA COTIZACIÓN, NO HACE PARTE DE LA CREACIÓN DEL PRODUCTO, ES PARA PONER UN EJEMPLO QUE ESE NO DE PARTE ES COMPATIBLE CON X PRODUCTO |
| 3 | COSTO DEL PRODUCTO | OBLIGATORIA | Costo del producto |
| 4 | MONEDA DEL COSTO | OBLIGATORIA | TIPO LISTA DOLARES O PESOS |
| 5 | COSTO FINAL DESPUES DE LA CONVERSIÓN | OBLIGATORIA | Costo convertido a moneda local |
| 6 | % UTILIDAD A APLICAR | OBLIGATORIA | Porcentaje de utilidad |
| 7 | PRECIO DE VENTA | OBLIGATORIA | Precio de venta final |
| 8 | IVA A APLICAR (MODO LISTA) | OBLIGATORIA | IVA seleccionable |
| 9 | CANTIDAD | OBLIGATORIA | Cantidad de productos |
| 10 | PROVEEDOR SUGERIDO | OBLIGATORIA | Proveedor recomendado |
| 11 | TIEMPO DE ENTREGA | OBLIGATORIA | Tiempo estimado de entrega |
| 12 | GARANTÍA | OBLIGATORIA | Garantía del producto |
| 13 | ORDEN | NO OBLIGATORIO | EN QUE POSICIÓN DE LA COTIZACIÓN VA EL PRODUCTO |

## Matriz de Permisos por Rol - COTIZACIONES

| CAMPO | GERENCIA GENERAL | GERENCIA COMERCIAL | COMERCIALES | COMPRAS | AUXILIAR FINANCIERA | AUXILIAR ADMINISTRATIVA | JEFE DE BODEGA | AUXILIAR DE BODEGA |
|-------|------------------|-------------------|-------------|---------|---------------------|------------------------|----------------|-------------------|
| NUMERO DE COTIZACIÓN | NO | NO | NO | NO | NO | NO | NO | NO |
| FECHA DE LA COTIZACIÓN | Automatica - Editable | Automatica - Editable | Automatica - Editable | NO | NO | NO | NO | NO |
| NIT | Crear y modificar | Crear y modificar | Crear y modificar | NO | NO | NO | NO | NO |
| RAZÓN SOCIAL | Crear y modificar | Crear y modificar | Crear y modificar | NO | NO | NO | NO | NO |
| FORMA DE PAGO | Crear y modificar | NO | NO | NO | Crear y modificar | NO | NO | NO |
| CUPO DE CRÉDITO DISPONIBLE | NO | NO | NO | NO | NO | NO | NO | NO |
| NOMBRE DEL CONTACTO | Crear y modificar | Crear y modificar | Crear y modificar | NO | NO | NO | NO | NO |
| CELULAR DEL CONTACTO | Crear y modificar | Crear y modificar | Crear y modificar | NO | NO | NO | NO | NO |
| CORREO ELECTRONICO DEL CONTACTO | Crear y modificar | Crear y modificar | Crear y modificar | NO | NO | NO | NO | NO |
| ASUNTO | Editable | Editable | Editable | NO | NO | NO | NO | NO |
| NOMBRE DEL COMERCIAL | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| PORCENTAJE DE INTERES | Modificar | Modificar | Modificar | NO | NO | NO | NO | NO |
| VIGENCIA DE LA COTIZACIÓN | Editable | Editable | Editable | NO | NO | NO | NO | NO |
| CASILLAS PARA GUARDAR INFORMACIÓN COMO LINKS | Editable | Editable | Editable | NO | NO | NO | NO | NO |
| CONDICIONES COMERCIALES | Editable | Editable | Editable | NO | NO | NO | NO | NO |
| CUADRO INFORMATIVO | Editable | Editable | Editable | NO | NO | NO | NO | NO |
| DATOS ADJUNTOS | Editable | Editable | Editable | NO | NO | NO | NO | NO |

## Matriz de Permisos por Rol - FECHA DE CIERRE

| CAMPO | GERENCIA GENERAL | GERENCIA COMERCIAL | COMERCIALES | COMPRAS | AUXILIAR FINANCIERA | AUXILIAR ADMINISTRATIVA | JEFE DE BODEGA | AUXILIAR DE BODEGA |
|-------|------------------|-------------------|-------------|---------|---------------------|------------------------|----------------|-------------------|
| MES DE CIERRE | Editable | Editable | Editable | NO | NO | NO | NO | NO |
| SEMANA DE CIERRE | Editable | Editable | Editable | NO | NO | NO | NO | NO |
| MES DE FACTURACIÓN | Editable | Editable | Editable | NO | NO | NO | NO | NO |

## Matriz de Permisos por Rol - CREACIÓN DE PRODUCTO

| CAMPO | GERENCIA GENERAL | GERENCIA COMERCIAL | COMERCIALES | COMPRAS | AUXILIAR FINANCIERA | AUXILIAR ADMINISTRATIVA | JEFE DE BODEGA | AUXILIAR DE BODEGA |
|-------|------------------|-------------------|-------------|---------|---------------------|------------------------|----------------|-------------------|
| NUMERO DE PARTE | Crear y modificar | Crear | Crear | NO | NO | NO | NO | NO |
| NOMBRE DEL PRODUCTO | Crear y modificar | Crear | Crear | NO | NO | NO | NO | NO |
| VERTICAL | Crear y modificar | NO | NO | NO | NO | NO | NO | NO |
| MARCA | Crear y modificar | NO | NO | NO | NO | NO | NO | NO |
| IMPUESTO A APLICAR | Crear y modificar | NO | NO | NO | NO | NO | NO | NO |

## Matriz de Permisos por Rol - SELECCIONAR PRODUCTO PARA ENVIAR COTIZACIÓN

| CAMPO | GERENCIA GENERAL | GERENCIA COMERCIAL | COMERCIALES | COMPRAS | AUXILIAR FINANCIERA | AUXILIAR ADMINISTRATIVA | JEFE DE BODEGA | AUXILIAR DE BODEGA |
|-------|------------------|-------------------|-------------|---------|---------------------|------------------------|----------------|-------------------|
| NO DE PARTE | Editable | Editable | Editable | NO | NO | NO | NO | NO |
| OBSERVACIONES DEL PRODUCTO | Editable | Editable | Editable | NO | NO | NO | NO | NO |
| COSTO DEL PRODUCTO | Modificar | Modificar | Modificar | NO | NO | NO | NO | NO |
| MONEDA DEL COSTO | Modificar | Modificar | Modificar | N/A | N/A | N/A | N/A | N/A |
| COSTO FINAL DESPUES DE LA CONVERSIÓN | NO | NO | NO | NO | NO | NO | NO | NO |
| % UTILIDAD A APLICAR | Modificar | Modificar | Modificar | NO | NO | NO | NO | NO |
| PRECIO DE VENTA | Modificar | Modificar | Modificar | NO | NO | NO | NO | NO |
| IVA A APLICAR | Modificar | Modificar | Modificar | NO | NO | NO | NO | NO |
| CANTIDAD | Modificar | Modificar | Modificar | NO | NO | NO | NO | NO |
| PROVEEDOR SUGERIDO | Modificar | Modificar | Modificar | NO | NO | NO | NO | NO |
| TIEMPO DE ENTREGA | Editable | Editable | Editable | NO | NO | NO | NO | NO |
| GARANTÍA | Editable | Editable | Editable | NO | NO | NO | NO | NO |
| ORDEN | Editable | Editable | Editable | NO | NO | NO | NO | NO |

## OBSERVACIONES IMPORTANTES

### 1. Duplicar Cotización
TENEMOS CASOS EN LOS CUALES REQUERIMOS CREAR DOS VERSIONES DE UNA MISMA COTIZACIÓN, Y PARA EFECTOS PRACTICOS, SELECCIONAMOS LOS PRODUCTOS Y LE DAMOS LA OPCIÓN DUPLICAR, LO QUE HACE ES REPLICAR LA MISMA INFORMACIÓN DE LA COTIZACIÓN 1 SEGÚN LOS PRODUCTOS QUE YO HALLA SELECCIONADO.

### 2. Panel de Liquidación
EN EL PANEL GENERAL DE LA COTIZACIÓN, DEBERÁ APARECER UNA LIQUIDACIÓN EN LA PARTE DE ABAJO O DONDE CORRESPONDA:
- TOTAL VENTA ANTES DE IVA
- TOTAL COSTO
- UTILIDAD
- MARGEN GENERAL

### 3. Valor de Transporte
PARA QUE LO ANTERIOR FUNCIONE, DEBERÁ EXISTIR UNA CASILLA QUE PREGUNTE SI YA ESTA INCLUIDO EL VALOR DE LOS TRANSPORTE EN LOS ITEMS, SI NO, QUE POR FAVOR DILIGENCIE EL VALOR Y ESE VALOR QUE DILIGENCIEN DEBE SER TENIDO EN CUENTA EN LA LIQUIDACIÓN. DE ESTO ESTAMOS PENDIENTES A LA PROPUESTA DE FREDDY A VER CUAL ES LA MEJOR OPCIÓN PARA CALCULAR EL TRANSPORTE.

## Reglas de Negocio

1. **Numeración Automática**: El sistema genera automáticamente el número de cotización, iniciando desde la **COTIZACIÓN NO. 30000**
2. **Fecha Automática**: La fecha se asigna automáticamente pero puede ser modificada
3. **Forma de Pago por Defecto**: Todos los clientes se crean con forma de pago "ANTICIPADO"
4. **Cupo de Crédito**: Solo visible, no editable directamente en cotización
5. **Comercial**: El nombre del comercial se asigna automáticamente (N/A para todos los roles)
