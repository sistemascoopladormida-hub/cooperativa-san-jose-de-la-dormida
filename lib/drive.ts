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
 * Capitaliza la primera letra del mes (ej: "septiembre" -> "Septiembre")
 */
function capitalizeMonth(month: string): string {
  if (!month) return month;
  return month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
}

/**
 * Carpeta(s) candidata(s) para estructura antigua.
 * Caso especial operativo:
 * - Periodo marzo 2026 fue facturado el 1 de abril 2026 y se almaceno en "facturas-Abril-2026".
 */
function getOldStructureFolderCandidates(month: string, year: string): string[] {
  const normalizedMonth = month.toLowerCase().trim();
  const candidates: string[] = [];

  if (normalizedMonth === "marzo" && year === "2026") {
    candidates.push("facturas-Abril-2026");
  }

  candidates.push(`facturas-${capitalizeMonth(month)}-${year}`);
  return [...new Set(candidates)];
}

/**
 * Obtiene el nombre de la carpeta según el mes y tipo
 * Estructura antigua: "facturas-{Mes}-{año}" (septiembre, octubre, noviembre, diciembre 2025 y todo 2026+)
 * Estructura nueva: "servicios-{mes}-{año}" o "electricidad-{mes}-{año}" (solo noviembre 2025)
 * NOTA: Las carpetas ahora están dentro de "Ordenadores > MI PC > Facturas"
 */
function getFolderName(
  month: string,
  year: string,
  type: "servicios" | "electricidad"
): string | null {
  if (usesOldStructure(month, year)) {
    // Estructura antigua: una sola carpeta "facturas-{Mes}-{año}" (con mayúscula inicial en el mes)
    const capitalizedMonth = capitalizeMonth(month);
    return `facturas-${capitalizedMonth}-${year}`;
  } else {
    // Estructura nueva: carpetas separadas por tipo (solo noviembre 2025)
    return `${type}-${month}-${year}`;
  }
}

/**
 * Busca la carpeta padre "Facturas" dentro de "Ordenadores > MI PC > Facturas"
 */
