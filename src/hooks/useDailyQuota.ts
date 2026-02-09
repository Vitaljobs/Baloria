import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useUserRole } from "./useUserRole";

interface DailyQuota {
  questionsUsed: number;
  answersUsed: number;
  questionsMax: number;
  answersMax: number;
  questionsRemaining: number;
  answersRemaining: number;
}

export function useDailyQuota() {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [quota, setQuota] = useState<DailyQuota>({
    questionsUsed: 0,
    answersUsed: 0,
    questionsMax: 100,
    answersMax: 100,
    questionsRemaining: 100,
    answersRemaining: 100,
  });
  const [loading, setLoading] = useState(true);

  const fetchQuota = useCallback(async () => {
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Count today's questions
    const { count: qCount } = await supabase
      .from("baloria_questions")
      .select("*", { count: "exact", head: true })
      .eq("author_id", user.id)
      .gte("created_at", todayISO);

    // Count today's answers
    const { count: aCount } = await supabase
      .from("baloria_answers")
      .select("*", { count: "exact", head: true })
      .eq("author_id", user.id)
      .gte("created_at", todayISO);

    // Check for Perks (Badges)
    // We check if user has specific badges that grant extra quota
    const { data: userBadges } = await supabase
      .from("baloria_user_badges")
      .select("badge:baloria_badges!inner(name)")
      .eq("user_id", user.id);

    let bonusQuestions = 0;
    const badgeNames = userBadges?.map((b: any) => b.badge.name) || [];

    if (badgeNames.includes("Conversation Starter")) bonusQuestions += 2; // +2 questions
    if (badgeNames.includes("Guru")) bonusQuestions += 5; // +5 questions

    const questionsUsed = qCount || 0;
    const answersUsed = aCount || 0;

    // Admins get "unlimited" quota
    if (isAdmin) {
      setQuota({
        questionsUsed,
        answersUsed,
        questionsMax: 9999,
        answersMax: 9999,
        questionsRemaining: 9999,
        answersRemaining: 9999,
      });
      setLoading(false);
      return;
    }

    const baseQuota = 3; // Default daily limit
    const totalMax = baseQuota + bonusQuestions;

    setQuota({
      questionsUsed,
      answersUsed,
      questionsMax: totalMax,
      answersMax: 100, // Unlimited answers for now
      questionsRemaining: Math.max(0, totalMax - questionsUsed),
      answersRemaining: Math.max(0, 100 - answersUsed),
    });
    setLoading(false);
  }, [user, isAdmin]);

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  const canAskQuestion = quota.questionsRemaining > 0;
  const canAnswer = quota.answersRemaining > 0;

  return { quota, loading, canAskQuestion, canAnswer, refetch: fetchQuota };
}
