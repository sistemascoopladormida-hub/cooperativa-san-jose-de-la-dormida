"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Cloud,
  Star,
  Trophy,
  Tv,
} from "lucide-react"

type WorldCupHeroProps = {
  onWeatherClick: () => void
}

const heroStats = [
  { value: "2.500+", label: "Familias" },
  { value: "60+", label: "Años" },
  { value: "24/7", label: "Guardia" },
]

const worldCupChannels = [
  { name: "Telefe", channel: "6.3" },
  { name: "TVP", channel: "1.3" },
  { name: "TyC Sports", channel: "3.2" },
]

const floatingPoints = Array.from({ length: 12 }, (_, index) => ({
  left: `${8 + (index * 8) % 86}%`,
  top: `${14 + (index * 13) % 70}%`,
  duration: 4 + (index % 4),
  delay: index * 0.25,
}))

export default function WorldCupHero({ onWeatherClick }: WorldCupHeroProps) {
  return (
    <motion.section
      className="relative isolate overflow-hidden bg-slate-950 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute inset-0 -z-30">
        <Image
          src="/campeon2022.png"
          alt="Selección Argentina campeona del mundo 2022"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[42.5%_40%] md:object-[5%_40%]"
        />
      </div>

      <div className="absolute inset-0 -z-20 bg-gradient-to-r from-slate-950/70 via-slate-950/65 to-slate-900/35 md:bg-gradient-to-r md:from-slate-950/75 md:via-slate-950/80 md:to-slate-900/45" />
      <div className="absolute inset-0 -z-20 bg-gradient-to-t from-[#1a3a5c]/45 via-transparent to-sky-900/20 md:bg-gradient-to-t md:from-[#1a3a5c]/50 md:via-transparent md:to-sky-900/30" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_15%_45%,rgba(117,170,219,0.18),transparent_90%)] md:bg-[radial-gradient(ellipse_at_15%_45%,rgba(117,170,219,0.28),transparent_30%)]" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_85%_20%,rgba(212,175,55,0.08),transparent_80%)] md:bg-[radial-gradient(ellipse_at_85%_20%,rgba(212,175,55,0.12),transparent_20%)]" />

      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute -left-32 top-10 h-52 w-[120vw] rotate-[-8deg] bg-sky-500/15 blur-2xl"
          animate={{ x: [-20, 20, -20] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-32 bottom-8 h-56 w-[120vw] rotate-[-8deg] bg-amber-400/10 blur-2xl"
          animate={{ x: [20, -24, 20] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-sky-400/30 to-transparent" />
        {floatingPoints.map((point, index) => (
          <motion.span
            key={index}
            className="absolute h-1.5 w-1.5 rounded-full bg-amber-200/80 shadow-[0_0_18px_rgba(212,175,55,0.45)]"
            style={{ left: point.left, top: point.top }}
            animate={{ opacity: [0.2, 0.85, 0.2], y: [0, -12, 0] }}
            transition={{
              duration: point.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: point.delay,
            }}
          />
        ))}
      </div>

      <motion.div
        className="absolute right-6 top-6 z-20 lg:right-8 lg:top-8"
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.5 }}
      >
        <motion.button
          onClick={onWeatherClick}
          className="group relative flex items-center gap-2 rounded-full border border-sky-300/40 bg-slate-950/60 px-4 py-2.5 text-white shadow-lg shadow-black/30 backdrop-blur-md transition-all duration-300 hover:border-sky-300/70 hover:bg-slate-950/80"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Abrir clima"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
          >
            <Cloud className="h-5 w-5 text-sky-300" />
          </motion.div>
          <span className="hidden text-sm font-semibold sm:inline">Clima</span>
          <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-coop-orange opacity-80 animate-pulse" />
        </motion.button>
      </motion.div>

      <div className="container relative z-10 mx-auto px-4 py-14 sm:py-16 lg:py-24 xl:py-28">
        <div className="grid min-h-[calc(100dvh-9rem)] grid-cols-1 items-center gap-10 lg:min-h-[calc(100dvh-12rem)] lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
          <motion.div
            className="max-w-3xl space-y-7 pt-10 lg:pt-0"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              className="inline-flex max-w-full items-center gap-2 rounded-full border border-sky-400/35 bg-slate-950/55 px-4 py-2 text-sm font-semibold text-sky-100 shadow-sm shadow-black/20 backdrop-blur"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Trophy className="h-4 w-4 flex-none text-blue-300" />
              <span className="truncate">Alentando a Argentina con energia cooperativa</span>
              <span className="hidden items-center gap-0.5 rounded-full bg-sky-500/20 px-2 py-0.5 text-sky-100 sm:inline-flex">
                {[0, 1, 2].map((star) => (
                  <Star key={star} className="h-3.5 w-3.5 fill-blue-300 text-blue-300" />
                ))}
              </span>
            </motion.div>

            <motion.div
              className="space-y-5"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.h1
                className="max-w-4xl text-4xl font-bold leading-[1.04] tracking-normal text-white sm:text-5xl lg:text-6xl xl:text-7xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                La energia de la
                <motion.span
                  className="block bg-gradient-to-r from-sky-300 via-[#75AADB] to-amber-300 bg-clip-text text-transparent"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  comunidad
                </motion.span>
                <motion.span
                  className="block"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  tambien juega en equipo
                </motion.span>
              </motion.h1>
              <motion.p
                className="max-w-2xl text-base leading-8 text-slate-200 sm:text-lg lg:text-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
              >
                Acompañamos a la Seleccion Argentina con una identidad celeste y blanca,
                sin dejar de brindar servicios esenciales con la confianza, cercania y
                compromiso de siempre.
              </motion.p>
            </motion.div>

            <motion.div
              className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <a
                  href="https://www.cooponlineweb.com.ar/SANJOSEDELADORMIDA/Login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <Button
                    size="lg"
                    className="h-14 w-full rounded-full bg-gradient-to-r from-sky-400 via-sky-300 to-cyan-300 px-7 text-base font-bold text-slate-900 shadow-xl shadow-sky-500/25 border border-sky-200/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:from-sky-300 hover:via-sky-200 hover:to-cyan-200 hover:shadow-2xl hover:shadow-sky-500/40 sm:w-auto"
                  >
                    Pagar Factura
                    <motion.span
                      className="ml-2 inline-block"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.span>
                  </Button>
                </a>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <a
                  href="https://ersep.cba.gov.ar/prestador/cooperativa-electrica-limitada-de-san-jose-de-la-dormida/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 w-full rounded-full border-2 border-sky-300/50 bg-slate-950/50 px-7 text-base font-bold text-white shadow-lg shadow-black/25 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-slate-950/70 hover:shadow-xl sm:w-auto"
                  >
                    Cuadro Tarifario
                    <motion.span
                      className="ml-2 inline-block"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.span>
                  </Button>
                </a>
              </motion.div>
            </motion.div>

            <motion.div
              className="grid grid-cols-3 gap-3 border-t border-sky-400/30 pt-6 sm:max-w-xl sm:gap-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              {heroStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.6 + index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <motion.div
                    className="text-2xl font-black text-white sm:text-3xl lg:text-4xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.8 + index * 0.1 }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-normal text-slate-300 sm:text-sm">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* <motion.div
            className="relative mx-auto w-full max-w-[400px] pb-6 lg:max-w-none lg:pb-0"
            initial={{ opacity: 0, x: 50, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.35, ease: "easeOut" }}
          >
            <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-br from-sky-500/20 via-transparent to-amber-400/15 blur-2xl" />

            <div className="overflow-hidden rounded-[2rem] border border-sky-300/30 bg-slate-950/60 shadow-2xl shadow-black/45 backdrop-blur-md lg:rounded-[2.5rem]">
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <Image
                  src="/grillamundial.jpg"
                  alt="Grilla de canales del Mundial de Fútbol 2026"
                  fill
                  sizes="(max-width: 1024px) 400px, 480px"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                <motion.div
                  className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/70 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white backdrop-blur"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <Tv className="h-3.5 w-3.5 text-lime-300" />
                  Mundial 2026
                </motion.div>
              </div>

              <div className="space-y-4 p-5 sm:p-6">
                <div>
                  <p className="text-lg font-bold text-white sm:text-xl">
                    Mirá el Mundial en tu TV
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    La pasión nos une. Encontrá los partidos en estos canales de la grilla cooperativa.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {worldCupChannels.map((item, index) => (
                    <motion.div
                      key={item.name}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.45, delay: 0.9 + index * 0.1 }}
                    >
                      <span className="font-semibold text-white">{item.name}</span>
                      <span className="rounded-lg bg-lime-400/15 px-3 py-1 text-sm font-black text-lime-300">
                        {item.channel}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  className="flex items-center gap-2 rounded-xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                >
                  <Trophy className="h-4 w-4 flex-none text-coop-orange" />
                  <span>Alentá a la Selección con la mejor señal en casa.</span>
                </motion.div>
              </div>
            </div>
          </motion.div> */}
        </div>
      </div>
    </motion.section>
  )
}
