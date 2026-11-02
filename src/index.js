// src/index.js
// Orquestador principal del programa mundos-ia

const fs = require('fs');
const path = require('path');
const { crearMundo, guardarMundo, leerMundo } = require('./mundo');
const { describirMundo } = require('./texto');
const { generarImagen } = require('./imagen');

// Cargar variables de entorno de forma nativa desde .env si existe
const rutaEnv = path.join(__dirname, '..', '.env');
if (fs.existsSync(rutaEnv)) {
  process.loadEnvFile(rutaEnv);
}

async function main() {
  try {
    const args = process.argv.slice(2);

    // ==========================================
    // PASO 1: Validar parámetros y guardar JSON
    // ==========================================
    const mundo = crearMundo(args);
    if (!mundo) {
      // Las validaciones de argumentos ya mostraron el mensaje y asignaron process.exitCode = 1
      return;
    }

    // Guardar el mundo en disco
    const rutaJSON = guardarMundo(mundo);

    // Volver a leer el mundo guardado desde el archivo (regla del taller: no reutilizar de memoria)
    const mundoGuardado = leerMundo(rutaJSON);

    console.log(`Paso 1: mundo guardado en data/mundo_${mundoGuardado.id}.json`);

    // ==========================================
    // PASO 2: Obtener descripción con el modelo de texto
    // ==========================================
    const carpetaDescripciones = path.join(__dirname, '..', 'descripciones');
    const rutaTexto = path.join(carpetaDescripciones, `mundo_${mundoGuardado.id}.txt`);
    let descripcion;

    if (fs.existsSync(rutaTexto)) {
      console.log('Paso 2: la descripción ya existía, no se llamó al modelo de texto.');
      descripcion = fs.readFileSync(rutaTexto, 'utf-8');
    } else {
      descripcion = await describirMundo(mundoGuardado);

      if (!fs.existsSync(carpetaDescripciones)) {
        fs.mkdirSync(carpetaDescripciones, { recursive: true });
      }

      fs.writeFileSync(rutaTexto, descripcion, 'utf-8');
      console.log(`Paso 2: descripción guardada en descripciones/mundo_${mundoGuardado.id}.txt`);
    }

    // ==========================================
    // PASO 3: Generar imagen con el modelo de imágenes
    // ==========================================
    const carpetaImagenes = path.join(__dirname, '..', 'imagenes');
    const rutaImagen = path.join(carpetaImagenes, `mundo_${mundoGuardado.id}.jpg`);

    if (fs.existsSync(rutaImagen)) {
      console.log('Paso 3: la imagen ya existía, no se llamó al modelo de imágenes.');
    } else {
      // La descripción que se envía se lee desde el archivo .txt guardado en el Paso 2
      const descripcionParaImagen = fs.readFileSync(rutaTexto, 'utf-8');
      const bytesImagen = await generarImagen(descripcionParaImagen);

      if (!fs.existsSync(carpetaImagenes)) {
        fs.mkdirSync(carpetaImagenes, { recursive: true });
      }

      // Escribir los bytes binarios de la imagen sin pasar codificación
      fs.writeFileSync(rutaImagen, bytesImagen);
      console.log(`Paso 3: imagen guardada en imagenes/mundo_${mundoGuardado.id}.jpg`);
    }

    console.log('Listo. Revisa la carpeta imagenes/');
  } catch (error) {
    if (error.name === 'TimeoutError') {
      console.error('Error: El servicio tardó demasiado en responder.');
    } else if (error instanceof TypeError) {
      console.error('Error: No se pudo conectar. Revisa tu internet o la URL.');
    } else {
      console.error(`Error: ${error.message}`);
    }
    process.exitCode = 1;
  }
}

main();
