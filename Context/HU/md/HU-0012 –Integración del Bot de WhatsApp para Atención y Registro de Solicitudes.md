HU-0012 – Integración Completa del Bot de WhatsApp para Atención, Registro de Solicitudes, Sincronización con WhatsApp Business y Creación de Leads
Ultima actualización | Laura Martínez | 04/12/2025
Objetivo
Como Usuario del sistema / Cliente / Lead que escribe al WhatsApp oficial, Quiero Que un bot gestione mi conversación, clasifique mi necesidad, sincronice el número de WhatsApp Business del asesor con la plataforma, permita convertir la conversación en un Lead con toda la información recolectada y registre correctamente la solicitud en el sistema, Para Recibir atención ordenada, que mi información no se pierda y que el equipo pueda gestionar todo desde una misma plataforma con trazabilidad completa.

Resumen Ejecutivo
La integración con WhatsApp debe permitir que:
El bot reciba todos los mensajes entrantes y ofrezca un menú inicial:
1: Solicitar una Cotización
2: Consulta el estado de tu pedido
3: Otros motivos (soporte, documentos, área financiera)
El bot capture y estructure información del usuario (nombre, identificación, motivo, evidencias).
Se realice el embedded sign-up, para sincronizar el número WhatsApp Business de los asesores con la plataforma, de manera que:
El asesor siga usando su WhatsApp Business normal.
La plataforma reciba y refleje las conversaciones.
Se pueda crear un Lead desde la plataforma con la información del chat.
Se mantenga trazabilidad completa de mensajes, adjuntos y acciones.
La plataforma pueda convertir cualquier conversación de WhatsApp en un Lead, con datos y adjuntos.
Se manejen casos especiales como:
Usuario no responde
Archivos sin texto
Solicitudes desordenadas
Duplicados
Conversaciones que deben ser enviadas a un número personal → se usa hyperlink
Se cree una solicitud interna según el tipo (cotización, pedido, soporte, financiero, documental).

Alcance
Recepción de mensajes entrantes por WhatsApp.
Menú inicial interactivo (1–3).
Clasificación automática de intención.
Captura guiada de datos faltantes.
Manejo de adjuntos (fotos, documentos).
Embedded Sign-Up para sincronizar el número de WhatsApp Business del asesor.
Visualización y gestión de conversaciones dentro de la plataforma.
Capacidad de responder desde plataforma o desde WhatsApp Business.
Creación de Lead desde la conversación (WhatsApp → Lead).
Adjuntar el historial conversacional al Lead/caso.
Asignación automática o manual de conversaciones.
Plantillas de comunicación según escenario.
Mensaje final de confirmación con número de caso.
.Descripción detallada del requerimiento
Menú Inicial (Obligatorio)

👋 ¡Hola! Bienvenido a PROSUMINISTROS 🧰
Tu aliado en hardware, software, accesorios y servicios de infraestructura IT.
Para poder atenderte mejor, por favor cuéntame qué deseas hacer hoy:
1️⃣ Solicitar una Cotización
2️⃣ Consulta el estado de tu pedido
3️⃣ Otro motivo (soporte, documentos, facturación, área financiera)”
Estoy aquí para apoyarte. 🚀

Workflows Complejamente Integrados (Completo)
Workflow general
Usuario escribe.
Bot clasifica si es nuevo o recurrente.
Bot muestra menú inicial.
Bot dirige a uno de los 3 flujos principales.
Bot recolecta datos obligatorios.
Bot crea la solicitud o permite crear el Lead.
Plataforma conserva toda la conversación como historial.
Asesor puede continuar desde su WhatsApp Business sincronizado.

Embedded Sign-Up (Sincronización del número del asesor)
El asesor realiza el proceso de embedded sign-up para vincular su número de WhatsApp Business con la plataforma.
Una vez vinculado:
La plataforma refleja en tiempo real la conversación que llega al número del asesor.
El asesor puede responder desde WhatsApp Business o desde la plataforma.
La conversación se almacena con trazabilidad.
Limitación técnica clave (Meta API)
Meta NO permite:
❌ Transferir una conversación activa de un número A a un número B.
Por eso:
La plataforma solo puede reflejar y gestionar la conversación del número sincronizado.
Si un flujo requiere mandar al usuario a un número personal → se usa hyperlink directo (perdiendo trazabilidad).

Workflow WhatsApp → Lead
Durante la conversación el bot detecta intención comercial.
La plataforma activa el botón “Crear Lead” desde la ventana de conversación.
Se extrae automáticamente:
Nombre
Teléfono
ID
Mensajes relevantes
Adjuntos
Tipo de solicitud
Se crea un Lead en el módulo Lead
Se asocia el historial conversacional al Lead.
Si el Lead existe → sugerir “Actualizar Lead”.

