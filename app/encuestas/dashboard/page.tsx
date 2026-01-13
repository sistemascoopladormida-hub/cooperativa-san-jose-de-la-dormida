"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Loader2,
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
  MessageSquare,
} from "lucide-react";
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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [encuestas, setEncuestas] = useState<Encuesta[]>([]);
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterServicio, setFilterServicio] = useState<string>("all");
  const [comentarioSeleccionado, setComentarioSeleccionado] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

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
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-800/50 border-b-2">
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100 py-2 text-xs">Fecha</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100 py-2 text-xs">Titular</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100 py-2 text-xs">Cuenta</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100 py-2 text-xs">Servicio</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100 py-2 text-xs">Técnico</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100 py-2 text-xs text-center">Calificación</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100 py-2 text-xs">Tiempo</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100 py-2 text-xs">Profesionalismo</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100 py-2 text-xs">Resolución</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100 py-2 text-xs text-center">Amabilidad</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100 py-2 text-xs">Comentarios</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {encuestasFiltradas.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={11}
                              className="text-center py-12 text-muted-foreground"
                            >
                              <div className="flex flex-col items-center gap-2">
                                <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                                <p className="text-sm font-medium">No hay encuestas para mostrar</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          encuestasFiltradas.map((encuesta) => {
                            const respuestas = encuesta.respuestas || {};
                            return (
                              <TableRow
                                key={encuesta.id}
                                className="border-b hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                              >
                                <TableCell className="py-2 align-top">
                                  <div className="text-xs font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                    {encuesta.completadaEn
                                      ? format(
                                          new Date(encuesta.completadaEn),
                                          "dd/MM/yyyy"
                                        )
                                      : "-"}
                                  </div>
                                  {encuesta.completadaEn && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {format(
                                        new Date(encuesta.completadaEn),
                                        "HH:mm"
                                      )}
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="py-2 align-top">
                                  <div className="text-xs font-medium text-gray-900 dark:text-gray-100 max-w-[150px] truncate" title={encuesta.titular}>
                                    {encuesta.titular}
                                  </div>
                                </TableCell>
                                <TableCell className="py-2 align-top">
                                  <span className="text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                    {encuesta.numeroCuenta}
                                  </span>
                                </TableCell>
                                <TableCell className="py-2 align-top">
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                                    {getServicioLabel(encuesta.tipoServicio)}
                                  </span>
                                </TableCell>
                                <TableCell className="py-2 align-top">
                                  <div className="text-xs font-medium text-gray-800 dark:text-gray-200 max-w-[120px] truncate" title={encuesta.tecnico || ""}>
                                    {encuesta.tecnico || (
                                      <span className="text-gray-400 italic">-</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="py-2 text-center align-top">
                                  {respuestas.calificacionGeneral ? (
                                    <div className="flex items-center justify-center gap-1">
                                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                      <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
                                        {respuestas.calificacionGeneral}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 text-xs">-</span>
                                  )}
                                </TableCell>
                                <TableCell className="py-2 align-top">
                                  {respuestas.puntualidad ? (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 whitespace-nowrap">
                                      {getTiempoLabel(respuestas.puntualidad)}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 text-xs">-</span>
                                  )}
                                </TableCell>
                                <TableCell className="py-2 align-top">
                                  {respuestas.profesionalismo ? (
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                      {getProfesionalismoLabel(respuestas.profesionalismo)}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 text-xs">-</span>
                                  )}
                                </TableCell>
                                <TableCell className="py-2 align-top">
                                  {respuestas.resolucionProblema ? (
                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                                      respuestas.resolucionProblema === "si_completamente"
                                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                        : respuestas.resolucionProblema === "si_parcialmente"
                                        ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                                    }`}>
                                      {getResolucionLabel(respuestas.resolucionProblema)}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 text-xs">-</span>
                                  )}
                                </TableCell>
                                <TableCell className="py-2 text-center align-top">
                                  {respuestas.amabilidad ? (
                                    <div className="flex items-center justify-center gap-1">
                                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                      <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
                                        {respuestas.amabilidad}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 text-xs">-</span>
                                  )}
                                </TableCell>
                                <TableCell className="py-2 align-top max-w-[180px]">
                                  {respuestas.comentarios && respuestas.comentarios.trim() ? (
                                    <button
                                      type="button"
                                      onClick={() => setComentarioSeleccionado(respuestas.comentarios)}
                                      className="flex items-start gap-1 w-full text-left hover:opacity-80 transition-opacity cursor-pointer group"
                                    >
                                      <MessageSquare className="h-3 w-3 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0 group-hover:text-blue-600 dark:group-hover:text-blue-300" />
                                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-tight break-words group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" style={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        maxHeight: '2rem'
                                      }}>
                                        {respuestas.comentarios}
                                      </p>
                                    </button>
                                  ) : (
                                    <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
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

      {/* Dialog para ver comentario completo */}
      <Dialog open={!!comentarioSeleccionado} onOpenChange={(open) => !open && setComentarioSeleccionado(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Comentario del Usuario
            </DialogTitle>
            <DialogDescription>
              Comentario adicional sobre la visita técnica
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {comentarioSeleccionado}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
