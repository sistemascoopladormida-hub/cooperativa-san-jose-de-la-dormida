-- Tabla de resultados del análisis automático de conversaciones (script: scripts/analyze-conversations.ts)
--
-- Nota: en este proyecto `conversations.id` es un entero (serial/bigint), no UUID.
-- Por eso `conversation_id` referencia BIGINT en lugar de UUID.

CREATE TABLE IF NOT EXISTS conversation_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id BIGINT NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
  intent TEXT NOT NULL,
  resolved BOOLEAN NOT NULL,
  issues TEXT[] NOT NULL DEFAULT '{}',
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT conversation_analysis_conversation_id_key UNIQUE (conversation_id)
);

CREATE INDEX IF NOT EXISTS idx_conversation_analysis_created_at
  ON conversation_analysis (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversation_analysis_intent
  ON conversation_analysis (intent);
