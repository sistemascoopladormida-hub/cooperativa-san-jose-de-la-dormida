import Image from "next/image"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Ambulance,
  BadgeDollarSign,
  CalendarClock,
  CheckCircle2,
  Clock3,
  HeartPulse,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react"

const professionalsPlaceholders = [
  {
    id: 1,
    name: "Lic. Valentina De Lucca",
    specialty: "Psicologia",
    imagePath: "/profesionales/valentina de lucca psicologia.jpeg",
  },
  {
    id: 2,
    name: "Natalia Monges",
    specialty: "Pedicuria",
    imagePath: "/profesionales/natalia monges pedicura.jpeg",
  },
  {
    id: 3,
    name: "Lic. Emilia Carreras",
    specialty: "Psicopedagogia",
    imagePath: "/profesionales/emilia carreras psicopedagogia.jpeg",
  },
  {
    id: 4,
    name: "Dra. Mercedes Zorilla",
    specialty: "Medico Clinico",
    imagePath: "/profesionales/mercedes zorilla medico clinico.jpeg",
  },
  {
    id: 5,
    name: "Lic. Vanesa Grion",
    specialty: "Fisioterapia",
    imagePath: "/profesionales/vanesa grion fisioterapia.jpeg",
  },
  {
    id: 6,
    name: "Dr. Alejandro Monzon",
    specialty: "Ginecologia",
    imagePath: "/profesionales/alejandro monzon ginecologo.jpeg",
  },
  {
    id: 7,
    name: "Dra. Andrea Chocobares",
    specialty: "Nutricion",
    imagePath: "/profesionales/andrea chocobares nutricion.jpeg",
  },
  {
    id: 8,
    name: "Dra. Olga Vazquez",
    specialty: "Alergologia",
    imagePath: "/profesionales/olga vazquez alergologia.jpeg",
  },
  {
    id: 9,
    name: "Dra. Mayra Flores",
    specialty: "Cardiologia",
    imagePath: "/profesionales/mayra flores cardiologa.jpeg",
  },
  {
    id: 10,
    name: "Lic. Sofia de Lorenzi",
    specialty: "Psicologia",
    imagePath: "/profesionales/sofia de lorenzi psicologia.jpeg",
  },
  {
    id: 11,
    name: "Mabel Montenegro",
    specialty: "Podologia",
    imagePath: "/profesionales/mabel montenegro podologia.jpeg",
  },
  {
    id: 12,
    name: "Dr. Ernesto Vargas",
    specialty: "Diabetologia",
    imagePath: "/profesionales/ernesto vargas diabetologia.jpeg",
  },
]

const coverageItems = [
  "Atencion medica en multiples especialidades",
  "Sistema de turnos programados",
  "Cobertura familiar (menores de 18 anos)",
  "Acceso a servicios sociales complementarios",
]

const includedServices = [
  "Traslado social - PFC: hasta 2 veces al ano",
  "Traslado social - PFC Plus: hasta 3 veces al ano",
  "Servicio de enfermeria",
  "Servicio de sepelio",
  "Servicio de desagote",
]

const economicBenefits = [
  "Descuentos en Farmacia Social",
  "Descuentos en Optica",
  "Descuentos en Ortopedia",
]

const pfcBaseSpecialties = [
  "Psicologia",
  "Psicopedagogia",
  "Kinesiologia / Fisioterapia",
  "Nutricion",
  "Ginecologia",
  "Diabetologia",
  "Alergologia",
  "Podologia",
  "Pedicuria",
]

