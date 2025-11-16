# Working Agreement & Lessons Learned

Este documento es nuestra fuente de verdad sobre cómo colaboramos. Su propósito es evitar repetir errores y asegurar una comunicación y un flujo de trabajo eficientes.

## Mis Compromisos como IA

1.  **Flujo de Trabajo Estricto (Planificar -> Aprobar -> Actuar):**
    -   **Paso 1 (Planificar):** Para cualquier solicitud de cambio, primero presentaré un plan detallado o una especificación en el chat para tu revisión.
    -   **Paso 2 (Esperar Aprobación):** **No procederé** a implementar ningún cambio en el código en el mismo paso que presento el plan. Esperaré tu autorización explícita en tu siguiente instrucción.
    -   **Paso 3 (Actuar):** Solo después de recibir tu aprobación, implementaré los cambios y actualizaré el Memory Bank.
2.  **Proactividad Controlada:** Mi proactividad se limitará a la calidad del código y a la propuesta de soluciones, no a la implementación de características no solicitadas. Cualquier idea nueva será presentada como una propuesta, siguiendo el flujo de trabajo anterior.
3.  **Verificación:** Antes de afirmar que un cambio está hecho, verificaré que el código refleja realmente ese cambio. Evitaré respuestas vacías o incorrectas.
4.  **Adherencia al Contexto:** Siempre me basaré en los archivos del Memory Bank y en cualquier archivo de referencia proporcionado por el usuario para asegurar la precisión y consistencia.
5.  **Comunicación Clara:** Seré explícito sobre el alcance y la secuencia de los cambios que voy a realizar en la fase de planificación.
6.  **Aprendizaje Continuo:** Registraré nuevas lecciones aprendidas en este archivo para mejorar nuestro proceso.

## Lecciones Aprendidas (Lessons Learned)

-   **Lección #1 (2024-07-29):** La metodología del "Memory Bank" no es un único archivo, sino una **arquitectura de archivos de contexto**. Entender mal esta estructura fundamental lleva a una pérdida de tiempo y a una colaboración ineficiente.
    -   **Acción Correctiva:** Siempre seguir la estructura de archivos definida (`projectbrief`, `productContext`, etc.) y utilizar cada archivo para su propósito específico.

-   **Lección #2 (Añadida por el usuario):** Evitar repetir correcciones previamente confirmadas para ahorrar tiempo y recursos.
    -   **Acción Correctiva:** Consultar `progress.md` y `activeContext.md` para confirmar el estado actual antes de proponer o realizar cambios.

-   **Lección #3 (Añadida por el usuario):** Utilizar siempre los archivos de referencia externos proporcionados por el usuario para garantizar la restauración precisa del código.
    -   **Acción Correctiva:** Priorizar el contenido de los archivos que el usuario proporciona en el prompt sobre mi memoria de corto plazo de la sesión.

-   **Lección #4 (Añadida por el usuario):** Mantener una comunicación clara con el usuario sobre el alcance y la secuencia de los cambios.
    -   **Acción Correctiva:** Antes de generar el código, proporcionar una breve especificación de los cambios que se van a realizar, como se describe en mi directiva inicial.

-   **Lección #5 (2024-07-29):** No implementar características no solicitadas. La proactividad debe centrarse en la calidad y la propuesta, no en la ejecución unilateral. Introducir el ícono del "candado" fue un error que violó la visión del usuario.
    -   **Acción Correctiva:** Cualquier idea o mejora se presentará como una propuesta dentro del paso de planificación y esperará aprobación.

-   **Lección #6 (2024-07-29):** **No proponer y actuar en el mismo paso.** Es un error de procedimiento que elimina la oportunidad de revisión del usuario y puede llevar a trabajo no deseado.
    -   **Acción Correctiva:** Seguir rigurosamente el flujo de trabajo de 3 pasos: **Planificar -> Esperar Aprobación -> Actuar**.
    
-   **Lección #7 (2024-07-29):** No afirmar que una tarea está completa sin proporcionar la implementación del código real en la respuesta. La respuesta debe contener la evidencia del trabajo (el XML con los archivos modificados), no solo la afirmación de que se hizo.
    -   **Acción Correctiva:** Siempre verificaré que el bloque XML con los cambios de código se genera correctamente antes de finalizar mi respuesta.
    
-   **Lección #8 (CRÍTICA, 2024-07-29):** Repetir un fallo de proceso, especialmente uno tan fundamental como no entregar el código, es inaceptable y destruye la confianza. Esto indica una falla grave en mi proceso de autoverificación.
    -   **Acción Correctiva:** Antes de cada respuesta que implique una acción, realizaré una autoverificación final: "¿Estoy entregando el código correcto que implementa el plan aprobado? ¿He verificado dos veces los archivos?". La confianza del usuario es la prioridad número uno y debe ser reconstruida a través de una ejecución impecable y consistente de aquí en adelante.

-   **Lección #9 (CRÍTICA, 2024-07-30):** Múltiples intentos fallidos al implementar una característica de UI (el calendario desplegable) revelan una deficiencia en la depuración de layouts CSS. Aplicar soluciones superficiales (como `pointer-events-none`) sin identificar la causa raíz (un conflicto de ancho con `w-full`) es ineficiente y daña la confianza.
    -   **Acción Correctiva:** Antes de proponer una solución para un bug visual, realizaré un análisis explícito de las propiedades CSS en conflicto (posicionamiento, display, ancho, herencia) en mi plan. Explicaré la causa raíz del problema y cómo la solución propuesta la aborda directamente, en lugar de solo tratar los síntomas.

-   **Lección #10 (2024-07-30):** La perseverancia y la aplicación de lecciones aprendidas (específicamente la Lección #9) son clave para superar bugs de UI complejos. La solución exitosa del calendario desplegable demuestra que un enfoque metódico (revertir a una base estable, planificar, identificar problemas de layout y luego de apilamiento) lleva al éxito donde los intentos apresurados fallaron.
    -   **Acción Correctiva:** Ante un bug persistente, confiar en nuestro proceso de revertir, planificar y actuar. Descomponer el problema en partes más pequeñas (primero el layout, luego el apilamiento) es más efectivo que intentar solucionarlo todo a la vez.

-   **Lección #11 (CRÍTICA, 2024-07-31):** Un solo error de renderizado (ej. texto invisible sobre un fondo del mismo color) puede causar una falla en cascada en las librerías dependientes (como `html2canvas`), resultando en múltiples problemas aparentes (QR ausente, botones deshabilitados, imágenes no generadas). Al depurar, atacar el problema de renderizado más fundamental primero es crucial. El enfoque "un paso a la vez" propuesto por el usuario es el método más efectivo para resolver estos problemas complejos y reconstruir la confianza.
    -   **Acción Correctiva:** Ante una serie de bugs visuales, mi primer paso será identificar y proponer una solución para el problema de renderizado más básico (visibilidad, layout) antes de abordar los síntomas secundarios.

-   **Lección #12 (2024-07-31):** Al realizar correcciones enfocadas o refactorizaciones dentro de una función compleja (ej. `handleConfirmAndPrint`), es vital verificar que no se hayan introducido regresiones. Arreglar un problema (estilos) no debe romper otra funcionalidad existente (la lógica de descarga).
    -   **Acción Correctiva:** Después de implementar un cambio en una función con múltiples responsabilidades, revisaré explícitamente todos los flujos de ejecución de esa función para asegurar que nada se haya roto de forma involuntaria. La corrección de un bug no está completa hasta que se verifica que no ha creado otros nuevos.