export type NewsPost = {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string
  date: string
  author: string
  category: string
  image?: string
  featured?: boolean
  readTime?: string
  tags?: string[]
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export const featuredNews: NewsPost = {
  id: 1,
  slug: slugify("Nueva Tarifa Eléctrica Vigente desde Enero 2025"),
  title: "Nueva Tarifa Eléctrica Vigente desde Enero 2025",
  excerpt:
    "Informamos a todos los socios sobre los nuevos valores tarifarios que entrarán en vigencia el próximo mes.",
  content: "La cooperativa informa que debido a los ajustes nacionales en el sector eléctrico...",
  date: "2024-12-20",
  author: "Administración",
  category: "Importante",
  image: "/placeholder.svg?height=400&width=600",
  featured: true,
  readTime: "2 min",
  tags: ["tarifas", "importante", "electricidad"]
}

export const news: NewsPost[] = [
  {
    id: 2,
    slug: slugify("Mantenimiento Programado de Internet - Zona Centro"),
    title: "Mantenimiento Programado de Internet - Zona Centro",
    excerpt: "Se realizarán trabajos de mejora en la red de fibra óptica el próximo sábado.",
    content: "Durante el sábado se realizarán tareas de mantenimiento en la red de fibra óptica de la zona centro... Este tipo de situaciones suceden cuando encendemos el horno (o al poco tiempo de encenderlo) y ocurre frecuentemente cuándo tenemos una potencia contratada baja respecto a los aparatos eléctricos que usamos en la vivienda o en el negocio. Esta es una incidencia que tiene una solución sencilla si tu instalación lo permite y que será resuelta contratando una mayor potencia. Para ello, es importante que revises tu boletín eléctrico, en el que debe constar la potencia máxima contratada. Si tienes contratados 4,6 kW y tu intención es contratar 5,75 kW, en tu Certificado de Instalación Eléctrica (CIE) debe indicarse que la instalación permite esa potencia o mayor. En el caso de que no tengas el CIE o boletín eléctrico actualizado, debes contactar con una empresa electricista",
    date: "2024-12-18",
    author: "Área Técnica",
    category: "Mantenimiento",
    readTime: "2 min",
    tags: ["internet", "mantenimiento"],
    image: "/placeholder.svg?height=400&width=600"
  },
  {
    id: 3,
    slug: slugify("Nuevas Promociones en Farmacia Social"),
    title: "Nuevas Promociones en Farmacia Social",
    excerpt: "Descuentos especiales en medicamentos para la tercera edad durante todo enero.",
    content: "Durante enero, la farmacia social ofrecerá descuentos especiales en medicamentos para la tercera edad...",
    date: "2024-12-15",
    author: "Farmacia Social",
    category: "Promociones",
    readTime: "3 min",
    tags: ["farmacia", "promociones", "descuentos"],
    image: "/placeholder.svg?height=400&width=600"
  },
  {
    id: 4,
    slug: slugify("Asamblea Anual de Socios - 15 de Febrero"),
    title: "Asamblea Anual de Socios - 15 de Febrero",
    excerpt: "Convocatoria oficial para la asamblea anual donde se presentará el balance del año.",
    content: "Se convoca a todos los socios a la asamblea anual donde se presentará el balance y se tratarán temas importantes...",
    date: "2024-12-10",
    author: "Consejo de Administración",
    category: "Eventos",
    readTime: "5 min",
    tags: ["asamblea", "eventos"],
    image: "/placeholder.svg?height=400&width=600"
  },
  {
    id: 5,
    slug: slugify("Ampliación de Cobertura de Internet Rural"),
    title: "Ampliación de Cobertura de Internet Rural",
    excerpt: "La cooperativa extiende su red de fibra óptica a nuevas zonas rurales del distrito.",
    content: "La red de fibra óptica se ampliará a nuevas zonas rurales, beneficiando a más familias del distrito...",
    date: "2024-12-05",
    author: "Gerencia Técnica",
    category: "Infraestructura",
    readTime: "4 min",
    tags: ["internet", "infraestructura"],
    image: "/placeholder.svg?height=400&width=600"
  },
  {
    id: 6,
    slug: slugify("Programa de Descuentos para Jubilados"),
    title: "Programa de Descuentos para Jubilados",
    excerpt: "Nuevos beneficios sociales para socios jubilados en todos nuestros servicios.",
    content: "Los socios jubilados podrán acceder a nuevos beneficios y descuentos en todos los servicios de la cooperativa...",
    date: "2024-12-01",
    author: "Área Social",
    category: "Beneficios",
    readTime: "3 min",
    tags: ["beneficios", "jubilados"],
    image: "/placeholder.svg?height=400&width=600"
  },
] 