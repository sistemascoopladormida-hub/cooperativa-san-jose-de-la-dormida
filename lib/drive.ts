import { google } from "googleapis";
import { JWT } from "google-auth-library";
import fs from "fs";
import path from "path";

// Inicializar Google Drive API
let driveClient: any = null;

function getDriveClient() {
  if (driveClient) {
    return driveClient;
  }

  try {
    // Leer credenciales desde el archivo JSON
    const credentialsPath = path.join(process.cwd(), "keyapidrive.json");
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));

    const auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    driveClient = google.drive({ version: "v3", auth });
    return driveClient;
  } catch (error) {
    console.error("Error inicializando Google Drive:", error);
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
      return null;
    }

    // Obtener caracteres de posición 2-5 (índices 1-4)
    const accountPart = nameWithoutExt.substring(1, 5);

    // Convertir a número para eliminar ceros a la izquierda, luego a string
    const accountNumber = parseInt(accountPart, 10).toString();

    // Validar que sea un número válido
    if (isNaN(parseInt(accountNumber))) {
      return null;
    }

    return accountNumber;
  } catch (error) {
    console.error("Error extrayendo número de cuenta:", error);
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
    const drive = getDriveClient();
    const response = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
      fields: "files(id, name)",
    });

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id!;
    }

    return null;
  } catch (error) {
    console.error(`Error buscando carpeta ${folderName}:`, error);
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
    const drive = getDriveClient();

    // Listar todos los PDFs en la carpeta
    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/pdf' and trashed=false`,
      fields: "files(id, name)",
    });

    if (!response.data.files || response.data.files.length === 0) {
      return null;
    }

    // Buscar el PDF que coincida con el número de cuenta
    for (const file of response.data.files) {
      const extractedAccount = extractAccountNumber(file.name!);
      if (extractedAccount === accountNumber) {
        return {
          fileId: file.id!,
          fileName: file.name!,
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Error buscando PDF en carpeta:", error);
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

    // Buscar en ambas carpetas
    const types: Array<"servicios" | "electricidad"> = [
      "servicios",
      "electricidad",
    ];

    for (const type of types) {
      const folderName = getFolderName(targetMonth, targetYear, type);
      const folderId = await findFolderByName(folderName);

      if (folderId) {
        const pdf = await searchPDFInFolder(folderId, accountNumber);
        if (pdf) {
          return {
            fileId: pdf.fileId,
            fileName: pdf.fileName,
            type,
          };
        }
      }
    }

    // Si no se encuentra en el mes especificado, buscar en meses anteriores (hasta 3 meses atrás)
    if (!month && !year) {
      for (let i = 1; i <= 3; i++) {
        const pastDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const pastMonth = getMonthName(pastDate.getMonth() + 1);
        const pastYear = pastDate.getFullYear().toString();

        for (const type of types) {
          const folderName = getFolderName(pastMonth, pastYear, type);
          const folderId = await findFolderByName(folderName);

          if (folderId) {
            const pdf = await searchPDFInFolder(folderId, accountNumber);
            if (pdf) {
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

    return null;
  } catch (error) {
    console.error("Error buscando factura en Drive:", error);
    return null;
  }
}

/**
 * Descarga un PDF desde Google Drive
 */
export async function downloadPDFFromDrive(
  fileId: string
): Promise<Buffer> {
  try {
    const drive = getDriveClient();
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

