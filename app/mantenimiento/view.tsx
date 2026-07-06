"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Ambulance,
  Building2,
  CalendarClock,
  Cog,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Wifi,
  Wrench,
  Zap,
} from "lucide-react"

function MaintenanceIllustration() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.15 }}
      className="relative mx-auto w-full max-w-[440px]"
      aria-hidden="true"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur-xl"
      >
        <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-coop-orange/30 blur-3xl" />
        <div className="absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-coop-green/30 blur-3xl" />

        <svg
          viewBox="0 0 420 260"
          role="img"
          aria-label="Ilustración de mantenimiento del sitio web"
          className="h-auto w-full"
        >
          <defs>
            <linearGradient id="serverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e40af" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
            <linearGradient id="panelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>

          <rect x="20" y="36" width="380" height="190" rx="24" fill="#f8fafc" />
          <rect x="44" y="58" width="332" height="40" rx="12" fill="url(#serverGradient)" opacity="0.92" />
          <rect x="44" y="112" width="332" height="40" rx="12" fill="url(#panelGradient)" opacity="0.18" />
          <rect x="44" y="166" width="332" height="40" rx="12" fill="url(#panelGradient)" opacity="0.18" />

          <circle cx="334" cy="78" r="5.5" fill="#ffffff" />
          <circle cx="354" cy="78" r="5.5" fill="#ffffff" opacity="0.75" />

          <g transform="translate(70 122)">
            <rect x="0" y="0" width="130" height="20" rx="8" fill="#dbeafe" />
            <rect x="0" y="28" width="80" height="12" rx="6" fill="#bbf7d0" />
          </g>

          <g transform="translate(246 118)">
            <circle cx="20" cy="20" r="20" fill="#dcfce7" />
            <path
              d="M21 9.2a1.2 1.2 0 0 0-2.4 0v2.4a8.4 8.4 0 0 0-2.36.99l-1.7-1.7a1.2 1.2 0 1 0-1.7 1.7l1.7 1.7a8.4 8.4 0 0 0-.99 2.36h-2.4a1.2 1.2 0 1 0 0 2.4h2.4a8.4 8.4 0 0 0 .99 2.36l-1.7 1.7a1.2 1.2 0 1 0 1.7 1.7l1.7-1.7a8.4 8.4 0 0 0 2.36.99v2.4a1.2 1.2 0 1 0 2.4 0v-2.4a8.4 8.4 0 0 0 2.36-.99l1.7 1.7a1.2 1.2 0 1 0 1.7-1.7l-1.7-1.7a8.4 8.4 0 0 0-.99-2.36h2.4a1.2 1.2 0 1 0 0-2.4h-2.4a8.4 8.4 0 0 0-.99-2.36l1.7-1.7a1.2 1.2 0 1 0-1.7-1.7l-1.7 1.7a8.4 8.4 0 0 0-2.36-.99zM20 23a4.9 4.9 0 1 1 0-9.8 4.9 4.9 0 0 1 0 9.8z"
              fill="#1e40af"
            />
          </g>
        </svg>
      </motion.div>
    </motion.div>
  )
}

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

type ContactCardProps = {
  href: string
  icon: React.ReactNode
  title: string
  detail: string
  accent: "green" | "orange" | "blue" | "purple"
}

const accentStyles = {
  green: "hover:border-coop-green/40 hover:bg-coop-green/5 focus-visible:ring-coop-green/40",
  orange: "hover:border-coop-orange/40 hover:bg-coop-orange/5 focus-visible:ring-coop-orange/40",
  blue: "hover:border-coop-blue/40 hover:bg-coop-blue/5 focus-visible:ring-coop-blue/40",
  purple: "hover:border-coop-purple/40 hover:bg-coop-purple/5 focus-visible:ring-coop-purple/40",
}

