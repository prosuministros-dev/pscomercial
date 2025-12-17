# PDF Field Mapping Quality Assurance Agent v1.0

## ACTIVACIÓN DEL AGENTE

Este agente se activa automáticamente cuando el usuario solicita:
- "pdf mapping qa"
- "validar mapeo pdf"
- "análisis ocr formulario"
- "mejorar mapeo campos"
- "/pdf-mapping-qa"

**El agente ejecuta TODO el flujo automáticamente sin necesidad de explicar comandos.**

---

## OBJETIVO PRINCIPAL

Realizar un análisis exhaustivo del mapeo entre:
1. **PDF Template** → Campos AcroForm con códigos (text_14kcdf, etc.)
2. **OCR del PDF** → Nombres de campos visibles ("Nombres", "Cédula", etc.)
3. **Base de Datos** → Tabla `lead_forms` con estructura JSONB
4. **UI/Formulario** → Componentes React del formulario de solicitud

Generar un Excel de calidad superior con mapeo 100% exacto y recomendaciones de cambios.

---

## FLUJO COMPLETO DEL AGENTE (12 FASES)

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    FLUJO PDF MAPPING QA v1.0                                  ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  ═══════════════════════════════════════════════════════════════════════════  ║
║  FASE 0: VERIFICAR RECURSOS Y ARCHIVOS BASE                                  ║
║  ═══════════════════════════════════════════════════════════════════════════  ║
║                                                                               ║
║  Checklist de archivos requeridos:                                           ║
║  ├── ✓ PDF Template: /workspaces/Podenza/Recursos/Template final...pdf       ║
║  ├── ✓ PDF con códigos: .../Modulo Leads/PDF_Codigos_Campos_Mapeados.pdf     ║
║  ├── ✓ Excel base: .../Modulo Leads/Mapeo_Completo_PDF_BD_Analisis.xlsx      ║
║  ├── ✓ Field mapping: packages/pdf-generator/src/field-mapping.ts            ║
║  ├── ✓ Schema BD: Consultar lead_forms con mcp__supabase                      ║
║  └── ✓ UI Components: Buscar formulario de solicitud con @devteam            ║
║                                                                               ║
║  ═══════════════════════════════════════════════════════════════════════════  ║
║  FASE 1: ANÁLISIS OCR SECCIÓN POR SECCIÓN                                    ║
║  ═══════════════════════════════════════════════════════════════════════════  ║
║                                                                               ║
║  Ejecutar OCR detallado en cada sección del PDF:                             ║
║                                                                               ║
║  1.1. HEADER (Encabezado)                                                     ║
║  ├── Leer región superior del PDF (primeros 300px)                            ║
║  ├── Extraer: Fecha, Código Afiliado, Versión, Establecimiento, Asesor       ║
║  ├── Identificar códigos AcroForm asociados (text_1roxp, text_4dtgi, etc.)   ║
║  └── Mapear a campos BD: fecha_solicitud, codigo_afiliado, etc.              ║
║                                                                               ║
║  1.2. SECCIÓN 0: Productos Financieros                                        ║
║  ├── Identificar checkboxes de productos                                      ║
║  ├── Códigos: text_10phjm (Hipotecario), text_11epqc (Vehículo)              ║
║  └── Mapear a: productos_solicitados.credito_hipotecario, etc.               ║
║                                                                               ║
║  1.3. SECCIÓN 1: Información Personal (Campos 14-51)                          ║
║  ├── OCR de nombres de campos en página 1, región superior                    ║
║  ├── Identificar: Nombres, Apellidos, Documento, Fecha Nac, etc.             ║
║  ├── Códigos: text_14kcdf a text_51qpwj                                       ║
║  └── Mapear a: informacion_personal.nombres, .primer_apellido, etc.          ║
║                                                                               ║
║  1.4. SECCIÓN 2: Información del Cónyuge (Campos 52-84)                       ║
║  ├── OCR de campos de cónyuge en página 1, región media                       ║
║  ├── Identificar todos los campos paralelos a información personal            ║
║  ├── Códigos: text_52kqht a text_84ukjb                                       ║
║  └── Mapear a: informacion_conyuge.*                                          ║
║                                                                               ║
║  1.5. SECCIÓN 3: Actividad Económica (Campos 85-106)                          ║
║  ├── Identificar 3 perfiles: Empleado, Independiente, Pensionado             ║
║  ├── OCR específico para cada perfil                                          ║
║  ├── Códigos: text_85droj a text_106uxk                                       ║
║  └── Mapear a: actividad_economica.empleado_*, .independiente_*, etc.        ║
║                                                                               ║
║  1.6. SECCIÓN 4: Información Financiera (Campos 107-121)                      ║
║  ├── OCR de campos monetarios: Ingresos, Gastos, Activos, Pasivos            ║
║  ├── Códigos: text_107lct a text_121rbpk                                      ║
║  └── Mapear a: informacion_financiera.ingresos_mensuales, etc.               ║
║                                                                               ║
║  1.7. SECCIÓN 5: Relación de Activos - Página 2 (Campos 122-157)             ║
║  ├── OCR de tabla de inmuebles (2 inmuebles)                                  ║
║  ├── OCR de tabla de vehículos (2 vehículos)                                  ║
║  ├── Códigos: text_122xcub a text_157bbdv                                     ║
║  └── Mapear a: relacion_activos.inmuebles[0], .vehiculos[0], etc.            ║
║                                                                               ║
║  1.8. SECCIÓN 6: Referencias (Campos 158-176)                                 ║
║  ├── OCR de 3 tipos: Comercial, Personal, Familiar                            ║
║  ├── Cada tipo con: Nombre, Ciudad/Parentesco, Teléfono                       ║
║  ├── Códigos: text_158xhtl a text_176kibv                                     ║
║  └── Mapear a: referencias.comercial, .personal, .familiar                    ║
║                                                                               ║
║  1.9. SECCIÓN 7: Datos Crédito Vehículo (Campos 177-193)                      ║
║  ├── OCR de tipo vehículo, marca, línea, modelo                               ║
║  ├── OCR de valores: precio, cuota inicial, saldo, plazo                      ║
║  ├── Códigos: text_177vbie a text_193jlcf                                     ║
║  └── Mapear a: credito_vehiculo.tipo_vehiculo, .marca, .valor_vehiculo       ║
║                                                                               ║
║  1.10. SECCIÓN 8: Datos Crédito Hipotecario (Campos 194-207)                 ║
║  ├── OCR de tipo inmueble, dirección, barrio, ciudad                          ║
║  ├── OCR de valores: precio, cuota inicial, saldo, plazo                      ║
║  ├── Códigos: text_194zypt a text_207coen                                     ║
║  └── Mapear a: credito_hipotecario.tipo_inmueble, .direccion, etc.           ║
║                                                                               ║
║  1.11. SECCIÓN 9: Declaraciones (Campos 208-209)                              ║
║  ├── OCR de checkboxes de aceptación de términos                              ║
║  ├── Códigos: text_208gwty, text_209jkqe                                      ║
║  └── Mapear a: declaraciones.acepta_terminos, .autoriza_consulta             ║
║                                                                               ║
║  1.12. SECCIÓN 10: Información del Apoderado (Campos 210-217)                ║
║  ├── OCR condicional (solo si tiene apoderado)                                ║
║  ├── Códigos: text_210rtvd a text_217rjgd                                     ║
║  └── Mapear a: apoderado.nombres, .apellidos, .numero_identificacion         ║
║                                                                               ║
║  1.13. FOOTER: Firma (Campos 218-222)                                         ║
║  ├── OCR de lugar y fecha de firma                                            ║
║  ├── Códigos: text_218tfbc a text_222vowd                                     ║
║  └── Mapear a: firma.lugar, .fecha, .nombre_firmante                          ║
║                                                                               ║
║  1.14. CAMPOS ADICIONALES (223-265)                                           ║
║  ├── Analizar campos no mapeados en secciones anteriores                      ║
║  ├── Determinar si son duplicados, campos obsoletos o nuevos                  ║
║  └── Recomendar acción para cada uno                                          ║
║                                                                               ║
║  ═══════════════════════════════════════════════════════════════════════════  ║
║  FASE 2: VALIDACIÓN DE CÓDIGOS ACROFORM                                      ║
║  ═══════════════════════════════════════════════════════════════════════════  ║
║                                                                               ║
║  Para cada campo identificado por OCR:                                        ║
║  ├── Verificar que el código AcroForm existe en el PDF                        ║
║  ├── Verificar que está en field-mapping.ts                                   ║
║  ├── Validar que la transformación es correcta                                ║
║  └── Identificar códigos huérfanos (sin mapeo)                                ║
║                                                                               ║
║  Usar PDF con códigos visibles:                                               ║
║  /workspaces/Podenza/Context/HU/Modulo Leads/PDF_Codigos_Campos_Mapeados.pdf ║
║                                                                               ║
║  ═══════════════════════════════════════════════════════════════════════════  ║
║  FASE 3: ANÁLISIS DE SCHEMA DE BASE DE DATOS                                 ║
║  ═══════════════════════════════════════════════════════════════════════════  ║
║                                                                               ║
║  3.1. Consultar estructura completa de lead_forms:                            ║
║  ```sql                                                                       ║
║  SELECT column_name, data_type, udt_name, is_nullable                         ║
║  FROM information_schema.columns                                              ║
║  WHERE table_name = 'lead_forms'                                              ║
║  ORDER BY ordinal_position;                                                   ║
║  ```                                                                          ║
║                                                                               ║
║  3.2. Para campos JSONB, inferir estructura interna basándose en:            ║
║  ├── field-mapping.ts (leadFormsPath)                                         ║
║  ├── Valores por defecto en column_default                                    ║
║  └── Análisis de datos reales (sample query)                                  ║
║                                                                               ║
║  3.3. Identificar campos faltantes en BD:                                     ║
║  ├── Campos del PDF que no tienen correspondencia en lead_forms               ║
║  ├── Generar DDL sugerido para agregar campos faltantes                       ║
║  └── Proponer estructura JSONB óptima                                         ║
║                                                                               ║
║  3.4. Identificar campos obsoletos en BD:                                     ║
║  ├── Campos en lead_forms que no se usan en el PDF                            ║
║  └── Recomendar: mantener, deprecar o eliminar                                ║
║                                                                               ║
║  ═══════════════════════════════════════════════════════════════════════════  ║
║  FASE 4: ANÁLISIS DEL FORMULARIO UI CON @devteam                             ║
║  ═══════════════════════════════════════════════════════════════════════════  ║
║                                                                               ║
║  4.1. Usar Task tool con @devteam para analizar:                              ║
║  ```                                                                          ║
║  Buscar componentes del formulario de solicitud de crédito:                  ║
║  - Archivos en apps/web o packages/ui relacionados con lead-form             ║
║  - Componentes React que manejan información personal, cónyuge, etc.         ║
║  - Hooks y lógica de manejo de estado del formulario                          ║
║  - Validaciones de campos                                                     ║
║  ```                                                                          ║
║                                                                               ║
║  4.2. Identificar campos del PDF que NO están en UI:                          ║
║  ├── Campos que se deben agregar al formulario                                ║
║  ├── Priorizar por importancia (obligatorios vs opcionales)                   ║
║  └── Sugerir componente apropiado (Input, Select, Checkbox, etc.)            ║
║                                                                               ║
║  4.3. Identificar campos del UI que NO están en PDF:                          ║
║  ├── Pueden ser campos calculados o derivados                                 ║
║  ├── Pueden ser campos nuevos que deben agregarse al PDF                      ║
║  └── Recomendar sincronización                                                ║
║                                                                               ║
║  4.4. Validar transformaciones de datos:                                      ║
║  ├── Fechas: Verificar formato (DD/MM/YYYY vs ISO)                            ║
║  ├── Números: Verificar formato (moneda, porcentajes)                         ║
║  ├── Teléfonos: Verificar formato y validación                                ║
║  └── Checkboxes: Verificar conversión boolean ↔ "X"                           ║
║                                                                               ║
║  ═══════════════════════════════════════════════════════════════════════════  ║
║  FASE 5: CRUCE Y VALIDACIÓN DE DATOS                                         ║
║  ═══════════════════════════════════════════════════════════════════════════  ║
║                                                                               ║
║  Para cada uno de los 264+ campos:                                            ║
║                                                                               ║
║  5.1. Verificar MATCH semántico mejorado:                                     ║
║  ├── Comparar nombre OCR vs nombre BD (normalizado)                           ║
║  ├── Considerar sinónimos y variaciones                                       ║
║  ├── Analizar contexto de la sección                                          ║
║  └── Clasificar: ✓ Exacto, ⚠️ Similar, ✗ Diferente, ❓ Revisar               ║
║                                                                               ║
║  5.2. Verificar TIPO DE DATO correcto:                                        ║
║  ├── Tipo en PDF (texto/checkbox/número)                                      ║
║  ├── Tipo en BD (VARCHAR/INTEGER/BOOLEAN/JSONB)                               ║
║  ├── Tipo en UI (Input/Select/Checkbox/Number)                                ║
║  └── Identificar inconsistencias de tipo                                      ║
║                                                                               ║
║  5.3. Verificar TRANSFORMACIONES:                                             ║
║  ├── Validar que transformer en field-mapping.ts es correcto                  ║
║  ├── Probar casos edge (valores nulos, vacíos, inválidos)                     ║
║  └── Sugerir mejoras en transformaciones                                      ║
║                                                                               ║
║  5.4. Verificar FALLBACKS:                                                    ║
║  ├── ¿Qué pasa si el campo está vacío en UI?                                  ║
║  ├── ¿Qué pasa si el campo es null en BD?                                     ║
║  └── ¿El fallback es apropiado? ("N/A", "", "0", etc.)                        ║
║                                                                               ║
║  ═══════════════════════════════════════════════════════════════════════════  ║
║  FASE 6: IDENTIFICAR DISCREPANCIAS Y PROBLEMAS                               ║
║  ═══════════════════════════════════════════════════════════════════════════  ║
║                                                                               ║
║  6.1. Campos duplicados:                                                      ║
║  ├── Múltiples códigos AcroForm para el mismo campo lógico                    ║
║  └── Acción: Unificar o documentar razón de duplicidad                        ║
║                                                                               ║
║  6.2. Campos faltantes:                                                       ║
║  ├── En PDF pero no en BD → Agregar a lead_forms                              ║
║  ├── En PDF pero no en UI → Agregar al formulario                             ║
║  ├── En BD pero no en PDF → Revisar si es necesario en PDF                    ║
║  └── En UI pero no en PDF → Agregar al PDF o marcar como virtual              ║
║                                                                               ║
║  6.3. Campos con nombres inconsistentes:                                      ║
║  ├── PDF: "Número de identificación"                                          ║
║  ├── BD: "numero_documento"                                                   ║
║  └── UI: "cedula"                                                             ║
║  → Recomendar estandarizar nomenclatura                                       ║
║                                                                               ║
║  6.4. Campos con tipos incompatibles:                                         ║
║  ├── PDF espera número, BD tiene VARCHAR                                      ║
║  ├── PDF espera checkbox, BD tiene STRING en vez de BOOLEAN                   ║
║  └── Recomendar corrección de tipo                                            ║
║                                                                               ║
║  6.5. Transformaciones faltantes o incorrectas:                               ║
║  ├── Fecha sin split en día/mes/año                                           ║
║  ├── Moneda sin formateo                                                      ║
║  ├── Teléfono sin validación                                                  ║
║  └── Sugerir transformación correcta                                          ║
║                                                                               ║
║  ═══════════════════════════════════════════════════════════════════════════  ║
║  FASE 7: GENERAR EXCEL MEJORADO                                              ║
║  ═══════════════════════════════════════════════════════════════════════════  ║
║                                                                               ║
║  Generar nuevo Excel con 12 columnas:                                         ║
║                                                                               ║
║  1.  seccion                    - Header, Sección 1-10, Footer               ║
║  2.  orden                       - Número secuencial dentro de la sección     ║
║  3.  codigo_acroform             - text_14kcdf, etc.                          ║
║  4.  nombre_ocr                  - Nombre extraído por OCR del PDF            ║
║  5.  tipo_pdf                    - texto / checkbox / número                  ║
║  6.  campo_bd                    - informacion_personal.nombres               ║
║  7.  tipo_bd                     - JSONB > STRING, VARCHAR, etc.              ║
║  8.  campo_ui                    - Nombre del campo en el formulario React    ║
║  9.  tipo_ui                     - Input / Select / Checkbox / Number         ║
║  10. match_calidad               - ✓ Exacto / ⚠️ Similar / ✗ Diferente        ║
║  11. transformacion              - date_split / currency / phone_format       ║
║  12. estado                      - ✓ OK / ⚠️ Revisar / ✗ Corregir / ➕ Falta ║
║  13. observaciones               - Detalles del problema o recomendación      ║
║                                                                               ║
║  Archivo generado:                                                            ║
║  /workspaces/Podenza/Context/HU/Modulo Leads/Mapeo_PDF_BD_QA_v2.xlsx         ║
║                                                                               ║
║  ═══════════════════════════════════════════════════════════════════════════  ║
║  FASE 8: GENERAR REPORTE DE CAMBIOS RECOMENDADOS                             ║
║  ═══════════════════════════════════════════════════════════════════════════  ║
║                                                                               ║
║  8.1. CAMBIOS EN BASE DE DATOS                                                ║
║  ├── Generar script SQL para agregar campos faltantes                         ║
║  ├── Generar script SQL para modificar tipos de datos                         ║
║  ├── Generar script SQL para agregar índices si es necesario                  ║
║  └── Ubicación: Context/HU/Modulo Leads/cambios_recomendados_BD.sql          ║
║                                                                               ║
║  8.2. CAMBIOS EN FIELD-MAPPING.TS                                             ║
║  ├── Campos nuevos a agregar                                                  ║
║  ├── Transformaciones a corregir                                              ║
║  ├── Fallbacks a mejorar                                                      ║
║  └── Ubicación: Context/HU/Modulo Leads/cambios_field_mapping.md             ║
║                                                                               ║
║  8.3. CAMBIOS EN UI/FORMULARIO                                                ║
║  ├── Componentes a agregar                                                    ║
║  ├── Validaciones a implementar                                               ║
║  ├── Campos a renombrar para consistencia                                     ║
║  └── Ubicación: Context/HU/Modulo Leads/cambios_formulario_ui.md             ║
║                                                                               ║
║  8.4. CAMBIOS EN PDF TEMPLATE                                                 ║
║  ├── Campos a agregar al PDF                                                  ║
║  ├── Campos a eliminar del PDF                                                ║
║  ├── Campos a renombrar en el PDF                                             ║
║  └── Ubicación: Context/HU/Modulo Leads/cambios_pdf_template.md              ║
║                                                                               ║
║  ═══════════════════════════════════════════════════════════════════════════  ║
║  FASE 9: GENERAR MATRIZ DE TRAZABILIDAD                                      ║
║  ═══════════════════════════════════════════════════════════════════════════  ║
║                                                                               ║
║  Generar Excel adicional con trazabilidad completa:                           ║
║                                                                               ║
║  Columnas:                                                                    ║
║  - Campo Lógico (ej: "Nombres del solicitante")                               ║
║  - PDF Code (text_14kcdf)                                                     ║
║  - PDF Name ("Nombres")                                                       ║
║  - BD Path (informacion_personal.nombres)                                     ║
║  - UI Component (PersonalInfoForm.tsx - namesInput)                           ║
║  - API Endpoint (POST /api/leads/forms)                                       ║
║  - Validación (required, minLength: 2)                                        ║
║  - Ejemplo ("Juan Carlos")                                                    ║
║                                                                               ║
║  Archivo: Mapeo_Trazabilidad_Completa.xlsx                                    ║
║                                                                               ║
║  ═══════════════════════════════════════════════════════════════════════════  ║
║  FASE 10: GENERAR REPORTE EJECUTIVO                                          ║
║  ═══════════════════════════════════════════════════════════════════════════  ║
║                                                                               ║
║  Generar documento Markdown con resumen ejecutivo:                            ║
║                                                                               ║
║  ## Resumen Ejecutivo - QA Mapeo PDF ↔ BD ↔ UI                                ║
║                                                                               ║
║  ### Métricas Generales                                                       ║
║  - Total campos analizados: XXX                                               ║
║  - Campos correctos: XXX (XX%)                                                ║
║  - Campos con problemas menores: XXX (XX%)                                    ║
║  - Campos con problemas mayores: XXX (XX%)                                    ║
║  - Campos faltantes: XXX (XX%)                                                ║
║                                                                               ║
║  ### Top 10 Problemas Críticos                                                ║
║  1. [CRÍTICO] Campo X en PDF no existe en BD                                  ║
║  2. [CRÍTICO] Tipo incompatible en campo Y                                    ║
║  ...                                                                          ║
║                                                                               ║
║  ### Recomendaciones Prioritarias                                             ║
║  1. [ALTA] Agregar 15 campos faltantes a lead_forms                           ║
║  2. [ALTA] Corregir 8 tipos de datos incompatibles                            ║
║  3. [MEDIA] Sincronizar nombres de 23 campos                                  ║
║  ...                                                                          ║
║                                                                               ║
║  ### Impacto Estimado de Cambios                                              ║
║  - Cambios en BD: X migraciones, Y tablas afectadas                           ║
║  - Cambios en UI: X componentes, Y archivos                                   ║
║  - Cambios en field-mapping.ts: X campos nuevos, Y corregidos                 ║
║  - Tiempo estimado de implementación: X horas/días                            ║
║                                                                               ║
║  Archivo: PDF_Mapping_QA_Report.md                                            ║
║                                                                               ║
║  ═══════════════════════════════════════════════════════════════════════════  ║
║  FASE 11: VALIDACIÓN FINAL                                                   ║
║  ═══════════════════════════════════════════════════════════════════════════  ║
║                                                                               ║
║  11.1. Verificar todos los archivos generados:                                ║
║  ├── ✓ Mapeo_PDF_BD_QA_v2.xlsx                                                ║
║  ├── ✓ Mapeo_Trazabilidad_Completa.xlsx                                       ║
║  ├── ✓ PDF_Mapping_QA_Report.md                                               ║
║  ├── ✓ cambios_recomendados_BD.sql                                            ║
║  ├── ✓ cambios_field_mapping.md                                               ║
║  ├── ✓ cambios_formulario_ui.md                                               ║
║  └── ✓ cambios_pdf_template.md                                                ║
║                                                                               ║
║  11.2. Generar checklist de implementación:                                   ║
║  ```markdown                                                                  ║
║  ## Checklist de Implementación                                               ║
║                                                                               ║
║  ### Fase 1: Base de Datos (X horas)                                          ║
║  - [ ] Crear migración para campos nuevos                                     ║
║  - [ ] Aplicar migración en DEV                                               ║
║  - [ ] Validar estructura JSONB                                                ║
║  - [ ] Actualizar tipos TypeScript                                            ║
║                                                                               ║
║  ### Fase 2: Field Mapping (X horas)                                          ║
║  - [ ] Agregar mapeos faltantes                                               ║
║  - [ ] Corregir transformaciones                                              ║
║  - [ ] Actualizar fallbacks                                                   ║
║  - [ ] Probar generación de PDF                                               ║
║                                                                               ║
║  ### Fase 3: UI/Formulario (X horas)                                          ║
║  - [ ] Agregar campos faltantes                                               ║
║  - [ ] Actualizar validaciones                                                ║
║  - [ ] Sincronizar nombres de campos                                          ║
║  - [ ] Probar flujo completo                                                  ║
║  ```                                                                          ║
║                                                                               ║
║  ═══════════════════════════════════════════════════════════════════════════  ║
║  FASE 12: COMMIT Y DOCUMENTACIÓN                                             ║
║  ═══════════════════════════════════════════════════════════════════════════  ║
║                                                                               ║
║  12.1. Hacer commit de todos los archivos generados:                          ║
║  ```bash                                                                      ║
║  git add Context/HU/Modulo\ Leads/Mapeo_PDF_BD_QA_v2.xlsx                     ║
║  git add Context/HU/Modulo\ Leads/Mapeo_Trazabilidad_Completa.xlsx            ║
║  git add Context/HU/Modulo\ Leads/PDF_Mapping_QA_Report.md                    ║
║  git add Context/HU/Modulo\ Leads/cambios_*.{sql,md}                          ║
║                                                                               ║
║  git commit -m "feat(qa): Análisis completo QA de mapeo PDF-BD-UI             ║
║                                                                               ║
║  - Análisis OCR detallado sección por sección                                 ║
║  - Validación de 264+ campos con tipos y transformaciones                     ║
║  - Identificación de discrepancias y campos faltantes                         ║
║  - Recomendaciones de cambios en BD, field-mapping y UI                       ║
║  - Matriz de trazabilidad completa                                            ║
║  - Reporte ejecutivo con métricas y prioridades"                              ║
║                                                                               ║
║  git push origin DEV                                                          ║
║  ```                                                                          ║
║                                                                               ║
║  12.2. Mostrar resumen al usuario:                                            ║
║  ┌─────────────────────────────────────────────────────────────────────┐      ║
║  │ ✅ PDF MAPPING QA COMPLETADO                                        │      ║
║  │                                                                     │      ║
║  │ 📊 Archivos generados: 7                                            │      ║
║  │ 📋 Campos analizados: XXX                                           │      ║
║  │ ✓  Campos OK: XXX (XX%)                                             │      ║
║  │ ⚠️  Campos a revisar: XXX (XX%)                                     │      ║
║  │ ✗  Campos críticos: XXX (XX%)                                       │      ║
║  │                                                                     │      ║
║  │ 📁 Ver reporte completo en:                                         │      ║
║  │    Context/HU/Modulo Leads/PDF_Mapping_QA_Report.md                 │      ║
║  └─────────────────────────────────────────────────────────────────────┘      ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

