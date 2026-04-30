"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Paperclip, Send } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Verificando acceso...</span>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso no autorizado</CardTitle>
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <Button asChild variant="ghost" className="px-2">
          <Link href="/conversaciones" className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a conversaciones
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Nueva conversación WhatsApp</CardTitle>
            <p className="text-sm text-gray-600">
              Envía un mensaje manual y, opcionalmente, adjunta un PDF o una
              imagen.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Número de teléfono</label>
                <Input
                  placeholder="Ej: 5493521401330"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  disabled={submitting}
                />
                <p className="text-xs text-gray-500">
                  Usa formato internacional sin espacios (solo dígitos).
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mensaje</label>
                <textarea
                  className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Escribe el texto del mensaje a enviar..."
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  disabled={submitting}
                />
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
                />
                <p className="text-xs text-gray-500">
                  Formatos permitidos: PDF, JPG, PNG, WEBP. Máximo 15MB.
                </p>
                {attachment && (
                  <div className="inline-flex items-center gap-2 rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                    <Paperclip className="h-3.5 w-3.5" />
                    {attachment.name}
                  </div>
                )}
              </div>

              {errorMessage && (
                <p className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-600">
                  {errorMessage}
                </p>
              )}

              {successMessage && (
                <p className="rounded border border-green-200 bg-green-50 p-2 text-sm text-green-700">
                  {successMessage}
                </p>
              )}

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
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
      </div>
    </div>
  );
}
