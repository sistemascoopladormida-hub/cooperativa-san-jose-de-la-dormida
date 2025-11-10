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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
    <header className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href={isLoggedIn ? "/dashboard" : "/"} className="flex items-center space-x-3 group">
            <div className="relative">
              <Image
                src="/images/logo-coop.png"
                alt="Cooperativa La Dormida"
                width={50}
                height={50}
                className="w-10 h-10 lg:w-12 lg:h-12 transition-transform group-hover:scale-105"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg lg:text-xl font-bold text-coop-green leading-tight">
                Cooperativa
                <br />
                <span className="text-sm lg:text-base font-medium text-gray-600">La Dormida</span>
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-2 text-gray-700 hover:text-coop-green font-medium transition-all duration-200 hover:scale-105"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="hidden lg:flex items-center space-x-2 border-coop-green text-coop-green hover:bg-coop-green hover:text-white transition-all duration-200"
                  >
                    <User className="w-4 h-4" />
                    <span className="max-w-24 truncate">{userName || "Usuario"}</span>
                    {isPFC && <ShieldCheck className="w-4 h-4 text-blue-500" title="Usuario PFC" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/perfil" className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Mi Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button className="hidden lg:flex bg-coop-green hover:bg-coop-green/90 text-white font-medium px-6 transition-all duration-200 hover:scale-105 shadow-md">
                  Iniciar Sesión
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden relative w-12 h-12 rounded-lg hover:bg-coop-green/10 transition-all duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              <div className="relative w-6 h-6">
                <Menu
                  className={`w-6 h-6 absolute transition-all duration-300 ${isMenuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"}`}
                />
                <X
                  className={`w-6 h-6 absolute transition-all duration-300 ${isMenuOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"}`}
                />
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
<div
  className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
    isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
  }`}
>

          <div className="border-t bg-white">
            <nav className="py-4 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 text-lg text-gray-800 hover:bg-coop-green/10 hover:text-coop-green transition-all duration-200 rounded-lg mx-2 group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-10 h-10 rounded-lg bg-coop-green/10 flex items-center justify-center group-hover:bg-coop-green/20 transition-colors duration-200">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}

              {/* Mobile User Actions */}
              <div className="border-t pt-4 mt-4 mx-2">
                {isLoggedIn ? (
                  <div className="space-y-1">
                    <div className="px-4 py-2 text-lg text-gray-600 font-medium">
                      Hola, {userName || "Usuario"}{" "}
                      {isPFC && (
                        <span className="text-blue-500" title="Usuario PFC">
                          (PFC)
                        </span>
                      )}
                    </div>
                    <Link
                      href="/perfil"
                      className="flex items-center space-x-3 px-4 py-3 text-lg text-gray-800 hover:bg-coop-green/10 hover:text-coop-green transition-all duration-200 rounded-lg group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <span className="font-medium">Mi Perfil</span>
                    </Link>
                    <button
                      className="flex items-center space-x-3 px-4 py-3 text-lg text-gray-800 hover:bg-red-50 hover:text-red-600 transition-all duration-200 rounded-lg w-full group"
                      onClick={() => {}}
                    >
                      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors duration-200">
                        <LogOut className="w-6 h-6 text-red-600" />
                      </div>
                      <span className="font-medium">Cerrar Sesión</span>
                    </button>
                  </div>
                ) : (
                  <Link href="/login" className="block mx-2" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-coop-green hover:bg-coop-green/90 text-white font-medium py-4 text-xl transition-all duration-200 hover:scale-[1.02] shadow-md">
                      Iniciar Sesión
                    </Button>
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}