async function findFacturasParentFolder(): Promise<string | null> {
  try {
    const drive = await getDriveClient();
    
    // Buscar la carpeta "Facturas" (puede haber varias, pero buscamos la que está en la ruta correcta)
    let response = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='Facturas' and trashed=false`,
      fields: "files(id, name)",
    });
    
    if (response.data.files && response.data.files.length > 0) {
      // Si hay múltiples carpetas "Facturas", intentar encontrar la correcta
      // Por ahora, devolvemos la primera (asumiendo que solo hay una en esa ubicación)
      // Si hay problemas, se puede mejorar buscando por la jerarquía completa
      console.log(`[DRIVE] ✅ Carpeta padre "Facturas" encontrada`);
      return response.data.files[0].id!;
    }

    console.log(`[DRIVE] ⚠️ Carpeta padre "Facturas" no encontrada`);
    return null;
  } catch (error) {
    console.error(`[DRIVE] ❌ Error buscando carpeta padre "Facturas":`, error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Busca una carpeta en Google Drive por nombre dentro de una carpeta padre
 * También intenta variantes con punto en lugar de guion (ej: "facturas-diciembre.2025")
 */
async function findFolderByName(folderName: string, parentFolderId?: string | null): Promise<string | null> {
  try {
    const drive = await getDriveClient();
    
    // Construir la query: buscar carpeta con el nombre específico
    // Si se especifica parentFolderId, buscar solo dentro de esa carpeta
    let query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
    if (parentFolderId) {
      query += ` and '${parentFolderId}' in parents`;
    }
    
    // Intentar primero con el nombre exacto
    let response = await drive.files.list({
      q: query,
      fields: "files(id, name)",
    });
    
    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id!;
    }
    
    // Si no se encuentra, intentar con punto en lugar de guion (fallback para diciembre.2025)
    const variantName = folderName.replace(/-(\d{4})$/, '.$1'); // Reemplaza "-2025" con ".2025"
    if (variantName !== folderName) {
      let variantQuery = `mimeType='application/vnd.google-apps.folder' and name='${variantName}' and trashed=false`;
      if (parentFolderId) {
        variantQuery += ` and '${parentFolderId}' in parents`;
      }
      
      response = await drive.files.list({
        q: variantQuery,
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
 * @param accountNumber - Número de cuenta (3-4 dígitos)
 * @param month - Mes en español (ej: "noviembre")
 * @param year - Año (ej: "2025")
 * @param requestedType - Tipo de factura solicitado ("servicios" o "electricidad"). Si se especifica, busca primero en esa carpeta.
 */
export async function findInvoiceInDrive(
  accountNumber: string,
  month?: string,
  year?: string,
  requestedType?: "servicios" | "electricidad"
): Promise<{
  fileId: string;
  fileName: string;
  type: "servicios" | "electricidad";
} | null> {
  try {
    // Si no se especifica mes/año, usar el mes actual
    const now = new Date();
    const currentYearNum = now.getFullYear();
    const currentMonthNum = now.getMonth() + 1; // 1-12
    
    let targetMonth = month || getMonthName(currentMonthNum);
    let targetYear = year;
    
    // Si no se especificó año, inferirlo basándose en el mes solicitado
    if (!targetYear) {
      const monthNames = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
      ];
      const requestedMonthNum = monthNames.indexOf(targetMonth.toLowerCase()) + 1;
      
      // Si el mes solicitado es mayor que el mes actual, debe ser del año anterior
      // Ejemplo: estamos en enero 2026, si piden noviembre, debe ser noviembre 2025
      if (requestedMonthNum > currentMonthNum) {
        targetYear = (currentYearNum - 1).toString();
        console.log(`[DRIVE] 📅 Año inferido: ${targetMonth} debe ser ${targetYear} (mes solicitado ${requestedMonthNum} > mes actual ${currentMonthNum})`);
      } else {
        // Por defecto, usar el año actual
        targetYear = currentYearNum.toString();
      }
    }

    console.log(`[DRIVE] 🔍 Buscando cuenta ${accountNumber} en ${targetMonth} ${targetYear}`);

    // Primero buscar la carpeta padre "Facturas" dentro de "Ordenadores > MI PC > Facturas"
    const facturasParentId = await findFacturasParentFolder();
    if (!facturasParentId) {
      console.log(`[DRIVE] ⚠️ No se encontró la carpeta padre "Facturas"`);
      // Continuar de todas formas, por si acaso las carpetas están en otro lugar
    }

    // Determinar qué estructura usar
    const isOldStructure = usesOldStructure(targetMonth, targetYear);

    if (isOldStructure) {
      // Estructura antigua: buscar por carpeta candidata
      const candidateFolders = getOldStructureFolderCandidates(targetMonth, targetYear);
      for (const folderName of candidateFolders) {
        const folderId = await findFolderByName(folderName, facturasParentId);
        if (folderId) {
          console.log(`[DRIVE] 📁 Buscando en: ${folderName}`);
          const pdf = await searchPDFInFolder(folderId, accountNumber);
          if (pdf) {
            // En estructura antigua, no sabemos si es servicios o electricidad
            console.log(`[DRIVE] ✅✅✅ ENCONTRADO: ${pdf.fileName} (facturas)`);
            return {
              fileId: pdf.fileId,
              fileName: pdf.fileName,
              type: "servicios",
            };
          }
        } else {
          console.log(`[DRIVE] ⚠️ Carpeta ${folderName} no existe`);
        }
      }
    } else {
      // Estructura nueva: buscar en carpetas separadas "servicios" y "electricidad"
      // Si el usuario especificó un tipo, buscar primero en esa carpeta
      let types: Array<"servicios" | "electricidad">;
      if (requestedType) {
        // Buscar primero en el tipo solicitado, luego en el otro
        types = [requestedType, requestedType === "servicios" ? "electricidad" : "servicios"];
        console.log(`[DRIVE] 🔍 Tipo solicitado: ${requestedType}, buscando primero en esa carpeta`);
      } else {
        // Si no se especificó tipo, buscar en ambas
        types = ["servicios", "electricidad"];
      }

      for (let i = 0; i < types.length; i++) {
        const type = types[i];
        const folderName = getFolderName(targetMonth, targetYear, type);
        if (!folderName) continue;

        const folderId = await findFolderByName(folderName, facturasParentId);

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
    // (desde septiembre 2025 en adelante según las carpetas disponibles)
    if (!month && !year) {
      console.log(`[DRIVE] 🔍 Buscando en meses anteriores...`);
      // Buscar hasta 6 meses atrás para cubrir desde septiembre 2025
      const maxMonthsBack = 6;
      for (let i = 1; i <= maxMonthsBack; i++) {
        const pastDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const pastMonth = getMonthName(pastDate.getMonth() + 1);
        const pastYear = pastDate.getFullYear().toString();

        console.log(`[DRIVE] 🔍 Mes anterior ${i}: ${pastMonth} ${pastYear}`);
        
        const isPastOldStructure = usesOldStructure(pastMonth, pastYear);

        if (isPastOldStructure) {
          const candidateFolders = getOldStructureFolderCandidates(pastMonth, pastYear);
          for (const folderName of candidateFolders) {
            const folderId = await findFolderByName(folderName, facturasParentId);
            if (folderId) {
              console.log(`[DRIVE] 📁 Buscando en: ${folderName}`);
              const pdf = await searchPDFInFolder(folderId, accountNumber);
              if (pdf) {
                console.log(`[DRIVE] ✅✅✅ ENCONTRADO: ${pdf.fileName} (facturas)`);
                return {
                  fileId: pdf.fileId,
                  fileName: pdf.fileName,
                  type: "servicios",
                };
              }
            } else {
              console.log(`[DRIVE] ⚠️ Carpeta ${folderName} no existe`);
            }
          }
        } else {
          // Estructura nueva: buscar en carpetas separadas
          // Si el usuario especificó un tipo, buscar primero en esa carpeta
          let types: Array<"servicios" | "electricidad">;
          if (requestedType) {
            types = [requestedType, requestedType === "servicios" ? "electricidad" : "servicios"];
          } else {
            types = ["servicios", "electricidad"];
          }

          for (let j = 0; j < types.length; j++) {
            const type = types[j];
            const folderName = getFolderName(pastMonth, pastYear, type);
            if (!folderName) continue;

            const folderId = await findFolderByName(folderName, facturasParentId);

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
