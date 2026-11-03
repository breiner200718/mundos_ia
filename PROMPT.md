# Bitácora de Desarrollo con Inteligencia Artificial - PROMPT.md

## A. Declaración
**Usé IA: sí**

---

## B. Herramienta y Modelo Utilizado
- **Herramienta:** Antigravity (Google DeepMind)
- **Modelo:** Gemini 2.5 Flash / Pro

---

## C. Prompt Inicial Completo (Copiado Literal)

```text
Actúa como un instructor de Node.js para principiantes del SENA. Quiero construir un programa de consola llamado "mundos-ia". 

CONTEXTO: solo conozco estos temas: process.argv, módulos con require, el módulo nativo fs (writeFileSync, readFileSync, existsSync, mkdirSync), path, npm (init, install, scripts), el paquete object-hash, variables de entorno con .env y process.loadEnvFile, async/await con try/catch y el fetch nativo de Node. 

OBJETIVO: 
1. Recibir por parámetros una situación, un mundo y 5 colores, y guardarlos en un objeto JSON en data/mundo_<id>.json. 
2. Leer ese JSON y enviarlo con fetch a la API de un modelo de lenguaje para que genere la descripción de una imagen. Guardarla en descripciones/mundo_<id>.txt. 
3. Enviar esa descripción con fetch a la API de un modelo de imágenes y guardar la imagen en imagenes/mundo_<id>.jpg. 

RESTRICCIONES: 
- No uses dotenv, axios, SDK de proveedores, readline, commander ni frameworks. 
- Código simple, con comentarios en español numerados ("paso 1", "paso 2"...). 
- Las API keys se leen del archivo .env y nunca se escriben en el código. 
- Si el .txt o la imagen ya existen, no vuelvas a llamar a las APIs. 
- Divide el código en src/index.js, src/mundo.js, src/texto.js y src/imagen.js. 

SERVICIOS: 
- Texto: Pollinations (https://text.pollinations.ai/openai) o NVIDIA / Groq.
- Imagen: Pollinations (https://image.pollinations.ai/prompt) o NVIDIA FLUX.1-schnell.

FORMA DE RESPONDER: dame un archivo a la vez, explica cada bloque en 2 líneas y no uses nada que no esté en el CONTEXTO.
```

### C.1 Prompt Maestro Optimizado (Versión Mejorada)

Para maximizar la precisión, evitar alucinaciones y asegurar que el modelo de IA cumpla estrictamente con la arquitectura de 3 pasos, la caché de archivos y las restricciones pedagógicas, se diseñó la siguiente versión estructurada:

