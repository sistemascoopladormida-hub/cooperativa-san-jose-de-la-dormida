"use client"

import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, BookOpen, Award, Users, ShieldCheck, UserCheck } from "lucide-react"

const institutionalInfo = [
  {
    icon: MapPin,
    title: "Dirección",
    details: [
      "Av. Gral. Perón 534",
      "San José de la Dormida – Dpto. Tulumba",
      "Provincia de Córdoba",
    ],
  },
  {
    icon: Award,
    title: "Matrículas",
    details: [
      "INAES Nº 9.627",
      "Matrícula Provincial Nº 731",
    ],
  },
  {
    icon: BookOpen,
    title: "Registro",
    details: [
      "Libro de Actas de Reuniones del Consejo de Administración Nº 8",
    ],
  },
]

const authorities = [
  { role: "Presidente", name: "Pedro Celestino Carreras" },
  { role: "Vicepresidente", name: "Carlos Eduardo Medina" },
  { role: "Secretario", name: "Martin Eduardo Tabletti" },
  { role: "Prosecretario", name: "Clidi Marili Caminos" },
  { role: "Tesorero", name: "Jose Rodolfo Mancilla" },
  { role: "Protesorero", name: "Rafael Luciano Scaramuzza" },
  { role: "Vocal Titular", name: "Shirley Judith Offreci Aguirre" },
  { role: "Vocal Titular", name: "Gabriel de Jesus Reartes" },
  { role: "Vocal Titular", name: "Manuel Enrique Araya" },
  { role: "Vocal Titular", name: "Angel Segundo Ros" },
  { role: "Vocal Suplente", name: "Fabio Gabriel Gauna" },
  { role: "Vocal Suplente", name: "Marcelo Ruben Bonannata Garcia" },
  { role: "Síndico Titular", name: "Walter Daniel Duclo" },
  { role: "Síndico Suplente", name: "Hugo Antonio Andrade Ontivero" },
]

const roleStyles = (role: string) => {
  const normalized = role.toLowerCase()
  if (normalized.includes("presidente")) {
    return {
      iconBg: "from-coop-blue to-coop-green",
      badge: "text-coop-green",
      pillBg: "bg-coop-green/10 border border-coop-green/30",
    }
  }
  if (normalized.includes("secretario") || normalized.includes("tesorero")) {
    return {
      iconBg: "from-coop-purple to-coop-blue",
      badge: "text-coop-purple",
      pillBg: "bg-coop-purple/10 border border-coop-purple/30",
    }
  }
  if (normalized.includes("síndico") || normalized.includes("sindico")) {
    return {
      iconBg: "from-coop-orange to-orange-400",
      badge: "text-coop-orange",
      pillBg: "bg-coop-orange/10 border border-coop-orange/30",
    }
  }
  return {
    iconBg: "from-gray-200 to-gray-100",
    badge: "text-gray-600",
    pillBg: "bg-gray-100 border border-gray-200",
  }
}

const roleDescription = (role: string) => {
  const normalized = role.toLowerCase()
  if (normalized.includes("presidente")) {
    return "Máxima autoridad institucional y representante legal."
  }
  if (normalized.includes("vice")) {
    return "Acompaña y reemplaza a la presidencia en su gestión."
  }
  if (normalized.includes("secretario")) {
    return "Custodia actas, documentación y comunicaciones oficiales."
  }
  if (normalized.includes("tesorero")) {
    return "Administra los recursos financieros y estados contables."
  }
  if (normalized.includes("síndico") || normalized.includes("sindico")) {
    return "Fiscaliza y garantiza la transparencia del consejo."
  }
  if (normalized.includes("vocal")) {
    return "Integra el Consejo de Administración con voz y voto activo."
  }
  return "Miembro activo del Consejo de Administración."
}

export default function AutoridadesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="bg-gradient-to-br from-coop-blue via-coop-purple via-coop-green to-coop-orange text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <p className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-sm font-semibold mb-6">
              <Users className="w-4 h-4" />
              Transparencia Institucional
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Autoridades</h1>
            <p className="text-lg lg:text-xl text-green-50">
              Conocé al equipo directivo responsable de conducir la Cooperativa La Dormida.
              Compromiso, experiencia y vocación de servicio al frente de nuestra gestión.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-16">
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Información Institucional</h2>
            <p className="text-gray-600 mt-3">
              Datos oficiales que respaldan nuestra actividad cooperativa.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {institutionalInfo.map((info) => (
              <Card key={info.title} className="h-full border-coop-green/20">
                <CardHeader className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-coop-green/10 text-coop-green flex items-center justify-center mb-4">
                    <info.icon className="w-6 h-6" />
                  </div>
                  <CardTitle>{info.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-1 text-gray-700">
                  {info.details.map((detail) => (
                    <p key={detail}>{detail}</p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Consejo de Administración</h2>
            <p className="text-gray-600 mt-3">
              Líderes comprometidos con nuestra comunidad y el bienestar de cada socio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authorities.map((authority, index) => {
              const styles = roleStyles(authority.role)
              const isPrimary = index < 2
              return (
                <Card
                  key={`${authority.role}-${authority.name}`}
                  className={`relative overflow-hidden border border-coop-green/20 bg-white/90 backdrop-blur-sm ${
                    isPrimary ? "shadow-xl" : "shadow-sm"
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-70" />
                  <div className="absolute -left-10 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-coop-green/5 blur-3xl" />
                  <CardContent className="relative flex h-full flex-col gap-6 p-6">
                    <div className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] shadow-sm ${styles.pillBg}`}>
                      <span className={`${styles.badge}`}>{authority.role}</span>
                    </div>
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${styles.iconBg} text-white flex items-center justify-center shadow-lg`}
                      >
                        {authority.role.toLowerCase().includes("síndico") ||
                        authority.role.toLowerCase().includes("sindico") ? (
                          <ShieldCheck className="w-6 h-6" />
                        ) : (
                          <UserCheck className="w-6 h-6" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-gray-900 leading-tight">{authority.name}</CardTitle>
                        <p className="text-sm text-gray-500">{roleDescription(authority.role)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-coop-green/20 px-4 py-3 text-sm text-gray-600">
                      <span>Mandato vigente</span>
                      <span className="font-semibold text-coop-green">Cooperativa La Dormida</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}

