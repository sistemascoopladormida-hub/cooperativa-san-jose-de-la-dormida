"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Star,
  Clock,
  UserCheck,
  Smile,
  MessageSquare,
  Send,
} from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

interface RespuestasEncuesta {
  calificacionGeneral: string;
  puntualidad: string;
  profesionalismo: string;
  resolucionProblema: string;
  amabilidad: string;
  comentarios: string;
}

export default function EncuestaPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [encuestaData, setEncuestaData] = useState<{
    numeroCuenta: string;
    titular: string;
    tipoServicio: string;
  } | null>(null);

  const [respuestas, setRespuestas] = useState<RespuestasEncuesta>({
    calificacionGeneral: "",
    puntualidad: "",
    profesionalismo: "",
    resolucionProblema: "",
    amabilidad: "",
    comentarios: "",
  });

  useEffect(() => {
    if (token) {
      cargarEncuesta();
    }
  }, [token]);

  const cargarEncuesta = async () => {
    try {
      const response = await fetch(`/api/encuesta/${token}`);
      const data = await response.json();

      if (data.success && data.encuesta) {
        setEncuestaData({
          numeroCuenta: data.encuesta.numeroCuenta,
          titular: data.encuesta.titular,
          tipoServicio: data.encuesta.tipoServicio,
        });
      } else {
        setError(data.error || "Error al cargar la encuesta. El enlace puede ser inválido o haber expirado.");
      }

      setLoading(false);
    } catch (error) {
      console.error("Error cargando encuesta:", error);
      setError("Error al cargar la encuesta. El enlace puede ser inválido o haber expirado.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que todas las preguntas obligatorias estén respondidas
    if (
      !respuestas.calificacionGeneral ||
      !respuestas.puntualidad ||
      !respuestas.profesionalismo ||
      !respuestas.resolucionProblema ||
      !respuestas.amabilidad
    ) {
      setError("Por favor responde todas las preguntas obligatorias");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/encuesta/${token}/enviar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(respuestas),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || "Error al enviar la encuesta. Por favor intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error enviando encuesta:", error);
      setError("Error al enviar la encuesta. Por favor intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const ComponenteEstrellas = ({
    valor,
    onChange,
    label,
  }: {
    valor: string;
    onChange: (valor: string) => void;
    label: string;
  }) => {
    const calificacion = valor ? parseInt(valor) : 0;

    return (
      <div className="space-y-3">
        <Label className="text-base font-semibold">{label}</Label>
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          {[1, 2, 3, 4, 5].map((estrella) => (
            <motion.button
              key={estrella}
              type="button"
              onClick={() => onChange(estrella.toString())}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="focus:outline-none"
            >
              <Star
                className={`h-10 w-10 sm:h-12 sm:w-12 transition-all ${
                  estrella <= calificacion
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-300"
                }`}
              />
            </motion.button>
          ))}
        </div>
        {calificacion > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-gray-600 dark:text-gray-400"
          >
            {calificacion === 1 && "Muy insatisfecho"}
            {calificacion === 2 && "Insatisfecho"}
            {calificacion === 3 && "Neutro"}
            {calificacion === 4 && "Satisfecho"}
            {calificacion === 5 && "Muy satisfecho"}
          </motion.p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando encuesta...</p>
        </motion.div>
      </div>
    );
  }

  if (error && !submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
              <p className="text-gray-600">{error}</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
        <Header />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full"
          >
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="mb-6"
                >
                  <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                  </div>
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  ¡Gracias por tu opinión!
                </h2>
                <p className="text-gray-600 mb-6">
                  Tu encuesta ha sido enviada exitosamente. Tu opinión es muy valiosa para nosotros y nos ayuda a mejorar nuestros servicios.
                </p>
                <Button
                  onClick={() => router.push("/")}
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white"
                >
                  Volver al inicio
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <Header />

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 border-b text-center p-4 sm:p-6">
              <div className="flex justify-center mb-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full"
                >
                  <Wrench className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 dark:text-blue-400" />
                </motion.div>
              </div>
              <CardTitle className="text-xl sm:text-2xl md:text-3xl">
                Encuesta de Satisfacción
              </CardTitle>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2">
                Tu opinión es muy importante para nosotros
              </p>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 md:p-8">
              {encuestaData && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 mb-1">Servicio</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {encuestaData.tipoServicio}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 mb-1">Número de cuenta</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {encuestaData.numeroCuenta}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 mb-1">Titular</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 break-words">
                        {encuestaData.titular}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                {/* Calificación General */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <ComponenteEstrellas
                    valor={respuestas.calificacionGeneral}
                    onChange={(valor) =>
                      setRespuestas({ ...respuestas, calificacionGeneral: valor })
                    }
                    label="Calificación General del Servicio *"
                  />
                </motion.div>

                {/* Puntualidad */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-3"
                >
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    ¿El técnico llegó en el período establecido? *
                  </Label>
                  <RadioGroup
                    value={respuestas.puntualidad}
                    onValueChange={(valor) =>
                      setRespuestas({ ...respuestas, puntualidad: valor })
                    }
                    className="grid grid-cols-2 gap-3"
                  >
                    {[
                      { valor: "si", label: "Sí" },
                      { valor: "no", label: "No" },
                    ].map((opcion) => (
                      <div key={opcion.valor} className="flex items-center space-x-2">
                        <RadioGroupItem value={opcion.valor} id={opcion.valor} />
                        <Label
                          htmlFor={opcion.valor}
                          className="text-sm sm:text-base cursor-pointer font-normal"
                        >
                          {opcion.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </motion.div>

                {/* Profesionalismo */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-3"
                >
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                    Profesionalismo del técnico *
                  </Label>
                  <RadioGroup
                    value={respuestas.profesionalismo}
                    onValueChange={(valor) =>
                      setRespuestas({ ...respuestas, profesionalismo: valor })
                    }
                    className="grid grid-cols-2 sm:grid-cols-5 gap-3"
                  >
                    {[
                      { valor: "excelente", label: "Excelente" },
                      { valor: "muy_bueno", label: "Muy bueno" },
                      { valor: "bueno", label: "Bueno" },
                      { valor: "regular", label: "Regular" },
                      { valor: "malo", label: "Malo" },
                    ].map((opcion) => (
                      <div key={opcion.valor} className="flex items-center space-x-2">
                        <RadioGroupItem value={opcion.valor} id={opcion.valor} />
                        <Label
                          htmlFor={opcion.valor}
                          className="text-sm cursor-pointer font-normal"
                        >
                          {opcion.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </motion.div>

                {/* Resolución del problema */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3"
                >
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    ¿Se resolvió el problema? *
                  </Label>
                  <RadioGroup
                    value={respuestas.resolucionProblema}
                    onValueChange={(valor) =>
                      setRespuestas({ ...respuestas, resolucionProblema: valor })
                    }
                    className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                  >
                    {[
                      { valor: "si_completamente", label: "Sí, completamente" },
                      { valor: "si_parcialmente", label: "Sí, parcialmente" },
                      { valor: "no", label: "No" },
                    ].map((opcion) => (
                      <div key={opcion.valor} className="flex items-center space-x-2">
                        <RadioGroupItem value={opcion.valor} id={opcion.valor} />
                        <Label
                          htmlFor={opcion.valor}
                          className="text-sm cursor-pointer font-normal"
                        >
                          {opcion.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </motion.div>

                {/* Amabilidad */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <ComponenteEstrellas
                    valor={respuestas.amabilidad}
                    onChange={(valor) =>
                      setRespuestas({ ...respuestas, amabilidad: valor })
                    }
                    label="Amabilidad y trato del técnico *"
                  />
                </motion.div>

                {/* Comentarios adicionales */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-2"
                >
                  <Label htmlFor="comentarios" className="text-base font-semibold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    Comentarios adicionales (opcional)
                  </Label>
                  <Textarea
                    id="comentarios"
                    placeholder="¿Tienes algún comentario adicional sobre la visita técnica?"
                    value={respuestas.comentarios}
                    onChange={(e) =>
                      setRespuestas({ ...respuestas, comentarios: e.target.value })
                    }
                    rows={4}
                    className="resize-none"
                  />
                </motion.div>

                {/* Mensaje de error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Botón de envío */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="pt-4"
                >
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-14 sm:h-16 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Enviar Encuesta
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
