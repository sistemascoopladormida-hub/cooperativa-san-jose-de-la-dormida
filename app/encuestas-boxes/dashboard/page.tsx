"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  Building2,
  Search,
  RefreshCw,
  PieChart,
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
} from "recharts";
import { motion } from "framer-motion";

interface Encuesta {
  id: number;
  token: string;
  empleado_id: number;
  box_numero: number;
  nombre_empleado: string;
  estado: string;
  completada_en: string;
  respuestas: any;
  comentarios: string | null;
}

interface Metricas {
  total: number;
  porEmpleado: Record<string, number>;
  porBox: Record<number, number>;
  calificacionPromedio: number;
  calificacionPromedioPorEmpleado: Record<string, number>;
  amabilidadPromedio: number;
  amabilidadPromedioPorEmpleado: Record<string, number>;
  tiempoEsperaPorEmpleado: Record<string, Record<string, number>>;
  resolucionPorEmpleado: Record<string, Record<string, number>>;
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

export default function EncuestasBoxesDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [encuestas, setEncuestas] = useState<Encuesta[]>([]);
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEmpleado, setFilterEmpleado] = useState<string>("all");
  const [comentarioSeleccionado, setComentarioSeleccionado] = useState<
    string | null
  >(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/encuesta-box/dashboard");
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

  const getTiempoEsperaLabel = (valor: string) => {
    const labels: Record<string, string> = {
      muy_rapido: "Muy rápido",
      adecuado: "Adecuado",
      tardio: "Tardío",
      muy_tardio: "Muy tardío",
    };
    return labels[valor] || valor;
  };

  const getResolucionLabel = (valor: string) => {
    const labels: Record<string, string> = {
      si_completamente: "Sí, completamente",
      si_parcialmente: "Sí, parcialmente",
      no: "No",
    };
    return labels[valor] || valor;
  };

  const datosPorEmpleado = metricas?.porEmpleado
    ? Object.entries(metricas.porEmpleado).map(([name, value]) => ({
        name,
        value,
        fill: CHART_COLORS[
          Object.keys(metricas.porEmpleado).indexOf(name) % CHART_COLORS.length
        ],
      }))
    : [];

  const datosPorBox = metricas?.porBox
    ? Object.entries(metricas.porBox).map(([name, value]) => ({
        name: `Box ${name}`,
        value,
        fill: CHART_COLORS[
          Object.keys(metricas.porBox).indexOf(name) % CHART_COLORS.length
        ],
      }))
    : [];

  const encuestasFiltradas = encuestas.filter((encuesta) => {
    const matchSearch = encuesta.nombre_empleado
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchEmpleado =
      filterEmpleado === "all" ||
      encuesta.nombre_empleado === filterEmpleado;
    return matchSearch && matchEmpleado;
  });

  const empleadosUnicos = Array.from(
    new Set(encuestas.map((e) => e.nombre_empleado))
  );

  const tasaResolucion = metricas
    ? Object.values(metricas.resolucionPorEmpleado).reduce(
        (total, resoluciones) => {
          return (
            total + (resoluciones.si_completamente || 0)
          );
        },
        0
      ) / metricas.total
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
                <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              Dashboard de Encuestas - Boxes
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Métricas y estadísticas de las encuestas de atención en boxes
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
                      <Users className="h-5 w-5" />
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
                      {Math.round(tasaResolucion * 100)}%
                    </div>
                    <p className="text-xs text-green-100">
                      Consultas resueltas completamente
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Gráficos principales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Gráfico de barras - Por empleado */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      Encuestas por Empleado
                    </CardTitle>
                    <CardDescription>
                      Cantidad de encuestas recibidas por cada empleado
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {datosPorEmpleado.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={datosPorEmpleado}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={100}
                          />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="value" fill={COLORS.primary} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-gray-500">
                        No hay datos disponibles
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Gráfico de pie - Por box */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="border shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-blue-600" />
                      Distribución por Box
                    </CardTitle>
                    <CardDescription>
                      Cantidad de encuestas por cada box de atención
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {datosPorBox.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Pie
                            data={datosPorBox}
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
                            {datosPorBox.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-gray-500">
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
              transition={{ delay: 0.7 }}
            >
              <Card className="border shadow-lg">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        Encuestas Completadas
                      </CardTitle>
                      <CardDescription>
                        Lista de todas las encuestas completadas
                      </CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar por empleado..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-full sm:w-64"
                        />
                      </div>
                      <select
                        value={filterEmpleado}
                        onChange={(e) => setFilterEmpleado(e.target.value)}
                        className="px-3 py-2 border rounded-md text-sm"
                      >
                        <option value="all">Todos los empleados</option>
                        {empleadosUnicos.map((empleado) => (
                          <option key={empleado} value={empleado}>
                            {empleado}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {encuestasFiltradas.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Fecha</TableHead>
                            <TableHead className="text-xs">Empleado</TableHead>
                            <TableHead className="text-xs">Box</TableHead>
                            <TableHead className="text-xs">Calificación</TableHead>
                            <TableHead className="text-xs">Amabilidad</TableHead>
                            <TableHead className="text-xs">Tiempo Espera</TableHead>
                            <TableHead className="text-xs">Resolución</TableHead>
                            <TableHead className="text-xs">Comentarios</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {encuestasFiltradas.map((encuesta) => {
                            const calificacion =
                              encuesta.respuestas?.calificacionGeneral || "0";
                            const amabilidad =
                              encuesta.respuestas?.amabilidad || "0";
                            const tiempoEspera =
                              encuesta.respuestas?.tiempoEspera || "";
                            const resolucion =
                              encuesta.respuestas?.resolucionProblema || "";

                            return (
                              <TableRow key={encuesta.id}>
                                <TableCell className="text-xs py-2 align-top whitespace-nowrap">
                                  {encuesta.completada_en
                                    ? format(
                                        new Date(encuesta.completada_en),
                                        "dd/MM/yyyy HH:mm"
                                      )
                                    : "-"}
                                </TableCell>
                                <TableCell className="text-xs py-2 align-top">
                                  {encuesta.nombre_empleado}
                                </TableCell>
                                <TableCell className="text-xs py-2 align-top">
                                  Box {encuesta.box_numero}
                                </TableCell>
                                <TableCell className="text-xs py-2 align-top">
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                    <span>{calificacion}/5</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs py-2 align-top">
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                    <span>{amabilidad}/5</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs py-2 align-top whitespace-nowrap">
                                  {tiempoEspera
                                    ? getTiempoEsperaLabel(tiempoEspera)
                                    : "-"}
                                </TableCell>
                                <TableCell className="text-xs py-2 align-top whitespace-nowrap">
                                  {resolucion
                                    ? getResolucionLabel(resolucion)
                                    : "-"}
                                </TableCell>
                                <TableCell className="text-xs py-2 align-top">
                                  {encuesta.comentarios ? (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        setComentarioSeleccionado(
                                          encuesta.comentarios || ""
                                        )
                                      }
                                      className="h-auto p-1 text-xs"
                                    >
                                      <MessageSquare className="h-3 w-3 mr-1" />
                                      Ver
                                    </Button>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-500">
                        No se encontraron encuestas
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>

      {/* Dialog para comentarios */}
      <Dialog
        open={!!comentarioSeleccionado}
        onOpenChange={() => setComentarioSeleccionado(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comentarios</DialogTitle>
            <DialogDescription>
              Comentarios adicionales del usuario
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {comentarioSeleccionado}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
