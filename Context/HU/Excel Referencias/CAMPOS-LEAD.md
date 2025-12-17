# CAMPOS - MÓDULO LEAD

> **Fuente**: PROCESO COMERCIAL (1).xlsx - Pestaña "LEAD"

## Campos del Módulo

| # | CAMPO | DESCRIPCIÓN |
|---|-------|-------------|
| 1 | NUMERO DE LEAD | EL SISTEMA LO GENERA DE MANERA AUTOMATICA, DEBEMOS INICIAR CON EL LEAD NO. 100 Y ASIGNAR DE MANERA AUTOMATICA A LOS COMERCIALES QUE LA GERENCIA SELECCIONE |
| 2 | FECHA DEL LEAD | Fecha de creación del lead |
| 3 | RAZÓN SOCIAL | Nombre de la empresa o razón social del contacto |
| 4 | NIT | Número de identificación tributaria |
| 5 | NOMBRE DEL CONTACTO | Nombre completo de la persona de contacto |
| 6 | CELULAR DEL CONTACTO | Número de celular del contacto |
| 7 | CORREO ELECTRONICO DEL CONTACTO | Email del contacto |
| 8 | REQUERIMIENTO | Descripción del requerimiento o necesidad del lead |

## Reglas de Negocio

1. **Numeración Automática**: El sistema genera automáticamente el número de lead, iniciando desde el **LEAD NO. 100**
2. **Asignación Automática**: Los leads se asignan de manera automática a los comerciales que la gerencia seleccione
3. **Notificaciones**: Deberá aparecer en alguna pestaña de notificaciones a los comerciales cuales son los leads pendientes por atender
4. **Tiempo de Conversión**: Todo lead deberá convertirse en cotización en un tiempo no mayor a **UN DÍA**
5. **Alertas de Demora**: Si el lead no se convierte en cotización en el tiempo establecido, generar alerta de demora

## Notas Adicionales

- Los leads pendientes deben ser visibles para los comerciales asignados
- El sistema debe generar alertas automáticas cuando un lead supere el tiempo límite sin convertirse en cotización
