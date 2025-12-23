"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle, Wrench } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function EncuestaPage() {
  const params = useParams();
  const token = params?.token as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [encuestaData, setEncuestaData] = useState<{
    numeroCuenta: string;
    titular: string;
    tipoServicio: string;
  } | null>(null);

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

  if (error) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <Header />
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 border-b text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                  <Wrench className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <CardTitle className="text-2xl md:text-3xl">
                Encuesta de Satisfacción
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Tu opinión es muy importante para nosotros
              </p>
            </CardHeader>
            
            <CardContent className="p-6 md:p-8">
              {encuestaData && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <strong>Servicio:</strong> {encuestaData.tipoServicio}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <strong>Número de cuenta:</strong> {encuestaData.numeroCuenta}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Titular:</strong> {encuestaData.titular}
                  </p>
                </div>
              )}

              <div className="space-y-6">
                <p className="text-center text-gray-600 dark:text-gray-300">
                  El formulario de la encuesta se implementará aquí.
                </p>
                
                <div className="flex justify-center">
                  <Button
                    disabled
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white"
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Encuesta en desarrollo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