Workflows por cada Opción del Menú
🔵 OPCIÓN 1 – Cotización
Incluye:
Captura de datos
Adjuntos
Plantillas
Validación
Creación de caso en sistema

🟢 OPCIÓN 2 – Seguimiento de Pedido
Incluye:
Pedir nombre de comercial
Identificar al comercial dentro de la plataforma.
Crear una notificación automática dirigida a ese comercial.
Mostrar plantilla de estado
Manejo de errores
Vincular adjuntos si aplican

🟣 OPCIÓN 3 – Otros Motivos: Soporte, Documentos, Área Financiera
Incluye:
Identificación de intención
Preguntar qué tipo de documento, soporte o trámite financiero necesita
Identificar al comercial dentro de la plataforma.
Crear una notificación automática dirigida a ese comercial.
Crear caso dirigido al área correcta

Casos de uso
Escenario 1 – Usuario quiere soporte inmediato
El bot debe reconocer palabras clave como:
“dañada”, “fallo”, “no funciona”, “soporte”, “ayuda”, etc.
→ Clasificar como incidente.
Escenario 2 – Usuario quiere información
El bot debe identificar palabras como:
“precio”, “cotización”, “quiero saber”, “información”.
→ Crear solicitud de información.
Escenario 3 – Usuario escribe textos sin estructura
El bot debe:
Seguir preguntando
Ordenar la información
No perder el hilo conversacional (tema mencionado explícitamente por ellos)
Escenario 4 – Usuario envía solo un archivo
El bot solicita detalles:
“Por favor indícame qué necesitas con esa imagen/documento.”
Escenario 5 – Usuario escribe varias veces sobre lo mismo
El bot debe evitar duplicados y continuar el mismo caso si está dentro de una ventana de tiempo.
Escenario 6  – Embedded Sign-Up
Validación del proceso
Error de vinculación
Plataforma reflejando mensajes del número sincronizado
Escenario 7 – Creación de Lead desde conversación
Lead con adjuntos
Lead actualizado si ya existía
Escenario 8  – Hyperlink a número personal
Confirmación de pérdida de trazabilidad

Flujos de trabajo
Flujo A – Usuario nuevo
Usuario escribe por primera vez.
Bot responde con saludo y validación de datos.
Usuario responde con su nombre.
Bot pide identificación.
Bot pregunta el motivo/contacto.
Bot clasifica según reglas que explicaron.
Bot crea el registro en el sistema.
Bot confirma.
Flujo B – Cliente existente
Usuario escribe.
Bot identifica número asociado.
Bot solicita información faltante.
Bot clasifica la solicitud.
Crea la solicitud en el sistema.
Envía confirmación.
Flujo C – Usuario envia fotos, audios y textos revueltos
Usuario envía evidencias antes de que el bot pregunte.
Bot las guarda temporalmente.
Bot continúa el flujo para capturar los datos restantes.
Todas las evidencias se adjuntan a la solicitud final.
Flujo D – Usuario no responde
Bot pregunta algo.
Espera X minutos.
Envía recordatorio.
Si no hay respuesta, cierra conversación y registra como “incompleto”.


3. Plantillas para TODOS los casos
A continuación están todas las plantillas que debe usar el bot, organizadas por tipo de escenario.

PLANTILLA A – Usuario nuevo (primer contacto)
Mensaje 1 – Saludo inicial
👋 ¡Hola! Bienvenido a PROSUMINISTROS 🧰
Tu aliado en hardware, software, accesorios y servicios de infraestructura IT.
Mensaje 2 – Solicitud de nombre
“¿Cuál es tu nombre completo?”
Mensaje 3 – Solicitud de identificación
“Perfecto, gracias. ¿Podrías indicarme tu número de identificación o documento?”
Mensaje 4 – Motivo de contacto
“Gracias. Para poder atenderte mejor, por favor cuéntame qué deseas hacer hoy:
1️⃣ Solicitar una cotización
2️⃣ Consulta el estado de tu pedido
3️⃣ Otro motivo (soporte técnico, documentación, facturación o área financiera)
Mensaje 5 – Confirmación de creación del caso
“Listo, tu solicitud fue registrada correctamente con el número [N° de caso]. Un asesor la revisará y te contactará.”