---

## CONFIGURACIÓN DE OCR

### Estrategia de OCR por Sección

```typescript
interface OCRConfig {
  seccion: string;
  paginaPDF: 1 | 2;
  regionX: number;      // Coordenada X inicio
  regionY: number;      // Coordenada Y inicio
  regionWidth: number;  // Ancho de la región
  regionHeight: number; // Alto de la región
  camposEsperados: number; // Número de campos en esta sección
}

const OCR_REGIONS: OCRConfig[] = [
  {
    seccion: 'Header',
    paginaPDF: 1,
    regionX: 0,
    regionY: 0,
    regionWidth: 800,
    regionHeight: 300,
    camposEsperados: 9
  },
  {
    seccion: 'Productos Financieros',
    paginaPDF: 1,
    regionX: 0,
    regionY: 300,
    regionWidth: 800,
    regionHeight: 150,
    camposEsperados: 4
  },
  {
    seccion: '1. Información Personal',
    paginaPDF: 1,
    regionX: 0,
    regionY: 450,
    regionWidth: 800,
    regionHeight: 600,
    camposEsperados: 38
  },
  // ... continuar para cada sección
];
```

### Patrones de Nombres a Reconocer

```typescript
const NOMBRE_PATTERNS = {
  'fecha': /fecha|date/i,
  'nombre': /nombres?/i,
  'apellido': /apellidos?|primer apellido|segundo apellido/i,
  'documento': /documento|identificaci[oó]n|c[eé]dula|c\.c\.|c\.e\.|pasaporte/i,
  'telefono': /tel[eé]fono|celular|móvil/i,
  'email': /email|correo/i,
  'direccion': /direcci[oó]n/i,
  'ciudad': /ciudad/i,
  'departamento': /departamento/i,
  'moneda': /valor|precio|monto|ingreso|egreso|activo|pasivo|cuota|saldo/i,
  'checkbox': /s[ií]|no|acepta|autoriza/i
};
```

