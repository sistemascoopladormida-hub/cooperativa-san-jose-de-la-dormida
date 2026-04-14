import OpenAI from "openai";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

/** Máximo de caracteres del diálogo enviado al modelo (incluye prefijos "Usuario:" / "Bot:"). */
export const MAX_CONVERSATION_TEXT_CHARS = 4000;

/**
 * Valor por defecto del lote en `scripts/analyze-conversations.ts`: procesar todas las pendientes.
 * Para limitar, definí `ANALYSIS_BATCH_SIZE` (número) en el entorno.
 */
export const DEFAULT_BATCH_SIZE = Number.POSITIVE_INFINITY;

const analysisResultSchema = z.object({
  intent: z.string(),
  resolved: z.boolean(),
  issues: z.array(z.string()),
  summary: z.string(),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;

export type MessageRow = {
  id?: number;
  conversation_id: number;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
};

export type ConversationRow = {
  id: number;
  phone_number?: string | null;
};

/**
 * Convierte mensajes ordenados (antiguos → recientes) a texto tipo diálogo.
 */
export function formatMessagesToDialog(
  messages: MessageRow[],
  userLabel = "Usuario",
  botLabel = "Bot"
): string {
  const lines: string[] = [];
  for (const m of messages) {
    const label = m.role === "user" ? userLabel : botLabel;
    const text = (m.content ?? "").trim();
    if (!text) continue;
    lines.push(`${label}: ${text}`);
  }
  return lines.join("\n\n");
}

/**
 * Trunca por el final si excede el máximo (conserva el inicio de la conversación).
 */
export function truncateForModel(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars).trimEnd() + "\n\n[…texto truncado por límite de tamaño]";
}

/**
 * Prompt EXACTO solicitado (solo se sustituye el bloque final "Conversación:").
 */
export function buildAnalysisUserPrompt(conversationText: string): string {
  return `Analiza la siguiente conversación entre un usuario y un chatbot de una cooperativa eléctrica.

Tu tarea es:

1. Identificar la intención principal del usuario (elige una):
- FACTURA
- RECLAMO_CORTE
- NUEVO_SERVICIO
- CONSULTA_GENERAL
- OTRO

2. Determinar si el problema fue resuelto correctamente:
- true
- false

3. Detectar problemas en el chatbot (puede haber varios):
- NO_ENTENDIO
- RESPUESTA_INCORRECTA
- FALTA_CONTEXTO
- REPETICION_USUARIO
- ERROR_FACTURA
- DERIVACION_INCORRECTA

4. Generar un resumen breve (1-2 líneas)

Responde SOLO en formato JSON válido:

{
  "intent": "",
  "resolved": true,
  "issues": [],
  "summary": ""
}

Conversación:
${conversationText}`;
}

/**
 * Intenta extraer el primer objeto JSON balanceado de un string.
 */
function extractFirstJsonObject(raw: string): string | null {
  const start = raw.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < raw.length; i++) {
    const c = raw[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (c === "\\" && inString) {
      escape = true;
      continue;
    }
    if (c === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) {
        return raw.slice(start, i + 1);
      }
    }
  }
  return null;
}

/**
 * Limpiezas mínimas antes de reintentar parse.
 */
function sanitizeJsonCandidate(s: string): string {
  let t = s.trim();
  t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  return t.trim();
}

/**
 * Parsea y valida el JSON del modelo; repara formatos típicos (markdown, texto extra).
 */
export function parseAnalysisResponse(raw: string): AnalysisResult {
  const attempts: string[] = [sanitizeJsonCandidate(raw)];
  const extracted = extractFirstJsonObject(raw);
  if (extracted && extracted !== attempts[0]) {
    attempts.push(sanitizeJsonCandidate(extracted));
  }

  let lastError: unknown;
  for (const candidate of attempts) {
    try {
      const parsed = JSON.parse(candidate);
      return analysisResultSchema.parse(parsed);
    } catch (e) {
      lastError = e;
    }
  }

  throw new Error(
    `No se pudo parsear JSON de análisis: ${lastError instanceof Error ? lastError.message : String(lastError)}`
  );
}

const DEFAULT_MODEL = "gpt-4o-mini";

export type AnalyzeConversationOptions = {
  model?: string;
  temperature?: number;
};

/**
 * Envía el diálogo a OpenAI y devuelve el resultado tipado.
 */
