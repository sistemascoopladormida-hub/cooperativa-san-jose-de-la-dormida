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
  Search,
  FileText,
  AlertCircle,
  X,
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
    
    if (!numeroCuenta.trim() || !servicio || !titular || !telefono) {
      setError("Por favor completa todos los campos y busca el número de cuenta");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/visitas-tecnicas/confirmar-visita", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numeroCuenta: numeroCuenta.trim(),
          titular: titular,
          telefono: telefono,
          servicio: servicio,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setNumeroCuenta("");
        setServicio("");
        setTitular("");
        setTelefono("");
        
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      } else {
        setError(data.error || "Error al enviar la encuesta");
      }
    } catch (error) {
      console.error("Error confirmando visita:", error);
      setError("Error al enviar la encuesta. Por favor intenta nuevamente.");
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

      {/* Header personalizado - Mobile First */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10 shadow-sm"
      >
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0"
              >
                <Image
                  src="/images/logocoopnuevo.png"
                  alt="Cooperativa La Dormida"
                  width={40}
                  height={40}
                  className="sm:w-12 sm:h-12 rounded-lg shadow-md"
                />
              </motion.div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent truncate">
                  Visitas Técnicas
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:flex items-center gap-1">
                  <Wrench className="h-3 w-3" />
                  Registro de visitas
                </p>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 text-xs sm:text-sm px-2 sm:px-4"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 relative z-10 pb-20 sm:pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto space-y-4 sm:space-y-6"
        >
          <Card className="shadow-xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 border-b p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
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
                <span className="hidden sm:inline">Registro de Visita Técnica</span>
                <span className="sm:hidden">Nueva Visita</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Número de cuenta */}
                <div className="space-y-2">
                  <Label htmlFor="numeroCuenta" className="text-sm sm:text-base font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Número de Cuenta *
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="numeroCuenta"
                        type="text"
                        inputMode="numeric"
                        placeholder="Ej: 1234"
                        value={numeroCuenta}
                        onChange={(e) => {
                          setNumeroCuenta(e.target.value);
                          setError("");
                          setTitular("");
                          setTelefono("");
                        }}
                        className="pl-10 h-12 sm:h-14 text-base sm:text-lg"
                        autoComplete="off"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleBuscarCuenta}
                      disabled={loadingData || !numeroCuenta.trim()}
                      className="w-full sm:w-auto h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-base sm:text-lg font-semibold shadow-md hover:shadow-lg transition-all"
                    >
                      {loadingData ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          <span className="hidden sm:inline">Buscando...</span>
                          <span className="sm:hidden">Buscando</span>
                        </>
                      ) : (
                        <>
                          <Search className="h-5 w-5 mr-2" />
                          Buscar
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Información del titular - Diseño mejorado */}
                <AnimatePresence>
                  {(titular || telefono) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 border-2 border-blue-200 dark:border-blue-700 shadow-lg"
                    >
                      {/* Decoración de fondo */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 dark:bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200/20 dark:bg-indigo-500/10 rounded-full -ml-12 -mb-12 blur-2xl" />
                      
                      <div className="relative p-4 sm:p-5">
                        {/* Header de la tarjeta */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2, type: "spring" }}
                              className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg"
                            >
                              <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                            </motion.div>
                            <div>
                              <h3 className="text-sm sm:text-base font-bold text-blue-900 dark:text-blue-100">
                                Usuario Encontrado
                              </h3>
                              <p className="text-xs text-blue-600 dark:text-blue-300">
                                Cuenta: {numeroCuenta}
                              </p>
                            </div>
                          </div>
                          <motion.div
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7 text-green-500" />
                          </motion.div>
                        </div>

                        {/* Información del titular */}
                        {titular && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mb-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-blue-100 dark:border-blue-800/50 backdrop-blur-sm"
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-md mt-0.5">
                                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Titular</p>
                                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 break-words">
                                  {titular}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* Información del teléfono */}
                        {telefono && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-blue-100 dark:border-blue-800/50 backdrop-blur-sm"
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-1.5 bg-green-100 dark:bg-green-900/50 rounded-md mt-0.5">
                                <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Teléfono</p>
                                <a
                                  href={`tel:${telefono}`}
                                  className="text-base sm:text-lg font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors break-all"
                                >
                                  {telefono}
                                </a>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tipo de servicio */}
                <div className="space-y-2">
                  <Label htmlFor="servicio" className="text-sm sm:text-base font-semibold flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-blue-600" />
                    Tipo de Servicio Brindado *
                  </Label>
                  <Select value={servicio} onValueChange={setServicio}>
                    <SelectTrigger id="servicio" className="h-12 sm:h-14 text-base sm:text-lg">
                      <SelectValue placeholder="Selecciona el tipo de servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internet">🌐 Internet</SelectItem>
                      <SelectItem value="electricidad">⚡ Electricidad</SelectItem>
                      <SelectItem value="pfc">🏥 PFC (Plan de Financiamiento Colectivo)</SelectItem>
                      <SelectItem value="otro">📋 Otro</SelectItem>
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
                      className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg flex items-start gap-3"
                    >
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm sm:text-base text-red-700 dark:text-red-300 flex-1">{error}</p>
                      <button
                        type="button"
                        onClick={() => setError("")}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Mensaje de éxito */}
                <AnimatePresence>
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="p-4 sm:p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-200 dark:border-green-700 rounded-xl shadow-lg"
                    >
                      <div className="flex items-start gap-3">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                          className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full"
                        >
                          <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </motion.div>
                        <div className="flex-1">
                          <p className="text-base sm:text-lg font-bold text-green-800 dark:text-green-200 mb-1">
                            ¡Visita registrada exitosamente!
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            La encuesta ha sido enviada al usuario por WhatsApp.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Botón de envío */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="pt-2"
                >
                  <Button
                    type="submit"
                    disabled={submitting || !numeroCuenta.trim() || !servicio || !titular}
                    className="w-full h-14 sm:h-16 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        <span className="hidden sm:inline">Enviando encuesta...</span>
                        <span className="sm:hidden">Enviando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        <span className="hidden sm:inline">Confirmar Visita y Enviar Encuesta</span>
                        <span className="sm:hidden">Confirmar y Enviar</span>
                      </>
                    )}
                  </Button>
                  {(!titular && numeroCuenta.trim()) && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                      Primero busca el número de cuenta para continuar
                    </p>
                  )}
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

