# Configuración de Plantilla de WhatsApp para Encuestas

## Estado Actual

Por ahora, el sistema envía mensajes de texto simples (sin plantilla) porque Meta aún no ha aprobado la plantilla oficial.

## Plantilla que se usará (cuando Meta la apruebe)

```
Hola {{1}}.

Te enviamos este mensaje en relación al servicio de {{2}}, con numero de cuenta {{3}} realizado hoy en tu domicilio.

Para completar el registro de atención, te solicitamos responder una breve encuesta.

Por favor, tocá el botón "Completar encuesta" para continuar.

Muchas gracias.

Cooperativa Eléctrica de San José de la Dormida.
```

### Parámetros de la plantilla:
- `{{1}}`: Nombre del titular
- `{{2}}`: Tipo de servicio (Internet, Electricidad, PFC, etc.)
- `{{3}}`: Número de cuenta

### Botón:
- Texto: "Completar encuesta"
- Tipo: URL
- URL: Se enviará dinámicamente con el token único de la encuesta

## Cómo activar la plantilla cuando Meta la apruebe

### Paso 1: Obtener el nombre de la plantilla aprobada

Una vez que Meta apruebe la plantilla, obtendrás un nombre como `encuesta_visita_tecnica` o similar.

### Paso 2: Actualizar el código

Edita el archivo `app/api/visitas-tecnicas/confirmar-visita/route.ts`:

```typescript
// Cambiar esta línea:
const resultadoWhatsApp = await enviarMensajeEncuesta(
  telefono,
  titular,
  servicio,
  numeroCuenta,
  urlEncuesta,
  false // ← Cambiar a true
);

// Por esta:
const resultadoWhatsApp = await enviarMensajeEncuesta(
  telefono,
  titular,
  servicio,
  numeroCuenta,
  urlEncuesta,
  true // ← Activar plantilla
);
```

### Paso 3: Actualizar el nombre de la plantilla (si es necesario)

Si el nombre de la plantilla aprobada es diferente a `encuesta_visita_tecnica`, edita el archivo `lib/whatsapp-encuestas.ts`:

```typescript
// En la función enviarMensajeEncuestaConPlantilla, cambiar:
nombrePlantilla: string = "encuesta_visita_tecnica"

// Por el nombre real de tu plantilla aprobada
```

### Paso 4: Verificar que funciona

1. Realiza una prueba desde el formulario de visitas técnicas
2. Verifica que el mensaje llegue con el formato de plantilla (botón incluido)
3. Verifica que el botón redirija correctamente a la encuesta

## Archivos relacionados

- `lib/whatsapp-encuestas.ts` - Funciones para enviar mensajes (con y sin plantilla)
- `app/api/visitas-tecnicas/confirmar-visita/route.ts` - Endpoint que dispara el WhatsApp
- `lib/encuestas.ts` - Utilidades para tokens y formateo

## Notas importantes

- El sistema tiene un fallback automático: si la plantilla falla, usa mensaje de texto
- Los mensajes de texto actuales incluyen la URL completa al final
- Cuando uses la plantilla, la URL irá en el botón, no en el texto del mensaje

