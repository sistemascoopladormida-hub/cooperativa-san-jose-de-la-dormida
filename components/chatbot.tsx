"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { MessageCircle, X, Send, Bot, User, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

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
      text: "¡Hola! Soy el asistente virtual de la Cooperativa La Dormida. Estoy aquí para ayudarte 24/7. ¿En qué puedo asistirte hoy?",
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

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

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

    // Simular respuesta del bot (aquí puedes integrar con tu API de chatbot)
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(inputValue),
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
      setIsTyping(false)
    }, 1000)
  }

  const generateBotResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase()

    if (lowerInput.includes("servicio") || lowerInput.includes("electricidad") || lowerInput.includes("internet")) {
      return "Ofrecemos servicios de electricidad, internet, televisión y farmacia social. Puedes encontrar más información en la sección de Servicios de nuestra página web."
    }

    if (lowerInput.includes("asociarse") || lowerInput.includes("socio") || lowerInput.includes("asociado")) {
      return "Para asociarte a nuestra cooperativa, puedes visitar nuestra oficina o completar el formulario en la sección 'Asociarse' de nuestra página web. ¡Estaremos encantados de tenerte como parte de nuestra familia cooperativa!"
    }

    if (lowerInput.includes("contacto") || lowerInput.includes("teléfono") || lowerInput.includes("telefono")) {
      return "Puedes contactarnos a través de la sección 'Contacto' de nuestra página web, donde encontrarás nuestros números de teléfono, correo electrónico y dirección. También puedes visitarnos en nuestras oficinas."
    }

    if (lowerInput.includes("pago") || lowerInput.includes("boleta") || lowerInput.includes("factura")) {
      return "Para realizar pagos o consultar tus boletas, puedes acceder al Área de Socios en nuestra página web. Si necesitas ayuda con el proceso, no dudes en contactarnos."
    }

    if (lowerInput.includes("reclamo") || lowerInput.includes("problema") || lowerInput.includes("queja")) {
      return "Lamentamos cualquier inconveniente. Puedes presentar tu reclamo a través de la sección 'Reclamos' en nuestra página web o contactarnos directamente. Nos comprometemos a resolver tu situación lo antes posible."
    }

    if (lowerInput.includes("horario") || lowerInput.includes("atención") || lowerInput.includes("atencion")) {
      return "Nuestro horario de atención presencial es de lunes a viernes de 8:00 a 17:00 horas. Sin embargo, este asistente virtual está disponible 24/7 para ayudarte con tus consultas."
    }

    if (lowerInput.includes("hola") || lowerInput.includes("buenos días") || lowerInput.includes("buenas tardes") || lowerInput.includes("buenas noches")) {
      return "¡Hola! Gracias por contactarnos. ¿En qué puedo ayudarte hoy? Puedo asistirte con información sobre nuestros servicios, asociación, pagos y más."
    }

    return "Gracias por tu consulta. Puedo ayudarte con información sobre nuestros servicios, cómo asociarte, realizar pagos, presentar reclamos y más. ¿Hay algo específico en lo que pueda asistirte?"
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
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
                <motion.span 
                  className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-coop-orange text-xs text-white shadow-lg"
                  animate={{ 
                    scale: [1, 1.15, 1],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <motion.span 
                    className="relative flex h-3 w-3 items-center justify-center"
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.75, 0, 0.75]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                  >
                    <span className="absolute inline-flex h-full w-full rounded-full bg-yellow-400"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-coop-orange border border-orange-600/30"></span>
                  </motion.span>
                </motion.span>
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
                    <p className="text-sm leading-relaxed">{message.text}</p>
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
                placeholder="Escribe tu mensaje..."
                className="flex-1 border-2 border-gray-200 focus:border-coop-green focus:ring-2 focus:ring-coop-green/20 rounded-xl px-4 py-3 transition-all duration-300"
                disabled={isTyping}
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

