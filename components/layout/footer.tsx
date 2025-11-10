import Link from "next/link"
import Image from "next/image"
import { Phone, Mail, MapPin, Clock, Facebook, Instagram } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-coop-green text-white">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Image
                src="/images/logo-coop.png"
                alt="Cooperativa La Dormida"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <h3 className="text-lg font-bold">Cooperativa La Dormida</h3>
            </div>
            <p className="text-sm text-green-100">
              Brindando servicios de calidad a nuestra comunidad desde hace más de 50 años.
            </p>
          </div>

          {/* Servicios */}
          <div>
            <h4 className="font-semibold mb-4">Nuestros Servicios</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/servicios/electricidad" className="hover:text-coop-yellow transition-colors">
                  Electricidad
                </Link>
              </li>
              <li>
                <Link href="/servicios/internet" className="hover:text-coop-yellow transition-colors">
                  Internet
                </Link>
              </li>
              <li>
                <Link href="/servicios/television" className="hover:text-coop-yellow transition-colors">
                  Televisión
                </Link>
              </li>
              <li>
                <Link href="/servicios/farmacia" className="hover:text-coop-yellow transition-colors">
                  Farmacia Social
                </Link>
              </li>
              <li>
                <Link href="/servicios/sociales" className="hover:text-coop-yellow transition-colors">
                  Servicios Sociales
                </Link>
              </li>
            </ul>
          </div>

          {/* Enlaces útiles */}
          <div>
            <h4 className="font-semibold mb-4">Enlaces Útiles</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/noticias" className="hover:text-coop-yellow transition-colors">
                  Noticias
                </Link>
              </li>
              <li>
                <Link href="/asociarse" className="hover:text-coop-yellow transition-colors">
                  Asociarse
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-coop-yellow transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/reclamos" className="hover:text-coop-yellow transition-colors">
                  Reclamos
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-coop-yellow transition-colors">
                  Área Socios
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>Av. Principal 123, La Dormida</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>(0123) 456-7890</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>info@coopladormida.com.ar</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>Lun-Vie: 8:00-17:00</span>
              </div>
            </div>

            {/* Redes sociales */}
            <div className="flex space-x-3 mt-4">
              <a href="#" className="hover:text-coop-yellow transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-coop-yellow transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-green-600 mt-8 pt-6 text-center text-sm">
          <p>&copy; 2024 Cooperativa La Dormida. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