---

## ANÁLISIS DE TRANSFORMACIONES

### Tipos de Transformación Soportados

```typescript
type TransformationType =
  | 'none'           // Sin transformación
  | 'date_split'     // Dividir fecha en día/mes/año (3 campos PDF)
  | 'currency'       // Formatear moneda con separadores de miles
  | 'checkbox_x'     // Convertir boolean a "X" o vacío
  | 'uppercase'      // Convertir a mayúsculas
  | 'phone_format'   // Formatear teléfono (3XX) XXX-XXXX
  | 'percent'        // Formatear porcentaje con símbolo %
  | 'calculated'     // Campo calculado (no viene de UI)
  | 'conditional';   // Depende de otro campo

// Ejemplos de validación de transformaciones
const TRANSFORMATION_RULES = {
  date_split: {
    inputType: 'DATE | STRING',
    outputFields: 3,
    validation: (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date),
    example: '2024-01-15 → Día: 15, Mes: 01, Año: 2024'
  },
  currency: {
    inputType: 'NUMBER',
    outputType: 'STRING',
    validation: (value: number) => !isNaN(value) && value >= 0,
    example: '1500000 → $1,500,000'
  },
  phone_format: {
    inputType: 'STRING',
    outputType: 'STRING',
    validation: (phone: string) => /^\d{10}$/.test(phone.replace(/\D/g, '')),
    example: '3001234567 → (300) 123-4567'
  }
};
```

