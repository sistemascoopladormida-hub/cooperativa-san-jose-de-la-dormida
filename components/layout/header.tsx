"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Menu,
  X,
  User,
  LogOut,
  Home,
  Zap,
  Newspaper,
  Phone,
  UserPlus,
  FileText,
  CreditCard,
  MessageSquare,
  Gift,
  Heart,
  ShieldCheck,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"

interface HeaderProps {
  isLoggedIn?: boolean
  userName?: string
  isPFC?: boolean // Indicates if the user is a PFC (Programa de Fortalecimiento Comunitario) member
}

export default function Header({ isLoggedIn = false, userName, isPFC = false }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const publicMenuItems = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/servicios", label: "Servicios", icon: Zap },
    { href: "/noticias", label: "Noticias", icon: Newspaper },
    { href: "/contacto", label: "Contacto", icon: Phone },
    { href: "/asociarse", label: "Asociarse", icon: UserPlus },
  ]

  const privateMenuItems = [
    { href: "/dashboard", label: "Mi Panel", icon: Home },
    { href: "/boletas", label: "Boletas", icon: FileText },
    { href: "/pagos", label: "Pagos", icon: CreditCard },
    { href: "/reclamos", label: "Reclamos", icon: MessageSquare },
    { href: "/beneficios", label: "Beneficios", icon: Gift },
    { href: "/farmacia", label: "Farmacia", icon: Heart },
  ]

  const menuItems = isLoggedIn ? privateMenuItems : publicMenuItems

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-gray-200/50 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo - Enhanced with Framer Motion */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href={isLoggedIn ? "/dashboard" : "/"} className="flex items-center space-x-3 group">
              <div className="relative">
                <motion.div 
                  className="absolute inset-0 bg-coop-green/10 rounded-full blur-lg"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1.2 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Image
                    src="/images/logo-coop.png"
                    alt="Cooperativa La Dormida"
                    width={56}
                    height={56}
                    className="w-12 h-12 lg:w-14 lg:h-14 transition-all duration-300 relative z-10 drop-shadow-sm"
                  />
                </motion.div>
              </div>
            <div className="hidden sm:block">
              <h1 className="text-lg lg:text-xl font-bold text-coop-green leading-tight transition-colors group-hover:text-green-700">
                Cooperativa
                <br />
                <span className="text-sm lg:text-base font-semibold text-gray-700 group-hover:text-gray-900">La Dormida</span>
              </h1>
            </div>
          </Link>
          </motion.div>

          {/* Desktop Navigation - Enhanced with Framer Motion */}
          <nav className="hidden lg:flex items-center space-x-2">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className="group relative flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-coop-green font-medium rounded-lg transition-all duration-300"
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <item.icon className="w-4 h-4" />
                  </motion.div>
                  <span className="relative">
                    {item.label}
                    <motion.span 
                      className="absolute bottom-0 left-0 h-0.5 bg-coop-green"
                      initial={{ width: 0 }}
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </span>
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="hidden lg:flex items-center space-x-2 border-2 border-coop-green/30 text-coop-green hover:bg-coop-green hover:text-white hover:border-coop-green transition-all duration-300 shadow-sm hover:shadow-md font-medium px-4 py-2"
                  >
                    <User className="w-4 h-4" />
                    <span className="max-w-24 truncate">{userName || "Usuario"}</span>
                    {isPFC && <ShieldCheck className="w-4 h-4 text-blue-500 animate-pulse" title="Usuario PFC" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 shadow-xl border-gray-200">
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/perfil" className="flex items-center w-full">
                      <User className="w-4 h-4 mr-2" />
                      Mi Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="group">
                <Button className="hidden lg:flex bg-coop-green hover:bg-coop-green/90 text-white font-semibold px-6 py-2 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg">
                  Iniciar Sesión
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button - Enhanced */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden relative w-12 h-12 rounded-xl hover:bg-coop-green/10 active:bg-coop-green/20 transition-all duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              <div className="relative w-6 h-6">
                <Menu
                  className={`w-6 h-6 absolute transition-all duration-300 ${isMenuOpen ? "rotate-90 opacity-0 scale-0" : "rotate-0 opacity-100 scale-100"}`}
                />
                <X
                  className={`w-6 h-6 absolute transition-all duration-300 ${isMenuOpen ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-0"}`}
                />
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation - Enhanced with Framer Motion */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden overflow-hidden"
            >
              <div className="border-t border-gray-200 bg-white/98 backdrop-blur-sm shadow-lg">
                <nav className="py-4 space-y-2 px-2">
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center space-x-3 px-4 py-3.5 text-base text-gray-800 hover:bg-gradient-to-r hover:from-coop-green/10 hover:to-green-50 hover:text-coop-green transition-all duration-300 rounded-xl group"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <motion.div 
                          className="w-11 h-11 rounded-xl bg-gradient-to-br from-coop-green/10 to-green-50 flex items-center justify-center shadow-sm"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <item.icon className="w-5 h-5 text-coop-green" />
                        </motion.div>
                        <span className="font-semibold">{item.label}</span>
                        <motion.div
                          className="ml-auto"
                          whileHover={{ x: 5 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-coop-green" />
                        </motion.div>
                      </Link>
                    </motion.div>
                  ))}

              {/* Mobile User Actions - Enhanced */}
              <div className="border-t border-gray-200 pt-4 mt-4 mx-2">
                {isLoggedIn ? (
                  <div className="space-y-2">
                    <div className="px-4 py-3 text-base text-gray-700 font-semibold bg-gradient-to-r from-coop-green/5 to-green-50 rounded-xl">
                      Hola, {userName || "Usuario"}{" "}
                      {isPFC && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold ml-2" title="Usuario PFC">
                          <ShieldCheck className="w-3 h-3" />
                          PFC
                        </span>
                      )}
                    </div>
                    <Link
                      href="/perfil"
                      className="flex items-center space-x-3 px-4 py-3.5 text-base text-gray-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 hover:text-blue-700 transition-all duration-300 rounded-xl group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="font-semibold">Mi Perfil</span>
                      <ArrowRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </Link>
                    <button
                      className="flex items-center space-x-3 px-4 py-3.5 text-base text-gray-800 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/50 hover:text-red-600 transition-all duration-300 rounded-xl w-full group"
                      onClick={() => {}}
                    >
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <LogOut className="w-5 h-5 text-red-600" />
                      </div>
                      <span className="font-semibold">Cerrar Sesión</span>
                      <ArrowRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
                    </button>
                  </div>
                ) : (
                  <Link href="/login" className="block mx-2" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-coop-green to-green-700 hover:from-coop-green/90 hover:to-green-600 text-white font-semibold py-4 text-lg transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl">
                      Iniciar Sesión
                    </Button>
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
