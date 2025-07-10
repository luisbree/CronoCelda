/**
 * @fileoverview Google Cloud Function para generar teselas de mapa desde Google Earth Engine.
 *
 * Esta función HTTP recibe un GeoJSON y un rango de fechas, procesa imágenes de Sentinel-2
 * para crear una composición de falso color (bandas 8, 4, 3) y devuelve una URL de teselas
 * que puede ser usada en un cliente de mapas como Leaflet o Google Maps.
 *
 * @see https://developers.google.com/earth-engine/guides/service_account
 * @see https://cloud.google.com/functions/docs/create-deploy-http-nodejs
 */

import functions from '@google-cloud/functions-framework';
import ee from '@google/earthengine';
import cors from 'cors';

// --- CONFIGURACIÓN IMPORTANTE ---
// 1.  Crea una Cuenta de Servicio en tu proyecto de Google Cloud.
// 2.  Otorga a la cuenta de servicio el rol de "Usuario de Earth Engine" (Earth Engine User).
// 3.  Descarga el archivo de clave JSON de la cuenta de servicio.
// 4.  Codifica el contenido del archivo JSON a Base64.
//     - Puedes usar: base64 -w 0 /ruta/a/tu/clave.json
// 5.  Crea un secreto en Google Secret Manager con el valor de la clave codificada en Base64.
// 6.  Otorga a la cuenta de servicio que ejecuta esta Cloud Function el rol de "Accesor de Secretos de Secret Manager" (Secret Manager Secret Accessor).
//
// Al desplegar esta función, asegúrate de establecer la variable de entorno:
// GOOGLE_APPLICATION_CREDENTIALS_BASE64_SECRET: projects/tu-proyecto/secrets/tu-secreto/versions/latest
const privateKeyBase64Secret = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64_SECRET;

if (!privateKeyBase64Secret) {
  console.error("La variable de entorno GOOGLE_APPLICATION_CREDENTIALS_BASE64_SECRET no está configurada.");
}

// Configura un middleware de CORS para permitir peticiones desde tu frontend.
// En producción, deberías restringir el origen a tu dominio específico.
const corsMiddleware = cors({ origin: true });

/**
 * Función principal que se ejecuta al recibir una petición HTTP.
 */
functions.http('get-gee-tiles', async (req, res) => {
  // Usa el middleware de CORS para manejar la petición pre-vuelo (OPTIONS) y las cabeceras.
  corsMiddleware(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    try {
      // 1. Extraer y validar los parámetros de la petición.
      const { areaOfInterest, startDate, endDate } = req.body;
      if (!areaOfInterest || !startDate || !endDate) {
        return res.status(400).send('Faltan parámetros requeridos: areaOfInterest, startDate, endDate.');
      }

      // 2. Autenticar y inicializar Earth Engine.
      await initializeEe();

      // 3. Procesar los datos en Earth Engine.
      const geometry = ee.Geometry(areaOfInterest);
      const image = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
        .filterBounds(geometry)
        .filterDate(ee.Date(startDate), ee.Date(endDate))
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)) // Filtrar por bajo porcentaje de nubes
        .median(); // Crear una composición de mediana para obtener una imagen más limpia

      // 4. Definir los parámetros de visualización.
      //    Bandas 8, 4, 3 corresponden a Infrarrojo Cercano (NIR), Rojo y Verde.
      //    Esto crea una imagen de falso color útil para análisis de vegetación.
      const visParams = {
        bands: ['B8', 'B4', 'B3'],
        min: 0,
        max: 3000,
        gamma: 1.4,
      };

      // 5. Obtener el MapId, que contiene la URL de las teselas.
      const mapId = await getMapId(image.visualize(visParams));

      // 6. Enviar la URL de las teselas como respuesta.
      res.status(200).json({ tileUrl: mapId.urlFormat });

    } catch (error: any) {
      console.error('Error procesando la petición de Earth Engine:', error);
      res.status(500).send(`Error interno del servidor: ${error.message || 'Error desconocido'}`);
    }
  });
});

/**
 * Autentica con Earth Engine usando la clave de la cuenta de servicio.
 * Esta función solo se ejecuta una vez por instancia de la función.
 */
async function initializeEe(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!privateKeyBase64Secret) {
        throw new Error("No se pudo inicializar Earth Engine: la clave privada no está configurada.");
    }
    
    // Decodificar la clave desde Base64
    const privateKey = JSON.parse(Buffer.from(privateKeyBase64Secret, 'base64').toString('utf-8'));

    ee.data.authenticateViaPrivateKey(
      privateKey,
      () => {
        ee.initialize(null, null, () => {
          console.log('Earth Engine inicializado correctamente.');
          resolve();
        }, (err: string) => {
          console.error('Error al inicializar Earth Engine:', err);
          reject(new Error(`Error al inicializar Earth Engine: ${err}`));
        });
      },
      (err: string) => {
        console.error('Error de autenticación con Earth Engine:', err);
        reject(new Error(`Error de autenticación con Earth Engine: ${err}`));
      }
    );
  });
}

/**
 * Envuelve la función ee.Image.getMapId en una Promesa para poder usar async/await.
 * @param {ee.Image} image - La imagen de Earth Engine a visualizar.
 * @returns {Promise<ee.data.MapId>} Una promesa que se resuelve con el objeto MapId.
 */
async function getMapId(image: ee.Image): Promise<ee.data.MapId> {
    return new Promise((resolve, reject) => {
        image.getMapId(null, (mapid, error) => {
            if (error) {
                reject(new Error(error));
            } else {
                resolve(mapid);
            }
        });
    });
}
