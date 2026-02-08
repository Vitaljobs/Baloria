import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useBaloriaProject } from "./useBaloriaProject";
import { toast } from "sonner";

export interface CreateChallengeParams {
    challenge_type: string;
    description: string;
    target_value: number;
    karma_reward: number;
    category?: string;
    active_date: string;
}

export interface UserChallenge {
    id: string; // user_challenge_id
    challenge_id: string;
    description: string;
    target_value: number;
    progress: number;
    completed: boolean;
    karma_reward: number;
    challenge_type: string;
    category?: string;
}

export const useDailyChallenges = () => {
    const { user } = useAuth();
    const projectId = useBaloriaProject();
    const [challenges, setChallenges] = useState<UserChallenge[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchChallenges = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const today = new Date().toISOString().split("T")[0];

            // 1. Fetch active daily challenges
            // @ts-ignore - Tables not yet in types
            const { data: dailyData, error: dailyError } = await supabase
                .from("baloria_daily_challenges")
                .select("*")
                .eq("active_date", today);

            if (dailyError) throw dailyError;

            if (!dailyData || dailyData.length === 0) {
                setChallenges([]);
                return;
            }

            // 2. Fetch user progress for these challenges
            // @ts-ignore - Tables not yet in types
            const { data: userData, error: userError } = await supabase
                .from("baloria_user_challenges")
                .select("*")
                .eq("user_id", user.id)
                .in("challenge_id", dailyData.map((c: any) => c.id));

            if (userError) throw userError;

            // 3. Merge data
            const merged: UserChallenge[] = dailyData.map((challenge: any) => {
                const userRecord = userData?.find((u: any) => u.challenge_id === challenge.id);
                return {
                    id: userRecord?.id || "temp-id",
                    challenge_id: challenge.id,
                    description: challenge.description,
                    target_value: challenge.target_value,
                    progress: userRecord?.progress || 0,
                    completed: userRecord?.completed || false,
                    karma_reward: challenge.karma_reward || 50,
                    challenge_type: challenge.challenge_type,
                    category: challenge.category,
                };
            });

            setChallenges(merged);

        } catch (err) {
            console.error("Error fetching daily challenges:", err);
        } finally {
            setLoading(false);
        }
    }, [user, projectId]);

    const checkAction = useCallback(async (actionType: string) => {
        if (!user || challenges.length === 0) return;

        const relevantChallenges = challenges.filter(c =>
            !c.completed && c.challenge_type === actionType
        );

        if (relevantChallenges.length === 0) return;

        for (const challenge of relevantChallenges) {
            const newProgress = challenge.progress + 1;
            const completed = newProgress >= challenge.target_value;

            try {
                // Check if record exists
                // @ts-ignore
                const { data: existing } = await supabase
                    .from("baloria_user_challenges")
                    .select("id")
                    .eq("user_id", user.id)
                    .eq("challenge_id", challenge.challenge_id)
                    .maybeSingle();

                if (existing) {
                    // Update
                    // @ts-ignore
                    await supabase
                        .from("baloria_user_challenges")
                        .update({
                            progress: newProgress,
                            completed: completed,
                            completed_at: completed ? new Date().toISOString() : null
                        })
                        .eq("id", existing.id);
                } else {
                    // Insert
                    // @ts-ignore
                    await supabase
                        .from("baloria_user_challenges")
                        .insert({
                            user_id: user.id,
                            challenge_id: challenge.challenge_id,
                            progress: newProgress,
                            completed: completed,
                            completed_at: completed ? new Date().toISOString() : null
                        });
                }

                if (completed) {
                    toast.success(`Challenge voltooid: ${challenge.description}! (+${challenge.karma_reward} Karma)`);
                    // Here we would also add karma to the user_stats table
                }

            } catch (err) {
                console.error("Error updating challenge progress:", err);
            }
        }

        // Refresh UI
        fetchChallenges();
    }, [user, challenges, fetchChallenges]);

    // Initialize challenges if missing (Demo Helper)
    const initDailyChallenges = useCallback(async () => {
        const today = new Date().toISOString().split("T")[0];
        // @ts-ignore
        const { data } = await supabase.from("baloria_daily_challenges").select("id").eq("active_date", today);

        if (!data || data.length === 0) {
            const newChallenges = [
                { challenge_type: 'ask_question', description: 'Stel vandaag 1 vraag', target_value: 1, karma_reward: 50, active_date: today },
                { challenge_type: 'give_hearts', description: 'Geef 3 hearts aan anderen', target_value: 3, karma_reward: 30, active_date: today },
                { challenge_type: 'check_in', description: 'Check de Ballebak', target_value: 1, karma_reward: 20, active_date: today }
            ];

            // @ts-ignore
            await supabase.from("baloria_daily_challenges").insert(newChallenges);
            fetchChallenges();
        }
    }, [fetchChallenges]);

    useEffect(() => {
        fetchChallenges();
        initDailyChallenges();
    }, [fetchChallenges, initDailyChallenges]);

    return { challenges, loading, checkAction, refetch: fetchChallenges };
};
