// src/imagen.js
// Módulo para consultar al modelo de generación de imágenes y devolver los bytes (Buffer)

/**
 * Consulta a la API de generación de imágenes y devuelve el Buffer con los bytes binarios.
 * Soporta Pollinations (bytes directos), NVIDIA FLUX.1-schnell (JSON base64) y Cloudflare (JSON base64).
 * @param {string} descripcion - Descripción en texto generada previamente.
 * @returns {Promise<Buffer>} Bytes binarios de la imagen JPEG.
 */
async function generarImagen(descripcion) {
  const urlBase = process.env.IMAGEN_URL || 'https://image.pollinations.ai/prompt';
  const apiKey = process.env.IMAGEN_API_KEY;

  let respuesta;
  let bytes;

  // Comprobar si el servicio configurado es Pollinations (método GET con prompt codificado en URL)
  if (urlBase.includes('pollinations.ai')) {
    const urlLimpia = urlBase.endsWith('/') ? urlBase.slice(0, -1) : urlBase;
    const urlFinal = `${urlLimpia}/${encodeURIComponent(descripcion)}?width=1024&height=1024&nologo=true`;

    try {
      respuesta = await fetch(urlFinal, {
        method: 'GET',
        signal: AbortSignal.timeout(60000)
      });
    } catch (err) {
      if (err.name === 'TimeoutError') {
        const errorTimeout = new Error('El servicio tardó demasiado en responder.');
        errorTimeout.name = 'TimeoutError';
        throw errorTimeout;
      }
      if (err instanceof TypeError) {
        throw new TypeError('No se pudo conectar. Revisa tu internet o la URL.');
      }
      throw err;
    }

    if (!respuesta.ok) {
      const estado = respuesta.status;
      if (estado === 401 || estado === 403) {
        throw new Error('La API key no es válida. Revisa tu archivo .env.');
      }
      if (estado === 402 || estado === 429) {
        const retryAfter = respuesta.headers.get('retry-after');
        const mensajeRetry = retryAfter ? ` (espera ${retryAfter} segundos)` : '';
        throw new Error(`Superaste el límite gratuito. Espera un momento (revisa el encabezado retry-after si existe).${mensajeRetry}`);
      }
      if (estado === 404 || estado === 410) {
        throw new Error('El modelo o la URL no existen. Revisa tu configuración.');
      }
      throw new Error(`Error en el servicio de imágenes (código HTTP ${estado}).`);
    }

    const arrayBuffer = await respuesta.arrayBuffer();
    bytes = Buffer.from(arrayBuffer);
  } else {
    // Caso de APIs con POST y respuesta en JSON con base64 (NVIDIA FLUX.1-schnell o Cloudflare)
    const cabeceras = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (apiKey && apiKey.trim().length > 0) {
      cabeceras['Authorization'] = `Bearer ${apiKey.trim()}`;
    }

    // Adaptar cuerpo según proveedor (Cloudflare o NVIDIA)
    let cuerpoPeticion;
    if (urlBase.includes('cloudflare.com')) {
      cuerpoPeticion = {
        prompt: descripcion,
        steps: 4
      };
    } else {
      // NVIDIA FLUX.1-schnell por defecto
      cuerpoPeticion = {
        prompt: descripcion,
        width: 1024,
        height: 1024,
        steps: 4,
        seed: 0
      };
    }

    try {
      respuesta = await fetch(urlBase, {
        method: 'POST',
        headers: cabeceras,
        body: JSON.stringify(cuerpoPeticion),
        signal: AbortSignal.timeout(60000)
      });
    } catch (err) {
      if (err.name === 'TimeoutError') {
        const errorTimeout = new Error('El servicio tardó demasiado en responder.');
        errorTimeout.name = 'TimeoutError';
        throw errorTimeout;
      }
      if (err instanceof TypeError) {
        throw new TypeError('No se pudo conectar. Revisa tu internet o la URL.');
      }
      throw err;
    }

    if (!respuesta.ok) {
      const estado = respuesta.status;
      if (estado === 401 || estado === 403) {
        throw new Error('La API key no es válida. Revisa tu archivo .env.');
      }
      if (estado === 402 || estado === 429) {
        const retryAfter = respuesta.headers.get('retry-after');
        const mensajeRetry = retryAfter ? ` (espera ${retryAfter} segundos)` : '';
        throw new Error(`Superaste el límite gratuito. Espera un momento (revisa el encabezado retry-after si existe).${mensajeRetry}`);
      }
      if (estado === 404 || estado === 410) {
        throw new Error('El modelo o la URL no existen. Revisa tu configuración.');
      }
      throw new Error(`Error en el servicio de imágenes (código HTTP ${estado}).`);
    }

    const datos = await respuesta.json();

    // Validar NVIDIA FLUX.1-schnell
    if (datos.artifacts && datos.artifacts.length > 0) {
      const artifact = datos.artifacts[0];
      if (artifact.finishReason && artifact.finishReason !== 'SUCCESS') {
        throw new Error(`La generación de imagen no fue exitosa. Razón: ${artifact.finishReason}`);
      }
      bytes = Buffer.from(artifact.base64, 'base64');
    } else if (datos.result && datos.result.image) {
      // Validar Cloudflare Workers AI
      bytes = Buffer.from(datos.result.image, 'base64');
    } else {
      throw new Error('La respuesta del servicio de imágenes no contiene datos reconocibles.');
    }
  }

  // Comprobar que los bytes no estén vacíos
  if (!bytes || bytes.length === 0) {
    throw new Error('La imagen generada está vacía.');
  }

  return bytes;
}

module.exports = {
  generarImagen
};
