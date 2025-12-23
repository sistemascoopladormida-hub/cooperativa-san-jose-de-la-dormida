"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Lock,
  Sparkles,
  LogOut,
  Wrench,
  User,
  Phone,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function VisitasTecnicasPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [numeroCuenta, setNumeroCuenta] = useState("");
  const [servicio, setServicio] = useState("");
  const [loadingData, setLoadingData] = useState(false);
  const [titular, setTitular] = useState("");
  const [telefono, setTelefono] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/visitas-tecnicas/check-auth");
      const data = await response.json();
      setAuthenticated(data.authenticated);
    } catch (error) {
      setAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/visitas-tecnicas/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        setAuthenticated(true);
        setPassword("");
      } else {
        setError(data.error || "Contraseña incorrecta");
      }
    } catch (error) {
      setError("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/visitas-tecnicas/auth", { method: "DELETE" });
    setAuthenticated(false);
    setNumeroCuenta("");
    setServicio("");
    setTitular("");
    setTelefono("");
    setSuccess(false);
  };

  const handleBuscarCuenta = async () => {
    if (!numeroCuenta.trim()) {
      setError("Por favor ingresa un número de cuenta");
      return;
    }

    setLoadingData(true);
    setError("");
    setTitular("");
    setTelefono("");

    try {
      const response = await fetch("/api/visitas-tecnicas/buscar-usuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numeroCuenta: numeroCuenta.trim() }),
      });

      const data = await response.json();

      if (data.success && data.usuario) {
        setTitular(data.usuario.titular);
        setTelefono(data.usuario.telefono);
        setError("");
      } else {
        setError(data.error || "No se encontró usuario con ese número de cuenta");
        setTitular("");
        setTelefono("");
      }
    } catch (error) {
      console.error("Error buscando usuario:", error);
      setError("Error al buscar la cuenta. Por favor intenta nuevamente.");
      setTitular("");
      setTelefono("");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!numeroCuenta.trim() || !servicio) {
      setError("Por favor completa todos los campos");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // TODO: Implementar envío de encuesta
      // Por ahora simulamos el envío
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setSuccess(true);
      setNumeroCuenta("");
      setServicio("");
      setTitular("");
      setTelefono("");
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      setError("Error al enviar la encuesta");
    } finally {
      setSubmitting(false);
    }
  };

  // Página de login
  if (authenticated === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 relative overflow-hidden">
        {/* Logo de fondo */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 dark:opacity-10 pointer-events-none">
          <Image
            src="/images/logocoopnuevo.png"
            alt="Logo fondo"
            width={600}
            height={600}
            className="object-contain"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex justify-center mb-4"
              >
                <div className="relative">
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    <Image
                      src="/images/logocoopnuevo.png"
                      alt="Cooperativa La Dormida"
                      width={80}
                      height={80}
                      className="mx-auto"
                    />
                  </motion.div>
                  <motion.div
                    className="absolute -top-2 -right-2"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Sparkles className="h-6 w-6 text-yellow-400" />
                  </motion.div>
                </div>
              </motion.div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Acceso Técnico
              </CardTitle>
              <p className="text-sm text-gray-500 mt-2">
                Ingresa la contraseña para acceder al formulario de visitas técnicas
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="Ingresa la contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 h-12 text-lg"
                      autoFocus
                    />
                  </div>
                </motion.div>
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-2 rounded"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    type="submit"
                    className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="mr-2"
                      >
                        <Lock className="h-5 w-5" />
                      </motion.div>
                    ) : (
                      "Ingresar"
                    )}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Cargando
  if (authenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        {/* Logo de fondo */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 dark:opacity-10 pointer-events-none">
          <Image
            src="/images/logocoopnuevo.png"
            alt="Logo fondo"
            width={600}
            height={600}
            className="object-contain"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
            className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-gray-600 font-medium"
          >
            Verificando acceso...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Página principal del formulario
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Logo de fondo grande */}
      <div className="fixed inset-0 flex items-center justify-center opacity-[0.09] dark:opacity-[0.07] pointer-events-none z-0">
        <Image
          src="/images/logocoopnuevo.png"
          alt="Logo fondo"
          width={800}
          height={800}
          className="object-contain"
        />
      </div>

      {/* Header personalizado */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10 shadow-sm"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image
                  src="/images/logocoopnuevo.png"
                  alt="Cooperativa La Dormida"
                  width={48}
                  height={48}
                  className="rounded-lg shadow-md"
                />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Formulario de Visitas Técnicas
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Registro de visitas y envío de encuestas
                </p>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Salir
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6 md:py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                >
                  <Wrench className="h-5 w-5 text-blue-600" />
                </motion.div>
                Registro de Visita Técnica
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Número de cuenta */}
                <div className="space-y-2">
                  <Label htmlFor="numeroCuenta" className="text-base font-semibold">
                    Número de Cuenta *
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="numeroCuenta"
                      type="text"
                      placeholder="Ingresa el número de cuenta"
                      value={numeroCuenta}
                      onChange={(e) => setNumeroCuenta(e.target.value)}
                      className="flex-1 h-12 text-lg"
                    />
                    <Button
                      type="button"
                      onClick={handleBuscarCuenta}
                      disabled={loadingData || !numeroCuenta.trim()}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      {loadingData ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        "Buscar"
                      )}
                    </Button>
                  </div>
                </div>

                {/* Información del titular (se llena automáticamente) */}
                {(titular || telefono) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                  >
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <User className="h-5 w-5" />
                      <span className="font-semibold">Información del Titular</span>
                    </div>
                    {titular && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          <strong>Titular:</strong> {titular}
                        </span>
                      </div>
                    )}
                    {telefono && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          <strong>Teléfono:</strong> {telefono}
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Tipo de servicio */}
                <div className="space-y-2">
                  <Label htmlFor="servicio" className="text-base font-semibold">
                    Tipo de Servicio Brindado *
                  </Label>
                  <Select value={servicio} onValueChange={setServicio}>
                    <SelectTrigger id="servicio" className="h-12 text-lg">
                      <SelectValue placeholder="Selecciona el tipo de servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internet">Internet</SelectItem>
                      <SelectItem value="electricidad">Electricidad</SelectItem>
                      <SelectItem value="pfc">PFC (Plan de Financiamiento Colectivo)</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Mensajes de error */}
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

                {/* Mensaje de éxito */}
                <AnimatePresence>
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3"
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <p className="text-sm text-green-700 dark:text-green-300 font-semibold">
                        ¡Visita registrada exitosamente! La encuesta ha sido enviada al usuario.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Botón de envío */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    disabled={submitting || !numeroCuenta.trim() || !servicio}
                    className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Enviando encuesta...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Confirmar Visita y Enviar Encuesta
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

