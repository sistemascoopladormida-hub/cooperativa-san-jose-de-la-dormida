import { google } from "googleapis";
import type { JWT } from "google-auth-library";
import fs from "fs";
import path from "path";

// Inicializar Google Drive API
let driveClient: any = null;
let jwtModule: any = null;

async function getDriveClient() {
  if (driveClient) {
    console.log("[DRIVE] Usando cliente Drive existente");
    return driveClient;
  }

  try {
    console.log("[DRIVE] Inicializando cliente Drive...");
    let credentials: any;

    // Intentar leer desde variables de entorno primero (producción)
    if (
      process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_DRIVE_PRIVATE_KEY &&
      process.env.GOOGLE_DRIVE_PROJECT_ID
    ) {
      console.log("[DRIVE] ✅ Credenciales encontradas en variables de entorno");
      credentials = {
        client_email: process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        project_id: process.env.GOOGLE_DRIVE_PROJECT_ID,
      };
      console.log("[DRIVE] Email:", credentials.client_email);
      console.log("[DRIVE] Project ID:", credentials.project_id);
      console.log("[DRIVE] Private Key length:", credentials.private_key.length);
    } else {
      console.log("[DRIVE] ⚠️ Variables de entorno no encontradas, intentando leer desde archivo JSON...");
      // Fallback: leer desde archivo JSON (desarrollo local)
      try {
        const credentialsPath = path.join(process.cwd(), "keyapidrive.json");
        credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));
        console.log("[DRIVE] ✅ Credenciales leídas desde archivo JSON");
      } catch (fileError) {
        console.error("[DRIVE] ❌ Error leyendo archivo JSON:", fileError);
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
    console.log("[DRIVE] ✅ Cliente Drive inicializado correctamente");
    return driveClient;
  } catch (error) {
    console.error("[DRIVE] ❌ Error inicializando Google Drive:", error);
    if (error instanceof Error) {
      console.error("[DRIVE] Error details:", error.message, error.stack);
    }
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

    // Verificar que tenga al menos 5 caracteres
    if (nameWithoutExt.length < 5) {
      console.log(`[DRIVE] ⚠️ Nombre de archivo muy corto: ${filename} (${nameWithoutExt.length} caracteres)`);
      return null;
    }

    // Obtener caracteres de posición 2-5 (índices 1-4)
    const accountPart = nameWithoutExt.substring(1, 5);
    console.log(`[DRIVE] Extracción: ${filename} -> parte (1-4): "${accountPart}"`);

    // Convertir a número para eliminar ceros a la izquierda, luego a string
    const accountNumber = parseInt(accountPart, 10).toString();

    // Validar que sea un número válido
    if (isNaN(parseInt(accountNumber))) {
      console.log(`[DRIVE] ⚠️ No se pudo convertir a número: ${accountPart}`);
      return null;
    }

    console.log(`[DRIVE] Cuenta extraída: ${filename} -> ${accountNumber}`);
    return accountNumber;
  } catch (error) {
    console.error("[DRIVE] Error extrayendo número de cuenta:", error);
    return null;
  }
}

/**
 * Obtiene el nombre de la carpeta según el mes y tipo
 * Formato: "servicios-[mes]-[año]" o "electricidad-[mes]-[año]"
 */
function getFolderName(
  month: string,
  year: string,
  type: "servicios" | "electricidad"
): string {
  return `${type}-${month}-${year}`;
}

/**
 * Busca una carpeta en Google Drive por nombre
 */
