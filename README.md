# mundos-ia

**mundos-ia** es un programa de consola en Node.js diseñado para estudios de videojuegos y desarrolladores creativos que necesitan bocetos visuales rápidos de mundos imaginarios.

A partir de una situación, el nombre de un mundo y 5 colores recibidos por argumentos de consola, el programa:
1. Valida y almacena los datos en un archivo JSON determinista en `data/mundo_<id>.json`.
2. Lee dicho JSON y consulta a un modelo de lenguaje (LLM) para obtener una descripción visual artística en inglés (80-120 palabras), guardándola en `descripciones/mundo_<id>.txt`.
3. Envía la descripción a un modelo de generación de imágenes y guarda el archivo binario resultante en `imagenes/mundo_<id>.jpg`.
4. Implementa un sistema de caché basado en archivos para ahorrar créditos y cuotas gratuitas en futuras ejecuciones.

---

## Estructura del Proyecto

```text
mundos-ia/
├── src/
│   ├── index.js          # Orquestador principal del flujo (Pasos 1 a 3)
│   ├── mundo.js          # Validaciones, hash único (id) y operaciones de disco en JSON
│   ├── texto.js          # Consulta fetch al modelo de lenguaje (LLM)
│   └── imagen.js         # Consulta fetch al modelo de imágenes y conversión a Buffer
├── evidencias/           # Capturas y bitácoras de pruebas, errores y publicación
├── .env                  # Variables de entorno y claves privadas (ignorado en Git)
├── .env.example          # Plantilla pública de variables de entorno
├── .gitignore            # Exclusión de archivos sensibles y temporales
├── package.json          # Metadatos del paquete y dependencias
├── PROMPT.md             # Bitácora del proceso de desarrollo asistido con IA
└── README.md             # Documentación completa y respuestas de reflexión
```

---

## Requisitos Previos

- **Node.js** 20.12 o superior (probado en Node v24).
- **npm** y **Git**.
- Cuentas o accesos a los servicios de IA seleccionados (o uso de servicios sin clave como Pollinations).

---

## Servicios Utilizados

El proyecto es compatible con múltiples proveedores configurables vía `.env`:

