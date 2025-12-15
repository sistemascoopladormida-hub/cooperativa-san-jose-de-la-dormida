"use client"

import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, Eye, FileText, Mail, Phone, MapPin } from "lucide-react"

export default function PoliticaPrivacidadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-coop-blue via-coop-purple via-coop-green to-coop-orange text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">Política de Privacidad</h1>
            <p className="text-xl text-green-100">
              Comprometidos con la protección de tus datos personales
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-coop-green" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                <strong>Cooperativa La Dormida</strong> (en adelante, "la Cooperativa") se compromete a proteger 
                la privacidad y confidencialidad de los datos personales de sus socios, usuarios y visitantes 
                de su sitio web. Esta Política de Privacidad describe cómo recopilamos, utilizamos, almacenamos 
                y protegemos tu información personal.
              </p>
              <div className="bg-blue-50 border-l-4 border-coop-blue p-4 rounded">
                <p className="text-sm text-gray-700">
                  <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-AR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-coop-green" />
                1. Responsable del Tratamiento de Datos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-gray-700"><strong>Razón Social:</strong> Cooperativa La Dormida</p>
                <p className="text-gray-700"><strong>Domicilio:</strong> Av. Perón 557 - CP 5244, San José de la Dormida, Córdoba, Argentina</p>
                <p className="text-gray-700"><strong>Teléfono:</strong> 3521-401330</p>
                <p className="text-gray-700 text-sm mt-1"><strong>Consultorios médicos PFC (turnos):</strong> 3521 401387</p>
                <p className="text-gray-700"><strong>Email:</strong> sistemascoopladormida@gmail.com</p>
                <p className="text-gray-700"><strong>Horario de atención:</strong> Lunes a Viernes de 7:00 a 12:00</p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-6 w-6 text-coop-green" />
                2. Datos Personales que Recopilamos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                La Cooperativa recopila los siguientes tipos de datos personales:
              </p>
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">2.1. Datos de Identificación</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Nombre y apellido</li>
                    <li>Documento Nacional de Identidad (DNI)</li>
                    <li>Número de socio</li>
                    <li>Fecha de nacimiento</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">2.2. Datos de Contacto</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Dirección postal</li>
                    <li>Número de teléfono (fijo y móvil)</li>
                    <li>Dirección de correo electrónico</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">2.3. Datos de Servicios</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Número de suministro eléctrico</li>
                    <li>Historial de facturación y pagos</li>
                    <li>Datos de consumo de servicios (electricidad, internet, televisión)</li>
                    <li>Registros de atención al cliente</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">2.4. Datos de Navegación Web</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Dirección IP</li>
                    <li>Tipo de navegador y dispositivo</li>
                    <li>Páginas visitadas y tiempo de permanencia</li>
                    <li>Cookies y tecnologías similares</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">2.5. Datos de Comunicaciones</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Mensajes enviados a través del formulario de contacto</li>
                    <li>Conversaciones a través del chatbot de WhatsApp</li>
                    <li>Registros de llamadas y consultas</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-6 w-6 text-coop-green" />
                3. Finalidad del Tratamiento de Datos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Utilizamos tus datos personales para las siguientes finalidades:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Prestación de servicios:</strong> Gestión de suministro eléctrico, internet, televisión y otros servicios ofrecidos por la Cooperativa.</li>
                <li><strong>Facturación y cobranza:</strong> Emisión de facturas, gestión de pagos y seguimiento de deudas.</li>
                <li><strong>Atención al cliente:</strong> Responder consultas, reclamos y solicitudes de información.</li>
                <li><strong>Comunicaciones:</strong> Envío de información relevante sobre servicios, cambios en tarifas, mantenimientos programados y novedades.</li>
                <li><strong>Gestión administrativa:</strong> Mantenimiento de registros de socios, gestión de asociaciones y actualización de datos.</li>
                <li><strong>Mejora de servicios:</strong> Análisis de uso y satisfacción para mejorar nuestros servicios.</li>
                <li><strong>Cumplimiento legal:</strong> Cumplir con obligaciones legales y regulatorias aplicables.</li>
                <li><strong>Seguridad:</strong> Prevenir fraudes y garantizar la seguridad de nuestros sistemas.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-coop-green" />
                4. Base Legal del Tratamiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                El tratamiento de tus datos personales se basa en:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Ejecución de contrato:</strong> Para la prestación de los servicios contratados.</li>
                <li><strong>Consentimiento:</strong> Cuando has otorgado tu consentimiento explícito para el tratamiento de datos.</li>
                <li><strong>Obligación legal:</strong> Para cumplir con obligaciones legales y regulatorias.</li>
                <li><strong>Interés legítimo:</strong> Para mejorar nuestros servicios y garantizar la seguridad de nuestros sistemas.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-6 w-6 text-coop-green" />
                5. Compartir Datos con Terceros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                La Cooperativa no vende ni alquila tus datos personales. Podemos compartir información con:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Proveedores de servicios:</strong> Empresas que nos ayudan a operar (procesamiento de pagos, hosting, servicios de mensajería).</li>
                <li><strong>Autoridades regulatorias:</strong> Cuando sea requerido por ley o por autoridades competentes.</li>
                <li><strong>Entidades financieras:</strong> Para el procesamiento de pagos y gestión de facturación.</li>
                <li><strong>Servicios de tecnología:</strong> Proveedores de servicios en la nube y plataformas de comunicación (como WhatsApp Business API para el chatbot).</li>
              </ul>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <p className="text-sm text-gray-700">
                  <strong>Nota importante:</strong> Todos los terceros con los que compartimos datos están obligados a mantener la confidencialidad y seguridad de la información.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-coop-green" />
                6. Seguridad de los Datos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Implementamos medidas técnicas y organizativas apropiadas para proteger tus datos personales:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Cifrado de datos en tránsito y en reposo</li>
                <li>Control de acceso basado en roles</li>
                <li>Monitoreo continuo de sistemas</li>
                <li>Copias de seguridad regulares</li>
                <li>Capacitación del personal en protección de datos</li>
                <li>Actualizaciones de seguridad regulares</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-6 w-6 text-coop-green" />
                7. Retención de Datos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Conservamos tus datos personales durante el tiempo necesario para cumplir con las finalidades descritas 
                en esta política, o según lo requiera la ley. Los períodos de retención incluyen:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Datos de socios activos:</strong> Durante la vigencia de la relación contractual y después según obligaciones legales.</li>
                <li><strong>Datos de facturación:</strong> Mínimo 10 años según normativa fiscal argentina.</li>
                <li><strong>Datos de navegación web:</strong> Hasta 2 años o hasta que retires tu consentimiento.</li>
                <li><strong>Datos de comunicaciones:</strong> Hasta 3 años para fines de atención al cliente.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-coop-green" />
                8. Tus Derechos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                De acuerdo con la Ley de Protección de Datos Personales (Ley 25.326) y el Reglamento General de Protección 
                de Datos (RGPD), tienes derecho a:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Acceso</h4>
                  <p className="text-sm text-gray-700">Conocer qué datos personales tenemos sobre ti.</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Rectificación</h4>
                  <p className="text-sm text-gray-700">Solicitar la corrección de datos inexactos o incompletos.</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Supresión</h4>
                  <p className="text-sm text-gray-700">Solicitar la eliminación de tus datos cuando sea aplicable.</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Oposición</h4>
                  <p className="text-sm text-gray-700">Oponerte al tratamiento de tus datos en ciertos casos.</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Portabilidad</h4>
                  <p className="text-sm text-gray-700">Recibir tus datos en formato estructurado.</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Limitación</h4>
                  <p className="text-sm text-gray-700">Solicitar la limitación del tratamiento de tus datos.</p>
                </div>
              </div>
              <div className="bg-green-50 border-l-4 border-coop-green p-4 rounded mt-4">
                <p className="text-sm text-gray-700">
                  <strong>Para ejercer tus derechos:</strong> Puedes contactarnos a través de los medios indicados 
                  en la sección de contacto. Responderemos tu solicitud en un plazo máximo de 10 días hábiles.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-coop-green" />
                9. Cookies y Tecnologías Similares
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Nuestro sitio web utiliza cookies y tecnologías similares para:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Mejorar la experiencia de navegación</li>
                <li>Analizar el uso del sitio web</li>
                <li>Recordar tus preferencias</li>
                <li>Proporcionar funcionalidades del chatbot</li>
              </ul>
              <p className="text-gray-700">
                Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar algunas funcionalidades 
                del sitio web.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-coop-green" />
                10. Chatbot de WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Nuestro chatbot de WhatsApp procesa los mensajes que recibes y envías para:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Responder tus consultas de manera automatizada</li>
                <li>Mantener el contexto de la conversación</li>
                <li>Mejorar la calidad del servicio de atención al cliente</li>
              </ul>
              <p className="text-gray-700">
                Los mensajes se procesan utilizando servicios de inteligencia artificial (OpenAI) y se almacenan 
                temporalmente para mantener el historial de conversación. Los datos se protegen según los estándares 
                de seguridad de Meta (WhatsApp Business API).
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-coop-green" />
                11. Menores de Edad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Nuestros servicios están dirigidos a personas mayores de 18 años. No recopilamos intencionalmente 
                datos personales de menores de edad sin el consentimiento de sus padres o tutores legales.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-coop-green" />
                12. Cambios en esta Política
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                La Cooperativa se reserva el derecho de modificar esta Política de Privacidad en cualquier momento. 
                Los cambios serán publicados en esta página con la fecha de última actualización. Te recomendamos 
                revisar periódicamente esta política para estar informado sobre cómo protegemos tus datos.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-6 w-6 text-coop-green" />
                13. Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Si tienes preguntas, consultas o deseas ejercer tus derechos sobre tus datos personales, puedes 
                contactarnos a través de:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-coop-green mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">Dirección</p>
                    <p className="text-sm text-gray-700">Av. Perón 557 - CP 5244</p>
                    <p className="text-sm text-gray-700">San José de la Dormida, Córdoba</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-coop-green mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">Teléfono</p>
                    <p className="text-sm text-gray-700">3521-401330</p>
                    <p className="text-xs text-gray-600 mt-1">Consultorios médicos PFC (turnos): 3521 401387</p>
                    <p className="text-sm text-gray-500 mt-1">Lun-Vie: 7:00 - 12:00</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-coop-green mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">Email</p>
                    <p className="text-sm text-gray-700">sistemascoopladormida@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <FileText className="h-5 w-5 text-coop-green mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">Asunto</p>
                    <p className="text-sm text-gray-700">Protección de Datos Personales</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 bg-gradient-to-br from-coop-blue/10 via-coop-purple/10 to-coop-green/10 border-2 border-coop-green/20">
            <CardContent className="p-6">
              <p className="text-center text-gray-700">
                <strong>Cooperativa La Dormida</strong> está comprometida con la protección de tus datos personales 
                y el cumplimiento de todas las normativas aplicables de protección de datos.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}

