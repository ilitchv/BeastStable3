# Beast Reader Lotto - Cline Memory Bank

## 1. Visión General del Proyecto

**Beast Reader Lotto** es una aplicación web avanzada para la gestión de apuestas de lotería. Permite a los usuarios crear, gestionar y validar jugadas de lotería de forma manual o a través de herramientas inteligentes. El objetivo es ofrecer una interfaz rápida, potente y estéticamente agradable que supere las herramientas manuales tradicionales.

## 2. Características Principales (Features) Implementadas

- **Gestión de Jugadas:**
  - Añadir/eliminar jugadas manualmente (límite de 200).
  - Tabla de jugadas con campos para: Número de Apuesta, Monto "Straight", "Box" y "Combo".
  - Selección múltiple de jugadas para acciones en lote (borrar, pegar apuestas).
  - Detección automática del **Modo de Juego** (`Pick 3`, `Win 4`, `Pale-RD`, etc.) basado en el número y los sorteos seleccionados.
  - Resaltado visual para jugadas inválidas (sin monto, número incorrecto).

- **Selección de Sorteos (Tracks):**
  - Panel de selección de sorteos agrupados por región (USA, Santo Domingo).
  - Botones de sorteos con colores distintivos.
  - **Contador regresivo** en tiempo real para los sorteos del día actual que están por cerrar.
  - Deshabilitación automática de sorteos cuya hora de cierre ya pasó para el día actual.

- **Selección de Fechas:**
  - Permite seleccionar múltiples fechas futuras para las apuestas.
  - Valida que no se puedan seleccionar fechas pasadas.

- **Herramientas de Entrada Rápida:**
  - **Asistente "Quick Wizard":**
    - Genera jugadas en masa.
    - Opciones para "Quick Pick" (números aleatorios) y "Round Down" (series de números, ej. 120-129).
    - Permite pre-establecer los montos para las jugadas generadas.
  - **Escaneo de Tickets con IA (OCR):**
    - Modal para subir/arrastrar una imagen de un ticket.
    - Utiliza la **API de Gemini** para analizar la imagen y extraer las jugadas y sus montos.
    - Muestra los resultados para revisión antes de añadirlos a la tabla principal.
  - **Asistente de Apuestas con IA (Chatbot):**
    - Interfaz conversacional para añadir jugadas.
    - **Entrada Multimodal:** Permite a los usuarios dictar jugadas por voz, escribirlas manualmente o subir una imagen de un ticket, todo dentro del chat.
    - Utiliza Gemini para interpretar tanto el lenguaje natural como las imágenes.
    - Muestra una vista previa de las jugadas detectadas directamente en el chat para su confirmación antes de cargarlas en la tabla principal.

- **Cálculos y Totales:**
  - `Base Total`: Suma de todas las jugadas.
  - `Grand Total`: `Base Total` x (Nº de Sorteos) x (Nº de Días).
  - Los cálculos se actualizan en tiempo real.

- **Generación de Ticket:**
  - Botón "Generate Ticket" que ejecuta una validación exhaustiva.
  - Si hay errores, muestra un modal con la lista de problemas a corregir.
  - Modal de vista previa con opción de "Editar" o "Confirmar".
  - Al confirmar, el ticket final se renderiza con: número de ticket único, código QR, **marca de agua sutil detrás de las jugadas**, y todos los detalles de la apuesta.
  - **Estrategia de Doble Imagen:**
    -   **Descarga Automática (PNG):** Genera y descarga automáticamente un PNG de alta resolución para el archivo del usuario.
    -   **Compartir (JPEG):** Crea simultáneamente un JPEG ligero y optimizado, listo para ser compartido a través del botón "Share Ticket" y la API `navigator.share`.

- **Persistencia de Estado:**
  - El estado de la aplicación (jugadas, selecciones de sorteos y fechas) se guarda en `localStorage`.
  - Los datos se recuperan al recargar la página para no perder el trabajo.

## 3. Stack Tecnológico y Decisiones Clave

- **Frontend:** React con TypeScript.
- **Estilos:** Tailwind CSS con una configuración personalizada para temas (claro/oscuro) y estilos "neón".
- **IA / OCR:** `@google/genai` (Gemini API) para la interpretación de imágenes y lenguaje natural. El modelo `gemini-2.5-flash` se utiliza con un `responseSchema` para asegurar una salida JSON estructurada.
- **Reconocimiento de Voz:** Web Speech API del navegador para la entrada por voz en el chatbot.
- **Generación de Imágenes:** `html2canvas` para convertir el componente del ticket en una imagen.
- **Códigos QR:** `qrcode.js` para generar el QR del ticket.
- **Estado:** Se maneja con `useState` y `useEffect` de React. El estado se persiste en `localStorage`.

## 4. Guía de Estilo y UI/UX

- **Tema Dual:** Soporta modo claro y oscuro, con el oscuro como predeterminado.
- **Estética "Neón":** Uso prominente de colores como `neon-cyan`, `neon-pink`, y `neon-green` para elementos interactivos y destacados, especialmente en el modo oscuro.
- **Componentización:** La UI está dividida en componentes reutilizables (Header, ActionsPanel, PlaysTable, varios Modales, etc.).
- **Responsivo:** El diseño se adapta a diferentes tamaños de pantalla usando las utilidades de Tailwind CSS.
- **Feedback al Usuario:** Se utilizan modales para confirmaciones, errores (ValidationErrorModal), y flujos de trabajo complejos (OCR, Wizard, Ticket, Chatbot). El estado de carga (ej. durante el análisis de IA) se indica con animaciones.

## 5. Estructura de Archivos

```
/
├── index.html
├── index.tsx
├── App.tsx
├── types.ts
├── constants.ts
├── metadata.json
├── MEMORY_BANK.md  <-- THIS FILE
├── components/
│   ├── ActionsPanel.tsx
│   ├── ChatbotModal.tsx
│   ├── ChatMessage.tsx
│   ├── DatePicker.tsx
│   ├── Header.tsx
│   ├── OcrModal.tsx
│   ├── PlaysTable.tsx
│   ├── TicketModal.tsx
│   ├── TotalDisplay.tsx
│   ├── TrackButton.tsx
│   ├── TrackSelector.tsx
│   ├── ValidationErrorModal.tsx
│   └── WizardModal.tsx
├── services/
│   └── geminiService.ts
└── utils/
    └── helpers.ts
```