| Tipo de Modelo | Servicio Principal | Alternativas Compatibles | Enlace |
| :--- | :--- | :--- | :--- |
| **Texto (LLM)** | **Pollinations AI** (modelo `openai`) | **NVIDIA NIM** (`openai/gpt-oss-20b`) / **Groq** | [Pollinations](https://enter.pollinations.ai/) · [NVIDIA](https://build.nvidia.com) |
| **Imágenes** | **Pollinations AI** (modelo FLUX) | **NVIDIA FLUX.1-schnell** / **Cloudflare Workers AI** | [Pollinations Images](https://image.pollinations.ai/) · [FLUX NVIDIA](https://build.nvidia.com/black-forest-labs/flux_1-schnell) |

---

## Instalación y Configuración

1. Clona el repositorio:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd mundos-ia
   ```

2. Instala las dependencias (únicamente `object-hash`):
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   Copia el archivo `.env.example` creando `.env`:
   ```bash
   # En Windows PowerShell:
   Copy-Item .env.example .env
   ```
   Edita `.env` con tus preferencias:
   ```env
   # Ejemplo con Pollinations (sin clave requerida para pruebas):
   TEXTO_API_KEY=
   TEXTO_URL=https://text.pollinations.ai/openai
   TEXTO_MODELO=openai

   IMAGEN_API_KEY=
   IMAGEN_URL=https://image.pollinations.ai/prompt
   ```

---

## Modo de Uso

El programa se ejecuta mediante `npm start --` seguido de 7 argumentos entre comillas cuando contengan espacios:
1. **Situación**
2. **Mundo**
3. **Color 1**
4. **Color 2**
5. **Color 3**
6. **Color 4**
7. **Color 5**

### Ejemplo de Ejecución:

```bash
npm start -- "Una tormenta eléctrica amenaza la ciudad flotante" "Aerópolis, un archipiélago de islas que flotan sobre las nubes" rojo azul verde dorado violeta
```

### Salida en Consola:
```text
Paso 1: mundo guardado en data/mundo_cba86145.json
Paso 2: descripción guardada en descripciones/mundo_cba86145.txt
Paso 3: imagen guardada en imagenes/mundo_cba86145.jpg
Listo. Revisa la carpeta imagenes/
```

### Reutilización de Archivos (Segunda Ejecución con Mismos Datos):
```bash
npm start -- "Una tormenta eléctrica amenaza la ciudad flotante" "Aerópolis, un archipiélago de islas que flotan sobre las nubes" rojo azul verde dorado violeta
```
```text
Paso 1: mundo guardado en data/mundo_cba86145.json
Paso 2: la descripción ya existía, no se llamó al modelo de texto.
Paso 3: la imagen ya existía, no se llamó al modelo de imágenes.
Listo. Revisa la carpeta imagenes/
```

---

## Experimento de Publicación (npm publish --dry-run)

Se ejecutó la prueba de empaquetado para verificar qué archivos se publicarían en el registro público de npm:

### 1. Con `.gitignore` activo:
Al ejecutar `npm publish --dry-run`, npm utiliza `.gitignore` para descartar directorios y archivos privados. En el tarball resultante solo se incluyeron:
- `package.json`
- `.env.example`
- `README.md`
- Archivos en `src/`

Los archivos confidenciales (`.env`) y generados (`data/`, `descripciones/`, `imagenes/`) quedaron completamente protegidos y fuera del paquete.

### 2. Sin `.gitignore` (renombrado a `.gitignore.off`):
Al renombrar temporalmente `.gitignore` a `.gitignore.off` y ejecutar `npm publish --dry-run`, se observó que el tarball incluyó:
- `.env`
- Todos los JSON en `data/`
- Todos los archivos `.txt` en `descripciones/`
- Todas las imágenes binarias en `imagenes/`

### ¿Por qué es peligroso?
Es crítico porque el archivo `.env` contiene credenciales secretas (claves API de NVIDIA, Groq o tokens de Cloudflare). Si se publica un paquete sin un `.gitignore` o `.npmignore` adecuado, esas credenciales quedan expuestas en un registro público accesible por cualquier persona o bot en internet, lo que puede causar robo de identidad, agotamiento de saldo, costos imprevistos o revocación de cuentas.

---

## Preguntas de Reflexión

### 1. ¿Por qué el id se calcula sin la fecha? ¿Qué pasaría si la incluyeras?
El `id` se calcula aplicando `object-hash` estrictamente a `{ situacion, mundo, colores }` para que sea una función determinista e idempotente. Si incluyéramos `creadoEn` (que almacena una marca de tiempo con milisegundos), cada ejecución produciría un identificador completamente distinto, impidiendo detectar que el mundo ya había sido procesado y forzando llamadas innecesarias a las APIs que agotarían la cuota gratuita.

### 2. ¿Por qué se le pide al modelo de texto la descripción en inglés? Si puedes, prueba con una en español y compara las imágenes.
Los modelos de generación de imágenes (como FLUX o Stable Diffusion) fueron entrenados mayoritariamente con colecciones masivas de imágenes etiquetadas en inglés (como LAION-5B). Al recibir un prompt en inglés, el generador interpreta con precisión la estética, las relaciones de iluminación, los planos de cámara y la combinación exacta de colores, mientras que en español suele confundir adjetivos, omitir elementos o producir composiciones genéricas.

### 3. ¿Qué diferencia hay entre una respuesta JSON de texto y una respuesta con los bytes de una imagen? ¿Qué es base64?
Una respuesta JSON es una cadena de texto estructurada con caracteres codificados (generalmente UTF-8) organizada en claves y valores legibles. Por el contrario, una imagen es un archivo binario formado por una secuencia continua de bytes arbitrarios que codifican los píxeles comprimidos en JPEG o PNG. Base64 es un algoritmo de codificación que convierte esos bytes binarios crudos en una secuencia de caracteres ASCII seguros (A-Z, a-z, 0-9, +, /), permitiendo transportar datos binarios incrustados dentro de un JSON de texto.

### 4. ¿Qué pasaría si guardas la imagen con 'utf-8'? ¿Por qué?
Si se intenta guardar una imagen pasando `'utf-8'` a `fs.writeFileSync(ruta, bytes, 'utf-8')`, Node.js intentará mapear cada secuencia de bytes como caracteres tipográficos UTF-8. Las secuencias binarias de la imagen que no correspondan a caracteres válidos se corrompen o se sustituyen por el carácter de reemplazo `\uFFFD`, alterando la cabecera del formato JPEG e inutilizando el archivo, que ya no podrá ser visualizado por ningún visor de imágenes.

### 5. ¿Qué pasos consumen cuota gratuita y cómo evitaste repetirlos?
Los pasos que consumen cuota gratuita son el Paso 2 (petición fetch al modelo de lenguaje) y el Paso 3 (petición fetch al modelo de imágenes). Para evitar repetirlos, el programa utiliza `fs.existsSync`: si `descripciones/mundo_<id>.txt` o `imagenes/mundo_<id>.jpg` ya existen en el disco, se omite por completo la llamada de red a la API y se informa al usuario en consola, conservando los créditos para nuevos mundos.

### 6. Si usaste IA: ¿qué fue lo más difícil de pedirle y qué parte tuviste que corregir tú?
Lo más difícil fue asegurar que la IA se apegará exclusivamente a los temas vistos en clase sin introducir dependencias como `dotenv`, `axios`, SDKs de OpenAI o frameworks como `commander`. Tuvo que corregirse específicamente el uso de `process.loadEnvFile()` nativo de Node.js, la gestión síncrona con el módulo `fs`, y el guardado de los bytes binarios de la imagen sin pasar codificación de caracteres.
