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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Users,
  Plus,
  QrCode,
  Building2,
  Download,
  Copy,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface Empleado {
  id: number;
  nombre: string;
  box_numero: number;
  activo: boolean;
}

interface Token {
  id: number;
  token: string;
  qrUrl: string;
  empleado: {
    id: number;
    nombre: string;
    boxNumero: number;
  };
  fechaCreacion: string;
  activo: boolean;
}

export default function EncuestasBoxesAdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [showFormEmpleado, setShowFormEmpleado] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    boxNumero: "",
  });
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar empleados
      const empleadosRes = await fetch("/api/encuesta-box/empleados");
      const empleadosData = await empleadosRes.json();

      if (empleadosData.success) {
        setEmpleados(empleadosData.empleados || []);
      }

      // Cargar tokens
      const tokensRes = await fetch("/api/encuesta-box/tokens");
      const tokensData = await tokensRes.json();

      if (tokensData.success) {
        setTokens(tokensData.tokens || []);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
      toast({
        title: "Error",
        description: "Error al cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCrearEmpleado = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre || !formData.boxNumero) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/encuesta-box/empleados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          boxNumero: parseInt(formData.boxNumero),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Éxito",
          description: "Empleado creado correctamente",
        });
        setFormData({ nombre: "", boxNumero: "" });
        setShowFormEmpleado(false);
        cargarDatos();
      } else {
        toast({
          title: "Error",
          description: data.error || "Error al crear el empleado",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creando empleado:", error);
      toast({
        title: "Error",
        description: "Error al crear el empleado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarToken = async (empleadoId: number) => {
    setLoading(true);
    try {
      const response = await fetch("/api/encuesta-box/generar-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empleadoId }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Éxito",
          description: "Token QR generado correctamente",
        });
        cargarDatos();
      } else {
        toast({
          title: "Error",
          description: data.error || "Error al generar el token",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generando token:", error);
      toast({
        title: "Error",
        description: "Error al generar el token",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopiarToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    toast({
      title: "Copiado",
      description: "URL del QR copiada al portapapeles",
    });
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleDescargarQR = (qrUrl: string, nombreEmpleado: string) => {
    // Usar un servicio de generación de QR o simplemente abrir la URL
    // Por ahora, abriremos la URL en una nueva pestaña
    window.open(
      `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        qrUrl
      )}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            Gestión de Encuestas - Boxes
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Administra empleados y genera códigos QR para las encuestas
          </p>
        </motion.div>

        {loading && !empleados.length ? (
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
            {/* Formulario para crear empleado */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="border shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        Empleados
                      </CardTitle>
                      <CardDescription>
                        Gestiona los empleados asignados a cada box
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => setShowFormEmpleado(!showFormEmpleado)}
                      variant={showFormEmpleado ? "outline" : "default"}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {showFormEmpleado ? "Cancelar" : "Nuevo Empleado"}
                    </Button>
                  </div>
                </CardHeader>
                {showFormEmpleado && (
                  <CardContent>
                    <form onSubmit={handleCrearEmpleado} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nombre">Nombre del Empleado</Label>
                          <Input
                            id="nombre"
                            value={formData.nombre}
                            onChange={(e) =>
                              setFormData({ ...formData, nombre: e.target.value })
                            }
                            placeholder="Ej: Juan Pérez"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="boxNumero">Número de Box</Label>
                          <Select
                            value={formData.boxNumero}
                            onValueChange={(value) =>
                              setFormData({ ...formData, boxNumero: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un box" />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4].map((num) => (
                                <SelectItem key={num} value={num.toString()}>
                                  Box {num}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button type="submit" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creando...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Crear Empleado
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                )}
              </Card>
            </motion.div>

            {/* Lista de empleados */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <Card className="border shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Lista de Empleados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {empleados.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Box</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {empleados.map((empleado) => {
                          const tieneToken = tokens.some(
                            (t) => t.empleado.id === empleado.id
                          );
                          return (
                            <TableRow key={empleado.id}>
                              <TableCell className="font-medium">
                                {empleado.nombre}
                              </TableCell>
                              <TableCell>Box {empleado.box_numero}</TableCell>
                              <TableCell>
                                {empleado.activo ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Activo
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Inactivo
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                {!tieneToken ? (
                                  <Button
                                    size="sm"
                                    onClick={() => handleGenerarToken(empleado.id)}
                                    disabled={loading}
                                  >
                                    <QrCode className="h-4 w-4 mr-2" />
                                    Generar QR
                                  </Button>
                                ) : (
                                  <span className="text-sm text-gray-500">
                                    QR generado
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-500">
                        No hay empleados registrados
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Lista de tokens QR */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-blue-600" />
                    Códigos QR Generados
                  </CardTitle>
                  <CardDescription>
                    URLs y códigos QR para cada empleado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tokens.length > 0 ? (
                    <div className="space-y-4">
                      {tokens.map((token) => (
                        <div
                          key={token.id}
                          className="p-4 border rounded-lg space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                {token.empleado.nombre}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Box {token.empleado.boxNumero}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCopiarToken(token.qrUrl)}
                              >
                                {copiedToken === token.token ? (
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                ) : (
                                  <Copy className="h-4 w-4 mr-2" />
                                )}
                                Copiar URL
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleDescargarQR(
                                    token.qrUrl,
                                    token.empleado.nombre
                                  )
                                }
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Descargar QR
                              </Button>
                            </div>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-xs font-mono break-all">
                            {token.qrUrl}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-500">
                        No hay códigos QR generados
                      </p>
                    </div>
                  )}
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
