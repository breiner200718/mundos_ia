// src/mundo.js
// Módulo para validar argumentos, construir el objeto del mundo y guardarlo o leerlo en JSON

const fs = require('fs');
const path = require('path');
const objectHash = require('object-hash');

/**
 * Valida los argumentos recibidos por consola y crea el objeto del mundo.
 * @param {string[]} args - Lista de argumentos pasados por consola (process.argv.slice(2)).
 * @returns {object|null} Objeto con la información del mundo o null si falla la validación.
 */
function crearMundo(args) {
  // 1. Validar que lleguen exactamente 7 argumentos
  if (!args || args.length !== 7) {
    console.error('Error: Debes proporcionar exactamente 7 argumentos: situación, mundo y 5 colores.');
    console.error('Ejemplo de uso:');
    console.error('npm start -- "Una tormenta eléctrica amenaza la ciudad flotante" "Aerópolis, un archipiélago de islas que flotan sobre las nubes" rojo azul verde dorado violeta');
    process.exitCode = 1;
    return null;
  }

  // 2. Validar que ningún argumento esté vacío o contenga solo espacios
  for (let i = 0; i < args.length; i++) {
    if (!args[i] || args[i].trim().length === 0) {
      console.error('Error: Ningún argumento puede estar vacío o contener solo espacios.');
      console.error('Ejemplo de uso:');
      console.error('npm start -- "Una tormenta eléctrica amenaza la ciudad flotante" "Aerópolis, un archipiélago de islas que flotan sobre las nubes" rojo azul verde dorado violeta');
      process.exitCode = 1;
      return null;
    }
  }

  const situacion = args[0].trim();
  const mundoNombre = args[1].trim();
  const colores = args.slice(2).map(c => c.trim());

  // 3. Validar que los 5 colores sean distintos (sin distinguir mayúsculas de minúsculas)
  const coloresMinusculas = colores.map(c => c.toLowerCase());
  const coloresUnicos = new Set(coloresMinusculas);
  if (coloresUnicos.size !== 5) {
    console.error('Error: Los 5 colores deben ser distintos (sin distinguir mayúsculas de minúsculas).');
    console.error('Ejemplo de uso:');
    console.error('npm start -- "Una tormenta eléctrica amenaza la ciudad flotante" "Aerópolis, un archipiélago de islas que flotan sobre las nubes" rojo azul verde dorado violeta');
    process.exitCode = 1;
    return null;
  }

  // 4. Calcular el id usando los primeros 8 caracteres del hash sobre { situacion, mundo, colores }
  // NOTA IMPORTANTE: No se incluye creadoEn en el hash para que sea determinista y reutilice archivos.
  const hash = objectHash({ situacion, mundo: mundoNombre, colores });
  const id = hash.slice(0, 8);

  const mundoObj = {
    id,
    situacion,
    mundo: mundoNombre,
    colores,
    creadoEn: new Date().toISOString()
  };

  return mundoObj;
}

/**
 * Guarda el objeto del mundo en data/mundo_<id>.json
 * @param {object} mundo - Objeto del mundo generado por crearMundo.
 * @returns {string} Ruta absoluta del archivo guardado.
 */
function guardarMundo(mundo) {
  const carpetaData = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(carpetaData)) {
    fs.mkdirSync(carpetaData, { recursive: true });
  }

  const rutaArchivo = path.join(carpetaData, `mundo_${mundo.id}.json`);
  fs.writeFileSync(rutaArchivo, JSON.stringify(mundo, null, 2), 'utf-8');
  return rutaArchivo;
}

/**
 * Lee el archivo JSON del mundo guardado y lo devuelve como objeto.
 * @param {string} ruta - Ruta al archivo JSON.
 * @returns {object} Objeto del mundo parseado.
 */
function leerMundo(ruta) {
  const contenido = fs.readFileSync(ruta, 'utf-8');
  return JSON.parse(contenido);
}

module.exports = {
  crearMundo,
  guardarMundo,
  leerMundo
};
