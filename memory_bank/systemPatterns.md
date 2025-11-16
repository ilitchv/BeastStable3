# System Patterns: Beast Reader Lotto

## Arquitectura General

La aplicación ahora sigue una arquitectura de dos componentes: un **frontend** (la aplicación React que se ejecuta en el navegador) y un **backend** (un servidor Node.js que gestiona la persistencia en la base de datos).

### Arquitectura Frontend

El frontend sigue una arquitectura basada en componentes utilizando React.

- **Componente Raíz (`App.tsx`):** Actúa como el orquestador principal. Mantiene el estado del "borrador" del ticket actual y lo pasa hacia abajo a los componentes hijos.
- **Componentes de Presentación:** La mayoría de los componentes en `/components` son para presentación, recibiendo datos y funciones a través de props.
- **Componentes Contenedores (Modales):** Los modales encapsulan flujos de trabajo completos. El `TicketModal` ahora contiene la lógica para comunicarse con el backend.

### Arquitectura Backend

- **Servidor API:** Se ha implementado un servidor simple usando Node.js y Express. Su propósito principal es actuar como una capa de servicio segura entre el frontend y la base de datos.
- **Base de Datos:** MongoDB se utiliza como la base de datos para el almacenamiento a largo plazo de los tickets.
- **ORM/ODM:** Mongoose se utiliza para modelar los datos de la aplicación y gestionar la comunicación con MongoDB de una manera estructurada.

## Gestión del Estado y Persistencia (Modelo Híbrido)

Este es un patrón central del sistema. El estado se gestiona en dos niveles distintos para optimizar la experiencia del usuario y la integridad de los datos.

1.  **Persistencia Local (`localStorage`):**
    -   **Propósito:** Guardar el **borrador del ticket actual**.
    -   **Disparador:** Se activa en cada cambio del estado (`plays`, `selectedTracks`, etc.).
    -   **Ventajas:** Es extremadamente rápido, funciona offline y protege el trabajo en progreso del usuario contra cierres accidentales del navegador o pérdida de conexión.
    -   **Implementación:** Gestionado por un `useEffect` en `App.tsx`.

2.  **Persistencia en Base de Datos (MongoDB):**
    -   **Propósito:** Archivar una **copia permanente de los tickets finalizados y confirmados**.
    -   **Disparador:** Se activa únicamente cuando el usuario presiona el botón "Confirm & Print" en el `TicketModal`.
    -   **Ventajas:** Proporciona un registro histórico seguro, permanente y centralizado. Sienta las bases para futuras funcionalidades como el historial de tickets.
    -   **Implementación:** El componente `TicketModal` realiza una llamada `fetch` al endpoint `POST /api/tickets` del backend.

## Lógica de Negocio y Servicios

- **Lógica Frontend (`/utils/helpers.ts`):** La lógica de negocio que es puramente para la UI (cálculos de totales de filas, determinación del modo de juego en tiempo real) reside en el frontend para una respuesta instantánea.
- **Lógica Backend (`server.js`):** La lógica relacionada con la base de datos (validación de datos entrantes, guardado en la colección) reside en el backend.
- **Servicios Externos (`/services/geminiService.ts`):** La interacción con la API de Gemini permanece en el frontend. Esto es aceptable ya que la clave de API es gestionada por el entorno de ejecución, pero en una arquitectura de producción a gran escala, esto podría moverse al backend para mayor seguridad y control.