async function findFolderByName(folderName: string): Promise<string | null> {
  try {
    console.log(`[DRIVE] Buscando carpeta: ${folderName}`);
    const drive = await getDriveClient();
    const response = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
      fields: "files(id, name)",
    });

    console.log(`[DRIVE] Resultado búsqueda carpeta ${folderName}:`, response.data.files?.length || 0, "carpetas encontradas");
    
    if (response.data.files && response.data.files.length > 0) {
      console.log(`[DRIVE] Carpeta encontrada: ${folderName} (ID: ${response.data.files[0].id})`);
      return response.data.files[0].id!;
    }

    console.log(`[DRIVE] Carpeta no encontrada: ${folderName}`);
    return null;
  } catch (error) {
    console.error(`[DRIVE] Error buscando carpeta ${folderName}:`, error);
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
    console.log(`[DRIVE] Buscando PDF con cuenta ${accountNumber} en carpeta ${folderId}`);
    const drive = await getDriveClient();

    // Listar todos los PDFs en la carpeta
    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/pdf' and trashed=false`,
      fields: "files(id, name)",
    });

    const pdfCount = response.data.files?.length || 0;
    console.log(`[DRIVE] PDFs encontrados en carpeta: ${pdfCount}`);

    if (!response.data.files || response.data.files.length === 0) {
      console.log(`[DRIVE] No hay PDFs en la carpeta ${folderId}`);
      return null;
    }

    // Buscar el PDF que coincida con el número de cuenta
    console.log(`[DRIVE] Comparando ${pdfCount} PDFs con cuenta ${accountNumber}...`);
    for (const file of response.data.files) {
      const extractedAccount = extractAccountNumber(file.name!);
      console.log(`[DRIVE] PDF: ${file.name} -> Cuenta extraída: ${extractedAccount}`);
      if (extractedAccount === accountNumber) {
        console.log(`[DRIVE] ✅ PDF encontrado: ${file.name} (ID: ${file.id})`);
        return {
          fileId: file.id!,
          fileName: file.name!,
        };
      }
    }

    console.log(`[DRIVE] ❌ No se encontró PDF con cuenta ${accountNumber} en esta carpeta`);
    return null;
  } catch (error) {
    console.error("[DRIVE] Error buscando PDF en carpeta:", error);
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
    console.log(`[DRIVE] Iniciando búsqueda de factura - Cuenta: ${accountNumber}, Mes: ${month || "no especificado"}, Año: ${year || "no especificado"}`);
    
    // Si no se especifica mes/año, usar el mes actual
    const now = new Date();
    const targetMonth = month || getMonthName(now.getMonth() + 1);
    const targetYear = year || now.getFullYear().toString();

    console.log(`[DRIVE] Mes objetivo: ${targetMonth}, Año objetivo: ${targetYear}`);

    // Buscar en ambas carpetas
    const types: Array<"servicios" | "electricidad"> = [
      "servicios",
      "electricidad",
    ];

    for (const type of types) {
      const folderName = getFolderName(targetMonth, targetYear, type);
      console.log(`[DRIVE] Buscando en carpeta: ${folderName}`);
      const folderId = await findFolderByName(folderName);

      if (folderId) {
        const pdf = await searchPDFInFolder(folderId, accountNumber);
        if (pdf) {
          console.log(`[DRIVE] ✅ Factura encontrada: ${pdf.fileName} (tipo: ${type})`);
          return {
            fileId: pdf.fileId,
            fileName: pdf.fileName,
            type,
          };
        }
      } else {
        console.log(`[DRIVE] Carpeta no encontrada: ${folderName}`);
      }
    }

    // Si no se encuentra en el mes especificado, buscar en meses anteriores (hasta 3 meses atrás)
    if (!month && !year) {
      console.log(`[DRIVE] No se encontró en ${targetMonth} ${targetYear}, buscando en meses anteriores...`);
      for (let i = 1; i <= 3; i++) {
        const pastDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const pastMonth = getMonthName(pastDate.getMonth() + 1);
        const pastYear = pastDate.getFullYear().toString();

        console.log(`[DRIVE] Buscando en mes anterior ${i}: ${pastMonth} ${pastYear}`);
        for (const type of types) {
          const folderName = getFolderName(pastMonth, pastYear, type);
          const folderId = await findFolderByName(folderName);

          if (folderId) {
            const pdf = await searchPDFInFolder(folderId, accountNumber);
            if (pdf) {
              console.log(`[DRIVE] ✅ Factura encontrada en mes anterior: ${pdf.fileName} (tipo: ${type})`);
              return {
                fileId: pdf.fileId,
                fileName: pdf.fileName,
                type,
              };
            }
          }
        }
      }
    }

    console.log(`[DRIVE] ❌ No se encontró factura para cuenta ${accountNumber}`);
    return null;
  } catch (error) {
    console.error("[DRIVE] Error buscando factura en Drive:", error);
    if (error instanceof Error) {
      console.error("[DRIVE] Error details:", error.message, error.stack);
    }
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