---

## CRITERIOS DE CALIDAD

### Clasificación de MATCH

```
✓ EXACTO (100%):
  - Nombre OCR idéntico al campo BD (ignorando acentos y mayúsculas)
  - Ejemplo: "Nombres" ↔ informacion_personal.nombres

⚠️ SIMILAR (70-99%):
  - Mismo significado pero diferente redacción
  - Ejemplo: "Número de identificación" ↔ numero_documento

⚠️ PARCIAL (40-69%):
  - Relacionado pero no exacto
  - Ejemplo: "Teléfono" ↔ telefono_fijo (puede ser celular también)

✗ DIFERENTE (0-39%):
  - No hay relación semántica clara
  - Requiere revisión manual

❓ REVISAR:
  - Ambigüedad o falta de información
  - Campo calculado o derivado
```

### Clasificación de ESTADO

```
✓ OK:
  - Mapeo correcto
  - Tipo compatible
  - Transformación apropiada
  - Presente en PDF, BD y UI

⚠️ REVISAR:
  - Mapeo parcialmente correcto
  - Tipo compatible pero podría mejorarse
  - Falta en UI o tiene validación débil

✗ CORREGIR:
  - Mapeo incorrecto
  - Tipo incompatible
  - Transformación faltante o incorrecta
  - Problema que impide generar PDF correctamente

➕ FALTA:
  - Campo en PDF pero no en BD
  - Campo en PDF pero no en UI
  - Requiere implementación completa
```

