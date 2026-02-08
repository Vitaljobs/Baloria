import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useBaloriaProject } from "./useBaloriaProject";
import { useBadges } from "./useBadges";

interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string | null;
    loading: boolean;
}

export const useStreak = () => {
    const { user } = useAuth();
    const projectId = useBaloriaProject();
    const { checkBadges } = useBadges();
    const [streak, setStreak] = useState<StreakData>({
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        loading: true,
    });

    const fetchStreak = useCallback(async () => {
        if (!user || !projectId) {
            setStreak({ currentStreak: 0, longestStreak: 0, lastActiveDate: null, loading: false });
            return;
        }

        try {
            const { data, error } = await supabase
                .from("baloria_user_stats")
                .select("streak_days, last_active_date")
                .eq("user_id", user.id)
                .maybeSingle();

            if (error) throw error;

            if (data) {
                setStreak({
                    currentStreak: data.streak_days || 0,
                    longestStreak: data.streak_days || 0, // We'll track this separately later
                    lastActiveDate: data.last_active_date,
                    loading: false,
                });
            } else {
                setStreak({ currentStreak: 0, longestStreak: 0, lastActiveDate: null, loading: false });
            }
        } catch (err) {
            console.error("Error fetching streak:", err);
            setStreak({ currentStreak: 0, longestStreak: 0, lastActiveDate: null, loading: false });
        }
    }, [user, projectId]);

    const updateStreak = useCallback(async () => {
        if (!user || !projectId) return;

        try {
            const today = new Date().toISOString().split("T")[0];

            // Check if already updated today
            const { data: stats } = await supabase
                .from("baloria_user_stats")
                .select("last_active_date, streak_days")
                .eq("user_id", user.id)
                .maybeSingle();

            if (stats?.last_active_date === today) {
                return; // Already updated today
            }

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split("T")[0];

            let newStreak = 1;
            if (stats?.last_active_date === yesterdayStr) {
                // Continue streak
                newStreak = (stats.streak_days || 0) + 1;
            }

            // Update streak
            await supabase
                .from("baloria_user_stats")
                .upsert({
                    user_id: user.id,
                    last_active_date: today,
                    streak_days: newStreak,
                }, {
                    onConflict: "user_id",
                });

            fetchStreak();
            checkBadges('streak');
        } catch (err) {
            console.error("Error updating streak:", err);
        }
    }, [user, projectId, fetchStreak]);

    useEffect(() => {
        fetchStreak();
        updateStreak(); // Update on mount
    }, [fetchStreak, updateStreak]);

    return {
        ...streak,
        refetch: fetchStreak,
        updateStreak,
    };
};
