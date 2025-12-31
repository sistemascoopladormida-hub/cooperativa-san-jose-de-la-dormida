import { google } from "googleapis";
import type { JWT } from "google-auth-library";
import fs from "fs";
import path from "path";

// Inicializar Google Drive API
let driveClient: any = null;
let jwtModule: any = null;

async function getDriveClient() {
  if (driveClient) {
    return driveClient;
  }

  try {
    let credentials: any;

    // Intentar leer desde variables de entorno primero (producción)
    if (
      process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_DRIVE_PRIVATE_KEY &&
      process.env.GOOGLE_DRIVE_PROJECT_ID
    ) {
      credentials = {
        client_email: process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        project_id: process.env.GOOGLE_DRIVE_PROJECT_ID,
      };
    } else {
      // Fallback: leer desde archivo JSON (desarrollo local)
      try {
        const credentialsPath = path.join(process.cwd(), "keyapidrive.json");
        credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));
      } catch (fileError) {
        console.error("[DRIVE] ❌ Error: No se encontraron credenciales de Google Drive");
        throw new Error(
          "No se encontraron credenciales de Google Drive. Configura las variables de entorno GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL, GOOGLE_DRIVE_PRIVATE_KEY y GOOGLE_DRIVE_PROJECT_ID, o coloca el archivo keyapidrive.json en la raíz del proyecto."
        );
      }
    }

    // Importar JWT dinámicamente para evitar problemas de build
    if (!jwtModule) {
      jwtModule = await import("google-auth-library");
    }
    const { JWT } = jwtModule;

    const auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    driveClient = google.drive({ version: "v3", auth });
    return driveClient;
  } catch (error) {
    console.error("[DRIVE] ❌ Error inicializando Google Drive:", error instanceof Error ? error.message : error);
    throw error;
  }
}

/**
 * Extrae el número de cuenta del nombre del PDF
 * Ejemplo: "0063700097001400008565.pdf" -> "6370"
 * Ejemplo: "0002390097001400008626.pdf" -> "239"
 */
export function extractAccountNumber(filename: string): string | null {
  try {
    // Remover extensión .pdf
    const nameWithoutExt = filename.replace(/\.pdf$/i, "");

    // Verificar que tenga al menos 6 caracteres (necesitamos hasta posición 5)
    if (nameWithoutExt.length < 6) {
      return null;
    }

    // Obtener caracteres de posición 2-5 (índices 2-5, 4 caracteres)
    // Ejemplo: 0063700097001400008565 -> posición 2-5 = "6370"
    const accountPart = nameWithoutExt.substring(2, 6);

    // Convertir a número para eliminar ceros a la izquierda, luego a string
    const accountNumber = parseInt(accountPart, 10).toString();

    // Validar que sea un número válido
    if (isNaN(parseInt(accountNumber))) {
      return null;
    }

    return accountNumber;
  } catch (error) {
    console.error("[DRIVE] Error extrayendo número de cuenta:", error);
    return null;
  }
}

/**
 * Determina si un mes/año usa la estructura antigua (facturas) o nueva (servicios/electricidad separadas)
 * Estructura antigua: "facturas-{mes}-{año}" (una sola carpeta)
 *   - Agosto, septiembre, octubre, diciembre 2025
 *   - Todo el año 2026 en adelante
 * Estructura nueva: "servicios-{mes}-{año}" y "electricidad-{mes}-{año}" (carpetas separadas)
 *   - Solo noviembre 2025
 */
function usesOldStructure(month: string, year: string): boolean {
  const monthNumber = getMonthNumber(month);
  const yearNumber = parseInt(year, 10);
  
  // Año 2026 en adelante: siempre estructura antigua (todo junto en facturas-{mes}-{año})
  if (yearNumber >= 2026) {
    return true;
  }
  
  // Año 2025: Noviembre es la única excepción (estructura nueva con carpetas separadas)
  if (yearNumber === 2025 && monthNumber) {
    // Noviembre 2025 es el único mes que usa estructura nueva (separada)
    if (monthNumber === 11) {
      return false; // Estructura nueva (servicios/electricidad separadas)
    }
    // Todos los demás meses de 2025 usan estructura antigua
    return true;
  }
  
  // Años anteriores a 2025 usan estructura antigua
  if (yearNumber < 2025) {
    return true;
  }
  
  // Por defecto, estructura antigua
  return true;
}