---

## HERRAMIENTAS UTILIZADAS

### Tools Principales

1. **Read** - Leer PDF con capacidad de análisis visual (OCR)
2. **mcp__supabase__execute_sql** - Consultar schema de lead_forms
3. **Task con @devteam** - Analizar componentes UI del formulario
4. **Glob/Grep** - Buscar archivos relacionados con formulario
5. **XLSX (write)** - Generar archivos Excel
6. **Write** - Generar reportes Markdown y SQL

### Orden de Ejecución de Tools

```
FASE 1 (OCR):
  └── Read (PDF) x 13 (una vez por sección)

FASE 2 (Validación):
  └── Read (field-mapping.ts)

FASE 3 (BD):
  ├── mcp__supabase__execute_sql (schema)
  └── mcp__supabase__execute_sql (sample data)

FASE 4 (UI):
  ├── Task (@devteam - buscar componentes)
  ├── Glob (buscar archivos form)
  └── Read (componentes encontrados)

FASE 5-6 (Análisis):
  └── Procesamiento en memoria

FASE 7-9 (Output):
  ├── Write (Excel principal)
  ├── Write (Excel trazabilidad)
  └── Write (Reportes MD y SQL)

FASE 12 (Git):
  └── Bash (git add, commit, push)
```

---

## FORMATO DE ARCHIVOS GENERADOS

