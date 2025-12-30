import { NextRequest, NextResponse } from "next/server";
import { generarTokenEncuesta } from "@/lib/encuestas";
import { enviarMensajeEncuesta } from "@/lib/whatsapp-encuestas";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { numeroCuenta, titular, telefono, servicio } = await request.json();

    // Validar datos requeridos
    if (!numeroCuenta || !titular || !telefono || !servicio) {
      return NextResponse.json(
        { success: false, error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Generar token único para la encuesta
    const token = generarTokenEncuesta();

    // Construir URL de la encuesta
    // Prioridad: NEXT_PUBLIC_SITE_URL > dominio fijo > VERCEL_URL > localhost
    let baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
    
    // Si no está configurado, usar el dominio de producción
    if (!baseUrl) {
      // En producción usar el dominio real, en desarrollo localhost
      if (process.env.NODE_ENV === "production") {
        baseUrl = "https://cooperativaladormida.com";
      } else {
        baseUrl = process.env.VERCEL_URL || "http://localhost:3000";
      }
    }
    
    // Asegurar que la URL tenga protocolo
    if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
      // Si es localhost, usar http, sino https
      if (baseUrl.includes("localhost")) {
        baseUrl = `http://${baseUrl}`;
      } else {
        baseUrl = `https://${baseUrl}`;
      }
    }
    
    // Asegurar que no tenga barra final
    baseUrl = baseUrl.replace(/\/$/, "");
    
    const urlEncuesta = `${baseUrl}/encuesta/${token}`;
    
    console.log("[API] URL de encuesta generada:", urlEncuesta);
    console.log("[API] Teléfono recibido:", telefono);

    // Guardar la encuesta en la base de datos
    const { data: encuesta, error: dbError } = await supabase
      .from("encuestas_visitas")
      .insert({
        token: token,
        numero_cuenta: numeroCuenta,
        titular: titular,
        telefono: telefono,
        tipo_servicio: servicio,
        url_encuesta: urlEncuesta,
        estado: "pendiente",
        creado_en: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error("[API] Error guardando encuesta:", dbError);
      // Si no existe la tabla, continuamos igual (modo desarrollo)
      console.log("[API] Continuando sin guardar en BD (modo desarrollo)");
    }

    // Enviar mensaje de WhatsApp usando la plantilla aprobada
    const resultadoWhatsApp = await enviarMensajeEncuesta(
      telefono,
      titular,
      servicio,
      numeroCuenta,
      urlEncuesta,
      true // Usar plantilla aprobada de Meta
    );

    if (!resultadoWhatsApp.success) {
      console.error("[API] Error enviando WhatsApp:", resultadoWhatsApp.error);
      
      // Si falló el envío pero se guardó en BD, actualizar estado
      if (encuesta) {
        await supabase
          .from("encuestas_visitas")
          .update({ estado: "error_envio", error: resultadoWhatsApp.error })
          .eq("token", token);
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: "Error al enviar el mensaje de WhatsApp",
          detalles: resultadoWhatsApp.error 
        },
        { status: 500 }
      );
    }

    // Actualizar estado a "enviado" si se guardó en BD
    if (encuesta) {
      await supabase
        .from("encuestas_visitas")
        .update({ 
          estado: "enviado",
          mensaje_id: resultadoWhatsApp.messageId,
          enviado_en: new Date().toISOString(),
        })
        .eq("token", token);
    }

    return NextResponse.json({
      success: true,
      token: token,
      urlEncuesta: urlEncuesta,
      messageId: resultadoWhatsApp.messageId,
    });
  } catch (error) {
    console.error("[API] Error confirmando visita:", error);
    return NextResponse.json(
      { success: false, error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}

