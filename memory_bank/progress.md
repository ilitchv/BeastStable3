# Progress Tracker: Beast Reader Lotto

## Estado Actual de las Características

### Completado (v1.6)

-   [x] **Núcleo de la App:** Estructura base con React y TypeScript.
-   [x] **Gestión de Jugadas:** Añadir, editar, eliminar jugadas.
-   [x] **Tabla de Jugadas:** Funcionalidad completa, incluyendo selección múltiple.
-   [x] **Cálculos de Totales:** Cálculo en tiempo real de `Base Total` y `Grand Total`.
-   [x] **Selección de Sorteos:** Panel funcional con categorías y contadores regresivos.
-   [x] **Wizard de Entrada Rápida:** Funcionalidad completa para "Quick Pick" y "Round Down".
-   [x] **Escáner de Tickets (OCR):** Integración con la API de Gemini funcional para extraer jugadas de una imagen.
-   [x] **Asistente de Apuestas con IA (Chatbot):**
    -   [x] Entrada multimodal de jugadas (voz, texto e imagen).
    -   [x] Procesamiento de lenguaje natural con Gemini para interpretar comandos.
    -   [x] Vista previa de jugadas dentro de la interfaz de chat.
-   [x] **Persistencia de Estado Híbrida:**
    -   [x] **Local:** Guardado y carga del borrador del ticket desde `localStorage`.
    -   [x] **Base de Datos:** Archivado permanente de tickets finalizados en MongoDB a través de un backend de Node.js.
-   [x] **Diseño Responsivo y Tema Dual:** La UI es usable en diferentes dispositivos y soporta modo claro/oscuro.
-   [x] **Generación de Ticket Avanzada:**
    -   [x] Estrategia de doble imagen: PNG de alta resolución para descarga y JPEG ligero para compartir.
    -   [x] Marca de agua segura y sutil implementada correctamente detrás de la tabla de jugadas.
    -   [x] Todos los elementos visuales (QR, líneas punteadas, estilos de fuente) renderizados correctamente.

### En Progreso / Buggy

-   *(Ninguna característica actualmente en este estado)*

### Próximos Pasos (Roadmap)

-   [ ] **Módulo 2: Historial de Apuestas y Reportes** (Ver `project_vision/roadmap.md`).
-   [ ] **Módulo 3: Analíticas y Estadísticas** (Ver `project_vision/roadmap.md`).

## Problemas Conocidos y Limitaciones

-   **Dependencia del CDN:** La aplicación depende de CDNs para sus librerías principales. No funcionará offline si los scripts no están en caché.
-   **Confirmación de Reset:** La confirmación de "Reset All" está deshabilitada por el entorno de sandbox.
-   **Precisión de IA:** La precisión del escáner y del chatbot depende de la calidad de la entrada del usuario.