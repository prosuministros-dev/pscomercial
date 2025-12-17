HU-0011 – Creación y Gestión de Roles y Permisos de Usuario
Ultima actualización | Laura Martínez | 21/10/2025
Resumen Ejecutivo
El sistema debe permitir la creación, edición y asignación de roles y permisos a los usuarios que interactúan con los diferentes módulos (Comercial, Logística, Gerencia, Administración, etc.).
Esto garantiza la seguridad de la información y el control de acceso a funcionalidades según el perfil del usuario.
Alcance

Este requerimiento aplica al módulo de Administración del Sistema.
Involucra principalmente a los roles Administrador del Sistema y Gerencia General, que son quienes pueden crear o modificar roles.
Incluye la definición de permisos por módulo, vista o acción (crear, editar, ver, aprobar, eliminar) y la asignación de dichos permisos a cada usuario.
No incluye la autenticación de usuarios (login o recuperación de contraseña), ya que se encuentra en otro requerimiento base de acceso.
Descripción detallada del requerimiento
Creación de roles:
El usuario administrador podrá crear roles desde la interfaz de configuración del sistema.
Cada rol debe incluir los siguientes campos:
Nombre del rol (texto obligatorio).
Descripción breve.
Estado (activo/inactivo).
Los roles creados quedarán disponibles para asignación inmediata.
Definición de permisos:
Para cada rol, el administrador podrá asignar permisos específicos sobre módulos y funcionalidades del sistema:
Permisos base: Crear / Editar / Ver / Eliminar / Aprobar.
Permisos específicos: Acceso a flujos o submódulos concretos (por ejemplo: Gestión de Leads, Cotizaciones, Facturación, Reportes).
Los permisos deben almacenarse en una tabla de control relacionada con el ID del rol.
Asignación de roles a usuarios:
Al crear o editar un usuario, el sistema debe permitir asignar uno o varios roles.
Cada usuario hereda automáticamente los permisos del rol asignado.
Si un usuario tiene múltiples roles, los permisos se combinan (suma de permisos sin duplicidad).
Gestión de usuarios:
El sistema debe permitir visualizar todos los usuarios con su rol actual, estado y fecha de última actividad.
Los roles inactivos no deben poder asignarse.
Si un usuario se desactiva, debe perder inmediatamente acceso al sistema.
Control de acceso por rol:
Cada módulo o vista del sistema debe validar el rol del usuario antes de permitir acceso o acciones.
Si el usuario intenta acceder a un módulo sin permiso, el sistema debe mostrar un mensaje:
“Acceso denegado. No cuenta con permisos para esta acción.”
Bitácora de control:
Todas las acciones de creación, modificación o eliminación de roles y usuarios deben registrarse en una bitácora administrativa.
La bitácora debe incluir: usuario administrador, acción, fecha, hora y descripción del cambio.


Casos de uso
CU-11.1 – Crear nuevo rol:
El administrador define un nuevo rol con permisos específicos.
CU-11.2 – Editar rol existente:
El administrador actualiza los permisos o la descripción de un rol.
CU-11.3 – Asignar rol a usuario:
El administrador asigna un rol a un usuario existente.
CU-11.4 – Desactivar usuario o rol:
El administrador inactiva un rol o usuario y el sistema revoca el acceso.
CU-11.5 – Validar acceso a módulo:
El sistema valida los permisos antes de ejecutar cualquier acción.
CU-11.6 – Registrar cambios en bitácora:
Todas las acciones administrativas se registran con trazabilidad.

Flujos de trabajo
Flujo 1 – Creación de rol
Administrador ingresa a “Configuración → Roles y Permisos”.
Selecciona “Nuevo Rol”.
Ingresa nombre, descripción y estado.
Asigna permisos por módulo.
Guarda cambios → Rol queda activo.
Flujo 2 – Asignación de roles a usuarios
Administrador accede a “Gestión de Usuarios”.
Selecciona usuario → “Editar”.
Asigna uno o más roles disponibles.
Guarda cambios → Usuario hereda permisos.
Flujo 3 – Validación de permisos en uso
Usuario intenta acceder a módulo.
Sistema consulta permisos asociados a su rol.
Si tiene permiso → acceso concedido.
Si no tiene → mensaje de “Acceso denegado”.
Flujo 4 – Bitácora de control
Cada creación, modificación o eliminación de rol/usuario se registra.
Registro incluye: usuario admin, acción, fecha, hora, detalles.


Criterios de aceptación
El sistema debe permitir crear, editar y eliminar roles.
Los permisos deben configurarse por módulo y acción.
Los roles inactivos no deben poder asignarse a nuevos usuarios.
Cada usuario debe heredar permisos del rol asignado.
Si el usuario se desactiva, debe perder acceso inmediato.
El sistema debe validar los permisos antes de ejecutar cualquier acción.
Todas las acciones deben registrarse en una bitácora con trazabilidad.
Ver anexo: proceso comercial

No hace parte del alcance del presente requerimiento
El flujo de autenticación (login, logout, recuperación de contraseña).
La integración con sistemas externos de gestión de usuarios (LDAP, Active Directory).
La configuración de jerarquías de aprobación o delegación.
