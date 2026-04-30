"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  ImageIcon,
  Loader2,
  Paperclip,
  Send,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;

function normalizePhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/[^\d]/g, "");
}

export default function NuevaConversacionPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const cleanPhonePreview = normalizePhoneNumber(phoneNumber);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/conversaciones/check-auth");
        const data = await response.json();
        setAuthenticated(Boolean(data.authenticated));
      } catch (error) {
        setAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const handleAttachmentChange = (file: File | null) => {
    if (!file) {
      setAttachment(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage("El archivo supera el límite de 15MB.");
      setAttachment(null);
      return;
    }

    if (
      file.type !== "application/pdf" &&
      !file.type.startsWith("image/")
    ) {
      setErrorMessage("Solo se permiten archivos PDF o imágenes.");
      setAttachment(null);
      return;
    }

    setErrorMessage("");
    setAttachment(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const cleanPhoneNumber = normalizePhoneNumber(phoneNumber);
    if (!cleanPhoneNumber) {
      setErrorMessage("Ingresa un número de teléfono válido.");
      return;
    }

    if (!message.trim()) {
      setErrorMessage("El mensaje no puede estar vacío.");
      return;
    }

    const payload = new FormData();
    payload.append("phoneNumber", cleanPhoneNumber);
    payload.append("message", message.trim());
    if (attachment) {
      payload.append("attachment", attachment);
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/conversaciones/start", {
        method: "POST",
        body: payload,
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "No se pudo iniciar la conversación.");
      }

      setSuccessMessage(
        attachment
          ? "Mensaje y adjunto enviados correctamente por WhatsApp."
          : "Mensaje enviado correctamente por WhatsApp."
      );
      setPhoneNumber("");
      setMessage("");
      setAttachment(null);
    } catch (error: any) {
      setErrorMessage(
        error?.message ||
          "Ocurrió un error al enviar el mensaje. Intenta nuevamente."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (authenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex items-center gap-2 rounded-xl border bg-white/80 px-4 py-3 text-gray-700 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          <span className="font-medium">Verificando acceso...</span>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              Acceso no autorizado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Debes iniciar sesión en el módulo de conversaciones antes de
              acceder a esta pantalla.
            </p>
            <Button asChild className="w-full">
              <Link href="/conversaciones">Ir a conversaciones</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/40 to-indigo-50/40 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-6 relative overflow-hidden">
      <div className="fixed inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none">
        <Image
          src="/images/logocoopnuevo.png"
          alt="Logo Cooperativa"
          width={780}
          height={780}
          className="object-contain"
        />
      </div>

      <div className="mx-auto w-full max-w-4xl space-y-5 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3"
        >
          <Button asChild variant="ghost" className="px-2">
            <Link
              href="/conversaciones"
              className="inline-flex items-center gap-2 text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a conversaciones
            </Link>
          </Button>
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs text-gray-600 shadow-sm border">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Sesión autenticada
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-white/60 bg-white/80 shadow-xl backdrop-blur-sm"
        >
          <div className="p-4 md:p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-2xl text-white">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-white p-2.5 border border-white/30">
                <Image
                  src="/images/logocoopnuevo.png"
                  alt="Cooperativa La Dormida"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">
                  Iniciar conversación WhatsApp
                </h1>
                <p className="text-sm text-white/90">
                  Envía un mensaje manual con adjunto opcional al usuario.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 md:p-6">
            <Card className="lg:col-span-2 border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Datos del envío</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Número de teléfono destino
                    </label>
                    <Input
                      placeholder="Ej: 5493521401330"
                      value={phoneNumber}
                      onChange={(event) => setPhoneNumber(event.target.value)}
                      disabled={submitting}
                      className="h-11"
                    />
                    <p className="text-xs text-gray-500">
                      Formato internacional, solo dígitos (sin +, sin espacios).
                    </p>
                    {cleanPhonePreview && (
                      <p className="text-xs text-indigo-700 bg-indigo-50 inline-flex rounded px-2 py-1">
                        Se enviará a: {cleanPhonePreview}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mensaje</label>
                    <textarea
                      className="min-h-36 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Escribe el mensaje que quieres enviar por WhatsApp..."
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      disabled={submitting}
                    />
                    <div className="flex justify-end">
                      <span className="text-xs text-gray-500">
                        {message.trim().length} caracteres
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Adjuntar archivo (opcional)
                    </label>
                    <Input
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={(event) =>
                        handleAttachmentChange(event.target.files?.[0] || null)
                      }
                      disabled={submitting}
                      className="h-11"
                    />
                    <p className="text-xs text-gray-500">
                      Formatos permitidos: PDF, JPG, PNG, WEBP (máximo 15MB).
                    </p>
                    {attachment && (
                      <div className="inline-flex items-center gap-2 rounded-lg border bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700">
                        <Paperclip className="h-3.5 w-3.5" />
                        {attachment.name}
                      </div>
                    )}
                  </div>

                  {errorMessage && (
                    <p className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-sm text-red-700">
                      {errorMessage}
                    </p>
                  )}

                  {successMessage && (
                    <p className="rounded-lg border border-green-200 bg-green-50 p-2.5 text-sm text-green-700 inline-flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      {successMessage}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-11 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando por WhatsApp...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar por WhatsApp
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border shadow-sm bg-white/90">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Guía rápida</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="rounded-lg border bg-emerald-50/70 border-emerald-100 p-3">
                  <p className="font-medium text-emerald-700 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Recomendación
                  </p>
                  <p className="mt-1 text-xs">
                    Envía un texto claro y corto. Si adjuntas archivo, menciona
                    en el mensaje qué contiene.
                  </p>
                </div>
                <div className="rounded-lg border bg-indigo-50/70 border-indigo-100 p-3">
                  <p className="font-medium text-indigo-700 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF
                  </p>
                  <p className="mt-1 text-xs">
                    Ideal para informes formales. Se envía como documento.
                  </p>
                </div>
                <div className="rounded-lg border bg-orange-50/70 border-orange-100 p-3">
                  <p className="font-medium text-orange-700 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Imagen
                  </p>
                  <p className="mt-1 text-xs">
                    Útil para capturas, comprobantes o material visual.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
