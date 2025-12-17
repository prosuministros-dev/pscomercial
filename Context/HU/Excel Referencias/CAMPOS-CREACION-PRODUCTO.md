# CAMPOS - MÓDULO CREACIÓN DE PRODUCTO

> **Fuente**: PROCESO COMERCIAL (1).xlsx - Pestaña "Creación de producto"

## Campos del Módulo

| # | CAMPO | TIPO DE CASILLA |
|---|-------|-----------------|
| 1 | NUMERO DE PARTE | OBLIGATORIA |
| 2 | NOMBRE DEL PRODUCTO | OBLIGATORIA |
| 3 | VERTICAL | OBLIGATORIA |
| 4 | MARCA | OBLIGATORIA |
| 5 | IMPUESTO A APLICAR (SELECCIONAR EN MODO LISTA 0%, 5%, 19%) | OBLIGATORIA |

## Matriz de Permisos por Rol

| CAMPO | GERENCIA GENERAL | GERENCIA COMERCIAL | COMERCIALES | COMPRAS | AUXILIAR FINANCIERA | AUXILIAR ADMINISTRATIVA | JEFE DE BODEGA | AUXILIAR DE BODEGA |
|-------|------------------|-------------------|-------------|---------|---------------------|------------------------|----------------|-------------------|
| NUMERO DE PARTE | Crear y modificar | Crear | Crear | NO | NO | NO | NO | NO |
| NOMBRE DEL PRODUCTO | Crear y modificar | Crear | Crear | NO | NO | NO | NO | NO |
| VERTICAL | Crear y modificar | NO | NO | NO | NO | NO | NO | NO |
| MARCA | Crear y modificar | NO | NO | NO | NO | NO | NO | NO |
| IMPUESTO A APLICAR (SELECCIONAR EN MODO LISTA 0%, 5%, 19%) | Crear y modificar | NO | NO | NO | NO | NO | NO | NO |

## Notas

- **VERTICAL** y **MARCA** solo pueden ser gestionados por Gerencia General
- **IMPUESTO A APLICAR** solo puede ser gestionado por Gerencia General
- El impuesto se selecciona de una lista con los valores: 0%, 5%, 19%
- Gerencia Comercial y Comerciales solo pueden crear (no modificar) el número de parte y nombre del producto
