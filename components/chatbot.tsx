"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { MessageCircle, X, Send, Bot, User, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

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
      {/* Botón flotante */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110",
          "bg-coop-green hover:bg-coop-green/90 text-white",
          isOpen && "hidden"
        )}
        aria-label="Abrir chat"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
          </span>
        </span>
      </Button>

      {/* Ventana de chat */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[400px] flex-col shadow-2xl transition-all duration-300 md:h-[650px] md:w-[450px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b bg-coop-green p-4 text-white">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Asistente Virtual</h3>
                <div className="flex items-center space-x-1 text-xs text-green-100">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                  </span>
                  <span>En línea 24/7</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-white hover:bg-white/20"
              aria-label="Cerrar chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Área de mensajes */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start space-x-2",
                    message.sender === "user" && "flex-row-reverse space-x-reverse"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      message.sender === "user"
                        ? "bg-coop-green text-white"
                        : "bg-coop-yellow text-gray-800"
                    )}
                  >
                    {message.sender === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "max-w-[75%] rounded-lg px-4 py-2",
                      message.sender === "user"
                        ? "bg-coop-green text-white"
                        : "bg-gray-100 text-gray-800"
                    )}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="mt-1 text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start space-x-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-coop-yellow text-gray-800">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-lg bg-gray-100 px-4 py-2">
                    <div className="flex space-x-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></span>
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></span>
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input area */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="bg-coop-green hover:bg-coop-green/90 text-white"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-xs text-gray-500 text-center">
              <Clock className="mr-1 inline h-3 w-3" />
              Disponible 24/7 para ayudarte
            </p>
          </div>
        </Card>
      )}
    </>
  )
}