```text
Actúa como un desarrollador senior y docente experto en Node.js enfocado en buenas prácticas para aprendices de software.

OBJETIVO:
Construir una aplicación de consola modular en Node.js puro llamada "mundos-ia" que reciba 7 argumentos por línea de comandos (situación, mundo y 5 colores distintos), genere un objeto JSON con un hash determinista, consulte un modelo de lenguaje (LLM) para obtener una descripción visual artística y consulte un modelo de imágenes para generar y guardar un archivo binario JPEG en disco.

ESTRUCTURA DE ARCHIVOS REQUERIDA:
mundos-ia/
├── src/
│   ├── index.js     # Orquestador del flujo, control de errores y ahorro de cuotas
│   ├── mundo.js     # Validaciones, hash único (id) y persistencia JSON
│   ├── texto.js     # Consulta fetch nativa al modelo de lenguaje (LLM)
│   └── imagen.js    # Consulta fetch al modelo de imágenes y conversión binaria a Buffer
├── data/            # Almacenamiento de mundos en JSON (mundo_<id>.json)
├── descripciones/   # Almacenamiento de textos (mundo_<id>.txt)
├── imagenes/        # Almacenamiento de imágenes binarias (mundo_<id>.jpg)
├── .env             # Variables de entorno privadas (ignorado en Git)
├── .env.example     # Plantilla pública de configuración
├── .gitignore       # Debe ignorar: node_modules/, .env, data/, descripciones/, imagenes/
├── package.json     # Script start: "node src/index.js", dependencia única: object-hash
└── README.md

RESTRICCIONES TÉCNICAS ESTRICTAS:
1. Usa ÚNICAMENTE JavaScript estándar y módulos nativos de Node.js (fs síncrono, path, fetch nativo).
2. La ÚNICA dependencia externa permitida en package.json es "object-hash". Queda estrictamente prohibido usar dotenv, axios, node-fetch, express, commander, yargs, TypeScript o SDKs de proveedores (openai, groq-sdk).
3. Utiliza "process.loadEnvFile()" nativo de Node.js 20.12+ para leer el archivo .env sin librerías externas.
4. Módulos locales organizados con CommonJS (require / module.exports) de forma consistente.
5. Rutas absolutas resueltas a partir de la ubicación de los archivos usando path.join(__dirname, '..', ...).
6. El id del mundo debe ser los primeros 8 caracteres del hash sobre { situacion, mundo, colores }. NO incluyas creadoEn en el hash para preservar el determinismo.

FLUJO DE TRABAJO Y SISTEMA DE CACHÉ (AHORRO DE CUOTA):
- Paso 1 (mundo.js): Validar argumentos (exactamente 7, no vacíos, 5 colores distintos insensibles a mayúsculas). Guardar en data/mundo_<id>.json y releer desde disco con readFileSync + JSON.parse.
- Paso 2 (texto.js): Verificar si descripciones/mundo_<id>.txt existe. Si ya existe, reutilizarlo sin llamar a la API. Si no, llamar al LLM con un prompt de sistema que exija: un solo párrafo en inglés, 80-120 palabras, describir composición, iluminación y estilo artístico, e incluir los 5 colores. Guardar en descripciones/.
- Paso 3 (imagen.js): Verificar si imagenes/mundo_<id>.jpg existe. Si ya existe, omitir la llamada. Si no, leer la descripción del archivo .txt y llamar a la API de imágenes (soporte para bytes crudos directos y base64 en JSON). Convertir a Buffer binario (Buffer.from) y guardarlo con fs.writeFileSync sin especificar codificación ('utf-8').

CONTROL DE ERRORES EN ESPAÑOL (SIN EXPOSICIÓN DE CLAVES NI TRAZAS TÉCNICAS):
- Códigos 401/403: "La API key no es válida. Revisa tu archivo .env."
- Códigos 402/429: "Superaste el límite gratuito. Espera un momento (revisa el encabezado retry-after si existe)."
- Códigos 404/410: "El modelo o la URL no existen. Revisa tu configuración."
- Códigos 500/502/503: "El servidor está saturado o en mantenimiento. Espera unos segundos y vuelve a intentar."
- TypeError en fetch: "No se pudo conectar. Revisa tu internet o la URL."
- TimeoutError: "El servicio tardó demasiado en responder." (timeout de 30s para texto y 60s para imagen con AbortSignal.timeout).

FORMATO DE ENTREGA:
Genera un archivo a la vez con código limpio, modular, completamente documentado en español y explicando brevemente cada módulo.
```

### Prompt Siguiente 1:
- **Prompt:**
  *"¿Cómo podemos garantizar que el id del mundo sea completamente determinista al calcular el hash y no cambie en cada ejecución si el JSON debe incluir la fecha de creación?"*
- **Respuesta de la IA:**
  La IA explicó que para que el hash sea determinista y permita reutilizar archivos en la caché, debe calcularse únicamente sobre `{ situacion, mundo, colores }`. Si se incluye `creadoEn` dentro del hash, como la fecha contiene milisegundos variables en cada ejecución, el `id` cambiaría constantemente.
- **Acción realizada:**
  En `src/mundo.js`, se implementó `const hash = objectHash({ situacion, mundo: mundoNombre, colores }).slice(0, 8);` antes de añadir la propiedad `creadoEn: new Date().toISOString()` al objeto final.

### Prompt Siguiente 2:
- **Prompt:**
  *"¿Cómo manejamos los diferentes tipos de respuesta de las APIs de imagen (base64 en JSON para NVIDIA y bytes crudos directos para Pollinations) usando solo Buffer nativo de Node.js?"*
