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
  Users,
  Trees,
  Stethoscope,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  getCooperativeLogoSrc,
  isOctubreRosaThemeActive,
  octubreRosaClasses,
} from "@/lib/octubre-rosa-theme"

interface HeaderProps {
  isLoggedIn?: boolean
  userName?: string
  isPFC?: boolean // Indicates if the user is a PFC (Plan de financiamiento Colectivo) member
}

export default function Header({ isLoggedIn = false, userName, isPFC = false }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const octubreRosa = isOctubreRosaThemeActive()
  const logoSrc = getCooperativeLogoSrc()

  const publicMenuItems = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/servicios", label: "Servicios", icon: Zap },
    { href: "/pfc", label: "PFC", icon: Stethoscope },
    { href: "/noticias", label: "Noticias", icon: Newspaper },
    { href: "/revista", label: "Revista", icon: FileText },
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
    <header
      className={cn(
        "bg-white/95 backdrop-blur-md sticky top-0 z-50 transition-all duration-300",
        octubreRosa
          ? octubreRosaClasses.headerShell
          : "shadow-md border-b border-gray-200/50"
      )}
    >
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
                  className={cn(
                    "absolute inset-0 rounded-full blur-lg",
                    octubreRosa ? octubreRosaClasses.logoGlow : "bg-coop-green/10"
                  )}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1.2 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  whileHover={{ rotate: octubreRosa ? 0 : [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Image
                    src={logoSrc}
                    alt={
                      octubreRosa
                        ? "Cooperativa La Dormida — Octubre Rosa"
                        : "Cooperativa La Dormida"
                    }
                    width={octubreRosa ? 160 : 56}
                    height={octubreRosa ? 56 : 56}
                    className={cn(
                      "transition-all duration-300 relative z-10 drop-shadow-sm object-contain",
                      octubreRosa
                        ? "h-11 w-auto max-w-[140px] lg:h-14 lg:max-w-[168px]"
                        : "w-12 h-12 lg:w-14 lg:h-14"
                    )}
                  />
                </motion.div>
              </div>
              <div className="hidden sm:block">
                <h1
                  className={cn(
                    "text-lg lg:text-xl font-bold whitespace-nowrap transition-colors",
                    octubreRosa
                      ? `${octubreRosaClasses.brandTitle} group-hover:text-pink-700`
                      : "text-coop-green group-hover:text-coop-blue"
                  )}
                >
                  Cooperativa La Dormida
                </h1>

                {octubreRosa && (
                  <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-wider text-pink-600/90">
                    Octubre Rosa
                  </span>
                )}
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
                  className={cn(
                    "group relative flex items-center space-x-2 px-4 py-2 text-gray-700 font-medium rounded-lg transition-all duration-300",
                    octubreRosa ? octubreRosaClasses.navLinkHover : "hover:text-coop-green"
                  )}
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
                      className={cn(
                        "absolute bottom-0 left-0 h-0.5",
                        octubreRosa
                          ? octubreRosaClasses.navUnderline
                          : "bg-gradient-to-r from-coop-blue via-coop-purple to-coop-green"
                      )}
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
                    className="hidden lg:flex items-center space-x-2 border-2 border-coop-green/30 text-coop-green hover:bg-gradient-to-r hover:from-coop-blue hover:via-coop-purple hover:to-coop-green hover:text-white hover:border-coop-green transition-all duration-300 shadow-sm hover:shadow-md font-medium px-4 py-2"
                  >
                    <User className="w-4 h-4" />
                    <span className="max-w-24 truncate">{userName || "Usuario"}</span>
                    {isPFC && <ShieldCheck className="w-4 h-4 text-blue-500 animate-pulse" />}
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
              <a
                href="https://www.cooponlineweb.com.ar/SANJOSEDELADORMIDA/Login"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Button
                  variant={octubreRosa ? "octubreRosa" : "default"}
                  className={cn(
                    "hidden lg:flex px-6 py-2 hover:scale-105",
                    octubreRosa
                      ? octubreRosaClasses.ctaButton
                      : "bg-gradient-to-r from-coop-blue via-coop-purple to-coop-green hover:from-coop-blue/90 hover:via-coop-purple/90 hover:to-coop-green/90 text-white shadow-md hover:shadow-lg"
                  )}
                >
                  Pagar Factura
                </Button>
              </a>
            )}

            {/* Mobile Menu Button - Enhanced */}
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="lg:hidden"
            >
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "relative w-11 h-11 rounded-xl bg-gradient-to-br border-2 transition-all duration-300 shadow-md hover:shadow-lg",
                  octubreRosa
                    ? octubreRosaClasses.mobileMenuButton
                    : "from-coop-blue/10 via-coop-purple/10 to-coop-green/10 hover:from-coop-blue/20 hover:via-coop-purple/20 hover:to-coop-green/20 active:from-coop-blue/30 active:via-coop-purple/30 active:to-coop-green/30 border-coop-green/20 hover:border-coop-green/40"
                )}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
              >
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <motion.div
                    initial={false}
                    animate={isMenuOpen ? { rotate: 90, opacity: 0, scale: 0 } : { rotate: 0, opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="absolute"
                  >
                    <Menu className={cn("w-5 h-5", octubreRosa ? octubreRosaClasses.mobileMenuIcon : "text-coop-green")} />
                  </motion.div>
                  <motion.div
                    initial={false}
                    animate={isMenuOpen ? { rotate: 0, opacity: 1, scale: 1 } : { rotate: -90, opacity: 0, scale: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="absolute"
                  >
                    <X className={cn("w-5 h-5", octubreRosa ? octubreRosaClasses.mobileMenuIcon : "text-coop-green")} />
                  </motion.div>
                </div>
                {/* Indicador de estado */}
                {isMenuOpen && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      "absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white",
                      octubreRosa ? "bg-pink-500" : "bg-coop-orange"
                    )}
                  />
                )}
              </Button>
            </motion.div>
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
                        className={cn(
                          "flex items-center space-x-3 px-4 py-3.5 text-base text-gray-800 hover:bg-gradient-to-r transition-all duration-300 rounded-xl group",
                          octubreRosa
                            ? octubreRosaClasses.mobileNavHover
                            : "hover:from-coop-blue/10 hover:via-coop-purple/10 hover:to-coop-green/10 hover:text-coop-green"
                        )}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <motion.div
                          className={cn(
                            "w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm",
                            octubreRosa
                              ? octubreRosaClasses.mobileNavIconBg
                              : "from-coop-blue/10 via-coop-purple/10 to-coop-green/10"
                          )}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <item.icon
                            className={cn(
                              "w-5 h-5",
                              octubreRosa ? octubreRosaClasses.mobileNavIcon : "text-coop-green"
                            )}
                          />
                        </motion.div>
                        <span className="font-semibold">{item.label}</span>
                        <motion.div
                          className="ml-auto"
                          whileHover={{ x: 5 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-coop-green transition-colors" />
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
                          onClick={() => { }}
                        >
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                            <LogOut className="w-5 h-5 text-red-600" />
                          </div>
                          <span className="font-semibold">Cerrar Sesión</span>
                          <ArrowRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
                        </button>
                      </div>
                    ) : (
                      <a
                        href="https://www.cooponlineweb.com.ar/SANJOSEDELADORMIDA/Login"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mx-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Button
                          size="lg"
                          variant={octubreRosa ? "octubreRosa" : "default"}
                          className={cn(
                            "w-full font-semibold py-4 text-lg transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl",
                            octubreRosa
                              ? octubreRosaClasses.ctaButton
                              : "bg-gradient-to-r from-coop-blue via-coop-purple to-coop-green hover:from-coop-blue/90 hover:via-coop-purple/90 hover:to-coop-green/90 text-white"
                          )}
                        >
                          Pagar Factura
                        </Button>
                      </a>
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