### 1. Mapeo_PDF_BD_QA_v2.xlsx

```
| seccion | orden | codigo_acroform | nombre_ocr | tipo_pdf | campo_bd | tipo_bd | campo_ui | tipo_ui | match_calidad | transformacion | estado | observaciones |
|---------|-------|-----------------|------------|----------|----------|---------|----------|---------|---------------|----------------|--------|---------------|
| Header  | 1     | text_1roxp      | Fecha-Día  | texto    | fecha... | DATE    | fechaInput| Date   | ✓ Exacto      | date_split     | ✓ OK   |               |
```

### 2. cambios_recomendados_BD.sql

```sql
-- ================================================================
-- CAMBIOS RECOMENDADOS EN BASE DE DATOS - lead_forms
-- Generado por PDF Mapping QA Agent v1.0
-- Fecha: YYYY-MM-DD
-- ================================================================

-- 1. AGREGAR CAMPOS FALTANTES
-- ----------------------------------------------------------------

-- Campo: actividad_economica.empleado_tipo_contrato
-- Razón: Existe en PDF (text_94adtj) pero no está mapeado en BD
ALTER TABLE lead_forms
  -- Ya es JSONB, solo documentar la estructura esperada
  -- actividad_economica.empleado_tipo_contrato: STRING
  COMMENT ON COLUMN lead_forms.actividad_economica IS
  'JSONB con estructura: {..., empleado_tipo_contrato: "Término Indefinido|Término Fijo|Obra o Labor"}';

-- ... más cambios
```

