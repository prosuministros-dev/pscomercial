HU-0005 – Aprobación de Cotización por Margen Mínimo
Ultima actualización | Laura Martínez | 21/10/2025
Resumen Ejecutivo
El sistema debe validar automáticamente el margen de utilidad calculado en cada cotización. Cuando el margen esté por debajo del valor mínimo configurado, se debe requerir la aprobación de la gerencia antes de que el asesor pueda continuar con el proceso comercial (envío al cliente o generación de pedido).
Alcance

Este requerimiento aplica al módulo de Gestión de Cotizaciones e involucra a los roles Comercial, Gerencia Comercial y Administración Financiera.

Incluye la validación automática del margen, la generación de alertas y la aprobación manual por parte de los usuarios con rol de gerencia.
No incluye la revisión del cupo de crédito ni la autorización de extracupo (cubiertas en HU05).
Descripción detallada del requerimiento
Cálculo del margen:
Al guardar o actualizar una cotización, el sistema debe calcular automáticamente el margen de utilidad aplicando la fórmula:

Margen (%) = 1- (Total costo / total venta).
El costo total debe incluir los valores de transporte, descuentos y TRM del día.
Validación contra margen mínimo:
El sistema debe comparar el margen calculado con el margen mínimo configurado por categorías y crédito en el módulo de parámetros.
Si el margen ≥ margen mínimo → la cotización se aprueba automáticamente.
Si el margen < margen mínimo → se bloquea el envío de la cotización a la generación de pedido o aprobación automática y se requiere intervención de la gerencia.
Solicitud de aprobación:
Cuando se detecte un margen inferior al mínimo, el sistema debe generar un modal para el asesor, indicándole si quiere enviar una solicitud de aprobación dirigida a los usuarios con rol de Gerencia Comercial.
La solicitud debe incluir:
Código de la cotización
Cliente
Margen calculado
Margen mínimo requerido
Nombre del asesor
Fecha de creación

El asesor no podrá continuar con el envío de la cotización a pedidos hasta recibir una respuesta de aprobación o rechazo, pero si podrá exportarla para enviarla al cliente para su revisión.
Al momento de revisar el margen el rol gerencia debe poder suministrar un margen opcional, en el modal, la casilla será de margen aprobado
Aprobación o rechazo:
El usuario con rol de gerencia podrá aprobar o rechazar la solicitud directamente desde el panel de aprobaciones.
En caso de aprobación:
El asesor recibe una notificación de autorización y puede continuar con el proceso.
En el sistema en el campo de observaciones de esa cotización debe quedar el comentario de “aprobado bajo menor margen” por el siguiente margen [margen]
En caso de rechazo:
El asesor recibe una notificación con el comentario o motivo de rechazo.
Trazabilidad:
Cada acción (solicitud, aprobación, rechazo) debe registrarse con usuario, fecha y hora.
Los registros deben conservarse en la bitácora general del módulo de cotizaciones.


Casos de uso
CU-04.1 – Validación de margen:
El sistema compara el margen calculado con el margen mínimo configurado.
CU-04.2 – Generación de solicitud:
Si el margen es menor al mínimo, el sistema genera una solicitud de aprobación.
CU-04.3 – Aprobación de cotización:
Gerencia revisa la cotización y aprueba el margen, permitiendo continuar el proceso.
CU-04.4 – Rechazo de cotización:
Gerencia rechaza la cotización indicando motivo y observaciones.
CU-04.5 – Registro de bitácora:
El sistema registra automáticamente todos los eventos de aprobación o rechazo.

Flujos de trabajo
Flujo 1 – Validación automática del margen por producto
Asesor crea o edita cotización.
El sistema calcula margen automáticamente.
Compara con el margen mínimo configurado.
Si margen ≥ mínimo → cotización se guarda como “Aprobada”.
Si margen < mínimo → sistema genera solicitud de aprobación.
Flujo 2 – Proceso de aprobación por gerencia
Gerencia recibe notificación de solicitud pendiente.
Ingresa al panel de “Aprobaciones de Cotización”.
Visualiza datos de cliente, asesor, margen y observaciones.
Selecciona acción: Aprobar o Rechazar.
Sistema notifica al asesor.
Flujo 3 – Registro y trazabilidad
Toda acción se almacena en la tabla de auditoría.
Campos registrados: cotización, usuario, rol, acción, fecha y hora.
El historial puede consultarse desde el módulo de cotizaciones

Criterios de aceptación
El sistema debe calcular el margen de utilidad en todas las cotizaciones.
La comparación debe realizarse automáticamente al guardar o actualizar una cotización.
Si el margen es inferior al mínimo, debe bloquear el envío y solicitar aprobación.
Solo usuarios con rol de Gerencia o Finanzas pueden aprobar o rechazar.
Toda acción debe quedar registrada en bitácora con trazabilidad completa.
La notificación debe enviarse tanto al asesor como a la gerencia.
Una cotización no puede ser enviada al cliente si no ha sido aprobada cuando el margen es bajo.

No hace parte del alcance del presente requerimiento
La validación de cupos de crédito o extracupo.
El envío de la cotización al cliente (cubierto en HU06).
La configuración de los márgenes en la tabla de parámetros (definida en otro requerimiento).
