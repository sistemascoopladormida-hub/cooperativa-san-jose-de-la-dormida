"use client"

import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Scale, AlertCircle, CheckCircle, XCircle, Clock, Phone, Mail, MapPin, Zap, Wifi, Tv, Shield } from "lucide-react"

export default function CondicionesServiciosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-coop-blue via-coop-purple via-coop-green to-coop-orange text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">Términos y Condiciones de Servicio</h1>
            <p className="text-xl text-green-100">
              Normas y condiciones que rigen la prestación de nuestros servicios
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
                Los presentes <strong>Términos y Condiciones de Servicio</strong> (en adelante, "Términos") 
                regulan la relación entre <strong>Cooperativa La Dormida</strong> (en adelante, "la Cooperativa") 
                y sus socios y usuarios (en adelante, "el Usuario" o "los Usuarios") respecto de la prestación 
                de servicios de electricidad, internet, televisión y otros servicios ofrecidos por la Cooperativa.
              </p>
              <div className="bg-blue-50 border-l-4 border-coop-blue p-4 rounded">
                <p className="text-sm text-gray-700">
                  <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-AR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Al utilizar los servicios de la Cooperativa, el Usuario acepta estos Términos y Condiciones 
                  en su totalidad. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar 
                  los servicios.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-6 w-6 text-coop-green" />
                1. Información de la Cooperativa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-gray-700"><strong>Razón Social:</strong> Cooperativa La Dormida</p>
                <p className="text-gray-700"><strong>Domicilio:</strong> Av. Perón 557 - CP 5244, San José de la Dormida, Córdoba, Argentina</p>
                <p className="text-gray-700"><strong>Teléfono:</strong> 3521-401330</p>
                <p className="text-gray-700 text-sm mt-1"><strong>Consultorios médicos PFC (turnos):</strong> 3521 401387</p>
                <p className="text-gray-700"><strong>Email:</strong> sistemas@cooperativaladormida.com</p>
                <p className="text-gray-700"><strong>Horario de atención:</strong> Lunes a Viernes de 7:00 a 12:00</p>
                <p className="text-gray-700"><strong>Teléfonos de guardia 24/7:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-gray-600 text-sm">
                  <li>Ambulancia: 3521 406183</li>
                  <li>Eléctrica: 3521 406186</li>
                  <li>Internet: 3521 438313</li>
                  <li>Administración: 3521 401330</li>
                  <li>Sepelio: 3521 406189</li>
                  <li>Consultorios médicos PFC (turnos): 3521 401387</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-coop-green" />
                2. Servicios Ofrecidos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                La Cooperativa ofrece los siguientes servicios a sus socios:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-semibold text-gray-800">Electricidad</h4>
                  </div>
                  <p className="text-sm text-gray-700">
                    Suministro eléctrico confiable las 24 horas del día. Tarifas preferenciales para socios. 
                    Atención técnica 24/7. Medidores inteligentes.
                  </p>
                  <p className="text-xs text-gray-600 mt-2">Desde $8,500/mes</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                  <div className="flex items-center gap-2 mb-2">
                    <Wifi className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-800">Internet</h4>
                  </div>
                  <p className="text-sm text-gray-700">
                    Conexión de alta velocidad con fibra óptica hasta 100 Mbps. Fibra óptica hasta el hogar. 
                    Sin límite de datos.
                  </p>
                  <p className="text-xs text-gray-600 mt-2">Desde $4,200/mes</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                  <div className="flex items-center gap-2 mb-2">
                    <Tv className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-800">Televisión</h4>
                  </div>
                  <p className="text-sm text-gray-700">
                    Más de 80 canales, incluyendo canales HD. Programación familiar. Servicio técnico gratuito.
                  </p>
                  <p className="text-xs text-gray-600 mt-2">Desde $3,800/mes</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-gray-800">Servicios Sociales</h4>
                  </div>
                  <p className="text-sm text-gray-700">
                    Farmacia Social, Servicios Fúnebres, Eventos Sociales, Asesoramiento Legal, Descuentos Comerciales.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-coop-green" />
                3. Condiciones de Asociación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">3.1. Requisitos para Asociarse</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Ser mayor de edad o contar con representante legal</li>
                    <li>Completar el formulario de asociación</li>
                    <li>Presentar documentación requerida (DNI, comprobante de domicilio)</li>
                    <li>Aprobar la solicitud por parte de la Cooperativa</li>
                    <li>Abonar la cuota social correspondiente</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">3.2. Derechos de los Socios</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Acceso a tarifas preferenciales en los servicios</li>
                    <li>Participación en asambleas y decisiones de la Cooperativa</li>
                    <li>Acceso a servicios sociales y beneficios exclusivos</li>
                    <li>Recibir información sobre la gestión de la Cooperativa</li>
                    <li>Presentar reclamos y sugerencias</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">3.3. Obligaciones de los Socios</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Pagar las facturas de servicios en tiempo y forma</li>
                    <li>Mantener actualizados los datos personales y de contacto</li>
                    <li>Notificar cambios de domicilio o titularidad</li>
                    <li>Respetar las instalaciones y equipos de la Cooperativa</li>
                    <li>Cumplir con las normas de uso de los servicios</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-coop-green" />
                4. Contratación y Activación de Servicios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                La contratación de servicios se realiza mediante:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Solicitud presencial:</strong> En la oficina de la Cooperativa, completando el formulario correspondiente.</li>
                <li><strong>Solicitud online:</strong> A través del formulario disponible en la sección "Asociarse" del sitio web.</li>
                <li><strong>Documentación requerida:</strong> DNI, comprobante de domicilio, y documentación adicional según el servicio solicitado.</li>
                <li><strong>Evaluación técnica:</strong> La Cooperativa evaluará la factibilidad técnica de la instalación.</li>
                <li><strong>Instalación:</strong> Una vez aprobada la solicitud, se coordinará la instalación de los equipos necesarios.</li>
                <li><strong>Activación:</strong> El servicio se activará una vez completada la instalación y el pago de los cargos correspondientes.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-coop-green" />
                5. Facturación y Pagos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">5.1. Emisión de Facturas</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Las facturas se emiten mensualmente</li>
                    <li>Se envían por correo electrónico o se pueden consultar en el área de socios</li>
                    <li>Las facturas también están disponibles en: <a href="https://www.cooponlineweb.com.ar/SANJOSEDELADORMIDA/Login" target="_blank" rel="noopener noreferrer" className="text-coop-green hover:underline">cooponlineweb.com.ar</a></li>
                    <li>El Usuario debe verificar la exactitud de los datos facturados</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">5.2. Formas de Pago</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Pago online a través del área de socios</li>
                    <li>Pago en efectivo en la oficina de la Cooperativa</li>
                    <li>Débito automático (previa autorización)</li>
                    <li>Transferencia bancaria</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">5.3. Vencimiento y Morosidad</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Las facturas tienen fecha de vencimiento indicada en el documento</li>
                    <li>El pago fuera de término generará intereses y recargos según normativa vigente</li>
                    <li>La morosidad puede resultar en la suspensión del servicio</li>
                    <li>Para evitar cortes, se recomienda pagar antes de la fecha de vencimiento</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-coop-green" />
                6. Suspensión y Corte de Servicios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                La Cooperativa se reserva el derecho de suspender o cortar el servicio en los siguientes casos:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Falta de pago:</strong> Cuando el Usuario no haya pagado las facturas vencidas después del período de gracia establecido.</li>
                <li><strong>Uso indebido:</strong> Cuando se detecte uso fraudulento o no autorizado del servicio.</li>
                <li><strong>Manipulación de equipos:</strong> Cuando se detecte manipulación, alteración o daño intencional a los equipos de medición o instalaciones.</li>
                <li><strong>Incumplimiento contractual:</strong> Cuando el Usuario incumpla las condiciones establecidas en el contrato de servicio.</li>
                <li><strong>Razones técnicas:</strong> Por mantenimiento programado o emergencias técnicas (con previo aviso cuando sea posible).</li>
                <li><strong>Orden judicial:</strong> Cuando sea requerido por orden judicial o autoridad competente.</li>
              </ul>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <p className="text-sm text-gray-700">
                  <strong>Reconexión:</strong> Para la reconexión del servicio suspendido, el Usuario deberá pagar 
                  las facturas pendientes, intereses, recargos y el cargo por reconexión correspondiente.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-coop-green" />
                7. Mantenimiento y Reparaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">7.1. Mantenimiento Preventivo</h4>
                  <p className="text-sm text-gray-700">
                    La Cooperativa realiza mantenimiento preventivo periódico de sus instalaciones y equipos. 
                    Se notificará con anticipación cuando sea posible, aunque en casos de emergencia el mantenimiento 
                    puede realizarse sin previo aviso.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">7.2. Reparaciones</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Las reparaciones en instalaciones internas del Usuario corren por cuenta del mismo</li>
                    <li>Las reparaciones en instalaciones de la Cooperativa son responsabilidad de la misma</li>
                    <li>Para reportar fallas, contactar a los teléfonos de guardia 24/7</li>
                    <li>Los tiempos de respuesta dependen de la urgencia y disponibilidad técnica</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">7.3. Responsabilidad del Usuario</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Mantener las instalaciones internas en buen estado</li>
                    <li>No manipular medidores, cables o equipos de la Cooperativa</li>
                    <li>Reportar inmediatamente cualquier anomalía o falla</li>
                    <li>Permitir el acceso al personal autorizado para inspecciones y reparaciones</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-coop-green" />
                8. Uso Aceptable de los Servicios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                El Usuario se compromete a utilizar los servicios de manera responsable y legal:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Uso Permitido
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Uso personal y doméstico</li>
                    <li>Actividades comerciales legales</li>
                    <li>Navegación web y streaming</li>
                    <li>Comunicaciones legítimas</li>
                  </ul>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    Uso Prohibido
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Actividades ilegales o fraudulentas</li>
                    <li>Violación de derechos de autor</li>
                    <li>Spam o actividades maliciosas</li>
                    <li>Interferencia con otros usuarios</li>
                  </ul>
                </div>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mt-4">
                <p className="text-sm text-gray-700">
                  <strong>Consecuencias:</strong> El incumplimiento de estas normas puede resultar en la suspensión 
                  o cancelación del servicio sin derecho a reembolso.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-coop-green" />
                9. Limitación de Responsabilidad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                La Cooperativa no se responsabiliza por:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Interrupciones del servicio por causas de fuerza mayor, caso fortuito o hechos de terceros</li>
                <li>Daños a equipos del Usuario causados por sobretensiones, cortes de energía o fallas en la red</li>
                <li>Pérdida de datos o información del Usuario</li>
                <li>Daños indirectos o lucro cesante</li>
                <li>Interrupciones temporales por mantenimiento programado o emergencias</li>
                <li>Problemas derivados del uso indebido del servicio por parte del Usuario</li>
              </ul>
              <div className="bg-blue-50 border-l-4 border-coop-blue p-4 rounded mt-4">
                <p className="text-sm text-gray-700">
                  <strong>Recomendación:</strong> Se recomienda a los Usuarios utilizar protectores de tensión y 
                  realizar copias de seguridad de sus datos importantes.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-coop-green" />
                10. Protección de Datos Personales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                El tratamiento de datos personales se rige por nuestra <a href="/politicadeprivacidad" className="text-coop-green hover:underline font-semibold">Política de Privacidad</a>, 
                que forma parte integral de estos Términos y Condiciones. Al utilizar nuestros servicios, 
                el Usuario acepta el tratamiento de sus datos personales según lo establecido en dicha política.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-coop-green" />
                11. Reclamos y Resolución de Conflictos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">11.1. Presentación de Reclamos</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Los reclamos pueden presentarse a través de:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Formulario de contacto en el sitio web</li>
                    <li>Personalmente en la oficina de la Cooperativa</li>
                    <li>Por correo electrónico a: admin-reclamos@cooperativaladormida.com</li>
                    <li>Por teléfono al: 3521-401330</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">11.2. Proceso de Resolución</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>La Cooperativa se compromete a responder los reclamos en un plazo máximo de 10 días hábiles</li>
                    <li>Se investigará cada caso de manera exhaustiva</li>
                    <li>Se comunicará la resolución al Usuario por el medio de contacto indicado</li>
                    <li>En caso de desacuerdo, el Usuario puede recurrir a las autoridades regulatorias competentes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-coop-green" />
                12. Modificaciones de los Términos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                La Cooperativa se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. 
                Las modificaciones serán publicadas en esta página con la fecha de última actualización. 
                El uso continuado de los servicios después de la publicación de cambios constituye la aceptación 
                de los nuevos términos.
              </p>
              <div className="bg-blue-50 border-l-4 border-coop-blue p-4 rounded">
                <p className="text-sm text-gray-700">
                  <strong>Notificación:</strong> Para cambios significativos, la Cooperativa puede notificar a 
                  los Usuarios por correo electrónico o mediante avisos en las facturas.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-coop-green" />
                13. Cancelación del Servicio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">13.1. Cancelación por el Usuario</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    El Usuario puede solicitar la cancelación del servicio:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Presentando solicitud escrita en la oficina de la Cooperativa</li>
                    <li>Completando el formulario de cancelación disponible en el área de socios</li>
                    <li>Debe estar al día con todos los pagos pendientes</li>
                    <li>Se coordinará la fecha de corte del servicio</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">13.2. Cancelación por la Cooperativa</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    La Cooperativa puede cancelar el servicio en casos de:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Incumplimiento grave de las condiciones de servicio</li>
                    <li>Uso fraudulento o ilegal del servicio</li>
                    <li>Imposibilidad técnica de continuar prestando el servicio</li>
                    <li>Orden judicial o de autoridad competente</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">13.3. Efectos de la Cancelación</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>El servicio se cortará en la fecha acordada</li>
                    <li>El Usuario debe pagar todas las facturas pendientes</li>
                    <li>Se emitirá una factura final con los consumos hasta la fecha de corte</li>
                    <li>El Usuario debe devolver los equipos de la Cooperativa en buen estado</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-coop-green" />
                14. Ley Aplicable y Jurisdicción
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Estos Términos y Condiciones se rigen por las leyes de la República Argentina. 
                Cualquier disputa que surja de o en relación con estos términos será sometida a la 
                jurisdicción de los tribunales ordinarios de San José de la Dormida, Córdoba, Argentina.
              </p>
              <p className="text-gray-700">
                La Cooperativa se compromete a intentar resolver cualquier conflicto mediante diálogo 
                y mediación antes de recurrir a instancias judiciales.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-6 w-6 text-coop-green" />
                15. Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Para consultas sobre estos Términos y Condiciones o sobre nuestros servicios, puedes 
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
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg md:col-span-2">
                  <Mail className="h-5 w-5 text-coop-green mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 mb-2">Correos Electrónicos</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <a href="mailto:sistemas@cooperativaladormida.com" className="text-coop-blue hover:text-coop-green hover:underline">
                        Sistemas: sistemas@cooperativaladormida.com
                      </a>
                      <a href="mailto:secretaria-rrhh@cooperativaladormida.com" className="text-coop-blue hover:text-coop-green hover:underline">
                        Secretaría/RRHH: secretaria-rrhh@cooperativaladormida.com
                      </a>
                      <a href="mailto:tesoreria@cooperativaladormida.com" className="text-coop-blue hover:text-coop-green hover:underline">
                        Tesorería: tesoreria@cooperativaladormida.com
                      </a>
                      <a href="mailto:compras@cooperativaladormida.com" className="text-coop-blue hover:text-coop-green hover:underline">
                        Compras: compras@cooperativaladormida.com
                      </a>
                      <a href="mailto:farmacia@cooperativaladormida.com" className="text-coop-blue hover:text-coop-green hover:underline">
                        Farmacia: farmacia@cooperativaladormida.com
                      </a>
                      <a href="mailto:redelectrica@cooperativaladormida.com" className="text-coop-blue hover:text-coop-green hover:underline">
                        Red Eléctrica: redelectrica@cooperativaladormida.com
                      </a>
                      <a href="mailto:admin-reclamos@cooperativaladormida.com" className="text-coop-blue hover:text-coop-green hover:underline">
                        Reclamos: admin-reclamos@cooperativaladormida.com
                      </a>
                      <a href="mailto:consultorios@cooperativaladormida.com" className="text-coop-blue hover:text-coop-green hover:underline">
                        Consultorios: consultorios@cooperativaladormida.com
                      </a>
                      <a href="mailto:canal@cooperativaladormida.com" className="text-coop-blue hover:text-coop-green hover:underline">
                        Canal: canal@cooperativaladormida.com
                      </a>
                      <a href="mailto:internet-cable@cooperativaladormida.com" className="text-coop-blue hover:text-coop-green hover:underline">
                        Internet/Cable: internet-cable@cooperativaladormida.com
                      </a>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Clock className="h-5 w-5 text-coop-green mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">Horario</p>
                    <p className="text-sm text-gray-700">Lunes a Viernes</p>
                    <p className="text-sm text-gray-700">7:00 - 12:00</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 bg-gradient-to-br from-coop-blue/10 via-coop-purple/10 to-coop-green/10 border-2 border-coop-green/20">
            <CardContent className="p-6">
              <p className="text-center text-gray-700">
                Al utilizar los servicios de <strong>Cooperativa La Dormida</strong>, el Usuario acepta 
                estos Términos y Condiciones en su totalidad. Si tiene alguna duda, no dude en contactarnos.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}

