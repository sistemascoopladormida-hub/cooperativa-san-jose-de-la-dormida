"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Search,
  MessageSquare,
  Phone,
  Calendar,
  LogOut,
  Lock,
  Sparkles,
  ArrowLeft,
  Bot,
} from "lucide-react";

interface Conversation {
  id: number;
  phone_number: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message_at?: string;
}

interface Message {
  id: number;
  conversation_id: number;
  role: "user" | "assistant";
  content: string;
  whatsapp_message_id?: string;
  created_at: string;
}

interface ConversationDetail {
  conversation: Conversation;
  messages: Message[];
}

export default function ConversacionesPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationDetail | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuth();
  }, []);

  // Cargar conversaciones cuando se autentica
  useEffect(() => {
    if (authenticated) {
      loadConversations();
    }
  }, [authenticated]);

  // Auto-scroll al final cuando se cargan mensajes
  useEffect(() => {
    if (selectedConversation?.messages && messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [selectedConversation?.messages]);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/conversaciones/check-auth");
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
      const response = await fetch("/api/conversaciones/auth", {
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
    await fetch("/api/conversaciones/auth", { method: "DELETE" });
    setAuthenticated(false);
    setSelectedConversation(null);
    setConversations([]);
  };

  const loadConversations = async () => {
    setLoadingConversations(true);
    try {
      const response = await fetch("/api/conversaciones/data");
      const data = await response.json();
      if (data.conversations) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error("Error cargando conversaciones:", error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadConversationDetail = async (phoneNumber: string) => {
    setLoadingConversations(true);
    try {
      const response = await fetch(
        `/api/conversaciones/data?phone=${encodeURIComponent(phoneNumber)}`
      );
      const data = await response.json();
      if (data.conversation && data.messages) {
        setSelectedConversation({
          conversation: data.conversation,
          messages: data.messages,
        });
      }
    } catch (error) {
      console.error("Error cargando conversación:", error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.phone_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                Acceso a Conversaciones
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

  // Página principal de conversaciones
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
                  Conversaciones WhatsApp y Web
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {conversations.length} conversación
                  {conversations.length !== 1 ? "es" : ""} activa
                  {conversations.length !== 1 ? "s" : ""}
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

      <div className="container mx-auto px-4 py-4 md:py-6 relative z-10">
        {/* En móvil: mostrar solo lista o solo mensajes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 min-h-0">
          {/* Lista de conversaciones - oculta en móvil cuando hay conversación seleccionada */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`lg:col-span-1 ${
              selectedConversation ? "hidden lg:block" : "block"
            }`}
          >
            <Card className="flex flex-col shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm h-[calc(100vh-120px)] md:h-[calc(100vh-140px)]">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 border-b flex-shrink-0">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </motion.div>
                  Conversaciones
                </CardTitle>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por número o tipo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0 min-h-0">
                <ScrollArea className="h-full">
                  {loadingConversations ? (
                    <div className="p-8 text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"
                      />
                      <p className="mt-4 text-gray-500">Cargando...</p>
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>
                        {searchTerm
                          ? "No se encontraron conversaciones"
                          : "No hay conversaciones aún"}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      <AnimatePresence>
                        {filteredConversations.map((conv, index) => {
                          const isWebConversation =
                            conv.phone_number.startsWith("WEB-");
                          const displayName = isWebConversation
                            ? `Chat Web (${conv.phone_number.replace(
                                /^WEB-/,
                                ""
                              )})`
                            : conv.phone_number;

                          return (
                            <motion.button
                              key={conv.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() =>
                                loadConversationDetail(conv.phone_number)
                              }
                              className={`w-full text-left p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-800 transition-all duration-300 ${
                                selectedConversation?.conversation.id === conv.id
                                  ? "bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border-l-4 border-blue-500 shadow-sm"
                                  : ""
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <motion.div
                                    whileHover={{ scale: 1.2, rotate: 15 }}
                                    className="flex-shrink-0"
                                  >
                                    {isWebConversation ? (
                                      <Bot className="h-5 w-5 text-emerald-600" />
                                    ) : (
                                      <Phone className="h-5 w-5 text-blue-600" />
                                    )}
                                  </motion.div>
                                  <span className="font-semibold text-sm truncate">
                                    {displayName}
                                  </span>
                                </div>
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Badge
                                    variant="secondary"
                                    className={
                                      "ml-2 " +
                                      (isWebConversation
                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300")
                                    }
                                  >
                                    {isWebConversation ? "Web" : "WA"} ·{" "}
                                    {conv.message_count}
                                  </Badge>
                                </motion.div>
                              </div>
                              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {format(
                                    new Date(
                                      conv.last_message_at || conv.updated_at
                                    ),
                                    "dd/MM/yyyy HH:mm"
                                  )}
                                </span>
                              </div>
                            </motion.button>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* Vista de mensajes */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`lg:col-span-2 ${
              selectedConversation ? "block" : "hidden lg:block"
            }`}
          >
            <Card className="flex flex-col shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm h-[calc(100vh-120px)] md:h-[calc(100vh-140px)]">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 border-b flex-shrink-0">
                {selectedConversation ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex items-center gap-3 mb-2">
                      {/* Botón volver en móvil */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedConversation(null)}
                        className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                      </motion.button>
                      <CardTitle className="flex items-center gap-3 text-lg flex-1">
                        <motion.div
                          whileHover={{ rotate: [0, -10, 10, 0] }}
                          transition={{ duration: 0.5 }}
                        >
                          {selectedConversation.conversation.phone_number.startsWith(
                            "WEB-"
                          ) ? (
                            <Bot className="h-6 w-6 text-emerald-600" />
                          ) : (
                            <Phone className="h-6 w-6 text-indigo-600" />
                          )}
                        </motion.div>
                        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent break-all">
                          {selectedConversation.conversation.phone_number}
                        </span>
                      </CardTitle>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600 dark:text-gray-300">
                      <Badge
                        variant="secondary"
                        className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                      >
                        {selectedConversation.messages.length} mensaje
                        {selectedConversation.messages.length !== 1 ? "s" : ""}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Iniciada:{" "}
                        {format(
                          new Date(
                            selectedConversation.conversation.created_at
                          ),
                          "dd/MM/yyyy HH:mm"
                        )}
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <CardTitle className="text-lg text-gray-500">
                    Selecciona una conversación
                  </CardTitle>
                )}
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-800 min-h-0">
                {selectedConversation ? (
                  <ScrollArea className="h-full w-full" ref={scrollAreaRef}>
                    <div className="p-4 md:p-6 space-y-4 pb-8">
                      <AnimatePresence>
                        {selectedConversation.messages.map((message, index) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{
                              delay: index * 0.05,
                              type: "spring",
                              stiffness: 100,
                            }}
                            className={`flex ${
                              message.role === "user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-3 md:p-4 shadow-md ${
                                message.role === "user"
                                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm"
                                  : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm border border-gray-200 dark:border-gray-600"
                              }`}
                            >
                              <div className="text-xs md:text-sm whitespace-pre-wrap leading-relaxed break-words">
                                {message.content}
                              </div>
                              <div
                                className={`text-xs mt-2 flex items-center gap-1 ${
                                  message.role === "user"
                                    ? "text-blue-100"
                                    : "text-gray-500 dark:text-gray-400"
                                }`}
                              >
                                <Calendar className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">
                                  {format(
                                    new Date(message.created_at),
                                    "dd/MM/yyyy HH:mm:ss"
                                  )}
                                </span>
                              </div>
                            </motion.div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {/* Elemento invisible para scroll automático */}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="h-full flex my-8 items-center justify-center text-gray-400">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center"
                    >
                      <motion.div
                        animate={{
                          y: [0, -10, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      </motion.div>
                      <p className="text-lg font-medium">
                        Selecciona una conversación para ver los mensajes
                      </p>
                      <p className="text-sm mt-2 text-gray-400">
                        Los mensajes aparecerán aquí
                      </p>
                    </motion.div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
