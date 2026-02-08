-- Add last_active_date column to track daily activity
ALTER TABLE baloria_user_stats 
ADD COLUMN IF NOT EXISTS last_active_date DATE;

-- Add longest_streak column to track personal best
ALTER TABLE baloria_user_stats 
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_baloria_user_stats_user_id ON baloria_user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_baloria_user_stats_last_active ON baloria_user_stats(last_active_date);

-- Update existing records to set longest_streak = streak_days
UPDATE baloria_user_stats 
SET longest_streak = GREATEST(COALESCE(longest_streak, 0), COALESCE(streak_days, 0))
WHERE longest_streak IS NULL OR longest_streak < streak_days;