export async function analyzeConversationWithOpenAI(
  openai: OpenAI,
  conversationText: string,
  options?: AnalyzeConversationOptions
): Promise<AnalysisResult> {
  const model =
    options?.model ??
    process.env.OPENAI_ANALYSIS_MODEL ??
    process.env.OPENAI_MODEL ??
    DEFAULT_MODEL;
  const temperature = options?.temperature ?? 0.2;

  const userContent = buildAnalysisUserPrompt(conversationText);

  const completion = await openai.chat.completions.create({
    model,
    temperature,
    max_tokens: 800,
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: userContent }],
  });

  const raw =
    completion.choices[0]?.message?.content?.trim() ??
    "";

  if (!raw) {
    throw new Error("OpenAI devolvió contenido vacío");
  }

  return parseAnalysisResponse(raw);
}

/**
 * IDs de conversaciones que ya tienen fila en conversation_analysis.
 */
/**
 * Comprueba si ya existe análisis para una conversación (útil ante ejecuciones concurrentes).
 */
export async function isConversationAnalyzed(
  supabase: SupabaseClient,
  conversationId: number
): Promise<boolean> {
  const { data, error } = await supabase
    .from("conversation_analysis")
    .select("id")
    .eq("conversation_id", conversationId)
    .maybeSingle();

  if (error) {
    throw new Error(`Error comprobando conversation_analysis: ${error.message}`);
  }

  return data != null;
}

export async function getAnalyzedConversationIds(
  supabase: SupabaseClient
): Promise<Set<number>> {
  const { data, error } = await supabase
    .from("conversation_analysis")
    .select("conversation_id");

  if (error) {
    throw new Error(`Error leyendo conversation_analysis: ${error.message}`);
  }

  return new Set(
    (data ?? [])
      .map((r: { conversation_id: number | null }) => r.conversation_id)
      .filter((id): id is number => id != null && Number.isFinite(id))
  );
}

export type PendingConversationBatch = {
  /** Cuántas conversaciones aún no tienen fila en conversation_analysis. */
  totalPending: number;
  /** IDs a procesar en esta ejecución (recorte según batchLimit). */
  ids: number[];
};

/**
 * Lista conversaciones pendientes: total en cola + primer lote según `batchLimit`.
 * `batchLimit` = `Infinity` procesa todas las pendientes en una sola lista (una ejecución larga).
 */
export async function fetchPendingConversationBatch(
  supabase: SupabaseClient,
  batchLimit: number
): Promise<PendingConversationBatch> {
  const analyzed = await getAnalyzedConversationIds(supabase);

  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("id")
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`Error listando conversations: ${error.message}`);
  }

  const pending: number[] = [];
  for (const row of conversations ?? []) {
    const id = (row as { id: number }).id;
    if (!analyzed.has(id)) {
      pending.push(id);
    }
  }

  const cap =
    batchLimit === Infinity ||
    !Number.isFinite(batchLimit) ||
    batchLimit >= pending.length
      ? pending.length
      : Math.max(0, Math.floor(batchLimit));

  return {
    totalPending: pending.length,
    ids: pending.slice(0, cap),
  };
}

/**
 * @deprecated Usar `fetchPendingConversationBatch` si necesitás el total pendiente.
 */
export async function fetchPendingConversationIds(
  supabase: SupabaseClient,
  limit: number
): Promise<number[]> {
  const { ids } = await fetchPendingConversationBatch(supabase, limit);
  return ids;
}

/**
 * Mensajes de una conversación, orden cronológico ascendente.
 */
export async function fetchMessagesForConversation(
  supabase: SupabaseClient,
  conversationId: number
): Promise<MessageRow[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id, conversation_id, role, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(
      `Error leyendo mensajes para conversación ${conversationId}: ${error.message}`
    );
  }

  return (data ?? []) as MessageRow[];
}

export type InsertConversationAnalysisInput = {
  conversation_id: number;
  intent: string;
  resolved: boolean;
  issues: string[];
  summary: string;
};

/**
 * Inserta un registro de análisis. La tabla debe tener restricción UNIQUE(conversation_id) para idempotencia.
 */
export async function insertConversationAnalysis(
  supabase: SupabaseClient,
  row: InsertConversationAnalysisInput
): Promise<void> {
  const { error } = await supabase.from("conversation_analysis").insert({
    conversation_id: row.conversation_id,
    intent: row.intent,
    resolved: row.resolved,
    issues: row.issues,
    summary: row.summary,
  });

  if (error) {
    const err = new Error(
      `Error insertando conversation_analysis: ${error.message}`
    ) as Error & { code?: string };
    if ("code" in error && typeof (error as { code?: string }).code === "string") {
      err.code = (error as { code: string }).code;
    }
    throw err;
  }
}