/**
 * Obtiene el nombre de la carpeta según el mes y tipo
 * Estructura antigua: "facturas-{mes}-{año}" (agosto, septiembre, octubre, diciembre 2025 y todo 2026+)
 * Estructura nueva: "servicios-{mes}-{año}" o "electricidad-{mes}-{año}" (solo noviembre 2025)
 */
function getFolderName(
  month: string,
  year: string,
  type: "servicios" | "electricidad"
): string | null {
  if (usesOldStructure(month, year)) {
    // Estructura antigua: una sola carpeta "facturas-{mes}-{año}"
    return `facturas-${month}-${year}`;
  } else {
    // Estructura nueva: carpetas separadas por tipo (solo noviembre 2025)
    return `${type}-${month}-${year}`;
  }
}

/**
 * Busca una carpeta en Google Drive por nombre
 * También intenta variantes con punto en lugar de guion (ej: "facturas-diciembre.2025")
 */
async function findFolderByName(folderName: string): Promise<string | null> {
  try {
    const drive = await getDriveClient();
    
    // Intentar primero con el nombre exacto
    let response = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
      fields: "files(id, name)",
    });
    
    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id!;
    }
    
    // Si no se encuentra, intentar con punto en lugar de guion (fallback para diciembre.2025)
    const variantName = folderName.replace(/-(\d{4})$/, '.$1'); // Reemplaza "-2025" con ".2025"
    if (variantName !== folderName) {
      response = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name='${variantName}' and trashed=false`,
        fields: "files(id, name)",
      });
      
      if (response.data.files && response.data.files.length > 0) {
        console.log(`[DRIVE] ✅ Encontrada carpeta con variante: ${variantName}`);
        return response.data.files[0].id!;
      }
    }

    return null;
  } catch (error) {
    console.error(`[DRIVE] ❌ Error buscando carpeta ${folderName}:`, error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Busca un PDF en una carpeta específica por número de cuenta
 */
async function searchPDFInFolder(
  folderId: string,
  accountNumber: string
): Promise<{ fileId: string; fileName: string } | null> {
  try {
    const drive = await getDriveClient();

    let nextPageToken: string | undefined = undefined;
    let totalChecked = 0;

    // Buscar con paginación para obtener todos los PDFs
    do {
      // Listar PDFs en la carpeta (con paginación)
      const response: any = await drive.files.list({
        q: `'${folderId}' in parents and mimeType='application/pdf' and trashed=false`,
        fields: "nextPageToken, files(id, name)",
        pageSize: 1000, // Máximo permitido por la API
        pageToken: nextPageToken,
      });

      const pdfs = response.data.files || [];
      const pdfCount = pdfs.length;

      if (pdfCount === 0 && totalChecked === 0) {
        return null;
      }
      
      // Buscar el PDF que coincida con el número de cuenta
      for (const file of pdfs) {
        totalChecked++;
        const extractedAccount = extractAccountNumber(file.name!);
        
        // Mostrar ejemplos de los primeros 5 PDFs para debugging
        if (totalChecked <= 5) {
          console.log(`[DRIVE] Ejemplo ${totalChecked}: ${file.name} -> cuenta extraída: "${extractedAccount}"`);
        }
        
        if (extractedAccount === accountNumber) {
          console.log(`[DRIVE] ✅ ENCONTRADO: ${file.name}`);
          return {
            fileId: file.id!,
            fileName: file.name!,
          };
        }
      }

      nextPageToken = response.data.nextPageToken || undefined;
    } while (nextPageToken);

    console.log(`[DRIVE] ❌ No encontrado (${totalChecked} archivos revisados)`);
    return null;
  } catch (error) {
    console.error("[DRIVE] ❌ Error:", error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Busca una factura en Google Drive por número de cuenta y mes/año
 */
export async function findInvoiceInDrive(
  accountNumber: string,
  month?: string,
  year?: string
): Promise<{
  fileId: string;
  fileName: string;
  type: "servicios" | "electricidad";
} | null> {
  try {
    // Si no se especifica mes/año, usar el mes actual
    const now = new Date();
    const targetMonth = month || getMonthName(now.getMonth() + 1);
    const targetYear = year || now.getFullYear().toString();

    console.log(`[DRIVE] 🔍 Buscando cuenta ${accountNumber} en ${targetMonth} ${targetYear}`);

    // Determinar qué estructura usar
    const isOldStructure = usesOldStructure(targetMonth, targetYear);

    if (isOldStructure) {
      // Estructura antigua: buscar en carpeta "facturas-{mes}-{año}"
      const folderName = `facturas-${targetMonth}-${targetYear}`;
      const folderId = await findFolderByName(folderName);

      if (folderId) {
        console.log(`[DRIVE] 📁 Buscando en: ${folderName}`);
        const pdf = await searchPDFInFolder(folderId, accountNumber);
        if (pdf) {
          // En estructura antigua, no sabemos si es servicios o electricidad
          // Usamos "servicios" como default, pero podría ser cualquiera
          console.log(`[DRIVE] ✅✅✅ ENCONTRADO: ${pdf.fileName} (facturas)`);
          return {
            fileId: pdf.fileId,
            fileName: pdf.fileName,
            type: "servicios", // Default, ya que en la estructura antigua están juntas
          };
        }
      } else {
        console.log(`[DRIVE] ⚠️ Carpeta ${folderName} no existe`);
      }
    } else {
      // Estructura nueva: buscar en carpetas separadas "servicios" y "electricidad"
      const types: Array<"servicios" | "electricidad"> = [
        "servicios",
        "electricidad",
      ];

      for (let i = 0; i < types.length; i++) {
        const type = types[i];
        const folderName = getFolderName(targetMonth, targetYear, type);
        if (!folderName) continue;

        const folderId = await findFolderByName(folderName);

        if (folderId) {
          console.log(`[DRIVE] 📁 Buscando en: ${folderName}`);
          const pdf = await searchPDFInFolder(folderId, accountNumber);
          if (pdf) {
            console.log(`[DRIVE] ✅✅✅ ENCONTRADO: ${pdf.fileName} (${type})`);
            return {
              fileId: pdf.fileId,
              fileName: pdf.fileName,
              type,
            };
          } else {
            if (i < types.length - 1) {
              console.log(`[DRIVE] ⚠️ No encontrado en ${type}, continuando con ${types[i + 1]}...`);
            }
          }
        } else {
          console.log(`[DRIVE] ⚠️ Carpeta ${folderName} no existe`);
          if (i < types.length - 1) {
            console.log(`[DRIVE] Continuando con ${types[i + 1]}...`);
          }
        }
      }
    }
    console.log(`[DRIVE] ❌ No encontrado en ${targetMonth} ${targetYear}`);

    // Si no se encuentra en el mes especificado, buscar en meses anteriores
    // Si el usuario especificó mes/año, solo buscar en ese mes. Si no, buscar hasta 6 meses atrás
    // (desde agosto 2025 en adelante según las carpetas disponibles)
    if (!month && !year) {
      console.log(`[DRIVE] 🔍 Buscando en meses anteriores...`);
      // Buscar hasta 6 meses atrás para cubrir desde agosto 2025
      const maxMonthsBack = 6;
      for (let i = 1; i <= maxMonthsBack; i++) {
        const pastDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const pastMonth = getMonthName(pastDate.getMonth() + 1);
        const pastYear = pastDate.getFullYear().toString();

        console.log(`[DRIVE] 🔍 Mes anterior ${i}: ${pastMonth} ${pastYear}`);
        
        const isPastOldStructure = usesOldStructure(pastMonth, pastYear);

        if (isPastOldStructure) {
          // Estructura antigua: buscar en carpeta "facturas-{mes}-{año}"
          const folderName = `facturas-${pastMonth}-${pastYear}`;
          const folderId = await findFolderByName(folderName);

          if (folderId) {
            console.log(`[DRIVE] 📁 Buscando en: ${folderName}`);
            const pdf = await searchPDFInFolder(folderId, accountNumber);
            if (pdf) {
              console.log(`[DRIVE] ✅✅✅ ENCONTRADO: ${pdf.fileName} (facturas)`);
              return {
                fileId: pdf.fileId,
                fileName: pdf.fileName,
                type: "servicios", // Default
              };
            }
          } else {
            console.log(`[DRIVE] ⚠️ Carpeta ${folderName} no existe`);
          }
        } else {
          // Estructura nueva: buscar en carpetas separadas
          const types: Array<"servicios" | "electricidad"> = [
            "servicios",
            "electricidad",
          ];

          for (let j = 0; j < types.length; j++) {
            const type = types[j];
            const folderName = getFolderName(pastMonth, pastYear, type);
            if (!folderName) continue;

            const folderId = await findFolderByName(folderName);

            if (folderId) {
              console.log(`[DRIVE] 📁 Buscando en: ${folderName}`);
              const pdf = await searchPDFInFolder(folderId, accountNumber);
              if (pdf) {
                console.log(`[DRIVE] ✅✅✅ ENCONTRADO: ${pdf.fileName} (${type})`);
                return {
                  fileId: pdf.fileId,
                  fileName: pdf.fileName,
                  type,
                };
              } else {
                if (j < types.length - 1) {
                  console.log(`[DRIVE] ⚠️ No encontrado en ${type}, continuando con ${types[j + 1]}...`);
                }
              }
            } else {
              console.log(`[DRIVE] ⚠️ Carpeta ${folderName} no existe`);
              if (j < types.length - 1) {
                console.log(`[DRIVE] Continuando con ${types[j + 1]}...`);
              }
            }
          }
        }
      }
    }

    console.log(`[DRIVE] ❌❌❌ NO ENCONTRADO para cuenta ${accountNumber}`);
    return null;
  } catch (error) {
    console.error("[DRIVE] ❌ Error:", error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Descarga un PDF desde Google Drive
 */
export async function downloadPDFFromDrive(fileId: string): Promise<Buffer> {
  try {
    const drive = await getDriveClient();
    const response = await drive.files.get(
      {
        fileId,
        alt: "media",
      },
      {
        responseType: "arraybuffer",
      }
    );

    return Buffer.from(response.data as ArrayBuffer);
  } catch (error) {
    console.error("Error descargando PDF desde Drive:", error);
    throw error;
  }
}

/**
 * Convierte número de mes a nombre en español
 */
function getMonthName(monthNumber: number): string {
  const months = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  return months[monthNumber - 1] || months[0];
}

/**
 * Convierte nombre de mes en español a número
 */
function getMonthNumber(monthName: string): number | null {
  const months: { [key: string]: number } = {
    enero: 1,
    febrero: 2,
    marzo: 3,
    abril: 4,
    mayo: 5,
    junio: 6,
    julio: 7,
    agosto: 8,
    septiembre: 9,
    octubre: 10,
    noviembre: 11,
    diciembre: 12,
  };

  const normalized = monthName.toLowerCase().trim();
  return months[normalized] || null;
}

/**
 * Extrae mes y año de un texto
 */
export function extractMonthAndYear(
  text: string
): { month?: string; year?: string } | null {
  const monthPattern =
    /(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i;
  const yearPattern = /(20\d{2})/;

  const monthMatch = text.match(monthPattern);
  const yearMatch = text.match(yearPattern);

  return {
    month: monthMatch ? monthMatch[1].toLowerCase() : undefined,
    year: yearMatch ? yearMatch[1] : undefined,
  };
}
