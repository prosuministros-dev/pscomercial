HU-0010 – Reportes y Tablero de Control Comercial
Ultima actualización | Laura Martínez | 21/10/2025
Resumen Ejecutivo
El sistema debe proporcionar un módulo de reportes y visualización de indicadores comerciales, que consolide la información generada a lo largo del proceso de gestión de leads, cotizaciones y facturación.
Este tablero permitirá a la Gerencia Comercial y al equipo de ventas tomar decisiones basadas en datos actualizados.
Alcance

Este requerimiento aplica al módulo de Gestión Comercial, específicamente en la vista de Reportes / Tablero de Control.
Involucra los roles Gerencia Comercial, Asesores Comerciales y Administración del Sistema.
Incluye la visualización de métricas clave, filtros dinámicos, estados de cotización, conversión por asesor y alertas de desempeño.
No incluye la exportación automatizada de reportes a sistemas externos (será considerada en una fase futura).
Descripción detallada del requerimiento
Componentes del tablero:
El tablero debe mostrar de forma gráfica y resumida los siguientes indicadores:
Total de leads recibidos (por periodo).
Total de cotizaciones creadas.
Total de cotizaciones enviadas / aceptadas / rechazadas / vencidas.
Porcentaje de conversión lead → cotización → venta.
Número de clientes nuevos vs recurrentes.
Tiempo promedio de respuesta de clientes.
Top 5 de asesores por valor de ventas y cotizaciones cerradas.
Filtros disponibles:
Rango de fechas (desde / hasta).
Asesor comercial.
Cliente.
Estado de cotización.
Canal de origen del lead (WhatsApp, web, desde el aplicativo
Reportes descargables:
El sistema debe permitir exportar los datos mostrados en formato Excel o PDF.
El archivo debe incluir los campos visibles en pantalla más fecha y hora de exportación.
Alertas visuales:
Las cotizaciones en estado crítico (8+ días sin respuesta) deben resaltarse con color rojo.
Las cotizaciones vencidas deben marcarse con un ícono de advertencia.
Los asesores con bajo seguimiento (menos del 50% de respuestas atendidas) deben aparecer en el resumen de alertas de gerencia.
Acceso a detalles:
Cada métrica debe ser clickeable para acceder al listado detallado correspondiente.
Ejemplo: al hacer clic en “Cotizaciones Aceptadas”, se muestra el listado filtrado de esas cotizaciones.
Frecuencia de actualización:
Los datos deben actualizarse en tiempo real.


Casos de uso
CU-10.1 – Consultar tablero de indicadores:
Gerencia Comercial visualiza métricas y KPIs generales.
CU-10.2 – Filtrar información:
El usuario aplica filtros por fecha, cliente, asesor o estado.
CU-10.3 – Descargar reporte:
El usuario genera un archivo Excel o PDF con los datos mostrados.
CU-10.4 – Analizar desempeño de asesores:
Gerencia revisa los resultados individuales por periodo.
CU-10.5 – Revisar alertas:
El sistema resalta cotizaciones críticas o vencidas y bajo rendimiento de seguimiento.

Flujos de trabajo
Flujo 1 – Consulta general de métricas
Usuario accede al módulo “Reportes”.
Sistema carga indicadores generales (por defecto últimos 30 días).
Usuario aplica filtros si desea.
Los gráficos se actualizan en tiempo real.
Flujo 2 – Exportación de información
Usuario selecciona “Exportar” → Excel o PDF.
Sistema genera archivo con datos visibles.
Archivo queda disponible para descarga inmediata.
Flujo 3 – Visualización de alertas
Sistema identifica cotizaciones con 8+ días sin respuesta.
Marca en color rojo y las incluye en alerta de gerencia.
Gerencia puede ingresar a detalle y asignar seguimiento.


Criterios de aceptación
El tablero debe mostrar métricas de leads, cotizaciones (según estado, semana y mes de cierre)y ventas consolidadas.
Los filtros deben ser funcionales y combinarse libremente.
Los reportes deben poder exportarse en Excel y PDF.
Los datos deben actualizarse automáticamente en tiempo real.
Los indicadores deben ser navegables (clic → detalle).
Las alertas visuales deben identificarse por color o ícono.
La información debe registrarse con trazabilidad (usuario, fecha y hora).




No hace parte del alcance del presente requerimiento
La conexión directa a bases externas o sistemas ERP.
El envío automático de reportes por correo electrónico.
La configuración de KPIs adicionales no definidos en esta HU.
