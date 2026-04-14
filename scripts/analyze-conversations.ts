/**
 * Analiza conversaciones en Supabase con OpenAI y guarda resultados en `conversation_analysis`.
 *
 * Ejecución:
 *   npx tsx scripts/analyze-conversations.ts
 *
 * Requiere en .env / .env.local:
 *   OPENAI_API_KEY
 *   NEXT_PUBLIC_SUPABASE_URL o SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Opcional:
 *   OPENAI_ANALYSIS_MODEL (default: gpt-4o-mini)
 *   ANALYSIS_BATCH_SIZE — sin definir (o "all"/"max"): procesa TODAS las conversaciones pendientes.
 *     Poné un número (ej. 10) solo si querés limitar el lote en una corrida.
 */

import { config } from "dotenv";
import { resolve } from "path";
import OpenAI from "openai";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

/** Por defecto: todas las pendientes. Solo se limita si ANALYSIS_BATCH_SIZE es un entero > 0. */
function parseBatchLimit(): number {
  const raw = process.env.ANALYSIS_BATCH_SIZE?.trim().toLowerCase();
  if (!raw || raw === "all" || raw === "max") {
    return Number.POSITIVE_INFINITY;
  }
  const n = Number(process.env.ANALYSIS_BATCH_SIZE);
  if (Number.isFinite(n) && n > 0) {
    return n;
  }
  return Number.POSITIVE_INFINITY;
}

async function main(): Promise<void> {
  const [
    { supabase },
    {
      MAX_CONVERSATION_TEXT_CHARS,
      analyzeConversationWithOpenAI,
      fetchMessagesForConversation,
      fetchPendingConversationBatch,
      formatMessagesToDialog,
      insertConversationAnalysis,
      isConversationAnalyzed,
      truncateForModel,
    },
  ] = await Promise.all([
    import("../lib/supabase"),
    import("../lib/analysis"),
  ]);

  const batchLimit = parseBatchLimit();

  if (!process.env.OPENAI_API_KEY) {
    console.error("[analyze] Falta OPENAI_API_KEY en el entorno.");
    process.exit(1);
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const batchLabel =
    batchLimit === Number.POSITIVE_INFINITY
      ? "todas las pendientes"
      : String(batchLimit);
  const batchEnvNote =
    process.env.ANALYSIS_BATCH_SIZE?.trim() || "todas (sin límite)";
  console.log(
    `[analyze] Inicio — hasta ${batchLabel} conversación(es) en ESTA ejecución (ANALYSIS_BATCH_SIZE=${batchEnvNote})`
  );

  let totalPending: number;
  let pending: number[];
  try {
    const batch = await fetchPendingConversationBatch(supabase, batchLimit);
    totalPending = batch.totalPending;
    pending = batch.ids;
  } catch (e) {
    console.error("[analyze] Error obteniendo conversaciones pendientes:", e);
    process.exit(1);
  }

  if (totalPending === 0) {
    console.log("[analyze] No hay conversaciones pendientes de analizar.");
    return;
  }

  const willProcess = pending.length;
  const remainingAfterThis = totalPending - willProcess;
  console.log(
    `[analyze] En la base hay ${totalPending} conversación(es) sin analizar (sin fila en conversation_analysis).`
  );
  if (
    batchLimit !== Number.POSITIVE_INFINITY &&
    totalPending > willProcess
  ) {
    console.log(
      `[analyze] Esta ejecución solo procesará ${willProcess} (lote). Quedarán ~${remainingAfterThis} para la(s) próxima(s) ejecución(es), o quitá ANALYSIS_BATCH_SIZE del .env para procesar todas.`
    );
  }
  const idsLine =
    willProcess <= 40
      ? pending.join(", ")
      : `${pending.slice(0, 20).join(", ")} … [+${willProcess - 20} ids más, rango aprox. ${pending[0]}–${pending[pending.length - 1]}]`;
  console.log(`[analyze] Lote actual (${willProcess} id(s)): ${idsLine}`);

  let successCount = 0;

  for (const conversationId of pending) {
    if (await isConversationAnalyzed(supabase, conversationId)) {
      console.log(
        `[analyze] Saltando conversación ya analizada (${conversationId})`
      );
      continue;
    }

    console.log(`[analyze] Procesando conversación ${conversationId}`);

    try {
      const messages = await fetchMessagesForConversation(
        supabase,
        conversationId
      );

      if (messages.length === 0) {
        console.log(
          `[analyze] Saltando conversación ${conversationId} (sin mensajes)`
        );
        continue;
      }

      let dialog = formatMessagesToDialog(messages);
      dialog = truncateForModel(dialog, MAX_CONVERSATION_TEXT_CHARS);

      const result = await analyzeConversationWithOpenAI(openai, dialog);

      try {
        await insertConversationAnalysis(supabase, {
          conversation_id: conversationId,
          intent: result.intent,
          resolved: result.resolved,
          issues: result.issues,
          summary: result.summary,
        });
      } catch (insertErr) {
        const code =
          insertErr &&
          typeof insertErr === "object" &&
          "code" in insertErr
            ? String((insertErr as { code: unknown }).code)
            : "";
        if (code === "23505") {
          console.log(
            `[analyze] Saltando conversación ya analizada (${conversationId}) — insert duplicado`
          );
          continue;
        }
        throw insertErr;
      }

      successCount += 1;
      console.log(
        `[analyze] ✓ Conversación ${conversationId} — intent=${result.intent} resolved=${result.resolved}`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[analyze] Error en conversación ${conversationId}:`, msg);
      continue;
    }
  }

  const approxLeft = Math.max(0, totalPending - successCount);
  console.log(
    `[analyze] Finalizado. Insertadas OK en este lote: ${successCount}. Pendientes aproximadas aún: ${approxLeft} (re-ejecutá el script hasta que "sin analizar" sea 0).`
  );
}

main().catch((e) => {
  console.error("[analyze] Error fatal:", e);
  process.exit(1);
});
