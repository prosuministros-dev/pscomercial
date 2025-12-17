HU-0002 – Asignación de Leads
Ultima actualización | Laura Martínez | 21/10/2025
Resumen Ejecutivo
El sistema debe permitir la asignación de los leads capturados a los asesores comerciales disponibles, de forma automática y equitativa según la configuración establecida por la gerencia. También debe permitir la reasignación manual por parte del administrador cuando sea necesario.
Alcance

Este requerimiento aplica al módulo de Gestión Comercial e involucra las áreas de Gerencia Comercial y Asesoría Comercial.
Incluye la asignación automática, la notificación al asesor, la validación de disponibilidad, y la posibilidad de reasignar leads desde un panel administrativo.

No incluye la creación del lead ni su validación inicial (cubiertas en la HU01).Descripción detallada del requerimiento
Asignación automática:
Una vez creado el lead (HU01), el sistema debe asignarlo automáticamente a un asesor comercial activo y disponible.
La distribución debe ser aleatoria o balanceada según los usuarios registrados en el módulo de comerciales.
El listado de asesores disponibles será administrado por el rol Gerencia Comercial, quien podrá agregar o retirar asesores activos en el sistema.
Si un asesor se desactiva, el sistema debe excluirlo automáticamente del algoritmo de asignación.
Reasignación manual:
Un usuario con permisos de administrador podrá reasignar un lead a otro asesor comercial desde la interfaz de gestión de leads.
En el caso que se de baja un asesor comercial y este tenga asignado leads, la administración o gerencia deberá hacer la reasignación manual de estos
El sistema debe registrar en la bitácora la fecha, hora y usuario que realizó la reasignación.
Notificaciones:
Al momento de la asignación (automática o manual), el sistema debe enviar una notificación en la bandeja del asesor comercial correspondiente, indicando:
Código del lead.
Nombre del cliente o empresa.
Canal de origen.
Fecha y hora de asignación.
La notificación debe mostrarse en el panel del usuario y enviarse por correo electrónico (si está habilitado).
Estados y control:
Cada lead debe cambiar su estado a “Asignado” al completar el proceso.


Casos de uso
CU-02.1 – Asignación automática:
El sistema asigna un lead nuevo de manera aleatoria entre los asesores activos.
CU-02.2 – Asignación manual:
El administrador reasigna un lead a un asesor específico.
CU-02.3 – Registro de bitácora:
El sistema registra cada evento de asignación o reasignación con usuario, fecha y hora.

Flujos de trabajo
Flujo 1 – Asignación automática:
Lead creado en estado “Pendiente de Asignación” (HU01).
Sistema verifica asesores activos en el módulo de configuración.
Se selecciona aleatoriamente un asesor disponible.
El sistema asigna el lead y actualiza su estado a “Asignado”.
Se genera y envía notificación al asesor.
El sistema registra la asignación en la bitácora.
Flujo 2 – Asignación manual / Reasignación:
Usuario administrador ingresa al panel de leads.
Selecciona el lead → “Reasignar asesor”.
Elige nuevo asesor comercial.
El sistema actualiza el registro y genera notificación al nuevo asesor.
Se guarda el evento en la bitácora.

Criterios de aceptación
Los leads deben asignarse automáticamente solo a asesores activos.
La reasignación debe estar disponible únicamente para usuarios con permisos administrativos.
Toda asignación o reasignación debe registrarse en bitácora con fecha, hora y usuario.
El sistema debe notificar al asesor asignado mediante panel y/o correo.
Un lead solo puede estar asignado a un asesor a la vez.
El cambio de estado debe ser automático según la acción (Asignado)
Asignación automática de leads de forma equitativa entre asesores, con límite configurable ( máximo 5 pendientes por asesor).
Si un asesor se da de baja, re-asignar automáticamente sus leads al grupo general (no reasignación manual).

No hace parte del alcance del presente requerimiento
La creación inicial del lead (cubierta en HU01).
La gestión de cotizaciones o pedidos derivados del lead.
La automatización de alertas de seguimiento (serán cubiertas en requerimientos posteriores).
