-- Turn the free "Ask Celeste" allowance from a lifetime cap into a rolling
-- weekly one. Instead of 3 questions ever, a non-Cosmic account gets 3 free
-- questions per 7-day window, so free users have a reason to keep coming back
-- to the app's marquee feature.
--
-- We track when the current window opened. The advisor edge function treats the
-- counter as 0 once NOW() is past period_start + 7 days, and stamps a fresh
-- period_start on the first question of a new window. Still service-role only:
-- clients can read (to show remaining questions) but never write.

ALTER TABLE public.advisor_usage
  ADD COLUMN IF NOT EXISTS free_questions_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Give existing users a clean window starting now so nobody is stuck at their
-- old lifetime total after the switch.
UPDATE public.advisor_usage
  SET free_questions_period_start = NOW();
