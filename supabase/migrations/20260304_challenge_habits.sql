-- Tabela de habitos por challenge (party)
CREATE TABLE public.challenge_habits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '💪',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.challenge_habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Challenge habits viewable by authenticated" ON public.challenge_habits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Challenge habits insertable by authenticated" ON public.challenge_habits FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Challenge habits deletable by creator" ON public.challenge_habits FOR DELETE TO authenticated USING (true);

-- Adicionar habit_name ao daily_logs para rastrear check-in por habito
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS habit_name TEXT;

-- Remover constraint antiga (se existir) e criar nova incluindo habit_name
ALTER TABLE public.daily_logs DROP CONSTRAINT IF EXISTS daily_logs_user_id_challenge_id_log_date_key;
ALTER TABLE public.daily_logs ADD CONSTRAINT daily_logs_unique_per_habit UNIQUE(user_id, challenge_id, log_date, habit_name);
