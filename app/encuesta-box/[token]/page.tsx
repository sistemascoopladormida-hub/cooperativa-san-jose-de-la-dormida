"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Star,
  Clock,
  UserCheck,
  MessageSquare,
  Send,
  User,
  Building2,
} from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

interface RespuestasEncuesta {
  calificacionGeneral: string;
  atencion: string;
  amabilidad: string;
  resolucionProblema: string;
  tiempoEspera: string;
  comentarios: string;
}

export default function EncuestaBoxPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [empleadoData, setEmpleadoData] = useState<{
    nombre: string;
    boxNumero: number;
  } | null>(null);

  const [respuestas, setRespuestas] = useState<RespuestasEncuesta>({
    calificacionGeneral: "",
    atencion: "",
    amabilidad: "",
    resolucionProblema: "",
    tiempoEspera: "",
    comentarios: "",
  });

  useEffect(() => {
    if (token) {
      cargarEncuesta();
    }
  }, [token]);

  const cargarEncuesta = async () => {
    try {
      const response = await fetch(`/api/encuesta-box/${token}`);
      const data = await response.json();

      if (data.success && data.empleado) {
        setEmpleadoData({
          nombre: data.empleado.nombre,
          boxNumero: data.empleado.boxNumero,
        });
      } else {
        setError(
          data.error ||
            "Error al cargar la encuesta. El enlace puede ser inválido o haber expirado."
        );
      }

      setLoading(false);
    } catch (error) {
      console.error("Error cargando encuesta:", error);
      setError(
        "Error al cargar la encuesta. El enlace puede ser inválido o haber expirado."
      );
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que todas las preguntas obligatorias estén respondidas
    if (
      !respuestas.calificacionGeneral ||
      !respuestas.atencion ||
      !respuestas.amabilidad ||
      !respuestas.resolucionProblema ||
      !respuestas.tiempoEspera
    ) {
      setError("Por favor responde todas las preguntas obligatorias");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/encuesta-box/${token}/enviar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          respuestas: respuestas,
          comentarios: respuestas.comentarios,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        setError(
          data.error || "Error al enviar la encuesta. Por favor intenta nuevamente."
        );
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
      <div className="space-y-4">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </Label>
        <div className="flex items-center justify-center gap-3">
          {[1, 2, 3, 4, 5].map((estrella) => (
            <button
              key={estrella}
              type="button"
              onClick={() => onChange(estrella.toString())}
              className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-1 transition-transform hover:scale-110 active:scale-95"
              aria-label={`Calificar ${estrella} de 5`}
            >
              <Star
                className={`h-8 w-8 sm:h-10 sm:w-10 transition-colors ${
                  estrella <= calificacion
                    ? "fill-amber-400 text-amber-400"
                    : "fill-gray-200 text-gray-300 dark:fill-gray-700 dark:text-gray-600"
                }`}
              />
            </button>
          ))}
        </div>
        {calificacion > 0 && (
          <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400">
            {calificacion === 1 && "Muy insatisfecho"}
            {calificacion === 2 && "Insatisfecho"}
            {calificacion === 3 && "Neutro"}
            {calificacion === 4 && "Satisfecho"}
            {calificacion === 5 && "Muy satisfecho"}
          </p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Cargando encuesta...
          </p>
        </div>
      </div>
    );
  }

  if (error && !submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Error
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full"
          >
            <Card className="border shadow-lg">
              <CardContent className="p-10 text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center"
                >
                  <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                </motion.div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    ¡Gracias por tu opinión!
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Tu encuesta ha sido enviada exitosamente. Tu opinión es muy valiosa
                    para nosotros y nos ayuda a mejorar nuestros servicios.
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
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

  const progress = [
    respuestas.calificacionGeneral,
    respuestas.atencion,
    respuestas.amabilidad,
    respuestas.resolucionProblema,
    respuestas.tiempoEspera,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="container mx-auto px-4 pt-12 pb-8 md:py-12 max-w-4xl">
        {/* Header de la encuesta */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Encuesta de Satisfacción - Box de Atención
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tu opinión nos ayuda a mejorar nuestros servicios de atención
          </p>
        </div>

        {/* Información del empleado */}
        {empleadoData && (
          <Card className="mb-8 border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Información de atención
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Empleado que te atendió
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    {empleadoData.nombre}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Box de atención
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Box {empleadoData.boxNumero}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Barra de progreso */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progreso
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {progress} de 5 preguntas
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(progress / 5) * 100}%` }}
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            />
          </div>
        </div>

        {/* Formulario */}
        <Card className="border shadow-sm">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Calificación General */}
              <div className="space-y-4">
                <Separator />
                <ComponenteEstrellas
                  valor={respuestas.calificacionGeneral}
                  onChange={(valor) =>
                    setRespuestas({ ...respuestas, calificacionGeneral: valor })
                  }
                  label="Calificación general de la atención recibida *"
                />
              </div>

              {/* Tiempo de espera */}
              <div className="space-y-4">
                <Separator />
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      ¿Cómo evalúas el tiempo de espera? *
                    </Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                      Considera el tiempo que esperaste antes de ser atendido
                    </p>
                  </div>
                  <RadioGroup
                    value={respuestas.tiempoEspera}
                    onValueChange={(valor) =>
                      setRespuestas({ ...respuestas, tiempoEspera: valor })
                    }
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    {[
                      {
                        valor: "muy_rapido",
                        label: "Muy rápido",
                        desc: "Fui atendido inmediatamente",
                      },
                      {
                        valor: "adecuado",
                        label: "Tiempo adecuado",
                        desc: "Esperé menos de 10 minutos",
                      },
                      {
                        valor: "tardio",
                        label: "Llegó tarde",
                        desc: "Esperé entre 10-20 minutos",
                      },
                      {
                        valor: "muy_tardio",
                        label: "Muy tarde",
                        desc: "Esperé más de 20 minutos",
                      },
                    ].map((opcion) => (
                      <div
                        key={opcion.valor}
                        className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                        onClick={() =>
                          setRespuestas({ ...respuestas, tiempoEspera: opcion.valor })
                        }
                      >
                        <RadioGroupItem
                          value={opcion.valor}
                          id={opcion.valor}
                          className="mt-1"
                        />
                        <Label
                          htmlFor={opcion.valor}
                          className="text-sm cursor-pointer font-normal text-gray-700 dark:text-gray-300 flex-1"
                        >
                          <div className="font-medium mb-1">{opcion.label}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {opcion.desc}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              {/* Atención recibida */}
              <div className="space-y-4">
                <Separator />
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-gray-500" />
                    Calidad de la atención recibida *
                  </Label>
                  <RadioGroup
                    value={respuestas.atencion}
                    onValueChange={(valor) =>
                      setRespuestas({ ...respuestas, atencion: valor })
                    }
                    className="grid grid-cols-2 sm:grid-cols-5 gap-4"
                  >
                    {[
                      { valor: "excelente", label: "Excelente" },
                      { valor: "muy_buena", label: "Muy buena" },
                      { valor: "buena", label: "Buena" },
                      { valor: "regular", label: "Regular" },
                      { valor: "mala", label: "Mala" },
                    ].map((opcion) => (
                      <div
                        key={opcion.valor}
                        className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <RadioGroupItem value={opcion.valor} id={opcion.valor} />
                        <Label
                          htmlFor={opcion.valor}
                          className="text-sm cursor-pointer font-normal text-gray-700 dark:text-gray-300 flex-1"
                        >
                          {opcion.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              {/* Resolución del problema */}
              <div className="space-y-4">
                <Separator />
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gray-500" />
                    ¿Se resolvió tu consulta o problema? *
                  </Label>
                  <RadioGroup
                    value={respuestas.resolucionProblema}
                    onValueChange={(valor) =>
                      setRespuestas({ ...respuestas, resolucionProblema: valor })
                    }
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                  >
                    {[
                      { valor: "si_completamente", label: "Sí, completamente" },
                      { valor: "si_parcialmente", label: "Sí, parcialmente" },
                      { valor: "no", label: "No" },
                    ].map((opcion) => (
                      <div
                        key={opcion.valor}
                        className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <RadioGroupItem value={opcion.valor} id={opcion.valor} />
                        <Label
                          htmlFor={opcion.valor}
                          className="text-sm cursor-pointer font-normal text-gray-700 dark:text-gray-300 flex-1"
                        >
                          {opcion.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              {/* Amabilidad */}
              <div className="space-y-4">
                <Separator />
                <ComponenteEstrellas
                  valor={respuestas.amabilidad}
                  onChange={(valor) =>
                    setRespuestas({ ...respuestas, amabilidad: valor })
                  }
                  label="Amabilidad y trato del empleado *"
                />
              </div>

              {/* Comentarios adicionales */}
              <div className="space-y-4">
                <Separator />
                <div className="space-y-3">
                  <Label
                    htmlFor="comentarios"
                    className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                    Comentarios adicionales
                    <span className="text-xs font-normal text-gray-500">
                      (opcional)
                    </span>
                  </Label>
                  <Textarea
                    id="comentarios"
                    placeholder="Comparte cualquier comentario adicional sobre la atención recibida..."
                    value={respuestas.comentarios}
                    onChange={(e) =>
                      setRespuestas({ ...respuestas, comentarios: e.target.value })
                    }
                    rows={5}
                    className="resize-none border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Mensaje de error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3"
                  >
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Botón de envío */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={submitting || progress < 5}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Enviando encuesta...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Enviar encuesta
                    </>
                  )}
                </Button>
                {progress < 5 && (
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
                    Por favor completa todas las preguntas obligatorias para continuar
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
