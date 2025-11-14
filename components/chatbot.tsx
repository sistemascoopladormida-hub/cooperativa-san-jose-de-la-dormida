"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { MessageCircle, X, Send, Bot, User, Clock, Zap, Phone, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "¡Hola! 👋 Soy el asistente virtual de la Cooperativa La Dormida. Estoy aquí para ayudarte 24/7. ¿En qué puedo asistirte hoy?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Removido el auto-focus para evitar que se abra el teclado en móviles
  // El usuario puede hacer click en el input cuando quiera escribir

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

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
        body: JSON.stringify({ messages: messagesToSend }),
      })

      if (!response.ok) {
        throw new Error('Error al obtener respuesta')
      }

      const data = await response.json()
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "Lo siento, no pude procesar tu consulta en este momento. Por favor, intenta de nuevo o contacta directamente con nuestra oficina.",
        sender: "bot",
        timestamp: new Date(),
      }
      
      setMessages((prev) => [...prev, botResponse])
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Lo siento, hubo un error al procesar tu consulta. Por favor, intenta de nuevo o contacta directamente con nuestra oficina al 3521-401330.",
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
    { text: "¿Cómo me asocio?", icon: HelpCircle },
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
                className={cn(
                  "h-16 w-16 rounded-full shadow-2xl",
                  "bg-gradient-to-br from-coop-blue via-coop-purple to-coop-green hover:from-coop-blue/90 hover:via-coop-purple/90 hover:to-coop-green/90 text-white",
                  "border-4 border-white/20 backdrop-blur-sm"
                )}
                aria-label="Abrir chat"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Bot className="h-7 w-7" />
                </motion.div>
                {/* Círculo naranja con animación de parpadeo fluida */}
                <motion.span 
                  className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-coop-orange shadow-lg z-10"
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
            <Card className="flex h-[600px] w-[calc(100vw-3rem)] sm:w-[400px] flex-col shadow-2xl md:h-[650px] md:w-[450px] border-2 border-coop-green/20 overflow-hidden">
          {/* Header - Enhanced */}
          <div className="flex items-center justify-between bg-gradient-to-r from-coop-blue via-coop-purple to-coop-green p-4 text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-coop-orange rounded-full blur-2xl"></div>
            </div>
            
            <div className="flex items-center space-x-3 relative z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 shadow-lg">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Asistente Virtual</h3>
                <div className="flex items-center space-x-1.5 text-xs text-green-50">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400"></span>
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
          <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-gray-50 to-white">
            <div className="space-y-4">
              {/* Botones de acción rápida - Solo se muestran cuando hay pocos mensajes */}
              {messages.length <= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2"
                >
                  <p className="text-xs font-medium text-gray-500 mb-2 px-1">Preguntas frecuentes:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {quickActions.map((action, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleQuickAction(action.text)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-coop-green hover:bg-green-50/50 transition-all duration-200 text-left group"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-coop-blue/10 to-coop-purple/10 flex items-center justify-center group-hover:from-coop-blue/20 group-hover:to-coop-purple/20 transition-colors">
                          <action.icon className="w-4 h-4 text-coop-green" />
                        </div>
                        <span className="text-sm text-gray-700 group-hover:text-coop-green font-medium flex-1">
                          {action.text}
                        </span>
                        <Send className="w-3 h-3 text-gray-400 group-hover:text-coop-green opacity-0 group-hover:opacity-100 transition-opacity" />
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
                      "flex items-start space-x-3",
                      message.sender === "user" && "flex-row-reverse space-x-reverse"
                    )}
                  >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-md transition-transform hover:scale-110",
                      message.sender === "user"
                        ? "bg-gradient-to-br from-coop-blue via-coop-purple to-coop-green text-white"
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
                      "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
                      message.sender === "user"
                        ? "bg-gradient-to-br from-coop-blue via-coop-purple to-coop-green text-white"
                        : "bg-white text-gray-800 border border-gray-200"
                    )}
                  >
                    {message.sender === "bot" ? (
                      <div className="text-sm leading-relaxed prose prose-sm max-w-none">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                            li: ({ children }) => <li className="ml-2">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold text-coop-green">{children}</strong>,
                            em: ({ children }) => <em className="italic">{children}</em>,
                          }}
                        >
                          {message.text}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                    )}
                    <p className={cn(
                      "mt-2 text-xs",
                      message.sender === "user" ? "text-green-100" : "text-gray-500"
                    )}>
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
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-coop-orange text-white"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Bot className="h-4 w-4" />
                    </motion.div>
                    <motion.div 
                      className="rounded-lg bg-gray-100 px-4 py-2"
                      initial={{ width: 0 }}
                      animate={{ width: "auto" }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex space-x-1">
                        <motion.span 
                          className="h-2 w-2 rounded-full bg-gray-400"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.span 
                          className="h-2 w-2 rounded-full bg-gray-400"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.span 
                          className="h-2 w-2 rounded-full bg-gray-400"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input area - Enhanced */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje aquí..."
                className="flex-1 border-2 border-gray-200 focus:border-coop-green focus:ring-2 focus:ring-coop-green/20 rounded-xl px-4 py-3 transition-all duration-300"
                disabled={isTyping}
                autoComplete="off"
                autoFocus={false}
              />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-gradient-to-br from-coop-blue via-coop-purple to-coop-green hover:from-coop-blue/90 hover:via-coop-purple/90 hover:to-coop-green/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-4"
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
            <p className="mt-3 text-xs text-gray-500 text-center flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Disponible 24/7 para ayudarte</span>
            </p>
          </div>
        </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

