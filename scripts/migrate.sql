-- Multi-experiment + autosave migration. Idempotent: safe to run more than once.
-- Existing rows become completed submissions of the `kpop` experiment.

CREATE TABLE IF NOT EXISTS q_method_results (
  id SERIAL PRIMARY KEY,
  name TEXT,
  age TEXT,
  gender TEXT,
  kpop_preference TEXT,
  results JSONB,
  locale TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'q_method_results' AND column_name = 'kpop_preference'
  ) THEN
    ALTER TABLE q_method_results RENAME COLUMN kpop_preference TO preference;
  END IF;
END $$;

ALTER TABLE q_method_results ADD COLUMN IF NOT EXISTS experiment_id TEXT NOT NULL DEFAULT 'kpop';
ALTER TABLE q_method_results ALTER COLUMN experiment_id DROP DEFAULT;
ALTER TABLE q_method_results ADD COLUMN IF NOT EXISTS session_id UUID;
ALTER TABLE q_method_results ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed';
ALTER TABLE q_method_results ALTER COLUMN status SET DEFAULT 'in_progress';
ALTER TABLE q_method_results ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;
UPDATE q_method_results SET updated_at = created_at WHERE updated_at IS NULL;
ALTER TABLE q_method_results ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX IF NOT EXISTS q_method_results_session_id_key ON q_method_results (session_id);
CREATE INDEX IF NOT EXISTS q_method_results_experiment_created_idx
  ON q_method_results (experiment_id, created_at DESC);
