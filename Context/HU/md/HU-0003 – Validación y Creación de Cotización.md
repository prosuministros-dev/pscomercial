HU-0003 – Validación y Creación de Cotización
Ultima actualización | Laura Martínez | 21/10/2025
Resumen Ejecutivo
El sistema debe permitir que el asesor comercial, una vez recibe un lead asignado, confirme su validez (descartando casos de spam o duplicidad) y proceda con la creación de la cotización correspondiente, registrando toda la información del cliente, productos y condiciones financieras, incluyendo márgenes, TRM y transporte.
Alcance

Este requerimiento aplica al módulo de Gestión Comercial y abarca el proceso desde la validación inicial del lead hasta la generación de la cotización.
Involucra las áreas Comercial, Gerencia Comercial y Administración del Sistema, y se conecta con los módulos de Clientes, Productos y Cotizaciones.
Descripción detallada del requerimiento
Validación del lead:
El asesor recibe la notificación en su bandeja interna del lead asignado (HU02).
Debe analizar la información del lead y determinar si es válido o no válido (spam / no aplica).
Si el lead es rechazado, debe seleccionar una razón de rechazo desde la lista desplegable predefinida por Gerencia.
El sistema cambia el estado del lead a “Rechazado” y almacena la trazabilidad del motivo.
Creación de cotización:
Si el lead es válido, el asesor Comercial lo “convierte a lead” desde las acciones de la bandeja de lead
Cuando se da la acción de convertir, el lead debe pasar a la bandeja de lead, y se debe desplegar un formulario que debe incluir los siguientes campos obligatorios:
Número de cotización: El sistema lo genera de manera automática, se debe iniciar con la cotización #30.000
Fecha de cotización: Debe tener la fecha de manera automática, pero si el comercial la desea editar que lo pueda hacer
Datos del cliente (razón social, NIT, contacto, correo, teléfono), estos datos serán traídos del formulario de lead.
Forma de pago
Información del producto o servicio (código, descripción, cantidad, precio unitario, subtotal).
Campo no visible para el cliente que indique si el valor incluye transporte.
Condiciones financieras (forma de pago, cupo, descuentos aplicables).
Nota: El detalle de los campos que debe tener el formulario, se encuentra en el Excel “Procesos gerenciales” en la pestaña “solicitudes”
El sistema debe calcular automáticamente los precios de los productos utilizando la TRM del día y los márgenes vigentes.
Validación del margen:
Para el cálculo del marguen, se debe realizar por medio del árbol de asignación de porcentaje de márgenes, dado que cada categoría va variar su porcentaje de margen, al igual que esta depende del crédito con el que cuente el cliente.
Si el margen calculado es menor al margen mínimo configurado, el sistema debe requerir aprobación de gerencia antes de permitir continuar con el envío de la cotización.
Si el margen cumple con el mínimo, la cotización podrá generarse sin aprobación.
Integración con transporte:
El sistema debe permitir indicar si el valor de transporte está incluido o separado del valor total.
Si el valor no está incluido, el sistema debe permitir tener un campo en donde el asesor comercial incluya ese precio de manera manual.
Este valor de transporte no será visible en la cotización enviada al cliente.
Generación de cotización:
Al guardar, el sistema asignará un número consecutivo de cotización.
El estado del registro pasará a “Cotización Creada”.
Se notificará automáticamente al asesor de la creación exitosa y quedará disponible para revisión o envío al cliente.

Ordenamiento de ítems dentro de la cotización
En el detalle de la cotización, el usuario podrá definir libremente el orden de los productos incluidos; es decir, si una cotización contiene múltiples artículos, el sistema permitirá reorganizarlos cambiando su posición dentro del listado, de modo que un producto que aparece inicialmente en la primera posición pueda ser movido, por ejemplo, a la cuarta, o que un producto ubicado en la posición ocho pueda pasar a la posición dos. Esta reorganización debe reflejarse de manera inmediata en pantalla y el orden final debe mantenerse guardado en la cotización para todas sus visualizaciones posteriores.


Casos de uso
CU-03.1 – Validar lead:
El asesor revisa los datos del lead y determina si procede con la cotización.
CU-03.2 – Crear cotización:
El asesor ingresa los datos del cliente y los productos solicitados.
CU-03.3 – Calcular valores:
El sistema aplica la TRM del día y calcula los márgenes y totales.
CU-03.4 – Solicitar aprobación de margen:
Si el margen es menor al configurado, el sistema envía solicitud a Gerencia para aprobación.
CU-03.5 – Registrar cotización final:
El sistema genera el consecutivo, guarda el registro y cambia el estado a “Cotización Creada”.

Flujos de trabajo
Flujo 1 – Validación del Lead
Asesor recibe notificación del lead asignado.
Ingresa al detalle del lead.
Marca como “Válido” o “Rechazado”.
Si es rechazado → selecciona motivo → estado pasa a “Rechazado”.
Si es válido → pasa a creación de cotización.
Flujo 2 – Creación de Cotización
Asesor ingresa al formulario “Nueva Cotización”.
Completa datos del cliente, productos, cantidades y precios.
Indica si el valor incluye transporte.
Sistema aplica TRM del día y calcula márgenes.
Si el margen < mínimo → envía solicitud de aprobación a Gerencia.
Si margen ≥ mínimo → genera consecutivo y guarda la cotización.
El registro queda en estado “Cotización Creada”.
Flujo 3 – Validación de transporte (opcional)
Si “Incluye transporte” = No → sistema solicita valor estimado.
Asesor ingresa valor manualmente
Valor se incluye en el cálculo final del total de venta.

Criterios de aceptación
El sistema debe permitir validar si el lead es válido o no antes de crear la cotización.
Los leads rechazados deben registrar motivo, usuario y fecha.
El sistema debe aplicar automáticamente la TRM vigente y los márgenes configurados.
Si el margen está por debajo del mínimo, debe requerirse aprobación de Gerencia.
La cotización debe incluir campos obligatorios de cliente, producto y condiciones financieras.
El campo de transporte debe ser no visible para el cliente, pero registrado en la base de datos.
Los estados de la cotización son los siguientes: Cotizaciones: Creación de oferta / Negociación / Riesgo / Pendiente orden de compra / Perdida.
Toda cotización debe generar un consecutivo único y registrar fecha y hora.
El formato de impresión de la cotización será el siguiente:
Mostrar número de cotización asociada y número de pedido origen.
Crear subpestaña “Órdenes de Compra” dentro de Pedidos, sin ser una ventana aparte.
En la subpestaña, mostrar:
Órdenes de compra generadas asociadas a ese pedido.
Detalle de cada orden (número, proveedor, cantidades pendientes, estado).
Campos a revisar:
Estado “pago confirmado” solo aplica si la forma de pago es anticipada.
Si el cliente tiene crédito aprobado, mostrar estado “Disponible para compra”.
En la vista del pedido, incluir:
Datos del cliente (no editables).
Estado de pago.
Información de despacho (dirección, tipo, notas).
Campo de observaciones con notificación “@” (igual que en Leads).


No hace parte del alcance del presente requerimiento
La aprobación de márgenes por parte de Gerencia (cubre HU04).
La validación de cupos de crédito o bloqueo por cartera (cubre HU05).
El envío de la cotización al cliente y sus recordatorios automáticos (cubre HU06).
