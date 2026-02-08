import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface UserStats {
  points: number;
  level: number;
  streak_days: number;
  questions_count: number;
  answers_count: number;
  hearts_received: number;
}

const LEVEL_THRESHOLDS = [0, 50, 150, 300, 500, 800, 1200, 1800, 2500, 3500, 5000];

export function useKarma() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("baloria_user_stats")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setStats({
        points: data.points,
        level: data.level,
        streak_days: data.streak_days,
        questions_count: data.questions_count,
        answers_count: data.answers_count,
        hearts_received: data.hearts_received,
      });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const getLevelName = (level: number): string => {
    const names = ["Nieuweling", "Ontdekker", "Luisteraar", "Helper", "Gids", "Mentor", "Expert", "Meester", "Legende", "Orakel", "Onsterfelijk"];
    return names[Math.min(level, names.length - 1)];
  };

  const getProgressToNextLevel = (): number => {
    if (!stats) return 0;
    const currentThreshold = LEVEL_THRESHOLDS[stats.level] || 0;
    const nextThreshold = LEVEL_THRESHOLDS[stats.level + 1] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const progress = ((stats.points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const getPointsToNextLevel = (): number => {
    if (!stats) return 0;
    const nextThreshold = LEVEL_THRESHOLDS[stats.level + 1] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    return Math.max(0, nextThreshold - stats.points);
  };

  return {
    stats,
    loading,
    getLevelName,
    getProgressToNextLevel,
    getPointsToNextLevel,
    refetch: fetchStats,
  };
}
