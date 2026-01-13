"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Lock,
  BarChart3,
  Wrench,
  MessageSquare,
  Sparkles,
  ArrowRight,
  X,
} from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

interface AdminSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  password: string;
  color: string;
  gradient: string;
}

const ADMIN_SECTIONS: AdminSection[] = [
  {
    id: "encuestas",
    title: "Dashboard de Encuestas",
    description: "Métricas y estadísticas de las encuestas de visitas técnicas",
    icon: BarChart3,
    route: "/encuestas/dashboard",
    password: "Ingresonoticias2026.",
    color: "blue",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    id: "visitas",
    title: "Visitas Técnicas",
    description: "Registro y gestión de visitas técnicas a domicilio",
    icon: Wrench,
    route: "/visitas-tecnicas",
    password: "Tecnico2025",
    color: "green",
    gradient: "from-green-500 to-green-600",
  },
  {
    id: "conversaciones",
    title: "Conversaciones",
    description: "Gestión y administración de conversaciones",
    icon: MessageSquare,
    route: "/conversaciones",
    password: "Coop2025",
    color: "purple",
    gradient: "from-purple-500 to-purple-600",
  },
];

export default function AdminPage() {
  const router = useRouter();
  const [selectedSection, setSelectedSection] = useState<AdminSection | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectSection = (section: AdminSection) => {
    setSelectedSection(section);
    setPasswordInput("");
    setAuthError(null);
  };

  const handleBack = () => {
    setSelectedSection(null);
    setPasswordInput("");
    setAuthError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!selectedSection) return;

    if (passwordInput !== selectedSection.password) {
      setAuthError("Contraseña incorrecta");
      return;
    }

    setLoading(true);

    try {
      // Para visitas técnicas y conversaciones, autenticar mediante API
      if (selectedSection.id === "visitas") {
        const response = await fetch("/api/visitas-tecnicas/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: passwordInput }),
        });

        const data = await response.json();
        if (!data.success) {
          setAuthError(data.error || "Error al autenticar");
          setLoading(false);
          return;
        }
      } else if (selectedSection.id === "conversaciones") {
        const response = await fetch("/api/conversaciones/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: passwordInput }),
        });

        const data = await response.json();
        if (!data.success) {
          setAuthError(data.error || "Error al autenticar");
          setLoading(false);
          return;
        }
      }

      // Redirigir a la página correspondiente
      router.push(selectedSection.route);
    } catch (error) {
      console.error("Error en autenticación:", error);
      setAuthError("Error al procesar la solicitud");
      setLoading(false);
    }
  };

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
        className="w-full max-w-5xl relative z-10"
      >
        {!selectedSection ? (
          // Vista de selección de sección
          <div className="space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Panel Administrativo
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Selecciona la sección a la que deseas acceder
              </p>
            </motion.div>

            {/* Tarjetas de secciones */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ADMIN_SECTIONS.map((section, index) => {
                const Icon = section.icon;
                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className="cursor-pointer border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 h-full"
                      onClick={() => handleSelectSection(section)}
                    >
                      <CardHeader className="text-center pb-4">
                        <motion.div
                          className={`mx-auto p-4 rounded-full bg-gradient-to-br ${section.gradient} mb-4 w-16 h-16 flex items-center justify-center`}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Icon className="h-8 w-8 text-white" />
                        </motion.div>
                        <CardTitle className="text-xl font-bold">
                          {section.title}
                        </CardTitle>
                        <CardDescription className="text-sm mt-2">
                          {section.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                          <span>Acceder</span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          // Vista de login
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md mx-auto"
          >
            <Card className="shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBack}
                    className="absolute left-4 top-4"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
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
                      <div
                        className={`p-4 rounded-full bg-gradient-to-br ${selectedSection.gradient} w-20 h-20 flex items-center justify-center`}
                      >
                        {selectedSection.icon && (
                          <selectedSection.icon className="h-10 w-10 text-white" />
                        )}
                      </div>
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
                  {selectedSection.title}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-2">
                  Ingresa la contraseña para acceder
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
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full pl-10 h-12 text-lg"
                        autoFocus
                      />
                    </div>
                  </motion.div>
                  <AnimatePresence>
                    {authError && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-2 rounded"
                      >
                        {authError}
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
                      className={`w-full h-12 text-lg bg-gradient-to-r ${selectedSection.gradient} hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300`}
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
                          <Loader2 className="h-5 w-5" />
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
        )}
      </motion.div>
    </div>
  );
}
