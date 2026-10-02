"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, AlertCircle, PhoneCall, Heart, Zap, Wifi, Building2, FileText, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  getCooperativeLogoSrc,
  isOctubreRosaThemeActive,
  octubreRosaClasses,
} from "@/lib/octubre-rosa-theme"

export default function Footer() {
  const [showAllEmails, setShowAllEmails] = useState(false)
  const octubreRosa = isOctubreRosaThemeActive()
  const logoSrc = getCooperativeLogoSrc()
  const footerTitleClass = cn(
    "font-bold text-lg mb-6",
    octubreRosa ? octubreRosaClasses.footerSectionTitle : "text-coop-orange"
  )
  const footerListLinkClass = cn(
    "text-green-50 transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group",
    octubreRosa ? octubreRosaClasses.footerLinkHover : "hover:text-coop-orange"
  )
  const footerListDotClass = cn(
    "w-1.5 h-1.5 rounded-full transition-colors",
    octubreRosa
      ? "bg-pink-200/60 group-hover:bg-pink-100"
      : "bg-coop-orange/50 group-hover:bg-coop-orange"
  )
  const footerIconAccent = octubreRosa ? "text-pink-200" : "text-coop-orange"
  const footerTextLinkHover = octubreRosa ? "hover:text-pink-200" : "hover:text-coop-orange"

  const emails = [
    { label: "Sistemas", email: "sistemas@cooperativaladormida.com" },
    { label: "Secretaría/RRHH", email: "secretaria-rrhh@cooperativaladormida.com" },
    { label: "Tesorería", email: "tesoreria@cooperativaladormida.com" },
    { label: "Compras", email: "compras@cooperativaladormida.com" },
    { label: "Farmacia", email: "farmacia@cooperativaladormida.com" },
    { label: "Red Eléctrica", email: "redelectrica@cooperativaladormida.com" },
    { label: "Reclamos", email: "admin-reclamos@cooperativaladormida.com" },
    { label: "Consultorios", email: "consultorios@cooperativaladormida.com" },
    { label: "Canal", email: "canal@cooperativaladormida.com" },
    { label: "Internet/Cable", email: "internet-cable@cooperativaladormida.com" },
  ]

  const displayedEmails = showAllEmails ? emails : emails.slice(0, 4)

  return (
    <footer
      className={cn(
        "relative text-white overflow-hidden bg-gradient-to-br from-coop-blue via-coop-purple via-coop-green to-coop-orange",
        octubreRosa && "via-pink-600/90"
      )}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div
          className={cn(
            "absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl",
            octubreRosa ? octubreRosaClasses.footerAccentOrb : "bg-coop-orange"
          )}
        />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        {octubreRosa && (
          <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-rose-300/25 rounded-full blur-3xl" />
        )}
      </div>
      
      <div className="container mx-auto px-4 py-12 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo y descripción - Enhanced */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <div
                  className={cn(
                    "absolute inset-0 rounded-full blur-lg group-hover:blur-xl transition-all opacity-0 group-hover:opacity-100",
                    octubreRosa ? "bg-pink-300/25" : "bg-white/20"
                  )}
                />
                <Image
                  src={logoSrc}
                  alt={
                    octubreRosa
                      ? "Cooperativa La Dormida — Octubre Rosa"
                      : "Cooperativa La Dormida"
                  }
                  width={octubreRosa ? 168 : 56}
                  height={octubreRosa ? 56 : 56}
                  className={cn(
                    "relative z-10 drop-shadow-lg transition-transform group-hover:scale-105 object-contain",
                    octubreRosa ? "h-14 w-auto max-w-[168px]" : "w-14 h-14"
                  )}
                />
              </div>
              <div>
                <h3 className="text-xl font-bold">Cooperativa La Dormida</h3>
                {octubreRosa && (
                  <p className="text-xs font-semibold uppercase tracking-wider text-pink-100/90 mt-0.5">
                    Octubre Rosa
                  </p>
                )}
              </div>
            </div>
            <p className="text-base text-green-50 leading-relaxed">
              Brindando servicios de calidad a nuestra comunidad desde hace más de 60 años con compromiso y excelencia.
            </p>
            {/* Social Media - Enhanced */}
            <div className="flex space-x-4 pt-2">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg border border-white/20"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg border border-white/20"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Servicios - Enhanced */}
          <div>
            <h4 className={footerTitleClass}>Nuestros Servicios</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/servicios" 
                  className={footerListLinkClass}
                >
                  <span className={footerListDotClass} />
                  Electricidad
                </Link>
              </li>
              <li>
                <Link 
                  href="/servicios" 
                  className={footerListLinkClass}
                >
                  <span className={footerListDotClass} />
                  Internet
                </Link>
              </li>
              <li>
                <Link 
                  href="/servicios" 
                  className={footerListLinkClass}
                >
                  <span className={footerListDotClass} />
                  Televisión
                </Link>
              </li>
              <li>
                <Link 
                  href="/servicios" 
                  className={footerListLinkClass}
                >
                  <span className={footerListDotClass} />
                  Programa PFC
                </Link>
              </li>
              <li>
                <Link 
                  href="/servicios" 
                  className={footerListLinkClass}
                >
                  <span className={footerListDotClass} />
                  Farmacia Social
                </Link>
              </li>
              <li>
                <Link 
                  href="/camping" 
                  className={footerListLinkClass}
                >
                  <span className={footerListDotClass} />
                  Camping Pisco Huasi
                </Link>
              </li>
            </ul>
          </div>

          {/* Enlaces útiles - Enhanced */}
          <div>
            <h4 className={footerTitleClass}>Enlaces Útiles</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/noticias" 
                  className={footerListLinkClass}
                >
                  <span className={footerListDotClass} />
                  Noticias
                </Link>
              </li>
              <li>
                <Link 
                  href="/asociarse" 
                  className={footerListLinkClass}
                >
                  <span className={footerListDotClass} />
                  Asociarse
                </Link>
              </li>
              <li>
                <Link 
                  href="/reclamos" 
                  className={footerListLinkClass}
                >
                  <span className={footerListDotClass} />
                  Reclamos
                </Link>
              </li>
              <li>
                <Link 
                  href="/autoridades" 
                  className={footerListLinkClass}
                >
                  <span className={footerListDotClass} />
                  Autoridades
                </Link>
              </li>
              <li>
                <a 
                  href="https://www.cooponlineweb.com.ar/SANJOSEDELADORMIDA/Login" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={footerListLinkClass}
                >
                  <span className={footerListDotClass} />
                  Área Socios (CoopOnline)
                </a>
              </li>
            </ul>
          </div>

          {/* Contacto - Enhanced */}
          <div>
            <h4 className={footerTitleClass}>Contacto</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 group">
                <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                  <MapPin className={cn("w-5 h-5", footerIconAccent)} />
                </div>
                <div>
                  <p className="text-green-50 font-medium">Dirección</p>
                  <p className="text-green-100 text-sm">Av. Perón 557 - CP 5244</p>
                  <p className="text-green-100 text-sm">Córdoba, San José de la Dormida</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 group">
                <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                  <Phone className={cn("w-5 h-5", footerIconAccent)} />
                </div>
                <div>
                  <p className="text-green-50 font-medium">Teléfono</p>
                  <a href="tel:+543521401330" className={cn("text-green-100 text-sm transition-colors block", footerTextLinkHover)}>
                    3521-401330
                  </a>
                  <a
                    href="tel:+5493521401387"
                    className={cn("text-green-100 text-xs transition-colors block mt-1", footerTextLinkHover)}
                  >
                    Consultorios médicos PFC (turnos): 3521 401387
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-3 group">
                <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                  <Mail className={cn("w-5 h-5", footerIconAccent)} />
                </div>
                <div className="flex-1">
                  <p className="text-green-50 font-medium mb-3">Correos Electrónicos</p>
                  <div className="space-y-2 text-xs">
                    {displayedEmails.map((item, index) => (
                      <div key={index} className="flex flex-col">
                        <span className="text-green-200/80 font-medium text-[10px] uppercase tracking-wide mb-0.5">
                          {item.label}
                        </span>
                        <a
                          href={`mailto:${item.email}`}
                          className={cn("text-green-100 transition-colors break-all leading-tight", footerTextLinkHover)}
                        >
                          {item.email}
                        </a>
                      </div>
                    ))}
                    {emails.length > 4 && (
                      <button
                        onClick={() => setShowAllEmails(!showAllEmails)}
                        className={cn("flex items-center gap-1 text-green-200 transition-colors mt-2 text-[10px] font-medium uppercase tracking-wide", footerTextLinkHover)}
                      >
                        {showAllEmails ? (
                          <>
                            <ChevronUp className="w-3 h-3" />
                            Ver menos
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3" />
                            Ver todos ({emails.length - 4} más)
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3 group">
                <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                  <Clock className={cn("w-5 h-5", footerIconAccent)} />
                </div>
                <div>
                  <p className="text-green-50 font-medium">Horario</p>
                  <p className="text-green-100 text-sm">Lun-Jue: 7:00-15:00 | Viernes: 7:00-12:00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Teléfonos de Guardia - Enhanced */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
              <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-6 border-2 border-red-400/30">
              <div className="flex items-center justify-center gap-2 mb-8">
                <AlertCircle className="w-5 h-5 text-red-300" />
                <h4 className="font-bold text-lg text-white">Teléfonos de Guardia 24/7</h4>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                <a 
                  href="tel:+543521406183" 
                  className="flex items-center gap-2 text-green-50 hover:text-red-300 transition-colors text-sm group"
                >
                  <Heart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="font-semibold">Farmacia social</p>
                    <p className="text-xs text-green-100">3521 526358</p>
                  </div>
                </a>
                <a 
                  href="tel:+5493521401387" 
                  className="flex items-center gap-2 text-green-50 hover:text-emerald-300 transition-colors text-sm group"
                >
                  <PhoneCall className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="font-semibold">Consultorios PFC</p>
                    <p className="text-xs text-green-100">3521 401387</p>
                  </div>
                </a>
                <a 
                  href="tel:+543521406186" 
                  className="flex items-center gap-2 text-green-50 hover:text-yellow-300 transition-colors text-sm group"
                >
                  <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="font-semibold">Eléctrica</p>
                    <p className="text-xs text-green-100">3521 406186</p>
                  </div>
                </a>
                <a 
                  href="tel:+543521438313" 
                  className="flex items-center gap-2 text-green-50 hover:text-blue-300 transition-colors text-sm group"
                >
                  <Wifi className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="font-semibold">Internet</p>
                    <p className="text-xs text-green-100">3521 438313</p>
                  </div>
                </a>
                <a 
                  href="tel:+543521401330" 
                  className="flex items-center gap-2 text-green-50 hover:text-green-300 transition-colors text-sm group"
                >
                  <Building2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="font-semibold">Adm.</p>
                    <p className="text-xs text-green-100">3521 401330</p>
                  </div>
                </a>
                <a 
                  href="tel:+543521406189" 
                  className="flex items-center gap-2 text-green-50 hover:text-gray-300 transition-colors text-sm group"
                >
                  <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="font-semibold">Sepelio</p>
                    <p className="text-xs text-green-100">3521 406189</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom - Enhanced */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-green-50 text-sm md:text-base">
              &copy; {new Date().getFullYear()} Cooperativa La Dormida. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-6 text-sm text-green-100">
              <Link href="/politicadeprivacidad" className={cn("transition-colors", footerTextLinkHover)}>Política de Privacidad</Link>
              <span className="text-white/30">|</span>
              <Link href="/condicionesdeservicios" className={cn("transition-colors", footerTextLinkHover)}>Términos y Condiciones</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}