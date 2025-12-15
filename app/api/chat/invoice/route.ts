import { NextRequest, NextResponse } from "next/server";
import { downloadPDFFromDrive } from "@/lib/drive";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fileId = searchParams.get("fileId");
    const fileName = searchParams.get("fileName") || "factura.pdf";

    if (!fileId) {
      return NextResponse.json(
        { error: "Parámetro fileId es requerido" },
        { status: 400 }
      );
    }

    const pdfBuffer = await downloadPDFFromDrive(fileId);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("[CHAT INVOICE] Error descargando factura:", error);
    return NextResponse.json(
      { error: "Error al descargar la factura" },
      { status: 500 }
    );
  }
}