function ContactCard({ href, icon, title, detail, accent }: ContactCardProps) {
  return (
    <a
      href={href}
      className={`rounded-xl border border-slate-200 bg-white p-3 transition-colors focus-visible:outline-none focus-visible:ring-2 ${accentStyles[accent]}`}
    >
      <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        {icon}
        {title}
      </p>
      <p className="mt-1 text-sm text-slate-600">{detail}</p>
    </a>
  )
}

export default function MantenimientoView() {
  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[12%] top-[10%] h-72 w-72 rounded-full bg-coop-blue/10 blur-3xl" />
        <div className="absolute right-[10%] top-[14%] h-72 w-72 rounded-full bg-coop-purple/10 blur-3xl" />
        <div className="absolute bottom-[8%] left-[45%] h-72 w-72 rounded-full bg-coop-green/10 blur-3xl" />
      </div>

      <motion.section
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.1 }}
        className="w-full max-w-3xl"
      >
        <motion.div
          variants={reveal}
          transition={{ duration: 0.7 }}
          className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-2xl backdrop-blur-xl sm:p-8 lg:p-10"
        >
          <motion.div
            variants={reveal}
            transition={{ duration: 0.6 }}
            className="mb-6 flex justify-center"
          >
            <Image
              src="/images/logocoopnuevo.png"
              alt="Cooperativa La Dormida"
              width={120}
              height={120}
              className="h-20 w-auto sm:h-24"
              priority
            />
          </motion.div>

          <motion.div
            variants={reveal}
            transition={{ duration: 0.6 }}
            className="mx-auto mb-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-coop-green/20 bg-coop-green/10 px-4 py-2 text-sm font-semibold text-coop-green"
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            Actualización en curso
          </motion.div>

          <MaintenanceIllustration />

          <motion.h1
            variants={reveal}
            transition={{ duration: 0.6 }}
            className="mt-8 text-balance text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl"
          >
            Sitio web en mantenimiento
          </motion.h1>

          <motion.p
            variants={reveal}
            transition={{ duration: 0.6 }}
            className="mx-auto mt-4 max-w-2xl text-balance text-center text-base leading-relaxed text-slate-700 sm:text-lg"
          >
            Estamos realizando mejoras en nuestra plataforma digital para brindarte una mejor
            experiencia. Volveremos a estar disponibles muy pronto.
          </motion.p>

          <motion.p
            variants={reveal}
            transition={{ duration: 0.6 }}
            className="mx-auto mt-4 max-w-2xl text-balance text-center text-sm leading-relaxed text-slate-600 sm:text-base"
          >
            Nuestros servicios de electricidad, internet, televisión y área social continúan
            funcionando con normalidad. Podés comunicarte con nosotros por los canales de abajo.
          </motion.p>

          <motion.div
            variants={reveal}
            transition={{ duration: 0.6 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
          >
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-coop-blue via-coop-purple to-coop-green text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            >
              <a href="tel:+543521401330" aria-label="Llamar a la Cooperativa al 3521 401330">
                <Phone className="mr-2 h-5 w-5" />
                Llamar a la oficina
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-coop-green/30 bg-white/80 text-coop-green shadow-sm transition-all duration-300 hover:scale-[1.02] hover:bg-coop-green hover:text-white hover:shadow-lg"
            >
              <a
                href="https://wa.me/5493521401330?text=Hola%2C%20quiero%20realizar%20una%20consulta."
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contactar por WhatsApp"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                WhatsApp
              </a>
            </Button>
          </motion.div>

          <motion.div variants={reveal} transition={{ duration: 0.6 }} className="mt-7 space-y-5">
            <Card className="border border-slate-200/80 bg-white/85 shadow-lg">
              <CardContent className="space-y-5 p-5 sm:p-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 sm:text-base">
                  <ShieldCheck className="h-5 w-5 text-coop-green" />
                  Canales de contacto
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <ContactCard
                    href="tel:+543521401330"
                    icon={<Building2 className="h-4 w-4 text-coop-green" />}
                    title="Administración"
                    detail="3521 401330"
                    accent="green"
                  />
                  <ContactCard
                    href="tel:+543521401387"
                    icon={<Stethoscope className="h-4 w-4 text-coop-purple" />}
                    title="Consultorios PFC (turnos)"
                    detail="3521 401387"
                    accent="purple"
                  />
                  <ContactCard
                    href="mailto:admin-reclamos@cooperativaladormida.com"
                    icon={<Mail className="h-4 w-4 text-coop-blue" />}
                    title="Reclamos"
                    detail="admin-reclamos@cooperativaladormida.com"
                    accent="blue"
                  />
                  <ContactCard
                    href="https://www.cooponlineweb.com.ar/SANJOSEDELADORMIDA/Login"
                    icon={<FileText className="h-4 w-4 text-coop-green" />}
                    title="Pago de facturas"
                    detail="CoopOnline — pago online"
                    accent="green"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80 bg-white/85 shadow-lg">
              <CardContent className="space-y-4 p-5 sm:p-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 sm:text-base">
                  <Zap className="h-5 w-5 text-coop-orange" />
                  Guardias 24 horas
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <ContactCard
                    href="tel:+543521406186"
                    icon={<Wrench className="h-4 w-4 text-coop-orange" />}
                    title="Guardia eléctrica"
                    detail="3521 406186"
                    accent="orange"
                  />
                  <ContactCard
                    href="tel:+543521438313"
                    icon={<Wifi className="h-4 w-4 text-coop-blue" />}
                    title="Internet / Cable"
                    detail="3521 438313"
                    accent="blue"
                  />
                  <ContactCard
                    href="tel:+543521406183"
                    icon={<Ambulance className="h-4 w-4 text-coop-green" />}
                    title="Ambulancia"
                    detail="3521 406183"
                    accent="green"
                  />
                  <ContactCard
                    href="tel:+543521406189"
                    icon={<Phone className="h-4 w-4 text-coop-purple" />}
                    title="Sepelio"
                    detail="3521 406189"
                    accent="purple"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80 bg-slate-50/90 shadow-lg">
              <CardContent className="space-y-4 p-5 sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <CalendarClock className="h-4 w-4 text-coop-purple" />
                      Horario de atención
                    </p>
                    <p className="mt-1 text-sm text-slate-600">Lunes a Viernes</p>
                    <p className="text-sm font-medium text-slate-700">7:00 a 12:00 hs</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <MapPin className="h-4 w-4 text-coop-green" />
                      Ubicación
                    </p>
                    <p className="mt-1 text-sm text-slate-600">Av. Perón 557</p>
                    <p className="text-sm text-slate-600">San José de la Dormida, Córdoba</p>
                  </div>
                </div>

                <div className="rounded-xl border border-coop-green/20 bg-coop-green/5 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <MessageCircle className="h-4 w-4 text-coop-green" />
                    Asistente virtual por WhatsApp
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    Podés solicitar tu factura enviando tu número de cuenta (3 o 4 dígitos) por
                    WhatsApp al{" "}
                    <a
                      href="https://wa.me/5493521401330"
                      className="font-medium text-coop-green underline-offset-2 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      3521 401330
                    </a>
                    .
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.footer
            variants={reveal}
            transition={{ duration: 0.6 }}
            className="mt-8 border-t border-slate-200/90 pt-5 text-center"
          >
            <p className="text-sm font-semibold text-slate-700">
              Cooperativa Eléctrica Ltda. de San José de la Dormida
            </p>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Brindando servicios a nuestra comunidad desde hace más de 60 años.
            </p>
          </motion.footer>
        </motion.div>

        <motion.div
          variants={reveal}
          transition={{ duration: 0.6 }}
          className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500"
        >
          <Cog className="h-3.5 w-3.5 animate-spin" />
          Actualizando nuestra plataforma digital
        </motion.div>
      </motion.section>
    </main>
  )
}
