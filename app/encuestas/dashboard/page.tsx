"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Loader2,
  Lock,
  BarChart3,
  Users,
  Star,
  Clock,
  CheckCircle2,
  TrendingUp,
  FileText,
  Search,
  RefreshCw,
  PieChart,
  Activity,
  Award,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { motion } from "framer-motion";

const ADMIN_PASSWORD = "Ingresonoticias2026.";

interface Encuesta {
  id: number;
  token: string;
  numeroCuenta: string;
  titular: string;
  telefono: string;
  tipoServicio: string;
  tecnico: string | null;
  estado: string;
  creadoEn: string;
  enviadoEn: string | null;
  completadaEn: string | null;
  respuestas: any;
}

interface Metricas {
  total: number;
  porServicio: Record<string, number>;
  calificacionPromedio: number;
  tiempoRespuesta: Record<string, number>;
  profesionalismo: Record<string, number>;
  resolucion: Record<string, number>;
  amabilidadPromedio: number;
}

const COLORS = {
  primary: "#3b82f6",
  secondary: "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#06b6d4",
};

const CHART_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#14b8a6",
];

export default function EncuestasDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [encuestas, setEncuestas] = useState<Encuesta[]>([]);
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterServicio, setFilterServicio] = useState<string>("all");

  useEffect(() => {
    if (isAuthenticated) {
      cargarDatos();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordInput("");
    } else {
      setAuthError("Contraseña incorrecta");
    }
  };

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/encuestas/dashboard");
      const data = await response.json();

      if (data.success) {
        setEncuestas(data.encuestas || []);
        setMetricas(data.metricas || null);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const getServicioLabel = (servicio: string) => {
    const labels: Record<string, string> = {
      internet: "Internet",
      electricidad: "Electricidad",
      pfc: "PFC",
      otro: "Otro",
    };
    return labels[servicio] || servicio;
  };

  const getTiempoLabel = (tiempo: string) => {
    const labels: Record<string, string> = {
      muy_rapido: "Muy rápido",
      adecuado: "Tiempo adecuado",
      tardio: "Llegó tarde",
      muy_tardio: "Muy tarde",
    };
    return labels[tiempo] || tiempo;
  };

  const getProfesionalismoLabel = (prof: string) => {
    const labels: Record<string, string> = {
      excelente: "Excelente",
      muy_bueno: "Muy bueno",
      bueno: "Bueno",
      regular: "Regular",
      malo: "Malo",
    };
    return labels[prof] || prof;
  };

  const getResolucionLabel = (resol: string) => {
    const labels: Record<string, string> = {
      si_completamente: "Sí, completamente",
      si_parcialmente: "Sí, parcialmente",
      no: "No",
    };
    return labels[resol] || resol;
  };

  // Preparar datos para gráficos
  const datosPorServicio = metricas?.porServicio
    ? Object.entries(metricas.porServicio).map(([name, value]) => ({
        name: getServicioLabel(name),
        value,
        fill: CHART_COLORS[Object.keys(metricas.porServicio).indexOf(name) % CHART_COLORS.length],
      }))
    : [];

  const datosTiempoRespuesta = metricas?.tiempoRespuesta
    ? Object.entries(metricas.tiempoRespuesta).map(([name, value]) => ({
        name: getTiempoLabel(name),
        value,
        fill: CHART_COLORS[Object.keys(metricas.tiempoRespuesta).indexOf(name) % CHART_COLORS.length],
      }))
    : [];

  const datosProfesionalismo = metricas?.profesionalismo
    ? Object.entries(metricas.profesionalismo).map(([name, value]) => ({
        name: getProfesionalismoLabel(name),
        value,
        fill: CHART_COLORS[Object.keys(metricas.profesionalismo).indexOf(name) % CHART_COLORS.length],
      }))
    : [];

  const datosResolucion = metricas?.resolucion
    ? Object.entries(metricas.resolucion).map(([name, value]) => ({
        name: getResolucionLabel(name),
        value,
        fill: CHART_COLORS[Object.keys(metricas.resolucion).indexOf(name) % CHART_COLORS.length],
      }))
    : [];

  const encuestasFiltradas = encuestas.filter((encuesta) => {
    const matchSearch =
      encuesta.titular.toLowerCase().includes(searchTerm.toLowerCase()) ||
      encuesta.numeroCuenta.includes(searchTerm) ||
      encuesta.telefono.includes(searchTerm);
    const matchServicio =
      filterServicio === "all" || encuesta.tipoServicio === filterServicio;
    return matchSearch && matchServicio;
  });

  const serviciosUnicos = Array.from(
    new Set(encuestas.map((e) => e.tipoServicio))
  );

  const tasaResolucion = metricas
    ? Math.round(
        ((metricas.resolucion?.si_completamente || 0) / metricas.total) * 100
      )
    : 0;

  if (!isAuthenticated) {
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
          className="w-full max-w-md relative z-10"
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
                Acceso al Dashboard
              </CardTitle>
              <p className="text-sm text-gray-500 mt-2">
                Ingresa la contraseña para acceder al panel de métricas de encuestas
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              Dashboard de Encuestas
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Métricas y estadísticas de las encuestas de visitas técnicas
            </p>
          </div>
          <Button
            variant="outline"
            onClick={cargarDatos}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
        </motion.div>

        {loading && !metricas ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cargando datos...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-50">
                      Total de Encuestas
                    </CardTitle>
                    <div className="p-2 bg-white/20 rounded-lg">
                      <FileText className="h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-1">
                      {metricas?.total || 0}
                    </div>
                    <p className="text-xs text-blue-100">
                      Encuestas completadas
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:shadow-xl transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-amber-50">
                      Calificación Promedio
                    </CardTitle>
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Star className="h-5 w-5 fill-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-1">
                      {metricas?.calificacionPromedio.toFixed(1) || "0.0"}
                    </div>
                    <p className="text-xs text-amber-100">de 5.0 estrellas</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-xl transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-50">
                      Amabilidad Promedio
                    </CardTitle>
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Users className="h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-1">
                      {metricas?.amabilidadPromedio.toFixed(1) || "0.0"}
                    </div>
                    <p className="text-xs text-purple-100">de 5.0 estrellas</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-xl transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-50">
                      Tasa de Resolución
                    </CardTitle>
                    <div className="p-2 bg-white/20 rounded-lg">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-1">
                      {tasaResolucion}%
                    </div>
                    <p className="text-xs text-green-100">
                      Problemas resueltos completamente
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Gráficos principales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Gráfico de barras - Por servicio */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-blue-600" />
                      Distribución por Tipo de Servicio
                    </CardTitle>
                    <CardDescription>
                      Cantidad de encuestas por cada tipo de servicio
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {datosPorServicio.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={datosPorServicio}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                          <XAxis
                            dataKey="name"
                            className="text-xs"
                            tick={{ fill: "currentColor" }}
                          />
                          <YAxis
                            className="text-xs"
                            tick={{ fill: "currentColor" }}
                          />
                          <ChartTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                                    <div className="grid gap-2">
                                      <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm font-medium">
                                          {payload[0].payload.name}
                                        </span>
                                        <span className="text-sm font-bold">
                                          {payload[0].value}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar
                            dataKey="value"
                            radius={[8, 8, 0, 0]}
                            className="fill-blue-600"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-gray-400">
                        No hay datos disponibles
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Gráfico de dona - Tiempo de respuesta */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="border shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-green-600" />
                      Tiempo de Respuesta
                    </CardTitle>
                    <CardDescription>
                      Evaluación del tiempo de respuesta del técnico
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {datosTiempoRespuesta.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Pie
                            data={datosTiempoRespuesta}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {datosTiempoRespuesta.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.fill}
                              />
                            ))}
                          </Pie>
                          <ChartTooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-gray-400">
                        No hay datos disponibles
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Gráfico de barras - Profesionalismo */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card className="border shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-purple-600" />
                      Profesionalismo del Técnico
                    </CardTitle>
                    <CardDescription>
                      Evaluación del profesionalismo mostrado
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {datosProfesionalismo.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={datosProfesionalismo} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                          <XAxis type="number" className="text-xs" tick={{ fill: "currentColor" }} />
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={100}
                            className="text-xs"
                            tick={{ fill: "currentColor" }}
                          />
                          <ChartTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                                    <div className="flex items-center justify-between gap-4">
                                      <span className="text-sm font-medium">
                                        {payload[0].payload.name}
                                      </span>
                                      <span className="text-sm font-bold">
                                        {payload[0].value}
                                      </span>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar
                            dataKey="value"
                            radius={[0, 8, 8, 0]}
                            className="fill-purple-600"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-gray-400">
                        No hay datos disponibles
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Gráfico de dona - Resolución */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Card className="border shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-amber-600" />
                      Resolución del Problema
                    </CardTitle>
                    <CardDescription>
                      ¿Se resolvió completamente el problema?
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {datosResolucion.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Pie
                            data={datosResolucion}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {datosResolucion.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.fill}
                              />
                            ))}
                          </Pie>
                          <ChartTooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-gray-400">
                        No hay datos disponibles
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Tabla de encuestas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card className="border shadow-lg">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Encuestas Completadas
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {encuestasFiltradas.length} de {encuestas.length} encuestas
                      </CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar por titular, cuenta o teléfono..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-full sm:w-64"
                        />
                      </div>
                      <select
                        value={filterServicio}
                        onChange={(e) => setFilterServicio(e.target.value)}
                        className="px-3 py-2 border rounded-md text-sm bg-background"
                      >
                        <option value="all">Todos los servicios</option>
                        {serviciosUnicos.map((servicio) => (
                          <option key={servicio} value={servicio}>
                            {getServicioLabel(servicio)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Titular</TableHead>
                          <TableHead>Cuenta</TableHead>
                          <TableHead>Servicio</TableHead>
                          <TableHead>Técnico</TableHead>
                          <TableHead>Calificación</TableHead>
                          <TableHead>Tiempo</TableHead>
                          <TableHead>Profesionalismo</TableHead>
                          <TableHead>Resolución</TableHead>
                          <TableHead>Amabilidad</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {encuestasFiltradas.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={10}
                              className="text-center py-12 text-muted-foreground"
                            >
                              <div className="flex flex-col items-center gap-2">
                                <FileText className="h-12 w-12 text-gray-300" />
                                <p>No hay encuestas para mostrar</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          encuestasFiltradas.map((encuesta) => {
                            const respuestas = encuesta.respuestas || {};
                            return (
                              <TableRow
                                key={encuesta.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                              >
                                <TableCell className="text-sm font-medium">
                                  {encuesta.completadaEn
                                    ? format(
                                        new Date(encuesta.completadaEn),
                                        "dd/MM/yyyy HH:mm"
                                      )
                                    : "-"}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {encuesta.titular}
                                </TableCell>
                                <TableCell>{encuesta.numeroCuenta}</TableCell>
                                <TableCell>
                                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                                    {getServicioLabel(encuesta.tipoServicio)}
                                  </span>
                                </TableCell>
                                <TableCell className="text-sm font-medium">
                                  {encuesta.tecnico || "-"}
                                </TableCell>
                                <TableCell>
                                  {respuestas.calificacionGeneral ? (
                                    <div className="flex items-center gap-1">
                                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                      <span className="font-semibold">
                                        {respuestas.calificacionGeneral}
                                      </span>
                                    </div>
                                  ) : (
                                    "-"
                                  )}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {respuestas.puntualidad
                                    ? getTiempoLabel(respuestas.puntualidad)
                                    : "-"}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {respuestas.profesionalismo
                                    ? getProfesionalismoLabel(
                                        respuestas.profesionalismo
                                      )
                                    : "-"}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {respuestas.resolucionProblema
                                    ? getResolucionLabel(
                                        respuestas.resolucionProblema
                                      )
                                    : "-"}
                                </TableCell>
                                <TableCell>
                                  {respuestas.amabilidad ? (
                                    <div className="flex items-center gap-1">
                                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                      <span className="font-semibold">
                                        {respuestas.amabilidad}
                                      </span>
                                    </div>
                                  ) : (
                                    "-"
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