const specialties = [
  {
    title: "Cardiologia (incluida en PFC Plus)",
    planCoverage: "Solo PFC Plus",
    professional: "Dra. Mayra Flores",
    basicCoverage: "No incluida en PFC Basico",
    plusCoverage: "6 consultas anuales",
    schedule: "Viernes",
    benefits: [
      "Control y prevencion de enfermedades cardiovasculares",
      "Seguimiento de pacientes con factores de riesgo",
      "Evaluacion integral del sistema cardiaco",
    ],
  },
  {
    title: "Medico Clinico (incluida en PFC Plus)",
    planCoverage: "Solo PFC Plus",
    professional: "Dra. Pilar Goitia",
    basicCoverage: "No incluida en PFC Basico",
    plusCoverage: "8 consultas anuales",
    schedule: "Lunes y viernes",
    benefits: [
      "Atencion primaria de la salud",
      "Diagnostico general",
      "Derivacion a especialistas",
      "Seguimiento clinico integral",
    ],
  },
  {
    title: "Ginecologia",
    planCoverage: "PFC Basico y PFC Plus",
    professional: "Dr. Alejandro Monzon",
    basicCoverage: "2 consultas anuales",
    plusCoverage: "6 consultas anuales",
    schedule: "Miercoles",
    benefits: [
      "Control ginecologico",
      "Salud reproductiva",
      "Prevencion y diagnostico",
    ],
  },
  {
    title: "Diabetologia",
    planCoverage: "PFC Basico y PFC Plus",
    professional: "Dr. Ernesto Vargas",
    basicCoverage: "2 consultas anuales",
    plusCoverage: "10 consultas anuales",
    schedule: "Jueves",
    benefits: [
      "Control y tratamiento de diabetes",
      "Seguimiento de pacientes cronicos",
      "Educacion para el autocuidado",
    ],
  },
  {
    title: "Alergologia",
    planCoverage: "PFC Basico y PFC Plus",
    professional: "Dra. Olga Vazquez",
    basicCoverage: "2 consultas anuales",
    plusCoverage: "6 consultas anuales",
    schedule: "Jueves",
    benefits: [
      "Diagnostico de alergias",
      "Tratamientos personalizados",
      "Prevencion de reacciones alergicas",
    ],
  },
  {
    title: "Nutricion",
    planCoverage: "PFC Basico y PFC Plus",
    professional: "Dra. Andrea Chobares",
    basicCoverage: "2 consultas anuales",
    plusCoverage: "6 consultas anuales",
    schedule: "Jueves",
    benefits: [
      "Planes alimentarios personalizados",
      "Control nutricional",
      "Educacion en habitos saludables",
    ],
  },
  {
    title: "Fisioterapia / Kinesiologia",
    planCoverage: "PFC Basico y PFC Plus",
    professional: "Lic. Vanesa Grion",
    basicCoverage: "6 sesiones anuales",
    plusCoverage: "12 sesiones anuales",
    schedule: "Lunes, miercoles y viernes",
    benefits: [
      "Rehabilitacion fisica",
      "Tratamiento de lesiones",
      "Mejora de movilidad y calidad de vida",
    ],
  },
  {
    title: "Psicologia (adultos)",
    planCoverage: "PFC Basico y PFC Plus",
    professional: "Lic. Sofia de Lorenzi",
    basicCoverage: "12 sesiones anuales",
    plusCoverage: "24 sesiones anuales",
    schedule: "Miercoles",
    benefits: [
      "Atencion psicologica integral",
      "Acompanamiento emocional",
      "Tratamiento de problematica de salud mental",
    ],
  },
  {
    title: "Psicologia (adultos)",
    planCoverage: "PFC Basico y PFC Plus",
    professional: "Lic. Valentina De Lucca",
    basicCoverage: "12 sesiones anuales",
    plusCoverage: "24 sesiones anuales",
    schedule: "Viernes",
    benefits: [
      "Atencion psicologica integral",
      "Acompanamiento emocional",
      "Tratamiento de problematica de salud mental",
    ],
  },
  {
    title: "Psicologia (infantil)",
    planCoverage: "PFC Basico y PFC Plus",
    professional: "Lic. Valentina De Lucca",
    basicCoverage: "12 sesiones anuales",
    plusCoverage: "36 sesiones anuales",
    schedule: "Viernes",
    benefits: [
      "Atencion especializada en ninos",
      "Apoyo emocional y conductual",
      "Desarrollo saludable",
    ],
  },
  {
    title: "Psicopedagogia",
    planCoverage: "PFC Basico y PFC Plus",
    professional: "Lic. Emilia Carreras",
    basicCoverage: "12 sesiones anuales",
    plusCoverage: "36 sesiones anuales",
    schedule: "Martes, miercoles y viernes",
    benefits: [
      "Apoyo en dificultades de aprendizaje",
      "Desarrollo educativo",
      "Evaluacion y acompanamiento escolar",
    ],
  },
  {
    title: "Podologia",
    planCoverage: "PFC Basico y PFC Plus",
    professional: "Mabel Montenegro",
    basicCoverage: "1 consulta anual",
    plusCoverage: "6 consultas anuales",
    schedule: "Lunes y viernes (domicilio), miercoles (consultorio)",
    benefits: [
      "Cuidado integral del pie",
      "Tratamiento de afecciones podologicas",
      "Atencion domiciliaria disponible",
    ],
  },
  {
    title: "Pedicuria",
    planCoverage: "PFC Basico y PFC Plus",
    professional: "Natalia Monges",
    basicCoverage: "1 consulta anual",
    plusCoverage: "6 consultas anuales",
    schedule: "Lunes y viernes (consultorio)",
    benefits: [
      "Cuidado estetico y preventivo",
      "Salud e higiene del pie",
      "Prevencion de afecciones",
    ],
  },
]

