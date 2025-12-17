# CAMPOS - MÓDULO CREACIÓN DE CLIENTE

> **Fuente**: PROCESO COMERCIAL (1).xlsx - Pestaña "Creación de cliente"

## Campos del Módulo

| # | CAMPO | TIPO DE CASILLA |
|---|-------|-----------------|
| 1 | NIT CON DIGITO DE VERIFICACIÓN | OBLIGATORIA |
| 2 | RAZÓN SOCIAL | OBLIGATORIA |
| 3 | DIRECCIÓN | OBLIGATORIA |
| 4 | CIUDAD | OBLIGATORIA |
| 5 | DEPARTAMENTO | OBLIGATORIA |
| 6 | TELEFONO PRINCIPAL | OBLIGATORIA |
| 7 | CORREO DE FACTURACIÓN | (No obligatorio) |
| 8 | FORMA DE PAGO | (No obligatorio) |
| 9 | COMERCIAL ASIGNADO | OBLIGATORIA |

## Información de Contacto

| # | CAMPO | TIPO DE CASILLA |
|---|-------|-----------------|
| 1 | NOMBRE | OBLIGATORIA |
| 2 | TELEFONO | OBLIGATORIA |
| 3 | CORREO ELECTRONICO | OBLIGATORIA |

## Matriz de Permisos por Rol

| CAMPO | GERENCIA GENERAL | GERENCIA COMERCIAL | COMERCIALES | COMPRAS | AUXILIAR FINANCIERA | AUXILIAR ADMINISTRATIVA | JEFE DE BODEGA | AUXILIAR DE BODEGA |
|-------|------------------|-------------------|-------------|---------|---------------------|------------------------|----------------|-------------------|
| NIT CON DIGITO DE VERIFICACIÓN | Crear y modificar | Crear y modificar | Crear y modificar | NO | NO | NO | NO | NO |
| RAZÓN SOCIAL | Crear y modificar | Crear y modificar | Crear y modificar | NO | NO | NO | NO | NO |
| DIRECCIÓN | Crear y modificar | Crear y modificar | Crear y modificar | NO | NO | NO | NO | NO |
| CIUDAD | Crear y modificar | Crear y modificar | Crear y modificar | NO | NO | NO | NO | NO |
| DEPARTAMENTO | Crear y modificar | Crear y modificar | Crear y modificar | NO | NO | NO | NO | NO |
| TELEFONO PRINCIPAL | Crear y modificar | Crear y modificar | Crear y modificar | NO | NO | NO | NO | NO |
| CORREO DE FACTURACIÓN | NO | NO | NO | NO | Crear y modificar | NO | NO | NO |
| FORMA DE PAGO | Crear y modificar | NO | NO | NO | Crear y modificar | NO | NO | NO |
| COMERCIAL ASIGNADO | Modificar | Modificar | NO | NO | NO | NO | NO | NO |
| INFORMACIÓN DE CONTACTO: | Crear y modificar | Crear y modificar | Crear y modificar | NO | NO | NO | NO | NO |
| NOMBRE | Crear y modificar | Crear y modificar | Crear y modificar | NO | NO | NO | NO | NO |
| TELEFONO | Crear y modificar | Crear y modificar | Crear y modificar | NO | NO | NO | NO | NO |
| CORREO ELECTRONICO | Crear y modificar | Crear y modificar | Crear y modificar | NO | NO | NO | NO | NO |

## Notas

- El correo de facturación solo puede ser gestionado por Auxiliar Financiera
- La forma de pago puede ser gestionada por Gerencia General y Auxiliar Financiera
- El comercial asignado solo puede ser modificado por Gerencia General y Gerencia Comercial
- La información de contacto (nombre, teléfono, correo) puede ser creada y modificada por Gerencia General, Gerencia Comercial y Comerciales
