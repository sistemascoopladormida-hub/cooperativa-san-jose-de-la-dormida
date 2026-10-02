"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { X, Send, Bot, User, Clock, Zap, Phone, FileText, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  getChatbotWelcomeMessage,
  isOctubreRosaThemeActive,
  octubreRosaClasses,
} from "@/lib/octubre-rosa-theme"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
  image?: string
  invoice?: {
    downloadUrl: string
    fileName: string
    type: string
  }
}

export default function Chatbot() {
  const octubreRosa = isOctubreRosaThemeActive()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "1",
      text: getChatbotWelcomeMessage(isOctubreRosaThemeActive()),
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesScrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)

  // Obtener o crear un ID de sesión persistente para el chatbot web
  const getOrCreateSessionId = (): string => {
    if (typeof window === "undefined") return "web-server";
    const STORAGE_KEY = "chatbot_web_session_id"
    let existing = window.localStorage.getItem(STORAGE_KEY)
    if (!existing) {
      existing = `web-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 8)}`
      window.localStorage.setItem(STORAGE_KEY, existing)
    }
    return existing
  }

  const scrollToBottom = () => {
    const viewport = messagesScrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLElement | null
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" })
      return
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }

  useEffect(() => {
    if (!isOpen) return
    scrollToBottom()
  }, [messages, isTyping, isOpen])

  // Inicializar sesión en el cliente
  useEffect(() => {
    const id = getOrCreateSessionId()
    setSessionId(id)
  }, [])

  // Removido el auto-focus para evitar que se abra el teclado en móviles
  // El usuario puede hacer click en el input cuando quiera escribir

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    // Asegurar que tenemos un sessionId antes de enviar
    const currentSessionId = sessionId ?? getOrCreateSessionId()
    if (!sessionId) {
      setSessionId(currentSessionId)
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    try {
      // Preparar mensajes para enviar a la API (solo los últimos 10 para mantener el contexto)
      const messagesToSend = [...messages, userMessage].slice(-10).map(msg => ({
        text: msg.text,
        sender: msg.sender,
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: messagesToSend, sessionId: currentSessionId }),
      })

      if (!response.ok) {
        throw new Error('Error al obtener respuesta')
      }

      const data = await response.json()

      const imagePath = data.showImage
        ? `/images/${encodeURIComponent(data.showImage)}.jpeg`
        : undefined

      const invoiceData = data.invoice
        ? {
          downloadUrl: data.invoice.downloadUrl as string,
          fileName: data.invoice.fileName as string,
          type: data.invoice.type as string,
        }
        : undefined

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "Lo siento, no pude procesar tu consulta en este momento. Por favor, intenta de nuevo o contacta directamente con nuestra oficina.",
        sender: "bot",
        timestamp: new Date(),
        image: imagePath,
        invoice: invoiceData,
      }

      console.log("Mensaje del bot creado:", botResponse);

      setMessages((prev) => [...prev, botResponse])
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Lo siento, hubo un error al procesar tu consulta. Por favor, intenta de nuevo o contacta directamente con nuestra oficina al 3521-401330 o con los consultorios médicos PFC (turnos) al 3521 401387.",
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickActions = [
    { text: "¿Qué servicios ofrecen?", icon: Zap },
    { text: "¿Cuáles son los horarios?", icon: Clock },
    { text: "¿Cómo me contacto?", icon: Phone },
    { text: "Quiero descargar mi factura", icon: FileText },
  ]

  const handleQuickAction = (actionText: string) => {
    setInputValue(actionText)
    // Enfocar el input después de un pequeño delay para que el usuario pueda ver la acción
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  return (
    <>
      {/* Botón flotante - Enhanced with Framer Motion */}
      <AnimatePresence mode="wait">
        {!isOpen && (
          <motion.div
            key="chat-button"
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                onClick={() => setIsOpen(true)}
                variant={octubreRosa ? "octubreRosa" : "default"}
                className={cn(
                  "relative h-16 w-16 rounded-full shadow-2xl border-4 border-white/25 backdrop-blur-sm",
                  !octubreRosa &&
                    "bg-gradient-to-br from-coop-blue via-coop-purple to-coop-green hover:from-coop-blue/90 hover:via-coop-purple/90 hover:to-coop-green/90 text-white"
                )}
                aria-label="Abrir asistente virtual"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Bot className="h-7 w-7" />
                </motion.div>
                {/* Círculo naranja con animación de parpadeo fluida */}
                <motion.span
                  className={cn(
                    "absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full shadow-lg z-10",
                    octubreRosa ? "bg-pink-200" : "bg-coop-orange"
                  )}
                  animate={{
                    opacity: [1, 0.4, 1],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.5, 1]
                  }}
                />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ventana de chat - Enhanced with Framer Motion */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, scale: 0.8, y: 20, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20, x: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Card
              className={cn(
                "flex h-[600px] w-[calc(100vw-3rem)] sm:w-[400px] flex-col shadow-2xl md:h-[650px] md:w-[450px] border-2 overflow-hidden",
                octubreRosa ? "border-pink-200/50" : "border-coop-green/20"
              )}
            >
              {/* Header - Enhanced */}
              <div
                className={cn(
                  "flex items-center justify-between p-4 text-white relative overflow-hidden",
                  octubreRosa
                    ? octubreRosaClasses.chatHeader
                    : "bg-gradient-to-r from-coop-blue via-coop-purple to-coop-green"
                )}
              >
                <div className="absolute inset-0 opacity-15 pointer-events-none">
                  <div
                    className={cn(
                      "absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl",
                      octubreRosa ? "bg-pink-200" : "bg-coop-orange"
                    )}
                  />
                </div>

                <div className="flex items-center space-x-3 relative z-10 min-w-0">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 shadow-lg">
                    {octubreRosa ? (
                      <Heart className="h-6 w-6 fill-white/90 text-white" />
                    ) : (
                      <Bot className="h-6 w-6" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg leading-tight truncate">
                      Asistente Virtual
                    </h3>
                    {octubreRosa && (
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-pink-100/95 truncate">
                        Octubre Rosa · Concientización
                      </p>
                    )}
                    <div className="flex items-center space-x-1.5 text-xs text-white/90 mt-0.5">
                      <span className="relative flex h-2.5 w-2.5 shrink-0">
                        <span
                          className={cn(
                            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                            octubreRosa ? "bg-pink-200" : "bg-green-400"
                          )}
                        />
                        <span
                          className={cn(
                            "relative inline-flex h-2.5 w-2.5 rounded-full",
                            octubreRosa ? "bg-pink-100" : "bg-green-400"
                          )}
                        />
                      </span>
                      <span className="font-medium">En línea 24/7</span>
                    </div>
                  </div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-9 w-9 text-white hover:bg-white/20 rounded-lg transition-all duration-300 relative z-10"
                    aria-label="Cerrar chat"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </motion.div>
              </div>

              {/* Área de mensajes - Enhanced with Framer Motion */}
              <ScrollArea
                ref={messagesScrollAreaRef}
                className={cn(
                  "flex-1 p-4 bg-gradient-to-b",
                  octubreRosa
                    ? octubreRosaClasses.chatMessagesBg
                    : "from-gray-50 to-white"
                )}
              >
                <div className="space-y-4">
                  {octubreRosa && messages.length <= 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="flex gap-2.5 rounded-xl border border-pink-200/70 bg-pink-50/90 px-3 py-2.5 shadow-sm"
                    >
                      <Heart className="h-4 w-4 shrink-0 text-pink-500 mt-0.5" aria-hidden />
                      <p className="text-xs leading-relaxed text-pink-950/90">
                        <span className="font-semibold text-pink-700">Octubre Rosa:</span>{" "}
                        mes de concientización sobre el cáncer de mama. Ante dudas, consultá
                        con profesionales de salud. La prevención y el control oportuno son clave.
                      </p>
                    </motion.div>
                  )}

                  {messages.length <= 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="space-y-2"
                    >
                      <p
                        className={cn(
                          "text-xs font-medium mb-2 px-1",
                          octubreRosa ? "text-pink-700/80" : "text-gray-500"
                        )}
                      >
                        Preguntas frecuentes
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {quickActions.map((action, index) => (
                          <motion.button
                            key={index}
                            onClick={() => handleQuickAction(action.text)}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={cn(
                              "flex items-center gap-3 p-3 bg-white border rounded-xl transition-all duration-200 text-left group",
                              octubreRosa
                                ? octubreRosaClasses.chatQuickAction
                                : "border-gray-200 hover:border-coop-green hover:bg-green-50/50"
                            )}
                          >
                            <div
                              className={cn(
                                "flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center transition-colors",
                                octubreRosa
                                  ? octubreRosaClasses.chatQuickActionIcon
                                  : "from-coop-blue/10 to-coop-purple/10 group-hover:from-coop-blue/20 group-hover:to-coop-purple/20"
                              )}
                            >
                              <action.icon
                                className={cn(
                                  "w-4 h-4",
                                  octubreRosa ? "text-pink-600" : "text-coop-green"
                                )}
                              />
                            </div>
                            <span
                              className={cn(
                                "text-sm font-medium flex-1 leading-snug",
                                octubreRosa
                                  ? "text-gray-700 group-hover:text-pink-700"
                                  : "text-gray-700 group-hover:text-coop-green"
                              )}
                            >
                              {action.text}
                            </span>
                            <Send
                              className={cn(
                                "w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0",
                                octubreRosa
                                  ? "text-pink-500"
                                  : "text-gray-400 group-hover:text-coop-green"
                              )}
                            />
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}


                  <AnimatePresence mode="popLayout">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8, y: -10 }}
                        transition={{
                          duration: 0.3,
                          layout: { duration: 0.2 }
                        }}
                        className={cn(
                          "flex w-full items-start space-x-3",
                          message.sender === "user" && "flex-row-reverse space-x-reverse"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-md transition-transform hover:scale-105",
                            message.sender === "user"
                              ? octubreRosa
                                ? octubreRosaClasses.chatUserBubble
                                : "bg-gradient-to-br from-coop-blue via-coop-purple to-coop-green text-white"
                              : octubreRosa
                                ? "bg-gradient-to-br from-pink-400 to-rose-500 text-white"
                                : "bg-gradient-to-br from-coop-orange to-orange-400 text-white"
                          )}
                        >
                          {message.sender === "user" ? (
                            <User className="h-5 w-5" />
                          ) : (
                            <Bot className="h-5 w-5" />
                          )}
                        </div>
                        <div
                          className={cn(
                            "max-w-[280px] sm:max-w-[320px] md:max-w-[360px] rounded-2xl px-4 py-3 break-words overflow-hidden",
                            message.sender === "user"
                              ? octubreRosa
                                ? `${octubreRosaClasses.chatUserBubble} shadow-md`
                                : "bg-gradient-to-br from-coop-blue via-coop-purple to-coop-green text-white shadow-sm"
                              : octubreRosa
                                ? octubreRosaClasses.chatBotBubble
                                : "bg-white text-gray-800 border border-gray-200 shadow-sm"
                          )}
                        >
                          {message.sender === "bot" ? (
                            <div className="text-sm leading-relaxed prose prose-sm max-w-none break-words text-gray-800">
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => (
                                    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                                  ),
                                  ul: ({ children }) => (
                                    <ul className="list-disc list-inside mb-2 space-y-1.5 pl-0.5">
                                      {children}
                                    </ul>
                                  ),
                                  li: ({ children }) => <li className="ml-1 leading-relaxed">{children}</li>,
                                  strong: ({ children }) => (
                                    <strong
                                      className={cn(
                                        "font-semibold",
                                        octubreRosa ? "text-pink-600" : "text-coop-green"
                                      )}
                                    >
                                      {children}
                                    </strong>
                                  ),
                                  em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                                  a: ({ href, children }) => (
                                    <a
                                      href={href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={cn(
                                        "underline break-all font-medium",
                                        octubreRosa
                                          ? "text-pink-600 hover:text-pink-700"
                                          : "text-coop-blue"
                                      )}
                                    >
                                      {children}
                                    </a>
                                  ),
                                }}
                              >
                                {message.text}
                              </ReactMarkdown>
                              {message.invoice && (
                                <div
                                  className={cn(
                                    "mt-3 w-full rounded-lg p-3 flex flex-col gap-2",
                                    octubreRosa
                                      ? "border border-pink-200/80 bg-pink-50/70"
                                      : "border border-coop-green/30 bg-green-50/60"
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "flex items-center gap-2 text-sm font-medium",
                                      octubreRosa ? "text-pink-700" : "text-coop-green"
                                    )}
                                  >
                                    <FileText className="w-4 h-4 shrink-0" />
                                    <span>Factura de {message.invoice.type}</span>
                                  </div>
                                  <p className="text-xs text-gray-700 break-all leading-snug">
                                    Archivo: {message.invoice.fileName}
                                  </p>
                                  <div className="flex justify-start">
                                    <a
                                      href={message.invoice.downloadUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={cn(
                                        "inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full text-white shadow transition-all",
                                        octubreRosa
                                          ? "bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:shadow-md hover:brightness-105"
                                          : "bg-gradient-to-r from-coop-blue to-coop-green hover:shadow-md hover:from-coop-blue/90 hover:to-coop-green/90"
                                      )}
                                    >
                                      <FileText className="w-4 h-4" />
                                      Descargar factura
                                    </a>
                                  </div>
                                </div>
                              )}
                              {message.image && (
                                <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                  <img
                                    src={message.image}
                                    alt="Ubicación del número de cuenta en la boleta"
                                    className="w-full h-auto max-w-full object-contain"
                                    onError={(e) => {
                                      console.error("Error al cargar la imagen:", message.image);
                                      console.error("Evento de error:", e);
                                    }}
                                    onLoad={() => {
                                      console.log("Imagen cargada correctamente:", message.image);
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                          )}
                          <p
                            className={cn(
                              "mt-2 text-[11px] tabular-nums",
                              message.sender === "user"
                                ? octubreRosa
                                  ? "text-pink-100/90"
                                  : "text-green-100"
                                : "text-gray-400"
                            )}
                          >
                            {message.timestamp.toLocaleTimeString("es-AR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <AnimatePresence>
                    {isTyping && (
                      <motion.div
                        key="typing-indicator"
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-start space-x-2"
                      >
                        <motion.div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white",
                            octubreRosa
                              ? "bg-gradient-to-br from-pink-400 to-rose-500"
                              : "bg-coop-orange"
                          )}
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <Bot className="h-4 w-4" />
                        </motion.div>
                        <motion.div
                          className={cn(
                            "rounded-xl px-4 py-2 border",
                            octubreRosa
                              ? "bg-pink-50 border-pink-100"
                              : "bg-gray-100 border-transparent"
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: "auto" }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex space-x-1">
                            {[0, 0.2, 0.4].map((delay) => (
                              <motion.span
                                key={delay}
                                className={cn(
                                  "h-2 w-2 rounded-full",
                                  octubreRosa ? "bg-pink-400" : "bg-gray-400"
                                )}
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay }}
                              />
                            ))}
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input area - Enhanced */}
              <div
                className={cn(
                  "border-t bg-white p-4",
                  octubreRosa ? "border-pink-100" : "border-gray-200"
                )}
              >
                <div className="flex space-x-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribí tu mensaje..."
                    className={cn(
                      "flex-1 border-2 rounded-xl px-4 py-3 transition-all duration-300 text-sm",
                      octubreRosa
                        ? "border-pink-100 focus:border-pink-400 focus:ring-2 focus:ring-pink-200/50"
                        : "border-gray-200 focus:border-coop-green focus:ring-2 focus:ring-coop-green/20"
                    )}
                    disabled={isTyping}
                    autoComplete="off"
                    autoFocus={false}
                  />
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isTyping}
                      variant={octubreRosa ? "octubreRosa" : "default"}
                      className={cn(
                        "rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed",
                        !octubreRosa &&
                          "bg-gradient-to-br from-coop-blue via-coop-purple to-coop-green hover:from-coop-blue/90 hover:via-coop-purple/90 hover:to-coop-green/90 text-white"
                      )}
                      size="icon"
                    >
                      <motion.div
                        animate={inputValue.trim() && !isTyping ? { rotate: [0, 15, -15, 0] } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        <Send className="h-5 w-5" />
                      </motion.div>
                    </Button>
                  </motion.div>
                </div>
                <p
                  className={cn(
                    "mt-3 text-xs text-center flex flex-col sm:flex-row items-center justify-center gap-1 leading-relaxed",
                    octubreRosa ? "text-pink-700/70" : "text-gray-500"
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3 shrink-0" />
                    Disponible 24/7 para ayudarte
                  </span>
                  {octubreRosa && (
                    <span className="hidden sm:inline text-pink-300">·</span>
                  )}
                  {octubreRosa && (
                    <span className="text-pink-600/80 font-medium">
                      Octubre Rosa — concientización y prevención
                    </span>
                  )}
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