PLANTILLA B – Cliente existente
Mensaje 1 – Identificación automática
“He encontrado tu número en nuestro sistema ✔️. Para continuar solo necesito que me confirmes lo siguiente.”
Mensaje 2 – Solicitud de datos faltantes
“¿Puedes indicarme brevemente qué necesitas para poder clasificar correctamente tu solicitud?”
Mensaje 3 – Confirmación
“Tu solicitud fue registrada con el número [N° de caso]. Un asesor se comunicará contigo pronto.”

PLANTILLA C – Solicitud de seguimiento de pedido
Mensaje 1 – Pedir nombre de comercial
“Para ayudarte mejor, ¿puedes decirme qué comercial te atendió cuando realizaste este pedido?”
Mensaje 2 – comercial encontrado
“Perfecto 😊. Ya notifiqué a [Nombre del Comercial] sobre tu consulta. Pronto se comunicará contigo.”
PLANTILLA D – Solicitud de información / cotización
Detona con: “precio”, “cotización”, “información”, “me gustaría saber”.
Mensaje 1 – Identificar necesidad
“Claro, con gusto te ayudo con información. ¿Sobre qué producto deseas recibir detalle?”
Mensaje 2 – Datos necesarios
“¿Deseas una cotización formal o solo información general?”
Mensaje 3 – Confirmación
“Perfecto. He registrado tu solicitud con el número [N° de caso]. Un asesor te enviará la información.”

PLANTILLA E – 3 – Otro motivo
Mensaje 1 – Pedir proceso
“Para ayudarte mejor, ¿puedes decirme qué proceso necesitas realizar?”
Mensaje 2 – comercial encontrado
“Perfecto 😊. Ya notifiqué a [Nombre del Comercial] sobre tu consulta. Pronto se comunicará contigo.”

PLANTILLA F – Usuario escribe mensajes desordenados o mucha información sin estructura
Mensaje 1
“Gracias por tu mensaje. Para poder ayudarte necesito organizar un poco la información. ¿Podrías decirme en una frase qué necesitas?”
Mensaje 2
“Perfecto, ahora indícame por favor los detalles que consideres importantes para tu solicitud.”

PLANTILLA G – Usuario no responde
Recordatorio 1 (tras X minutos)
“¿Sigues ahí? 😊 Solo necesito tu respuesta anterior para continuar.”
Recordatorio 2
“Si necesitas más tiempo, no te preocupes. Continuaré esperando tu información.”
Cierre automático
“No recibimos respuesta, por lo que la conversación se ha cerrado. Si necesitas ayuda, puedes escribirnos de nuevo cuando quieras.”

PLANTILLA H – Duplicados (usuario escribe varias veces sobre lo mismo)
Mensaje 1
“Ya tenemos un caso abierto para esta misma solicitud ✔️. Continuaremos usándolo para mantener toda la información organizada.”
Mensaje 2
“Si deseas agregar más detalles o enviar evidencias, puedes hacerlo aquí mismo.”

PLANTILLA I – Confirmación final (todos los casos)
Mensaje estándar
“¡Perfecto! Tu solicitud fue registrada con el número [N° de caso]. Nuestro equipo la revisará y te responderá lo más pronto posible.”

PLANTILLA J - Embedded Sign-Up
“Por favor confirma tu número de WhatsApp Business para vincularlo a la plataforma. Este proceso se llama embedded sign-up. Una vez vinculado podrás gestionar tus conversaciones directamente desde la plataforma.”

PLANTILLA K - Limitación Meta
“⚠️ Meta no permite transferir conversaciones entre números distintos. Podemos enviarte un enlace al número del asesor, pero se perderá la trazabilidad.”


Criterios de aceptación
El menú inicial debe funcionar con opciones 1, 2 y 3
El bot debe clasificar intención en base a palabras clave
El sistema debe permitir embedded sign-up del número del asesor
Las conversaciones del número sincronizado deben verse en la plataforma
Debe existir el botón “Crear Lead” en la conversación
Toda conversación convertida en Lead debe conservar mensajes y adjuntos
El bot debe manejar inactividad, duplicados y adjuntos
Al seleccionar “Seguimiento de pedido” el bot debe obligatoriamente pedir el comercial que atendió al cliente.
Al seleccionar “Otro motivo” el bot debe identificar la necesidad para dirigir el requerimiento al área correspondiente.
El sistema debe enviar una notificación interna al comercial indicado por el usuario.
Se debe poder enviar hyperlink cuando aplica
Todas las acciones deben quedar en bitácora
No hace parte del alcance del presente requerimiento
Transferir la conversación activa entre números distintos (limite de Meta API).
Envío automático de documentos (se gestiona como caso).
Integración con sistemas contables externos (a futuro).
Automatización de diagnósticos técnicos.
