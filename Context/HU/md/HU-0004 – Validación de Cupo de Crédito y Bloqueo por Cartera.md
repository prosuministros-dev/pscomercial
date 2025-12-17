HU-0004 – Validación Manual de Bloqueo de Cartera (MVP)
Ultima actualización | Laura Martínez | 21/10/2025
Resumen Ejecutivo
Para el MVP del proceso de cotización, la única validación financiera requerida será confirmar si el cliente presenta bloqueo de cartera. Esta validación será 100% manual y exclusiva del área financiera, ya que el sistema no realizará cálculos automáticos de margen, crédito ni cartera vencida. El área financiera será la única autorizada para marcar si un cliente tiene o no bloqueo, y dicha selección determinará si una cotización puede avanzar hacia la creación de un pedido.
Alcance

El sistema mostrará un campo manual denominado “Cliente con bloqueo de cartera”, pero solo visible y editable para el área financiera.
Los usuarios comerciales podrán ver el estado, pero no modificarlo.
El sistema no hará validaciones automáticas de margen, crédito ni cartera; solo se registra la selección hecha por el área financiera.
Si el cliente está bloqueado, la cotización se guarda, pero no podrá generar pedido.
Si está desbloqueado, continúa el flujo normal.

Descripción detallada del requerimiento
Al crear una cotización, el usuario comercial puede completarla sin restricciones.
En el detalle de la cotización, el sistema mostrará el campo “Cliente con bloqueo de cartera”:
Área financiera: puede modificarlo.
Área comercial: solo puede visualizarlo.
El área financiera será responsable de marcar:
Sí → Cliente bloqueado
No → Cliente sin bloqueo
Si se marca Sí, el sistema:
Permite guardar la cotización.
Bloquea la creación de pedido.
Muestra mensaje informativo indicando que el cliente tiene bloqueo de cartera.
Si se marca No, la cotización puede avanzar al flujo normal de generación de pedido.
Toda acción del área financiera sobre este campo se registrará en la bitácora.

Casos de uso
Caso 1 – Cliente sin bloqueo (rol financiero)
Dado que el área financiera accede a la cotización
Y marca “Bloqueo de cartera: No”
Entonces el sistema guarda el estado
Y el comercial puede generar el pedido
Caso 2 – Cliente con bloqueo (rol financiero)
Dado que el área financiera accede a la cotización
Y marca “Bloqueo de cartera: Sí”
Entonces el sistema guarda la cotización
Y el comercial ve bloqueada la acción de generar pedido
Y se muestra un mensaje indicando el bloqueo
Caso 3 – Comercial sin permisos
Dado que un comercial ingresa al detalle
Entonces puede ver el estado del bloqueo
Pero no puede modificarlo
Caso 4 – Cambio de estado por finanzas
Dado que el cliente estaba bloqueado
Y el área financiera cambia a “No”
Entonces el comercial recupera la opción de generar pedido


Flujos de trabajo
Flujo Principal del Comercial
El comercial crea una cotización.
Guarda la cotización.
Observa el estado del campo “Bloqueo de cartera” (solo lectura).
Si está en “No”, puede generar un pedido.
Si está en “Sí”, la opción de generar pedido está bloqueada.
Flujo del Área Financiera
El área financiera ingresa al detalle de la cotización.
Modifica el campo “Cliente con bloqueo de cartera”.
Guarda la selección.
El sistema actualiza el estado y registra el cambio en bitácora.


Criterios de aceptación
El campo “Bloqueo de cartera” es visible para todos, pero editable solo por el área financiera.
El sistema no realiza ninguna validación automática (margen, crédito o cartera).
Si el estado es “Sí”, el pedido no puede generarse.
Si el estado es “No”, el flujo continúa normal.
El sistema debe registrar en bitácora:
Quién cambió el estado
Cuándo
Valor anterior y nuevo
El mensaje de bloqueo debe ser claro y visible para el comercial.

No hace parte del alcance del presente requerimiento
Validación automática de margen.
Validación automática de cupo o cartera vencida.
Integración con sistemas financieros externos.
Automatización de aprobaciones.
Cálculo de margen por producto o por cotización.
Cambios automáticos de estado basados en reglas financieras.
