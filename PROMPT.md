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

---

## D. Prompts Siguientes, Respuestas y Acciones Realizadas

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
