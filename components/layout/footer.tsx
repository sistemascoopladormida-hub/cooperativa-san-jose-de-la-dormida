import Link from "next/link"
import Image from "next/image"
import { Phone, Mail, MapPin, Clock, Facebook, Instagram } from "lucide-react"

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-coop-blue via-coop-purple via-coop-green to-coop-orange text-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-coop-orange rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 py-12 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo y descripción - Enhanced */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-lg group-hover:blur-xl transition-all opacity-0 group-hover:opacity-100"></div>
                <Image
                  src="/images/logocoopnuevo.jpg"
                  alt="Cooperativa La Dormida"
                  width={56}
                  height={56}
                  className="w-14 h-14 relative z-10 drop-shadow-lg transition-transform group-hover:scale-110"
                />
              </div>
              <h3 className="text-xl font-bold">Cooperativa La Dormida</h3>
            </div>
            <p className="text-base text-green-50 leading-relaxed">
              Brindando servicios de calidad a nuestra comunidad desde hace más de 50 años con compromiso y excelencia.
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
            <h4 className="font-bold text-lg mb-6 text-coop-orange">Nuestros Servicios</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/servicios/electricidad" 
                  className="text-green-50 hover:text-coop-orange transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-coop-orange/50 group-hover:bg-coop-orange transition-colors"></span>
                  Electricidad
                </Link>
              </li>
              <li>
                <Link 
                  href="/servicios/internet" 
                  className="text-green-50 hover:text-coop-orange transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-coop-orange/50 group-hover:bg-coop-orange transition-colors"></span>
                  Internet
                </Link>
              </li>
              <li>
                <Link 
                  href="/servicios/television" 
                  className="text-green-50 hover:text-coop-orange transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-coop-orange/50 group-hover:bg-coop-orange transition-colors"></span>
                  Televisión
                </Link>
              </li>
              <li>
                <Link 
                  href="/servicios/farmacia" 
                  className="text-green-50 hover:text-coop-orange transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-coop-orange/50 group-hover:bg-coop-orange transition-colors"></span>
                  Farmacia Social
                </Link>
              </li>
              <li>
                <Link 
                  href="/servicios/sociales" 
                  className="text-green-50 hover:text-coop-orange transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-coop-orange/50 group-hover:bg-coop-orange transition-colors"></span>
                  Servicios Sociales
                </Link>
              </li>
            </ul>
          </div>

          {/* Enlaces útiles - Enhanced */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-coop-orange">Enlaces Útiles</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/noticias" 
                  className="text-green-50 hover:text-coop-orange transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-coop-orange/50 group-hover:bg-coop-orange transition-colors"></span>
                  Noticias
                </Link>
              </li>
              <li>
                <Link 
                  href="/asociarse" 
                  className="text-green-50 hover:text-coop-orange transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-coop-orange/50 group-hover:bg-coop-orange transition-colors"></span>
                  Asociarse
                </Link>
              </li>
              <li>
                <Link 
                  href="/contacto" 
                  className="text-green-50 hover:text-coop-orange transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-coop-orange/50 group-hover:bg-coop-orange transition-colors"></span>
                  Contacto
                </Link>
              </li>
              <li>
                <Link 
                  href="/reclamos" 
                  className="text-green-50 hover:text-coop-orange transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-coop-orange/50 group-hover:bg-coop-orange transition-colors"></span>
                  Reclamos
                </Link>
              </li>
              <li>
                <Link 
                  href="/login" 
                  className="text-green-50 hover:text-coop-orange transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-coop-orange/50 group-hover:bg-coop-orange transition-colors"></span>
                  Área Socios
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto - Enhanced */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-coop-orange">Contacto</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 group">
                <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                  <MapPin className="w-5 h-5 text-coop-orange" />
                </div>
                <div>
                  <p className="text-green-50 font-medium">Dirección</p>
                  <p className="text-green-100 text-sm">Av. Principal 123, La Dormida</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 group">
                <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                  <Phone className="w-5 h-5 text-coop-orange" />
                </div>
                <div>
                  <p className="text-green-50 font-medium">Teléfono</p>
                  <a href="tel:+541234567890" className="text-green-100 text-sm hover:text-coop-orange transition-colors">
                    (0123) 456-7890
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-3 group">
                <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                  <Mail className="w-5 h-5 text-coop-orange" />
                </div>
                <div>
                  <p className="text-green-50 font-medium">Email</p>
                  <a href="mailto:info@coopladormida.com.ar" className="text-green-100 text-sm hover:text-coop-orange transition-colors break-all">
                    info@coopladormida.com.ar
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-3 group">
                <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                  <Clock className="w-5 h-5 text-coop-orange" />
                </div>
                <div>
                  <p className="text-green-50 font-medium">Horario</p>
                  <p className="text-green-100 text-sm">Lun-Vie: 8:00-17:00</p>
                </div>
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
              <a href="#" className="hover:text-coop-orange transition-colors">Política de Privacidad</a>
              <span className="text-white/30">|</span>
              <a href="#" className="hover:text-coop-orange transition-colors">Términos y Condiciones</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
