# Resumen de Evidencias - mundos-ia

En esta carpeta se encuentran registradas todas las evidencias requeridas por el Taller:

1. **`1_ejecucion_mundo1.txt`**:
   - Ejecución completa del primer mundo ("Una tormenta eléctrica amenaza la ciudad flotante").
   - Contenido del JSON generado (`data/mundo_cba86145.json`).
   - Descripción generada en inglés (`descripciones/mundo_cba86145.txt`).
   - Confirmación de imagen binaria generada (`imagenes/mundo_cba86145.jpg`).

2. **`2_ejecucion_mundo2.txt`**:
   - Ejecución completa del segundo mundo ("Un festival de linternas ilumina las ruinas sumergidas").
   - Contenido del JSON generado (`data/mundo_865d07cd.json`).
   - Descripción generada en inglés (`descripciones/mundo_865d07cd.txt`).
   - Confirmación de imagen binaria generada (`imagenes/mundo_865d07cd.jpg`).

3. **`3_reutilizacion_archivos.txt`**:
   - Segunda ejecución con los mismos parámetros del mundo 1.
   - Demostración de omisión de llamadas a las APIs externas ("la descripción ya existía...", "la imagen ya existía...").

4. **`4_tres_errores_provocados.txt`**:
   - Error 1: Fallo de conexión o URL mal escrita (TypeError).
   - Error 2: API key inválida (HTTP 401 / 403).
   - Error 3: Modelo o URL inexistente (HTTP 404 / 410).
   - Error adicional: Timeout del servicio (TimeoutError).

5. **`5_publish_con_y_sin_gitignore.txt`**:
   - Demostración de `npm publish --dry-run` con `.gitignore` (empaquetado seguro).
   - Demostración de `npm publish --dry-run` sin `.gitignore` (`.gitignore.off`) y explicación del peligro de fuga de credenciales.

6. **`6_git_ls_files.txt`**:
   - Salida del comando `git ls-files`, certificando que el archivo confidencial `.env` no forma parte del repositorio.

7. **Imágenes generadas copiadas en `evidencias/`**:
   - `mundo_cba86145.jpg`
   - `mundo_865d07cd.jpg`