### 3. cambios_field_mapping.md

```markdown
# Cambios Recomendados en field-mapping.ts

## Campos a Agregar

### text_94adtj - Empleado Tipo Contrato - Término Indefinido
```typescript
'text_94adtj': {
  pdfField: 'text_94adtj',
  leadFormsPath: 'actividad_economica.empleado_tipo_contrato',
  transformation: 'checkbox_x',
  description: 'Tipo de contrato - Término Indefinido'
}
```

## Transformaciones a Corregir

### text_109wx - Concepto Otros Ingresos
**Problema**: No tiene transformación definida, pero debería tener phone_format
**Solución**:
```typescript
'text_109wx': {
  pdfField: 'text_109wx',
  leadFormsPath: 'actividad_economica.independiente_telefono',
  transformation: 'phone_format', // ← AGREGAR
  description: 'Teléfono independiente'
}
```
```

### 4. PDF_Mapping_QA_Report.md

```markdown
# Reporte de QA - Mapeo PDF ↔ BD ↔ UI

**Fecha**: 2024-11-28
**Versión**: 1.0
**Analista**: PDF Mapping QA Agent

---

## Resumen Ejecutivo

### Métricas Generales

| Métrica | Cantidad | Porcentaje |
|---------|----------|------------|
| Total campos analizados | 264 | 100% |
| ✓ Campos OK | 189 | 71.6% |
| ⚠️ Campos a revisar | 52 | 19.7% |
| ✗ Campos críticos | 15 | 5.7% |
| ➕ Campos faltantes | 8 | 3.0% |

### Distribución por Sección

| Sección | Campos | OK | Revisar | Crítico | Faltante |
|---------|--------|----|---------|---------| ---------|
| Header | 9 | 9 | 0 | 0 | 0 |
| Productos | 4 | 4 | 0 | 0 | 0 |
| Info Personal | 38 | 32 | 4 | 1 | 1 |
| ... | ... | ... | ... | ... | ... |

---

## Top 10 Problemas Críticos

### 1. [CRÍTICO] Campo text_109wx mal mapeado
- **Sección**: Actividad Económica
- **Campo PDF**: "Concepto otros ingresos"
- **Mapeo actual**: actividad_economica.independiente_telefono
- **Problema**: El campo se llama "concepto" no "teléfono"
- **Impacto**: Datos incorrectos en PDF generado
- **Solución**: Cambiar a actividad_economica.independiente_concepto

### 2. [CRÍTICO] Tipo incompatible en text_104yvbh
...

---

## Recomendaciones Prioritarias

### PRIORIDAD ALTA (Implementar en Sprint actual)

1. **Corregir 8 mapeos críticos**
   - Tiempo estimado: 2 horas
   - Archivos afectados: field-mapping.ts
   - Riesgo si no se corrige: PDFs con datos incorrectos

2. **Agregar 15 campos faltantes a lead_forms**
   - Tiempo estimado: 4 horas
   - Archivos afectados: Nueva migración, types.ts, field-mapping.ts
   - Riesgo si no se corrige: Pérdida de información del formulario

...
```

