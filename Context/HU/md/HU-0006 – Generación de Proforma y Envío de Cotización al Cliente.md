HU-0006 – Generación de Proforma y Envío de Cotización al Cliente
Ultima actualización | Laura Martínez | 21/10/2025
Resumen Ejecutivo
El sistema debe permitir la generación y envío de la cotización o proforma al cliente según su tipo de crédito.

Para clientes sin crédito, se debe generar una proforma como documento previo al pago.

Para clientes con crédito, el asesor puede enviar la cotización oficial directamente.
El sistema debe registrar el envío, generar recordatorios automáticos y notificar al asesor sobre las respuestas del cliente.
Alcance

Este requerimiento aplica a los módulos de Cotizaciones, Chatbot/Comunicación y Gestión Comercial.

Involucra las áreas Comercial, Financiera y Administración del Sistema.

Incluye la generación del documento PDF, envío automatizado, trazabilidad de respuesta y recordatorios automáticos de seguimiento.
No incluye la aprobación de crédito (HU05) ni la generación de órdenes de compra (cubierta en HU07).
Descripción detallada del requerimiento
Determinación del tipo de documento a enviar:
Si el cliente tiene crédito activo, el sistema permite enviar la cotización directamente.
Si el cliente no tiene crédito, el sistema debe generar una proforma en formato PDF, con la misma información de la cotización.
El campo “Tipo de documento” debe ser visible en la interfaz (valores posibles: Cotización / Proforma).
Generación del documento cotización/ proforma (PDF):
El sistema debe permitir generar el archivo PDF con la siguiente información:
Datos del cliente (razón social, NIT, contacto, correo).
Información de productos o servicios (cantidad, descripción, valor unitario, valor total).
Condiciones de pago.
Vigencia de la cotización o proforma.
Observaciones o notas del asesor.
El documento debe tener numeración consecutiva única y sello de estado (“Cotización” o “Proforma”).
Flujo para clientes sin crédito:
El asesor envía la solicitud al área financiera para generación de proforma
El asesor financiero selecciona “Generar Proforma”.
El sistema genera el PDF y lo asocia a la cotización correspondiente.
Se notifica automáticamente al asesor con el mensaje:
“Proforma generada y almacenada exitosamente.”
La proforma se envía al cliente por correo electrónico y/o canal de chatbot sería un envió del link público.
Envío de cotización a cliente (clientes con crédito):
El asesor selecciona “Enviar cotización al cliente”.
El sistema genera el documento PDF y lo adjunta en el mensaje.
El envío puede hacerse mediante:
Correo electrónico (automático).
Mensaje del chatbot con con el link publico.
El sistema registra la fecha y hora del envío y cambia el estado a “Enviada al Cliente”.
Cuando el cliente y el área financiera confirmen el pago se puede generar el pedido.
Recordatorios automáticos:
Si el cliente no responde dentro de 8 días, el sistema debe enviar un mensaje automático de seguimiento.
Condicional: si el cliente responde antes, el recordatorio no se envía.
El chatbot debe interpretar la respuesta del cliente (aceptación, solicitud de cambios, o rechazo) y registrar la interacción.
Respuestas del cliente:
Si el cliente acepta la cotización/proforma, el comercial deberá enviar la solicitud al área financiera para corroborar el pago
El área financiera confirmar con el soporte de pago, que el cliente ya pago, ingresando a la solicitud , dando en check ,para que se puede generar el pedido y habilitar el paso siguiente de manera manual: generación de orden de compra (HU07).
Si el cliente solicita cambios, el sistema registra la observación y notifica al asesor.
Si el cliente rechaza, el sistema cambia el estado a “Cotización Rechazada” y almacena el motivo.


Casos de uso
CU-06.1 – Generar proforma (cliente sin crédito):
El sistema genera un PDF de proforma y lo envía al cliente.
CU-06.2 – Enviar cotización (cliente con crédito):
El asesor envía la cotización generada al cliente mediante correo o chatbot.
CU-06.3 – Registro de envío:
El sistema guarda la fecha, hora, usuario y canal de envío.
CU-06.4 – Recordatorio automático:
El sistema envía recordatorio al cliente si no hay respuesta en 8 días.
CU-06.5 – Interpretación de respuesta:
El chatbot interpreta la respuesta del cliente y actualiza el estado del registro.

Flujos de trabajo
Flujo 1 – Cliente con crédito:
Asesor selecciona “Enviar cotización al cliente”.
El sistema genera PDF de cotización.
Envío automático al correo o chatbot.
Estado cambia a “Enviada al Cliente”.
Se programan recordatorios automáticos de seguimiento.
Flujo 2 – Cliente sin crédito (Proforma):
Asesor selecciona “Generar Proforma”.
El sistema genera PDF y lo adjunta a la cotización.
Se envía automáticamente al cliente.
Estado cambia a “Proforma Enviada”.
Registro de envío en bitácora.
Flujo 3 – Seguimiento y respuesta:
Si el cliente no responde en 8 días → chatbot envía recordatorio.
Si el cliente responde:
“Acepto”: estado cambia a “Aceptada por Cliente”.
“Deseo modificar”: estado “Pendiente de ajustes”.
“No acepto”: estado “Rechazada por Cliente”.
El sistema notifica al asesor de inmediato.

Criterios de aceptación
El sistema debe generar proformas solo para clientes sin crédito.
Las cotizaciones y proformas deben tener numeración consecutiva y registro en bitácora.
Los documentos PDF deben contener toda la información de cliente, productos y condiciones.
El envío debe registrarse con usuario, fecha, hora y canal.
Si no hay respuesta en 8 días, se debe enviar recordatorio automático.
Las respuestas del cliente deben ser interpretadas automáticamente por el chatbot.
Los estados deben actualizarse según la respuesta (Enviada, Aceptada, Rechazada, Pendiente de ajustes).

No hace parte del alcance del presente requerimiento
La generación de órdenes de compra posteriores a la aceptación (cubierta en HU07).
La integración con pasarelas de pago.
La configuración de plantillas gráficas del documento (manejado por el módulo de diseño).