- **Respuesta de la IA:**
  La IA mostró que para Pollinations se puede obtener el `arrayBuffer` con `await respuesta.arrayBuffer()` y luego convertirlo a `Buffer.from(arrayBuffer)`. Para NVIDIA o Cloudflare, el string base64 se convierte directamente con `Buffer.from(base64, 'base64')`. En ambos casos, el archivo se guarda con `fs.writeFileSync(ruta, bytes)` sin pasar `'utf-8'`.
- **Acción realizada:**
  Se integró esta doble compatibilidad en `src/imagen.js`, permitiendo al usuario cambiar libremente entre Pollinations y NVIDIA sin que el programa falle.

### Prompt Siguiente 3:
- **Prompt:**
  *"¿Cómo estructuramos los mensajes de error en español para cumplir la tabla de la Parte 5 (401/403, 402/429, 404/410, TypeError y TimeoutError) asegurando que ninguna clave se imprima en consola?"*
- **Respuesta de la IA:**
  La IA sugirió verificar `respuesta.status` dentro de las funciones de petición para lanzar errores específicos en español con los mensajes requeridos, y capturar `TypeError` y `TimeoutError` en el `try/catch` de `index.js`.
- **Acción realizada:**
  Se implementó el mapeo estricto de códigos y excepciones en `src/texto.js`, `src/imagen.js` e `src/index.js`, garantizando mensajes claros sin stack traces técnicos ni fugas de credenciales.

---

## E. Al Menos 3 Cambios Realizados Sobre lo Entregado por la IA

1. **Eliminación de dependencias innecesarias (`dotenv`):**
   - *Motivo:* La IA inicialmente propuso usar `require('dotenv').config()`. Se corrigió para emplear el método nativo `process.loadEnvFile()` incorporado en Node.js 20.12+, cumpliendo la restricción estricta del taller de usar únicamente `object-hash` como paquete externo.

2. **Validación estricta de mayúsculas/minúsculas en los 5 colores:**
   - *Motivo:* La IA había usado un simple `new Set(colores).size !== 5`, lo que permitía pasar `"Rojo"` y `"rojo"` como colores distintos. Se ajustó mapeando a minúsculas (`colores.map(c => c.toLowerCase())`) antes de crear el `Set`.

3. **Corrección de rutas con separadores estándar en consola:**
   - *Motivo:* En Windows, `path.join('data', ...)` imprime barras invertidas `data\mundo_...`. Se formateó la salida en consola para usar barras diagonales `data/mundo_...`, reproduciendo con exactitud la salida requerida en el enunciado del taller.

---

## F. Línea de Código no Comprendida al Principio, Explicada con Mis Palabras

```javascript
const bytes = Buffer.from(await respuesta.arrayBuffer());
```

**Explicación con mis palabras:**
Una imagen que viaja por internet no es texto, sino una cadena pura de bytes binarios. El navegador o Node.js recibe esos datos como un `ArrayBuffer` (un espacio en memoria donde están guardados los ceros y unos crudos que envió el servidor). La función `Buffer.from(...)` toma ese arreglo en memoria y lo transforma en un `Buffer` nativo de Node.js, que es el formato binario que entiende `fs.writeFileSync` para poder guardarlo directamente en el disco duro como un archivo `.jpg` visible y sin corrupciones.

---

## G. Un Error Encontrado: Mensaje y Resolución

- **Mensaje de error:**
  ```text
  Error: El servicio tardó demasiado en responder. (TimeoutError: The operation was aborted due to timeout)
  ```
- **Causa:**
  Al consultar consecutivamente la API de texto gratuita de Pollinations, se alcanzó la ventana de limitación de tasa (rate limit de 1 petición cada 30 segundos por dirección IP pública). Como la API retuvo la petición, superó el límite de `AbortSignal.timeout(30000)` (30 segundos).
- **Cómo se resolvió:**
  1. El manejador de errores de `index.js` interceptó el `TimeoutError` y mostró el mensaje amigable en español.
  2. Gracias al diseño modular de resultados parciales (Parte 5), el archivo `data/mundo_<id>.json` ya había quedado guardado intacto.
  3. Al esperar 10 segundos y reejecutar el comando, el programa continuó a partir del Paso 2 sin repetir el Paso 1, completando la generación de la descripción y la imagen con total éxito.