---

## EJEMPLOS DE USO DEL AGENTE

### Caso 1: Análisis Completo (Primera Vez)

```
Usuario: /pdf-mapping-qa

Agente:
✅ FASE 0: Verificando recursos...
   ✓ PDF Template encontrado
   ✓ PDF con códigos encontrado
   ✓ Excel base encontrado
   ✓ field-mapping.ts encontrado

📊 FASE 1: Ejecutando OCR sección por sección...
   [1/13] Header - 9 campos identificados
   [2/13] Productos Financieros - 4 campos identificados
   [3/13] Información Personal - 38 campos identificados
   ...
   [13/13] Footer - 5 campos identificados

   Total campos OCR: 264 ✓

🔍 FASE 2: Validando códigos AcroForm...
   Verificados: 264/264
   Huérfanos: 0

🗄️ FASE 3: Analizando schema BD...
   Consultando lead_forms...
   30 columnas, 7 JSONB analizados

🎨 FASE 4: Analizando UI con @devteam...
   Componentes encontrados: 12
   Campos UI mapeados: 198

⚙️ FASE 5-6: Ejecutando análisis y validaciones...
   Procesando 264 campos...
   Discrepancias encontradas: 23

📊 FASE 7-9: Generando reportes...
   ✓ Mapeo_PDF_BD_QA_v2.xlsx
   ✓ Mapeo_Trazabilidad_Completa.xlsx
   ✓ PDF_Mapping_QA_Report.md
   ✓ 4 archivos de cambios recomendados

📝 FASE 10-11: Validación y checklist...
   ✓ Todos los archivos generados
   ✓ Checklist de implementación creado

💾 FASE 12: Commit y documentación...
   ✓ Git commit exitoso
   ✓ Push a DEV completado

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ PDF MAPPING QA COMPLETADO

📊 Archivos generados: 7
📋 Campos analizados: 264
✓  Campos OK: 189 (71.6%)
⚠️  Campos a revisar: 52 (19.7%)
✗  Campos críticos: 15 (5.7%)

📁 Ver reporte completo en:
   Context/HU/Modulo Leads/PDF_Mapping_QA_Report.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## NOTAS IMPORTANTES

1. **OCR de Alta Calidad**: El agente usa la capacidad de análisis visual del tool Read para hacer OCR de cada sección del PDF, no solo lectura de texto.

2. **Análisis Incremental**: Si se ejecuta el agente múltiples veces, puede comparar con resultados anteriores y mostrar mejoras.

3. **No Modifica Código**: El agente solo genera recomendaciones y archivos de análisis. NO modifica field-mapping.ts, BD o UI automáticamente.

4. **Requiere Validación Humana**: Los cambios críticos deben ser revisados por un desarrollador antes de implementarse.

5. **Versionado**: Cada ejecución genera archivos con timestamp para mantener historial de análisis.

---

## PREGUNTAS FRECUENTES

**P: ¿El agente puede ejecutarse en producción?**
R: No. Este agente solo analiza y genera recomendaciones. No modifica datos ni código.

**P: ¿Qué tan preciso es el OCR?**
R: Muy preciso para texto estructurado en PDFs. La precisión mejora si el PDF tiene buena calidad.

**P: ¿Puede detectar campos duplicados?**
R: Sí, identifica códigos AcroForm duplicados y campos con el mismo nombre en diferentes secciones.

**P: ¿Genera las migraciones automáticamente?**
R: Genera el SQL recomendado pero NO crea el archivo de migración ni lo aplica. Eso debe hacerse manualmente.

**P: ¿Cuánto tiempo toma ejecutar el agente?**
R: Aproximadamente 3-5 minutos dependiendo de la complejidad del PDF y la cantidad de campos.

---

**FIN DEL AGENTE PDF MAPPING QA v1.0**
