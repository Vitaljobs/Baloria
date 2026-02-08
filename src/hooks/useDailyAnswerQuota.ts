import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useBaloriaProject } from "./useBaloriaProject";

const MAX_ANSWERS_PER_DAY = 100;

export const useDailyAnswerQuota = () => {
  const { user } = useAuth();
  const projectId = useBaloriaProject();
  const [answersToday, setAnswersToday] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAnswersToday = useCallback(async () => {
    if (!user || !projectId) {
      setLoading(false);
      return;
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count, error } = await supabase
        .from("baloria_answers")
        .select("*", { count: "exact", head: true })
        .eq("author_id", user.id)
        .gte("created_at", today.toISOString());

      if (error) throw error;
      setAnswersToday(count || 0);
    } catch (err) {
      console.error("Error fetching daily answer quota:", err);
      setAnswersToday(0);
    } finally {
      setLoading(false);
    }
  }, [user, projectId]);

  useEffect(() => {
    fetchAnswersToday();
  }, [fetchAnswersToday]);

  const canAnswer = answersToday < MAX_ANSWERS_PER_DAY;
  const answersLeft = Math.max(0, MAX_ANSWERS_PER_DAY - answersToday);

  return {
    canAnswer,
    answersLeft,
    answersToday,
    maxAnswers: MAX_ANSWERS_PER_DAY,
    loading,
    refetch: fetchAnswersToday,
  };
};
