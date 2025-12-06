"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Search, MessageSquare, Phone, Calendar, LogOut } from "lucide-react";

interface Conversation {
  id: number;
  phone_number: string;
  created_at: string;
  updated_at: string;
  message_count: number;
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Acceso a Conversaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Ingresa la contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verificando..." : "Ingresar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Cargando
  if (authenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Página principal de conversaciones
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Conversaciones WhatsApp
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {conversations.length} conversación{conversations.length !== 1 ? "es" : ""}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Salir
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
          {/* Lista de conversaciones */}
          <Card className="lg:col-span-1 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversaciones
              </CardTitle>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por número..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full">
                {loadingConversations ? (
                  <div className="p-4 text-center text-gray-500">
                    Cargando...
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {searchTerm
                      ? "No se encontraron conversaciones"
                      : "No hay conversaciones aún"}
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredConversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => loadConversationDetail(conv.phone_number)}
                        className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                          selectedConversation?.conversation.id === conv.id
                            ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                            : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="font-medium text-sm truncate">
                              {conv.phone_number}
                            </span>
                          </div>
                          <Badge variant="secondary" className="ml-2">
                            {conv.message_count}
                          </Badge>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(new Date(conv.updated_at), "dd/MM/yyyy HH:mm")}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Vista de mensajes */}
          <Card className="lg:col-span-2 flex flex-col">
            <CardHeader>
              {selectedConversation ? (
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    {selectedConversation.conversation.phone_number}
                  </CardTitle>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      {selectedConversation.messages.length} mensaje
                      {selectedConversation.messages.length !== 1 ? "s" : ""}
                    </span>
                    <span>
                      Iniciada:{" "}
                      {format(
                        new Date(selectedConversation.conversation.created_at),
                        "dd/MM/yyyy HH:mm"
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <CardTitle>Selecciona una conversación</CardTitle>
              )}
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              {selectedConversation ? (
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    {selectedConversation.messages.map((message, index) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.role === "user"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                          }`}
                        >
                          <div className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </div>
                          <div
                            className={`text-xs mt-2 ${
                              message.role === "user"
                                ? "text-blue-100"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {format(
                              new Date(message.created_at),
                              "dd/MM/yyyy HH:mm:ss"
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Selecciona una conversación para ver los mensajes</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

