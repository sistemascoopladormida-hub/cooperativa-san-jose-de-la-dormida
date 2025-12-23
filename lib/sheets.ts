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
      // Manejar diferentes formatos de clave privada
      let privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY;
      
      // Si la clave viene con \\n, reemplazarlos por saltos de línea reales
      if (privateKey.includes("\\n")) {
        privateKey = privateKey.replace(/\\n/g, "\n");
      }
      
      // Si la clave viene sin los encabezados BEGIN/END, agregarlos si es necesario
      if (!privateKey.includes("BEGIN PRIVATE KEY") && !privateKey.includes("BEGIN RSA PRIVATE KEY")) {
        // La clave debería tener los encabezados, pero si no los tiene, intentamos usarla tal cual
        console.log("[SHEETS] ⚠️ La clave privada no parece tener encabezados BEGIN/END");
      }
      
      credentials = {
        client_email: process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL,
        private_key: privateKey,
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
 * Busca un Google Sheet por nombre
 */
async function findSheetByName(sheetName: string): Promise<string | null> {
  try {
    const drive = await getDriveClient();
    
    console.log(`[SHEETS] 🔍 Buscando sheet: "${sheetName}"`);
    
    // Primera búsqueda: nombre exacto con comillas (Google Sheets)
    let response = await drive.files.list({
      q: `name='${sheetName}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      fields: "files(id, name)",
    });

    if (response.data.files && response.data.files.length > 0) {
      console.log(`[SHEETS] ✅ Sheet encontrado (búsqueda exacta): "${response.data.files[0].name}" (ID: ${response.data.files[0].id})`);
      return response.data.files[0].id!;
    }

    // Segunda búsqueda: nombre exacto sin comillas (más flexible)
    response = await drive.files.list({
      q: `name='${sheetName}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      fields: "files(id, name)",
    });

    // Tercera búsqueda: contiene el nombre (case-insensitive)
    response = await drive.files.list({
      q: `name contains '${sheetName}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      fields: "files(id, name)",
    });

    if (response.data.files && response.data.files.length > 0) {
      // Buscar coincidencia exacta (case-insensitive)
      const exactMatch = response.data.files.find(
        (file: any) => file.name?.toLowerCase() === sheetName.toLowerCase()
      );
      
      if (exactMatch) {
        console.log(`[SHEETS] ✅ Sheet encontrado (búsqueda flexible): "${exactMatch.name}" (ID: ${exactMatch.id})`);
        return exactMatch.id!;
      }
      
      console.log(`[SHEETS] ⚠️ Se encontraron ${response.data.files.length} sheets con nombre similar:`);
      response.data.files.forEach((file: any, index: number) => {
        console.log(`[SHEETS]   ${index + 1}. "${file.name}" (ID: ${file.id})`);
      });
    }

    // Buscar archivos Excel (.xlsx)
    const excelResponse = await drive.files.list({
      q: `name contains '${sheetName}' and (mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' or mimeType='application/vnd.ms-excel') and trashed=false`,
      fields: "files(id, name)",
    });

    if (excelResponse.data.files && excelResponse.data.files.length > 0) {
      const exactMatch = excelResponse.data.files.find(
        (file: any) => file.name?.toLowerCase() === sheetName.toLowerCase()
      );
      
      if (exactMatch) {
        console.log(`[SHEETS] ✅ Archivo Excel encontrado: "${exactMatch.name}" (ID: ${exactMatch.id})`);
        console.log(`[SHEETS] ⚠️ Nota: Los archivos Excel (.xlsx) deben convertirse a Google Sheets para poder leerlos`);
        return exactMatch.id!;
      }
    }

    // Si no se encuentra, listar todos los sheets disponibles para debugging
    console.log(`[SHEETS] 🔍 Listando todos los Google Sheets disponibles...`);
    const allSheetsResponse = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      fields: "files(id, name)",
      pageSize: 50,
    });

    if (allSheetsResponse.data.files && allSheetsResponse.data.files.length > 0) {
      console.log(`[SHEETS] 📋 Google Sheets disponibles (${allSheetsResponse.data.files.length}):`);
      allSheetsResponse.data.files.forEach((file: any, index: number) => {
        const match = file.name?.toLowerCase().includes(sheetName.toLowerCase()) ? " ⭐ POSIBLE COINCIDENCIA" : "";
        console.log(`[SHEETS]   ${index + 1}. "${file.name}" (ID: ${file.id})${match}`);
      });
    } else {
      console.log(`[SHEETS] ⚠️ No se encontraron Google Sheets accesibles por el Service Account`);
      console.log(`[SHEETS] ⚠️ Verifica que el Service Account tenga acceso al sheet "${sheetName}"`);
      console.log(`[SHEETS] ⚠️ Email del Service Account: ${process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL || 'No configurado'}`);
    }

    return null;
  } catch (error) {
    console.error(`[SHEETS] ❌ Error buscando sheet ${sheetName}:`, error instanceof Error ? error.message : error);
    if (error instanceof Error && error.message.includes("DECODER")) {
      console.error(`[SHEETS] ⚠️ Error de decodificación de clave privada. Verifica el formato de GOOGLE_DRIVE_PRIVATE_KEY`);
      console.error(`[SHEETS] ⚠️ La clave debe estar en formato PEM con saltos de línea correctos (\\n)`);
    }
    if (error instanceof Error) {
      console.error(`[SHEETS] ❌ Stack trace:`, error.stack);
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
    
    // Buscar el sheet por nombre (intentar con y sin extensión)
    let sheetId = await findSheetByName("usuarios_totales");
    
    // Si no se encuentra, intentar con extensión .xlsx
    if (!sheetId) {
      console.log("[SHEETS] 🔍 Intentando buscar con extensión .xlsx...");
      sheetId = await findSheetByName("usuarios_totales.xlsx");
    }
    
    if (!sheetId) {
      console.error("[SHEETS] ❌ No se encontró el sheet usuarios_totales");
      console.error("[SHEETS] 💡 Verifica que:");
      console.error("[SHEETS]   1. El sheet esté compartido con: drive-service-account@our-sign-480404-c3.iam.gserviceaccount.com");
      console.error("[SHEETS]   2. El nombre del sheet sea exactamente 'usuarios_totales'");
      console.error("[SHEETS]   3. El Service Account tenga permisos de lectura");
      return null;
    }

    console.log(`[SHEETS] 🔍 Buscando cuenta ${numeroCuenta} en sheet ${sheetId}`);

    // Leer todos los datos del sheet (asumiendo que la primera hoja contiene los datos)
    // Usamos un rango amplio para asegurarnos de leer todos los datos
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "A:Z", // Leemos hasta la columna Z para tener margen
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

