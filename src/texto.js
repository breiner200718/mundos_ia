// src/texto.js
// Módulo para consultar al modelo de lenguaje (LLM) y obtener la descripción de la imagen

/**
 * Consulta a la API de texto para generar una descripción visual del mundo imaginario.
 * @param {object} mundo - Objeto que contiene id, situacion, mundo, colores y creadoEn.
 * @returns {Promise<string>} Descripción de la imagen en inglés generada por el modelo.
 */
async function describirMundo(mundo) {
  const url = process.env.TEXTO_URL || 'https://text.pollinations.ai/openai';
  const modelo = process.env.TEXTO_MODELO || 'openai';
  const apiKey = process.env.TEXTO_API_KEY;

  const promptSistema = 'You are an expert prompt designer for text-to-image AI generators. ' +
    'Based on the provided JSON world data, generate a vivid visual description of an image. ' +
    'Strict requirements: ' +
    '1. Write exactly one single paragraph in English. ' +
    '2. The paragraph must be between 80 and 120 words. ' +
    '3. Describe the scene, key visual elements, lighting, composition, and artistic style. Do not write a story or narrative. ' +
    '4. Explicitly incorporate and mention all 5 colors specified in the input (translated into English). ' +
    '5. Do not include any title, markdown formatting, bullet points, quotes, or text rendered inside the image.';

  const cuerpoPeticion = {
    model: modelo,
    messages: [
      { role: 'system', content: promptSistema },
      { role: 'user', content: JSON.stringify(mundo) }
    ]
  };

  const cabeceras = {
    'Content-Type': 'application/json'
  };

  if (apiKey && apiKey.trim().length > 0) {
    cabeceras['Authorization'] = `Bearer ${apiKey.trim()}`;
  }

  let respuesta;
  try {
    respuesta = await fetch(url, {
      method: 'POST',
      headers: cabeceras,
      body: JSON.stringify(cuerpoPeticion),
      signal: AbortSignal.timeout(30000)
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
    if (estado === 500 || estado === 502 || estado === 503 || estado === 504) {
      throw new Error(`El servidor de texto está temporalmente saturado o en mantenimiento (HTTP ${estado}). Espera unos 15-30 segundos y vuelve a intentar.`);
    }
    throw new Error(`Error en el servicio de texto (código HTTP ${estado}).`);
  }

  const datos = await respuesta.json();

  if (!datos || !datos.choices || !datos.choices[0] || !datos.choices[0].message || !datos.choices[0].message.content) {
    throw new Error('La respuesta del modelo de texto está vacía o tiene un formato inesperado.');
  }

  let descripcion = datos.choices[0].message.content.trim();

  if (descripcion.length === 0) {
    throw new Error('La respuesta del modelo de texto llegó vacía.');
  }

  if (descripcion.length > 1500) {
    console.warn('Aviso: La descripción superó los 1500 caracteres y fue recortada.');
    descripcion = descripcion.slice(0, 1500);
  }

  return descripcion;
}

module.exports = {
  describirMundo
};