export default function PFCPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="relative overflow-hidden bg-gradient-to-br from-coop-blue via-coop-purple to-coop-green text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-8 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-20 -left-8 h-64 w-64 rounded-full bg-coop-orange blur-3xl" />
        </div>
        <div className="container relative z-10 mx-auto px-4 py-16 lg:py-24">
          <div className="mx-auto max-w-5xl text-center space-y-5">
            <Badge className="bg-white/15 border border-white/30 text-white">
              Plan PFC y PFC Plus
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Cobertura Integral de Salud y Servicios
            </h1>
            <p className="text-lg sm:text-xl text-green-50 max-w-3xl mx-auto">
              El Plan de Financiamiento Colectivo (PFC) y su version ampliada PFC Plus brindan
              acceso equitativo a la salud y servicios esenciales para el socio titular y su grupo
              familiar a cargo.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 lg:mb-10">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Profesionales
              </h2>
              <p className="text-gray-600 mt-3">
                Espacio reservado para 12 imagenes de los profesionales que atienden.
              </p>
            </div>

            <div className="md:hidden -mx-4 px-4 overflow-x-auto">
              <div className="flex gap-4 min-w-max pb-2">
                {professionalsPlaceholders.map((professional) => (
                  <Card
                    key={professional.id}
                    className="w-44 shrink-0 border border-dashed border-gray-300 bg-white hover:border-coop-green/40 transition-colors"
                  >
                    <CardContent className="p-3">
                      <div className="aspect-[3/4] rounded-lg overflow-hidden relative bg-gray-100">
                        <Image
                          src={encodeURI(professional.imagePath)}
                          alt={`${professional.name} - ${professional.specialty}`}
                          fill
                          className="object-cover"
                          sizes="176px"
                        />
                      </div>
                      <p className="text-sm text-center text-gray-600 mt-3 font-medium">
                        {professional.name}
                      </p>
                      <p className="text-xs text-center text-gray-500">
                        {professional.specialty}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {professionalsPlaceholders.map((professional) => (
                <Card
                  key={professional.id}
                  className="border border-dashed border-gray-300 bg-white hover:border-coop-green/40 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="aspect-[3/4] rounded-lg overflow-hidden relative bg-gray-100">
                      <Image
                        src={encodeURI(professional.imagePath)}
                        alt={`${professional.name} - ${professional.specialty}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 33vw, 25vw"
                      />
                    </div>
                    <p className="text-sm text-center text-gray-600 mt-3 font-medium">
                      {professional.name}
                    </p>
                    <p className="text-xs text-center text-gray-500">{professional.specialty}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-2 border-coop-green/20">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-wide text-coop-green font-semibold mb-2">Direccion</p>
                <p className="font-semibold text-gray-900 inline-flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-coop-green" />
                  Av. Peron 557
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-coop-blue/20">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-wide text-coop-blue font-semibold mb-2">Telefono</p>
                <a href="tel:+543521401387" className="font-semibold text-gray-900 inline-flex items-center gap-2 hover:text-coop-green">
                  <Phone className="w-4 h-4 text-coop-blue" />
                  3521 401387
                </a>
              </CardContent>
            </Card>
            <Card className="border-2 border-coop-purple/20">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-wide text-coop-purple font-semibold mb-2">Horarios</p>
                <p className="font-semibold text-gray-900 inline-flex items-center gap-2">
                  <Clock3 className="w-4 h-4 text-coop-purple" />
                  Lunes a viernes, 08:00 a 13:00 hs
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-14 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-8">
              <Badge className="bg-coop-blue/10 text-coop-blue border border-coop-blue/20">
                Planes disponibles
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-4">
                Plan PFC y Plan PFC Plus
              </h2>
              <p className="text-gray-600 mt-3 max-w-3xl mx-auto">
                Ambos planes garantizan acceso a salud y servicios esenciales para socio titular y
                grupo familiar a cargo (menores de 18 anos).
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-2 border-coop-green/30 bg-gradient-to-br from-white to-green-50/40">
                <CardHeader>
                  <CardTitle className="inline-flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-coop-green" />
                      PFC (Plan Basico)
                    </span>
                    <span className="text-coop-green font-bold text-xl">$12.500/mes</span>
                  </CardTitle>
                  <CardDescription>Cobertura medica esencial con precio accesible.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    "Cobertura medica para el grupo familiar",
                    "Especialidades con cupos anuales definidos",
                    "Sistema de atencion organizado para garantizar equidad",
                    "Pago mensual accesible (a mes vencido)",
                    "Adhesion sin costo",
                  ].map((item) => (
                    <div key={item} className="text-sm text-gray-700 flex items-start gap-2.5 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-coop-green shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-2 border-coop-purple/30 bg-gradient-to-br from-white to-purple-50/40">
                <CardHeader>
                  <CardTitle className="inline-flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-coop-purple" />
                      PFC Plus (Plan Ampliado)
                    </span>
                    <span className="text-coop-purple font-bold text-xl">$25.000/mes</span>
                  </CardTitle>
                  <CardDescription>Incluye todo PFC con mayor cobertura y especialidades extra.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    "Incluye todo lo del plan basico",
                    "Mas consultas disponibles durante el ano",
                    "Cardiologia y Medico Clinico",
                    "Hasta 3 traslados sociales por ano",
                    "Mejor seguimiento medico y enfoque preventivo",
                  ].map((item) => (
                    <div key={item} className="text-sm text-gray-700 flex items-start gap-2.5 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-coop-purple shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2">
                  <Users className="w-5 h-5 text-coop-green" />
                  Cobertura General
                </CardTitle>
                <CardDescription>Atencion organizada, accesible y continua</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {coverageItems.map((item) => (
                  <div key={item} className="text-sm text-gray-700 flex items-start gap-2.5 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-coop-green shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-coop-blue" />
                  Beneficios Generales
                </CardTitle>
                <CardDescription>Servicios incluidos y beneficios economicos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">Servicios incluidos</p>
                  <div className="space-y-2">
                    {includedServices.map((item) => (
                      <div key={item} className="text-sm text-gray-700 flex items-start gap-2.5 leading-relaxed">
                        <Ambulance className="w-4 h-4 mt-0.5 text-coop-blue shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">Beneficios economicos</p>
                  <div className="space-y-2">
                    {economicBenefits.map((item) => (
                      <div key={item} className="text-sm text-gray-700 flex items-start gap-2.5 leading-relaxed">
                        <BadgeDollarSign className="w-4 h-4 mt-0.5 text-coop-green shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-14 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-2 border-coop-green/20">
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-coop-green" />
                  Plan PFC (Basico) - Beneficios completos
                </CardTitle>
                <CardDescription>Precio mensual: $12.500 (a mes vencido)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">Servicios incluidos</p>
                  <div className="space-y-2">
                    {[
                      "Traslado social: hasta 2 veces al ano",
                      "Servicio de enfermeria",
                      "Servicio de sepelio",
                      "Servicio de desagote",
                    ].map((item) => (
                      <div key={item} className="text-sm text-gray-700 flex items-start gap-2.5 leading-relaxed">
                        <Ambulance className="w-4 h-4 mt-0.5 text-coop-green shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">Especialidades incluidas en PFC</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {pfcBaseSpecialties.map((item) => (
                      <div key={item} className="text-sm text-gray-700 inline-flex items-start gap-2">
                        <Stethoscope className="w-4 h-4 mt-0.5 text-coop-green shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Estas especialidades cuentan con cobertura anual limitada para asegurar atencion
                    para todos los socios.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-coop-purple/20">
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-coop-purple" />
                  Plan PFC Plus - Beneficios diferenciales
                </CardTitle>
                <CardDescription>Precio mensual: $25.000</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Incluye todo el Plan PFC Basico",
                  "Traslado social: hasta 3 veces al ano",
                  "Nuevas especialidades: Cardiologia y Medico Clinico",
                  "Mayor cantidad de consultas durante el ano",
                  "Mejor seguimiento medico anual",
                  "Mayor acceso a controles preventivos",
                ].map((item) => (
                  <div key={item} className="text-sm text-gray-700 flex items-start gap-2.5 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-coop-purple shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 mt-2">
                  <p className="text-sm font-semibold text-gray-900">Condiciones</p>
                  <p className="text-sm text-gray-700 mt-1">Pago a mes vencido</p>
                  <p className="text-sm text-gray-700">Adhesion sin costo</p>
                  <p className="text-sm text-gray-700">Cambio de plan sin costo</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-14 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-10">
              <Badge className="bg-coop-green/10 text-coop-green border border-coop-green/20">
                Especialidades medicas y cobertura
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-4">
                Consultas y sesiones por especialidad
              </h2>
              <p className="text-gray-600 mt-3 max-w-3xl mx-auto">
                Cada especialidad detalla por separado la cobertura de PFC Basico y de PFC Plus.
                Los valores numericos corresponden a la cartilla de PFC Plus del PDF; en PFC Basico
                las especialidades base se mantienen con cupo anual definido.
              </p>
            </div>

            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="w-full">
                  {specialties.map((specialty) => (
                    <AccordionItem
                      key={`${specialty.title}-${specialty.professional}`}
                      value={`${specialty.title}-${specialty.professional}`}
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="pr-3">
                          <p className="font-semibold text-gray-900">{specialty.title}</p>
                          <p className="text-sm text-gray-500">{specialty.professional}</p>
                          <div className="mt-2">
                            <Badge
                              className={
                                specialty.planCoverage === "Solo PFC Plus"
                                  ? "bg-coop-purple/10 text-coop-purple border border-coop-purple/20"
                                  : "bg-coop-green/10 text-coop-green border border-coop-green/20"
                              }
                            >
                              {specialty.planCoverage}
                            </Badge>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-1">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                              <p className="text-xs uppercase tracking-wide text-gray-500">Cobertura PFC Basico</p>
                              <p className="text-sm font-semibold text-gray-900">{specialty.basicCoverage}</p>
                            </div>
                            <div className="rounded-lg border border-coop-purple/20 bg-coop-purple/5 px-3 py-2">
                              <p className="text-xs uppercase tracking-wide text-coop-purple">Cobertura PFC Plus</p>
                              <p className="text-sm font-semibold text-gray-900">{specialty.plusCoverage}</p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                              <p className="text-xs uppercase tracking-wide text-gray-500">Dias de atencion</p>
                              <p className="text-sm font-semibold text-gray-900">{specialty.schedule}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {specialty.benefits.map((benefit) => (
                              <div key={benefit} className="text-sm text-gray-700 flex items-start gap-2.5 leading-relaxed">
                                <HeartPulse className="w-4 h-4 mt-0.5 text-coop-purple shrink-0" />
                                <span>{benefit}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-14 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-2 border-coop-purple/20 bg-gradient-to-br from-white to-purple-50/40">
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-coop-purple" />
                  Plan PFC Plus - Beneficios diferenciales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Incorpora Cardiologia y Medico Clinico",
                  "Mayor cobertura anual de consultas",
                  "Mas traslados sociales (3 al ano)",
                  "Mejor seguimiento medico",
                  "Enfoque en prevencion y atencion integral",
                ].map((item) => (
                  <div key={item} className="text-sm text-gray-700 flex items-start gap-2.5 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-coop-purple shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
                <div className="pt-2 space-y-1">
                  <p className="font-bold text-gray-900">Cuota mensual: $25.000</p>
                  <p className="text-sm text-gray-600">Pago a mes vencido</p>
                  <p className="text-sm text-gray-600">Adhesion sin costo</p>
                  <p className="text-sm text-gray-600">Cambio de plan sin cargo</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-coop-green/20 bg-gradient-to-br from-white to-green-50/40">
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2">
                  <CalendarClock className="w-5 h-5 text-coop-green" />
                  Organizacion del servicio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Limites anuales por especialidad",
                  "Atencion organizada por dias especificos",
                  "Optimizacion de disponibilidad de turnos",
                  "Continuidad del servicio para todos los socios",
                ].map((item) => (
                  <div key={item} className="text-sm text-gray-700 flex items-start gap-2.5 leading-relaxed">
                    <Stethoscope className="w-4 h-4 mt-0.5 text-coop-green shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-14 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-8">
              <Badge className="bg-coop-orange/10 text-coop-orange border border-coop-orange/20">
                Diferencia clave entre planes
              </Badge>
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mt-4">
                Comparativa rapida PFC vs PFC Plus
              </h3>
            </div>

            <Card className="border border-gray-200 overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-gray-900">Caracteristica</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-900">PFC (Basico)</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-900">PFC Plus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Precio", "$12.500", "$25.000"],
                        ["Cobertura familiar", "Si", "Si"],
                        ["Especialidades base", "Si", "Si"],
                        ["Cardiologia", "No", "Si"],
                        ["Medico Clinico", "No", "Si"],
                        ["Traslados sociales", "2 por ano", "3 por ano"],
                        ["Cantidad de consultas", "Limitada", "Mayor cobertura"],
                        ["Nivel de atencion", "Estandar", "Ampliado"],
                      ].map((row) => (
                        <tr key={row[0]} className="border-t border-gray-100">
                          <td className="px-4 py-3 font-medium text-gray-900">{row[0]}</td>
                          <td className="px-4 py-3 text-gray-700">{row[1]}</td>
                          <td className="px-4 py-3 text-gray-700">{row[2]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-14 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <Card className="mx-auto max-w-6xl border border-gray-200">
            <CardContent className="p-6 lg:p-8">
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Conclusion</h3>
              <p className="text-gray-700 leading-relaxed">
                Los planes PFC y PFC Plus combinan atencion medica especializada, cobertura
                familiar, beneficios economicos y servicios sociales con una organizacion eficiente
                de turnos y prestaciones. PFC Plus se posiciona como la opcion mas completa,
                brindando mayor cobertura, mas especialidades y mejor acceso a la salud.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-14 lg:py-16 bg-gradient-to-r from-coop-blue via-coop-purple to-coop-green text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h3 className="text-2xl lg:text-3xl font-bold">Asesoramiento en boxes de atencion</h3>
            <p className="text-green-50 mt-3">
              Tambien podes solicitar informacion y asesoramiento sobre los planes PFC y PFC Plus.
            </p>
            <a
              href="tel:+543521401387"
              className="inline-flex items-center gap-2 mt-6 rounded-full bg-white text-coop-green px-5 py-3 font-semibold hover:bg-green-50 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Contactar: 3521 401387
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
