import { google } from "googleapis";
import type { JWT } from "google-auth-library";
import fs from "fs";
import path from "path";

// Inicializar Google Sheets API
let sheetsClient: any = null;
let driveClient: any = null;
let authInstance: any = null;
let jwtModule: any = null;

async function getAuth() {
  if (authInstance) {
    return authInstance;
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
        console.error("[SHEETS] ❌ Error: No se encontraron credenciales de Google");
        throw new Error(
          "No se encontraron credenciales de Google. Configura las variables de entorno GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL, GOOGLE_DRIVE_PRIVATE_KEY y GOOGLE_DRIVE_PROJECT_ID, o coloca el archivo keyapidrive.json en la raíz del proyecto."
        );
      }
    }

    // Importar JWT dinámicamente para evitar problemas de build
    if (!jwtModule) {
      jwtModule = await import("google-auth-library");
    }
    const { JWT } = jwtModule;

    authInstance = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: [
        "https://www.googleapis.com/auth/drive.readonly",
        "https://www.googleapis.com/auth/spreadsheets.readonly",
      ],
    });

    return authInstance;
  } catch (error) {
    console.error("[SHEETS] ❌ Error inicializando autenticación:", error instanceof Error ? error.message : error);
    throw error;
  }
}

async function getSheetsClient() {
  if (sheetsClient) {
    return sheetsClient;
  }

  const auth = await getAuth();
  sheetsClient = google.sheets({ version: "v4", auth });
  return sheetsClient;
}

async function getDriveClient() {
  if (driveClient) {
    return driveClient;
  }

  const auth = await getAuth();
  driveClient = google.drive({ version: "v3", auth });
  return driveClient;
}

/**
 * Busca una carpeta por nombre en Google Drive
 */
async function findFolderByName(folderName: string): Promise<string | null> {
  try {
    const drive = await getDriveClient();
    const response = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
      fields: "files(id, name)",
    });

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id!;
    }

    return null;
  } catch (error) {
    console.error(`[SHEETS] ❌ Error buscando carpeta ${folderName}:`, error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Busca un Google Sheet por nombre, opcionalmente dentro de una carpeta específica
 */
async function findSheetByName(sheetName: string, folderName?: string): Promise<string | null> {
  try {
    const drive = await getDriveClient();
    
    // Si se especifica una carpeta, buscar primero la carpeta
    let folderId: string | null = null;
    if (folderName) {
      folderId = await findFolderByName(folderName);
      if (!folderId) {
        console.error(`[SHEETS] ❌ No se encontró la carpeta "${folderName}"`);
        return null;
      }
      console.log(`[SHEETS] ✅ Carpeta encontrada: "${folderName}" (ID: ${folderId})`);
    }

    // Construir la query de búsqueda
    let query = `name='${sheetName}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`;
    if (folderId) {
      query += ` and '${folderId}' in parents`;
    }

    const response = await drive.files.list({
      q: query,
      fields: "files(id, name)",
    });

    if (response.data.files && response.data.files.length > 0) {
      console.log(`[SHEETS] ✅ Sheet encontrado: "${response.data.files[0].name}" (ID: ${response.data.files[0].id})`);
      return response.data.files[0].id!;
    }

    return null;
  } catch (error) {
    console.error(`[SHEETS] ❌ Error buscando sheet ${sheetName}:`, error instanceof Error ? error.message : error);
    if (error instanceof Error && error.message.includes("DECODER")) {
      console.error(`[SHEETS] ⚠️ Error de decodificación de clave privada. Verifica el formato de GOOGLE_DRIVE_PRIVATE_KEY`);
    }
    return null;
  }
}

/**
 * Busca un usuario por número de cuenta en el sheet usuarios_totales
 */
export async function buscarUsuarioPorCuenta(
  numeroCuenta: string
): Promise<{ titular: string; telefono: string } | null> {
  try {
    const sheets = await getSheetsClient();
    
    // Buscar el sheet por nombre dentro de la carpeta "socios Procoop"
    const sheetId = await findSheetByName("usuarios_totales", "socios Procoop");
    
    if (!sheetId) {
      console.error("[SHEETS] ❌ No se encontró el sheet usuarios_totales en la carpeta 'socios Procoop'");
      // Intentar buscar sin especificar carpeta como fallback
      const sheetIdFallback = await findSheetByName("usuarios_totales");
      if (sheetIdFallback) {
        console.log("[SHEETS] ✅ Sheet encontrado sin especificar carpeta");
        return await buscarUsuarioPorCuentaEnSheet(sheets, sheetIdFallback, numeroCuenta);
      }
      return null;
    }
    
    return await buscarUsuarioPorCuentaEnSheet(sheets, sheetId, numeroCuenta);
  } catch (error) {
    console.error("[SHEETS] ❌ Error buscando usuario:", error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Busca un usuario por número de cuenta en un sheet específico
 */
async function buscarUsuarioPorCuentaEnSheet(
  sheets: any,
  sheetId: string,
  numeroCuenta: string
): Promise<{ titular: string; telefono: string } | null> {
  try {

    console.log(`[SHEETS] 🔍 Buscando cuenta ${numeroCuenta} en sheet ${sheetId}`);

    // Leer todos los datos del sheet (asumiendo que la primera hoja contiene los datos)
    // Usamos un rango amplio para asegurarnos de leer todos los datos
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "A:C", // Columnas A (número de cuenta), B (titular), C (teléfono)
    });

    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      console.error("[SHEETS] ❌ El sheet está vacío");
      return null;
    }

    // Buscar la fila que coincida con el número de cuenta
    // Normalizar el número de cuenta para comparación (eliminar espacios, convertir a string)
    const cuentaNormalizada = numeroCuenta.trim().toString();

    // Empezar desde la fila 1 (índice 0) por si hay encabezados
    // Si la primera fila parece ser encabezados (contiene texto como "Número de cuenta", "Titular", etc.), empezamos desde la fila 2
    let startRow = 0;
    if (rows.length > 0 && rows[0]) {
      const firstRow = rows[0].map((cell: any) => cell?.toString().toLowerCase() || "");
      const hasHeaders = firstRow.some((cell: string) => 
        cell.includes("cuenta") || cell.includes("titular") || cell.includes("teléfono") || cell.includes("telefono")
      );
      if (hasHeaders) {
        startRow = 1;
        console.log("[SHEETS] 📋 Detectada fila de encabezados, comenzando búsqueda desde la fila 2");
      }
    }

    for (let i = startRow; i < rows.length; i++) {
      const row = rows[i];
      
      // Verificar que la fila tenga al menos una columna
      if (!row || row.length === 0) continue;

      // Comparar el número de cuenta (primera columna)
      const cuentaEnSheet = row[0]?.toString().trim();
      
      if (cuentaEnSheet === cuentaNormalizada) {
        const titular = row[1]?.toString().trim() || "";
        const telefono = row[2]?.toString().trim() || "";
        
        console.log(`[SHEETS] ✅ Usuario encontrado en fila ${i + 1}: ${titular} - ${telefono}`);
        
        return {
          titular,
          telefono,
        };
      }
    }

    console.log(`[SHEETS] ❌ No se encontró usuario con cuenta ${numeroCuenta}`);
    return null;
  } catch (error) {
    console.error("[SHEETS] ❌ Error buscando usuario:", error instanceof Error ? error.message : error);
    return null;
  }
}

